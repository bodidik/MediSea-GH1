"use client";

/**
 * TEK SEÇİMLİ PUANLI MADDE — geriatri ölçeklerinin ortak satırı.
 *
 * Seçim ŞIKKIN SIRASIYLA saklanıyor, puanıyla değil: aynı puanı taşıyan iki
 * şık (4AT uyanıklıkta "normal" ve "hafif uykulu" ikisi de 0) puanla
 * saklansaydı tek düğme gibi davranırdı — belgede kayıtlı "seçim PUANLA
 * saklanıyor" sınıfı.
 *
 * Seçili şıkka ikinci kez basmak seçimi kaldırır (kütüphanedeki öteki
 * araçlarla aynı davranış).
 */
export type Secenek = { label: string; pts: number };

export default function SecimMaddesi({
  id,
  baslik,
  aciklama,
  secenekler,
  secili,
  onSec,
}: {
  id: string;
  baslik: string;
  aciklama?: string;
  secenekler: ReadonlyArray<Secenek>;
  secili: number | null;
  onSec: (sira: number | null) => void;
}) {
  const baslikId = `madde-${id.replace(/[^a-zA-Z0-9]+/g, "-")}`;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p id={baslikId} className="text-[12px] font-black text-blue-900 leading-snug">
        {baslik}
      </p>
      {aciklama && <p className="text-[11px] text-slate-600 leading-snug mt-1">{aciklama}</p>}
      <div role="group" aria-labelledby={baslikId} className="flex flex-wrap gap-2 mt-3">
        {secenekler.map((s, i) => {
          const aktif = secili === i;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={aktif}
              onClick={() => onSec(aktif ? null : i)}
              className={`flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl border-2 text-left text-[11px] font-bold transition-all
                ${aktif ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"}`}
            >
              <span
                className={`min-w-[1.5rem] h-6 px-1 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0
                  ${aktif ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-600"}`}
              >
                {String(s.pts).replace(".", ",")}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
