import mongoose from "mongoose";

const typingResultSchema = new mongoose.Schema(
    {
        location: String,
        input: String,
        result: {
            wpm: Number,
            accuracy: Number,
            time: Number,
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model("TypingResult", typingResultSchema);
