import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema(
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
    code: {
      type: String,
      required: true, // Will reference the QuestionAnswer schema
    },
  },
  { timestamps: true },
);

export default mongoose.model("Snippet", snippetSchema);
