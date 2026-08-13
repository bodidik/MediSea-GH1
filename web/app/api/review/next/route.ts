// FILE: web/app/api/review/next/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  try {
    const inUrl = new URL(req.url);
    const backendUrl = new URL("/api/review/next", backend);
    
    // proxy edilen query’ler
    for (const [k, v] of inUrl.searchParams.entries()) {
      backendUrl.searchParams.set(k, v);
    }
    backendUrl.searchParams.set("externalId", externalId);

    const r = await fetch(backendUrl.toString(), { cache: "no-store" });

    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: ÇÖKME, KULLANICIYA SAHTE BİR TEKRAR SORUSU VER!
    console.warn("Backend'e ulaşılamadı. Review Next yedek motoru devrede.");
    
    // Uydurma bir tekrar SORUSU dönülüyordu ("C seçeneği doğrudur") ve yanıt
    // ok:true diyordu. Tıbbi bir sınav hazırlık ürününde sahte soru ve sahte
    // doğru cevap göstermek, en kötü türden yanlış bilgi: kullanıcı onu
    // çalışılmış sayar. Arka uç canlıda çalışmadığı için bu hâl kalıcıydı.
    return NextResponse.json(
      { ok: false, reason: "backend-unavailable", question: null },
      { status: 503 }
    );
  }
}