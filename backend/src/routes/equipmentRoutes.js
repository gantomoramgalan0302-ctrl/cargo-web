const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Equipment = require("../models/Equipment");
const Project = require("../models/Project");
const { authRequired, adminOnly } = require("../middleware/authMiddleware");

// Зураг хадгалах директор
const equipImgDir = path.join(__dirname, "../../uploads/equipment");
if (!fs.existsSync(equipImgDir)) fs.mkdirSync(equipImgDir, { recursive: true });

const equipStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, equipImgDir),
  filename: (req, file, cb) => {
    const ext = [".jpg", ".jpeg", ".png", ".webp"].includes(
      path.extname(file.originalname).toLowerCase()
    ) ? path.extname(file.originalname).toLowerCase() : ".jpg";
    cb(null, `equip_${req.params.id}_${Date.now()}${ext}`);
  },
});
const equipUpload = multer({ storage: equipStorage, limits: { fileSize: 8 * 1024 * 1024 } });

const router = express.Router();

router.get("/", authRequired, adminOnly, async (req, res) => {
  try {
    const items = await Equipment.find().sort({ createdAt: -1 }).lean();

    // Бүх төслийн ашиглалтаас inUse тооцно
    const projects = await Project.find({ "equipmentUsed.0": { $exists: true } })
      .select("equipmentUsed").lean();

    const inUseMap = {};
    for (const p of projects) {
      for (const eq of (p.equipmentUsed || [])) {
        if (!eq.isReturned) {
          const id = String(eq.equipmentId);
          inUseMap[id] = (inUseMap[id] || 0) + (eq.quantity || 0);
        }
      }
    }

    const result = items.map(item => {
      const inUse = inUseMap[String(item._id)] || 0;
      return { ...item, inUse, available: Math.max(0, (item.quantity || 0) - inUse) };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const { name, description, quantity, unit, condition } = req.body;
    if (!name) return res.status(400).json({ message: "Нэр оруулна уу" });
    const item = await Equipment.create({ name, description, quantity, unit, condition });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Олдсонгүй" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/equipment/:id/images — зураг нэмэх
router.post("/:id/images", authRequired, adminOnly, equipUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Зураг байхгүй" });
    const url = `/uploads/equipment/${req.file.filename}`;
    const item = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $push: { images: url } },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Багаж олдсонгүй" });
    res.json({ message: "✅ Зураг нэмэгдлээ", url, images: item.images });
  } catch (err) {
    console.error("EQUIP IMG UPLOAD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE /api/equipment/:id/images/:idx — зураг устгах
router.delete("/:id/images/:idx", authRequired, adminOnly, async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Багаж олдсонгүй" });
    const idx = Number(req.params.idx);
    if (isNaN(idx) || idx < 0 || idx >= item.images.length)
      return res.status(400).json({ message: "Индекс буруу" });
    // Файл устгах
    const filePath = path.join(__dirname, "../../", item.images[idx]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    item.images.splice(idx, 1);
    await item.save();
    res.json({ message: "✅ Зураг устгагдлаа", images: item.images });
  } catch (err) {
    console.error("EQUIP IMG DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Static — equipment зурагнуудыг serve хийх
module.exports = router;
