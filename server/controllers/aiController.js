// FILE: server/controllers/aiController.js
// MediSea AI asistanı — SADECE site içeriğine dayalı, kredi (token) sınırlı soru-cevap.
import Anthropic from "@anthropic-ai/sdk";
import User from "../models/User.js";

const AI_MODEL = process.env.AI_MODEL || "claude-sonnet-5";
const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 1024);

// Plan/misafir durumuna göre kota (soru hakkı) ve yenilenme periyodu.
const GUN = 24 * 60 * 60 * 1000;
function kotaHesapla(user, isGuest) {
  if (isGuest) return { amount: 3, periodMs: GUN }; // misafir: günde 3
  if (user.plan === "premium" || user.plan === "pro")
    return { amount: 100, periodMs: 30 * GUN }; // premium: ayda 100
  return { amount: 20, periodMs: 30 * GUN }; // ücretsiz üye: ayda 20
}

const SISTEM_TALIMATI = `Sen "MediSea Tıp" adlı YDUS (tıpta uzmanlık) sınav hazırlık platformunun yardımcı asistanısın.

KURALLAR:
- SADECE aşağıda "=== KAYNAK ===" başlığı altında verilen metne dayanarak cevap ver.
- Kaynak metinde bulunmayan bir bilgi sorulursa uydurma; "Bu bilgi bu konunun içeriğinde yer almıyor." de.
- Cevaplarını Türkçe, net ve öğrenciye yönelik ver; kaynaktaki terminolojiyi koru.
- Kişiye özel tıbbi tavsiye/tanı verme; içerik yalnızca sınav hazırlık amaçlıdır.
- Kısa ve doğrudan ol; gerektiğinde madde işaretleri kullan.`;

export async function askQuestion(req, res) {
  try {
    const b = (req.body && typeof req.body === "object") ? req.body : {};
    const externalId = String(b.externalId || "").trim();
    const isGuest = Boolean(b.isGuest);
    const question = String(b.question || "").trim();
    const context = String(b.context || "").trim();
    const baslik = String(b.baslik || "").trim();

    if (!externalId) return res.status(400).json({ ok: false, error: "externalId gerekli" });
    if (!question) return res.status(400).json({ ok: false, error: "soru bos olamaz" });
    if (question.length > 800) return res.status(400).json({ ok: false, error: "soru cok uzun" });
    if (!context) return res.status(400).json({ ok: false, error: "konu icerigi bulunamadi" });

    // Kullanıcıyı bul/oluştur (mk_uid veya misafir anon id)
    let user = await User.findOne({ externalId });
    if (!user) {
      user = await User.create({ externalId, guest: isGuest, name: isGuest ? "Misafir" : "Anon" });
    }

    // Kotayı gerekiyorsa yenile
    const kota = kotaHesapla(user, isGuest);
    const now = Date.now();
    if (
      user.aiCredits == null ||
      !user.aiCreditsResetAt ||
      now >= new Date(user.aiCreditsResetAt).getTime()
    ) {
      user.aiCredits = kota.amount;
      user.aiCreditsResetAt = new Date(now + kota.periodMs);
    }

    // Kredi yoksa 402
    if (user.aiCredits <= 0) {
      await user.save();
      return res.status(402).json({
        ok: false,
        error: "kota_bitti",
        creditsLeft: 0,
        resetAt: user.aiCreditsResetAt,
        message: isGuest
          ? "Misafir soru hakkınız doldu. Üye olarak daha fazla soru sorabilirsiniz."
          : "Soru hakkınız doldu. Kotanız yenilenme tarihinde tekrar dolacak.",
      });
    }

    // API anahtarı yoksa krediyi HARCAMADAN net hata dön
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        ok: false,
        error: "ai_yapilandirilmadi",
        message: "AI asistanı henüz yapılandırılmadı (ANTHROPIC_API_KEY eksik).",
      });
    }

    // Anthropic çağrısı
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let answer = "";
    try {
      const msg = await client.messages.create({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
        system: `${SISTEM_TALIMATI}\n\n=== KAYNAK (Konu: ${baslik || "—"}) ===\n${context}`,
        messages: [{ role: "user", content: question }],
      });
      answer = (msg.content || [])
        .map((blk) => (blk.type === "text" ? blk.text : ""))
        .join("")
        .trim();
    } catch (aiErr) {
      console.error("Anthropic hata:", aiErr?.message || aiErr);
      // AI başarısızsa kredi harcanmaz
      return res.status(502).json({ ok: false, error: "ai_hata", message: "AI yanıtı alınamadı, tekrar deneyin." });
    }

    if (!answer) {
      return res.status(502).json({ ok: false, error: "bos_yanit", message: "AI boş yanıt döndü." });
    }

    // Başarılı → 1 kredi düş
    user.aiCredits -= 1;
    await user.save();

    return res.json({
      ok: true,
      answer,
      creditsLeft: user.aiCredits,
      resetAt: user.aiCreditsResetAt,
    });
  } catch (err) {
    console.error("askQuestion hata:", err);
    return res.status(500).json({ ok: false, error: "sunucu_hatasi" });
  }
}

// GET /api/ai/credits — kalan hakkı göstermek için (opsiyonel UI amaçlı)
export async function getCredits(req, res) {
  try {
    const externalId = String(req.query.externalId || "").trim();
    const isGuest = String(req.query.isGuest || "") === "1";
    if (!externalId) return res.status(400).json({ ok: false, error: "externalId gerekli" });

    let user = await User.findOne({ externalId });
    const kota = kotaHesapla(user || { plan: "free" }, isGuest);
    if (!user) {
      return res.json({ ok: true, creditsLeft: kota.amount, max: kota.amount, resetAt: null });
    }
    const now = Date.now();
    let creditsLeft = user.aiCredits;
    if (creditsLeft == null || !user.aiCreditsResetAt || now >= new Date(user.aiCreditsResetAt).getTime()) {
      creditsLeft = kota.amount;
    }
    return res.json({ ok: true, creditsLeft, max: kota.amount, resetAt: user.aiCreditsResetAt });
  } catch (err) {
    console.error("getCredits hata:", err);
    return res.status(500).json({ ok: false, error: "sunucu_hatasi" });
  }
}
