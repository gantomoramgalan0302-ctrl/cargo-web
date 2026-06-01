const mongoose = require("mongoose");

const employeeProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    position: { type: String, default: "Ажилтан" },
    status: { type: String, enum: ["active", "offline"], default: "active" },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    revenue: { type: Number, default: 0 },
    lateCount: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    dailyRate: { type: Number, default: 50000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeProfile", employeeProfileSchema);
