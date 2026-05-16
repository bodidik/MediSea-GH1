// FILE: server/middleware/adminKey.js
export default function adminKey(req, res, next) {
  const provided = req.header("x-admin-key") || req.query.adminKey;
  const expected = process.env.ADMIN_KEY || "dev-admin-key";
  if (provided !== expected) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}
