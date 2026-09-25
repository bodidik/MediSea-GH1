/**
 * KONU KAYNAKLARI — `meta.kaynaklar`
 *
 * Uzman okuyucunun ilk sorusu "bu hangi kılavuza göre?" ve 515 konunun
 * hiçbirinde yapılandırılmış bir cevap yoktu (26 Eyl 2026 ölçümü: kaynak
 * bölümü taşıyan konu 0, metinde yıllı kılavuz adı geçen 40).
 *
 * Şema (içerik dosyasında, hepsi isteğe bağlı ama `ad` şart):
 *
 *   "meta": { "kaynaklar": [
 *     { "ad": "2023 ESC Guidelines for the management of acute coronary syndromes",
 *       "yil": 2023, "url": "https://doi.org/10.1093/eurheartj/ehad191" }
 *   ] }
 *
 * Sayfa ve JSON-LD (`citation`) AYNI normalleştirmeden okur — iki ayrı
 * okuma "iki gerçeklik" sınıfını açardı.
 *
 * Bozuk kayıt sayfayı düşürmez, sessizce de yutulmaz: `ad`ı olmayan kayıt
 * atlanır; `url` yalnızca https ise bağlantı olur (javascript: ya da http
 * adresi metin olarak kalır, bağlantıya dönüşmez).
 */
export type Kaynak = { ad: string; yil?: string; url?: string };

export function kaynaklariAl(meta: unknown): Kaynak[] {
  const ham = (meta as { kaynaklar?: unknown } | null | undefined)?.kaynaklar;
  if (!Array.isArray(ham)) return [];
  const cikti: Kaynak[] = [];
  for (const k of ham) {
    if (!k || typeof k !== "object") continue;
    const { ad, yil, url } = k as Record<string, unknown>;
    if (typeof ad !== "string" || !ad.trim()) continue;
    const yilYazi =
      typeof yil === "number" || (typeof yil === "string" && yil.trim())
        ? String(yil).trim()
        : undefined;
    const guvenliUrl =
      typeof url === "string" && /^https:\/\/[^\s]+$/.test(url.trim()) ? url.trim() : undefined;
    cikti.push({ ad: ad.trim(), yil: yilYazi, url: guvenliUrl });
  }
  return cikti;
}
