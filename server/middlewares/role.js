// FILE: server/middlewares/role.js

// Query → role aktarımı (demo):
// ?role=V | M | P | kayseritip
// Yoksa varsayılan: V
export function attachRole(req, _res, next) {
  const role = (req.query.role || req.header("X-Role") || "V").toString();
  // Basit normalizasyon
  const normalized =
    ["V", "M", "P", "kayseritip"].includes(role) ? role : "V";
  req.user = { ...(req.user || {}), role: normalized };
  next();
}
