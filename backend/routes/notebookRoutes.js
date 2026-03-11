import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createNotebook,
  getNotebooks,
} from "../controllers/notebookController.js";
import { deleteNotebook } from "../controllers/notebookController.js";

const router = express.Router();

router.post("/create", protect, createNotebook); // Protected route to create notebook
router.get("/", protect, getNotebooks); // Protected route to fetch all notebooks
router.post("/delete", protect, deleteNotebook);

export default router;
