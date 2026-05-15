// FILE: server/controllers/admin.section.controller.js
const Video = require("../models/Video");
const Note = require("../models/Note");
const { mapSection } = require("../utils/section.map");

/**
 * DB içeriğini tarar; "section/sectionCode" alanlarını analiz eder,
 * mapping önerisi çıkarır ve bilinmeyenleri raporlar.
 * GET /api/admin/sections/audit?models=videos,notes
 * Optional: ?limit=5000 (her model için)
 */
exports.audit = async (req, res) => {
  try {
    const modelsQ = String(req.query.models || "videos,notes")
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const limit = Math.max(1, Math.min(100000, Number(req.query.limit || 5000)));

    const tasks = [];
    if (modelsQ.includes("videos")) tasks.push(Video.find({}).limit(limit).lean());
    else tasks.push(Promise.resolve([]));
    if (modelsQ.includes("notes"))  tasks.push(Note.find({}).limit(limit).lean());
    else tasks.push(Promise.resolve([]));

    const [videos, notes] = await Promise.all(tasks);

    function collect(items, type) {
      const rows = [];
      for (const d of items) {
        const section = d.section || "";
        const sectionCode = d.sectionCode || "";
        const m = mapSection(section, sectionCode);
        rows.push({
          _id: String(d._id),
          type,
          section,
          sectionCode,
          suggestedName: m.name,
          suggestedCode: m.code,
          mapped: !!m.mapped,
        });
      }
      return rows;
    }

    const rows = [...collect(videos, "video"), ...collect(notes, "note")];

    // Özet: bilinmeyenler ve farklar
    const unknown = rows.filter(r => !r.mapped && !r.sectionCode);
    const mismatches = rows.filter(
      r => r.mapped && (r.section !== r.suggestedName || (r.sectionCode || "") !== (r.suggestedCode || ""))
    );

    // Grup bazlı sayımlar
    const countBy = (arr, key) => {
      const m = {};
      for (const x of arr) {
        const k = String(x[key] || "").trim();
        m[k] = (m[k] || 0) + 1;
      }
      return Object.entries(m)
        .map(([k, v]) => ({ key: k, count: v }))
        .sort((a, b) => b.count - a.count);
    };

    res.json({
      ok: true,
      total: rows.length,
      unknownCount: unknown.length,
      mismatchCount: mismatches.length,
      topUnknownSections: countBy(unknown, "section").slice(0, 50),
      topMismatchedSections: countBy(mismatches, "section").slice(0, 50),
      sampleUnknown: unknown.slice(0, 100),
      sampleMismatches: mismatches.slice(0, 100),
    });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

/**
 * Otomatik normalize (map edilmiş eşleşmeleri uygular).
 * POST /api/admin/sections/normalize
 * Body:
 * {
 *   "models": ["videos","notes"],         // opsiyonel, default ikisi
 *   "apply": false                        // default: false (dry-run)
 *   "limit": 5000                         // opsiyonel
 * }
 * Dönen: kaç kaydın değişeceği / değiştiği.
 */
exports.normalize = async (req, res) => {
  try {
    const body = req.body || {};
    const models = Array.isArray(body.models) && body.models.length
      ? body.models.map(s => String(s || "").toLowerCase())
      : ["videos", "notes"];
    const apply = !!body.apply;
    const limit = Math.max(1, Math.min(100000, Number(body.limit || 5000)));

    const tasks = [];
    if (models.includes("videos")) tasks.push(Video.find({}).limit(limit).lean());
    else tasks.push(Promise.resolve([]));
    if (models.includes("notes"))  tasks.push(Note.find({}).limit(limit).lean());
    else tasks.push(Promise.resolve([]));

    const [videos, notes] = await Promise.all(tasks);

    const changes = [];

    function plan(items, modelName) {
      for (const d of items) {
        const section = d.section || "";
        const sectionCode = d.sectionCode || "";
        const m = mapSection(section, sectionCode);
        if (!m.mapped) continue;
        const needName = section !== m.name;
        const needCode = (sectionCode || "") !== (m.code || "");
        if (needName || needCode) {
          changes.push({
            model: modelName,
            _id: String(d._id),
            from: { section, sectionCode },
            to: { section: m.name, sectionCode: m.code },
          });
        }
      }
    }

    plan(videos, "Video");
    plan(notes, "Note");

    if (!apply || changes.length === 0) {
      return res.json({ ok: true, apply: false, changes: changes.slice(0, 500), totalChanges: changes.length });
    }

    // Gerçek güncelleme
    let updated = 0;
    for (const ch of changes) {
      if (ch.model === "Video") {
        await Video.updateOne({ _id: ch._id }, { $set: { section: ch.to.section, sectionCode: ch.to.sectionCode } });
        updated++;
      } else if (ch.model === "Note") {
        await Note.updateOne({ _id: ch._id }, { $set: { section: ch.to.section, sectionCode: ch.to.sectionCode } });
        updated++;
      }
    }

    res.json({ ok: true, apply: true, updated, totalPlanned: changes.length });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};
