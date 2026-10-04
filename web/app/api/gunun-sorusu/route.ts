import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { checkTopicAccess } from "@/lib/access";

/**
 * GÜNÜN SORUSU — panoda tek soru, gün başına sabit (Türkiye günü).
 *
 * Pano ISR ile bir saat önbellekte duruyor; tarihe bağlı seçim orada yapılsa
 * gün değişse de eski soru kalırdı. Bu yüzden istemci bu uçtan ister.
 *
 * İçerik PREMIUM: soru, kendi konusunun erişim kapısından (`checkTopicAccess`)
 * geçmeden döndürülmez — aksi hâlde ücretli içerik herkese açık bir uçtan
 * sızardı. Kapıya takılan kullanıcı `{ soru: null }` alır, kart çizilmez.
 *
 * Seçim deterministik: aynı gün herkese aynı soru (tartışılabilir, paylaşılabilir).
 * Dosyalar sıralı okunur ki dizin sırası platforma göre değişmesin.
 */
export const dynamic = "force-dynamic";

const GECERLI = /^[a-z0-9-]+$/;

function turkiyeGunu(): string {
  const d = new Date(Date.now() + 3 * 3600_000);
  return d.toISOString().slice(0, 10);
}

function ozet(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

type Aday = { branch: string; dosya: string; i: number };

function adaylar(kok: string): Aday[] {
  const out: Aday[] = [];
  for (const branch of fs.readdirSync(kok).sort()) {
    if (!GECERLI.test(branch)) continue;
    let dosyalar: string[] = [];
    try { dosyalar = fs.readdirSync(path.join(kok, branch)).filter((f) => /-quiz-\d+\.json$/.test(f)).sort(); } catch { continue; }
    for (const dosya of dosyalar) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(kok, branch, dosya), "utf-8"));
        (d.sorular ?? []).forEach((s: Record<string, unknown>, i: number) => {
          if (typeof s.metin === "string" && s.secenekler && !Array.isArray(s.secenekler) && typeof s.dogru === "string" && typeof s.aciklama_kisa === "string") {
            out.push({ branch, dosya, i });
          }
        });
      } catch {}
    }
  }
  return out;
}

// Aday listesi örnek başına bir kez çıkarılır: her istekte 67 quiz dosyasını
// (~5 MB) ayrıştırmak gereksiz. İçerik dağıtımla değişir, örnek de yeniden başlar.
let onbellek: Aday[] | null = null;

export async function GET() {
  const kok = path.join(process.cwd(), "content", "premium", "ydus", "quizzes");
  const liste = (onbellek ??= adaylar(kok));
  if (!liste.length) return NextResponse.json({ soru: null });

  const gun = turkiyeGunu();
  const a = liste[ozet(gun) % liste.length];
  const setId = a.dosya.replace(/\.json$/, "");
  const konu = setId.replace(/-quiz-\d+$/, "");

  const erisim = await checkTopicAccess(konu);
  if (erisim !== "ok") return NextResponse.json({ soru: null, erisim }, { headers: { "Cache-Control": "no-store" } });

  const d = JSON.parse(fs.readFileSync(path.join(kok, a.branch, a.dosya), "utf-8"));
  const s = d.sorular[a.i];
  return NextResponse.json(
    {
      gun,
      soru: {
        metin: s.metin,
        secenekler: s.secenekler,
        dogru: s.dogru,
        aciklama: s.aciklama_kisa,
      },
      set: { branch: a.branch, id: setId, baslik: d.baslik ?? d.meta?.baslik ?? konu, sira: a.i + 1 },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
