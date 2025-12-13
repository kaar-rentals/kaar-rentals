const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "..", "tmp_uploads") });

const CLOUDINARY_CONFIGURED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const filePath = req.file.path;

  // If Cloudinary creds are present, try Cloudinary first
  if (CLOUDINARY_CONFIGURED) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "kaar_rentals",
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });
      // remove temp file
      fs.unlink(filePath, (err) => { if (err) console.warn("temp unlink failed:", err); });
      return res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      // fall through to local storage fallback
    }
  }

  // Fallback: save to local uploads and return a local URL
  try {
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(req.file.originalname) || path.extname(filePath) || ".jpg";
    const safeBase = path.basename(req.file.originalname || "upload", ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const finalName = `${Date.now()}_${safeBase}${ext}`;
    const finalPath = path.join(uploadsDir, finalName);

    fs.renameSync(filePath, finalPath);
    const publicUrl = `/uploads/${finalName}`;
    return res.json({ url: publicUrl });
  } catch (fallbackErr) {
    console.error("Local upload fallback error:", fallbackErr);
    // attempt cleanup temp file
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    return res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
