import express from "express";
import {
  giveComplexity,
  giveSuggestion,
  giveTestCases,
  generateNotebookSummaryAPI,
} from "../controllers/geminiController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/suggestions", protect, giveSuggestion);
router.post("/complexity", protect, giveComplexity);
router.post("/testcases", protect, giveTestCases);
router.post("/notebook-summary", protect, generateNotebookSummaryAPI);

export default router;
