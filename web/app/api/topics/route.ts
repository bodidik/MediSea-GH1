import { NextRequest, NextResponse } from "next/server";
import { yoneticiMi, yetkisizYanit } from "@/lib/yonetici";
import { isoTarih } from "@/lib/jsonld";
import { aramaEslesir } from "@/app/lib/arama";
import fs from "fs";
import path from "path";

const KANONIK = () => path.join(process.cwd(), "content", "canonical");

/**
 * KONU LİSTESİ — içerik düzenleyicisinin liste kaynağı.
 *
 * Bu uç YOKTU ve eksikliği sessizdi: `app/admin/content/topics` önce
 * `/api/topics/search`i deniyor (Express arka ucu canlıda hiç çalışmadığı
 * için **503**), sonra buraya düşüyordu — ve bu dosya yalnızca `PUT` dışa
 * aktardığı için Next **405** döndürüyordu. Ölçüldü (canlı):
 *
 *     GET /api/topics         -> 405
 *     GET /api/topics/search  -> 503
 *
 * Yani düzenleyicinin listesinin çalışan hiçbir kaynağı yoktu. Üç kapı da
 * göremez: kod geçerli, tipler doğru, derleme temiz — kusur yalnızca
 * çalışma zamanında.
 *
 * Yanıt şekli UYDURULMADI, çağıranın okuduğu alanlardan alındı:
 * `{ items: [{ slug, title, section, lang, summary, updatedAt }] }`.
 *
 * ⚠ Aşağıdaki `PUT` ÖLÜ: bu rota dinamik segment taşımıyor, yani `slug`
 * her zaman `undefined` ve dosya hiçbir zaman bulunamıyor (CLAUDE.md'de
 * kayıtlı). Canlı yazma ucu `/api/topics/[slug]`.
 */
export async function GET(req: NextRequest) {
  if (!(await yoneticiMi())) return yetkisizYanit();

  try {
    const sp = req.nextUrl.searchParams;
    const q = (sp.get("q") ?? "").trim();
    const brans = (sp.get("section") ?? "").trim().toLowerCase();
    const lang = (sp.get("lang") ?? "TR").toUpperCase();
    const limit = Math.min(Math.max(Number(sp.get("limit")) || 50, 1), 500);

    // İçerik tek dilli (TR). EN istenirse boş dönmek, TR kayıtları EN gibi
    // göstermekten dürüst.
    if (lang === "EN") return NextResponse.json({ ok: true, items: [] });

    const kok = KANONIK();
    const items: {
      slug: string; title: string; section: string;
      lang: string; summary: string; updatedAt: string;
    }[] = [];

    for (const b of fs.readdirSync(kok)) {
      const d = path.join(kok, b);
      if (!fs.statSync(d).isDirectory()) continue;
      if (brans && b.toLowerCase() !== brans) continue;
      for (const f of fs.readdirSync(d)) {
        if (!f.endsWith(".json")) continue;
        let v: any;
        try {
          v = JSON.parse(fs.readFileSync(path.join(d, f), "utf-8"));
        } catch {
          // Bozuk dosya listeyi düşürmemeli; düzenleyici tam da onu açmak ister.
          v = null;
        }
        const slug = f.replace(/\.json$/, "");
        const title = String(v?.title || slug);
        /**
         * Boş sorgu tuzağı: `aramaEslesir("")` BİLEREK `false` döner
         * (vurgulayan çağrılar için). Doğrudan süzgece konursa listeyi
         * tümden boşaltır — `/tools` bir tur böyle boş kalmıştı.
         */
        if (q && !(aramaEslesir(title, q) || aramaEslesir(slug, q))) continue;
        items.push({
          slug,
          title,
          section: b.toLowerCase(),
          lang: "TR",
          summary: String(v?.summary || ""),
          updatedAt: String(v?.meta?.updatedAt || ""),
        });
      }
    }

    // `-updatedAt`: yeniden eskiye. Ayrıştırılamayan tarih EN SONA —
    // uydurma bir sıra yerine bilinmeyeni sona koymak dürüst.
    const zaman = (s: string) => {
      const iso = isoTarih(s);
      return iso ? Date.parse(iso) : -Infinity;
    };
    const sirala = (sp.get("sort") ?? "-updatedAt").trim();
    items.sort((a, b) =>
      sirala === "updatedAt"
        ? zaman(a.updatedAt) - zaman(b.updatedAt)
        : zaman(b.updatedAt) - zaman(a.updatedAt)
    );

    return NextResponse.json({ ok: true, items: items.slice(0, limit), toplam: items.length });
  } catch (e) {
    console.error("[api/topics] liste okunamadı:", e);
    return NextResponse.json({ ok: false, reason: "read" }, { status: 503 });
  }
}

// ÖLÜ — bkz. yukarıdaki uyarı. Canlı yazma ucu `/api/topics/[slug]`.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Aynı gerekçe: içerik dosyasına doğrudan yazan uç, yetki kontrolsüzdü.
  if (!(await yoneticiMi())) return yetkisizYanit();

  try {
    const { slug } = await params;
    const body = await req.json();
    
    // Canonical klasöründeki tüm branşları tarayıp dosyayı bulacağız
    const baseDir = path.join(process.cwd(), "content", "canonical");
    const branches = fs.readdirSync(baseDir);
    let foundPath = null;

    for (const branch of branches) {
      const checkPath = path.join(baseDir, branch, `${slug}.json`);
      if (fs.existsSync(checkPath)) {
        foundPath = checkPath;
        break;
      }
    }

    if (!foundPath) {
      return NextResponse.json({ ok: false, error: "Dosya bulunamadı" }, { status: 404 });
    }

    // 1. Mevcut dosyayı oku
    const existingData = JSON.parse(fs.readFileSync(foundPath, "utf-8"));

    // 2. Gelen verilerle güncelle (Özet veya Seksiyonlar)
    if (body.summary !== undefined) {
      existingData.summary = body.summary;
    }
    
    // Eğer bloklar güncelleniyorsa (JSON'daki heading/text yapısına geri çevirerek kaydediyoruz)
    if (body.sections !== undefined) {
      existingData.sections = body.sections.map((s: any) => ({
        heading: s.title,
        text: s.html,
        visibility: s.visibility || "V"
      }));
    }

    // Güncelleme tarihini at
    if (!existingData.meta) existingData.meta = {};
    existingData.meta.updatedAt = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

    // 3. Dosyaya geri yaz
    fs.writeFileSync(foundPath, JSON.stringify(existingData, null, 2), "utf-8");

    return NextResponse.json({ ok: true, message: "Başarıyla kaydedildi" });

  } catch (error: any) {
    console.error("Kayıt Hatası:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}