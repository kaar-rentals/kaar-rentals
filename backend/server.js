// backend/server.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config();
const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080", 
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
  "https://www.kaar.rentals",
  "https://kaar.rentals",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// CORS is already configured above, no need for explicit options handler
app.use(express.json());
app.use(morgan("dev"));

// Optional auth middleware to attach req.user if JWT present
const authMiddleware = require("./middleware/auth");
app.use(authMiddleware);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cars", require("./routes/cars"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/seed", require("./routes/seed"));

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

// Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Connected to MongoDB database: ${process.env.MONGO_DBNAME || 'kaarDB'}`);
});
