"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Deniz filigranı — iskeleden sabah denizi (27 Eylül 2026, kullanıcı isteği:
 * "iskeleden görünen deniz, sayfaya göre değişken, sadece dikkatli bakılınca
 * görünsün"; ardından "sabah güneşli olsun, gece ya da derin değil,
 * gerçekçi çizimsel, çok belirgin olmasın, ortamı boğmasın").
 *
 * Bütün görünümü kaplayan, TIKLAMAYI ALMAYAN tek bir SVG, kalem çizimi
 * üslubunda: önde iskelenin tahtaları ve babası, ileride ufuk, alçak sabah
 * güneşi ve suya düşen güneş yolu, gökte birkaç bulut, suda kısa dalga
 * vuruşları. Ufuktaki ayrıntı adresten türetilir (aynı sayfa hep aynı
 * manzarayı gösterir): yelkenli · fener burnu · şilep · ada · balıkçı
 * kayığı · uzak kıyı. Dalga vuruşlarının yeri de adresten tohumlanır.
 *
 * Gece kipi BİLEREK YOK — kullanıcı kararı: tema sabah.
 *
 * GÖRÜNÜRLÜK BİLEREK EŞİKTE: deniz çizgileri petrol mavisi, güneş altın,
 * ikisi de birkaç yüzde renk alfası. Saydamlık `opacity` ile değil RENK
 * ALFASIYLA verilir (saydamlık denetimi kuralı). Sürekli yatay dalga
 * çizgileri yerine kısa vuruşlar: metnin üstünden baştan sona geçen çizgi
 * kalmıyor.
 *
 * DAR EKRANDA AYRI YERLEŞİM: görünüm alanı alttan ortalanıp kırpılıyor
 * (slice); dikey telefonda 1440 genişliğin yalnızca ortadaki ~440 birimi
 * görünür. Güneş ve ufuk ayrıntısı o dilime taşınır, yoksa telefonda
 * manzaradan geriye yalnızca iskele kalıyordu.
 *
 * Katman içeriğin ÜSTÜNDE (z-[1]) çünkü sayfaların kendi zeminleri opak:
 * alta konsaydı hiçbir sayfada görünmezdi. Yapışkan başlık (z-50), not
 * paneli ve iletişim kutuları üstte kalır. Baskıda basılmaz.
 */

const CIZGI = "rgba(21, 78, 99, 0.055)";
const DOLGU = "rgba(21, 78, 99, 0.02)";
const GUNES = "rgba(214, 142, 24, 0.1)";
const GUNES_DOLGU = "rgba(250, 204, 21, 0.045)";

function ozet(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Küçük, tohumlu, belirlenimci rastgele üreteç (sunucu ve istemci aynı çizer). */
function uretec(tohum: number) {
  let a = tohum || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UFUK = 540;
const ALT = 900;
const r1 = (n: number) => n.toFixed(1);

/** Dalga vuruşları — ufka yakın kısa ve sık, iskeleye yaklaştıkça uzun ve seyrek. */
function dalgaVuruslari(rnd: () => number, x0: number, x1: number, adet: number) {
  let d = "";
  for (let i = 0; i < adet; i++) {
    const t = Math.pow(rnd(), 1.7);
    const y = UFUK + 5 + t * (ALT - UFUK - 60);
    const boy = 10 + t * 70 + rnd() * 16;
    const x = x0 + rnd() * (x1 - x0 - boy);
    const g = 0.8 + t * 3;
    d += ` M${r1(x)} ${r1(y)} q${r1(boy / 2)} ${r1(-g)} ${r1(boy)} 0`;
  }
  return <path d={d} strokeLinecap="round" />;
}

/** Güneş yolu — güneşin altında suya düşen parıltı; öne doğru genişler. */
function gunesYolu(rnd: () => number, gx: number) {
  let d = "";
  for (let i = 0; i < 26; i++) {
    const t = i / 26;
    const y = UFUK + 4 + Math.pow(t, 1.5) * 300;
    const yayilma = 6 + t * 120;
    const boy = 5 + t * 24 + rnd() * 8;
    const x = gx + (rnd() - 0.5) * 2 * yayilma - boy / 2;
    d += ` M${r1(x)} ${r1(y)} h${r1(boy)}`;
  }
  return <path d={d} stroke={GUNES} strokeLinecap="round" />;
}

/** Alçak sabah güneşi: disk, kısa ışın vuruşları ve çevresindeki ılık ışık. */
function Gunes({ x }: { x: number }) {
  const y = UFUK - 62;
  const isinlar = Array.from({ length: 20 }, (_, i) => {
    const a = (i * Math.PI) / 10;
    const ic = 50;
    const dis = i % 2 === 0 ? 74 : 62;
    return `M${r1(x + Math.cos(a) * ic)} ${r1(y + Math.sin(a) * ic)} L${r1(x + Math.cos(a) * dis)} ${r1(y + Math.sin(a) * dis)}`;
  }).join(" ");
  return (
    <g>
      <circle cx={x} cy={y} r={340} fill="url(#deniz-sabah-isigi)" stroke="none" />
      <circle cx={x} cy={y} r={40} fill={GUNES_DOLGU} stroke={GUNES} />
      <path d={isinlar} stroke={GUNES} strokeLinecap="round" />
    </g>
  );
}

/** Kümülüs bulutu — dış hat ve altında iki gölge taraması. */
function Bulut({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-70 0 c-8 -18 12 -32 30 -24 c6 -22 44 -28 56 -8 c12 -16 42 -12 44 8 c16 -2 26 14 14 24 Z" fill={DOLGU} />
      <path d="M-40 6 h60 M-24 11 h44" strokeLinecap="round" />
    </g>
  );
}

function Yelkenli({ x, y = UFUK, s = 1 }: { x: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* yelkenler: ana yelken ve flok, rüzgârla kavisli */}
      <path d="M3 -86 Q26 -52 32 -12 H3 Z M-3 -78 Q-18 -44 -30 -12 H-3 Z" fill={DOLGU} />
      <path d="M3 -86 Q26 -52 32 -12 H3 Z M-3 -78 Q-18 -44 -30 -12 H-3 Z" />
      {/* direk, sancak, gövde ve güverte çizgisi */}
      <path d="M0 -8 V-90 M0 -90 l9 3 l-9 3" />
      <path d="M-38 -9 H38 Q32 2 20 4 H-26 Q-34 0 -38 -9 Z" fill={DOLGU} />
      <path d="M-30 -4 H30" />
      {/* suda yansıma */}
      <path d="M-26 10 h14 M-6 13 h12 M12 10 h14 M-14 17 h8 M6 18 h10" strokeLinecap="round" />
    </g>
  );
}

function FenerBurnu({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${UFUK}) scale(${s})`}>
      {/* kayalık burun ve kaya taraması */}
      <path d="M-230 0 C -180 -8 -130 -34 -70 -42 C -30 -48 24 -48 70 -36 C 124 -22 176 -6 240 0 Z" fill={DOLGU} />
      <path d="M-230 0 C -180 -8 -130 -34 -70 -42 C -30 -48 24 -48 70 -36 C 124 -22 176 -6 240 0" />
      <path d="M-120 -24 l14 10 M-86 -32 l16 12 M-50 -38 l14 12 M60 -30 l14 10 M100 -20 l14 10 M140 -10 l12 8" strokeLinecap="round" />
      {/* kule: kuşaklar, balkon, fener odası, kubbe */}
      <path d="M-14 -46 L-9 -150 H9 L14 -46 Z" fill={DOLGU} />
      <path d="M-14 -46 L-9 -150 H9 L14 -46 Z M-13 -74 H13 M-12 -102 H12 M-10 -128 H10" />
      <path d="M-17 -150 H17 V-155 H-17 Z M-8 -155 V-172 H8 V-155 M-3 -155 V-172 M3 -155 V-172 M-11 -172 L0 -184 L11 -172 Z" />
      <path d="M-4 -70 v-8 M-3 -112 v-8" />
      {/* bekçi evi */}
      <path d="M22 -46 V-62 H52 V-46 M17 -62 L37 -74 L57 -62 M32 -46 v-8 h7 v8" />
    </g>
  );
}

function Silep({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${UFUK}) scale(${s})`}>
      <path d="M-100 -10 H100 L88 6 H-84 Q-96 0 -100 -10 Z" fill={DOLGU} />
      <path d="M-100 -10 H100 L88 6 H-84 Q-96 0 -100 -10 Z M-94 -3 H94" />
      {/* köprü üstü, pencereler ve baca */}
      <path d="M50 -10 V-36 H86 V-10 M56 -36 V-46 H80 V-36 M58 -28 h6 M68 -28 h6 M77 -28 h5 M62 -46 V-60 H72 V-46" />
      {/* güvertede yük ve vinç */}
      <path d="M-80 -10 V-24 H-50 V-10 M-48 -10 V-24 H-18 V-10 M-16 -10 V-24 H14 V-10 M-64 -24 V-34 H-34 V-24 M-2 -24 V-34 H26 V-24" />
      <path d="M-92 -10 V-44 M-92 -38 L-64 -24 M34 -10 V-38 M34 -32 L50 -16" />
      {/* bacadan ince duman */}
      <path d="M67 -64 c4 -8 14 -10 22 -16 c8 -6 20 -6 30 -12 c10 -6 22 -6 34 -8" strokeLinecap="round" strokeDasharray="10 6" />
      <path d="M-70 14 h24 M-20 12 h30 M30 15 h22 M70 12 h16" strokeLinecap="round" />
    </g>
  );
}

function Ada({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${UFUK}) scale(${s})`}>
      <path d="M-220 0 C -170 -20 -120 -58 -50 -64 C 10 -70 80 -52 120 -32 C 160 -12 192 -4 230 0 Z" fill={DOLGU} />
      <path d="M-220 0 C -170 -20 -120 -58 -50 -64 C 10 -70 80 -52 120 -32 C 160 -12 192 -4 230 0" />
      {/* beyaz evler, kilise kubbesi, çan kulesi */}
      <path d="M-96 -44 v-14 h18 v14 M-74 -50 v-16 h22 v16 M-48 -56 v-12 h16 v12 M-26 -58 v-10 h24 v10 M-20 -68 a8 6 0 0 1 16 0 M4 -58 v-14 h7 v14 M2 -72 h11 l-5.5 -6 z" />
      <path d="M-90 -50 h4 M-66 -58 h4 M-42 -62 h4" />
      {/* selviler */}
      <path d="M40 -48 q5 -18 0 -30 q-5 12 0 30 M54 -44 q4 -15 0 -25 q-4 10 0 25 M-130 -30 q4 -14 0 -24 q-4 10 0 24" />
      <path d="M-160 10 h30 M-100 13 h40 M-20 10 h36 M50 13 h40 M120 10 h26" strokeLinecap="round" />
    </g>
  );
}

/** Balıkçı kayığı — yakın suda, ufuktaki ögelerden büyük. */
function Kayik({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-78 -6 Q-66 16 -24 20 H46 Q70 16 80 -8 Q0 -2 -78 -6 Z" fill={DOLGU} />
      <path d="M-78 -6 Q-66 16 -24 20 H46 Q70 16 80 -8 Q0 -2 -78 -6 Z M-70 2 Q0 8 74 0" />
      {/* kamara, direk, halat ve ağ şamandıraları */}
      <path d="M-12 -4 V-28 H22 V-4 M-6 -22 h8 v8 h-8 z M40 -6 V-58 M40 -54 L70 -8 M40 -50 L6 -28" />
      <path d="M-50 -2 a3 3 0 1 0 0.1 0 M-36 -1 a3 3 0 1 0 0.1 0" />
      {/* yansıma */}
      <path d="M-60 28 h26 M-20 32 h40 M30 28 h30 M-40 38 h20 M10 40 h24" strokeLinecap="round" />
    </g>
  );
}

/** Uzak kıyı — ufukta alçak tepeler, kıyıda birkaç ev. */
function UzakKiyi({ x0, x1 }: { x0: number; x1: number }) {
  const w = x1 - x0;
  const p = (f: number) => r1(x0 + w * f);
  return (
    <g>
      <path
        d={`M${p(0)} ${UFUK} C ${p(0.1)} ${UFUK - 22} ${p(0.22)} ${UFUK - 34} ${p(0.36)} ${UFUK - 26} C ${p(0.48)} ${UFUK - 20} ${p(0.58)} ${UFUK - 40} ${p(0.72)} ${UFUK - 36} C ${p(0.84)} ${UFUK - 32} ${p(0.94)} ${UFUK - 10} ${p(1)} ${UFUK} Z`}
        fill={DOLGU}
      />
      <path
        d={`M${p(0)} ${UFUK} C ${p(0.1)} ${UFUK - 22} ${p(0.22)} ${UFUK - 34} ${p(0.36)} ${UFUK - 26} C ${p(0.48)} ${UFUK - 20} ${p(0.58)} ${UFUK - 40} ${p(0.72)} ${UFUK - 36} C ${p(0.84)} ${UFUK - 32} ${p(0.94)} ${UFUK - 10} ${p(1)} ${UFUK}`}
      />
      <path d={`M${p(0.3)} ${UFUK - 2} v-8 h8 v8 M${p(0.34)} ${UFUK - 2} v-11 h10 v11 M${p(0.4)} ${UFUK - 2} v-7 h8 v7`} />
    </g>
  );
}

function Marti({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path d={`M${x} ${y} q${7 * s} ${-8 * s} ${14 * s} 0 q${7 * s} ${-8 * s} ${14 * s} 0`} strokeLinecap="round" />;
}

/** Ön plan: iskelenin tahtaları, kenar kirişleri, kazıklar, baba ve halat. */
function Iskele({ babaX }: { babaX: number }) {
  // Tahtalar ufka doğru sıklaşır; her tahta çift çizgi (aradaki derz).
  const tahtalar = [900, 874, 852, 834, 820, 808, 798].map((y, i) => {
    const t = (900 - y) / 360;
    const sol = 470 + t * 210;
    const sag = 970 - t * 210;
    return <path key={i} d={`M${r1(sol)} ${y} H${r1(sag)} M${r1(sol + 4)} ${y + 3} H${r1(sag - 4)}`} />;
  });
  return (
    <g>
      <path d="M470 900 L640 760 M970 900 L800 760" />
      {tahtalar}
      {/* kazıklar ve dipte su halkaları */}
      <path d="M640 760 V792 M800 760 V792 M600 794 V842 M840 794 V842" />
      <path d="M630 794 q10 4 20 0 M790 794 q10 4 20 0 M588 844 q12 5 24 0 M828 844 q12 5 24 0" strokeLinecap="round" />
      {/* baba ve üstüne sarılı halat */}
      <path d={`M${babaX} 900 V858 a26 10 0 0 1 52 0 V900 M${babaX - 6} 858 h64`} fill={DOLGU} />
      <path d={`M${babaX + 4} 872 h44 M${babaX + 4} 880 h44`} />
      <path d={`M${babaX + 26} 850 C ${babaX - 32} 880, ${babaX - 92} 870, ${babaX - 142} 900`} />
    </g>
  );
}

/** Sahne yerleşimi: geniş ekranda tüm 1440, dar ekranda ortadaki dilim. */
type Yerlesim = { gunes: number; x0: number; x1: number; a: number; b: number; baba: number; olcek: number };
const GENIS: Yerlesim = { gunes: 1130, x0: 0, x1: 1440, a: 700, b: 330, baba: 392, olcek: 1 };
const DAR: Yerlesim = { gunes: 860, x0: 480, x1: 960, a: 600, b: 560, baba: 520, olcek: 0.62 };

export default function DenizFiligrani() {
  const yol = usePathname() || "/";
  const [dar, setDar] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(max-aspect-ratio: 1/1)");
    const esitle = () => setDar(m.matches);
    esitle();
    m.addEventListener("change", esitle);
    return () => m.removeEventListener("change", esitle);
  }, []);

  const anaSayfa = yol === "/";
  const h = ozet(yol);
  const sahne = h % 6;
  const ayna = (h >> 3) % 2 === 1;
  const L = dar ? DAR : GENIS;
  const k = L.olcek;
  const rnd = uretec(h);
  const bulutX = L.x0 + (L.x1 - L.x0) * (0.18 + ((h >> 7) % 20) / 100);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full print:hidden"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      stroke={CIZGI}
      strokeWidth={1.3}
      strokeLinejoin="round"
    >
      <defs>
        <radialGradient id="deniz-sabah-isigi">
          <stop offset="0" stopColor="rgba(253, 224, 140, 0.07)" />
          <stop offset="0.45" stopColor="rgba(253, 224, 140, 0.03)" />
          <stop offset="1" stopColor="rgba(253, 224, 140, 0)" />
        </radialGradient>
      </defs>
      <g transform={ayna ? "translate(1440 0) scale(-1 1)" : undefined}>
        {/* ana sayfanın panelinde kendi doğan güneşi var; iki güneş olmasın */}
        {!anaSayfa && <Gunes x={L.gunes} />}

        {/* gökte bulutlar */}
        <Bulut x={bulutX} y={dar ? 250 : 190} s={dar ? 0.7 : 1} />
        {!dar && <Bulut x={bulutX + 520} y={280} s={0.7} />}

        {/* ufuk, dalga vuruşları ve güneş yolu */}
        <path d={`M0 ${UFUK} H1440`} />
        {dalgaVuruslari(rnd, L.x0, L.x1, dar ? 34 : 90)}
        {!anaSayfa && gunesYolu(rnd, L.gunes)}

        {/* sayfaya göre değişen ufuk ayrıntısı */}
        {sahne === 0 && (
          <>
            <Yelkenli x={L.a} s={k} />
            <Marti x={L.b} y={330} s={k} />
            <Marti x={L.b + 44 * k} y={306} s={0.7 * k} />
            <Marti x={L.b + 80 * k} y={344} s={0.55 * k} />
          </>
        )}
        {sahne === 1 && <FenerBurnu x={dar ? 600 : L.b} s={dar ? 0.8 : 1} />}
        {sahne === 2 && (
          <>
            <Silep x={dar ? 620 : 520} s={dar ? 0.7 : 1} />
            <Marti x={dar ? 540 : 860} y={350} s={0.8 * k} />
            <Marti x={dar ? 576 : 900} y={326} s={0.6 * k} />
          </>
        )}
        {sahne === 3 && (
          <>
            <Ada x={dar ? 620 : 380} s={dar ? 0.55 : 1} />
            {!dar && <Yelkenli x={820} s={0.7} />}
          </>
        )}
        {sahne === 4 && (
          <>
            <Kayik x={dar ? 600 : 250} y={680} s={dar ? 0.8 : 1} />
            <Yelkenli x={dar ? 720 : 760} s={0.6 * k} />
          </>
        )}
        {sahne === 5 && (
          <>
            <UzakKiyi x0={L.x0} x1={L.x0 + (L.x1 - L.x0) * 0.55} />
            <Silep x={dar ? 780 : 760} s={dar ? 0.45 : 0.7} />
          </>
        )}

        <Iskele babaX={L.baba} />
      </g>
    </svg>
  );
}
