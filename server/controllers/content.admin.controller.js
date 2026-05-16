// FILE: server/controllers/content.admin.controller.js
import mongoose from "mongoose";

/**
 * Güvenli model alma (varsa döner, yoksa null)
 */
function getModelSafe(name) {
  try { return mongoose.model(name); } catch { return null; }
}

/**
 * GET /api/admin/content
 * Opsiyonel query: ?q=...&type=topic|board|case|video|note&section=Nephrology&limit=100
 * Döner: [{ id, title, type, section, createdAt }]
 *
 * Not: Tek bir "Content" modeli yoksa, varsa Topic/BoardQuestion/Case/Video/Note gibi
 * modellerden minimal alanlarla birleştirmeye çalışır. Hiçbiri yoksa boş dizi döner.
 */
export async function listAdminContent(req, res) {
  try {
    const { q = "", type = "", section = "", limit = "200" } = req.query || {};
    const max = Math.min(parseInt(limit, 10) || 200, 1000);

    // 1) Tek bir birleşik Content modeli varsa onu kullan
    const Content = getModelSafe("Content");
    if (Content) {
      const filter = {};
      if (q) {
        filter.$or = [
          { title: new RegExp(String(q).trim(), "i") },
          { _id: String(q).trim() },
        ];
      }
      if (type) filter.type = type;
      if (section) filter.section = section;

      const docs = await Content.find(filter)
        .select("_id title section type createdAt")
        .sort({ createdAt: -1 })
        .limit(max)
        .lean();

      return res.json(
        docs.map(d => ({
          id: String(d._id),
          title: d.title || "(Başlık yok)",
          type: d.type || "",
          section: d.section || "",
          createdAt: d.createdAt || new Date(0),
        }))
      );
    }

    // 2) Aksi halde olası ayrı modellere bak (var olanları topla)
    const models = [
      { key: "topic",        name: "Topic",         title: "title" },
      { key: "board",        name: "BoardQuestion", title: "title" },
      { key: "case",         name: "Case",          title: "title" },
      { key: "video",        name: "Video",         title: "title" },
      { key: "note",         name: "Note",          title: "title" },
    ];

    const results = [];

    for (const m of models) {
      const M = getModelSafe(m.name);
      if (!M) continue;

      const f = {};
      if (q) {
        f.$or = [
          { [m.title]: new RegExp(String(q).trim(), "i") },
          { _id: String(q).trim() },
        ];
      }
      if (type && type !== m.key) {
        // Bu model bu tiple eşleşmiyor, atla
        continue;
      }
      if (section) f.section = section;

      const docs = await M.find(f)
        .select(`_id ${m.title} section createdAt`)
        .sort({ createdAt: -1 })
        .limit(max)
        .lean();

      for (const d of docs) {
        results.push({
          id: String(d._id),
          title: d[m.title] || "(Başlık yok)",
          type: m.key,
          section: d.section || "",
          createdAt: d.createdAt || new Date(0),
        });
      }
    }

    // Hepsini tarihe göre sırala ve kes
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(results.slice(0, max));
  } catch (e) {
    console.error("listAdminContent error:", e);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
