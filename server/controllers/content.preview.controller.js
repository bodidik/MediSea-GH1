// FILE: server/controllers/content.preview.controller.js
import mongoose from "mongoose";

/**
 * Güvenli model alma (varsa döner, yoksa null)
 */
function getModelSafe(name) {
  try { return mongoose.model(name); } catch { return null; }
}

function pickPreview(doc) {
  if (!doc) return { title: "", section: "", type: "", preview: "" };

  // Olası alanlar:
  // - title, body, section, type
  // - translations.tr/en?.title/body
  const any = (k) => doc?.[k];
  const t = any("title")
    || doc?.translations?.tr?.title
    || doc?.translations?.en?.title
    || "(Başlık yok)";

  const b = any("body")
    || doc?.translations?.tr?.body
    || doc?.translations?.en?.body
    || "";

  const s = any("section") || "";
  const ty = any("type") || "";

  // Basit düz metin preview
  const text = String(b).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const preview = text.slice(0, 280) + (text.length > 280 ? "…" : "");

  return { title: t, section: s, type: ty, preview };
}

/**
 * GET /api/content/preview?ids=... (virgül veya çoklu param)
 * Döner: { ok:true, items: [{ id, title, section, type, preview }] }
 *
 * Varsayılan olarak Content modelini arar. Yoksa boş döner (uyumlu).
 */
export async function getContentPreview(req, res) {
  try {
    // ids çoklu:
    //  ?ids=a,b,c  veya  ?ids=a&ids=b
    const idsParam = req.query?.ids;
    let ids = [];
    if (Array.isArray(idsParam)) {
      ids = idsParam.flatMap(v => String(v).split(","));
    } else if (typeof idsParam === "string") {
      ids = idsParam.split(",");
    }
    ids = ids.map(s => s.trim()).filter(Boolean);

    if (!ids.length) {
      return res.json({ ok: true, items: [] });
    }

    const Content = getModelSafe("Content");
    if (!Content) {
      // Model yoksa uyumlu şekilde boş dön
      return res.json({ ok: true, items: ids.map(id => ({ id, title: "(Bulunamadı)", section: "", type: "", preview: "" })) });
    }

    const docs = await Content.find({ _id: { $in: ids } })
      .select("title body section type translations")
      .lean();

    const map = new Map(docs.map(d => [String(d._id), d]));
    const items = ids.map(id => {
      const doc = map.get(id);
      const picked = pickPreview(doc);
      return { id, ...picked };
    });

    return res.json({ ok: true, items });
  } catch (e) {
    console.error("getContentPreview error:", e);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
