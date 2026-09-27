// C:\Users\hucig\Medknowledge\web\app\components\StrokePreview.tsx
//
// El yazısı çizimlerini SVG olarak basar. Vuruşlar panel GENİŞLİĞİNE göre
// normalize saklandığı için (bkz. NotePanel), herhangi bir boyuta bire bir
// ölçeklenir — küçük önizleme de tam boy da aynı veriden çıkar.
//
// Anahat, not defteri tuvaliyle AYNI fonksiyondan geliyor (`lib/murekkep`):
// basınç inceltmesi ve fosforlu kalem kartta da görünür. Eskiden burada sabit
// kalınlıklı düz çizgiler çiziliyordu — kartta gördüğün, yazdığın değildi.

import { cizimSirasi, FOSFOR_ALFA, vurusYolu, type Stroke } from "@/app/lib/murekkep";

export type { Stroke };

export default function StrokePreview({
  strokes,
  width = 64,
  maxRatio = 1.2,
  className = "",
  strokeScale = 1,
}: {
  strokes: Stroke[];
  /** SVG'nin koordinat genişliği — vuruşlar buna çarpılır */
  width?: number;
  /** yükseklik/genişlik üst sınırı; çizim daha uzunsa kırpılır */
  maxRatio?: number;
  className?: string;
  /** çizgi kalınlığı çarpanı (küçük önizlemede ince, tam boyda kalın) */
  strokeScale?: number;
}) {
  const W = width;
  let maxY = 0.4;
  const paths: { d: string; c: string; h: boolean }[] = [];
  /* Kalınlık tuvaldeki panel genişliğine (~400px) göre yazıldı; önizleme
     genişliğine oranla küçültülür. */
  const olcek = strokeScale * (W / 400);

  for (const s of cizimSirasi(Array.isArray(strokes) ? strokes : [])) {
    if (!s?.p?.length) continue;
    for (const p of s.p) if (p[1] > maxY) maxY = p[1];
    const d = vurusYolu({ ...s, c: s.c || "#1E293B", w: s.w || 3 }, W, olcek);
    if (d) paths.push({ d, c: s.c || "#1E293B", h: !!s.h });
  }

  if (!paths.length) return null;
  const H = Math.min(W * (maxY + 0.08), W * maxRatio);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden preserveAspectRatio="xMidYMin meet">
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.c} fillOpacity={p.h ? FOSFOR_ALFA : 1} />
      ))}
    </svg>
  );
}
