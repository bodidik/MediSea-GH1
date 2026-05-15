// FILE: server/controllers/question.controller.js
import mongoose from "mongoose";
import Question from "../models/Question.js";

const toInt = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pickSort = (key) => {
  switch (String(key || "").toLowerCase()) {
    case "oldest":
      return { createdAt: 1, _id: 1 };
    case "random":
      return "random";
    case "recent":
    default:
      return { createdAt: -1, _id: -1 };
  }
};

/**
 * GET /api/questions
 * q, examType, section, status=active, page, limit<=100, sort=recent|oldest|random
 */
export async function list(req, res) {
  try {
    const {
      q,
      examType,
      section,
      status = "active",
      page = 1,
      limit = 20,
      sort = "recent",
    } = req.query || {};

    const lim = Math.min(toInt(limit, 20), 100);
    const pg = toInt(page, 1);

    const filter = {};
    if (examType) filter.examType = String(examType).toLowerCase();
    if (section) filter.section = String(section).toLowerCase();
    if (status) filter.status = String(status).toLowerCase();
    if (q) {
      const rx = new RegExp(esc(q), "i");
      filter.$or = [{ title: rx }, { stem: rx }];
    }

    const s = pickSort(sort);

    if (s === "random") {
      const items = await Question.aggregate([
        { $match: filter },
        { $sample: { size: lim } },
      ]);
      return res.json({ ok: true, items });
    }

    const items = await Question.find(filter)
      .sort(s)
      .skip((pg - 1) * lim)
      .limit(lim)
      .lean();

    return res.json({ ok: true, items });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "list_failed" });
  }
}

/**
 * GET /api/questions/:id
 * view=stem|answer|explain|full
 */
export async function detail(req, res) {
  try {
    const { id } = req.params || {};
    const view = String(req.query?.view || "full").toLowerCase();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: "invalid_id" });
    }

    let projection = null;
    if (view === "stem") {
      projection = {
        title: 1,
        stem: 1,
        options: 1,
        examType: 1,
        section: 1,
        status: 1,
        createdAt: 1,
      };
    } else if (view === "answer") {
      projection = { correct: 1 };
    } else if (view === "explain") {
      projection = { correct: 1, explain: 1 };
    }

    const doc = await Question.findById(id, projection).lean();
    if (!doc) return res.status(404).json({ ok: false, error: "not_found" });
    return res.json({ ok: true, item: doc });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "detail_failed" });
  }
}

// CRUD stub'larını olduğu gibi bırakıyorum
export async function create(req, res) {
  res.status(201).json({ ok: true, created: req.body || {} });
}
export async function update(req, res) {
  res.json({ ok: true, id: req.params?.id, updated: req.body || {} });
}
export async function remove(req, res) {
  res.json({ ok: true, id: req.params?.id, removed: true });
}
