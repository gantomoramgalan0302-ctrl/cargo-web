const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Unauthorized: token байхгүй" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: token буруу" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin эрх хэрэгтэй" });
  }
  next();
}

function workerOnly(req, res, next) {
  if (!req.user || req.user.role !== "worker") {
    return res.status(403).json({ message: "Forbidden: Worker эрх хэрэгтэй" });
  }
  next();
}

module.exports = { authRequired, adminOnly, workerOnly };