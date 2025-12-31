// backend/server.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// CORS
const allowedOrigins = [
  "https://www.kaar.rentals",
  "https://kaar-rentals.vercel.app",
  // Local/dev origins
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:8082",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, SSR)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Enable preflight across-the-board (Express 5 safe)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.sendStatus(204);
  }
  return next();
});
app.use(morgan("dev"));

// Optional auth middleware to attach req.user if JWT present
const authMiddleware = require("./middleware/auth");
app.use(authMiddleware);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/cars", require("./routes/cars"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));
app.use("/api/seed", require("./routes/seed"));
app.use("/api/stats", require("./routes/stats"));

// Cloudinary upload route
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, env: process.env.SAFE_ENV || "sandbox" })
);

// Root
app.get("/", (_req, res) => res.send("🚀 Kaar.rentals Backend API is running"));

// Connect to MongoDB
connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/kaarDB");

// Create HTTP server for Socket.IO
const http = require('http');
const { Server } = require('socket.io');
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Set up socket utility
const { setIO } = require('./utils/socket');
setIO(io);

// Start
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Connected to MongoDB database: ${process.env.MONGO_DBNAME || 'kaarDB'}`);
  console.log(`🔌 Socket.IO server initialized`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});
