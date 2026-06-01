const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "ширхэг" },
    condition: { type: String, enum: ["good", "fair", "poor"], default: "good" },
    images: { type: [String], default: [] },
    quantityRestored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
