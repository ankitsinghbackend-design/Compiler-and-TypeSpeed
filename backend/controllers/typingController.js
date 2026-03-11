import TypingResult from "../models/TypingResult.js";
import getLocationFromIP from "../utils/getLocationFromIP.js";

const saveTypingResult = async (req, res) => {
    const { input, wpm, accuracy, time } = req.body;

    if (wpm === undefined || accuracy === undefined || time === undefined) {
        return res.status(400).json({ success: false, message: "WPM, accuracy, and time are required" });
    }

    try {
        let locationString = "Unknown Location";
        try {
            const locationData = await getLocationFromIP(req);
            if (typeof locationData === 'object' && locationData !== null) {
                locationString = `${locationData.city}, ${locationData.region}, ${locationData.country}`;
            } else if (typeof locationData === 'string') {
                locationString = locationData;
            }
        } catch (locErr) { }

        const resultRecord = new TypingResult({
            location: locationString,
            input: input || "",
            result: { wpm, accuracy, time }
        });
        await resultRecord.save();
        return res.status(201).json({ success: true, result: resultRecord });
    } catch (error) {
        console.error("Error saving typing result:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getTypingResults = async (req, res) => {
    try {
        const results = await TypingResult.find().sort({ createdAt: -1 }).limit(10);
        return res.status(200).json({ success: true, results });
    } catch (error) {
        console.error("Error fetching typing results:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { saveTypingResult, getTypingResults };
