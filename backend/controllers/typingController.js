import { getPool } from "../db/pool.js";
import getLocationFromIP from "../utils/getLocationFromIP.js";

function mapTypingLogRow(row) {
  return {
    _id: row.id,
    location: row.location,
    wpm: Number(row.wpm),
    spm: Number(row.spm),
    accuracy: Number(row.accuracy),
    time: Number(row.time),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const MAX_TYPING_INPUT_CHARS = 100_000;

const saveTypingLog = async (req, res) => {
  const { wpm, spm, accuracy, time, input } = req.body;

  let inputText =
    typeof input === "string" ? input.slice(0, MAX_TYPING_INPUT_CHARS) : null;
  if (inputText !== null && inputText.trim() === "") {
    inputText = null;
  }

  if (wpm === undefined || wpm === null) {
    return res.status(400).json({ success: false, message: "WPM is required" });
  }

  try {
    let locationString = "Unknown Location";
    try {
      const locationData = await getLocationFromIP(req);
      if (typeof locationData === "object" && locationData !== null) {
        locationString = `${locationData.city}, ${locationData.country}`;
      } else if (typeof locationData === "string") {
        locationString = locationData;
      }
    } catch {
      // fallback gracefully
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO typing_logs (location, wpm, spm, accuracy, "time")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, location, wpm, spm, accuracy, "time",
                   created_at AS "createdAt", updated_at AS "updatedAt"`,
        [locationString, wpm || 0, spm || 0, accuracy || 0, time || 0],
      );
      await client.query(
        `INSERT INTO typing_results (location, input, result_wpm, result_accuracy, result_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [locationString, inputText, wpm || 0, accuracy || 0, time || 0],
      );
      await client.query("COMMIT");
      const logRecord = mapTypingLogRow(rows[0]);

      console.log(
        `TypingLog + typing_results saved: ${locationString} | WPM: ${wpm} | SPM: ${spm} | Accuracy: ${accuracy}% | Time: ${time}s`,
      );
      return res.status(201).json({ success: true, result: logRecord });
    } catch (txErr) {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* connection may already be aborted */
      }
      throw txErr;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error saving typing log:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getTypingLogs = async (req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, location, wpm, spm, accuracy, "time",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM typing_logs
       ORDER BY created_at DESC
       LIMIT 10`,
    );
    const results = rows.map(mapTypingLogRow);
    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error fetching typing logs:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { saveTypingLog, getTypingLogs };
