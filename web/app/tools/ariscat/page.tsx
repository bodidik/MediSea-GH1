"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/*
 * ARISCAT — Canet et al., Anesthesiology 2010.
 * Postoperatif pulmoner komplikasyon (PPK) riski, 7 preoperatif değişkenden.
 *
 * Seçim PUANLA değil İNDEKSLE saklanıyor. Bu depoda "aynı puanlı iki şık
 * tek düğme olur" sınıfı ALTI kez ölçüldü (apache2 · gout-acr · pap-score ·
 * nutrition-needs · tirads · nihss). Burada her grup KENDİ İÇİNDE benzersiz
 * puanlar taşıyor, yani şekil bugün latent — ama gruplar arasında "0" yedi
 * kez tekrar ediyor ve ileride bir bileşene ikinci bir sıfır puanlı şık
 * eklenirse kusur kendiliğinden doğardı.
 */
const BILESENLER: {
  id: string;
  ad: string;
  ipucu: string;
  duzeltilebilir?: string;
  secenekler: { label: string; sub?: string; puan: number }[];
}[] = [
  {
    id: "yas",
    ad: "Yaş",
    ipucu: "Hastanın kronolojik yaşı",
    secenekler: [
      { label: "≤ 50 yaş", puan: 0 },
      { label: "51–80 yaş", puan: 3 },
      { label: "> 80 yaş", puan: 16 },
    ],
  },
  {
    id: "spo2",
    ad: "Preoperatif SpO₂",
    ipucu: "ODA HAVASINDA, oturur pozisyonda ölçülmüş değer",
    secenekler: [
      { label: "≥ %96", puan: 0 },
      { label: "%91–95", puan: 8 },
      { label: "≤ %90", puan: 24 },
    ],
  },
  {
    id: "enfeksiyon",
    ad: "Son 1 ayda solunum yolu enfeksiyonu",
    ipucu: "Ateş ve antibiyotik gerektiren üst ya da alt solunum yolu enfeksiyonu",
    duzeltilebilir: "Elektif cerrahi ertelenerek giderilebilir",
    secenekler: [
      { label: "Yok", puan: 0 },
      { label: "Var", puan: 17 },
    ],
  },
  {
    id: "anemi",
    ad: "Preoperatif anemi",
    ipucu: "Hemoglobin ≤ 10 g/dL",
    duzeltilebilir: "Preoperatif tedaviyle düzeltilebilir",
    secenekler: [
      { label: "Hb > 10 g/dL", puan: 0 },
      { label: "Hb ≤ 10 g/dL", puan: 11 },
    ],
  },
  {
    id: "insizyon",
    ad: "Cerrahi insizyon",
    ipucu: "Riski belirleyen şey diyaframa yakınlık",
    secenekler: [
      { label: "Periferik", sub: "Ekstremite, yüzeyel, baş-boyun", puan: 0 },
      { label: "Üst abdominal", puan: 15 },
      { label: "İntratorasik", puan: 24 },
    ],
  },
  {
    id: "sure",
    ad: "Öngörülen cerrahi süre",
    ipucu: "Ameliyathane süresi, anestezi süresi değil",
    secenekler: [
      { label: "< 2 saat", puan: 0 },
      { label: "2–3 saat", puan: 16 },
      { label: "> 3 saat", puan: 23 },
    ],
  },
  {
    id: "acil",
    ad: "Acil cerrahi",
    ipucu: "Planlanmamış, acil endikasyonlu girişim",
    secenekler: [
      { label: "Hayır — elektif", puan: 0 },
      { label: "Evet — acil", puan: 8 },
    ],
  },
];

/*
 * TAVAN TÜRETİLİYOR, elle yazılmıyor. Bu depoda elle yazılan payda bir kez
 * sessizce bayatladı (nihss "/ 42", türetilmiş TAVAN varken elle yazılıydı).
 */
const TAVAN = BILESENLER.reduce(
  (t, b) => t + Math.max(...b.secenekler.map(s => s.puan)),
  0
);

/*
 * Yayımlanmış ARISCAT bantları ve geliştirme kohortundaki PPK oranları.
 * Bant sınırları TEK yerde duruyor; aşağıdaki cetvel ve metinler onlardan
 * türüyor — ikinci bir gerçeklik yok.
 */
const BANTLAR: { altSinir: number; label: string; oran: string; color: string; sub: string }[] = [
  { altSinir: 0,  label: "DÜŞÜK RİSK",  oran: "≈ %1.6",  color: "emerald", sub: "Rutin postoperatif takip" },
  { altSinir: 26, label: "ORTA RİSK",   oran: "≈ %13.3", color: "amber",   sub: "Solunum fizyoterapisi ve yakın izlem düşünün" },
  { altSinir: 45, label: "YÜKSEK RİSK", oran: "≈ %42.1", color: "rose",    sub: "Yoğun bakım planı ve preoperatif optimizasyon değerlendirin" },
];

const bantBul = (p: number) =>
  [...BANTLAR].reverse().find(b => p >= b.altSinir) ?? BANTLAR[0];

const bantAralik = (i: number) =>
  i === BANTLAR.length - 1
    ? `≥ ${BANTLAR[i].altSinir}`
    : `${BANTLAR[i].altSinir}–${BANTLAR[i + 1].altSinir - 1}`;

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   badge: "bg-amber-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

const kimlik = (id: string) => String(id).replace(/[^a-zA-Z0-9]+/g, "-");

export default function AriscatPage() {
  const [secim, setSecim] = React.useState<Record<string, number | null>>(
    Object.fromEntries(BILESENLER.map(b => [b.id, null]))
  );
  const [oksijen, setOksijen] = React.useState(false);

  const yanitlanan = BILESENLER.filter(b => secim[b.id] !== null).length;
  const tamam = yanitlanan === BILESENLER.length;

  const puanOf = (b: (typeof BILESENLER)[number]) => {
    const i = secim[b.id];
    return i === null || i === undefined ? 0 : b.secenekler[i].puan;
  };

  const puan = tamam ? BILESENLER.reduce((t, b) => t + puanOf(b), 0) : null;

  /*
   * İKİNCİ OKUMA — DÜZELTİLEBİLİR YÜK.
   *
   * ARISCAT toplamsal bir skor ve tek bir sayı veriyor; o sayının ne kadarının
   * BUGÜN müdahale edilebilir bileşenlerden geldiği ayrı bir bilgi ve klinik
   * kararı (ertele / optimize et / devam et) doğrudan besliyor.
   *
   * Düzeltilebilir sayılan İKİ bileşen var ve ikisi de literatürde açık
   * öneri taşıyor: aktif solunum yolu enfeksiyonu (elektif cerrahiyi ertele)
   * ve anemi (preoperatif tedavi). Süre, insizyon ve acillik BİLEREK dışarıda:
   * onlar cerrahi kararın kendisi, preoperatif optimizasyon hedefi değil —
   * "düzeltilebilir" saymak, aracın ölçmediği bir iddia olurdu.
   *
   * Bu okuma birincil skoru DEĞİŞTİRMİYOR. Aynı disiplin abg (Δgap),
   * sodium (desalinasyon) ve rankin (yapılandırılmış görüşme) turlarında
   * ölçüldü: ikinci okuma ayrışırsa SÖYLÜYOR, hükmü kurmuyor.
   */
  const duzeltilebilirYuk = tamam
    ? BILESENLER.filter(b => b.duzeltilebilir).reduce((t, b) => t + puanOf(b), 0)
    : 0;
  const optimizePuan = puan !== null ? puan - duzeltilebilirYuk : null;
  const bant = puan !== null ? bantBul(puan) : null;
  const optimizeBant = optimizePuan !== null ? bantBul(optimizePuan) : null;
  const bantDusuyor =
    bant !== null && optimizeBant !== null && optimizeBant.label !== bant.label;

  const c = bant ? COLOR[bant.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="ariscat" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🫁</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ARISCAT</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Postoperatif pulmoner komplikasyon riski · {BILESENLER.length} değişken · 0–{TAVAN}</p>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-2xl px-4 py-3 flex items-start gap-3">
          <span aria-hidden="true" className="text-amber-400 text-base leading-none mt-0.5">💡</span>
          <p className="text-[11px] leading-relaxed">
            ARISCAT <span className="font-black">preoperatif</span> bir skordur: cerrahiden önce, hasta hâlâ optimize edilebilirken hesaplanır. Aşağıdaki <span className="font-black">düzeltilebilir yük</span> okuması skorun ne kadarının bugün müdahale edilebilir bileşenlerden geldiğini ayrıca gösteriyor.
          </p>
        </div>

        {BILESENLER.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-0.5">
              <p id={`grp-${kimlik(b.id)}`} className="font-black text-blue-900 uppercase italic text-sm">{b.ad}</p>
              {secim[b.id] !== null && (
                <span className="text-[9px] font-black text-blue-900 bg-amber-400 rounded-full px-2 py-0.5 shrink-0">+{puanOf(b)}</span>
              )}
            </div>
            <p id={`grp-d-${kimlik(b.id)}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{b.ipucu}</p>
            <div role="group" aria-labelledby={`grp-${kimlik(b.id)} grp-d-${kimlik(b.id)}`} className="space-y-1.5">
              {b.secenekler.map((s, i) => (
                <button aria-pressed={secim[b.id] === i} key={s.label} type="button"
                  onClick={() => setSecim(v => ({ ...v, [b.id]: v[b.id] === i ? null : i }))}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-xl border-2 transition-all
                    ${secim[b.id] === i ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                  <span className={`w-7 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5
                    ${secim[b.id] === i ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>+{s.puan}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-black">{s.label}</span>
                    {s.sub && <span className={`block text-[10px] font-bold leading-snug ${secim[b.id] === i ? "text-blue-100" : "text-slate-500"}`}>{s.sub}</span>}
                  </span>
                </button>
              ))}
            </div>

            {/* SpO₂ ODA HAVASI KURALI — ilan ediliyor VE bir şey yapıyor.
                Yayımlanmış ARISCAT'te oksijen desteği için bir düzeltme YOK,
                o yüzden skora dokunmuyor; uydurma bir düzeltme, aracın
                ölçmediği bir iddia olurdu. Yapılan tek şey, ölçümün kendi
                geçerlilik koşulunu söylemek. */}
            {b.id === "spo2" && (
              <label className="mt-3 flex items-start gap-2.5 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2">
                <input type="checkbox" className="sr-only" checked={oksijen} onChange={e => setOksijen(e.target.checked)} />
                <span aria-hidden="true" className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-black
                  ${oksijen ? "bg-blue-900 border-blue-900 text-white" : "bg-white border-slate-300"}`}>{oksijen ? "✓" : ""}</span>
                <span className="text-[10px] font-bold text-slate-600 leading-snug">Bu SpO₂ değeri <span className="font-black">oksijen desteği altında</span> ölçüldü</span>
              </label>
            )}
          </div>
        ))}

        {/* Önek YOK: SonucDuyuru metnin başına kendisi "Sonuç: " ekliyor. */}
        <SonucDuyuru metin={puan !== null && bant ? `ARISCAT ${puan} — ${bant.label}` : null} />

        {puan !== null && bant && c && optimizeBant !== null && optimizePuan !== null ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-24 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">ARISCAT</span>
                <span className="text-4xl font-black text-white leading-none">{puan}</span>
                <span className="text-[8px] text-blue-300">/ {TAVAN}</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{bant.label}</span>
                <p className={`text-sm font-black mt-1 ${c.text}`}>{bant.oran} pulmoner komplikasyon</p>
                <p className="text-[10px] font-bold text-slate-600 leading-snug mt-0.5">{bant.sub}</p>
              </div>
            </div>

            {oksijen && (
              <div className="bg-white/80 border-2 border-amber-300 rounded-xl px-3 py-2">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">SpO₂ oda havasında ölçülmedi</p>
                <p className="text-[10px] font-bold text-slate-700 leading-relaxed mt-1">
                  ARISCAT, SpO₂&apos;yi <span className="font-black">oda havasında</span> ölçülmüş kabul eder. Oksijen desteği altındaki değer gerçek satürasyonu olduğundan yüksek gösterir, yani bu skor riski <span className="font-black">OLDUĞUNDAN DÜŞÜK</span> tahmin ediyor olabilir. Yayımlanmış ölçekte bunun için bir düzeltme yok; skora dokunulmadı.
                </p>
              </div>
            )}

            <div className="bg-white/70 border border-slate-200 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">İkinci okuma — düzeltilebilir yük</p>
              {duzeltilebilirYuk > 0 ? (
                <>
                  <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                    Skorun <span className="font-black text-blue-900">{duzeltilebilirYuk} puanı</span> bugün müdahale edilebilir bileşenlerden geliyor. Giderilirse ARISCAT <span className="font-black text-blue-900">{optimizePuan}</span> olur — <span className="font-black">{optimizeBant.label}</span> ({optimizeBant.oran}).
                  </p>
                  <ul className="mt-2 space-y-1">
                    {BILESENLER.filter(b => b.duzeltilebilir && puanOf(b) > 0).map(b => (
                      <li key={b.id} className="text-[10px] font-bold text-slate-600 leading-snug flex items-start gap-2">
                        <span className="text-[9px] font-black text-blue-900 bg-amber-400 rounded-full px-1.5 shrink-0">+{puanOf(b)}</span>
                        <span>{b.ad} — {b.duzeltilebilir}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-[11px] font-bold text-slate-700 mt-1 leading-relaxed">
                  Skorun tamamı <span className="font-black">bugün düzeltilemeyen</span> bileşenlerden geliyor (yaş, satürasyon, insizyon, süre, acillik). Preoperatif ertelemenin bu skoru düşürmesi beklenmez.
                </p>
              )}
            </div>

            {bantDusuyor && (
              <div className="bg-white/80 border-2 border-amber-300 rounded-xl px-3 py-2">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">İki okuma ayrışıyor — bant değişiyor</p>
                <p className="text-[10px] font-bold text-slate-700 leading-relaxed mt-1">
                  Bugünkü skor <span className="font-black">{bant.label}</span>, düzeltilebilir bileşenler giderildiğinde <span className="font-black">{optimizeBant.label}</span>. Yukarıdaki sonuç <span className="font-black">BUGÜNKÜ</span> durumdan kuruldu; ertelemenin bant değiştirdiği bu vakada elektif cerrahide erteleme kararı ayrıca değerlendirilir.
                </p>
              </div>
            )}

            <div className="overflow-x-auto" data-kaydir-serit>
              <div className="grid grid-cols-3 gap-1 text-center min-w-[280px]">
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{yanitlanan}/{BILESENLER.length} değişken seçildi</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Skor, yedi değişkenin hepsi seçilince hesaplanır</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              ARISCAT bir <span className="font-black">popülasyon riski</span> tahminidir, bireysel bir hüküm değil: oranlar Katalonya çok merkezli kohortundan gelir ve dış doğrulamada (PERISCOPE, Avrupa) ayrımı korunmuş ama mutlak oranlar merkeze göre değişmiştir. SpO₂ <span className="font-black">oda havasında</span> ölçülmelidir. Skor sigara, KOAH ve obeziteyi ayrı değişken olarak İÇERMEZ; bu durumlar riski bağımsız olarak artırabilir. Canet et al., Anesthesiology 2010.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
