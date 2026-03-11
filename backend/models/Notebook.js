import mongoose from "mongoose";

const notebookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure each notebook is tied to a user
    },
    name: {
      type: String,
      required: true,
    },
    qa: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QA", // Will reference the QuestionAnswer schema
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Notebook", notebookSchema);
