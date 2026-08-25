"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

export default function CalvertPage() {
  const [gfr, setGfr] = React.useState("90");
  const [auc, setAuc] = React.useState("5");

  const gfrNum = parseLocaleNumber(gfr);
  const aucNum = parseLocaleNumber(auc);

  /**
   * AUC'NİN HİÇ SINIRI YOKTU — ve doz DOĞRUDAN onunla ölçekleniyor.
   *
   * GFR tarafı zaten korumalıydı (aşağıdaki 125 kırpması). AUC tarafında
   * hiçbir kapı yoktu; oysa `dose = AUC × (GFR + 25)` olduğu için AUC'ye
   * yazılan bir yazım hatası dozu doğrudan aynı oranda büyütüyor.
   *
   * Tarayıcıda ölçüldü (GFR 100):
   *
   *   AUC 5   ->  625 mg      (doğru)
   *   AUC 50  ->  6250 mg     ← tek fazladan hane, ON KAT karboplatin
   *   GFR "abc" + AUC 5 -> 125 mg   ← sessizce YETERSİZ doz
   *
   * Alanın KENDİ ipucu "Tipik: 4–6" diyor; ekran beklediği aralığı yazıp
   * 50'yi sessizce kabul ediyordu — belgedeki "ekran kendisiyle çelişiyor"
   * şekli. İkinci satır ters yönde ve daha sinsi: GFR'ye düşen bir harf
   * kanser hastasına yetersiz doz hesaplatıyor, üstelik hiçbir uyarı yok.
   *
   * Bu araç, kapalı sanılan üst sınır süpürmesinin dışında kalmıştı çünkü
   * ölçüt "alt sınırı var, üstü yok" arıyordu; burada İKİSİ DE yoktu.
   * (`basdai` ile aynı kör nokta.)
   *
   * Sınırlar klinik eşik DEĞİL, makullük sınırı: yayımlanmış karboplatin
   * protokollerinde AUC 1,5–7 olağan, kök hücre desteğiyle 12'ye çıkabilir.
   * 12 tavanı hiçbir gerçek protokolü reddetmiyor. GFR için 1–200: 125
   * kırpması formülün kendi kuralı, bu ayrı bir makullük sınırı.
   */
  const gfrGecerli = sayiGirildiMi(gfr) && gfrNum >= 1 && gfrNum <= 200;
  const aucGecerli = sayiGirildiMi(auc) && aucNum >= 1 && aucNum <= 12;
  const hesaplanabilir = gfrGecerli && aucGecerli;

  // GFR 125 mL/dak ile sınırlandırılır. Calvert formülü ölçülmüş GFR ile
  // türetilmişti; tahmini GFR (Cockcroft-Gault, CKD-EPI) yüksek değerlerde
  // gerçek klirensi abartıyor ve doz aşımına yol açıyordu. Sınırı koymamak
  // sessiz bir aşırı doz demektir — arayüz zaten sınırı vaat ediyordu.
  const gfrKullanilan = Math.min(gfrNum, 125);
  const sinirUygulandi = gfrGecerli && gfrNum > 125;
  const dose = hesaplanabilir
    ? Math.round(aucNum * (gfrKullanilan + 25) * 10) / 10
    : null;

  /* Sessiz boşluk yerine sebep: hangi alanın ne beklediği ADIYLA söyleniyor. */
  const eksikAlan = [
    !gfrGecerli && "GFR (1–200 mL/dak)",
    !aucGecerli && "hedef AUC (1–12 mg/mL·dak)",
  ].filter(Boolean) as string[];

  const params = { gfr: gfrNum, auc: aucNum };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="calvert" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🎗️</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Calvert Formülü</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Karboplatin AUC Bazlı Doz Hesaplama</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">GFR (mL/dak)</span>
            <input type="text" inputMode="decimal" value={gfr} onChange={e => setGfr(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cockcroft-Gault veya ölçülmüş GFR — 125 mL/dak ile sınırlandırılır</span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hedef AUC (mg/mL·dak)</span>
            <input type="text" inputMode="decimal" value={auc} onChange={e => setAuc(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipik: 4–6 (monoterapi/kombinasyona göre)</span>
          </label>
        </div>

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
          <div aria-hidden="true" className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">AUC</div>
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">TOPLAM DOZ</span>
          <div className="text-7xl font-black text-white drop-shadow-lg">{dose || "–"}</div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">mg (mutlak doz)</span>
          {sinirUygulandi && (
            <div className="mt-4 rounded-full bg-amber-400 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-950">
              GFR {gfrNum} → 125 ile sınırlandırıldı
            </div>
          )}
        </div>

        {eksikAlan.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4" role="alert">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Doz hesaplanamıyor</p>
            <p className="text-[11px] font-bold text-slate-600">
              Makul bir değer bekleyen alan: {eksikAlan.join(" · ")}.
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Calvert formülü: Doz (mg) = AUC × (GFR + 25). Bu hesap GFR&apos;yi 125 mL/dak ile sınırlar: formül ölçülmüş GFR ile türetilmiştir, tahmini GFR yüksek değerlerde klirensi abartıp doz aşımına yol açar. Doz hesabı, kurumun kemoterapi protokolüne göre teyit edilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
