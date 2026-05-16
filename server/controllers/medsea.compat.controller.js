// FILE: server/controllers/medsea.compat.controller.js
// ESM uyumlu. Frontend'in beklediği isimlerle export edilir.

import UserStat from "../models/UserStat.js";

// Demo veri üretici (gerekirse gerçek DB sorgularıyla değiştir)
function demoTotals() {
  return {
    topics: 1200,
    boardQuestions: 8500,
    cases: 320,
    videos: 540,
    notes: 2100,
  };
}

export async function counts(req, res) {
  try {
    const userId =
      req.query.userId ||
      req.query.externalId ||
      req.headers["x-user-id"] ||
      (req.headers.cookie || "").match(/(?:^|; )mk_uid=([^;]+)/)?.[1] ||
      "guest";

    const stat = await UserStat.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, plan: "free", solved: 0, accuracy: 0.0, streakDays: 0, rankPercentile: 50, todaySolved: 0 } },
      { new: true, upsert: true }
    ).lean();

    res.json({
      totals: demoTotals(),
      user: {
        plan: stat?.plan || "free",
        solved: stat?.solved || 0,
        accuracy: stat?.accuracy || 0,
        streakDays: stat?.streakDays || 0,
        rankPercentile: stat?.rankPercentile || 50,
        todaySolved: stat?.todaySolved || 0,
      },
      lastUpdatedISO: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

export async function sectionsWithCount(_req, res) {
  // Basit demo: gerçek projende aggregate ile dolduruyorsun
  const rows = [
    { section: "Nephrology", topics: 120, boardQuestions: 900, cases: 30, videos: 55, notes: 210, total: 1315 },
    { section: "Cardiology", topics: 140, boardQuestions: 1100, cases: 40, videos: 60, notes: 240, total: 1580 },
    { section: "Endocrinology", topics: 100, boardQuestions: 750, cases: 25, videos: 45, notes: 180, total: 1100 },
  ];
  res.json({ rows, lastUpdatedISO: new Date().toISOString() });
}

export async function sectionDetail(req, res) {
  const section = decodeURIComponent(req.params.section || "");
  const latest = [
    { type: "Topic", id: "t1", createdAt: new Date().toISOString() },
    { type: "BoardQuestion", id: "b1", createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
  res.json({
    section,
    totals: { topics: 120, boardQuestions: 900, cases: 30, videos: 55, notes: 210, total: 1315 },
    latest,
    lastUpdatedISO: new Date().toISOString(),
  });
}

export async function ensureUser(req, res) {
  try {
    const userId =
      req.query.userId ||
      req.query.externalId ||
      req.headers["x-user-id"] ||
      (req.headers.cookie || "").match(/(?:^|; )mk_uid=([^;]+)/)?.[1] ||
      "guest";

    const plan = (req.query.plan || "free").toString();

    const doc = await UserStat.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, plan, solved: 0, accuracy: 0, streakDays: 0, rankPercentile: 50, todaySolved: 0 } },
      { new: true, upsert: true }
    ).lean();

    res.json({ ok: true, user: { userId: doc.userId, plan: doc.plan } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

export async function planUpgrade(req, res) {
  // demo: free -> premium
  req.query.plan = "premium";
  return planSet(req, res);
}

export async function planSet(req, res) {
  try {
    const userId =
      req.query.userId ||
      req.query.externalId ||
      req.headers["x-user-id"] ||
      (req.headers.cookie || "").match(/(?:^|; )mk_uid=([^;]+)/)?.[1] ||
      "guest";
    const plan = (req.query.plan || "free").toString();

    const doc = await UserStat.findOneAndUpdate(
      { userId },
      { $set: { plan } },
      { new: true, upsert: true }
    ).lean();

    res.json({ ok: true, message: "Plan updated", user: { userId: doc.userId, plan: doc.plan } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

export async function tickProgress(req, res) {
  try {
    const userId =
      req.query.userId ||
      req.query.externalId ||
      req.headers["x-user-id"] ||
      (req.headers.cookie || "").match(/(?:^|; )mk_uid=([^;]+)/)?.[1] ||
      "guest";

    const doc = await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { solved: 1, todaySolved: 1 } },
      { new: true, upsert: true }
    ).lean();

    res.json({ ok: true, solved: doc.solved, todaySolved: doc.todaySolved });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

export async function resetToday(req, res) {
  try {
    const userId =
      req.query.userId ||
      req.query.externalId ||
      req.headers["x-user-id"] ||
      (req.headers.cookie || "").match(/(?:^|; )mk_uid=([^;]+)/)?.[1] ||
      "guest";

    const doc = await UserStat.findOneAndUpdate(
      { userId },
      { $set: { todaySolved: 0 } },
      { new: true, upsert: true }
    ).lean();

    res.json({ ok: true, todaySolved: doc.todaySolved });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

export default {
  counts,
  sectionsWithCount,
  sectionDetail,
  ensureUser,
  planUpgrade,
  planSet,
  tickProgress,
  resetToday,
};
