// FILE: server/controllers/board.controller.js
const Board = require("../models/Board");
const { ensureReviewCard } = require("../utils/review.helper");

exports.createBoard = async (req, res) => {
  try {
    const externalId = String(req.query.externalId || "").trim();
    if (!externalId) return res.json({ ok: false, error: "externalId required" });

    const { question, answer, section, tags = [] } = req.body || {};
    if (!question) return res.json({ ok: false, error: "question required" });

    const doc = await Board.create({ question, answer, section, tags });

    await ensureReviewCard({
      externalId,
      contentId: String(doc._id),
      section,
      type: "board",
    });

    res.json({ ok: true, board: doc });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};
