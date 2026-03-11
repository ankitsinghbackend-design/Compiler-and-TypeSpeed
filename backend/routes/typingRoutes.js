import express from "express";
import { saveTypingResult, getTypingResults } from "../controllers/typingController.js";

const router = express.Router();

router.post("/result", saveTypingResult);
router.get("/results", getTypingResults);

export default router;
