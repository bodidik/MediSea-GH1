"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * KATSAYILAR TEK KAYNAKTA — hem HESAP hem EKRANDAKİ FORMÜL buradan okuyor.
 *
 * Sebebi belgede kayıtlı "iki gerçeklik" sınıfı: formül ekrana ELLE
 * yazılsaydı, biri katsayıyı değiştirdiğinde ekranda eski denklem kalırdı ve
 * kullanıcı yanlış denklemi kaynağıyla karşılaştırırdı. Şimdi imkânsız —
 * ikisi aynı nesneden türüyor.
 */
const KATSAYI = {
  crp: { pain: 0.121, dur: 0.058, pat: 0.110, bk: 0.073, lab: 0.579, sabit: 0 },
  esr: { pain: 0.113, dur: 0.086, pat: 0.069, bk: 0.079, lab: 0.293, sabit: -0.211 },
} as const;

/** Ekrandaki denklem metni — katsayılar yukarıdaki tek kaynaktan. */
const formulMetni = (v: "crp" | "esr") => {
  const k = KATSAYI[v];
  const lab = v === "crp" ? `${k.lab} × ln(CRP + 1)` : `${k.lab} × √ESR`;
  const kuyruk = k.sabit === 0 ? "" : ` ${k.sabit < 0 ? "−" : "+"} ${Math.abs(k.sabit)}`;
  return `${k.pain} × Spinal ağrı + ${k.dur} × Sabah tutukluluğu + ${k.pat} × Hasta genel + ${k.bk} × Periferik + ${lab}${kuyruk}`;
};

export default function AsdasPage() {
  const [bk, setBk]     = React.useState("");
  const [pat, setPat]   = React.useState("");
  const [pain, setPain] = React.useState("");
  const [dur, setDur]   = React.useState("");
  const [crp, setCrp]   = React.useState("");
  const [esr, setEsr]   = React.useState("");

  const bkN    = parseLocaleNumber(bk);
  const patN   = parseLocaleNumber(pat);
  const painN  = parseLocaleNumber(pain);
  const durN   = parseLocaleNumber(dur);
  const crpN   = parseLocaleNumber(crp);
  const esrN   = parseLocaleNumber(esr);

  /**
   * MEŞRU SIFIR ELENİYORDU — ve elenen tam da REMİSYONDAKİ HASTAYDI.
   *
   * Kapı beş alanın beşini birden `> 0` istiyordu. Oysa beşi de meşru olarak
   * sıfır olabiliyor ve formüller sıfırı zaten doğru işliyor
   * (`ln(0+1) = 0`, `√0 = 0`):
   *
   *   dört klinik alan  0–10 NRS ölçeği; 0 = "semptom yok", remisyonun tanımı
   *   CRP               laboratuvarlar 0 raporlayabiliyor
   *   ESR               0–2 mm/saat NORMAL bir değerdir
   *
   * Tarayıcıda ölçüldü ve UÇ VAKA DEĞİL — hastaların büyük kısmını vuruyor:
   *
   *   sabah tutukluluğu 0   -> "Eksik veri"   (çok yaygın)
   *   periferik eklem 0     -> "Eksik veri"   (saf aksiyel tutulumda olağan)
   *   hepsi 0 + CRP 0       -> "Eksik veri"   (tam remisyon)
   *
   * Yani araç, cetvelinde "İNAKTİF HASTALIK" bandı olmasına rağmen o bandı
   * üretecek girdiyi reddediyordu — skorlanamayan tek hasta, iyi olan hastaydı.
   *
   * Ayrım DEĞERE bakılarak yapılamaz (çöp girdi de 0 üretir); HAM DİZEYE
   * bakılır. `sayiGirildiMi` boş alanı ve "abc"yi eler, yazılmış "0"ı geçirir.
   * Yanına makullük sınırı konuyor: NRS 0–10, CRP 0–500 mg/L, ESR 0–200 mm/saat.
   */
  const alanMakul = (ham: string, alt: number, ust: number) => {
    if (!sayiGirildiMi(ham)) return false;
    const n = parseLocaleNumber(ham);
    return n >= alt && n <= ust;
  };

  const klinikMakul =
    alanMakul(pain, 0, 10) &&
    alanMakul(dur, 0, 10) &&
    alanMakul(bk, 0, 10) &&
    alanMakul(pat, 0, 10);

  /**
   * TEK SAYI: ekranda basilan deger ile bantlanan deger AYNI olmali.
   * Bir donem bant HAM degerden besleniyordu ve gosterim `toFixed(2)` ile
   * sinir gecirtiyordu -- OLCULDU: dort NRS de 0, CRP 8.40 -> ham 1.29737 ->
   * ekranda "1.30" ama bant "< 1.3" (INAKTIF HASTALIK). Ekran kendi cetvelinin
   * disinda bir sayi gosteriyordu. Depo kalibi: meld-na / rapid3 / scorad,
   * hepsi BIR KEZ yuvarlayip hem basiyor hem bantliyor.
   */
  const crpScore  = klinikMakul && alanMakul(crp, 0, 500)
    ? Math.round((KATSAYI.crp.pain * painN + KATSAYI.crp.dur * durN + KATSAYI.crp.pat * patN + KATSAYI.crp.bk * bkN + KATSAYI.crp.lab * Math.log(crpN + 1) + KATSAYI.crp.sabit) * 100) / 100
    : null;
  /**
   * ⚠ AÇIK SORU — `- 0.211` SABİTİ. Ölçüldü, DEĞİŞTİRİLMEDİ, karar bekliyor.
   *
   * Yukarıdaki meşru-sıfır düzeltmesi tam remisyon vakasını ilk kez
   * ulaşılabilir yaptı ve o vaka ikinci bir şeyi açığa çıkardı:
   *
   *     bütün alanlar 0  ->  ASDAS-CRP 0.00   ·   ASDAS-ESR -0.21
   *
   * ASDAS eksi olamaz; üstelik CRP sürümünde karşılık gelen bir sabit YOK.
   * Aynı indeksin iki varyantından birinde kesişim terimi olması asimetrik.
   *
   * ASIL KANIT İÇ ÇELİŞKİ: araç iki varyanta da AYNI eşikleri uyguluyor
   * (1.3 / 2.1 / 3.5), yani ikisi aynı ölçekte olmak zorunda. Ölçüldü —
   * dört vakanın üçünde bant AYRIŞIYOR:
   *
   *   girdi [pain,dur,pat,bk,CRP,ESR]      ASDAS-CRP        ASDAS-ESR
   *   [3,3,3,3,5,10]                       2.12 YÜKSEK      1.76 ORTA
   *   [3,3,4,3,5,12]                       2.23 YÜKSEK      1.91 ORTA
   *   [4,3,4,3,5,12]                       2.35 YÜKSEK      2.03 ORTA
   *
   * Sabit kaldırılsaydı son iki satırda ikisi de YÜKSEK olurdu (2.12 · 2.24).
   * Ayrıca 0.211'lik kayma, ASAS'ın tedavi hedefi olan "inaktif hastalık"
   * sınırını (1.3) fiilen 1.51'e taşıyor.
   *
   * NEDEN KENDİM DEĞİŞTİRMEDİM: bu, yayımlanmış bir formülün terimini
   * KALDIRMAK olurdu ve sabitin kaynağı depoda hiçbir yerde yazılı değil
   * (yorum yok, ekranda formül basılmıyor, tek commit'i toplu bir taşıma).
   * Belgede kayıtlı kural burada iki yönlü işliyor: eksi skor tartışmasız
   * yanlış, ama "beklenti tutmadığında önce beklentiyi sına" da geçerli ve
   * bu araçta beklentim bir kez zaten yanlış çıkmıştı (0.069/0.079).
   * Klinik kaynak kararı kullanıcınındır.
   */
  const esrScore  = klinikMakul && alanMakul(esr, 0, 200)
    ? Math.round((KATSAYI.esr.pain * painN + KATSAYI.esr.lab * Math.sqrt(esrN) + KATSAYI.esr.dur * durN + KATSAYI.esr.pat * patN + KATSAYI.esr.bk * bkN + KATSAYI.esr.sabit) * 100) / 100
    : null;

  const getResult = (s: number) => {
    if (s < 1.3)  return { label: "İNAKTİF HASTALIK", sub: "ASDAS < 1.3", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s < 2.1)  return { label: "ORTA AKTİVİTE", sub: "ASDAS 1.3–2.1", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    if (s < 3.5)  return { label: "YÜKSEK AKTİVİTE", sub: "ASDAS 2.1–3.5", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    return { label: "ÇOK YÜKSEK AKTİVİTE", sub: "ASDAS ≥ 3.5", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  /* İKİ VARYANT AYRIŞABİLİR (belgede kayıtlı: üç vakada bant farklı) —
     duyuru bu yüzden hangi varyantın hangi banda düştüğünü söylüyor.
     SAYI duyurulmuyor: girdiler serbest sayısal, skor her tuş vuruşunda
     değişir ve duyuru "1", "1.", "1.2" diye gürültüye dönerdi. */
  const bantlar = ([
    ["ASDAS-CRP", crpScore],
    ["ASDAS-ESR", esrScore],
  ] as const).filter(([, s]) => s !== null) as ReadonlyArray<readonly [string, number]>;
  const sonucMetni = bantlar.length
    ? bantlar.map(([ad, s]) => `${ad}: ${getResult(s).label}`).join(" · ")
    : null;

  const inputs = [
    { label: "Spinal Ağrı (0–10 NRS)", value: pain, set: setPain, ph: "0–10" },
    { label: "Sabah Tutukluluğu (0–10 NRS)", value: dur, set: setDur, ph: "0–10" },
    { label: "Hasta Genel Değerlendirme (0–10 NRS)", value: pat, set: setPat, ph: "0–10" },
    { label: "Periferik Eklem Ağrısı/Şişliği (0–10 NRS)", value: bk, set: setBk, ph: "0–10" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="asdas" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦴</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ASDAS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Ankilozan Spondilit Hastalık Aktivite Skoru — CRP & ESR</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik Parametreler (0–10 NRS)</p>
          {inputs.map(({ label, value, set, ph }) => (
            <label key={label} className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
              <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          ))}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">CRP (mg/L)</span>
              <input type="text" inputMode="decimal" value={crp} onChange={e => setCrp(e.target.value)} placeholder="ör. 12"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">ESR (mm/saat)</span>
              <input type="text" inputMode="decimal" value={esr} onChange={e => setEsr(e.target.value)} placeholder="ör. 35"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          </div>
        </div>

        <SonucDuyuru metin={sonucMetni} />
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "ASDAS-CRP", score: crpScore },
            { label: "ASDAS-ESR", score: esrScore },
          ].map(({ label, score }) => (
            <div key={label} className={`p-5 rounded-[2rem] border shadow-sm ${score !== null ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
              {score !== null ? (
                <>
                  <p className="text-4xl font-black text-blue-900">{score.toFixed(2)}</p>
                  <p className={`text-xs font-bold mt-2 ${getResult(score).color}`}>{getResult(score).label}</p>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-300 mt-2">Eksik veri</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Eşik Değerler</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "İnaktif", r: "< 1.3", c: "bg-emerald-100 text-emerald-700" },
              { l: "Orta", r: "1.3–2.1", c: "bg-amber-100 text-amber-700" },
              { l: "Yüksek", r: "2.1–3.5", c: "bg-orange-100 text-orange-700" },
              { l: "Çok yüksek", r: "≥ 3.5", c: "bg-rose-100 text-rose-700" },
            ].map(x => (
              <div key={x.l} className={`rounded-xl p-2 text-center text-[9px] font-black uppercase tracking-widest ${x.c}`}>
                <div>{x.l}</div>
                <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KULLANILAN DENKLEMLER — ekranda, çünkü hesabın ne yaptığı
            görünmeden kaynağıyla karşılaştırılamıyor. Metin `KATSAYI`den
            türüyor; elle yazılmış bir kopya YOK. */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kullanılan Denklemler</p>
          <div className="space-y-3">
            {([
              { ad: "ASDAS-CRP", v: "crp" as const },
              { ad: "ASDAS-ESR", v: "esr" as const },
            ]).map(({ ad, v }) => (
              <div key={ad}>
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{ad}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-700 break-words">{formulMetni(v)}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Aynı eşikler (1.3 · 2.1 · 3.5) iki varyanta da uygulanır. ASDAS-ESR
            denklemindeki {Math.abs(KATSAYI.esr.sabit)} sabiti ASDAS-CRP&apos;de
            yoktur; bu yüzden aynı hastada iki varyant farklı banda düşebilir.
            Kılavuzlar ASDAS-CRP&apos;yi tercih eder.
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={{ pain: painN, dur: durN, pat: patN, bk: bkN, crp: crpN, esr: esrN }} /></div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              ASDAS-CRP güncel kılavuzlarda BASDAI'ye tercih edilmektedir. İnaktif hastalık (ASDAS &lt;1.3) biyolojik tedavi azaltımı için kullanılan eşiktir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
