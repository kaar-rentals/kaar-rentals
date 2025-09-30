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
