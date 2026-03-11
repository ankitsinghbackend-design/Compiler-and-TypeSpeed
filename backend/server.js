import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
import { configureLogging } from "./utils/logging.js";
import {
  metricsMiddleware,
  register,
  activeUsers,
} from "./middleware/metricsMiddleware.js";
import { initializeCleanup, startScheduledCleanup } from "./utils/scheduler.js";

import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Message from "./models/Message.js";

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize temp directory cleanup
initializeCleanup();
startScheduledCleanup();

// Configure logging early in the application lifecycle
configureLogging(app);
app.use(metricsMiddleware);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://labbuddy.onrender.com",
            "https://labbuddy-frontend.onrender.com",
            "https://labbuddy.vercel.app",
            // Add your actual Vercel URL here
            process.env.FRONTEND_URL,
            // Allow monitoring services
            process.env.MONITORING_ORIGIN,
          ].filter(Boolean) // Remove undefined values
        : "http://localhost:5173",
    credentials: true,
  }),
);

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.semester || !user.branch) {
      return next(
        new Error("Authentication error: User data incomplete or not found"),
      );
    }
    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket Authentication Error:", err.message);
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Track active WebSocket connections
let activeConnections = 0;

io.on("connection", (socket) => {
  activeConnections++;
  activeUsers.set(activeConnections);

  const user = socket.user;
  console.log(
    `User connected: ${user.name} (${socket.id}) - Total connections: ${activeConnections}`,
  );
  const room = `sem_branch_${user.semester}_${user.branch}`;
  socket.join(room);
  console.log(`${user.name} joined room: ${room}`);
  socket.emit("joinedRoom", room);

  socket.on("sendMessage", async ({ content }) => {
    if (!content || !content.trim()) return;
    try {
      const message = new Message({
        sender: user._id,
        content: content.trim(),
        room: room,
      });
      await message.save();

      io.to(room).emit("newMessage", {
        _id: message._id,
        sender: { _id: user._id, name: user.name },
        content: message.content,
        room: message.room,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Error saving/broadcasting message:", error);
      socket.emit("messageError", "Failed to send message.");
    }
  });

  // Handle sending code snippets/QAs to chat
  socket.on("sendCodeToChat", async ({ type, data }) => {
    try {
      let content = '';
      
      if (type === 'snippet') {
        content = `🔧 **Code Snippet: ${data.name}**\n\n**Language:** \`${data.language}\`\n\n\`\`\`${data.language}\n${data.code}\n\`\`\`\n\n*📤 Shared by ${user.name}*`;
      } else if (type === 'qa') {
        content = `📝 **Q&A: ${data.question}**\n\n**Language:** \`${data.language}\`\n\n\`\`\`${data.language}\n${data.code}\n\`\`\`\n\n*📤 Shared by ${user.name}*`;
      } else {
        return socket.emit("messageError", "Invalid content type.");
      }

      const message = new Message({
        sender: user._id,
        content: content,
        room: room,
      });
      await message.save();

      io.to(room).emit("newMessage", {
        _id: message._id,
        sender: { _id: user._id, name: user.name },
        content: message.content,
        room: message.room,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Error sending code to chat:", error);
      socket.emit("messageError", "Failed to send code to chat.");
    }
  });

  socket.on("disconnect", () => {
    activeConnections--;
    activeUsers.set(activeConnections);
    console.log(
      `User disconnected: ${user.name} (${socket.id}) - Total connections: ${activeConnections}`,
    );
  });
});

// Routes
import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

import notebookRoutes from "./routes/notebookRoutes.js";
app.use("/api/notebooks", notebookRoutes);

import geminiRoutes from "./routes/geminiRoutes.js";
app.use("/api/gemini/", geminiRoutes);

import qaRoutes from "./routes/qaRoutes.js";
app.use("/api/qa", qaRoutes);

import snippetRoutes from "./routes/snippetRoutes.js";
app.use("/api/snippets", snippetRoutes);

import suggestionRoutes from "./routes/suggestionRoutes.js";
app.use("/api/suggestions", suggestionRoutes);

import codeRunnerRoutes from "./routes/codeRunnerRoutes.js";
app.use("/api/code", codeRunnerRoutes);

import chatRoutes from "./routes/chatRoutes.js";
app.use("/api/chat", chatRoutes);

import aiRoutes from "./routes/ai.js";
app.use("/api/ai", aiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "LabBuddy Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health or /api/health",
      metrics: "/metrics",
      auth: "/api/auth",
      notebooks: "/api/notebooks",
      gemini: "/api/gemini",
      qa: "/api/qa",
      snippets: "/api/snippets",
      suggestions: "/api/suggestions",
      code: "/api/code",
      chat: "/api/chat",
    },
  });
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
});

// Health check endpoint for monitoring (both paths for compatibility)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
