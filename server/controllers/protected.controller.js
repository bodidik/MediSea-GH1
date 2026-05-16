import { sign, verify } from "../utils/signedToken.js";

// Tek kullanımlık kısa ömürlü token üret (30 sn)
export async function issueToken(req, res) {
  try {
    const { externalId, ip, ua } = req._fp || {};
    if (!externalId) return res.status(400).json({ ok: false, error: "externalId_required" });
    const token = sign({ sub: externalId, ip, ua }, 30);
    res.json({ ok: true, token, ttl: 30 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

// Token doğrula ve parça içerik döndür (örnek: bir soru gövdesi chunk)
export async function getChunk(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : (req.query.token || "");
    const payload = verify(token);
    if (!payload) return res.status(401).json({ ok: false, error: "invalid_or_expired_token" });

    // IP/UA bağlama
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.socket.remoteAddress || "0.0.0.0";
    const ua = req.headers["user-agent"] || "unknown";
    if (payload.ip !== ip || payload.ua !== ua) {
      return res.status(401).json({ ok: false, error: "fingerprint_mismatch" });
    }

    // Örnek "chunk" (normalde DB'den secure fetch)
    const chunkId = String(req.query.id || "sample");
    const content = `🔒 Protected content chunk: ${chunkId}\nBu metin client'ta canvas'a render edilecek, DOM'da text tutulmayacak.`;

    // Görünmez watermark için tohum bilgisi (sunucu tarafında üret)
    const watermark = { seed: payload.sub, ts: Date.now() };

    res.json({ ok: true, chunk: { id: chunkId, content }, watermark });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
