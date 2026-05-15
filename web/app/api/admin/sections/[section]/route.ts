// C:\Users\hucig\Medknowledge\web\app\api\admin\sections\[section]\route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest, 
  { params }: { params: { section: string } }
) {
  const backend = backendBase();
  // Artık URL'yi manuel parçalamaya gerek yok, Next.js params'tan alıyoruz:
  const sectionName = decodeURIComponent(params.section || "");
  
  const url = new URL(`/api/sections/${sectionName}`, backend);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    if (!r.ok) {
        throw new Error(`Backend yanıt vermedi: ${r.status}`);
    }
    
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: KAPTAN PANELİNİ ÇÖKERTME, MOCK BRANŞ VERİSİ DÖN!
    console.warn(`Backend'e ulaşılamadı. Admin Section (${sectionName}) yedek motoru devrede.`);
    
    return NextResponse.json({
        ok: true,
        mock: true,
        section: sectionName,
        details: {
            title: sectionName.toUpperCase(),
            totalQuestions: 150,
            activeUsers: 45,
            status: "Online (Mock)"
        }
    }, { status: 200 });
  }
}