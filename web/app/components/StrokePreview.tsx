// C:\Users\hucig\Medknowledge\web\app\components\StrokePreview.tsx
//
// El yazısı çizimlerini SVG olarak basar. Vuruşlar panel GENİŞLİĞİNE göre
// normalize saklandığı için (bkz. NotePanel), herhangi bir boyuta bire bir
// ölçeklenir — küçük önizleme de tam boy da aynı veriden çıkar.

export type Stroke = { c: string; w: number; p: [number, number, number][] };

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
  const paths: { d: string; c: string; w: number }[] = [];

  for (const s of strokes) {
    if (!s?.p?.length) continue;
    for (const p of s.p) if (p[1] > maxY) maxY = p[1];
    paths.push({
      d: s.p
        .map((p, i) => `${i ? "L" : "M"}${(p[0] * W).toFixed(1)} ${(p[1] * W).toFixed(1)}`)
        .join(" "),
      c: s.c || "#1E293B",
      w: Math.max(0.4, (s.w || 3) * strokeScale * (W / 400)),
    });
  }

  if (!paths.length) return null;
  const H = Math.min(W * (maxY + 0.08), W * maxRatio);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden preserveAspectRatio="xMidYMin meet">
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke={p.c}
          strokeWidth={p.w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
