import TypingLog from "../models/TypingLog.js";
import getLocationFromIP from "../utils/getLocationFromIP.js";

const saveTypingLog = async (req, res) => {
    const { wpm, spm, accuracy, time } = req.body;

    if (wpm === undefined || wpm === null) {
        return res.status(400).json({ success: false, message: "WPM is required" });
    }

    try {
        let locationString = "Unknown Location";
        try {
            const locationData = await getLocationFromIP(req);
            if (typeof locationData === 'object' && locationData !== null) {
                locationString = `${locationData.city}, ${locationData.country}`;
            } else if (typeof locationData === 'string') {
                locationString = locationData;
            }
        } catch (locErr) { 
            // fallback gracefully
        }

        const logRecord = new TypingLog({
            location: locationString,
            wpm: wpm || 0,
            spm: spm || 0,
            accuracy: accuracy || 0,
            time: time || 0
        });
        await logRecord.save();
        
        console.log(`TypingLog saved: ${locationString} | WPM: ${wpm} | SPM: ${spm} | Accuracy: ${accuracy}% | Time: ${time}s`);
        return res.status(201).json({ success: true, result: logRecord });
    } catch (error) {
        console.error("Error saving typing log:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getTypingLogs = async (req, res) => {
    try {
        const results = await TypingLog.find().sort({ createdAt: -1 }).limit(10);
        return res.status(200).json({ success: true, results });
    } catch (error) {
        console.error("Error fetching typing logs:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { saveTypingLog, getTypingLogs };
