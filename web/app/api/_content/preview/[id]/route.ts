// FILE: web/app/api/content/preview/[id]/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const backend = backendBase();
  // Artık URL parçalamaya gerek yok, id doğrudan params içinden geliyor:
  const id = params.id; 
  const url = new URL(`/api/content/preview/${encodeURIComponent(id)}`, backend);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    if (!r.ok) {
      throw new Error(`Backend detaylı önizleme yanıtı vermedi: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: KARTLARI ÇÖKERTME, MOCK VERİ DÖN!
    console.warn(`Backend'e ulaşılamadı. Content Preview (ID: ${id}) yedek motoru devrede.`);
    
    return NextResponse.json({
      ok: true,
      mock: true,
      id: id,
      preview: {
        title: `⚓ Çelik Kubbe Önizlemesi (${id})`,
        type: "video",
        duration: 180, // 3 dakika
        thumbnail: "https://via.placeholder.com/300x150.png?text=Mock+Thumbnail",
        snippet: "Tasarım (UI) testlerinize kesintisiz devam edebilirsiniz. Bu veri mock (sahte) kaynaktan gelmektedir."
      }
    }, { status: 200 });
  }
}