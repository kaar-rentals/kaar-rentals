// backend/server.js
const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// HTTP CORS
const cors = require('cors');

const corsEnv =
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_ORIGIN;

const allowedOrigins = corsEnv
  ? corsEnv.split(',')
  : ['http://localhost:3000', 'https://kaar.rentals', 'https://www.kaar.rentals'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
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
const carRoutes = require("./routes/cars");
app.use("/api/cars", carRoutes);
app.use("/api/listings", carRoutes);
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));
app.use("/api/seed", require("./routes/seed"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/site-settings", require("./routes/siteSettings"));

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

// Socket.IO init with CORS
const io = new Server(httpServer, {
  path: '/socket.io',
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Make io available to routes
app.set('io', io);

// Set up socket utility
const { setIO } = require('./utils/socket');
setIO(io);

// Start
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📊 Connected to MongoDB database: ${process.env.MONGO_DBNAME || 'kaarDB'}`);
  console.log(`🔌 Socket.IO server initialized`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});
