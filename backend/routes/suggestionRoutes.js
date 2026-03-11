import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createSuggestion,
  getSuggestions,
  deleteSuggestion,
} from "../controllers/suggestionController.js";

const router = express.Router();

router.post("/create", protect, createSuggestion); // Protected route to create notebook
router.get("/", protect, getSuggestions); // Protected route to fetch all notebooks
router.post("/delete", protect, deleteSuggestion);

export default router;
