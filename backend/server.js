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
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
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
