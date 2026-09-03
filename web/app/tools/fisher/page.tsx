"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/*
 * Fisher skalası — anevrizmal SAK'ta BT'deki kan görünümünden vazospazm /
 * gecikmiş serebral iskemi (DCI) riski.
 *
 * İKİ ÖLÇEK, TEK GİRDİ ÇİFTİ. Orijinal Fisher (Fisher et al., Neurosurgery
 * 1980) ve modifiye Fisher (Claassen et al., Stroke 2001) aynı iki BT
 * bulgusundan hesaplanıyor: SAK kalınlığı ve IVH varlığı. Ayrı ayrı
 * hesaplanmaları değil, AYRIŞTIKLARI yer klinik bilgi taşıyor — orijinal
 * ölçek IVH varlığında SAK kalınlığını yok sayıp her vakayı Grade 4'e
 * topluyor, modifiye ölçek ikisini bağımsız değerlendiriyor.
 *
 * Bu, abg (Δgap) ve sodium (desalinasyon) turlarındaki disiplinin aynısı:
 * ikinci okuma birincil hesabı DEĞİŞTİRMİYOR, ayrıştığında SÖYLÜYOR.
 */

/* Girdi 1 — subaraknoid kan. Eşik "1 mm dikey tabaka", yayımlanmış
 * tanımın kendi ölçütü; burada yeniden yorumlanmıyor. */
const SAK_SECENEKLERI: { id: string; label: string; detail: string }[] = [
  { id: "yok",   label: "Kan yok",              detail: "BT'de subaraknoid kan saptanmadı" },
  { id: "ince",  label: "İnce / diffüz (<1 mm)", detail: "Yaygın ya da ince tabaka; dikey katmanların hepsi 1 mm'nin altında" },
  { id: "kalin", label: "Kalın (≥1 mm)",        detail: "Lokalize pıhtı ve/veya 1 mm veya daha kalın dikey tabaka" },
];

/* Girdi 2 — intraventriküler / intraserebral kan. İki ölçek bunu FARKLI
 * kullanıyor; aracın gösterdiği ayrım tam olarak buradan doğuyor. */
const IVH_SECENEKLERI: { id: string; label: string; detail: string }[] = [
  { id: "yok", label: "Yok", detail: "Ventrikül içi ya da parankim içi pıhtı görülmüyor" },
  { id: "var", label: "Var", detail: "İntraventriküler (IVH) ve/veya intraserebral (İSK) pıhtı" },
];

/*
 * MODİFİYE FISHER (Claassen 2001) — monoton: derece arttıkça risk artıyor.
 * Oranlar yaygın kullanılan serilerden ve YAKLAŞIK; seriden seriye
 * değişiyor ve aracın kendi uyarısında da öyle yazıyor.
 */
const MOD_TABLO: Record<string, { derece: number; risk: string; renk: string }> = {
  "yok|yok":   { derece: 0, risk: "≈ %0",  renk: "emerald" },
  "ince|yok":  { derece: 1, risk: "≈ %24", renk: "amber" },
  "ince|var":  { derece: 2, risk: "≈ %33", renk: "amber" },
  "yok|var":   { derece: 2, risk: "≈ %33", renk: "amber" },
  "kalin|yok": { derece: 3, risk: "≈ %33", renk: "rose" },
  "kalin|var": { derece: 4, risk: "≈ %40", renk: "rose" },
};

/*
 * ORİJİNAL FISHER (1980) — MONOTON DEĞİL ve bu aracın söylemesi gereken
 * en önemli şey: en yüksek vazospazm riski Grade 4'te DEĞİL Grade 3'te.
 * Grade 4 (parankim/ventrikül içi pıhtı, sisternlerde ince ya da hiç kan
 * olmadan) Grade 3'ten daha düşük risk taşıyor. Bu yüzden sayısal bir
 * risk oranı BASILMIYOR; basılsaydı sıralı bir merdiven ima ederdi.
 */
const ORIJ_TABLO: Record<string, { derece: number; risk: string; renk: string }> = {
  "yok|yok":   { derece: 1, risk: "Düşük",  renk: "emerald" },
  "ince|yok":  { derece: 2, risk: "Düşük",  renk: "emerald" },
  "kalin|yok": { derece: 3, risk: "YÜKSEK", renk: "rose" },
  "yok|var":   { derece: 4, risk: "Değişken", renk: "amber" },
  "ince|var":  { derece: 4, risk: "Değişken", renk: "amber" },
  "kalin|var": { derece: 4, risk: "Değişken", renk: "amber" },
};

/* Tavanlar ELLE yazılmıyor — bu depoda elle yazılan sayı defalarca
 * sessizce yalana döndü (nihss'te "/ 42" tam bu şekilde bayatlamıştı). */
const MOD_TAVAN = Math.max(...Object.values(MOD_TABLO).map(v => v.derece));
const ORIJ_TAVAN = Math.max(...Object.values(ORIJ_TABLO).map(v => v.derece));
/* Orijinal ölçekte en riskli derecenin tavan OLMADIĞI da türetiliyor. */
const ORIJ_EN_RISKLI = Object.values(ORIJ_TABLO).find(v => v.risk === "YÜKSEK")?.derece ?? null;

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function FisherPage() {
  const [sak, setSak] = React.useState<string | null>(null);
  const [ivh, setIvh] = React.useState<string | null>(null);

  const tamam = sak !== null && ivh !== null;
  const anahtar = tamam ? `${sak}|${ivh}` : null;
  const mod = anahtar ? MOD_TABLO[anahtar] : null;
  const orij = anahtar ? ORIJ_TABLO[anahtar] : null;

  /*
   * AYRIŞMA — orijinal ölçek IVH varlığında SAK kalınlığını eziyor.
   * "ince + IVH" ile "kalın + IVH" orijinal ölçekte AYNI dereceyi (4)
   * alıyor, modifiye ölçekte 2 ile 4 olarak ayrılıyor.
   */
  const ivhEziyor = tamam && ivh === "var" && sak !== "kalin";
  /* Orijinal ölçeğin monoton olmadığı, yalnızca o dereceye düşüldüğünde
   * söyleniyor — her vakada tekrarlanan bir uyarı gürültü olurdu. */
  const monotonUyari = tamam && orij?.derece === ORIJ_TAVAN;

  const cMod = mod ? COLOR[mod.renk] : null;
  const cOrij = orij ? COLOR[orij.renk] : null;

  const gruplar: { id: string; baslik: string; detay: string; secenekler: { id: string; label: string; detail: string }[]; deger: string | null; ayarla: (v: string | null) => void }[] = [
    { id: "sak", baslik: "Subaraknoid kan", detay: "Sisternlerdeki en kalın dikey tabakayı ölçün", secenekler: SAK_SECENEKLERI, deger: sak, ayarla: setSak },
    { id: "ivh", baslik: "Ventrikül / parankim içi kan", detay: "IVH ve İSK aynı kovada değerlendirilir", secenekler: IVH_SECENEKLERI, deger: ivh, ayarla: setIvh },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="fisher" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩸</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Fisher Skalası</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">SAK&apos;ta vazospazm riski · modifiye 0–{MOD_TAVAN} · orijinal 1–{ORIJ_TAVAN}</p>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-2xl px-4 py-3 flex items-start gap-3">
          <span aria-hidden="true" className="text-amber-400 text-base leading-none mt-0.5">💡</span>
          <p className="text-[11px] leading-relaxed">
            İki ölçek de <span className="font-black">aynı iki BT bulgusundan</span> hesaplanıyor. Orijinal Fisher IVH varlığında SAK kalınlığını yok sayar; modifiye Fisher ikisini bağımsız değerlendirir ve <span className="font-black">monotondur</span> — bu yüzden bugün daha yaygın kullanılır.
          </p>
        </div>

        <div className="space-y-3">
          {gruplar.map(g => (
            <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p id={`grp-${g.id}`} className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{g.baslik}</p>
              <p id={`grp-d-${g.id}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{g.detay}</p>
              <div role="group" aria-labelledby={`grp-${g.id} grp-d-${g.id}`} className="space-y-1.5">
                {g.secenekler.map(o => (
                  <button aria-pressed={g.deger === o.id} key={o.id} type="button"
                    onClick={() => g.ayarla(g.deger === o.id ? null : o.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all
                      ${g.deger === o.id ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className="block text-[11px] font-black">{o.label}</span>
                    <span className={`block text-[10px] font-bold leading-snug ${g.deger === o.id ? "text-blue-100" : "text-slate-500"}`}>{o.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Önek YOK: SonucDuyuru metnin başına kendisi "Sonuç: " ekliyor. */}
        <SonucDuyuru metin={mod && orij ? `modifiye Fisher ${mod.derece}, orijinal Fisher ${orij.derece}` : null} />
        {mod && orij && cMod && cOrij ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className={`p-4 rounded-[1.5rem] border-2 border-dashed ${cMod.border} ${cMod.bg}`}>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Modifiye Fisher</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-16 h-16 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                    <span className="text-3xl font-black text-white leading-none">{mod.derece}</span>
                    <span className="text-[8px] text-blue-300">/ {MOD_TAVAN}</span>
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${cMod.badge}`}>{mod.risk}</span>
                    <p className={`text-[10px] font-bold mt-1 leading-snug ${cMod.text}`}>Semptomatik vazospazm / DCI riski (yaklaşık)</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-[1.5rem] border-2 border-dashed ${cOrij.border} ${cOrij.bg}`}>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Orijinal Fisher (1980)</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-16 h-16 rounded-2xl bg-slate-700 flex flex-col items-center justify-center shadow-lg border-t-4 border-slate-400 shrink-0">
                    <span className="text-3xl font-black text-white leading-none">{orij.derece}</span>
                    {/* slate-300 DEĞİL: globals.css slate-300/400/500 tonlarını
                        AÇIK zemin varsayarak koyulaştırıyor ve bu koyu kartta
                        kontrast 2.18'e düşüyordu (ölçüldü). slate-200 ezilmiyor:
                        8.40. Kardeş karttaki blue-300 de ezilmiyor (5.74). */}
                    <span className="text-[8px] text-slate-200">/ {ORIJ_TAVAN}</span>
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${cOrij.badge}`}>{orij.risk}</span>
                    <p className={`text-[10px] font-bold mt-1 leading-snug ${cOrij.text}`}>Nitel risk — sayısal oran basılmıyor</p>
                  </div>
                </div>
              </div>
            </div>

            {monotonUyari && (
              <div className="bg-white border-2 border-amber-300 rounded-xl px-3 py-2">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Orijinal ölçek monoton değil</p>
                <p className="text-[10px] font-bold text-slate-700 leading-relaxed mt-1">
                  Orijinal Fisher&apos;da en yüksek vazospazm riski <span className="font-black">Grade {ORIJ_EN_RISKLI}</span>&apos;tedir, Grade {ORIJ_TAVAN}&apos;te değil. Grade {ORIJ_TAVAN} sisternlerde kalın kan olmadan da verilebildiği için riski Grade {ORIJ_EN_RISKLI}&apos;ten <span className="font-black">daha düşük</span> olabilir. Derece sayısını sıralı bir risk merdiveni gibi okumayın.
                </p>
              </div>
            )}

            {ivhEziyor && (
              <div className="bg-white border-2 border-amber-300 rounded-xl px-3 py-2">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Çapraz kontrol — iki ölçek ayrışıyor</p>
                <p className="text-[10px] font-bold text-slate-700 leading-relaxed mt-1">
                  Orijinal ölçek IVH/İSK varlığında SAK kalınlığını <span className="font-black">yok sayıyor</span> ve vakayı Grade {ORIJ_TAVAN}&apos;e topluyor; modifiye ölçek aynı bulguyu <span className="font-black">Grade {mod.derece}</span> olarak ayırıyor. Kalın SAK ile ince SAK orijinal ölçekte aynı dereceye düşer — risk katmanlaması için modifiye ölçeği tercih edin.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İki BT bulgusunu da işaretleyin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Modifiye Fisher cetveli</p>
          <div className="overflow-x-auto" data-kaydir-serit>
            <table className="w-full text-[10px] font-bold text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-2 py-1.5 font-black text-blue-900">Derece</th>
                  <th className="text-left px-2 py-1.5 font-black text-blue-900">Subaraknoid kan</th>
                  <th className="text-left px-2 py-1.5 font-black text-blue-900">IVH / İSK</th>
                  <th className="text-left px-2 py-1.5 font-black text-blue-900">Vazospazm (yaklaşık)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: 0, s: "Yok", i: "Yok" },
                  { d: 1, s: "İnce / diffüz", i: "Yok" },
                  { d: 2, s: "İnce / diffüz", i: "Var" },
                  { d: 3, s: "Kalın", i: "Yok" },
                  { d: 4, s: "Kalın", i: "Var" },
                ].map(r => {
                  const kayit = Object.values(MOD_TABLO).find(v => v.derece === r.d);
                  return (
                    <tr key={r.d} className={mod?.derece === r.d ? "bg-blue-900 text-white" : "border-t border-slate-100"}>
                      <td className="px-2 py-1.5 font-black">{r.d}</td>
                      <td className="px-2 py-1.5">{r.s}</td>
                      <td className="px-2 py-1.5">{r.i}</td>
                      <td className="px-2 py-1.5">{kayit?.risk}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Her iki ölçek de <span className="font-black">anevrizmal SAK</span> için ve <span className="font-black">ilk BT</span> üzerinden geliştirilmiştir; travmatik SAK&apos;ta ya da kanamanın üzerinden günler geçtikten sonra çekilen BT&apos;de geçerli değildir. Vazospazm oranları seriden seriye belirgin değişir ve yalnızca yaklaşık verilmiştir; hiçbir derece transkraniyal Doppler, klinik izlem ya da nimodipin profilaksisinin yerini almaz. Fisher et al., Neurosurgery 1980 · Claassen et al., Stroke 2001.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
