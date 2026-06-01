const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: "ш" },
    cost: { type: Number, default: 0 },
  },
  { _id: true }
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    url: { type: String, required: true },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    client: { type: String, required: true },

    status: { type: String, enum: ["on-track", "delayed", "completed"], default: "on-track" },
    progress: { type: Number, default: 0, min: 0, max: 100 },

    managerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    managerName: { type: String, default: "" },

    startDate: { type: String, default: "" }, // YYYY-MM-DD
    deadline: { type: String, default: "" },  // YYYY-MM-DD

    budget: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },

    // ✅ NEW: материалы, баг, зураг, баримт
    materials: { type: [materialSchema], default: [] },
    employeeIds: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // worker userIds
    photos: { type: [String], default: [] }, // url list
    documents: { type: [documentSchema], default: [] },
    equipmentUsed: {
      type: [new mongoose.Schema({
        equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
        equipmentName: { type: String, default: "" },
        quantity: { type: Number, default: 1 },
        assignedManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        assignedManagerName: { type: String, default: "" },
        assignedAt: { type: Date, default: Date.now },
        isReturned: { type: Boolean, default: false },
        returnedAt: { type: Date },
      }, { _id: true })],
      default: [],
    },
  },
  { timestamps: true }
);

// Ашиг, ашигийн хувь (DB-д хадгалахгүй)
projectSchema.virtual("profit").get(function () {
  return (this.revenue || 0) - (this.totalCost || 0);
});

projectSchema.virtual("profitMargin").get(function () {
  const rev = this.revenue || 0;
  if (!rev) return 0;
  return (((rev - (this.totalCost || 0)) / rev) * 100);
});

projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Project", projectSchema);
