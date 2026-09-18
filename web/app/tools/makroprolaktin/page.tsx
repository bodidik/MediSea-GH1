"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Makroprolaktin taraması — polietilen glikol (PEG) çöktürmesi sonrası geri kazanım.
 *   Geri kazanım (%) = PEG sonrası prolaktin / toplam prolaktin × 100
 *   < %40 makroprolaktin baskın · %40–60 gri bölge · > %60 monomerik prolaktin baskın
 * Monomerik (PEG sonrası) değer, PEG sonrası için geçerli referans aralığıyla karşılaştırılmalı;
 * kullanıcı o aralığın üst sınırını girerse araç "gerçek hiperprolaktinemi" sorusunu da yanıtlar.
 */
const PRL_UST = 20000;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function MakroprolaktinPage() {
  const [toplam, setToplam] = React.useState("");
  const [peg, setPeg] = React.useState("");
  const [ust, setUst] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const toplamOk = sayiGirildiMi(toplam) && n(toplam) > 0 && n(toplam) <= PRL_UST;
  const pegOk = sayiGirildiMi(peg) && n(peg) >= 0 && n(peg) <= PRL_UST;
  const tutarsiz = toplamOk && pegOk && n(peg) > n(toplam) * 1.1;
  const ustGirildi = ust.trim() !== "";
  const ustOk = sayiGirildiMi(ust) && n(ust) > 0 && n(ust) <= 200;

  const eksik = [
    !toplamOk && `toplam prolaktin (0–${PRL_UST})`,
    !pegOk && "PEG sonrası prolaktin",
  ].filter(Boolean) as string[];

  const geri = eksik.length === 0 && !tutarsiz ? Math.round((n(peg) / n(toplam)) * 100) : null;
  const yorum =
    geri === null ? null
      : geri < 40 ? { t: "Makroprolaktin baskın", a: "Hiperprolaktineminin büyük kısmı biyolojik olarak inaktif makroprolaktinden — genellikle görüntüleme ve tedavi gerekmez.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" }
      : geri > 60 ? { t: "Monomerik prolaktin baskın", a: "Gerçek (monomerik) hiperprolaktinemi — ilaç, gebelik, hipotiroidi, böbrek yetmezliği dışlandıktan sonra hipofiz MR.", r: "border-rose-200 bg-rose-50 text-rose-900" }
      : { t: "Gri bölge (%40–60)", a: "Makroprolaktin ve monomerik prolaktin birlikte — PEG sonrası monomerik değeri referans aralığıyla karşılaştırın.", r: "border-amber-200 bg-amber-50 text-amber-900" };
  const monomerikYuksek = geri !== null && ustOk ? n(peg) > n(ust) : null;
  const tr = (x: number) => String(x).replace(".", ",");

  return (
    <OlcekKabugu
      slug="makroprolaktin"
      ikon="🧪"
      baslik="Makroprolaktin (PEG Geri Kazanımı)"
      altBaslik="Hiperprolaktinemide Makroprolaktin Taraması"
      paylasim={{ geri }}
      not={
        <p>
          Özellikle belirtisiz ya da tipik olmayan belirtili hiperprolaktinemide önerilir. İki değer aynı birimde (ng/mL ya da mIU/L) girilmelidir; oran
          birimden bağımsızdır. Eşikler laboratuvara ve immünoanaliz yöntemine göre değişebilir. Çok yüksek prolaktin ile orta düzey değer uyumsuzluğunda
          kanca (hook) etkisi için seyreltilmiş ölçüm istenir. Endocrine Society hiperprolaktinemi kılavuzu, Melmed S ve ark., JCEM 2011.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Toplam prolaktin</span>
            <input type="text" inputMode="decimal" value={toplam} onChange={(e) => setToplam(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">PEG sonrası prolaktin</span>
            <input type="text" inputMode="decimal" value={peg} onChange={(e) => setPeg(e.target.value)} className={girdi} />
          </label>
        </div>
        <label className="flex flex-col gap-2 sm:max-w-sm">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">PEG sonrası referans üst sınırı — isteğe bağlı (ng/mL)</span>
          <input type="text" inputMode="decimal" value={ust} onChange={(e) => setUst(e.target.value)} className={girdi} />
        </label>
      </div>
      {(tutarsiz || (ustGirildi && !ustOk)) && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          {tutarsiz ? "PEG sonrası değer toplam prolaktinden belirgin yüksek — birimleri ya da değerleri kontrol edin. " : ""}
          {ustGirildi && !ustOk ? "Referans üst sınırı 0–200 ng/mL olmalı." : ""}
        </div>
      )}

      <SonucDuyuru metin={geri !== null && yorum ? `Geri kazanım %${geri} — ${yorum.t}` : null} />
      {geri !== null && yorum ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yorum.r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">PEG geri kazanımı</p>
          <p className="text-4xl font-black">%{geri}</p>
          <p className="text-lg font-black">{yorum.t}</p>
          <p className="text-[12px] font-bold">{yorum.a}</p>
          {monomerikYuksek !== null && (
            <p className="text-[12px] font-black">
              Monomerik prolaktin {tr(n(peg))} {monomerikYuksek ? ">" : "≤"} {tr(n(ust))} — {monomerikYuksek ? "gerçek hiperprolaktinemi var" : "monomerik prolaktin normal"}.
            </p>
          )}
        </div>
      ) : !tutarsiz ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      ) : null}
    </OlcekKabugu>
  );
}
