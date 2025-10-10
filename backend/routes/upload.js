const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "..", "tmp_uploads") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  try {
    const filePath = req.file.path;
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
    // attempt cleanup
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const bucket = require("../firebase.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload Car Image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const blob = bucket.file(Date.now() + "-" + req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype
    });

    blobStream.on("error", (err) => {
      res.status(500).json({ error: err.message });
    });

    blobStream.on("finish", async () => {
      // Make file public
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).json({ imageUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
