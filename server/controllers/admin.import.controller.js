// FILE: server/controllers/admin.import.controller.js
const Video = require("../models/Video");
const Note = require("../models/Note");
const { ensureReviewCard } = require("../utils/review.helper");
const { mapSection } = require("../utils/section.map");

// --- Yardımcılar ---
function parseCSV(text) {
  const rows = [];
  let i = 0, cur = "", inQuotes = false, row = [];

  function pushCell() { row.push(cur); cur = ""; }
  function pushRow()  { rows.push(row); row = []; }

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      } else { cur += ch; i++; continue; }
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ",") { pushCell(); i++; continue; }
      if (ch === "\r") { i++; continue; }
      if (ch === "\n") { pushCell(); pushRow(); i++; continue; }
      cur += ch; i++; continue;
    }
  }
  pushCell();
  if (row.length > 1 || (row.length === 1 && (row[0] || "").trim() !== "")) pushRow();

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => String(h || "").trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = String(r[idx] ?? "").trim()));
    return obj;
  });
}

function toBool(v, def = true) {
  const x = String(v ?? "").trim().toLowerCase();
  if (["true","1","yes","y"].includes(x)) return true;
  if (["false","0","no","n"].includes(x)) return false;
  return def;
}
function toArray(v) {
  if (!v || typeof v !== "string") return [];
  return v.split(/[;,]/).map(s => s.trim()).filter(Boolean);
}
function isUrl(s) {
  return typeof s === "string" && /^https?:\/\//i.test(s);
}

// --- Upsert yardımcıları ---
async function upsertVideo(row, externalId, useMapping) {
  // Bölüm eşleme (opsiyonel)
  let section = row.section || "";
  let sectionCode = row.sectionCode || "";
  if (useMapping) {
    const m = mapSection(section, sectionCode);
    section = m.name;
    sectionCode = m.code || sectionCode;
  }

  const payload = {
    title: row.title,
    url: row.url,
    section,
    sectionCode,
    tags: toArray(row.tags),
    thumbnail: row.thumbnail || "",
    references: toArray(row.references),
    durationSec: Number(row.durationSec || 0),
    preview: row.preview || "",
    source: row.source || "",
    language: row.language || "tr",
    isPublic: toBool(row.isPublic, true),
  };

  if (!payload.title || !payload.url) {
    return { ok: false, error: "title and url required", row };
  }
  if (!isUrl(payload.url)) return { ok: false, error: "invalid url", row };
  if (payload.thumbnail && !isUrl(payload.thumbnail)) return { ok: false, error: "invalid thumbnail url", row };

  const doc = await Video.create(payload);

  await ensureReviewCard({
    externalId,
    contentId: String(doc._id),
    section: payload.section,
    type: "video",
  });

  return { ok: true, id: String(doc._id) };
}

async function upsertNote(row, externalId, useMapping) {
  // Bölüm eşleme (opsiyonel)
  let section = row.section || "";
  let sectionCode = row.sectionCode || "";
  if (useMapping) {
    const m = mapSection(section, sectionCode);
    section = m.name;
    sectionCode = m.code || sectionCode;
  }

  const payload = {
    title: row.title,
    content: row.content,
    section,
    sectionCode,
    tags: toArray(row.tags),
    thumbnail: row.thumbnail || "",
    references: toArray(row.references),
    preview: row.preview || "",
    language: row.language || "tr",
    authorRef: row.authorRef || "",
    isPublic: toBool(row.isPublic, true),
  };

  if (!payload.title || !payload.content) {
    return { ok: false, error: "title and content required", row };
  }

  const doc = await Note.create(payload);

  await ensureReviewCard({
    externalId,
    contentId: String(doc._id),
    section: payload.section,
    type: "note",
  });

  return { ok: true, id: String(doc._id) };
}

/**
 * POST /api/admin/import/videos
 * Body:
 * {
 *   "externalId": "mk_abc123" (opsiyonel, yoksa "seed"),
 *   "format": "csv" | "json",
 *   "data": "CSV metni" | [{...}, {...}],
 *   "useMapping": true | false   // ✅ TR→EN eşleme opsiyonu
 * }
 * CSV başlıkları (video):
 * title,url,section,sectionCode,tags,thumbnail,references,durationSec,preview,source,language,isPublic
 */
exports.importVideos = async (req, res) => {
  try {
    const body = req.body || {};
    const externalId = String(body.externalId || "seed");
    const format = (body.format || "csv").toLowerCase();
    const useMapping = body.useMapping !== false; // default: true

    let rows = [];
    if (format === "csv") {
      rows = parseCSV(String(body.data || ""));
    } else if (format === "json") {
      const arr = Array.isArray(body.data) ? body.data : JSON.parse(body.data || "[]");
      rows = arr;
    } else {
      return res.json({ ok: false, error: "format must be csv or json" });
    }

    const results = [];
    for (const row of rows) {
      try {
        const r = await upsertVideo(row, externalId, useMapping);
        results.push(r);
      } catch (e) {
        results.push({ ok: false, error: e?.message || "row error", row });
      }
    }
    const okCount = results.filter(r => r.ok).length;
    res.json({ ok: true, imported: okCount, total: results.length, results });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

/**
 * POST /api/admin/import/notes
 * Body:
 * {
 *   "externalId": "mk_abc123" (opsiyonel, yoksa "seed"),
 *   "format": "csv" | "json",
 *   "data": "CSV metni" | [{...}, {...}],
 *   "useMapping": true | false   // ✅ TR→EN eşleme opsiyonu
 * }
 * CSV başlıkları (note):
 * title,content,section,sectionCode,tags,thumbnail,references,preview,language,authorRef,isPublic
 */
exports.importNotes = async (req, res) => {
  try {
    const body = req.body || {};
    const externalId = String(body.externalId || "seed");
    const format = (body.format || "csv").toLowerCase();
    const useMapping = body.useMapping !== false; // default: true

    let rows = [];
    if (format === "csv") {
      rows = parseCSV(String(body.data || ""));
    } else if (format === "json") {
      const arr = Array.isArray(body.data) ? body.data : JSON.parse(body.data || "[]");
      rows = arr;
    } else {
      return res.json({ ok: false, error: "format must be csv or json" });
    }

    const results = [];
    for (const row of rows) {
      try {
        const r = await upsertNote(row, externalId, useMapping);
        results.push(r);
      } catch (e) {
        results.push({ ok: false, error: e?.message || "row error", row });
      }
    }
    const okCount = results.filter(r => r.ok).length;
    res.json({ ok: true, imported: okCount, total: results.length, results });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};
