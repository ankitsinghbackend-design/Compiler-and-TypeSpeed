import mongoose from "mongoose";

const typingLogSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            required: true
        },
        wpm: {
            type: Number,
            required: true
        },
        spm: {
            type: Number,
            default: 0
        },
        accuracy: {
            type: Number,
            default: 0
        },
        time: {
            type: Number,
            default: 0
        }
    },
    { 
        timestamps: true,
        collection: 'typing_logs'
    }
);

export default mongoose.model("TypingLog", typingLogSchema);
