import mongoose from "mongoose";

const typingResultSchema = new mongoose.Schema({
    userId: { type: String },
    wpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TypingResult", typingResultSchema);
