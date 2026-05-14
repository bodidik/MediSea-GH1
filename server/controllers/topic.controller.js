import Topic from "../models/topic.js";

/* ====== Yardımcılar ====== */

// TR uyumlu temel slugify
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

// Aynı slug varsa -2, -3 ... ile benzersizleştir
async function ensureUniqueSlug(seed) {
  const base = seed && seed.trim() ? seed.trim() : "topic";
  let candidate = base;
  let n = 1;
  /* eslint-disable no-await-in-loop */
  while (await Topic.exists({ slug: candidate })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  /* eslint-enable no-await-in-loop */
  return candidate;
}

// ---- Normalizasyon katmanı (kalıcı şema ile geri uyum) ----
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

function normalizeSections(doc) {
  const blocks = Array.isArray(doc.sections) ? doc.sections : [];
  if (blocks.length > 0) {
    return blocks.map((b) => ({
      title: String(b?.title || "").trim() || "Bölüm",
      html: String(b?.html || ""),
      visibility: ["V","M","P"].includes(String(b?.visibility)) ? b.visibility : "V",
    }));
  }
  // Geri uyumluluk: eski content varsa tek blok döndür
  if (doc.content && String(doc.content).trim().length > 0) {
    return [{ title: "Özet", html: String(doc.content), visibility: "V" }];
  }
  return [];
}

function pickTopicForOutput(doc) {
  // Lean doc (plain object) bekliyoruz
  const out = { ...doc };
  out.sections = normalizeSections(doc);
  out.references = normalizeReferences(doc.references);
  return out;
}

/* ====== Controller’lar ====== */

/** GET /api/topics
 * Query:
 *  - section: nefroloji|gastro|… (opsiyonel)
 *  - lang: TR|EN (ops.)
 *  - q: başlıkta arama (ops.)
 *  - page (default 1), limit (default 20, max 100)
 *  - sort: "title" | "-title" | "updatedAt" | "-updatedAt" | "createdAt" | "-createdAt"
 */
export async function list(req, res) {
  try {
    const { section, q, sort, lang } = req.query;
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const filter = {};

    if (section) filter.section = String(section).toLowerCase();
    if (lang)    filter.lang = String(lang).toUpperCase();
    if (q)       filter.title = { $regex: String(q), $options: "i" };

    let sortSpec = { updatedAt: -1 };
    if (typeof sort === "string" && sort.length) {
      const dir = sort.startsWith("-") ? -1 : 1;
      const key = sort.replace(/^-/, "");
      if (["title", "updatedAt", "createdAt", "section"].includes(key)) {
        sortSpec = { [key]: dir };
      }
    }

    const [raw, total] = await Promise.all([
      Topic.find(filter)
        .select("-__v")
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Topic.countDocuments(filter),
    ]);

    const items = raw.map(pickTopicForOutput);
    res.json({ ok: true, page, limit, total, items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/** GET /api/topics/:slug */
export async function detail(req, res) {
  try {
    const raw = req.params.slug ?? "";
    const key = decodeURIComponent(String(raw || "")).trim();

    if (!key) return res.status(400).json({ ok: false, error: "bad_request" });

    // 1) Önce exact slug
    let doc = await Topic.findOne({ slug: key }).lean();

    // 2) Exact bulunamazsa: case-insensitive slug (fallback)
    // (DB'de slug casing/normalize kaymışsa diye)
    if (!doc) {
      doc = await Topic.findOne({ slug: { $regex: `^${escapeRegex(key)}$`, $options: "i" } }).lean();
    }

    // 3) Hâlâ yoksa: ObjectId ise _id fallback
    if (!doc) {
      const mongoose = (await import("mongoose")).default;
      if (mongoose.isValidObjectId(key)) {
        doc = await Topic.findById(key).lean();
      }
    }

    if (!doc) return res.status(404).json({ ok: false, error: "not_found" });

    const item = pickTopicForOutput(doc);
    res.json({ ok: true, item });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

// küçük helper: regex escape
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** POST /api/topics */
export async function create(req, res) {
  try {
    const body = req.body || {};
    const title = String(body.title || "").trim();
    const section = String(body.section || "").trim().toLowerCase();

    if (!title)   return res.status(400).json({ ok: false, error: "title required" });
    if (!section) return res.status(400).json({ ok: false, error: "section required" });

    let slug = String(body.slug || "").trim();
    if (!slug) slug = baseSlugify(title);
    slug = await ensureUniqueSlug(slug);

    // Yeni alanlar
    const sections = normalizeSections({ sections: body.sections, content: body.content });
    const references = normalizeReferences(body.references);

    let subtopics = Array.isArray(body.subtopics) ? body.subtopics : [];
    subtopics = subtopics.map((st) => ({
      title: String(st?.title || "").trim(),
      slug:  String(st?.slug || "").trim() || baseSlugify(String(st?.title || "")),
      content: String(st?.content || ""),
    }));

    const doc = await Topic.create({
      title,
      slug,
      section,
      // Eski content alanı (geri uyum için saklıyoruz)
      content: String(body.content || ""),
      // Yeni alanlar
      sections,
      references,
      // Diğerleri
      subtopics,
      relatedTopics: Array.isArray(body.relatedTopics) ? body.relatedTopics.map(String) : [],
      relatedCases:  Array.isArray(body.relatedCases)  ? body.relatedCases.map(String)  : [],
      tags:          Array.isArray(body.tags) ? body.tags.map(String) : [],
      lang:          (body.lang || "TR").toUpperCase() === "EN" ? "EN" : "TR",
      summary:       String(body.summary || ""),
    });

    res.status(201).json({ ok: true, item: pickTopicForOutput(doc.toObject()) });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

/** PUT /api/topics/:slug */
export async function update(req, res) {
  try {
    const currentSlug = String(req.params.slug || "").trim();
    const body = req.body || {};

    const doc = await Topic.findOne({ slug: currentSlug });
    if (!doc) return res.status(404).json({ ok: false, error: "not_found" });

    if (body.title !== undefined)   doc.title = String(body.title || "").trim();
    if (body.section !== undefined) doc.section = String(body.section || "").trim().toLowerCase();
    if (body.content !== undefined) doc.content = String(body.content || "");
    if (body.summary !== undefined) doc.summary = String(body.summary || "");
    if (body.lang !== undefined)    doc.lang = String(body.lang).toUpperCase() === "EN" ? "EN" : "TR";
    if (body.tags !== undefined)    doc.tags = Array.isArray(body.tags) ? body.tags.map(String) : [];

    if (body.sections !== undefined) {
      doc.sections = normalizeSections({ sections: body.sections, content: body.content ?? doc.content });
    }

    if (body.references !== undefined) {
      doc.references = normalizeReferences(body.references);
    }

    if (body.subtopics !== undefined) {
      const arr = Array.isArray(body.subtopics) ? body.subtopics : [];
      doc.subtopics = arr.map((st) => ({
        title: String(st?.title || "").trim(),
        slug:  String(st?.slug || "").trim() || baseSlugify(String(st?.title || "")),
        content: String(st?.content || ""),
      }));
    }
    if (body.relatedTopics !== undefined) {
      doc.relatedTopics = Array.isArray(body.relatedTopics) ? body.relatedTopics.map(String) : [];
    }
    if (body.relatedCases !== undefined) {
      doc.relatedCases = Array.isArray(body.relatedCases) ? body.relatedCases.map(String) : [];
    }
    if (body.slug !== undefined) {
      const wanted = String(body.slug || "").trim() || baseSlugify(doc.title || "");
      if (wanted !== doc.slug) {
        doc.slug = await ensureUniqueSlug(wanted);
      }
    }

    await doc.save();
    res.json({ ok: true, item: pickTopicForOutput(doc.toObject()) });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

/** DELETE /api/topics/:slug */
export async function remove(req, res) {
  try {
    const slug = String(req.params.slug || "").trim();
    const out = await Topic.findOneAndDelete({ slug });
    if (!out) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, removed: slug });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/** GET /api/topics/search
 * Metin araması (title+content text index’i kullanır)
 * Query: q=..., section=..., limit, page
 */
export async function search(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ ok: false, error: "q required" });

    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const section = req.query.section ? String(req.query.section).toLowerCase() : null;

    const filter = { $text: { $search: q } };
    if (section) filter.section = section;

    const [raw, total] = await Promise.all([
      Topic.find(filter, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" }, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Topic.countDocuments(filter),
    ]);

    const items = raw.map(pickTopicForOutput);
    res.json({ ok: true, q, page, limit, total, items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/** GET /api/topics/:slug/similar
 * Benzer konular (tek sürüm!)
 * Query (ops.): limit=10 (1..20), tagWeight=2, sectionBias=1, sameSection=1
 */
export async function similar(req, res) {
  try {
    const slug = String(req.params.slug || "").trim();

    const cur = await Topic.findOne({ slug }).lean();
    if (!cur) return res.status(404).json({ ok: false, error: "not_found" });

    const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit || "10"), 10)));
    const sectionBias = Number.isFinite(Number(req.query.sectionBias))
      ? Number(req.query.sectionBias) : 1;   // aynı bölüm bonusu
    const tagWeight = Number.isFinite(Number(req.query.tagWeight))
      ? Number(req.query.tagWeight) : 2;     // tag eşleşmesi ağırlığı
    const sameSection = String(req.query.sameSection ?? "1") === "1"; // havuzu aynı bölümle sınırla

    const trNormalize = (s = "") =>
      String(s).normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i").replace(/İ/g, "I")
        .replace(/ş/g, "s").replace(/Ş/g, "S")
        .replace(/ğ/g, "g").replace(/Ğ/g, "G")
        .replace(/ü/g, "u").replace(/Ü/g, "U")
        .replace(/ö/g, "o").replace(/Ö/g, "O")
        .replace(/ç/g, "c").replace(/Ç/g, "C")
        .toLowerCase();

    const STOP = new Set(["ve","ile","veya","ya","de","da","bir","iki","the","of","in","to","a","an","for","on","at","la","le"]);

    const tokenize = (s = "") =>
      trNormalize(s).split(/\W+/).filter(w => w && w.length >= 3 && !STOP.has(w));

    const tagsOf = (arr) =>
      (Array.isArray(arr) ? arr : []).map(x => trNormalize(String(x))).filter(Boolean);

    const poolFilter = {
      slug: { $ne: slug },
      ...(sameSection && cur.section ? { section: cur.section } : {})
    };

    const pool = await Topic.find(poolFilter)
      .select("slug title section tags summary updatedAt")
      .limit(300)
      .lean();

    const curTitleTokens = new Set(tokenize(cur.title || ""));
    const curTagTokens   = new Set(tagsOf(cur.tags));

    const scored = pool.map(t => {
      const tTitleTokens = new Set(tokenize(t.title || ""));
      const tTagTokens   = new Set(tagsOf(t.tags));

      let score = 0;
      for (const w of tTitleTokens) if (curTitleTokens.has(w)) score += 1;
      for (const w of tTagTokens)   if (curTagTokens.has(w))   score += tagWeight;
      if (cur.section && t.section === cur.section) score += sectionBias;

      return { ...t, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.updatedAt) - new Date(a.updatedAt)) 
    .slice(0, limit);

    if (scored.length === 0) {
      const fallback = await Topic.find({
        slug: { $ne: slug },
        ...(cur.section ? { section: cur.section } : {})
      })
      .select("slug title section summary updatedAt")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
      return res.json({ ok: true, items: fallback });
    }

    res.json({ ok: true, items: scored });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
