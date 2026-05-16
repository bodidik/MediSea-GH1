// C:\Users\hucig\Medknowledge\web\app\api\questions\route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";
import { cookies } from "next/headers";

/**
 * Proxy: /api/questions  →  BACKEND:/api/questions
 * Örnek: /api/questions?module=nefroloji&limit=5
 */
export async function GET(req: NextRequest) {
  try {
    const backend = backendBase();
    const inUrl = new URL(req.url);
    // Backend URL’sini hazırlayalım
    const outUrl = new URL(backend + "/api/questions");
    
    // İzin verdiğimiz query parametreleri (gerektikçe ekleyebilirsin)
    const passthroughParams = [
      "module",       // bizim FE’de kullandığımız isim
      "section",      // BE "section" bekliyorsa
      "limit",
      "offset",
      "planLevel",    // V/M/P override için testlerde işe yarar
      "seed",         // randomizasyon varsa
      "lang",         // TR/EN
    ] as const;
    
    for (const key of passthroughParams) {
      const v = inUrl.searchParams.get(key);
      if (v !== null) outUrl.searchParams.set(key, v);
    }
    
    // module alias’ını section’a da yansıt (BE section beklerse)
    if (inUrl.searchParams.has("module") && !inUrl.searchParams.has("section")) {
      outUrl.searchParams.set("section", String(inUrl.searchParams.get("module")));
    }
    
    // Kullanıcı ve plan bilgisi (cookie → backend)
    const jar = await cookies();
    const mkUid = jar.get("mk_uid")?.value || "guest";
    outUrl.searchParams.set("externalId", mkUid);
    
    const planCookie = jar.get("mk_plan")?.value?.toUpperCase();
    const headers = new Headers();
    if (planCookie && ["V", "M", "P"].includes(planCookie)) {
      headers.set("x-plan", planCookie);
    }
    
    // Backend’e isteği ilet
    const res = await fetch(outUrl.toString(), {
      headers,
      cache: "no-store",
    });

    // BACKEND ÇÖKERSE: Kasten catch bloğuna atla!
    if (!res.ok) {
      throw new Error(`Backend yanıt vermedi veya hata döndü: ${res.status}`);
    }

    // Backend ne döndürdüyse onu iletelim
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
    
  } catch (err: any) {
    // 🚨 BACKEND ULAŞILAMAZSA: SİSTEMİ ÇÖKERTME, KULLANICIYA SAHTE (MOCK) SORULAR DÖN!
    console.warn("Backend'e ulaşılamadı. Soru Bankası (Questions) yedek motoru devrede.");
    
    const moduleName = new URL(req.url).searchParams.get("module") || "Genel";
    
    return NextResponse.json({
      ok: true,
      mock: true,
      total: 2, // 2 adet sahte soru dönüyoruz
      items: [
        {
          id: "mock-q1",
          text: `[MOCK] ${moduleName.toUpperCase()} modülü için backend kapalıyken üretilmiş test sorusudur. Aşağıdakilerden hangisi yanlıştır?`,
          options: ["A) Her şey yolunda", "B) UI çökmedi", "C) Backend kapalı", "D) Sistem çöktü"],
          correctIndex: 3,
          explanation: "Sistem çökmedi, çünkü Çelik Kubbe devrede! (Bu sahte bir sorudur)."
        },
        {
          id: "mock-q2",
          text: `[MOCK] İkinci test sorusu. ${moduleName} vaka örneği:`,
          options: ["A) Seçenek X", "B) Seçenek Y", "C) Seçenek Z", "D) Seçenek W"],
          correctIndex: 0,
          explanation: "Bu bir yedek (fallback) içeriktir."
        }
      ]
    }, { status: 200 });
  }
}