import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import compilerRoutes from "./routes/compilerRoutes.js";
import typingRoutes from "./routes/typingRoutes.js";

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Routes
app.use("/api/code", compilerRoutes);
app.use("/api/typing", typingRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "LabBuddy Compiler & Typing API",
    version: "2.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      code: "/api/code",
      typing: "/api/typing",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
