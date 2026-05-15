import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 120 });

export async function translateText(req, res) {
  try {
    const { text, targetLang } = req.body || {};
    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing text or targetLang" });
    }

    const key = `${targetLang}:${text}`;
    if (cache.has(key)) {
      return res.json({ translated: cache.get(key), cached: true });
    }

    // Dummy çeviri (ileride gerçek API ile değiştirilebilir)
    let translated;
    if (targetLang === "en") {
      translated = "EN: " + text;   // TR -> EN varsayımı
    } else if (targetLang === "tr") {
      translated = "TR: " + text;   // EN -> TR varsayımı
    } else {
      translated = text;            // desteklenmeyen dil -> aynen döndür
    }

    cache.set(key, translated);
    return res.json({ translated, cached: false });
  } catch (err) {
    console.error("translate error", err);
    return res.status(500).json({ error: "Translate failed" });
  }
}