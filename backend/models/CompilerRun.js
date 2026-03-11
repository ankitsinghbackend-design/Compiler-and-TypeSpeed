import mongoose from "mongoose";

const compilerRunSchema = new mongoose.Schema({
    language: { type: String, required: true },
    code: { type: String, required: true },
    input: { type: String },
    output: { type: String },
    error: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CompilerRun", compilerRunSchema);
