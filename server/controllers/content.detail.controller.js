// FILE: server/controllers/content.detail.controller.js
import mongoose from "mongoose";

function getModelSafe(name) {
  try { return mongoose.model(name); } catch { return null; }
}
function asPlain(doc) {
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

/**
 * GET /api/content/:id
 * Döner: { ok:true, item:{ _id, title, body, section, type, translations?, sources?, createdAt } }
 * Not: Content modeli yoksa kırmamak için 404 verir.
 */
export async function getContentDetail(req, res) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ ok:false, error:"id gerekli" });

    const Content = getModelSafe("Content");
    if (!Content) return res.status(404).json({ ok:false, error:"Content modeli yok" });

    const item = await Content.findById(id)
      .select("title body section type translations sources createdAt updatedAt")
      .lean();

    if (!item) return res.status(404).json({ ok:false, error:"İçerik bulunamadı" });

    return res.json({ ok:true, item: asPlain(item) });
  } catch (e) {
    console.error("getContentDetail error:", e);
    return res.status(500).json({ ok:false, error:"Internal server error" });
  }
}
