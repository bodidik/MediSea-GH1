// C:\Users\hucig\Medknowledge\web\app\api\content\[id]\route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const backend = backendBase();
  const id = params.id;
  const url = new URL(`/api/content/${id}`, backend);

  // Eğer sayfa/limit gibi ekstra query parametreleri gelirse backend'e iletelim
  req.nextUrl.searchParams.forEach((v, k) => {
    url.searchParams.set(k, v);
  });

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    // Backend hata kodu dönerse (örn: 404 İçerik Bulunamadı, 500 Sunucu Hatası) kasten yakalıyoruz
    if (!r.ok) {
        throw new Error(`Backend içerik yanıtı vermedi: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (err: any) {
    // 🚨 BACKEND ULAŞILAMAZSA: İÇERİK SAYFASINI ÇÖKERTME, MOCK İÇERİK DÖN!
    console.warn(`Backend'e ulaşılamadı. İçerik (Content ID: ${id}) yedek motoru devrede.`);
    
    return NextResponse.json({
      ok: true,
      mock: true,
      id: id,
      data: {
        title: `[MOCK] Hedef İçerik (ID: ${id})`,
        type: "article",
        // Arayüzün HTML bekliyorsa diye şık bir koyu tema kutusu ekliyoruz:
        content: "<div class='p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-lg'><h3 class='text-xl text-blue-400 font-bold mb-3'>⚓ Çelik Kubbe Koruması</h3><p class='text-slate-300'>Bu sayfa, arka plandaki veritabanı kapalı olduğu için yedek (mock) motor tarafından oluşturulmuştur. Makale, video veya not tasarımlarınızı test etmeye devam edebilirsiniz!</p></div>",
        author: "Misafir Kaptan",
        date: new Date().toISOString()
      }
    }, { status: 200 });
  }
}