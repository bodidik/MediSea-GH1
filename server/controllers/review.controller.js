// FILE: server/controllers/review.controller.js
// ESM uyumlu (package.json -> "type":"module").
// Spaced Repetition v1 — /api/review/next ve /api/review/answer

import ReviewCard from "../models/ReviewCard.js";

/* ---------------------------------------------------------
   Yardımcılar
--------------------------------------------------------- */
function parseCookie(header = "") {
  return header.split(";").reduce((acc, part) => {
    const [k, v] = part.trim().split("=");
    if (k) acc[k] = decodeURIComponent(v || "");
    return acc;
  }, /** @type {Record<string,string>} */ ({}));
}

function getUserIdFromReq(req) {
  const q = req.query || {};
  const hdrs = req.headers || {};
  const cookies = parseCookie(hdrs.cookie || "");
  return q.userId || q.externalId || hdrs["x-user-id"] || cookies["mk_uid"] || "guest";
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function addDays(date, days) { const d = new Date(date.getTime()); d.setDate(d.getDate() + days); return d; }

function nextSchedule(result, prevInterval, prevEase) {
  let ease = prevEase;
  let interval = prevInterval;
  if (result === "wrong") { ease = Math.max(1.3, prevEase - 0.2); interval = 1; }
  else { ease = Math.min(3.0, prevEase + 0.05); interval = interval <= 0 ? 1 : interval === 1 ? 3 : Math.round(interval * ease); interval = Math.max(1, Math.min(interval, 365)); }
  return { ease, interval, dueAt: addDays(new Date(), interval) };
}

/* GET /api/review/next */
export async function reviewNext(req, res) {
  try {
    const userId = getUserIdFromReq(req);
    const { section, type } = req.query;
    const limit = clamp(parseInt(req.query.limit || "20", 10) || 20, 1, 100);
    const now = new Date();

    const match = { userId, dueAt: { $lte: now } };
    if (section && String(section).trim()) match.section = String(section).trim();
    if (type && String(type).trim()) match.type = String(type).trim();

    const [items, dueTotal] = await Promise.all([
      ReviewCard.find(match).sort({ dueAt: 1 }).limit(limit).lean(),
      ReviewCard.countDocuments({ userId, dueAt: { $lte: now } }),
    ]);

    const mapped = (items || []).map((d) => ({
      id: String(d._id), contentId: d.contentId, section: d.section, type: d.type,
      interval: d.interval ?? 0, ease: d.ease ?? 2.5,
      dueAt: d.dueAt ? new Date(d.dueAt).toISOString() : new Date().toISOString(),
    }));

    res.json({ ok: true, items: mapped, dueTotal });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
}

/* POST /api/review/answer  body: { id, result: "correct"|"wrong"|"later" } */
export async function reviewAnswer(req, res) {
  try {
    const userId = getUserIdFromReq(req);
    const { id, result } = req.body || {};
    if (!id || !result) return res.status(400).json({ ok: false, error: "id ve result zorunludur" });

    const doc = await ReviewCard.findOne({ _id: id, userId });
    if (!doc) return res.status(404).json({ ok: false, error: "Kart bulunamadı" });

    if (result === "later") {
      const dueAt = new Date(Date.now() + 10 * 60 * 1000);
      doc.dueAt = dueAt; await doc.save();
      return res.json({ ok: true, action: "postponed", dueAt: dueAt.toISOString() });
    }

    if (result !== "correct" && result !== "wrong")
      return res.status(400).json({ ok: false, error: "result geçersiz" });

    const prevEase = typeof doc.ease === "number" ? doc.ease : 2.5;
    const prevInterval = typeof doc.interval === "number" ? doc.interval : 0;
    const { ease, interval, dueAt } = nextSchedule(result, prevInterval, prevEase);

    doc.ease = ease; doc.interval = interval; doc.dueAt = dueAt; await doc.save();
    res.json({ ok: true, action: "graded", ease, interval, dueAt: dueAt.toISOString() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
}

export default { reviewNext, reviewAnswer };
