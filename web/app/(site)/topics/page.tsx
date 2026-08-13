import fs from "fs";
import path from "path";
import { getSpecialty, SPECIALTIES } from "@/app/lib/specialties";
import basliklar from "@/content/baslik-index.json";
import KutuphaneArama, { type KonuKaydi, type BransKarti } from "./KutuphaneArama";

/**
 * Kütüphane girişi.
 *
 * Eski sürüm bir istemci bileşeniydi ve konuları Express arka ucundaki arama
 * ucundan çekiyordu. Arka uç canlıda hiç çalışmıyor; uç da hata döndürmek
 * yerine UYDURMA sonuç üretiyordu. Sonuç: 411 konuluk kütüphanenin giriş
 * sayfasında ziyaretçiye iki sahte kayıt gösteriliyordu
 * ("ARANAN KELİME İLE İLGİLİ YEDEK SONUÇ 1") ve gerçek konuların hiçbirine
 * buradan ulaşılamıyordu.
 *
 * Artık sayfa sunucuda üretiliyor ve veriyi diğer bütün sayfalarla aynı
 * kaynaktan — dosya sisteminden — alıyor. Arama tarayıcıda çalışıyor:
 * ağ isteği yok, arka uç bağımlılığı yok.
 */

export const revalidate = 3600;

function konulariHazirla(): KonuKaydi[] {
  const dizin = basliklar as Record<string, string>;
  return Object.entries(dizin)
    .map(([anahtar, baslik]) => {
      const [brans, slug] = anahtar.split("/");
      return { brans, slug, baslik };
    })
    .filter((k) => k.brans && k.slug);
}

function bransSayilari(): Record<string, number> {
  const sayac: Record<string, number> = {};
  for (const anahtar of Object.keys(basliklar as Record<string, string>)) {
    const brans = anahtar.split("/")[0];
    sayac[brans] = (sayac[brans] || 0) + 1;
  }
  return sayac;
}

/** İçerik klasöründe karşılığı olan branşlar — SPECIALTIES'te olup içeriği olmayan gösterilmez. */
function icerikliBranslar(): string[] {
  try {
    const kok = path.join(process.cwd(), "content", "canonical");
    return fs
      .readdirSync(kok, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

export default function KutuphaneSayfasi() {
  const konular = konulariHazirla();
  const sayac = bransSayilari();
  const mevcut = new Set(icerikliBranslar());

  // Sıra SPECIALTIES'ten geliyor (ana sayfayla aynı düzen); içeriği olmayan
  // branş kartı basılmıyor, boş sayfaya götüren kart göstermenin anlamı yok.
  const branslar: BransKarti[] = SPECIALTIES.filter((s) => mevcut.has(s.slug) && (sayac[s.slug] ?? 0) > 0)
    .map((s) => ({
      slug: s.slug,
      baslik: s.title,
      aciklama: s.desc,
      ikon: s.icon,
      konuSayisi: sayac[s.slug] ?? 0,
    }));

  // SPECIALTIES'te tanımlı olmayan ama içeriği bulunan branşlar da kaybolmasın.
  for (const brans of mevcut) {
    if (branslar.some((b) => b.slug === brans)) continue;
    const n = sayac[brans] ?? 0;
    if (n === 0) continue;
    branslar.push({
      slug: brans,
      baslik: getSpecialty(brans)?.title || brans.replace(/-/g, " "),
      aciklama: getSpecialty(brans)?.desc || "",
      ikon: getSpecialty(brans)?.icon || "📁",
      konuSayisi: n,
    });
  }

  return (
    <div className="min-h-screen bg-white px-5 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 border-b-4 border-blue-900/10 pb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-blue-900" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-900/40">
              MediSea Kütüphane
            </span>
          </div>
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-blue-950 sm:text-6xl">
            Konu <span className="not-italic text-slate-300">Anlatımları</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-slate-500">
            {branslar.length} branşta {konular.length} başlık. Tamamı ücretsiz,
            kayıt gerekmez.
          </p>
        </div>

        <KutuphaneArama konular={konular} branslar={branslar} />

      </div>
    </div>
  );
}
