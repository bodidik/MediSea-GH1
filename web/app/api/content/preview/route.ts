// FILE: web/app/api/content/preview/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const ids = req.nextUrl.searchParams.getAll("ids"); // çoklu ids desteği (paslı karakterler temizlendi)
  const url = new URL("/api/content/preview", backend);
  
  if (ids.length) {
    for (const v of ids) {
      // virgüllüyse bölmeden olduğu gibi geçelim (backend bölüyor)
      url.searchParams.append("ids", v);
    }
  }

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    if (!r.ok) {
      throw new Error(`Backend önizleme yanıtı vermedi: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: LİSTELERİ ÇÖKERTME, MOCK ÖNİZLEME DÖN!
    console.warn("Backend'e ulaşılamadı. Content Preview (Çoklu) yedek motoru devrede.");
    
    // Gelen ID'lere göre sahte önizleme kartları oluşturuyoruz
    const mockPreviews = ids.length > 0 ? ids.map((id, index) => ({
      id: id,
      title: `[MOCK] İçerik Önizlemesi #${index + 1}`,
      snippet: "Arka plandaki veritabanı kapalıyken bile arayüzünüzün çökmemesi için üretilen sahte (mock) metin. Çelik Kubbe devrede!",
      type: "article"
    })) : [];

    return NextResponse.json({
      ok: true,
      mock: true,
      previews: mockPreviews
    }, { status: 200 });
  }
}