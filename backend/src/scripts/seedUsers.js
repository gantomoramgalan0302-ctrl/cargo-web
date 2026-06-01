const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const users = [
  { lastName: "Батбаяр", firstName: "Ганзориг", email: "ganzorigb@gmail.com", phone: "99112233" },
  { lastName: "Дорж", firstName: "Номин",     email: "nomind@gmail.com",    phone: "99224455" },
  { lastName: "Энхбаяр", firstName: "Тэмүүлэн", email: "temuulene@gmail.com", phone: "99336677" },
  { lastName: "Гантулга", firstName: "Болормаа", email: "bolortg@gmail.com",  phone: "99448899" },
  { lastName: "Цэрэнпунцаг", firstName: "Анхбаяр", email: "ankhbayarts@gmail.com", phone: "99551122" },
  { lastName: "Мөнхбат", firstName: "Энхжаргал", email: "enkhjargalm@gmail.com", phone: "99663344" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URL, { tls: true, tlsInsecure: true });
  console.log("✅ MongoDB холбогдлоо");

  const passwordHash = await bcrypt.hash("123456", 10);
  let created = 0;

  for (const u of users) {
    const exists = await User.findOne({ $or: [{ email: u.email }, { phone: u.phone }] });
    if (exists) {
      console.log(`⏭  Аль хэдийн байна: ${u.email}`);
      continue;
    }
    await User.create({ ...u, passwordHash, role: "user" });
    console.log(`✅ Үүслээ: ${u.lastName} ${u.firstName} — ${u.email}`);
    created++;
  }

  console.log(`\n🎉 Нийт ${created} шинэ хэрэглэгч үүслээ`);
  await mongoose.disconnect();
}

seed().catch(console.error);
