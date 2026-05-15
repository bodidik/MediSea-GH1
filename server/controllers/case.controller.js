import Case from "../models/Case.js";

// GET /api/cases
export async function list(req, res) {
  try {
    const rows = await Case.find({ isActive: true })
      .select("slug title createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, items: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || "list_failed" });
  }
}

// GET /api/cases/:slug
export async function getBySlug(req, res) {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ ok: false, error: "slug_required" });

    const doc = await Case.findOne({ slug, isActive: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, error: "not_found" });

    res.json({ ok: true, case: doc });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || "get_failed" });
  }
}
