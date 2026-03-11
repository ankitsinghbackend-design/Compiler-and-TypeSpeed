import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT ->jasldkjsalkdjsa
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup
export const signup = async (req, res) => {
  const { name, email, password, confirmPassword, semester, branch } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    !semester ||
    !branch
  ) {
    return res.status(400).json({
      message: "Please enter all the fields",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({ name, email, password, semester, branch });
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/", // Important for cross-tab cookie access
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password or user doesnt exist" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password or user doesnt exist" });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/", // Important for cross-tab cookie access
    });

    res.status(200).json({
      message: "successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        semester: user.semester,
        branch: user.branch,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Verify Token
export const verifyToken = async (req, res) => {
  try {
    // The user is already authenticated by the authMiddleware if this route is reached
    res.status(200).json({
      valid: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
};
