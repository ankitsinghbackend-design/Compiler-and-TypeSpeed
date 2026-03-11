import express from "express";
import {
  signup,
  login,
  logout,
  verifyToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
//routes
router.get("/profile", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});
router.get("/verify", protect, verifyToken);

export default router;
