// FILE: server/routes/medsea.compat.routes.js
// ESM uyumlu uyumluluk katmanı (MedSea).
import express from "express";

// --- Controllers ---
import * as compat from "../controllers/medsea.compat.controller.js";
import * as quiz from "../controllers/medsea.quiz.controller.js";
import * as review from "../controllers/review.controller.js";
import * as guidelines from "../controllers/guideline.controller.js";

const router = express.Router();

/* ---------------- Cache (basit memory) ---------------- */
const cacheStore = {};
function cache(key, ttlSec, fn) {
  return async (req, res, next) => {
    const now = Date.now();
    if (cacheStore[key] && cacheStore[key].expire > now) {
      return res.json(cacheStore[key].data);
    }
    try {
      const data = await fn(req, res, next, true);
      cacheStore[key] = { data, expire: now + ttlSec * 1000 };
    } catch (err) {
      next(err);
    }
  };
}

/* ---------------- Safe resolver ---------------- */
function safeFrom(mod, name) {
  const fn = mod?.[name] || mod?.default?.[name];
  if (typeof fn === "function") return fn;

  return (_req, res) => {
    res.status(501).json({
      ok: false,
      error: `Controller function '${name}' is not implemented`,
      moduleKeys: Object.keys(mod || {}),
    });
  };
}

/* ---------- Health ---------- */
router.get("/health", (_req, res) =>
  res.json({ ok: true, service: "compat", ts: new Date().toISOString() })
);

/* ---------- Platform summary & sections ---------- */
router.get(
  "/counts",
  cache("counts", 60, async (req, res, _n, wrap) => {
    if (wrap) {
      const fakeRes = { json: (d) => d };
      return await safeFrom(compat, "counts")(req, fakeRes);
    }
    return safeFrom(compat, "counts")(req, res);
  })
);

router.get(
  "/sections/with-count",
  cache("sectionsWithCount", 60, async (req, res, _n, wrap) => {
    if (wrap) {
      const fakeRes = { json: (d) => d };
      return await safeFrom(compat, "sectionsWithCount")(req, fakeRes);
    }
    return safeFrom(compat, "sectionsWithCount")(req, res);
  })
);

router.get("/sections/:section", safeFrom(compat, "sectionDetail"));

/* ---------- User & Plan ---------- */
router.post("/user/ensure", safeFrom(compat, "ensureUser"));
router.post("/plan/upgrade", safeFrom(compat, "planUpgrade"));
router.post("/plan/set", safeFrom(compat, "planSet"));

/* ---------- Progress ---------- */
router.post("/progress/tick", safeFrom(compat, "tickProgress"));
router.post("/progress/reset", safeFrom(compat, "resetToday"));

/* ---------- Premium Quiz ---------- */
router.get("/premium/quiz/next", safeFrom(quiz, "nextQuiz"));
router.post("/premium/quiz/submit", safeFrom(quiz, "submitQuiz"));

/* ---------- Spaced Repetition (Review) ---------- */
router.get("/review/next", safeFrom(review, "reviewNext"));
router.post("/review/answer", safeFrom(review, "reviewAnswer"));

/* ---------- Guidelines ---------- */
router.get("/guidelines", safeFrom(guidelines, "list"));
router.get("/guidelines/:id", safeFrom(guidelines, "detail"));
router.post("/guidelines", safeFrom(guidelines, "create"));
router.put("/guidelines/:id", safeFrom(guidelines, "update"));
router.post("/guidelines/:id/clone-en", safeFrom(guidelines, "cloneToEN"));

export default router;
