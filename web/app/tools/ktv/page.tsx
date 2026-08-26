"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * MODUL DUZEYINDE tanimli. Sayfa bileseninin ICINDE tanimlanirsa her render'da
 * yeni bir bilesen kimligi olusur, React <input>u sokup yeniden takar ve
 * kullanici her tus vurusunda odagi kaybeder.
 */
const Input = ({ label, value, set, ph, unit }: { label: string; value: string; set: (v: string) => void; ph: string; unit: string }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
    <div className="relative">
      <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all pr-12" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">{unit}</span>
    </div>
  </label>
);

export default function KtvPage() {
  const [preBun,  setPreBun]  = React.useState("");
  const [postBun, setPostBun] = React.useState("");
  const [time,    setTime]    = React.useState("");   // dakika
  const [uf,      setUf]      = React.useState("");   // litre
  const [postWt,  setPostWt]  = React.useState("");   // kg

  const pre  = parseLocaleNumber(preBun);
  const post = parseLocaleNumber(postBun);
  const t    = parseLocaleNumber(time);    // dakika
  const ufL  = parseLocaleNumber(uf);
  const wt   = parseLocaleNumber(postWt);

  /**
   * İKİ KUSUR: yön denetimi yoktu ve makullük sınırı yoktu.
   *
   * 1) POST < PRE ŞART. Diyaliz üreyi DÜŞÜRÜR; post-diyaliz BUN pre'den
   *    yüksek olamaz. İki alanın yer değiştirmesi çok olası bir veri girişi
   *    hatası ve araç onu sessizce hesaplıyordu. Ölçüldü (pre 20 · post 60):
   *
   *      spKt/V -1.27 · eKt/V -1.05 · URR -200%
   *
   *    Eksi Kt/V ve eksi URR fiziksel olarak imkânsız; ekran kendi
   *    saçmalığını gösteriyor ama yine de "YETERSİZ DİYALİZ" hükmü basıyordu.
   *    Belgedeki "eksi bir MELD mümkün değildir" sınıfının aynısı.
   *
   * 2) Makullük sınırı: BUN 2–300 mg/dL · seans 30–600 dk · UF 0–10 L ·
   *    ağırlık 20–300 kg. Ölçüldü — 9999 dakika girildiğinde `R − 0.008×t`
   *    eksiye düşüyor, `ln` tanımsız oluyor ve Kt/V "—" çıkıyordu.
   *
   * `sayiGirildiMi` ayrıca çöp girdiyi eliyor; boş alan zaten eleniyordu.
   */
  const makul = (ham: string, alt: number, ust: number) => {
    if (!sayiGirildiMi(ham)) return false;
    const n = parseLocaleNumber(ham);
    return n >= alt && n <= ust;
  };

  const preOk  = makul(preBun, 2, 300);
  const postOk = makul(postBun, 2, 300);
  const tOk    = makul(time, 30, 600);
  const ufOk   = makul(uf, 0, 10);
  const wtOk   = makul(postWt, 20, 300);
  /* Yön: diyaliz üreyi düşürür. Eşitlik de kabul edilmiyor — hiç temizlik
     olmaması ölçüm hatasına işaret eder ve `ln(0)` tanımsızdır. */
  const yonDogru = preOk && postOk && post < pre;

  const hasAll = yonDogru && tOk && ufOk && wtOk;
  const tHours = t / 60;

  // Daugirdas II (Single Pool)
  const R    = hasAll ? post / pre : null;
  const spKtV = hasAll && R !== null
    ? -Math.log(R - 0.008 * tHours) + (4 - 3.5 * R) * (ufL / wt)
    : null;

  // Equilibrated Kt/V (Daugirdas & Schneditz)
  const eKtV = spKtV !== null
    ? spKtV - (0.6 * spKtV / tHours) + 0.03
    : null;

  /* URR yalnızca pre/post'a bağlı — süre, UF ve ağırlıktan bağımsız.
     O yüzden kendi geçerliliğine bakıyor (bkz. SOFA'daki organ başına
     geçerlilik dersi): süre alanı bozuksa URR yine de gösterilebilir. */
  const urr = yonDogru ? (1 - post / pre) * 100 : null;

  /**
   * TEK SAYI -- ama HESAP yuvarlanmaz, yalnizca GOSTERIM ve ESIK.
   *
   * `eKtV` `spKtV`den turuyor, yani spKtV'yi yuvarlayip eKtV'ye vermek
   * belgedeki "yuvarlanmis deger ikinci hesaba girmesin" kuralini cignerdi.
   * O yuzden ham degerler korunuyor; ekrana basilan ve ESIKLE karsilastirilan
   * degerler ayrica bir kez yuvarlaniyor.
   *
   * OLCULDU: pre 50 · post 17 · 180 dk · UF 1.1 L · 70 kg -> ham 1.19617 ->
   * ekranda "1.20" ama hukum "YETERSIZ DIYALIZ" (esik >= 1.2). Ekran, kendi
   * esigine esit bir sayi gosterirken yetersizlik ilan ediyordu.
   */
  const spGos  = spKtV !== null ? Math.round(spKtV * 100) / 100 : null;
  const eGos   = eKtV  !== null ? Math.round(eKtV  * 100) / 100 : null;
  const urrGos = urr   !== null ? Math.round(urr) : null;

  const spOk  = spGos  !== null && spGos  >= 1.2;
  const eOk   = eGos   !== null && eGos   >= 1.0;
  const urrOk = urrGos !== null && urrGos >= 65;

  /**
   * "YETERSİZ DİYALİZ" bir İDDİA — hesaplanamayan değer onu üretmemeli.
   *
   * Eski hüküm `spOk && eOk && urrOk ? "SAĞLANDI" : "YETERSİZ"` idi; herhangi
   * bir indeks `null` olduğunda üçlü işleç doğrudan "YETERSİZ DİYALİZ —
   * PROTOKOL GÖZDEN GEÇİRİLMELİ" dalına düşüyordu. Ölçüldü: 9999 dakika
   * girildiğinde Kt/V "—" çıkıyor ama araç yine de yetersizlik ilan ediyordu.
   * `kdigo-aki`deki "AKI Kriteri Yok" ile aynı sınıf: değerlendirememek ile
   * olumsuz değerlendirmek AYNI ŞEY DEĞİL.
   */
  const degerlendirilebilir = spKtV !== null && eKtV !== null && urr !== null;
  const yeterli = degerlendirilebilir && spOk && eOk && urrOk;

  /* Sonuç panelinin çizilme ölçütü: kullanıcı beş alanı da doldurmuş, yani
     bir cevap BEKLİYOR. Boş formda panel hiç görünmüyor. */
  const tumAlanlarDolu = [preBun, postBun, time, uf, postWt].every((x) => x.trim() !== "");


  const ResultCard = ({ label, value, target, unit, ok }: { label: string; value: number | null; target: string; unit: string; ok: boolean | null }) => (
    <div className={`rounded-2xl p-4 text-center border ${
      value === null ? 'bg-slate-50 border-slate-200' :
      ok ? 'bg-emerald-900 border-emerald-900' : 'bg-rose-900 border-rose-900'}`}>
      <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${value === null ? 'text-slate-400' : 'text-white/85'}`}>{label}</div>
      <div className={`text-3xl font-black ${value === null ? 'text-slate-300' : 'text-white'}`}>
        {value !== null ? value.toFixed(2) : '—'}
      </div>
      <div className={`text-[9px] font-bold mt-1 ${value === null ? 'text-slate-400' : ok ? 'text-emerald-300' : 'text-rose-300'}`}>
        {value !== null ? (ok ? `✓ Hedef ${target} ${unit}` : `✗ Hedef ${target} ${unit}`) : `Hedef: ${target} ${unit}`}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="ktv" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩺</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Kt/V — Daugirdas II</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Hemodiyaliz Yeterliliği · spKt/V · eKt/V · URR</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seans Parametreleri</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pre-diyaliz BUN" value={preBun}  set={setPreBun}  ph="ör. 85"  unit="mg/dL" />
            <Input label="Post-diyaliz BUN" value={postBun} set={setPostBun} ph="ör. 22"  unit="mg/dL" />
            <Input label="Seans Süresi" value={time}    set={setTime}    ph="ör. 240" unit="dakika" />
            <Input label="Ultrafiltrasyon" value={uf}      set={setUf}      ph="ör. 2.5" unit="Litre" />
          </div>
          <Input label="Post-diyaliz Ağırlık" value={postWt} set={setPostWt} ph="ör. 70" unit="kg" />
        </div>

        {/* Formül gösterimi */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
          <p className="text-[9px] font-black text-blue-900/80 uppercase tracking-widest mb-2">Daugirdas II Formülleri</p>
          <p className="text-[10px] font-bold text-blue-900 font-mono">spKt/V = −ln(R − 0.008×t) + (4 − 3.5×R) × UF/W</p>
          <p className="text-[10px] font-bold text-blue-900 font-mono">eKt/V = spKt/V − (0.6×spKt/V / t) + 0.03</p>
          <p className="text-[9px] font-bold text-blue-900/80 mt-1">R = BUN(post)/BUN(pre) · t = seans süresi (saat) · UF (L) · W = post ağırlık (kg)</p>
          {R !== null && (
            <p className="text-[10px] font-black text-blue-900 mt-2">R = {R.toFixed(3)} · t = {tHours.toFixed(2)} saat</p>
          )}
        </div>

        {/* Sonuçlar */}
        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="spKt/V" value={spGos} target="≥ 1.2" unit="" ok={spGos !== null ? spGos >= 1.2 : null} />
          <ResultCard label="eKt/V"  value={eGos}  target="≥ 1.0" unit="" ok={eGos  !== null ? eGos  >= 1.0 : null} />
          <div className={`rounded-2xl p-4 text-center border ${
            urr === null ? 'bg-slate-50 border-slate-200' :
            urrOk ? 'bg-emerald-900 border-emerald-900' : 'bg-rose-900 border-rose-900'}`}>
            <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${urr === null ? 'text-slate-400' : 'text-white/85'}`}>URR</div>
            <div className={`text-3xl font-black ${urr === null ? 'text-slate-300' : 'text-white'}`}>
              {urrGos !== null ? `${urrGos}%` : '—'}
            </div>
            <div className={`text-[9px] font-bold mt-1 ${urr === null ? 'text-slate-400' : urrOk ? 'text-emerald-300' : 'text-rose-300'}`}>
              {urr !== null ? (urrOk ? "✓ Hedef ≥ 65%" : "✗ Hedef ≥ 65%") : "Hedef: ≥ 65%"}
            </div>
          </div>
        </div>

        {/*
          SESSİZ BOŞLUK YERİNE SEBEP. Panel bir dönem `hasAll && spKtV !== null`
          ile sarılıydı; değerler geçersiz olduğunda hiç çizilmiyordu ve
          kullanıcı BEŞ ALANI DA DOLDURMUŞ olmasına rağmen hiçbir şey
          görmüyordu — "DEĞERLENDİRİLEMEDİ" dalı da fiilen ölü koddu.

          Şimdi ölçüt "kullanıcı sonuç bekliyor mu": beş alan da doluysa panel
          çiziliyor ve hesaplanamıyorsa NEDENİ yazıyor. Boş formda hâlâ hiçbir
          şey basılmıyor (bkz. belgedeki "girdisiz de aç" kuralı).
        */}
        {tumAlanlarDolu && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${!degerlendirilebilir ? 'bg-slate-50 border-slate-200' : yeterli ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest mb-2">SONUÇ</div>
            <p className={`text-xl font-black italic tracking-tight ${!degerlendirilebilir ? 'text-slate-600' : yeterli ? 'text-emerald-700' : 'text-rose-700'}`}>
              {!degerlendirilebilir ? "DEĞERLENDİRİLEMEDİ — değerleri kontrol edin" : yeterli ? "HEMODİYALİZ YETERLİLİĞİ SAĞLANDI" : "YETERSİZ DİYALİZ — PROTOKOL GÖZDEN GEÇİRİLMELİ"}
            </p>
            {!degerlendirilebilir && (
              <p role="alert" className="mt-2 text-[11px] font-bold text-slate-600">
                {preOk && postOk && post >= pre
                  ? "Post-diyaliz BUN, pre-diyaliz BUN'dan DÜŞÜK olmalı — diyaliz üreyi azaltır. İki alan yer değiştirmiş olabilir."
                  : "Bir değer makul aralığın dışında: BUN 2–300 mg/dL · seans 30–600 dk · UF 0–10 L · ağırlık 20–300 kg."}
              </p>
            )}
            {degerlendirilebilir && !yeterli && (
              <div className="mt-3 space-y-1 text-[11px] font-bold text-rose-700">
                {!spOk  && <p>• spKt/V {spGos!.toFixed(2)} &lt; 1.2 — seans süresini veya kan akımını artırın</p>}
                {!urrOk && urr !== null && <p>• URR %{urr.toFixed(0)} &lt; 65 — BUN azalması yetersiz</p>}
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ pre, post, t, uf: ufL, wt }} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              KDOQI kılavuzu: 3×/hafta HHD için spKt/V ≥ 1.2 (eKt/V ≥ 1.0) hedeflenir. Post-BUN örneği kan pompası durdurulduktan 15–30 sn sonra alınmalıdır. Geri sirkülasyon eKt/V'yi etkiler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
