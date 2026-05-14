// FILE: web/app/api/topics/search/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const url = new URL("/api/topics/search", backend);

  // Gelen arama terimlerini (?q=kalp&limit=5 vb.) backend'e aktar
  req.nextUrl.searchParams.forEach((v, k) => {
    url.searchParams.set(k, v);
  });

  try {
    const r = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    // Backend hata dönerse kasten catch bloğuna atla
    if (!r.ok) {
        throw new Error(`Backend arama yanıtı vermedi: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (err: any) {
    // 🚨 BACKEND ULAŞILAMAZSA: ARAMA ÇUBUĞUNU ÇÖKERTME, MOCK SONUÇ DÖN!
    const query = req.nextUrl.searchParams.get("q") || "aranan kelime";
    console.warn(`Backend'e ulaşılamadı. Arama Sonarı (Search: ${query}) yedek motoru devrede.`);
    
    return NextResponse.json({
      ok: true,
      mock: true,
      query: query,
      total: 2,
      items: [
        {
          id: "mock-search-1",
          title: `"${query}" ile ilgili Yedek Sonuç 1`,
          slug: "mock-sonuc-1",
          section: "Kardiyoloji",
          snippet: "Backend kapalıyken bile arama sisteminiz çökmüyor. Çelik Kubbe devrede!"
        },
        {
          id: "mock-search-2",
          title: `"${query}" ile ilgili Yedek Sonuç 2`,
          slug: "mock-sonuc-2",
          section: "Genel",
          snippet: "Arama (Search) bileşenlerinizin arayüz tasarımını (UI) test edebilirsiniz."
        }
      ]
    }, { status: 200 });
  }
}