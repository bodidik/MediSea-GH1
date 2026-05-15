import express from "express";
import {
  list,      // GET    /api/topics           (section, lang, q, page, limit, sort)
  detail,    // GET    /api/topics/:slug
  create,    // POST   /api/topics
  update,    // PUT    /api/topics/:slug
  remove,    // DELETE /api/topics/:slug
  search,    // GET    /api/topics/search?q=...
  similar,   // GET    /api/topics/:slug/similar?limit=10&tagWeight=2&sectionBias=1&sameSection=1
} from "../controllers/topic.controller.js";
import Topic from "../models/topic.js";

const router = express.Router();

/* ÖNEMLİ: Parametreli rotalarla çakışmamak için spesifik yollar önce. */

// Arama (text index): ?q=..., &section=..., &page=..., &limit=...
router.get("/search", search);

// Benzer konular
router.get("/:slug/similar", similar);

// Liste (section/lang/q/limit/page/sort destekli)
router.get("/", list);

/* Alt başlık (subtopic) detayı
 * GET /api/topics/:slug/child/:subslug
 * Not: /:slug/:subslug çatışmasın diye "child" prefix’i kullanıldı.
 */
router.get("/:slug/child/:subslug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "");
    const subslug = String(req.params.subslug || "");
    const topic = await Topic.findOne({ slug }).lean();
    if (!topic) return res.status(404).json({ ok: false, error: "not_found" });

    const sub = (topic.subtopics || []).find((s) => s.slug === subslug);
    if (!sub) return res.status(404).json({ ok: false, error: "sub_not_found" });

    res.json({ ok: true, parent: { slug: topic.slug, title: topic.title }, item: sub });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Tek konu
router.get("/:slug", detail);

// CRUD
router.post("/", create);
router.put("/:slug", update);
router.delete("/:slug", remove);

export default router;
