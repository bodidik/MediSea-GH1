// FILE: server/controllers/video.controller.js
const Video = require("../models/Video");
const { ensureReviewCard } = require("../utils/review.helper");

function isUrl(s) {
  return typeof s === "string" && /^https?:\/\//i.test(s);
}

exports.createVideo = async (req, res) => {
  try {
    const externalId = String(req.query.externalId || "").trim();
    if (!externalId) return res.json({ ok: false, error: "externalId required" });

    const {
      title, url, section, sectionCode, tags = [],
      thumbnail = "", references = [],
      durationSec = 0, preview = "", source = "",
      language = "tr", isPublic = true,
    } = req.body || {};

    if (!title || !url) return res.json({ ok: false, error: "title and url required" });
    if (!isUrl(url)) return res.json({ ok: false, error: "url must start with http(s)://" });
    if (thumbnail && !isUrl(thumbnail)) return res.json({ ok: false, error: "thumbnail must be a valid http(s) url" });

    const doc = await Video.create({
      title, url, section, sectionCode, tags,
      thumbnail, references, durationSec, preview, source,
      language, isPublic,
    });

    // ReviewCard
    await ensureReviewCard({
      externalId,
      contentId: String(doc._id),
      section: section || "",
      type: "video",
    });

    res.json({ ok: true, video: doc });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};
