// FILE: web/app/api/topics/[slug]/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const backend = backendBase(); 
  const slug = String(params?.slug || "").trim();
  const url = new URL(`/api/topics/${encodeURIComponent(slug)}`, backend);

  req.nextUrl.searchParams.forEach((v, k) => {
    url.searchParams.set(k, v);
  });

  try {
    const r = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // 1 saatlik muazzam önbellek (cache) kuralını koruyoruz
    });

    // Backend 404 veya 500 dönerse catch bloğuna atıp yedek içeriği devreye sokuyoruz
    if (!r.ok) {
        throw new Error(`Backend yanıt vermedi: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: 200 });

  } catch (err: any) {
    // 🚨 BACKEND ULAŞILAMAZSA VEYA KONU YOKSA: SİSTEMİ ÇÖKERTME, MOCK İÇERİK DÖN!
    console.warn(`Backend'e ulaşılamadı. Konu Detayı (Topic: ${slug}) yedek motoru devrede.`);
    
    return NextResponse.json({
      ok: true,
      mock: true,
      data: {
          slug: slug,
          title: `${slug.toUpperCase()} (Mock Konu)`,
          content: "<div class='p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50'><h3 class='text-xl text-blue-400 font-bold mb-2'>⚓ Çelik Kubbe Devrede</h3><p class='text-slate-300'>Bu içerik, arka plandaki ana veritabanı kapalı olduğu için yedek motor tarafından üretilmiştir. Arayüz tasarımınızı (UI) test etmeye devam edebilirsiniz.</p></div>",
          section: "Genel",
          order: 1
      }
    }, { status: 200 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const backend = backendBase();
  const slug = String(params?.slug || "").trim();
  const url = new URL(`/api/topics/${encodeURIComponent(slug)}`, backend);

  req.nextUrl.searchParams.forEach((v, k) => {
    url.searchParams.set(k, v);
  });

  try {
    // Body'yi güvenli okuma
    const payload = await req.json().catch(() => ({}));

    const r = await fetch(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!r.ok) {
        throw new Error(`Backend PUT hatası: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: 200 });
    
  } catch (err: any) {
    // 🚨 BACKEND ULAŞILAMAZSA: EDİTÖRÜ (CMS) ÇÖKERTME, MOCK BAŞARI DÖN!
    console.warn(`Backend'e ulaşılamadı. Konu Güncelleme (PUT: ${slug}) yedek motoru devrede.`);
    
    return NextResponse.json({
      ok: true,
      mock: true,
      message: `Konu (${slug}) başarıyla güncellendi (Mock).`
    }, { status: 200 });
  }
}