// C:\Users\hucig\Medknowledge\web\app\api\sections\route.ts
import { backendBase } from "@/lib/backend";
import { NextResponse } from "next/server";

// Backend çıktısını (all/premium/totals) frontend'in beklediği rows yapısına çevirir.
export async function GET(_req: Request) {
  const backend = backendBase();

  try {
    // Asıl endpoint
    const res = await fetch(`${backend}/api/sections/with-count`, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Backend yanıt vermedi: ${res.status}`);
    }

    const data = await res.json();

    // data.all -> [{ section, count }]
    const rows = Array.isArray(data?.all)
      ? data.all.map((it: any) => ({
          section: String(it.section || "-"),
          topics: 0,
          boardQuestions: 0,
          cases: 0,
          videos: 0,
          notes: 0,
          total: Number(it.count || 0),
        }))
      : [];

    const payload = {
      ok: true,
      rows,
      lastUpdatedISO: new Date().toISOString(),
      // İstersen totals'ı da ileri kullanımlar için geçiriyoruz
      _raw: { totals: data?.totals ?? null, premium: data?.premium ?? null },
    };

    return NextResponse.json(payload, { status: 200 });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: SİSTEMİ ÇÖKERTME, MOCK BRANŞ VERİSİ DÖN!
    // Bu sayede Strateji Haritası (Strategy Map) boş veya kırmızı görünmek yerine sahte verilerle çalışmaya devam eder.
    console.warn("Backend'e ulaşılamadı. Sections (Branşlar) yedek motoru devrede.");

    return NextResponse.json({
      ok: true,
      mock: true,
      rows: [
        { section: "Gastroenteroloji", topics: 12, boardQuestions: 50, cases: 5, videos: 3, notes: 10, total: 80 },
        { section: "Hematoloji", topics: 8, boardQuestions: 40, cases: 3, videos: 2, notes: 5, total: 58 },
        { section: "Kardiyoloji", topics: 15, boardQuestions: 60, cases: 8, videos: 4, notes: 12, total: 99 },
        { section: "Nefroloji", topics: 10, boardQuestions: 45, cases: 4, videos: 2, notes: 8, total: 69 }
      ],
      lastUpdatedISO: new Date().toISOString(),
      _raw: { totals: null, premium: null }
    }, { status: 200 });
  }
}