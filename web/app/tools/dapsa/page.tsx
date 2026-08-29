"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

export default function DapsaPage() {
  const [tjc, setTjc] = React.useState("");
  const [sjc, setSjc] = React.useState("");
  const [pain, setPain] = React.useState("");
  const [pga, setPga] = React.useState("");
  const [crp, setCrp] = React.useState("");

  const t = parseLocaleNumber(tjc);
  const s = parseLocaleNumber(sjc);
  const pa = parseLocaleNumber(pain);
  const p = parseLocaleNumber(pga);
  const c = parseLocaleNumber(crp);
  const score = t + s + pa + p + c;
  /**
   * MEŞRU SIFIR — eski koşul `t > 0 || s > 0 || …` idi ve iki işi birden
   * yapmaya çalışıyordu: boş formu bastırmak VE sonucu göstermek.
   * Boş formu doğru bastırıyordu ama ölçüldü ki bütün alanlara 0 girildiğinde
   * de susuyordu — oysa hassas eklem 0, şiş eklem 0 ve global değerlendirme 0
   * REMİSYONUN TANIMI; klinisyenin en çok belgelemek istediği durum tam da o.
   *
   * Doğru ölçüt "değer sıfırdan büyük mü" değil, "alan DOLDURULDU mu".
   */
  /* `Number.isFinite(parseLocaleNumber(x))` ÇÖP GİRDİYİ GEÇİRİYORDU: fonksiyon
     "abc" için 0 döndürüyor ve 0 sonludur. Ölçüldü — alanlara harf yazmak
     "0 · REMİSYON" bastırıyordu. Kapı artık ham dizeye bakıyor. */
  /**
   * ÜST SINIR — etiket "(0–68)" / "(0–66)" / "(0–10 cm VAS)" ilan ediyordu
   * ama kapı yalnızca "girildi mi" diyordu. Kardeş araçlar `cdai` ve `sdai`
   * aynı kusuru taşıyordu ve orada ÖLÇÜLDÜ: 999 girilince skor 3996 çıkıyor,
   * tek alana fazladan bir sıfır bandı YÜKSEK AKTİVİTE'ye kaydırıyordu.
   *
   * Sınırlar TANIMSAL: DAPSA'da TJC 68, SJC 66 eklemli sayımlardır (PsA'da
   * daha geniş eklem seti), VAS 10 cm'dir. CRP mg/dL; 50 mg/dL = 500 mg/L,
   * yani `das28`in CRP tavanıyla aynı yer. Sıfır MEŞRU (normal CRP,
   * remisyondaki eklem sayısı) — alt sınır 0.
   */
  const araliktaMi = (ham: string, alt: number, ust: number) => {
    if (!sayiGirildiMi(ham)) return false;
    const n = parseLocaleNumber(ham);
    return n >= alt && n <= ust;
  };
  /* ALAN LİSTESİ TEK KAYNAK — bkz. cdai: tavan sayıları bir dönem hem burada
     hem render dizisinde elle yazılıydı. Girdi, sebep kartı ve `aria-invalid`
     artık aynı diziden besleniyor. */
  const ALANLAR = [
    { ham: tjc, set: setTjc, ad: "TJC", etiket: "TJC — Hassas Eklem Sayısı", alt: 0, ust: 68, ph: "0–68" },
    { ham: sjc, set: setSjc, ad: "SJC", etiket: "SJC — Şiş Eklem Sayısı", alt: 0, ust: 66, ph: "0–66" },
    { ham: pain, set: setPain, ad: "Ağrı VAS", etiket: "Hasta Ağrı Değerlendirme (0–10 cm VAS)", alt: 0, ust: 10, ph: "0–10" },
    { ham: pga, set: setPga, ad: "PGA", etiket: "PGA — Hasta Genel Değerlendirme (0–10 cm VAS)", alt: 0, ust: 10, ph: "0–10" },
    { ham: crp, set: setCrp, ad: "CRP", etiket: "CRP (mg/dL)", alt: 0, ust: 50, ph: "ör. 0.8" },
  ];
  const hasResult = ALANLAR.every((a) => araliktaMi(a.ham, a.alt, a.ust));
  const sorunlu = ALANLAR.filter((a) => a.ham.trim() !== "" && !araliktaMi(a.ham, a.alt, a.ust));
  const eksik = ALANLAR.filter((a) => a.ham.trim() === "");
  const sebepGoster = !hasResult && ALANLAR.some((a) => a.ham.trim() !== "");

  const getResult = () => {
    if (score <= 4)   return { label: "REMİSYON", sub: "DAPSA ≤ 4", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score <= 14)  return { label: "DÜŞÜK AKTİVİTE", sub: "DAPSA 5–14", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
    if (score <= 28)  return { label: "ORTA AKTİVİTE", sub: "DAPSA 15–28", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK AKTİVİTE", sub: "DAPSA > 28", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = hasResult ? getResult() : null;
  const params = { t, s, pa, p, c };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="dapsa" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦴</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">DAPSA</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Disease Activity in PSoriatic Arthritis — Psoriatik Artrit Aktivite Skoru</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DAPSA = TJC + SJC + Ağrı + PGA + CRP</p>
          {ALANLAR.map((a) => {
            /* aria-invalid YALNIZCA dolu ama geçersiz alanda: boş alan
               "geçersiz" değil "henüz girilmemiş". */
            const gecersiz = a.ham.trim() !== "" && !araliktaMi(a.ham, a.alt, a.ust);
            return (
              <label key={a.ad} className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{a.etiket}</span>
                <input type="text" inputMode="decimal" value={a.ham}
                  onChange={e => a.set(e.target.value)} placeholder={a.ph}
                  aria-invalid={gecersiz ? true : undefined}
                  aria-describedby={sebepGoster && gecersiz ? "dapsa-sebep" : undefined}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              </label>
            );
          })}

          {hasResult && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DAPSA SKORU</span>
              <span className="text-4xl font-black text-blue-900">{Math.round(score * 10) / 10}</span>
            </div>
          )}
        </div>


        {sebepGoster && (
          <div id="dapsa-sebep" role="alert" className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-amber-200 shadow-sm">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Hesaplanamıyor</p>
            <p className="text-[11px] text-slate-700 leading-relaxed mt-2">
              {sorunlu.length > 0
                ? `Şu alan(lar) aralık dışında ya da sayı değil: ${sorunlu.map((a) => `${a.ad} (${a.alt}–${a.ust})`).join(" · ")}. Sıfır geçerlidir.`
                : `Şu alan(lar) bekleniyor: ${eksik.map((a) => `${a.ad} (${a.alt}–${a.ust})`).join(" · ")}.`}
            </p>
          </div>
        )}
        <SonucDuyuru metin={result ? result.label : null} />
        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest mb-2">AKTİVİTE SINIFI</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color}`}>{result.sub}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Remisyon", r: "≤ 4", c: "bg-emerald-100 text-emerald-700" },
                { l: "Düşük", r: "5–14", c: "bg-sky-100 text-sky-700" },
                { l: "Orta", r: "15–28", c: "bg-amber-100 text-amber-700" },
                { l: "Yüksek", r: "> 28", c: "bg-rose-100 text-rose-700" },
              ].map(x => (
                <div key={x.l} className={`rounded-xl p-2 text-center text-[9px] font-black uppercase tracking-widest ${x.c}`}>
                  <div>{x.l}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              DAPSA yalnızca periferik eklem tutulumunu değerlendirir; deri (PASI), entezit, daktilit ve aksiyel tutulum dahil değildir. Minimal Disease Activity (MDA) kriterleriyle birlikte kullanın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
