// C:\Users\hucig\Medknowledge\web\app\api\guidelines\route.ts
import { NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export const runtime = "nodejs";        // Node runtime
export const dynamic = "force-dynamic"; // no cache

export async function GET(req: Request) {
  const backend = backendBase();
  const { search } = new URL(req.url);

  // Kaptanın harika detayı: İstek asılı kalmasın diye 8 saniyelik zaman aşımı (timeout)
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${backend}/api/guidelines${search}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(t);

    // Backend hata döndürürse (404, 500 vb.) kasten catch'e düşürüyoruz
    if (!res.ok) {
      throw new Error(`Upstream error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (err: any) {
    clearTimeout(t);
    // 🚨 BACKEND ULAŞILAMAZSA VEYA 8 SANİYE AŞILARSA: SİSTEMİ ÇÖKERTME, MOCK KILAVUZ DÖN!
    console.warn("Backend'e ulaşılamadı veya zaman aşımına uğradı. Guidelines (Kılavuzlar) yedek motoru devrede.");
    
    return NextResponse.json({
      ok: true,
      mock: true,
      data: [
        {
          id: "mock-guide-1",
          title: "2026 Hipertansiyon Güncel Kılavuzu (Mock)",
          category: "Kardiyoloji",
          summary: "Bu kılavuz, backend sunucusu kapalıyken veya 8 saniyede yanıt veremediğinde arayüzün (UI) çökmemesi için Çelik Kubbe tarafından üretilmiştir.",
          date: new Date().toISOString()
        },
        {
          id: "mock-guide-2",
          title: "Akut Pankreatit Yaklaşımı (Mock)",
          category: "Gastroenteroloji",
          summary: "Arayüzdeki liste ve kart tasarımlarınızı test etmeye kesintisiz devam edebilirsiniz.",
          date: new Date().toISOString()
        }
      ]
    }, { status: 200 });
  }
}