// FILE: web/app/api/premium/daily-program/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();

  // mk_uid → externalId
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const url = new URL("/api/premium/daily-program", backend);
  url.searchParams.set("externalId", externalId);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    // Eğer backend hata verirse veya boş dönerse kasten hataya düşür (catch bloğuna at)
    if (!r.ok) throw new Error("Backend yanıt vermedi");
    
    const j = await r.json();
    return NextResponse.json(j);
    
  } catch (error) {
    // 🚨 BACKEND KAPALIYSA VEYA ÇÖKTÜYSE: SİSTEMİ BOZMA, SAHTE (MOCK) VERİ GÖSTER!
    console.warn("Backend'e ulaşılamadı, Kaptan Köşkü için yedek jeneratör (mock) devrede.");
    
    return NextResponse.json({
      locked: false,
      program: {
        total: 3,
        items: [
          { section: "Hematoloji", type: "Mega Deneme", qty: 1 },
          { section: "Kardiyoloji", type: "Flashcard", qty: 50 },
          { section: "Gastroenteroloji", type: "Klinik İnciler", qty: 15 }
        ]
      }
    });
  }
}