const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URL);

  const existing = await User.findOne({ email: "admin@narlag.mn" });
  if (existing) {
    console.log("✅ Admin хэрэглэгч аль хэдийн байна:", existing.email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({
    lastName: "Нарлаг",
    firstName: "Админ",
    email: "admin@narlag.mn",
    phone: "99000000",
    passwordHash,
    role: "admin",
  });

  console.log("✅ Admin хэрэглэгч үүслээ: admin@narlag.mn / admin123");
  await mongoose.disconnect();
}

seedAdmin().catch(console.error);
