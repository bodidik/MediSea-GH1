"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/*
 * BAP-65 — KOAH akut alevlenmesinde hastane içi mortalite ve mekanik
 * ventilasyon ihtiyacı riski.
 *   Türetme:   Tabak YP et al., Arch Intern Med 2009;169(17):1595-602
 *   Doğrulama: Shorr AF et al., Chest 2011;140(5):1177-83
 *
 * ÇIKTI BİR SKOR DEĞİL, BİR SINIFTIR. Üç akut ölçüt (BUN · bilinç · nabız)
 * sayılıyor, yaş ise sayıma DEĞİL sınıf atamasına giriyor: 0 ölçütlü hasta
 * yaşına göre sınıf I ya da II oluyor, 1/2/3 ölçütlü hasta yaştan bağımsız
 * olarak III/IV/V. Bu yüzden ekranda "puan" değil "sınıf" basılıyor —
 * toplam basmak, olmayan bir toplamsal ölçek ima ederdi.
 *
 * YAŞ DIŞLAYICI SEÇİCİ, onay kutusu DEĞİL. Bu depoda ÖLÇÜLMÜŞ bir kusurun
 * karşılığı: chads-vasc'ta yaş bantları ayrı onay kutusu olduğu için ikisi
 * birden işaretlenebiliyor ve toplam yayımlanmış tavanı aşıyordu. Burada
 * yaş iki bantlı ve bantlar birbirini dışlıyor.
 *
 * SEÇİM PUANLA DEĞİL İNDEKSLE saklanıyor — "aynı puanlı iki şık tek düğme
 * olur" sınıfı bu depoda ALTI kez ölçüldü (apache2 · gout-acr · pap-score ·
 * nutrition-needs · tirads · nihss). Burada iki yaş bandı da sayıma 0
 * katıyor, yani sınıf LATENT DEĞİL CANLI: puanla saklansaydı iki bant
 * birlikte yanıp birlikte sönerdi.
 *
 * SINIFA KARŞILIK GELEN YÜZDE BASILMIYOR ve bu bilinçli. BAP-65 bir şiddet
 * SINIFLAMASI; sınıfa karşılık gelen mortalite ve ventilasyon oranları
 * kohorta göre belirgin biçimde değişiyor (türetme ve doğrulama kohortları
 * dahil). Tek bir yüzde basmak, o yüzdenin bu hastaya ait olduğu izlenimini
 * verirdi. Aynı karar `fisher` aracında da verildi: orada ölçek monoton
 * olmadığı için sayısal oran basılmıyor. Basılan şey sınıfın KENDİSİ ve
 * riskin YÖNÜ; yayımlanmış çapa (ventilasyon ihtiyacı en düşük sınıfta ~%2,
 * en yüksek sınıfta %55 — Shorr 2011) klinik notta duruyor.
 */
const OLCUTLER: { id: string; harf: string; label: string; sub: string }[] = [
  {
    id: "bun",
    harf: "B",
    label: "BUN ≥ 25 mg/dL",
    sub: "≥ 8,9 mmol/L üre azotu",
  },
  {
    id: "bilinc",
    harf: "A",
    label: "Bilinç değişikliği",
    sub: "Glasgow Koma Skalası < 14, ya da dezoryantasyon, stupor veya koma",
  },
  {
    id: "nabiz",
    harf: "P",
    label: "Nabız ≥ 109/dakika",
    sub: "Başvuru anındaki kalp hızı",
  },
];

const YAS_SECENEKLERI: { label: string; sub?: string; yasli: boolean }[] = [
  { label: "41–64 yaş", sub: "Ölçek 40 yaş üstü erişkinlerde türetilmiştir", yasli: false },
  { label: "≥ 65 yaş", yasli: true },
];

/*
 * SINIF ATAMASI. `olcut` alanı o sınıfa hangi ölçüt sayısıyla girildiğini
 * söylüyor; `yasli` yalnızca 0 ölçütlü hastada I ve II'yi ayırıyor ve
 * ötekilerde `null` — yani "yaş bu sınıfta belirleyici değil".
 */
const SINIFLAR: {
  no: string;
  olcut: number;
  yasli: boolean | null;
  agirlik: string;
  color: string;
  yorum: string;
}[] = [
  {
    no: "I",
    olcut: 0,
    yasli: false,
    agirlik: "EN DÜŞÜK RİSK",
    color: "emerald",
    yorum: "Üç akut ölçütün üçü de negatif ve hasta 65 yaşın altında. Mortalite ve ventilasyon ihtiyacı bu sınıfta en düşüktür.",
  },
  {
    no: "II",
    olcut: 0,
    yasli: true,
    agirlik: "DÜŞÜK RİSK",
    color: "sky",
    yorum: "Akut ölçütlerin hiçbiri pozitif değil; sınıfı yalnızca yaş belirliyor. Risk sınıf I'e göre artmış durumda.",
  },
  {
    no: "III",
    olcut: 1,
    yasli: null,
    agirlik: "ORTA RİSK",
    color: "amber",
    yorum: "Bir akut ölçüt pozitif. Yaş bu sınıfta belirleyici değil — bir ölçüt pozitifse hasta yaşından bağımsız olarak sınıf III'tür.",
  },
  {
    no: "IV",
    olcut: 2,
    yasli: null,
    agirlik: "YÜKSEK RİSK",
    color: "orange",
    yorum: "İki akut ölçüt pozitif. Ventilasyon ihtiyacı ve mortalite bu sınıftan itibaren belirgin biçimde yükseliyor.",
  },
  {
    no: "V",
    olcut: 3,
    yasli: null,
    agirlik: "EN YÜKSEK RİSK",
    color: "rose",
    yorum: "Üç akut ölçütün üçü de pozitif. Ventilasyon ihtiyacı ve mortalite en yüksek bu sınıftadır.",
  },
];

const sinifBul = (n: number, yasli: boolean) =>
  n === 0 ? (yasli ? SINIFLAR[1] : SINIFLAR[0]) : SINIFLAR[n + 1];

/* Cetveldeki ölçüt sütunu — sınıf tanımından TÜRÜYOR, elle yazılmıyor. */
const sinifKosul = (s: (typeof SINIFLAR)[number]) =>
  s.yasli === null
    ? `${s.olcut} ölçüt`
    : `0 ölçüt · ${s.yasli ? "≥ 65" : "< 65"}`;

/*
 * İKİNCİ OKUMA — SOLUNUMSAL ASİDOZ.
 *
 * BAP-65'in bileşenleri arasında pH, PaCO₂ ya da oksijenasyon YOK. Oysa KOAH
 * alevlenmesinde noninvazif ventilasyon kararını doğrudan asidoz veriyor:
 * GOLD ve BTS/ICS, optimal medikal tedaviye rağmen pH < 7,35 ve PaCO₂ > 45
 * mmHg olan hastada NIV endikasyonu koyuyor.
 *
 * Bunun sonucu ölçülebilir bir kör nokta: BUN'u normal, bilinci açık, nabzı
 * 90 olan 60 yaşındaki bir hasta BAP-65 sınıf I'dir ve aynı anda akut
 * hiperkapnik solunum yetmezliğinde olabilir.
 *
 * Bu okuma SINIFI DEĞİŞTİRMİYOR. Değiştirdiği şey ventilasyon kararı ve o
 * karar kılavuzun kendi kuralı, bizim eklediğimiz bir puan değil. pH'ı
 * skora katmak — kimi uygulamaların yaptığı gibi — yayımlanmış BAP-65'te
 * bulunmayan bir ölçüt uydurmak olurdu.
 *
 * Aynı disiplin abg (Δgap), sodium (desalinasyon), rankin (yapılandırılmış
 * görüşme), ariscat (düzeltilebilir yük) ve caprini (kanama riski)
 * turlarında ölçüldü: ikinci okuma ayrışırsa SÖYLÜYOR, hükmü kurmuyor.
 */
const ASIT_SECENEKLERI: {
  kod: string;
  label: string;
  sub: string;
  niv: boolean;
  agir: boolean;
}[] = [
  {
    kod: "yok",
    label: "pH ≥ 7,35 — solunumsal asidoz yok",
    sub: "Kan gazı alındı ve pH normal sınırlarda",
    niv: false,
    agir: false,
  },
  {
    kod: "orta",
    label: "pH 7,25 – 7,34 · PaCO₂ > 45 mmHg",
    sub: "Optimal medikal tedaviye rağmen sürüyorsa NIV endikasyonu",
    niv: true,
    agir: false,
  },
  {
    kod: "agir",
    label: "pH < 7,25 · PaCO₂ > 45 mmHg",
    sub: "NIV endikasyonu; başarısızlık riski yüksek, entübasyon hazırlığı",
    niv: true,
    agir: true,
  },
];

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-800",     badge: "bg-sky-800 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   badge: "bg-amber-700 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-800",  badge: "bg-orange-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function Bap65Page() {
  const [olcut, setOlcut] = React.useState<Record<string, boolean>>({});
  const [yasIdx, setYasIdx] = React.useState<number | null>(null);
  const [asitIdx, setAsitIdx] = React.useState<number | null>(null);

  const pozitif = OLCUTLER.filter(o => olcut[o.id]);
  const n = pozitif.length;

  const yas = yasIdx !== null ? YAS_SECENEKLERI[yasIdx] : null;
  const sinif = yas ? sinifBul(n, yas.yasli) : null;
  const c = sinif ? COLOR[sinif.color] : null;

  const asit = asitIdx !== null ? ASIT_SECENEKLERI[asitIdx] : null;

  /*
   * AYRIŞMA: NIV endikasyonu var ama BAP-65 sınıfı düşük (I ya da II).
   * Şart sınıfın KENDİSİNDEN okunuyor (`no`), sıra indeksinden değil —
   * sınıflar yeniden sıralanırsa sessizce bozulmasın.
   */
  const dusukSinif = sinif?.no === "I" || sinif?.no === "II";
  const ayrisiyor = !!(asit?.niv && dusukSinif);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="bap65" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🫁</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">BAP-65</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">KOAH alevlenmesinde şiddet sınıflaması · Sınıf I–V</p>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-2xl px-4 py-3 flex items-start gap-3">
          <span aria-hidden="true" className="text-amber-400 text-base leading-none mt-0.5">💡</span>
          <p className="text-[11px] leading-relaxed">
            BAP-65 <span className="font-black">pH, PaCO₂ ve oksijenasyonu içermez</span>. Aşağıdaki <span className="font-black">solunumsal asidoz</span> okuması sınıfı değiştirmeden ventilasyon kararını ayrıca gösteriyor — çünkü NIV endikasyonunu sınıf değil asidoz belirler.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-0.5">
            <p id="grp-olcut" className="font-black text-blue-900 uppercase italic text-sm">Akut ölçütler</p>
            <span className="text-[9px] font-black text-blue-900 bg-amber-400 rounded-full px-2 py-0.5 shrink-0">{n}/3</span>
          </div>
          <p id="grp-d-olcut" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">İşaretsiz kutu &quot;bu ölçüt negatif&quot; demektir</p>
          <div role="group" aria-labelledby="grp-olcut grp-d-olcut" className="space-y-1.5">
            {OLCUTLER.map(o => (
              <label key={o.id}
                className={`flex items-start gap-3 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2
                  ${olcut[o.id] ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <input type="checkbox" className="sr-only" checked={!!olcut[o.id]}
                  onChange={e => setOlcut(v => ({ ...v, [o.id]: e.target.checked }))} />
                <span aria-hidden="true" className={`w-7 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5
                  ${olcut[o.id] ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{o.harf}</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-black">{o.label}</span>
                  <span className={`block text-[10px] font-bold leading-snug ${olcut[o.id] ? "text-blue-100" : "text-slate-500"}`}>{o.sub}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p id="grp-yas" className="font-black text-blue-900 uppercase italic text-sm mb-0.5">Yaş</p>
          <p id="grp-d-yas" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sayıma girmez — yalnızca 0 ölçütlü hastada sınıfı belirler</p>
          <div role="group" aria-labelledby="grp-yas grp-d-yas" className="space-y-1.5">
            {YAS_SECENEKLERI.map((o, i) => (
              <button aria-pressed={yasIdx === i} key={o.label} type="button"
                onClick={() => setYasIdx(v => (v === i ? null : i))}
                className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-xl border-2 transition-all
                  ${yasIdx === i ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <span aria-hidden="true" className={`w-7 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5
                  ${yasIdx === i ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>65</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-black">{o.label}</span>
                  {o.sub && <span className={`block text-[10px] font-bold leading-snug ${yasIdx === i ? "text-blue-100" : "text-slate-500"}`}>{o.sub}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p id="grp-asit" className="font-black text-blue-900 uppercase italic text-sm mb-0.5">Solunumsal asidoz</p>
          <p id="grp-d-asit" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">İsteğe bağlı · sınıfa girmez, ventilasyon kararını gösterir</p>
          <div role="group" aria-labelledby="grp-asit grp-d-asit" className="space-y-1.5">
            {ASIT_SECENEKLERI.map((o, i) => (
              <button aria-pressed={asitIdx === i} key={o.kod} type="button"
                onClick={() => setAsitIdx(v => (v === i ? null : i))}
                className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-xl border-2 transition-all
                  ${asitIdx === i ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <span aria-hidden="true" className={`w-7 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5
                  ${asitIdx === i ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>pH</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-black">{o.label}</span>
                  <span className={`block text-[10px] font-bold leading-snug ${asitIdx === i ? "text-blue-100" : "text-slate-500"}`}>{o.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Önek YOK: SonucDuyuru metnin başına kendisi "Sonuç: " ekliyor. */}
        <SonucDuyuru metin={sinif ? `BAP-65 sınıf ${sinif.no} — ${sinif.agirlik}` : null} />

        {sinif && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-24 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">BAP-65</span>
                <span className="text-4xl font-black text-white leading-none">{sinif.no}</span>
                <span className="text-[8px] text-blue-300">{n}/3 ölçüt</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{sinif.agirlik}</span>
                <p className={`text-sm font-black mt-1 ${c.text}`}>
                  {n > 0 ? `Pozitif ölçüt: ${pozitif.map(o => o.harf).join(" · ")}` : "Akut ölçüt yok"}
                </p>
                <p className="text-[10px] font-bold text-slate-600 leading-snug mt-0.5">{sinif.yorum}</p>
              </div>
            </div>

            <div className="bg-white/70 border border-slate-200 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">İkinci okuma — solunumsal asidoz</p>
              {ayrisiyor ? (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  BAP-65 <span className="font-black text-blue-900">sınıf {sinif.no}</span> düşük risk gösteriyor, ama <span className="font-black">akut hiperkapnik solunum yetmezliği</span> var. NIV endikasyonunu sınıf değil asidoz belirler; BAP-65 pH içermediği için bu hastayı düşük riskli göstermeye devam eder. <span className="font-black">Sınıfa dokunulmadı</span> — değişen tek şey ventilasyon kararı.
                  {asit?.agir && <> pH &lt; 7,25 olduğu için NIV başarısızlık riski yüksek: entübasyon hazırlığı ve yakın izlem gerekir.</>}
                </p>
              ) : asit?.niv ? (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  Asidoz NIV endikasyonu koyuyor; BAP-65 de <span className="font-black text-blue-900">sınıf {sinif.no}</span> ile en düşük iki sınıfın dışında — iki okuma <span className="font-black">aynı yönü</span> işaret ediyor.
                  {asit?.agir && <> pH &lt; 7,25 olduğu için NIV başarısızlık riski yüksek: entübasyon hazırlığı ve yakın izlem gerekir.</>}
                </p>
              ) : asit ? (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  pH normal sınırlarda — bu ölçümde NIV endikasyonu doğuran bir asidoz yok. Klinik kötüleşmede kan gazı <span className="font-black">tekrarlanmalıdır</span>.
                </p>
              ) : (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  Kan gazı <span className="font-black">değerlendirilmedi</span>. BAP-65 pH, PaCO₂ ve oksijenasyon içermez; düşük bir sınıf, akut hiperkapnik solunum yetmezliğini <span className="font-black">dışlamaz</span>.
                </p>
              )}
            </div>

            <div className="overflow-x-auto" data-kaydir-serit>
              <div className="grid grid-cols-5 gap-1 text-center min-w-[330px]">
                {SINIFLAR.map(s => (
                  <div key={s.no} className={`rounded-lg py-2 px-1 ${s.no === sinif.no ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                    <div className="text-[13px] font-black leading-none">{s.no}</div>
                    <div className="text-[8px] font-bold uppercase tracking-wider mt-1 leading-none">{sinifKosul(s)}</div>
                    <div className="text-[8px] font-black mt-1 leading-tight">{s.agirlik.replace(" RİSK", "")}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yaş bandı seçilmedi</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Sınıf, yaş bandı seçilince hesaplanır. Akut ölçüt kutuları isteğe bağlıdır — işaretsiz kutu &quot;bu ölçüt negatif&quot; demektir.</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              BAP-65 bir <span className="font-black">şiddet sınıflamasıdır</span>, yatış ya da taburculuk kuralı değil: karar klinik tablo, ek hastalıklar, sosyal koşullar ve tedaviye yanıtla birlikte verilir. Ölçek KOAH akut alevlenmesiyle <span className="font-black">hastaneye yatırılan</span> 40 yaş üstü erişkinlerde türetilmiş ve doğrulanmıştır. Sınıfa karşılık gelen mortalite ve ventilasyon oranları kohorta göre belirgin biçimde değiştiği için burada <span className="font-black">tek bir yüzde basılmaz</span>; yayımlanmış çapa, mekanik ventilasyon ihtiyacının en düşük sınıfta ≈%2 iken en yüksek sınıfta %55 olmasıdır. Ölçüt <span className="font-black">pH, PaCO₂ ve oksijenasyon içermez</span> — bu bileşenleri taşıyan DECAF gibi ölçekler karşılaştırmalı çalışmalarda daha iyi ayrım gösterebilmektedir. Tabak YP et al., Arch Intern Med 2009;169(17):1595-602; Shorr AF et al., Chest 2011;140(5):1177-83.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
