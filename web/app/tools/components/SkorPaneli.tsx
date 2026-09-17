"use client";

import type { ReactNode } from "react";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/**
 * PUANLI ÖLÇEK SONUÇ PANELİ — geriatri ölçeklerinin ortak sonucu.
 *
 * Bant cetveli ile vurgulanan bant AYNI diziden geliyor ve NESNE
 * karşılaştırılıyor (FRAIL'de ayrı yazılmış cetvel, büyük/küçük harf farkı
 * yüzünden hiçbir bandı vurgulamıyordu). Duyuru metni de aynı bandın
 * etiketi — panel ile ekran okuyucu ayrışamaz.
 *
 * `skor === null` iken panel "eksik" kartını basar ve bu kartta hangi
 * maddelerin kaldığı SAYIYLA yazar; sessiz boşluk bırakmaz.
 */
export type Renk = "emerald" | "amber" | "orange" | "rose" | "slate";

export type Bant = { aralik: string; etiket: string; alt: string; renk: Renk };

const RENK: Record<Renk, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   badge: "bg-amber-700 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-800",  badge: "bg-orange-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-800",    badge: "bg-rose-700 text-white" },
  slate:   { bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-700",   badge: "bg-slate-700 text-white" },
};

export default function SkorPaneli({
  skor,
  payda,
  bantlar,
  aktif,
  eksikMetni,
  ek,
  skorBasligi = "SKOR",
}: {
  skor: number | null;
  payda?: number;
  bantlar: ReadonlyArray<Bant>;
  aktif: Bant | null;
  eksikMetni: string;
  ek?: ReactNode;
  /** Kutudaki üst etiket — skor olmayan sayılarda (CrCl, hücre sayısı) değiştirilir. */
  skorBasligi?: string;
}) {
  const c = aktif ? RENK[aktif.renk] : null;
  return (
    <>
      <SonucDuyuru metin={skor !== null && aktif ? aktif.etiket : null} />
      {skor !== null && aktif && c ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
              <span className="text-[9px] font-black text-blue-200 uppercase">{skorBasligi}</span>
              <span className={`${String(skor).length > 4 ? "text-lg" : String(skor).length > 3 ? "text-2xl" : "text-3xl"} font-black text-white leading-none`}>{String(skor).replace(".", ",")}</span>
              {payda !== undefined && <span className="text-[9px] text-blue-200">/ {payda}</span>}
            </div>
            <div className="min-w-0">
              <span className={`inline-block text-[10px] font-black px-3 py-1 rounded-full ${c.badge}`}>{aktif.etiket}</span>
              <p className={`text-sm font-bold mt-1.5 leading-snug ${c.text}`}>{aktif.alt}</p>
            </div>
          </div>
          {ek}
          <div className={`grid grid-cols-2 ${bantlar.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-2 text-center text-[10px]`}>
            {bantlar.map((b) => (
              <div
                key={b.etiket}
                className={`rounded-xl p-2 font-black uppercase ${b === aktif ? "bg-blue-900 text-white" : "bg-white/70 text-slate-600"}`}
              >
                <div>{b.etiket}</div>
                <div className="font-bold normal-case">{b.aralik}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{eksikMetni}</p>
        </div>
      )}
    </>
  );
}
