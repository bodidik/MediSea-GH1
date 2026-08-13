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

  } catch {
    // Arka uca ulaşılamadı.
    //
    // Burada UYDURMA sonuç dönülüyordu ("… ile ilgili Yedek Sonuç 1") ve
    // çağıran sayfa bunları gerçek konu sanıp basıyordu. Express arka ucu
    // canlıda hiç çalışmadığı için bu "yedek" hâl, kalıcı hâldi: kütüphane
    // girişinde ziyaretçiye sürekli iki sahte kayıt gösteriliyordu.
    //
    // Sahte veriyi gerçek gibi sunmak, dürüst bir hatadan kötüdür — hele
    // tıbbi bir kaynakta. Artık sonuç yok ve bu açıkça söyleniyor;
    // çağıran taraf buna göre dürüst bir mesaj gösterebilir.
    const query = req.nextUrl.searchParams.get("q") || "";
    console.warn(`Arama arka ucuna ulaşılamadı (q=${query}).`);

    return NextResponse.json(
      { ok: false, reason: "backend-unavailable", query, total: 0, items: [] },
      { status: 503 }
    );
  }
}