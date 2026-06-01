const express = require("express");
const AttendanceRecord = require("../models/AttendanceRecord");
const Project = require("../models/Project");
const User = require("../models/User");
const EmployeeProfile = require("../models/EmployeeProfile");
const { authRequired, workerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// -------------------------------
// Helpers: Ulaanbaatar (UTC+8)
// -------------------------------
const UB_OFFSET_MINUTES = 8 * 60;

function getUbNow() {
  const now = new Date();
  const ub = new Date(now.getTime() + UB_OFFSET_MINUTES * 60 * 1000);
  return ub;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ubDateStr() {
  const d = getUbNow();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function ubTimeStr() {
  const d = getUbNow();
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

function isLate(checkInHHmm) {
  // 09:05-оос хойш бол late
  const [hh, mm] = String(checkInHHmm || "").split(":").map((x) => Number(x));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
  return hh > 9 || (hh === 9 && mm > 5);
}

// ✅ Worker хамгаалалт
router.use(authRequired, workerOnly);

/**
 * GET /api/worker/me
 * Worker-ийн өөрийн мэдээлэл + server time + ирц статистик
 */
router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("_id firstName lastName email phone role bankAccount");
    if (!user) return res.status(404).json({ message: "User олдсонгүй" });

    const profile = await EmployeeProfile.findOne({ userId: user._id }).lean();
    const dailyRate = profile?.dailyRate || 50000;

    const today = ubDateStr();
    const todayRecord = await AttendanceRecord.findOne({ userId: user._id, date: today }).lean();

    // Сарын ажилласан өдөр
    const now = getUbNow();
    const yearStr = String(now.getUTCFullYear());
    const monStr = String(now.getUTCMonth() + 1).padStart(2, "0");
    const monthPrefix = `${yearStr}-${monStr}`;

    const daysInMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0).getDate();
    const monthDates = Array.from({ length: daysInMonth }, (_, i) =>
      `${monthPrefix}-${String(i + 1).padStart(2, "0")}`
    );

    // Жилийн ажилласан өдөр
    const yearDates = [];
    for (let m = 1; m <= 12; m++) {
      const dim = new Date(now.getUTCFullYear(), m, 0).getDate();
      for (let d = 1; d <= dim; d++) {
        yearDates.push(`${yearStr}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
      }
    }

    const [monthRecords, yearRecords] = await Promise.all([
      AttendanceRecord.countDocuments({ userId: user._id, date: { $in: monthDates }, status: { $in: ["present", "late"] } }),
      AttendanceRecord.countDocuments({ userId: user._id, date: { $in: yearDates }, status: { $in: ["present", "late"] } }),
    ]);

    res.json({
      ...user.toObject(),
      profile: profile || null,
      todayAttendance: todayRecord || null,
      workedDaysMonth: monthRecords,
      workedDaysYear: yearRecords,
      salary: monthRecords * dailyRate,
      dailyRate,
      serverTime: { date: today, time: ubTimeStr() },
    });
  } catch (err) {
    console.error("WORKER ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/worker/bank  — ажилтан өөрийн дансны мэдээлэл шинэчлэх
 */
router.put("/bank", async (req, res) => {
  try {
    const { bankName = "", accountNumber = "" } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { bankAccount: { bankName: String(bankName).trim(), accountNumber: String(accountNumber).trim() } },
      { new: true }
    ).select("_id bankAccount");
    if (!updated) return res.status(404).json({ message: "User олдсонгүй" });
    res.json({ message: "✅ Дансны мэдээлэл шинэчлэгдлээ", bankAccount: updated.bankAccount });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/worker/projects
 * Worker-д оноосон төслүүд
 */
router.get("/projects", async (req, res) => {
  try {
    const uid = req.user.userId;
    const projects = await Project.find({ employeeIds: uid }).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    console.error("WORKER PROJECTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/worker/projects/:id
 * Worker өөрийн төслийн дэлгэрэнгүй
 */
router.get("/projects/:id", async (req, res) => {
  try {
    const uid = String(req.user.userId);
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });

    const assigned = (project.employeeIds || []).map(String).includes(uid);
    if (!assigned) return res.status(403).json({ message: "Forbidden: энэ төсөл танд хамаарахгүй" });

    res.json({ project });
  } catch (err) {
    console.error("WORKER PROJECT DETAIL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/worker/attendance/checkin
 * body: { location?: string }
 * "Ирсэн" товч → тухайн өдрийн AttendanceRecord үүсгэнэ/шинэчилнэ
 * Admin dashboard ирц realtime update (socket event: attendance:update)
 */
router.post("/attendance/checkin", async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = ubDateStr();
    const checkIn = ubTimeStr();
    const location = typeof req.body?.location === "string" ? req.body.location.trim() : "";

    const status = isLate(checkIn) ? "late" : "present";

    const record = await AttendanceRecord.findOneAndUpdate(
      { userId, date },
      {
        $set: { status, checkIn, location },
        $setOnInsert: { checkOut: "" },
      },
      { upsert: true, new: true }
    ).lean();

    const io = req.app.get("io");
    if (io) {
      io.emit("attendance:update", { type: "checkin", date, record });
    }

    res.status(201).json({ message: "✅ Ирц бүртгэгдлээ", record });
  } catch (err) {
    console.error("WORKER CHECKIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/worker/attendance/checkout
 * body: { location?: string }
 */
router.post("/attendance/checkout", async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = ubDateStr();
    const checkOut = ubTimeStr();
    const location = typeof req.body?.location === "string" ? req.body.location.trim() : "";

    const record = await AttendanceRecord.findOneAndUpdate(
      { userId, date },
      {
        $set: { checkOut, ...(location ? { location } : {}) },
        $setOnInsert: { status: "present", checkIn: "" },
      },
      { upsert: true, new: true }
    ).lean();

    const io = req.app.get("io");
    if (io) {
      io.emit("attendance:update", { type: "checkout", date, record });
    }

    res.status(201).json({ message: "✅ Гаралт бүртгэгдлээ", record });
  } catch (err) {
    console.error("WORKER CHECKOUT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/worker/equipment
 * Manager болж ажиллаж байгаа төслийн багаж хэрэгсэл (буцаагдаагүй)
 */
router.get("/equipment", async (req, res) => {
  try {
    const uid = String(req.user.userId);
    const projects = await Project.find({ managerUserId: uid }).lean();
    const result = [];
    for (const p of projects) {
      for (const eq of (p.equipmentUsed || [])) {
        if (!eq.isReturned) {
          result.push({
            ...eq,
            projectId: String(p._id),
            projectName: p.name,
          });
        }
      }
    }
    res.json({ equipment: result });
  } catch (err) {
    console.error("WORKER EQUIP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/worker/equipment/:projectId/:eqId/return
 * Manager багаж буцаах
 */
router.put("/equipment/:projectId/:eqId/return", async (req, res) => {
  try {
    const uid = String(req.user.userId);
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });
    if (String(project.managerUserId) !== uid) return res.status(403).json({ message: "Зөвхөн менежер буцааж болно" });

    const item = project.equipmentUsed.id(req.params.eqId);
    if (!item) return res.status(404).json({ message: "Бичлэг олдсонгүй" });
    if (item.isReturned) return res.status(400).json({ message: "Аль хэдийн буцаасан" });

    item.isReturned = true;
    item.returnedAt = new Date();
    await project.save();
    res.json({ message: "✅ Багаж буцаагдлаа" });
  } catch (err) {
    console.error("WORKER EQUIP RETURN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/worker/projects/:id/photos
 * body: { url: string }
 * Worker ажил гүйцэтгэлийн зураг оруулах → тухайн төслийн photos[] руу нэмнэ
 */
router.post("/projects/:id/photos", async (req, res) => {
  try {
    const uid = String(req.user.userId);
    const { url } = req.body || {};
    if (!url || !String(url).trim()) return res.status(400).json({ message: "url шаардлагатай" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Төсөл олдсонгүй" });

    const assigned = (project.employeeIds || []).map(String).includes(uid);
    if (!assigned) return res.status(403).json({ message: "Forbidden: энэ төсөл танд хамаарахгүй" });

    const cleanUrl = String(url).trim();
    project.photos = project.photos || [];
    project.photos.push(cleanUrl);

    await project.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("project:photo", { projectId: String(project._id), url: cleanUrl, byUserId: uid });
    }

    res.status(201).json({ message: "✅ Зураг нэмэгдлээ", project });
  } catch (err) {
    console.error("ADD WORK PHOTO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;