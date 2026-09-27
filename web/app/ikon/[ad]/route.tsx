import { ImageResponse } from "next/og";
import { MarkaIsareti } from "@/lib/marka-isareti";

/**
 * ANDROID ANA EKRAN SİMGELERİ — manifestlerin (`app/manifest.ts`,
 * `app/manifest/arac/[slug]/route.ts`) işaret ettiği PNG'ler.
 *
 * Chrome kurulabilirlik için 192 ve 512 px PNG istiyor; SVG sekme simgesi
 * bu şartı karşılamıyor. "maskable" ayrı dosya: Android simgeyi başlatıcının
 * biçimine kırptığında düz simgenin köşedeki güneşi kesilirdi.
 *
 * Derlemede statik üretilir (`dynamicParams = false`); listede olmayan ad 404.
 */
const SIMGELER: Record<string, { boyut: number; dolgu: number }> = {
  "192.png": { boyut: 192, dolgu: 0 },
  "512.png": { boyut: 512, dolgu: 0 },
  "maskable-512.png": { boyut: 512, dolgu: 0.18 },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SIMGELER).map((ad) => ({ ad }));
}

export async function GET(_: Request, { params }: { params: Promise<{ ad: string }> }) {
  const { ad } = await params;
  const s = SIMGELER[ad];
  if (!s) return new Response("Bulunamadı", { status: 404 });
  return new ImageResponse(<MarkaIsareti boyut={s.boyut} dolgu={s.dolgu} />, {
    width: s.boyut,
    height: s.boyut,
  });
}
