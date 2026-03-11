import mongoose from "mongoose";

const compilerRunSchema = new mongoose.Schema(
    {
        location: String,
        language: String,
        input: String,
        result: String,
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model("CompilerRun", compilerRunSchema);
