// Amaç: Topic içeriğini toplu (JSON/CSV) ekleme/güncelleme ve slug kontrol uçları.
// Not: ESM (import/export) kullanıyoruz.

import Topic from "../models/topic.js";
import express from "express"; // CSV text parser için route açıklamasında kullanılıyor

/* =========================================================
 * Yardımcılar
 * =======================================================*/

/** TR uyumlu basit slugify */
function baseSlugify(str = "") {
  return String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Aynı slug varsa -2, -3 ... ekleyerek benzersizleştir. */
async function ensureUniqueSlug(seed) {
  let candidate = seed || "topic";
  let n = 1;
  // ilk bulunmayan değerde durur
  while (await Topic.exists({ slug: candidate })) {
    n += 1;
    candidate = `${seed}-${n}`;
  }
  return candidate;
}

/** Alt başlıkları normalize et (eski alan) */
function normalizeSubtopics(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((st) => ({
    title: String(st?.title || "").trim(),
    slug:  String(st?.slug || "").trim() || baseSlugify(String(st?.title || "")),
    content: String(st?.content || ""),
  }));
}

/** Yeni blok şeması */
function normalizeSections(input, fallbackContent = "") {
  const list = Array.isArray(input) ? input : [];
  if (list.length > 0) {
    return list.map((b) => ({
      title: String(b?.title || "").trim() || "Bölüm",
      html: String(b?.html || ""),
      visibility: ["V","M","P"].includes(String(b?.visibility)) ? b.visibility : "V",
    }));
  }
  if (fallbackContent && String(fallbackContent).trim()) {
    return [{ title: "Özet", html: String(fallbackContent), visibility: "V" }];
  }
  return [];
}

function normalizeReferences(refs) {
  if (!Array.isArray(refs)) return [];
  return refs.map((r) => {
    if (!r) return null;
    if (typeof r === "string") return { label: r };
    return {
      label: String(r.label || "").trim() || "Kaynak",
      url: r.url ? String(r.url) : undefined,
      year: typeof r.year === "number" ? r.year : undefined,
    };
  }).filter(Boolean);
}

/* =========================================================
 * CSV desteği (opsiyonel)
 * - Content-Type: text/csv
 * - Kolonlar: title,slug,section,content,relatedTopics,relatedCases,references,subtopics
 * - relatedX/references: noktalı virgül (;) ile ayrılabilir
 * - subtopics: JSON string (örn: [{"title":"Membranöz","slug":"membranoz"}])
 * =======================================================*/

/** Basit CSV parse (pratik ihtiyaçlara yeter; karmaşık kaçışlar sınırlı) */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim());
  const idx = (name) => header.findIndex((h) => h === name);

  const iTitle    = idx("title");
  const iSlug     = idx("slug");
  const iSection  = idx("section");
  const iContent  = idx("content");
  const iRelTopics= idx("relatedTopics");
  const iRelCases = idx("relatedCases");
  const iRefs     = idx("references");
  const iSubs     = idx("subtopics");

  const rows = [];
  for (let k = 1; k < lines.length; k++) {
    const cols = splitCsvLine(lines[k], header.length);
    if (!cols) continue;

    const row = {
      title:   cols[iTitle]   ?? "",
      slug:    cols[iSlug]    ?? "",
      section: cols[iSection] ?? "",
      content: cols[iContent] ?? "",
      relatedTopics: (cols[iRelTopics] || "")
        .split(";").map((s) => s.trim()).filter(Boolean),
      relatedCases: (cols[iRelCases] || "")
        .split(";").map((s) => s.trim()).filter(Boolean),
      references: (cols[iRefs] || "")
        .split(";").map((s) => s.trim()).filter(Boolean),
      subtopics: (() => {
        const raw = cols[iSubs] || "";
        if (!raw.trim()) return [];
        try {
          const obj = JSON.parse(raw);
          return Array.isArray(obj) ? obj : [];
        } catch {
          return [];
        }
      })(),
    };

    rows.push(row);
  }
  return rows;
}

/** CSV satırı bölücü (temel) */
function splitCsvLine(line, expectedLen) {
  const parts = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  while (parts.length < expectedLen) parts.push("");
  return parts;
}

/* =========================================================
 * CONTROLLERS
 * =======================================================*/

/**
 * POST /api/admin/topics/bulk
 * Body seçenekleri:
 *  - JSON: { items: Topic[], overwrite?: boolean }
 *  - CSV : text/csv gövde, ?overwrite=true|false
 * Not: server.js içinde mutlaka şu parser'lar olmalı:
 *   app.use(express.json({ limit: "2mb" }));
 *   app.use(express.text({ type: ["text/csv","text/plain"], limit: "5mb" }));
 */
export async function bulkUpsertTopics(req, res) {
  try {
    const ct = String(req.headers["content-type"] || "").toLowerCase();
    const overwrite = String(
      req.query.overwrite ?? req.body?.overwrite ?? "true"
    ).toLowerCase() === "true";

    let items = [];
    if (ct.includes("text/csv")) {
      const text = (typeof req.body === "string" && req.body) || req.rawBody?.toString?.() || "";
      items = parseCsv(text);
    } else {
      items = Array.isArray(req.body?.items) ? req.body.items : [];
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: "items required" });
    }

    const results = [];
    for (const raw of items) {
      const data = { ...raw };

      const title = String(data.title || "").trim();
      const section = String(data.section || "").trim().toLowerCase();
      if (!title) {
        results.push({ ok: false, error: "title required" });
        continue;
      }
      if (!section) {
        results.push({ ok: false, error: "section required", title });
        continue;
      }

      let slug = String(data.slug || "").trim() || baseSlugify(title);

      const normalized = {
        title,
        section,
        content: String(data.content || ""),
        sections: normalizeSections(data.sections, data.content),
        references: normalizeReferences(data.references),
        subtopics: normalizeSubtopics(data.subtopics),
        relatedTopics: Array.isArray(data.relatedTopics)
          ? data.relatedTopics.map(String)
          : [],
        relatedCases: Array.isArray(data.relatedCases)
          ? data.relatedCases.map(String)
          : [],
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        lang: (data.lang || "TR").toUpperCase() === "EN" ? "EN" : "TR",
        summary: String(data.summary || ""),
      };

      const existing = await Topic.findOne({ slug });
      if (existing) {
        if (!overwrite) {
          results.push({ ok: true, action: "skipped", slug });
          continue;
        }
        await Topic.updateOne({ slug }, { $set: normalized });
        results.push({ ok: true, action: "updated", slug });
      } else {
        slug = await ensureUniqueSlug(slug);
        const doc = await Topic.create({ slug, ...normalized });
        results.push({ ok: true, action: "inserted", slug: doc.slug });
      }
    }

    res.json({ ok: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * GET /api/admin/topics/check?slug=xyz
 * - slug mevcut mu, yok mu?
 */
export async function checkSlug(req, res) {
  try {
    const slug = String(req.query.slug || "").trim();
    if (!slug) return res.status(400).json({ ok: false, error: "slug required" });
    const exists = await Topic.exists({ slug });
    res.json({ ok: true, slug, exists: !!exists });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
