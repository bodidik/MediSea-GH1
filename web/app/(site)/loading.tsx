/**
 * Yükleme durumu — açık site sayfaları arasında geçişte (27 Eylül 2026).
 *
 * Sabah denizinde sallanan küçük bir yelkenli; salınım `deniz-salinim`
 * sınıfından gelir ve hareket azaltma tercihinde evrensel kuralla durur.
 * Çizim süs (`aria-hidden`); ekran okuyucuya yalnız "Yükleniyor" durumu
 * duyurulur.
 */
export default function Yukleniyor() {
  return (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 py-16">
      <svg aria-hidden="true" className="h-16 w-24" viewBox="0 0 96 64" fill="none">
        <g className="deniz-salinim">
          <path d="M48 8 Q62 24 65 44 H48 Z" fill="#ffffff" stroke="#1a3a6b" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M45 14 Q34 28 30 44 H45 Z" fill="#bfe8e6" stroke="#1a3a6b" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M26 46 H70 L64 53 H32 Z" fill="#1a3a6b" />
          <path d="M47 6 L55 9 L47 12" fill="#f59e0b" />
        </g>
        <path
          d="M4 58 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0"
          stroke="#7dd3fc"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm font-semibold text-slate-600">Yükleniyor…</span>
    </div>
  );
}
