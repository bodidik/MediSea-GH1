/**
 * MediSea işaretinin RASTER hâli — `next/og` (Satori) ile PNG üretilen her
 * simge buradan çizer: iOS dokunma simgesi (`app/apple-icon.tsx`) ve Android
 * ana ekran simgeleri (`app/ikon/[ad]/route.tsx`).
 *
 * Geometri `app/icon.svg` ile BİREBİR aynı (lacivert zemin, iki dalga, altın
 * güneş). SVG dosyası tarayıcı sekmesine olduğu gibi gidiyor, o yüzden orada
 * ayrıca duruyor; PNG yüzeylerinin hepsi TEK kopyadan çıkıyor.
 *
 * `dolgu`: işaretin kenardan içeri çekilme oranı. Android "maskable" simgeyi
 * daireye, damlaya ya da kareye KIRPABİLİR; güvenli bölge merkezdeki %80'lik
 * dairedir. Düz simgede 0 (apple-icon'la aynı çıktı), maskable'da ~0.18.
 */
export const MARKA_LACIVERT = "#1a3a6b";

export function MarkaIsareti({ boyut, dolgu = 0 }: { boyut: number; dolgu?: number }) {
  const ic = Math.round(boyut * (1 - 2 * dolgu));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: MARKA_LACIVERT,
      }}
    >
      {/* Satori, birden fazla çocuğu olan her div'de açık `display` ister
          (CLAUDE.md'de kayıtlı tuzak). Tek çocuk: gömülü SVG. */}
      <svg width={ic} height={ic} viewBox="0 0 64 64">
        <path
          d="M8 40c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M8 50c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.45"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="46" cy="18" r="6" fill="#fbbf24" />
      </svg>
    </div>
  );
}
