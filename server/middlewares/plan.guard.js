// ESM
export function attachPlanFromRequest(req, _res, next) {
  // Plan önceliği: header → query → mevcut req.user → default: V
  const hdr = String(req.header("x-plan") || "").toUpperCase();
  const q = String(req.query.planLevel || req.query.role || "").toUpperCase();
  const cur = String(req.user?.planLevel || req.user?.role || "").toUpperCase();

  const plan = ["P", "M", "V"].includes(hdr) ? hdr
             : ["P", "M", "V"].includes(q)   ? q
             : ["P", "M", "V"].includes(cur) ? cur
             : "V";

  req.user = { ...(req.user || {}), planLevel: plan };
  next();
}

// Kullanım: route bazında P/M zorunluluğu
export function requirePlan(min = "M") {
  const order = ["V", "M", "P"];
  return (req, res, next) => {
    const plan = String(req.user?.planLevel || "V").toUpperCase();
    if (order.indexOf(plan) >= order.indexOf(min)) return next();
    return res.status(403).json({ ok: false, error: "required_plan_" + min });
  };
}
