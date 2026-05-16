// FILE: server/middlewares/rate.guard.js
// ESM uyumlu, basit bellek içi sayaç (prod'da Redis önerilir)

const store = new Map(); // key: `${externalId}|${date}`, value: count

function todayKey(externalId) {
  const d = new Date();
  const dd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return `${externalId}|${dd}`;
}

/**
 * role: V/M/P -> limit: 2/4/∞
 * options.pathTag: sayacı ayırmak istersen (örn "questions")
 */
export function limitDailyQuestions(options = {}) {
  const pathTag = options.pathTag || "questions";
  return (req, res, next) => {
    const role = String(req.user?.role || "V").toUpperCase();
    const externalId = String(
      req.query.externalId || req.query.userId || req.externalId || req.headers["x-external-id"] || "guest"
    );

    // P: limitsiz
    if (role === "P") return next();

    const limit = role === "M" ? 4 : 2; // M:4, V:2
    const key = `${pathTag}|${todayKey(externalId)}`;

    const used = store.get(key) || 0;
    if (used >= limit) {
      return res.status(429).json({
        ok: false,
        error: "daily_limit_reached",
        detail: `Günlük görünüm sınırı aşıldı. (rol=${role}, limit=${limit})`,
      });
    }

    // **Not:** sayacı arttırmayı yanıt başarılı olduktan sonra yapmak istersen,
    // downstream controller’da da çağırabilirsin. Basitlik için burada arttırıyoruz.
    store.set(key, used + 1);
    next();
  };
}
