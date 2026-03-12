import express from "express";
import { saveTypingLog, getTypingLogs } from "../controllers/typingController.js";

const router = express.Router();

// POST /api/typing/log
router.post("/log", saveTypingLog);

// GET /api/typing/logs
router.get("/logs", getTypingLogs);

export default router;
