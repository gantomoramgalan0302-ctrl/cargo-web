const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { lastName, firstName, email, phone, password } = req.body;

    if (!lastName || !firstName || !email || !phone || !password) {
      return res.status(400).json({ message: "lastName, firstName, email, phone, password шаардлагатай" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) return res.status(409).json({ message: "Энэ email аль хэдийн бүртгэлтэй байна" });

    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) return res.status(409).json({ message: "Энэ утасны дугаар аль хэдийн бүртгэлтэй байна" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: "user",
    });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "✅ Бүртгэл амжилттай",
      token,
      user: {
        id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN (email)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "email, password шаардлагатай" });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Email эсвэл password буруу" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Email эсвэл password буруу" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "✅ Login амжилттай",
      token,
      user: {
        id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN BY PHONE (worker/tab-д)
router.post("/login-phone", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) return res.status(400).json({ message: "phone, password шаардлагатай" });

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) return res.status(401).json({ message: "Утас эсвэл нууц үг буруу" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Утас эсвэл нууц үг буруу" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "✅ Login амжилттай",
      token,
      user: {
        id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN-PHONE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;