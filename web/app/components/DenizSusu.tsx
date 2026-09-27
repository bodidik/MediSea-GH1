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
 * Sabah denizi — ana sayfa hero'sunun açık zemini için (27 Eylül 2026,
 * kullanıcı kararı: "tema sabah güneşli, gece ya da derin değil, çizimsel,
 * çok belirgin olmasın"). Gökyüzünün rengi çağıranın zemininde; bu katman
 * yalnızca ufku çizer: doğan güneş, suya düşen parıltı, pastel dalga
 * katmanları, ufukta sallanan bir yelkenli, birkaç martı ve bulut.
 * Dalga bandı ~96px; çağıran içerik altına o kadar dolgu bırakır.
 */
export function SabahDenizi({ className = "" }: Props) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {/* bulutlar — beyaz gövde, ince gri-mavi kalem hattı */}
      <svg className="absolute left-4 top-8 h-12 w-40" viewBox="0 0 160 48">
        <path d="M22 40 c-12 0 -16 -14 -4 -18 c0 -12 18 -16 26 -6 c6 -14 30 -14 34 2 c12 -4 24 6 18 16 c8 2 8 6 0 6 Z" fill="#ffffff" stroke="#9fb7c9" strokeOpacity="0.55" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M112 30 c-8 0 -10 -9 -2 -12 c2 -8 14 -9 18 -2 c6 -6 18 -2 16 6 c6 0 6 8 0 8 Z" fill="#ffffff" stroke="#9fb7c9" strokeOpacity="0.45" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
      <svg className="absolute right-6 top-10 h-10 w-28 text-blue-950/30" viewBox="0 0 120 34">
        <g className="deniz-suzulus">
          <Marti x={8} y={16} />
          <Marti x={40} y={24} s={0.7} />
          <Marti x={70} y={10} s={0.55} />
        </g>
      </svg>

      {/* ufuk bandı — deniz katmanları genişliğe esner */}
      <svg className="absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 400 96" preserveAspectRatio="none">
        <path d="M0 30 H400 V96 H0 Z" fill="#d6eef2" />
        <path d="M0 50 C 70 42, 140 44, 210 52 S 340 60, 400 48 V96 H0 Z" fill="#bfe8e6" />
        <path d="M0 70 C 80 62, 160 64, 240 72 S 350 80, 400 68 V96 H0 Z" fill="#a9dbe3" />
        <path d="M0 30 H400" stroke="#8fb9c9" strokeOpacity="0.6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* doğan güneş ve suya düşen parıltı — esnemesin diye ayrı katman;
          alt kenarı bandın dibine, ufku bandın ufkuna oturur */}
      <svg className="absolute bottom-0 right-[8%] h-[8.5rem] w-32" viewBox="0 0 128 136">
        <ellipse cx="64" cy="70" rx="60" ry="30" fill="#fde68a" opacity="0.4" />
        <path d="M42 70 a22 22 0 0 1 44 0 Z" fill="#fcd34d" />
        <path d="M64 38 v-8 M40 48 l-6 -5 M88 48 l6 -5 M30 64 h-8 M98 64 h8" stroke="#f59e0b" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M56 76 h14 M50 82 h10 M66 83 h12 M44 90 h14 M64 92 h18 M38 100 h16 M60 102 h22 M46 114 h20 M72 118 h18" stroke="#fffbeb" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      {/* ufukta yelkenli — en-boy oranı korunan ayrı katman */}
      <svg className="absolute bottom-[3.9rem] left-[12%] h-9 w-9" viewBox="0 0 40 40">
        <g className="deniz-salinim">
          <path d="M20 4 Q29 16 31 28 H20 Z" fill="#ffffff" stroke="#1a3a6b" strokeOpacity="0.55" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M18 8 Q11 18 8 28 H18 Z" fill="#f8fafc" stroke="#1a3a6b" strokeOpacity="0.55" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M5 30 H35 L31 35 H9 Z" fill="#1a3a6b" fillOpacity="0.7" />
          <path d="M19 3 L25 5 L19 7" fill="#f59e0b" />
        </g>
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

/**
 * Dalga çizgisi — başlık altı ayraç (düz kenarlığın yerine). Tek renk,
 * `currentColor`; rengi çağıran verir. Süs: aria-hidden.
 */
export function DalgaCizgisi({ className = "" }: Props) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none block h-2 w-full ${className}`} viewBox="0 0 240 8" preserveAspectRatio="none">
      <path
        d="M0 4 q7.5 -4 15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0 t15 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Dümen — küçük simge (başlık yanı). Süs: aria-hidden. */
export function DumenSimgesi({ className = "" }: Props) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="1.8" />
      <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M18.7 5.3l-2.8 2.8M8.1 15.9l-2.8 2.8" />
    </svg>
  );
}
