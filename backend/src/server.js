const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");

// Socket.io (realtime)
let Server;
try {
  // install: npm i socket.io
  Server = require("socket.io").Server;
} catch (e) {
  Server = null;
}

const app = express();
const httpServer = http.createServer(app);

// ✅ Middlewares
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow localhost for development
      if (origin.includes('localhost')) return callback(null, true);
      // Allow all onrender.com subdomains
      if (origin.includes('onrender.com')) return callback(null, true);
      // Allow narlagorchin.mn domain
      if (origin.includes('narlagorchin.mn')) return callback(null, true);
      // Allow specific CORS_ORIGIN env var
      const allowed = (process.env.CORS_ORIGIN || '').replace(/\/$/, '');
      if (origin.replace(/\/$/, '') === allowed) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ✅ Socket.io setup (if installed)
if (Server) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN, credentials: true },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    // optional: server time tick (frontend цаг realtime харуулахад ашиглаж болно)
    const interval = setInterval(() => {
      socket.emit("server:time", { now: Date.now() });
    }, 1000);

    socket.on("disconnect", () => clearInterval(interval));
  });
}

// ✅ DB
connectDB().then(() => restoreEquipmentQuantities());

// Өмнөх код quantity-г хасаж байсан — нэг удаа сэргээнэ
async function restoreEquipmentQuantities() {
  try {
    const Equipment = require("./models/Equipment");
    const Project = require("./models/Project");

    const items = await Equipment.find({ quantityRestored: { $ne: true } }).lean();
    if (!items.length) return;

    const projects = await Project.find().select("equipmentUsed").lean();
    const inUseMap = {};
    for (const p of projects) {
      for (const eq of (p.equipmentUsed || [])) {
        if (!eq.isReturned) {
          const id = String(eq.equipmentId);
          inUseMap[id] = (inUseMap[id] || 0) + (eq.quantity || 0);
        }
      }
    }

    for (const item of items) {
      const inUse = inUseMap[String(item._id)] || 0;
      await Equipment.findByIdAndUpdate(item._id, {
        $inc: { quantity: inUse },
        $set: { quantityRestored: true },
      });
    }
    if (items.length) console.log(`✅ Equipment quantity сэргээгдлээ (${items.length} багаж)`);
  } catch (err) {
    console.error("Equipment restore error:", err.message);
  }
}

// ✅ Routes
app.get("/api/health", (req, res) => res.json({ ok: true, message: "API is running" }));
app.use("/uploads", express.static(require("path").join(__dirname, "../uploads")));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/worker", require("./routes/workerRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/uploads/docs", express.static(require("path").join(__dirname, "../uploads/docs")));
app.use("/uploads/equipment", express.static(require("path").join(__dirname, "../uploads/equipment")));

// ✅ Start
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));