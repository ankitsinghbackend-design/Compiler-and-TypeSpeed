import TypingResult from "../models/TypingResult.js";

const saveTypingResult = async (req, res) => {
    const { wpm, accuracy, userId } = req.body;

    if (wpm === undefined || accuracy === undefined) {
        return res.status(400).json({ success: false, message: "WPM and accuracy are required" });
    }

    try {
        const result = new TypingResult({ wpm, accuracy, userId });
        await result.save();
        return res.status(201).json({ success: true, result });
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
