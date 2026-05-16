import Guideline from "../models/Guideline.js";

// GET /api/guidelines?lang=TR&section=nefroloji&q=kdigo
export async function list(req, res) {
  try {
    const { lang, section, q } = req.query;
    const filter = {};
    if (lang && ["TR", "EN"].includes(String(lang).toUpperCase())) {
      filter.lang = String(lang).toUpperCase();
    }
    if (section) filter.section = String(section).toLowerCase();
    if (q) {
      const s = String(q).trim();
      filter.$or = [
        { title: { $regex: s, $options: "i" } },
        { org:   { $regex: s, $options: "i" } },
        { tags:  { $regex: s, $options: "i" } },
      ];
    }
    const rows = await Guideline.find(filter).sort({ year: -1, createdAt: -1 }).lean();
    res.json({ ok: true, count: rows.length, items: rows });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
}

// GET /api/guidelines/:id
export async function detail(req, res) {
  try {
    const g = await Guideline.findById(req.params.id).lean();
    if (!g) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, item: g });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
}

// POST /api/guidelines
export async function create(req, res) {
  try {
    const body = req.body || {};
    const doc = await Guideline.create({
      title: body.title,
      org: body.org || "",
      year: body.year ?? null,
      lang: (body.lang || "EN").toUpperCase(),
      section: (body.section || "").toLowerCase(),
      url: body.url,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });
    res.json({ ok: true, item: doc });
  } catch (err) { res.status(400).json({ ok: false, error: err.message }); }
}

// PUT /api/guidelines/:id
export async function update(req, res) {
  try {
    const body = req.body || {};
    const upd = {
      ...(body.title !== undefined   ? { title: body.title } : {}),
      ...(body.org   !== undefined   ? { org: body.org } : {}),
      ...(body.year  !== undefined   ? { year: body.year } : {}),
      ...(body.lang  !== undefined   ? { lang: String(body.lang).toUpperCase() } : {}),
      ...(body.section !== undefined ? { section: String(body.section).toLowerCase() } : {}),
      ...(body.url   !== undefined   ? { url: body.url } : {}),
      ...(body.tags  !== undefined   ? { tags: Array.isArray(body.tags) ? body.tags : [] } : {}),
    };
    const g = await Guideline.findByIdAndUpdate(req.params.id, upd, { new: true });
    if (!g) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, item: g });
  } catch (err) { res.status(400).json({ ok: false, error: err.message }); }
}

// POST /api/guidelines/:id/clone-en
export async function cloneToEN(req, res) {
  try {
    const src = await Guideline.findById(req.params.id);
    if (!src) return res.status(404).json({ ok: false, error: "not_found" });

    const existing = (src.translations || []).find(t => t.lang === "EN" && t.guidelineId);
    if (existing) {
      const exDoc = await Guideline.findById(existing.guidelineId).lean();
      return res.json({ ok: true, cloned: false, item: exDoc });
    }

    const autoTranslated = !!(req.body?.autoTranslated);

    const enDoc = await Guideline.create({
      title: src.title,
      org: src.org,
      year: src.year,
      lang: "EN",
      section: src.section,
      url: src.url,
      tags: src.tags,
      translations: [{ lang: "TR", guidelineId: src._id, autoTranslated }]
    });

    src.translations = [
      ...(src.translations || []),
      { lang: "EN", guidelineId: enDoc._id, autoTranslated }
    ];
    await src.save();

    res.json({ ok: true, cloned: true, item: enDoc });
  } catch (err) { res.status(400).json({ ok: false, error: err.message }); }
}
