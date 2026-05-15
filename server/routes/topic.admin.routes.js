import express from "express";
import { bulkUpsertTopics, checkSlug } from "../controllers/topic.admin.controller.js";

const router = express.Router();

/**
 * JSON veya CSV ile toplu ekleme/güncelleme
 * - JSON için: Content-Type: application/json  → { items:[...], overwrite?:true }
 * - CSV  için: Content-Type: text/csv         → kolonlar: title,slug,section,content,relatedTopics,relatedCases,references,subtopics
 *   Not: CSV çağrılarında ?overwrite=true|false query parametresi kullanılabilir.
 *
 * server.js içinde global:
 *   app.use(express.json({ limit: "2mb" }));
 * olmalı. CSV gövdeler için bu router özelinde text parser ekliyoruz.
 */
router.post(
  "/bulk",
  express.text({ type: "text/csv", limit: "10mb" }),
  (req, _res, next) => {
    // text/csv geldiyse req.body string olur; JSON ise server.js’teki express.json() ile parse edilir.
    next();
  },
  bulkUpsertTopics
);

// slug var mı kontrol
router.get("/check", checkSlug);

export default router;
