// Mürekkep geometrisi — not defteri tuvali (NotePanel) ile tekrar kartı
// önizlemesi (StrokePreview) AYNI yolu çizsin diye tek kaynak.
//
// Vuruş eskiden nokta nokta düz çizgi parçalarıyla basılıyordu: her parça
// kendi kalınlığında ayrı bir `stroke()` idi, eğrilerde köşeler ve kalınlık
// geçişlerinde basamaklar görünüyordu; SVG önizleme ise basıncı hiç
// bilmiyordu (sabit kalınlık) — yani kartta gördüğün, yazdığın değildi.
//
// Şimdi vuruş DOLDURULMUŞ bir anahat: her noktada basınçtan gelen yarıçap,
// iki yanda ofset noktaları, orta noktalardan geçen ikinci derece eğriler ve
// iki uçta yuvarlak başlık. Aynı SVG yol dizesi tuvalde `Path2D` ile, kartta
// `<path d>` ile çiziliyor.

/** [x, y, basınç] — x ve y panel GENİŞLİĞİNE göre normalize. */
export type Pt = [number, number, number];
/** `h: 1` fosforlu kalem: sabit geniş uç, yarı saydam, mürekkebin altında. */
export type Stroke = { c: string; w: number; p: Pt[]; h?: 1 };

/** Fosforlu kalemin saydamlığı ve uç çarpanı. */
export const FOSFOR_ALFA = 0.25;
export const FOSFOR_CARPAN = 4;

const f = (v: number) => (Math.round(v * 10) / 10).toString();

/** Noktadaki yarıçap (px): basınç inceltir, fosforlu kalem basınç bilmez. */
function yaricap(s: Stroke, basinc: number, olcek: number) {
  const w = s.w * olcek;
  if (s.h) return Math.max(0.6, (w * FOSFOR_CARPAN) / 2);
  return Math.max(0.35, (w * (0.4 + 0.6 * basinc)) / 2);
}

/**
 * Vuruşun doldurulacak anahattı (SVG yol dizesi).
 * @param W   normalize koordinatın çarpılacağı genişlik (px)
 * @param olcek kalınlık çarpanı (küçük önizlemede incelt)
 */
export function vurusYolu(s: Stroke, W: number, olcek = 1): string {
  const ham = s.p;
  if (!ham?.length) return "";

  // Ardışık aynı noktaları at — normal vektörü sıfır uzunluklu olmasın.
  const P: { x: number; y: number; r: number }[] = [];
  for (const q of ham) {
    const x = q[0] * W;
    const y = q[1] * W;
    const son = P[P.length - 1];
    if (son && Math.hypot(son.x - x, son.y - y) < 0.05) continue;
    P.push({ x, y, r: yaricap(s, q[2] ?? 0.5, olcek) });
  }

  if (P.length === 1) {
    const { x, y, r } = P[0];
    return `M${f(x - r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x + r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x - r)} ${f(y)}Z`;
  }

  // Basınç sıçramalarını yumuşat (kalem örneklemesi gürültülü).
  const R = P.map((p, i) => {
    if (s.h) return p.r;
    const a = P[i - 1]?.r ?? p.r;
    const b = P[i + 1]?.r ?? p.r;
    return (a + 2 * p.r + b) / 4;
  });

  const sol: [number, number][] = [];
  const sag: [number, number][] = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)];
    const b = P[Math.min(P.length - 1, i + 1)];
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const n = Math.hypot(tx, ty) || 1;
    tx /= n;
    ty /= n;
    const r = R[i];
    sol.push([P[i].x - ty * r, P[i].y + tx * r]);
    sag.push([P[i].x + ty * r, P[i].y - tx * r]);
  }

  // Keskin dönüş: "V", "N" gibi harflerin sivri ucu. Orta nokta eğrisi bu
  // köşeyi kırpıp ucu köreltiyordu (ölçüldü: 91°'lik zikzakta merkez hattın
  // %22'si mürekkepsiz kaldı); bu noktalarda eğri yerine köşe korunur.
  const sivri = P.map((p, i) => {
    if (i === 0 || i === P.length - 1) return false;
    const a = Math.atan2(p.y - P[i - 1].y, p.x - P[i - 1].x);
    const b = Math.atan2(P[i + 1].y - p.y, P[i + 1].x - p.x);
    let d = Math.abs(b - a);
    if (d > Math.PI) d = 2 * Math.PI - d;
    return d > Math.PI / 3;
  });

  // Orta noktalardan geçen ikinci derece eğri: köşesiz, noktalardan sapmayan.
  const egri = (L: [number, number][], keskin: boolean[]) => {
    let d = "";
    for (let i = 1; i < L.length - 1; i++) {
      if (keskin[i]) {
        d += `L${f(L[i][0])} ${f(L[i][1])}`;
        continue;
      }
      const mx = (L[i][0] + L[i + 1][0]) / 2;
      const my = (L[i][1] + L[i + 1][1]) / 2;
      d += `Q${f(L[i][0])} ${f(L[i][1])} ${f(mx)} ${f(my)}`;
    }
    const z = L[L.length - 1];
    return d + `L${f(z[0])} ${f(z[1])}`;
  };

  const rs = R[R.length - 1];
  const r0 = R[0];
  const geri = sag.slice().reverse();
  const sivriGeri = sivri.slice().reverse();
  return (
    `M${f(sol[0][0])} ${f(sol[0][1])}` +
    egri(sol, sivri) +
    `A${f(rs)} ${f(rs)} 0 0 0 ${f(geri[0][0])} ${f(geri[0][1])}` +
    egri(geri, sivriGeri) +
    `A${f(r0)} ${f(r0)} 0 0 0 ${f(sol[0][0])} ${f(sol[0][1])}Z`
  );
}

/** Fosforlular önce (altta), mürekkep sonra — yazı fosforun altında kalmasın. */
export function cizimSirasi(strokes: Stroke[]): Stroke[] {
  const alt: Stroke[] = [];
  const ust: Stroke[] = [];
  for (const s of strokes) (s?.h ? alt : ust).push(s);
  return alt.concat(ust);
}

/** Tuvale tek vuruş basar. */
export function vurusBas(ctx: CanvasRenderingContext2D, s: Stroke, W: number) {
  const d = vurusYolu(s, W);
  if (!d) return;
  ctx.save();
  ctx.globalAlpha = s.h ? FOSFOR_ALFA : 1;
  ctx.fillStyle = s.c;
  ctx.fill(new Path2D(d));
  ctx.restore();
}

/**
 * Nokta silgisi: silgi dairesinin içindeki noktaları çıkarır, vuruşu kalan
 * parçalara böler. Hiçbir şey değişmediyse AYNI diziyi döndürür (gereksiz
 * yeniden çizim ve "kaydediliyor" üretmesin).
 */
export function noktaSil(strokes: Stroke[], pt: Pt, yaricapN: number): Stroke[] {
  let degisti = false;
  const cikti: Stroke[] = [];
  for (const s of strokes) {
    const r = yaricapN + (s.h ? (s.w * FOSFOR_CARPAN) / 800 : 0);
    if (!s.p.some((p) => Math.hypot(p[0] - pt[0], p[1] - pt[1]) < r)) {
      cikti.push(s);
      continue;
    }
    degisti = true;
    // Tek noktalık artık, silginin kenarında nokta gibi kalır — atılır.
    // (Özgün vuruş zaten tek noktaysa daire içindeydi, o da gider.)
    let parca: Pt[] = [];
    for (const p of s.p) {
      if (Math.hypot(p[0] - pt[0], p[1] - pt[1]) < r) {
        if (parca.length > 1) cikti.push({ ...s, p: parca });
        parca = [];
      } else parca.push(p);
    }
    if (parca.length > 1) cikti.push({ ...s, p: parca });
  }
  return degisti ? cikti : strokes;
}
