"use client";
// C:\Users\hucig\Medknowledge\web\app\components\SeyirDefteri.tsx
//
// Deniz sürprizlerinin defteri (19 Eylül 2026). Görülmemiş türler yalnızca
// İPUCUYLA görünür — neyin nasıl geldiğini söylemek sürprizi öldürürdü, hiç
// söylememek de defteri anlamsız bırakırdı. Aç/kapa anahtarı burada: tek
// tıkla kapatılabilmesi özelliğin ön koşuluydu.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  seyirOku,
  surprizAcikMi,
  surprizAyarla,
  TURLER,
  TUR_SIRASI,
  type Seyir,
  type Tur,
} from "@/app/lib/seyir";
import { FenerSvg, MartiSvg, OkaliptusSvg, YelkenliSvg } from "@/app/components/DenizSurprizleri";
import { tarihYazisi } from "@/app/lib/tarih";

export function TurIkon({ tur, className = "h-6 w-6" }: { tur: Tur; className?: string }) {
  if (tur === "yelkenli") return <YelkenliSvg className={className} />;
  if (tur === "marti") return <MartiSvg className={`${className} text-slate-500`} />;
  if (tur === "fener") return <FenerSvg className={className} isik={false} />;
  if (tur === "okaliptus") return <OkaliptusSvg className={className} />;
  return <span className="text-lg leading-none">{TURLER[tur].ikon}</span>;
}

export default function SeyirDefteri() {
  const { status } = useSession();
  const [seyir, setSeyir] = useState<Seyir | null>(null);
  const [acik, setAcik] = useState(true);

  useEffect(() => {
    const oku = () => {
      setSeyir(seyirOku());
      setAcik(surprizAcikMi());
    };
    oku();
    window.addEventListener("medisea:changed", oku);
    window.addEventListener("medisea:deniz-ayar", oku);
    window.addEventListener("storage", oku);
    return () => {
      window.removeEventListener("medisea:changed", oku);
      window.removeEventListener("medisea:deniz-ayar", oku);
      window.removeEventListener("storage", oku);
    };
  }, []);

  if (!seyir) return null;

  const sayi: Partial<Record<Tur, number>> = {};
  for (const k of seyir.defter) sayi[k.tur] = (sayi[k.tur] ?? 0) + 1;
  const kesfedilen = TUR_SIRASI.filter((t) => sayi[t]).length;
  const sonlar = [...seyir.defter].sort((a, b) => b.t - a.t).slice(0, 6);

  return (
    <section className="mt-6 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/60 to-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <span aria-hidden="true">⚓</span> Seyir defteri
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {kesfedilen} / {TUR_SIRASI.length} tür
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TUR_SIRASI.map((t) => {
          const n = sayi[t] ?? 0;
          return (
            <li
              key={t}
              className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 ${
                n ? "border-sky-100 bg-white" : "border-dashed border-slate-200 bg-transparent"
              }`}
            >
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center">
                {n ? <TurIkon tur={t} /> : <span className="text-base font-black text-slate-300">?</span>}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-black uppercase tracking-tight text-blue-950">
                  {n ? TURLER[t].ad : "Henüz görülmedi"}
                </span>
                <span className="block text-[11px] leading-snug text-slate-600">
                  {n ? `${n} kez görüldü` : TURLER[t].ipucu}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {sonlar.length > 0 && (
        <ol className="mt-3 space-y-1">
          {sonlar.map((k) => (
            <li key={k.id} className="flex items-center gap-2 text-[12px] text-slate-600">
              <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center">
                <TurIkon tur={k.tur} className="h-5 w-5" />
              </span>
              <span className="font-bold text-blue-950">{TURLER[k.tur].ad}</span>
              <span className="min-w-0 flex-1 truncate">
                {k.neden ? `${k.neden} · ` : ""}
                {k.baslik ? (
                  <Link href={k.yol} className="underline decoration-sky-200 underline-offset-2 hover:text-blue-700">
                    {k.baslik}
                  </Link>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums text-slate-500">
                {tarihYazisi(k.t, { day: "numeric", month: "short" })}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
        {status === "authenticated"
          ? "Uzun okumaların arasında denizde bir şeyler görünebilir. Soru ve vaka çözerken hiçbir şey çıkmaz."
          : "Deniz sürprizleri oturum açmış kullanıcılara görünür."}
      </p>

      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[12px] font-bold text-slate-700">
        <input
          type="checkbox"
          checked={acik}
          onChange={(e) => surprizAyarla(e.target.checked)}
          className="h-4 w-4 accent-blue-900"
        />
        Deniz sürprizleri açık
      </label>
    </section>
  );
}
