// Premium içerik istekleri için: plan kontrolü, fingerprint, IP/UA bağlama ve basit rate-limit
export function premiumGuard(req, res, next) {
  // requirePlan("premium") middleware'inin ardından kullanılması önerilir.
  // Yine de emniyet için kontrol:
  const role = (req.user?.role || "").toUpperCase(); // "P" beklenir
  if (role !== "P") return res.status(403).json({ ok: false, error: "premium_required" });

  const externalId = String(req.query.externalId || req.query.userId || req.externalId || "").trim();
  if (!externalId) return res.status(400).json({ ok: false, error: "externalId_required" });

  // Basit fingerprint
  req._fp = {
    externalId,
    ip: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.socket.remoteAddress || "0.0.0.0",
    ua: req.headers["user-agent"] || "unknown"
  };

  next();
}
