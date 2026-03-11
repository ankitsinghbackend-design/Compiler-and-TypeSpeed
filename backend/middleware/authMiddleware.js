import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("User not found with ID:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      return res.status(401).json({
        message: "Not authorized, token verification failed",
        error: jwtError.message,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(401)
      .json({ message: "Not authorized, token failed", error: error.message });
  }
};

export { protect };
