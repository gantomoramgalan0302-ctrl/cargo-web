const mongoose = require("mongoose");

const salaryPaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true }, // "2026-05"
    workedDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    dailyRate: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

salaryPaymentSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("SalaryPayment", salaryPaymentSchema);
