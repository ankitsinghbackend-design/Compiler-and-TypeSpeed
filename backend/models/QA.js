import mongoose from "mongoose";

const qaSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("QA", qaSchema);
