import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createQA, deleteQA, updateQA } from "../controllers/qaController.js";

const router = express.Router();

router.post("/createQA", protect, createQA);
router.put("/update", protect, updateQA);
router.post("/delete", protect, deleteQA);

export default router;
