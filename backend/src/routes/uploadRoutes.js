const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { authRequired, workerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    const name = `work_${req.user.userId}_${Date.now()}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// ✅ Worker хамгаалалттай upload
router.post("/photo", authRequired, workerOnly, upload.single("photo"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Файл алга байна" });

    // URL -> /uploads/filename
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ message: "✅ Upload OK", url });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;