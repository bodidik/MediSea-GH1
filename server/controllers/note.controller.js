// FILE: server/controllers/note.controller.js
const Note = require("../models/Note");
const { ensureReviewCard } = require("../utils/review.helper");

function nonEmpty(s) {
  return typeof s === "string" && s.trim().length > 0;
}

exports.createNote = async (req, res) => {
  try {
    const externalId = String(req.query.externalId || "").trim();
    if (!externalId) return res.json({ ok: false, error: "externalId required" });

    const {
      title, content, section, sectionCode, tags = [],
      thumbnail = "", references = [],
      preview = "", language = "tr",
      authorRef = "", isPublic = true,
    } = req.body || {};

    if (!nonEmpty(title)) return res.json({ ok: false, error: "title required" });
    if (!nonEmpty(content)) return res.json({ ok: false, error: "content required" });

    const doc = await Note.create({
      title, content, section, sectionCode, tags,
      thumbnail, references, preview, language, authorRef, isPublic,
    });

    // ReviewCard
    await ensureReviewCard({
      externalId,
      contentId: String(doc._id),
      section: section || "",
      type: "note",
    });

    res.json({ ok: true, note: doc });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};
