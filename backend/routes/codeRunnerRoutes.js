import express from "express";
import { runCode } from "../controllers/codeRunnerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/code/run
router.post("/run", protect, runCode);

export default router;
