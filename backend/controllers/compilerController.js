import executeCode from "../utils/executeCode.js";
import { getPool } from "../db/pool.js";
import getLocationFromIP from "../utils/getLocationFromIP.js";

async function saveCompilerRun({ locationString, language, code, output }) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO compiler_runs (location, language, input, result)
     VALUES ($1, $2, $3, $4)`,
    [locationString, language, code, output],
  );
}

const runCode = async (req, res) => {
  const { language, code, input } = req.body;

  if (!language || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Language and code are required" });
  }

  try {
    const output = await executeCode(language, code, input || "");

    const locationData = await getLocationFromIP(req);
    let locationString = "Unknown Location";

    if (typeof locationData === "object" && locationData !== null) {
      locationString = `${locationData.city}, ${locationData.country}`;
    } else if (typeof locationData === "string") {
      locationString = locationData;
    }

    await saveCompilerRun({
      locationString,
      language,
      code,
      output,
    });

    console.log(`Code executed from: ${locationString}`);

    return res.status(200).json({ success: true, output });
  } catch (error) {
    console.error("Error while executing code:", error);

    let locationString = "Unknown Location";
    try {
      const locationData = await getLocationFromIP(req);
      if (typeof locationData === "object" && locationData !== null) {
        locationString = `${locationData.city}, ${locationData.country}`;
      } else if (typeof locationData === "string") {
        locationString = locationData;
      }
    } catch {
      // Ignore error finding location
    }

    try {
      await saveCompilerRun({
        locationString,
        language,
        code,
        output: error?.message || "Execution error",
      });
    } catch (e) {
      console.error("Could not save error run", e);
    }

    return res.status(500).json({
      success: false,
      message: error?.message || error || "Error executing code",
      error: error?.message || error,
    });
  }
};

export { runCode };
