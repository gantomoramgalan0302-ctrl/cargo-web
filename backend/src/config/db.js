const mongoose = require("mongoose");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      tls: true,
      tlsInsecure: true,
    });
    console.log("✅ MongoDB connected:", conn.connection.host);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

module.exports = connectDB;
