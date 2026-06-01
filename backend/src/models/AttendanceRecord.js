const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    status: { type: String, enum: ["present", "late", "absent"], required: true },
    checkIn: { type: String, default: "" },  // "09:05"
    checkOut: { type: String, default: "" }, // "18:02"
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

// Нэг өдөр нэг ажилтанд 1 л record
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AttendanceRecord", attendanceSchema);
