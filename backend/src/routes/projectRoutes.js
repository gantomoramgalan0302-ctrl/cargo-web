const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const Equipment = require("../models/Equipment");
const { authRequired, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Admin хамгаалалт
router.use(authRequired, adminOnly);

// GET /api/projects?q=&status=all|on-track|delayed|completed
router.get("/", async (req, res) => {
  try {
    const { q, status } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    if (q && String(q).trim()) {
      const kw = String(q).trim();
      filter.$or = [
        { name: { $regex: kw, $options: "i" } },
        { client: { $regex: kw, $options: "i" } },
        { managerName: { $regex: kw, $options: "i" } },
      ];
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/projects
router.post("/", async (req, res) => {
  try {
    const {
      name,
      client,
      status = "on-track",
      progress = 0,
      managerUserId,
      managerName = "",
      startDate = "",
      deadline = "",
      budget = 0,
      revenue = 0,
      totalCost = 0,
      employeeIds = [],
      materials = [],
      photos = [],
      documents = [],
    } = req.body;

    if (!name || !client) return res.status(400).json({ message: "name, client шаардлагатай" });

    const created = await Project.create({
      name,
      client,
      status,
      progress: Math.max(0, Math.min(100, Number(progress) || 0)),
      managerUserId,
      managerName,
      startDate,
      deadline,
      budget: Number(budget) || 0,
      revenue: Number(revenue) || 0,
      totalCost: Number(totalCost) || 0,
      employeeIds,
      materials,
      photos,
      documents,
    });

    res.status(201).json({ message: "✅ Төсөл үүслээ", project: created });
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/projects/:id  (detail)
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });

    const employeeIds = (project.employeeIds || []).map(String);
    const team = employeeIds.length
      ? await User.find({ _id: { $in: employeeIds } }).select("_id firstName lastName email phone role").lean()
      : [];

    res.json({ project, team });
  } catch (err) {
    console.error("GET PROJECT DETAIL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/projects/:id
router.put("/:id", async (req, res) => {
  try {
    const allowed = [
      "name",
      "client",
      "status",
      "progress",
      "managerUserId",
      "managerName",
      "startDate",
      "deadline",
      "budget",
      "revenue",
      "totalCost",
      "materials",
      "employeeIds",
      "photos",
      "documents",
    ];

    const patch = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) patch[k] = req.body[k];
    }

    if (typeof patch.progress === "number") patch.progress = Math.max(0, Math.min(100, patch.progress));

    const updated = await Project.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!updated) return res.status(404).json({ message: "Төсөл олдсонгүй" });

    res.json({ message: "✅ Төсөл шинэчлэгдлээ", project: updated });
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/projects/:id/employees — ажилтан нэмэх
router.post("/:id/employees", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId шаардлагатай" });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });
    const ids = project.employeeIds.map(String);
    if (!ids.includes(String(userId))) project.employeeIds.push(userId);
    await project.save();
    const team = await User.find({ _id: { $in: project.employeeIds } })
      .select("_id firstName lastName email phone").lean();
    res.json({ message: "✅ Ажилтан нэмэгдлээ", team });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ✅ DELETE /api/projects/:id/employees/:userId — ажилтан хасах
router.delete("/:id/employees/:userId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });
    project.employeeIds = project.employeeIds.filter(id => String(id) !== req.params.userId);
    if (String(project.managerUserId) === req.params.userId) {
      project.managerUserId = null;
      project.managerName = "";
    }
    await project.save();
    const team = await User.find({ _id: { $in: project.employeeIds } })
      .select("_id firstName lastName email phone").lean();
    res.json({ message: "✅ Ажилтан хасагдлаа", team });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ✅ PUT /api/projects/:id/manager — менежер солих
router.put("/:id/manager", async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });
    if (!userId) {
      project.managerUserId = null; project.managerName = "";
    } else {
      const u = await User.findById(userId).select("firstName lastName").lean();
      if (!u) return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
      project.managerUserId = userId;
      project.managerName = `${u.lastName} ${u.firstName}`;
    }
    await project.save();
    res.json({ message: "✅ Менежер солигдлоо", project });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ✅ POST /api/projects/:id/equipment — багаж хэрэгсэл хэрэглэх
router.post("/:id/equipment", async (req, res) => {
  try {
    const { equipmentId, quantity = 1 } = req.body;
    if (!equipmentId) return res.status(400).json({ message: "equipmentId шаардлагатай" });
    const [project, equip] = await Promise.all([
      Project.findById(req.params.id),
      Equipment.findById(equipmentId),
    ]);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });
    if (!equip) return res.status(404).json({ message: "Багаж олдсонгүй" });

    // Одоогийн ашиглагдаж байгаа тоог бусад төслүүдээс тооцно
    const allProjects = await Project.find({ "equipmentUsed.equipmentId": equip._id }).lean();
    const inUse = allProjects.reduce((sum, p) =>
      sum + (p.equipmentUsed || []).filter(e => String(e.equipmentId) === String(equip._id) && !e.isReturned)
        .reduce((s, e) => s + (e.quantity || 0), 0), 0);
    const available = (equip.quantity || 0) - inUse;
    if (available < Number(quantity)) return res.status(400).json({ message: `Хүрэлцэхгүй байна. Боломжит тоо: ${available}` });

    const manager = project.managerUserId
      ? await User.findById(project.managerUserId).select("firstName lastName").lean()
      : null;

    project.equipmentUsed.push({
      equipmentId: equip._id,
      equipmentName: equip.name,
      quantity: Number(quantity),
      assignedManagerId: project.managerUserId || null,
      assignedManagerName: manager ? `${manager.lastName} ${manager.firstName}` : project.managerName || "",
      assignedAt: new Date(),
      isReturned: false,
    });
    await project.save();
    res.json({ message: "✅ Багаж хэрэгслэгдлээ", project });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// ✅ PUT /api/projects/:id/equipment/:eqId/return — буцаах
router.put("/:id/equipment/:eqId/return", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });
    const item = project.equipmentUsed.id(req.params.eqId);
    if (!item) return res.status(404).json({ message: "Бичлэг олдсонгүй" });
    if (item.isReturned) return res.status(400).json({ message: "Аль хэдийн буцаасан" });
    item.isReturned = true;
    item.returnedAt = new Date();
    await project.save();
    res.json({ message: "✅ Багаж буцаагдлаа", project });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ✅ POST /api/projects/:id/materials  (add material)
router.post("/:id/materials", async (req, res) => {
  try {
    const { name, quantity = 0, unit = "ш", cost = 0 } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: "Материалын нэр шаардлагатай" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });

    project.materials.push({
      name: String(name).trim(),
      quantity: Number(quantity) || 0,
      unit: String(unit || "ш"),
      cost: Number(cost) || 0,
    });

    project.totalCost = (project.totalCost || 0) + (Number(cost) || 0);

    await project.save();
    res.status(201).json({ message: "✅ Материал нэмлээ", project });
  } catch (err) {
    console.error("ADD MATERIAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE /api/projects/:id/materials/:mid
router.delete("/:id/materials/:mid", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });

    const m = project.materials.id(req.params.mid);
    if (!m) return res.status(404).json({ message: "Материал олдсонгүй" });

    project.totalCost = Math.max(0, (project.totalCost || 0) - (m.cost || 0));

    m.deleteOne();
    await project.save();

    res.json({ message: "✅ Материал устгалаа", project });
  } catch (err) {
    console.error("DELETE MATERIAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;