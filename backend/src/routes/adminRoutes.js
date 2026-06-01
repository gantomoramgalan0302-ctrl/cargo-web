const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const EmployeeProfile = require("../models/EmployeeProfile");
const AttendanceRecord = require("../models/AttendanceRecord");
const SalaryPayment = require("../models/SalaryPayment");
const Project = require("../models/Project");
const User = require("../models/User");
const { authRequired, adminOnly } = require("../middleware/authMiddleware");

// PDF upload setup
const uploadDir = path.join(__dirname, "../../uploads/docs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `doc_${Date.now()}${ext}`);
  },
});
const pdfUpload = multer({ storage: pdfStorage, limits: { fileSize: 20 * 1024 * 1024 } });

const router = express.Router();

// ✅ Admin хамгаалалт
router.use(authRequired, adminOnly);

/**
 * GET /api/admin/users?role=user|worker|admin
 * role заахгүй бол бүх хэрэглэгч
 */
router.get("/users", async (req, res) => {
  try {
    const { role, q } = req.query;

    const filter = {};
    if (role) filter.role = role;

    // q байвал нэр/овог/имэйл/утсаар хайна
    if (q && String(q).trim()) {
      const kw = String(q).trim();
      filter.$or = [
        { firstName: { $regex: kw, $options: "i" } },
        { lastName: { $regex: kw, $options: "i" } },
        { email: { $regex: kw, $options: "i" } },
        { phone: { $regex: kw, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("_id firstName lastName email phone role createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/admin/employees?q=...
// role=worker хэрэглэгчдийг EmployeeProfile-тэй нь хамт буцаана
router.get("/employees", async (req, res) => {
  try {
    const { q } = req.query;

    const match = { role: "worker" };

    if (q && String(q).trim()) {
      const kw = String(q).trim();
      match.$or = [
        { firstName: { $regex: kw, $options: "i" } },
        { lastName: { $regex: kw, $options: "i" } },
        { email: { $regex: kw, $options: "i" } },
        { phone: { $regex: kw, $options: "i" } },
      ];
    }

    const users = await User.find(match)
      .select("_id firstName lastName email phone role bankAccount createdAt")
      .sort({ createdAt: -1 });

    const userIds = users.map((u) => u._id);

    const profiles = await EmployeeProfile.find({ userId: { $in: userIds } }).lean();
    const map = new Map(profiles.map((p) => [String(p.userId), p]));

    const employees = users.map((u) => {
      const p = map.get(String(u._id));
      return {
        id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        bankAccount: u.bankAccount || { bankName: "", accountNumber: "" },
        position: p?.position ?? "Ажилтан",
        status: p?.status ?? "active",
        rating: typeof p?.rating === "number" ? p.rating : 4.5,
        revenue: typeof p?.revenue === "number" ? p.revenue : 0,
        lateCount: typeof p?.lateCount === "number" ? p.lateCount : 0,
        tasksCompleted: typeof p?.tasksCompleted === "number" ? p.tasksCompleted : 0,
      };
    });

    res.json({ employees });
  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * body: { role: "worker" | "user" | "admin" }
 */
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role, position } = req.body;
    const { id } = req.params;

    if (!role || !["user", "worker", "admin"].includes(role)) {
      return res.status(400).json({ message: "role буруу байна" });
    }

    if (req.user.userId === id && role !== "admin") {
      return res.status(400).json({ message: "Өөрийн admin эрхийг буулгаж болохгүй" });
    }

    const updated = await User.findByIdAndUpdate(id, { role }, { new: true })
      .select("_id firstName lastName email phone role");

    if (!updated) return res.status(404).json({ message: "User олдсонгүй" });

    // ✅ role=worker болсон бол EmployeeProfile үүсгэнэ/байгаа бол update хийнэ
    if (role === "worker") {
      await EmployeeProfile.findOneAndUpdate(
        { userId: updated._id },
        {
          $setOnInsert: {
            userId: updated._id,
            position: typeof position === "string" && position.trim() ? position.trim() : "Ажилтан",
            status: "active",
            rating: 4.5,
            revenue: 0,
            lateCount: 0,
            tasksCompleted: 0,
          },
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "✅ Role шинэчлэгдлээ", user: updated });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/admin/attendance?date=YYYY-MM-DD
router.get("/attendance", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date шаардлагатай (YYYY-MM-DD)" });

    const workers = await User.find({ role: "worker" })
      .select("_id firstName lastName email phone")
      .lean();

    const workerIds = workers.map((w) => w._id);

    const records = await AttendanceRecord.find({ date, userId: { $in: workerIds } }).lean();
    const map = new Map(records.map((r) => [String(r.userId), r]));

    const attendance = workers.map((w) => {
      const r = map.get(String(w._id));
      return {
        id: r?._id || `${w._id}-${date}`,
        userId: String(w._id),
        employeeName: `${w.lastName} ${w.firstName}`.trim(),
        status: r?.status || "absent",
        checkIn: r?.checkIn || "",
        checkOut: r?.checkOut || "",
        location: r?.location || "",
        date,
      };
    });

    res.json({ date, attendance });
  } catch (err) {
    console.error("GET ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/admin/attendance/week?start=YYYY-MM-DD&days=7
router.get("/attendance/week", async (req, res) => {
  try {
    const { start, days = 7 } = req.query;
    if (!start) return res.status(400).json({ message: "start шаардлагатай (YYYY-MM-DD)" });

    const n = Math.max(1, Math.min(31, Number(days) || 7));

    const toDate = (d) => new Date(d + "T00:00:00Z");
    const pad = (x) => String(x).padStart(2, "0");
    const fmt = (dt) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;

    const startDt = toDate(String(start));
    const dates = Array.from({ length: n }, (_, i) => {
      const d = new Date(startDt);
      d.setUTCDate(d.getUTCDate() + i);
      return fmt(d);
    });

    const workers = await User.find({ role: "worker" }).select("_id").lean();
    const workerIds = workers.map((w) => w._id);

    const records = await AttendanceRecord.find({
      date: { $in: dates },
      userId: { $in: workerIds },
    }).lean();

    const map = {};
    for (const r of records) {
      const uid = String(r.userId);
      if (!map[uid]) map[uid] = {};
      map[uid][r.date] = r.status;
    }

    res.json({ dates, map });
  } catch (err) {
    console.error("WEEK ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET /api/admin/salary?month=2026-05
router.get("/salary", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: "month шаардлагатай (YYYY-MM)" });

    const workers = await User.find({ role: "worker" }).select("_id firstName lastName").lean();
    const workerIds = workers.map((w) => w._id);

    const profiles = await EmployeeProfile.find({ userId: { $in: workerIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    });

    const records = await AttendanceRecord.find({
      userId: { $in: workerIds },
      date: { $in: dates },
      status: { $in: ["present", "late"] },
    }).lean();

    const workedMap = {};
    for (const r of records) {
      const uid = String(r.userId);
      workedMap[uid] = (workedMap[uid] || 0) + 1;
    }

    const payments = await SalaryPayment.find({ userId: { $in: workerIds }, month }).lean();
    const payMap = new Map(payments.map((p) => [String(p.userId), p]));

    const salary = workers.map((w) => {
      const uid = String(w._id);
      const profile = profileMap.get(uid);
      const dailyRate = profile?.dailyRate || 50000;
      const workedDays = workedMap[uid] || 0;
      const pay = payMap.get(uid);
      const halfDays = pay?.halfDays || 0;
      const totalAmount = workedDays * dailyRate - halfDays * (dailyRate / 2);
      return {
        userId: uid,
        firstName: w.firstName,
        lastName: w.lastName,
        position: profile?.position || "Ажилтан",
        dailyRate,
        workedDays,
        halfDays,
        totalAmount,
        isPaid: pay?.isPaid || false,
        paymentId: pay?._id || null,
        paidAt: pay?.paidAt || null,
      };
    });

    res.json({ month, salary });
  } catch (err) {
    console.error("SALARY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/admin/salary/:userId/pay  body: { month, isPaid }
router.put("/salary/:userId/pay", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, isPaid } = req.body;
    if (!month) return res.status(400).json({ message: "month шаардлагатай" });

    const worker = await User.findById(userId).select("firstName lastName").lean();
    if (!worker) return res.status(404).json({ message: "Ажилтан олдсонгүй" });

    const profile = await EmployeeProfile.findOne({ userId }).lean();
    const dailyRate = profile?.dailyRate || 50000;

    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    });
    const count = await AttendanceRecord.countDocuments({
      userId,
      date: { $in: dates },
      status: { $in: ["present", "late"] },
    });

    const existingPay = await SalaryPayment.findOne({ userId, month }).lean();
    const halfDays = existingPay?.halfDays || 0;
    const totalAmount = count * dailyRate - halfDays * (dailyRate / 2);

    const payment = await SalaryPayment.findOneAndUpdate(
      { userId, month },
      {
        workedDays: count,
        dailyRate,
        halfDays,
        totalAmount,
        isPaid: !!isPaid,
        paidAt: isPaid ? new Date() : null,
      },
      { upsert: true, new: true }
    );

    res.json({ message: "✅ Цалин шинэчлэгдлээ", payment });
  } catch (err) {
    console.error("PAY SALARY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/admin/salary/:userId/halfDays  body: { month, halfDays }
router.put("/salary/:userId/halfDays", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, halfDays } = req.body;
    if (!month) return res.status(400).json({ message: "month шаардлагатай" });
    const n = Math.max(0, Math.floor(Number(halfDays) || 0));

    const worker = await User.findById(userId).lean();
    if (!worker) return res.status(404).json({ message: "Ажилтан олдсонгүй" });

    const profile = await EmployeeProfile.findOne({ userId }).lean();
    const dailyRate = profile?.dailyRate || 50000;

    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    });
    const count = await AttendanceRecord.countDocuments({
      userId,
      date: { $in: dates },
      status: { $in: ["present", "late"] },
    });

    const totalAmount = count * dailyRate - n * (dailyRate / 2);

    const payment = await SalaryPayment.findOneAndUpdate(
      { userId, month },
      { halfDays: n, workedDays: count, dailyRate, totalAmount },
      { upsert: true, new: true }
    );

    res.json({ message: "✅ Хагас өдөр хадгалагдлаа", halfDays: payment.halfDays, totalAmount: payment.totalAmount });
  } catch (err) {
    console.error("HALFDAYS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/admin/users/:id/bank  — банкны дансны мэдээлэл шинэчлэх
router.put("/users/:id/bank", async (req, res) => {
  try {
    const { bankName = "", accountNumber = "" } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { bankAccount: { bankName: String(bankName).trim(), accountNumber: String(accountNumber).trim() } },
      { new: true }
    ).select("_id bankAccount");
    if (!updated) return res.status(404).json({ message: "User олдсонгүй" });
    res.json({ message: "✅ Дансны мэдээлэл шинэчлэгдлээ", bankAccount: updated.bankAccount });
  } catch (err) {
    console.error("BANK UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/admin/dashboard — хяналтын самбарын бодит мэдээлэл
router.get("/dashboard", async (req, res) => {
  try {
    const [projectCount, workerCount, allProjects, recentProjects] = await Promise.all([
      Project.countDocuments(),
      User.countDocuments({ role: "worker" }),
      Project.find().select("revenue totalCost budget status name client progress createdAt").lean(),
      Project.find().select("name client status progress revenue totalCost createdAt").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const totalRevenue = allProjects.reduce((s, p) => s + (p.revenue || 0), 0);
    const totalCost = allProjects.reduce((s, p) => s + (p.totalCost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const completedCount = allProjects.filter(p => p.status === "completed").length;
    const delayedCount = allProjects.filter(p => p.status === "delayed").length;

    // Group revenue/cost by month from createdAt (last 6 months)
    const now = new Date();
    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("mn-MN", { month: "short" });
      monthlyMap[key] = { month: label, revenue: 0, expenses: 0 };
    }
    for (const p of allProjects) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap[key]) {
        monthlyMap[key].revenue += p.revenue || 0;
        monthlyMap[key].expenses += p.totalCost || 0;
      }
    }
    const revenueGrowth = Object.values(monthlyMap);

    res.json({
      totalRevenue, totalCost, totalProfit, projectCount, workerCount,
      completedCount, delayedCount, recentProjects, revenueGrowth,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/admin/employees/:userId/dailyRate
router.put("/employees/:userId/dailyRate", async (req, res) => {
  try {
    const { dailyRate } = req.body;
    if (!dailyRate || isNaN(dailyRate) || Number(dailyRate) <= 0)
      return res.status(400).json({ message: "Өдрийн хөлс буруу" });
    const profile = await EmployeeProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { dailyRate: Number(dailyRate) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ message: "✅ Өдрийн хөлс шинэчлэгдлээ", dailyRate: profile.dailyRate });
  } catch (err) {
    console.error("DAILY RATE UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/admin/documents/upload  - PDF upload linked to project
router.post("/documents/upload", pdfUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Файл алга" });
    const { projectId, name, type } = req.body;
    if (!projectId) return res.status(400).json({ message: "projectId шаардлагатай" });

    const url = `/uploads/docs/${req.file.filename}`;
    const docEntry = {
      name: name || req.file.originalname,
      type: type || "other",
      url,
      uploadDate: new Date().toISOString().slice(0, 10),
      size: `${(req.file.size / 1024).toFixed(0)} KB`,
    };

    const project = await Project.findByIdAndUpdate(
      projectId,
      { $push: { documents: docEntry } },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });

    res.status(201).json({ message: "✅ Баримт нэмэгдлээ", document: docEntry, project: project.name });
  } catch (err) {
    console.error("DOC UPLOAD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/admin/documents - бүх төслийн баримт бичгүүд
router.get("/documents", async (req, res) => {
  try {
    const projects = await Project.find({ "documents.0": { $exists: true } })
      .select("name documents")
      .lean();
    const docs = [];
    for (const p of projects) {
      for (const d of p.documents) {
        docs.push({ ...d, projectName: p.name, projectId: p._id });
      }
    }
    docs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
