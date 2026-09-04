"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/*
 * Caprini VTE Risk Değerlendirme Modeli — Caprini, Dis Mon 2005.
 * Bantlar, VTE oranları ve profilaksi karşılıkları ACCP 9. baskıdan
 * (Gould et al., Chest 2012) alınmıştır.
 *
 * ÜÇ ALAN DIŞLAYICI SEÇİCİ: yaş, girişim türü ve mobilite. Bu bir tasarım
 * tercihi değil, bu depoda ÖLÇÜLMÜŞ bir kusurun karşılığı: chads-vasc'ta
 * yaş bantları (≥75 ve 65–74) AYRI ONAY KUTUSU olduğu için ikisi birden
 * işaretlenebiliyor ve toplam yayımlanmış tavanı (9) aşıp 10 çıkıyordu.
 * Caprini'de üç alan da aynı şekli taşıyor; kutu olarak yazılsalardı aynı
 * kusur üç yerde birden doğardı.
 *
 * SEÇİM PUANLA DEĞİL İNDEKSLE saklanıyor. "Aynı puanlı iki şık tek düğme
 * olur" sınıfı bu depoda ALTI kez ölçüldü (apache2 · gout-acr · pap-score ·
 * nutrition-needs · tirads · nihss). Burada sınıf LATENT DEĞİL, CANLI:
 * girişim grubunda iki şık 2 puan (majör cerrahi / majör abdominal-pelvik),
 * iki şık da 5 puan (artroplasti / kırık) taşıyor. Puanla saklansaydı
 * dördü ikişerli yanıp ikişerli sönerdi.
 */
const SECICILER: {
  id: string;
  ad: string;
  ipucu: string;
  secenekler: { kod?: string; label: string; sub?: string; puan: number }[];
}[] = [
  {
    id: "yas",
    ad: "Yaş",
    ipucu: "Bantlar birbirini dışlar — tek seçim",
    secenekler: [
      { label: "≤ 40 yaş", puan: 0 },
      { label: "41–60 yaş", puan: 1 },
      { label: "61–74 yaş", puan: 2 },
      { label: "≥ 75 yaş", puan: 3 },
    ],
  },
  {
    id: "cerrahi",
    ad: "Girişim türü",
    ipucu: "Planlanan ya da yapılmış girişim",
    secenekler: [
      { label: "Girişim yok — medikal hasta", puan: 0 },
      { label: "Minör cerrahi", sub: "< 45 dakika", puan: 1 },
      { label: "Majör cerrahi", sub: "> 45 dakika; açık, laparoskopik ya da artroskopik", puan: 2 },
      { kod: "abd-pelvik", label: "Majör abdominal veya pelvik cerrahi", sub: "> 45 dakika", puan: 2 },
      { label: "Elektif artroplasti", sub: "Kalça ya da diz", puan: 5 },
      { label: "Kalça, pelvis veya bacak kırığı", puan: 5 },
    ],
  },
  {
    id: "mobilite",
    ad: "Mobilite",
    ipucu: "Hastanın mevcut hareket durumu",
    secenekler: [
      { label: "Ambulatuvar", puan: 0 },
      { label: "Yatak istirahatindeki medikal hasta", puan: 1 },
      { label: "72 saatten uzun yatağa bağımlı", puan: 2 },
    ],
  },
];

/*
 * Onay kutuları: burada işaretsiz bir kutu GERÇEK bir cevaptır ("bu risk
 * faktörü yok"), eksik veri değil. Bu depoda aynı verdikt has-bled · padua ·
 * wells-dvt · wells-pe · chads-vasc için tek tek ölçülüp kaydedildi. O yüzden
 * hükmün kapısı yalnızca ÜÇ DIŞLAYICI SEÇİCİYE bağlı.
 */
const KUTULAR: {
  baslik: string;
  puan: number;
  not?: string;
  maddeler: { id: string; label: string; sub?: string }[];
}[] = [
  {
    baslik: "1 puan",
    puan: 1,
    maddeler: [
      { id: "bmi", label: "BMI > 25 kg/m²" },
      { id: "sislik", label: "Bacaklarda şişlik", sub: "Mevcut" },
      { id: "varikoz", label: "Variköz venler" },
      { id: "sepsis", label: "Sepsis", sub: "Son 1 ay" },
      { id: "akciger", label: "Ciddi akciğer hastalığı", sub: "Pnömoni dahil, son 1 ay" },
      { id: "koah", label: "Anormal akciğer fonksiyonu", sub: "KOAH" },
      { id: "mi", label: "Akut miyokard infarktüsü" },
      { id: "kky", label: "Konjestif kalp yetmezliği", sub: "Son 1 ay" },
      { id: "ibh", label: "İnflamatuvar bağırsak hastalığı öyküsü" },
    ],
  },
  {
    baslik: "1 puan — kadına özgü",
    puan: 1,
    not: "Yayımlanmış formda ayrı bir bölüm",
    maddeler: [
      { id: "gebelik", label: "Gebelik veya postpartum", sub: "Son 1 ay" },
      { id: "gebelik-oyku", label: "Açıklanamayan ölü doğum, tekrarlayan düşük (≥ 3) ya da toksemi veya gelişme geriliği nedenli prematüre doğum" },
      { id: "hormon", label: "Oral kontraseptif veya hormon replasman tedavisi" },
    ],
  },
  {
    baslik: "2 puan",
    puan: 2,
    maddeler: [
      { id: "malignite", label: "Malignite", sub: "Mevcut ya da geçmiş" },
      { id: "alci", label: "İmmobilize alçı", sub: "Son 1 ay" },
      { id: "kateter", label: "Santral venöz kateter" },
    ],
  },
  {
    baslik: "3 puan",
    puan: 3,
    maddeler: [
      { id: "vte", label: "VTE öyküsü", sub: "Derin ven trombozu ya da pulmoner emboli" },
      { id: "aile-vte", label: "Ailede VTE öyküsü" },
      { id: "fvl", label: "Faktör V Leiden" },
      { id: "protrombin", label: "Protrombin 20210A" },
      { id: "lupus", label: "Lupus antikoagülanı" },
      { id: "akl", label: "Antikardiyolipin antikoru" },
      { id: "homosistein", label: "Yüksek serum homosistein" },
      { id: "hit", label: "Heparine bağlı trombositopeni (HIT)" },
      { id: "trombofili", label: "Diğer konjenital veya edinsel trombofili" },
    ],
  },
  {
    baslik: "5 puan",
    puan: 5,
    maddeler: [
      { id: "inme", label: "İnme", sub: "Son 1 ay" },
      { id: "spinal", label: "Akut spinal kord yaralanması veya felç", sub: "Son 1 ay" },
    ],
  },
];

/*
 * TAVAN TÜRETİLİYOR, elle yazılmıyor. Bu depoda elle yazılan payda bir kez
 * sessizce bayatladı (nihss "/ 42", türetilmiş TAVAN varken elle yazılıydı).
 */
const TAVAN =
  SECICILER.reduce((t, s) => t + Math.max(...s.secenekler.map(o => o.puan)), 0) +
  KUTULAR.reduce((t, k) => t + k.puan * k.maddeler.length, 0);

/*
 * Bant sınırları, VTE oranları ve profilaksi karşılıkları TEK yerde duruyor;
 * cetvel, rozet ve metinler onlardan türüyor — ikinci bir gerçeklik yok.
 *
 * `kimyasal` alanı ikinci okumanın (kanama riski) dayandığı şeydir: ACCP
 * kimyasal profilaksiyi ancak orta ve yüksek riskte öneriyor, yani kanama
 * riski ancak o iki bantta öneriyi değiştirebilir.
 */
const BANTLAR: {
  altSinir: number;
  label: string;
  oran: string;
  color: string;
  profilaksi: string;
  kimyasal: boolean;
}[] = [
  { altSinir: 0, label: "ÇOK DÜŞÜK RİSK", oran: "< %0.5", color: "emerald", profilaksi: "Erken mobilizasyon; farmakolojik ya da mekanik profilaksi önerilmez", kimyasal: false },
  { altSinir: 1, label: "DÜŞÜK RİSK", oran: "≈ %1.5", color: "sky", profilaksi: "Mekanik profilaksi — tercihen aralıklı pnömatik kompresyon", kimyasal: false },
  { altSinir: 3, label: "ORTA RİSK", oran: "≈ %3.0", color: "amber", profilaksi: "Kimyasal profilaksi (DMAH ya da düşük doz UFH) ya da mekanik profilaksi", kimyasal: true },
  { altSinir: 5, label: "YÜKSEK RİSK", oran: "≈ %6.0", color: "rose", profilaksi: "Kimyasal profilaksi + mekanik profilaksi birlikte", kimyasal: true },
];

const bantBul = (p: number) =>
  [...BANTLAR].reverse().find(b => p >= b.altSinir) ?? BANTLAR[0];

const bantAralik = (i: number) =>
  i === BANTLAR.length - 1
    ? `≥ ${BANTLAR[i].altSinir}`
    : BANTLAR[i + 1].altSinir - BANTLAR[i].altSinir === 1
      ? `${BANTLAR[i].altSinir}`
      : `${BANTLAR[i].altSinir}–${BANTLAR[i + 1].altSinir - 1}`;

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-800",     badge: "bg-sky-800 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   badge: "bg-amber-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

const kimlik = (id: string) => String(id).replace(/[^a-zA-Z0-9]+/g, "-");

export default function CapriniPage() {
  const [secim, setSecim] = React.useState<Record<string, number | null>>(
    Object.fromEntries(SECICILER.map(s => [s.id, null]))
  );
  const [kutu, setKutu] = React.useState<Record<string, boolean>>({});
  const [kanama, setKanama] = React.useState(false);

  const yanitlanan = SECICILER.filter(s => secim[s.id] !== null).length;
  const tamam = yanitlanan === SECICILER.length;

  const secilen = (grupId: string) => {
    const g = SECICILER.find(s => s.id === grupId);
    const i = secim[grupId];
    return g && i !== null && i !== undefined ? g.secenekler[i] : null;
  };

  const seciciPuan = SECICILER.reduce((t, s) => t + (secilen(s.id)?.puan ?? 0), 0);
  const kutuPuanOf = (k: (typeof KUTULAR)[number]) =>
    k.maddeler.filter(m => kutu[m.id]).length * k.puan;
  const kutuPuan = KUTULAR.reduce((t, k) => t + kutuPuanOf(k), 0);

  const puan = tamam ? seciciPuan + kutuPuan : null;
  const bant = puan !== null ? bantBul(puan) : null;
  const c = bant ? COLOR[bant.color] : null;

  /*
   * İKİNCİ OKUMA — KANAMA RİSKİ.
   *
   * Caprini yalnızca TROMBOZ tarafını ölçüyor; profilaksi kararı ise ACCP'de
   * açıkça iki eksenlidir (VTE riski × kanama riski). Yüksek kanama riskinde
   * kimyasal profilaksi yerine mekanik profilaksi öneriliyor ve kanama riski
   * düzelince kimyasal profilaksi yeniden değerlendiriliyor.
   *
   * Bu okuma SKORU DEĞİŞTİRMİYOR — değiştirdiği şey profilaksinin BİÇİMİ, ve
   * o ayrım ACCP'nin kendi yapısı, bizim eklediğimiz bir kural değil. Aynı
   * disiplin abg (Δgap), sodium (desalinasyon), rankin (yapılandırılmış
   * görüşme) ve ariscat (düzeltilebilir yük) turlarında ölçüldü: ikinci okuma
   * ayrışırsa SÖYLÜYOR, hükmü kurmuyor.
   *
   * Ayrışma yalnızca kimyasal profilaksinin önerildiği bantlarda oluşabilir;
   * çok düşük ve düşük riskte öneri zaten mekanik ya da mobilizasyon.
   */
  const kanamaAyrisiyor = !!(kanama && bant?.kimyasal);

  /*
   * UZATILMIŞ PROFİLAKSİ — ilan edilen kural UYGULANIYOR.
   * ACCP majör abdominal ya da pelvik KANSER cerrahisinde profilaksinin
   * taburculuk sonrası 4 haftaya uzatılmasını öneriyor. Bu koşul skorun
   * içinde görünmüyor (malignite 2 puan, cerrahi 2 puan — toplamda kaybolur),
   * o yüzden ayrıca söyleniyor. Şart kaynaktan okunuyor: seçeneğin `kod`u,
   * sıra indeksi DEĞİL — şıklar yeniden sıralanırsa sessizce bozulmasın.
   */
  const uzatilmisProfilaksi =
    !!kutu.malignite && secilen("cerrahi")?.kod === "abd-pelvik";

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="caprini" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩸</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Caprini VTE</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Venöz tromboembolizm risk modeli · 0–{TAVAN} puan</p>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-2xl px-4 py-3 flex items-start gap-3">
          <span aria-hidden="true" className="text-amber-400 text-base leading-none mt-0.5">💡</span>
          <p className="text-[11px] leading-relaxed">
            Caprini yalnızca <span className="font-black">tromboz</span> tarafını ölçer. Profilaksi kararı iki eksenlidir: VTE riski <span className="font-black">×</span> kanama riski. Aşağıdaki <span className="font-black">kanama riski</span> okuması skoru değiştirmeden profilaksinin biçimini ayrıca gösteriyor.
          </p>
        </div>

        {SECICILER.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-0.5">
              <p id={`grp-${kimlik(s.id)}`} className="font-black text-blue-900 uppercase italic text-sm">{s.ad}</p>
              {secim[s.id] !== null && (
                <span className="text-[9px] font-black text-blue-900 bg-amber-400 rounded-full px-2 py-0.5 shrink-0">+{secilen(s.id)?.puan}</span>
              )}
            </div>
            <p id={`grp-d-${kimlik(s.id)}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{s.ipucu}</p>
            <div role="group" aria-labelledby={`grp-${kimlik(s.id)} grp-d-${kimlik(s.id)}`} className="space-y-1.5">
              {s.secenekler.map((o, i) => (
                <button aria-pressed={secim[s.id] === i} key={o.label} type="button"
                  onClick={() => setSecim(v => ({ ...v, [s.id]: v[s.id] === i ? null : i }))}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-xl border-2 transition-all
                    ${secim[s.id] === i ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                  <span className={`w-7 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5
                    ${secim[s.id] === i ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>+{o.puan}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-black">{o.label}</span>
                    {o.sub && <span className={`block text-[10px] font-bold leading-snug ${secim[s.id] === i ? "text-blue-100" : "text-slate-500"}`}>{o.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {KUTULAR.map(k => (
          <div key={k.baslik} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-0.5">
              <p id={`kut-${kimlik(k.baslik)}`} className="font-black text-blue-900 uppercase italic text-sm">{k.baslik}</p>
              {kutuPuanOf(k) > 0 && (
                <span className="text-[9px] font-black text-blue-900 bg-amber-400 rounded-full px-2 py-0.5 shrink-0">+{kutuPuanOf(k)}</span>
              )}
            </div>
            <p id={`kut-d-${kimlik(k.baslik)}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              {k.not ?? `Her biri ${k.puan} puan · birden çok seçilebilir`}
            </p>
            <div role="group" aria-labelledby={`kut-${kimlik(k.baslik)} kut-d-${kimlik(k.baslik)}`} className="space-y-1.5">
              {k.maddeler.map(m => (
                <label key={m.id}
                  className={`flex items-start gap-3 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2
                    ${kutu[m.id] ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                  <input type="checkbox" className="sr-only" checked={!!kutu[m.id]}
                    onChange={e => setKutu(v => ({ ...v, [m.id]: e.target.checked }))} />
                  <span aria-hidden="true" className={`w-7 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5
                    ${kutu[m.id] ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>+{k.puan}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-black">{m.label}</span>
                    {m.sub && <span className={`block text-[10px] font-bold leading-snug ${kutu[m.id] ? "text-blue-100" : "text-slate-500"}`}>{m.sub}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p id="kanama-baslik" className="font-black text-blue-900 uppercase italic text-sm mb-0.5">Kanama riski</p>
          <p id="kanama-ipucu" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Skora girmez — profilaksinin biçimini belirler</p>
          <label className="flex items-start gap-3 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 border-slate-100 bg-slate-50 hover:border-blue-200">
            <input type="checkbox" className="sr-only" checked={kanama}
              aria-describedby="kanama-ipucu"
              onChange={e => setKanama(e.target.checked)} />
            <span aria-hidden="true" className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-black
              ${kanama ? "bg-blue-900 border-blue-900 text-white" : "bg-white border-slate-300"}`}>{kanama ? "✓" : ""}</span>
            <span className="min-w-0">
              <span className="block text-[11px] font-black text-blue-900">Yüksek kanama riski var</span>
              <span className="block text-[10px] font-bold leading-snug text-slate-500">Aktif kanama, yakın zamanda majör kanama, tedavi edilmemiş kanama bozukluğu, ağır böbrek ya da karaciğer yetmezliği, trombositopeni, akut inme, kontrolsüz hipertansiyon, eş zamanlı antikoagülan/antiagregan/trombolitik, nöroaksiyel girişim penceresi</span>
            </span>
          </label>
        </div>

        {/* Önek YOK: SonucDuyuru metnin başına kendisi "Sonuç: " ekliyor. */}
        <SonucDuyuru metin={puan !== null && bant ? `Caprini ${puan} — ${bant.label}` : null} />

        {puan !== null && bant && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-24 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">Caprini</span>
                <span className="text-4xl font-black text-white leading-none">{puan}</span>
                <span className="text-[8px] text-blue-300">/ {TAVAN}</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{bant.label}</span>
                <p className={`text-sm font-black mt-1 ${c.text}`}>{bant.oran} VTE riski</p>
                <p className="text-[10px] font-bold text-slate-600 leading-snug mt-0.5">{bant.profilaksi}</p>
              </div>
            </div>

            <div className="bg-white/70 border border-slate-200 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">İkinci okuma — kanama riski</p>
              {kanamaAyrisiyor ? (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  VTE riski <span className="font-black text-blue-900">{bant.label}</span> olduğu için kimyasal profilaksi önerilirdi; <span className="font-black">yüksek kanama riski</span> işaretli. ACCP bu durumda kimyasal profilaksi yerine <span className="font-black">mekanik profilaksi</span> (aralıklı pnömatik kompresyon) öneriyor ve kanama riski azaldığında kimyasal profilaksinin yeniden değerlendirilmesini istiyor. <span className="font-black">Skora dokunulmadı</span> — değişen tek şey profilaksinin biçimi.
                </p>
              ) : kanama ? (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  Yüksek kanama riski işaretli, ama bu bantta zaten kimyasal profilaksi önerilmiyor — iki okuma <span className="font-black">ayrışmıyor</span>.
                </p>
              ) : (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  Kanama riski işaretlenmedi. Caprini yalnızca tromboz tarafını ölçer; profilaksi kararı verilmeden önce kanama riski <span className="font-black">ayrıca</span> değerlendirilmelidir.
                </p>
              )}
            </div>

            {uzatilmisProfilaksi && (
              <div className="bg-white/80 border-2 border-amber-300 rounded-xl px-3 py-2">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Uzatılmış profilaksi gündemde</p>
                <p className="text-[10px] font-bold text-slate-700 leading-relaxed mt-1">
                  Majör <span className="font-black">abdominal ya da pelvik</span> cerrahi + <span className="font-black">malignite</span> seçili. ACCP bu hastalarda profilaksinin taburculuk sonrası <span className="font-black">4 haftaya uzatılmasını</span> öneriyor. Bu koşul skorun içinde ayrıca görünmez — toplam puanda kaybolur.
                </p>
              </div>
            )}

            <div className="overflow-x-auto" data-kaydir-serit>
              <div className="grid grid-cols-4 gap-1 text-center min-w-[300px]">
                {BANTLAR.map((b, i) => (
                  <div key={b.label} className={`rounded-lg py-2 px-1 ${b.label === bant.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                    <div className="text-[11px] font-black leading-none">{bantAralik(i)}</div>
                    <div className="text-[8px] font-bold uppercase tracking-wider mt-1 leading-none">{b.label.replace(" RİSK", "")}</div>
                    <div className="text-[9px] font-black mt-1 leading-none">{b.oran}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{yanitlanan}/{SECICILER.length} zorunlu alan seçildi</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Skor; yaş, girişim türü ve mobilite seçilince hesaplanır. Onay kutuları isteğe bağlıdır — işaretsiz kutu &quot;bu risk faktörü yok&quot; demektir.</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Caprini bir <span className="font-black">risk sınıflama</span> aracıdır, profilaksi reçetesi değil: doz, ajan ve süre hastanın böbrek fonksiyonu, kilosu ve eş zamanlı ilaçlarına göre belirlenir. Skor <span className="font-black">cerrahi</span> hastalarda geliştirilmiş ve doğrulanmıştır; dahili hastalarda Padua ya da IMPROVE modelleri daha yaygın kullanılır. Bantlara karşılık gelen VTE oranları cerrahi kohortlardan gelir ve popülasyona göre değişir. Nöroaksiyel anestezi planlanıyorsa kimyasal profilaksinin zamanlaması ayrıca değerlendirilmelidir. Caprini, Dis Mon 2005; bantlar ve öneriler ACCP 9. baskı (Gould et al., Chest 2012).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
