"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Deniz filigranı (27 Eylül 2026, kullanıcı isteği: "iskeleden görünen deniz,
 * sayfaya göre değişken, sadece dikkatli bakılınca görünsün").
 *
 * Bütün görünümü kaplayan, TIKLAMAYI ALMAYAN tek bir SVG: önde iskelenin
 * tahtaları ve babası, ileride ufuk çizgisi ve dalgalar, ufukta sayfaya göre
 * değişen bir ayrıntı (yelkenli · fener · şilep · ada · dümen · pusula gülü).
 * Sahne adresten türetilir (aynı sayfa hep aynı manzarayı gösterir), gece
 * saatlerinde ufka hilal ve birkaç yıldız eklenir.
 *
 * GÖRÜNÜRLÜK BİLEREK EŞİKTE: çizgiler lacivert %5 alfa. Metnin üstünden
 * geçen 1px'lik çizgi bu alfada okumayı etkilemiyor; koyu yüzeylerde
 * (hero, alt bilgi) hiç görünmüyor. Saydamlık `opacity` ile değil RENK
 * ALFASIYLA verilir (saydamlık denetimi kuralı).
 *
 * Katman içeriğin ÜSTÜNDE (z-[1]) çünkü sayfaların kendi zeminleri opak:
 * alta konsaydı hiçbir sayfada görünmezdi. Yapışkan başlık (z-50), not
 * paneli ve iletişim kutuları üstte kalır. Baskıda basılmaz.
 */

const CIZGI = "rgba(23, 37, 84, 0.05)";
const DOLGU = "rgba(23, 37, 84, 0.022)";

function ozet(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const UFUK = 540;

/** Dalga çizgisi — yakına geldikçe genlik ve aralık büyür (perspektif). */
function dalga(y: number, genlik: number, adim: number, kayma: number) {
  let d = `M-40 ${y}`;
  for (let x = -40; x < 1480; x += adim) {
    d += ` q${adim / 4} ${-genlik} ${adim / 2} 0 t${adim / 2} 0`;
  }
  return <path key={`${y}-${kayma}`} d={d} transform={`translate(${kayma} 0)`} />;
}

function Yelkenli({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${UFUK}) scale(${s})`}>
      <path d="M0 -6 L0 -64 L-26 -8 Z" fill={DOLGU} />
      <path d="M4 -58 L4 -8 L26 -8 Z" fill={DOLGU} />
      <path d="M0 -6 L0 -64 L-26 -8 Z M4 -58 L4 -8 L26 -8 Z M-30 -4 H32 L24 4 H-22 Z" />
    </g>
  );
}

function Fener({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${UFUK})`}>
      {/* burun */}
      <path d="M-140 0 C -100 -18, -60 -26, -10 -26 S 90 -14, 150 0" fill={DOLGU} />
      {/* kule */}
      <path d="M-12 -26 L-8 -104 H8 L12 -26 Z M-10 -104 H10 V-118 H-10 Z M-14 -118 H14 L0 -130 Z" />
      <path d="M-11 -60 H11 M-9 -84 H9" />
      {/* ışık huzmeleri */}
      <path d="M-14 -111 L-220 -150 M-14 -111 L-220 -80 M14 -111 L220 -150 M14 -111 L220 -80" strokeDasharray="2 10" />
    </g>
  );
}

function Silep({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${UFUK})`}>
      <path d="M-90 -6 H96 L82 8 H-78 Z" fill={DOLGU} />
      <path d="M-90 -6 H96 L82 8 H-78 Z M60 -6 V-34 H86 V-6 M66 -34 V-44 H74 V-34" />
      <path d="M-70 -6 V-22 H-40 V-6 M-36 -6 V-22 H-6 V-6 M-2 -6 V-22 H28 V-6 M32 -6 V-18 H56 V-6" />
      <path d="M70 -48 c6 -6 14 -6 20 -12" />
    </g>
  );
}

function Ada({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${UFUK})`}>
      <path d="M-200 0 C -150 -30, -90 -58, -20 -60 S 120 -34, 210 0 Z" fill={DOLGU} />
      <path d="M-200 0 C -150 -30, -90 -58, -20 -60 S 120 -34, 210 0" />
      <path d="M-60 -50 h14 v-12 h-14 z M-40 -54 h18 v-16 h-18 z M-16 -58 h12 v-10 h-12 z M-34 -70 a9 7 0 0 1 18 0" />
    </g>
  );
}

function Dumen({ x, y, r }: { x: number; y: number; r: number }) {
  const kollar = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M${(c * r * 0.22).toFixed(1)} ${(s * r * 0.22).toFixed(1)} L${(c * r * 1.18).toFixed(1)} ${(s * r * 1.18).toFixed(1)}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} />
      <circle r={r * 0.82} />
      <circle r={r * 0.22} />
      <path d={kollar} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function Pusula({ x, y, r }: { x: number; y: number; r: number }) {
  const u = r;
  const k = r * 0.16;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 0.92} />
      <circle r={r * 0.3} />
      <path d={`M0 ${-u} L${k} 0 L0 ${u} L${-k} 0 Z M${-u} 0 L0 ${k} L${u} 0 L0 ${-k} Z`} fill={DOLGU} />
      <path d={`M0 ${-u} L${k} 0 L0 ${u} L${-k} 0 Z M${-u} 0 L0 ${k} L${u} 0 L0 ${-k} Z`} />
      <g transform="rotate(45)">
        <path d={`M0 ${-u * 0.62} L${k * 0.7} 0 L0 ${u * 0.62} L${-k * 0.7} 0 Z M${-u * 0.62} 0 L0 ${k * 0.7} L${u * 0.62} 0 L0 ${-k * 0.7} Z`} />
      </g>
    </g>
  );
}

function Marti({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path d={`M${x} ${y} q${7 * s} ${-7 * s} ${14 * s} 0 q${7 * s} ${-7 * s} ${14 * s} 0`} />;
}

/** Ön plan: iskelenin tahtaları, kenar kirişleri, baba ve halat. */
function Iskele() {
  // Tahtalar ufka doğru sıklaşır.
  const tahtalar = [900, 872, 850, 832, 818, 806, 796].map((y, i) => {
    const t = (900 - y) / 360;
    const sol = 470 + t * 210;
    const sag = 970 - t * 210;
    return <path key={i} d={`M${sol.toFixed(0)} ${y} H${sag.toFixed(0)}`} />;
  });
  return (
    <g>
      <path d="M470 900 L640 760 M970 900 L800 760" />
      {tahtalar}
      {/* kazıklar */}
      <path d="M640 760 V790 M800 760 V790 M600 792 V840 M840 792 V840" />
      {/* baba + halat */}
      <path d="M392 900 V858 a26 10 0 0 1 52 0 V900 M386 858 h64" fill={DOLGU} />
      <path d="M418 850 C 360 880, 300 870, 250 900" />
    </g>
  );
}

export default function DenizFiligrani() {
  const yol = usePathname() || "/";
  const [gece, setGece] = useState(false);

  useEffect(() => {
    const s = new Date().getHours();
    setGece(s >= 20 || s < 6);
  }, []);

  const h = ozet(yol);
  const sahne = h % 6;
  const ayna = (h >> 3) % 2 === 1;
  const kayma = (h >> 5) % 90;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full print:hidden"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      stroke={CIZGI}
      strokeWidth={1.4}
      strokeLinejoin="round"
    >
      <g transform={ayna ? "translate(1440 0) scale(-1 1)" : undefined}>
        {/* ufuk ve dalgalar */}
        <path d={`M0 ${UFUK} H1440`} />
        {dalga(566, 2, 60, kayma)}
        {dalga(602, 3, 90, -kayma)}
        {dalga(652, 5, 130, kayma / 2)}
        {dalga(720, 8, 190, -kayma / 3)}

        {/* sayfaya göre değişen ufuk ayrıntısı */}
        {sahne === 0 && (
          <>
            <Yelkenli x={1080} />
            <Marti x={260} y={300} />
            <Marti x={310} y={270} s={0.7} />
            <Marti x={350} y={320} s={0.55} />
          </>
        )}
        {sahne === 1 && <Fener x={1180} />}
        {sahne === 2 && (
          <>
            <Silep x={380} />
            <Marti x={1040} y={330} s={0.8} />
            <Marti x={1090} y={300} s={0.6} />
          </>
        )}
        {sahne === 3 && (
          <>
            <Ada x={1120} />
            <Yelkenli x={520} s={0.7} />
          </>
        )}
        {sahne === 4 && (
          <>
            <Dumen x={1250} y={250} r={120} />
            <Yelkenli x={640} s={0.6} />
          </>
        )}
        {sahne === 5 && (
          <>
            <Pusula x={210} y={230} r={110} />
            <Silep x={1100} />
          </>
        )}

        {/* gece: hilal ve yıldızlar */}
        {gece && (
          <>
            <path d="M960 220 a38 38 0 1 0 30 58 a30 30 0 1 1 -30 -58 Z" fill={DOLGU} />
            <path d="M540 150 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z M720 110 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z M1180 160 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" />
          </>
        )}

        <Iskele />
      </g>
    </svg>
  );
}
