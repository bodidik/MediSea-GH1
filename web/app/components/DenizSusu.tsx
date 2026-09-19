/**
 * Deniz süslemeleri — "Sea" kısmının küçük dokunuşları (18 Eylül 2026).
 *
 * Hepsi SÜS: `aria-hidden`, `pointer-events-none`, metin taşımıyor. Hareket
 * `globals.css`teki `deniz-salinim` / `deniz-suzulus` sınıflarından geliyor ve
 * hareket azaltma tercihinde evrensel kuralla duruyor.
 *
 * Renkler marka paletinden: lacivert derin su (footer'ın `blue-950`i,
 * #172554), `--akdeniz-sigligi` köpüğü, ikondaki altın güneş.
 */

type Props = { className?: string };

/** Martı — iki kanatlı yay. Emojisi olmadığı için çizgiyle. */
function Marti({ x, y, s = 1, className = "" }: { x: number; y: number; s?: number; className?: string }) {
  return (
    <path
      className={className}
      d={`M${x} ${y} q${5 * s} ${-5 * s} ${10 * s} 0 q${5 * s} ${-5 * s} ${10 * s} 0`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/**
 * Kıyı — açık sayfanın (kum) lacivert footer'a (deniz) dalgayla inişi.
 * Footer'ın hemen ÜSTÜNE konur; alt kenarı footer rengiyle birebir aynı,
 * aradaki dikiş görünmesin diye bir piksel bindirilir (`-mb-px`).
 */
export function KiyiDalgasi({ className = "" }: Props) {
  return (
    <div aria-hidden="true" className={`pointer-events-none relative h-16 w-full text-slate-400 sm:h-20 ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
        {/* arka dalga — sığlık */}
        <path
          d="M0 44 C 160 20, 320 20, 480 40 S 800 64, 960 42 S 1280 18, 1440 38 V80 H0 Z"
          fill="#bfe8e6"
          opacity="0.55"
        />
        {/* orta dalga */}
        <path
          d="M0 56 C 200 36, 360 40, 540 54 S 900 72, 1080 52 S 1340 40, 1440 50 V80 H0 Z"
          fill="#1a3a6b"
          opacity="0.55"
        />
        {/* ön dalga — footer'la aynı renk */}
        <path
          d="M0 66 C 180 54, 380 56, 560 66 S 920 78, 1120 64 S 1360 58, 1440 64 V80 H0 Z"
          fill="#172554"
        />
      </svg>

      {/* yelkenli ve martılar ayrı, en-boy oranı korunan bir katmanda —
          `preserveAspectRatio="none"` dalgayı esnetiyor, tekneyi esnetmesin */}
      <svg className="absolute bottom-3 left-[8%] h-10 w-10 sm:h-12 sm:w-12" viewBox="0 0 40 40">
        <g className="deniz-salinim">
          <path d="M20 4 L20 28 L7 28 Z" fill="#ffffff" stroke="#1a3a6b" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M22 9 L22 28 L32 28 Z" fill="#bfe8e6" stroke="#1a3a6b" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5 30 H35 L31 36 H9 Z" fill="#1a3a6b" />
          <path d="M20 4 L26 6 L20 8" fill="#f5b82e" />
        </g>
      </svg>

      <svg className="absolute right-[10%] top-0 h-10 w-28 sm:w-36" viewBox="0 0 120 34">
        <g className="deniz-suzulus">
          <Marti x={6} y={18} />
          <Marti x={34} y={10} s={0.8} />
          <Marti x={60} y={22} s={0.65} />
        </g>
      </svg>
    </div>
  );
}

/**
 * Ada silueti — Ege adası: beyaz küp evler, mavi kubbe, çan kulesi.
 * Lacivert zeminde düşük opaklıkla; footer'ın sağ alt köşesine.
 */
export function AdaSilueti({ className = "" }: Props) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none ${className}`} viewBox="0 0 260 120">
      {/* tepe */}
      <path d="M0 120 C 40 96, 90 70, 150 66 S 240 80, 260 92 V120 Z" fill="#ffffff" opacity="0.05" />
      <g fill="#ffffff" opacity="0.14">
        <rect x="58" y="78" width="26" height="22" rx="1" />
        <rect x="86" y="70" width="22" height="30" rx="1" />
        <rect x="112" y="60" width="34" height="40" rx="1" />
        <rect x="150" y="72" width="24" height="28" rx="1" />
        <rect x="178" y="80" width="30" height="20" rx="1" />
        {/* çan kulesi */}
        <rect x="126" y="36" width="8" height="24" />
        <path d="M122 36 h16 l-8 -8 z" />
      </g>
      {/* mavi kubbeler */}
      <g fill="#3b82f6" opacity="0.45">
        <path d="M112 60 a17 12 0 0 1 34 0 z" />
        <path d="M178 80 a15 10 0 0 1 30 0 z" />
      </g>
      {/* pencereler */}
      <g fill="#172554" opacity="0.9">
        <rect x="64" y="86" width="5" height="7" rx="2.5" />
        <rect x="93" y="80" width="5" height="7" rx="2.5" />
        <rect x="126" y="76" width="6" height="10" rx="3" />
        <rect x="157" y="82" width="5" height="7" rx="2.5" />
        <rect x="129" y="42" width="2" height="5" />
      </g>
      {/* su çizgisi */}
      <path d="M0 108 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#bfe8e6" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Hero süsü — koyu zeminde birkaç martı ve altta iki ince dalga.
 * Ana sayfanın lacivert bölümünde ızgara deseninin yerini alır.
 */
export function HeroDenizi({ className = "" }: Props) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg className="absolute right-6 top-6 h-10 w-28 text-white/25" viewBox="0 0 120 34">
        <g className="deniz-suzulus">
          <Marti x={8} y={16} />
          <Marti x={40} y={24} s={0.7} />
          <Marti x={70} y={10} s={0.55} />
        </g>
      </svg>
      <svg className="absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 400 96" preserveAspectRatio="none">
        <path d="M0 58 C 60 44, 120 44, 200 58 S 340 72, 400 56 V96 H0 Z" fill="#bfe8e6" opacity="0.06" />
        <path d="M0 74 C 80 62, 150 64, 220 74 S 350 86, 400 72 V96 H0 Z" fill="#ffffff" opacity="0.05" />
      </svg>
    </div>
  );
}

/**
 * Gece denizi — premium'un koyu yüzeyinin dibinde sabit, çok soluk dalgalar.
 * `ydus/layout.tsx`teki eski "istersen dalga ekleriz" notunun karşılığı.
 * `main` z-10 ile üstte kalır; bu katman tıklamayı hiç almaz.
 */
export function GeceDalgasi() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-28 w-full"
      viewBox="0 0 1440 112"
      preserveAspectRatio="none"
    >
      <path d="M0 60 C 200 36, 420 40, 640 60 S 1080 84, 1280 58 S 1400 48, 1440 54 V112 H0 Z" fill="#60a5fa" opacity="0.05" />
      <path d="M0 82 C 240 66, 460 70, 700 82 S 1120 98, 1320 80 S 1420 74, 1440 78 V112 H0 Z" fill="#bfe8e6" opacity="0.045" />
    </svg>
  );
}
