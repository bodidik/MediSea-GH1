// C:\Users\hucig\Medknowledge\web\app\api\questions\random\route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const url = new URL("/api/questions/random", backend);
  
  // URL'den gelen tüm parametreleri (örn: ?limit=5&module=kardiyoloji) backend'e aktar
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    // Backend hata döndürürse kasten catch bloğuna atla
    if (!r.ok) {
      throw new Error(`Backend yanıt vermedi veya hata döndü: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
    
  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: SİSTEMİ ÇÖKERTME, MOCK RASTGELE SORU DÖN!
    console.warn("Backend'e ulaşılamadı. Rastgele Soru (Random Question) yedek motoru devrede.");
    
    // Ön yüz kaç soru istiyor? (Varsayılan: 1)
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam && !isNaN(parseInt(limitParam)) ? parseInt(limitParam) : 1;

    // İstenen miktar kadar yedek (mock) soru üretelim
    const mockItems = Array.from({ length: limit }).map((_, i) => ({
      id: `mock-random-q${i + 1}`,
      text: `[MOCK] Backend kapalıyken üretilmiş rastgele test sorusu #${i + 1}. Mavi Vatan tasarımına en uygun renk hangisidir?`,
      options: ["A) Beyaz", "B) Lacivert", "C) Neon Mavi", "D) Kırmızı"],
      correctIndex: 2,
      explanation: "Çelik Kubbe devrede olduğu için Neon Mavi parlıyor! (Bu sahte bir yedek sorudur)."
    }));

    return NextResponse.json({
      ok: true,
      mock: true,
      total: limit,
      items: mockItems
    }, { status: 200 });
  }
}