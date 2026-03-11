import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createSnippet,
  getSnippets,
  deleteSnippet,
  updateSnippet,
  getTemplates,
} from "../controllers/snippetController.js";

const router = express.Router();

router.post("/create", protect, createSnippet); // Protected route to create snippet
router.get("/", protect, getSnippets); // Protected route to fetch all snippets
router.post("/delete", protect, deleteSnippet);
router.put("/update", protect, updateSnippet); // Protected route to update snippet
router.get("/templates", getTemplates); // Route to get code templates (no auth required)

export default router;
