"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";

/**
 * EULAR/ACR 2017 idiyopatik inflamatuvar miyopati (İİM) sınıflama kriterleri (Lundberg ve ark., Ann Rheum Dis 2017).
 *
 * Her maddenin İKİ ağırlığı var: kas biyopsisi YOKSA ve VARSA. Olasılık:
 *   biyopsisiz  P = 1 / (1 + e^(5,33 − skor))
 *   biyopsili   P = 1 / (1 + e^(6,49 − skor))
 * Muhtemel (probable) İİM ≥ %55 (biyopsisiz ≥ 5,5 · biyopsili ≥ 6,7) · kesin ≥ %90 (≥ 7,5 · ≥ 8,7) · olası (possible) %50–54.
 * Bant eşiklerle değil OLASILIKLA belirleniyor; eşikler ekranda bilgi olarak duruyor.
 *
 * Alt sınıflama yalnızca muhtemel/kesin İİM'de ve kaba: deri bulgusu → dermatomiyozit (zayıflık yoksa amiyopatik);
 * rimmed vakuol → inklüzyon cisimciği miyoziti düşün; öteki → polimiyozit / immün aracılı nekrotizan miyopati (ek değerlendirme).
 */
type Madde = { id: string; metin: string; biyopsisiz: number; biyopsili: number };

const KAS: ReadonlyArray<Madde> = [
  { id: "ustZayif", metin: "Üst ekstremite proksimalinde objektif, simetrik, genellikle ilerleyici zayıflık", biyopsisiz: 0.7, biyopsili: 0.7 },
  { id: "altZayif", metin: "Alt ekstremite proksimalinde objektif, simetrik, genellikle ilerleyici zayıflık", biyopsisiz: 0.8, biyopsili: 0.5 },
  { id: "boyun", metin: "Boyun fleksörleri boyun ekstansörlerinden görece daha zayıf", biyopsisiz: 1.9, biyopsili: 1.6 },
  { id: "bacak", metin: "Bacaklarda proksimal kaslar distal kaslardan görece daha zayıf", biyopsisiz: 0.9, biyopsili: 1.2 },
];
const DERI: ReadonlyArray<Madde> = [
  { id: "heliotrop", metin: "Heliotrop döküntü", biyopsisiz: 3.1, biyopsili: 3.2 },
  { id: "gottronPapul", metin: "Gottron papülleri", biyopsisiz: 2.1, biyopsili: 2.7 },
  { id: "gottronBulgu", metin: "Gottron bulgusu", biyopsisiz: 3.3, biyopsili: 3.7 },
];
const DIGER: ReadonlyArray<Madde> = [
  { id: "disfaji", metin: "Disfaji ya da özofagus dismotilitesi", biyopsisiz: 0.7, biyopsili: 0.6 },
  { id: "jo1", metin: "Anti-Jo-1 (anti-histidil-tRNA sentetaz) pozitif", biyopsisiz: 3.9, biyopsili: 3.8 },
  { id: "enzim", metin: "Serum CK, LDH, AST ya da ALT yüksekliği (hastalık seyrinde en yüksek değer)", biyopsisiz: 1.3, biyopsili: 1.4 },
];
const BIYOPSI: ReadonlyArray<Madde> = [
  { id: "endomisyal", metin: "Kas liflerini çevreleyen ama invaze etmeyen endomisyal mononükleer hücre infiltrasyonu", biyopsisiz: 0, biyopsili: 1.7 },
  { id: "perimisyal", metin: "Perimisyal ve/veya perivasküler mononükleer hücre infiltrasyonu", biyopsisiz: 0, biyopsili: 1.2 },
  { id: "perifasikuler", metin: "Perifasiküler atrofi", biyopsisiz: 0, biyopsili: 1.9 },
  { id: "rimmed", metin: "Rimmed (çerçeveli) vakuoller", biyopsisiz: 0, biyopsili: 3.1 },
];

const YAS: ReadonlyArray<{ label: string; biyopsisiz: number; biyopsili: number }> = [
  { label: "< 18", biyopsisiz: 0, biyopsili: 0 },
  { label: "18 – < 40", biyopsisiz: 1.3, biyopsili: 1.5 },
  { label: "≥ 40", biyopsisiz: 2.1, biyopsili: 2.2 },
];

const SABIT = { biyopsisiz: 5.33, biyopsili: 6.49 } as const;
const ESIK = { biyopsisiz: { olasi: 5.5, kesin: 7.5 }, biyopsili: { olasi: 6.7, kesin: 8.7 } } as const;

const BIYOPSI_SECENEK: Secenek[] = [{ label: "Yapılmadı", pts: 0 }, { label: "Yapıldı", pts: 0 }];

const tr = (n: number, h = 1) => n.toFixed(h).replace(".", ",");

export default function Miyozit2017Page() {
  const [biyopsi, setBiyopsi] = React.useState<number | null>(null);
  const [yas, setYas] = React.useState<number | null>(null);
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());

  const kip = biyopsi === 1 ? "biyopsili" : "biyopsisiz";
  const gruplar: ReadonlyArray<{ baslik: string; maddeler: ReadonlyArray<Madde> }> = [
    { baslik: "Kas zayıflığı", maddeler: KAS },
    { baslik: "Deri bulguları", maddeler: DERI },
    { baslik: "Diğer klinik ve laboratuvar", maddeler: DIGER },
    ...(biyopsi === 1 ? [{ baslik: "Kas biyopsisi", maddeler: BIYOPSI }] : []),
  ];
  const tumMaddeler = gruplar.flatMap((g) => g.maddeler);
  const hazir = biyopsi !== null && yas !== null;
  const skor = hazir ? YAS[yas!][kip] + tumMaddeler.filter((m) => secili.has(m.id)).reduce((t, m) => t + m[kip], 0) : null;
  const olasilik = skor !== null ? 1 / (1 + Math.exp(SABIT[kip] - skor)) : null;
  const yuzde = olasilik !== null ? Math.round(olasilik * 100) : null;

  const sinif = olasilik === null ? null : olasilik >= 0.9 ? "Kesin İİM" : olasilik >= 0.55 ? "Muhtemel İİM (probable)" : olasilik >= 0.5 ? "Olası İİM (possible)" : "İİM değil";
  const iim = olasilik !== null && olasilik >= 0.55;

  const deriVar = DERI.some((m) => secili.has(m.id));
  const zayiflikVar = KAS.some((m) => secili.has(m.id));
  let altSinif = "";
  if (iim) {
    if (yas === 0) altSinif = "Juvenil başlangıç — juvenil dermatomiyozit ya da juvenil miyozit (bu site erişkin odaklıdır).";
    else if (deriVar) altSinif = zayiflikVar ? "Dermatomiyozit" : "Amiyopatik dermatomiyozit";
    else if (secili.has("rimmed") && biyopsi === 1) altSinif = "İnklüzyon cisimciği miyoziti düşünülmeli (parmak fleksörü zayıflığı ve tedaviye yanıtsızlıkla birlikte).";
    else altSinif = "Polimiyozit ya da immün aracılı nekrotizan miyopati — miyozite özgü antikorlar (anti-SRP, anti-HMGCR) ve biyopsi ile ayırın.";
  }

  return (
    <OlcekKabugu
      slug="miyozit-2017"
      ikon="💪"
      baslik="EULAR/ACR 2017 Miyozit Kriterleri"
      altBaslik="İdiyopatik İnflamatuvar Miyopati Sınıflaması · Olasılık Temelli"
      paylasim={{ skor: skor !== null ? Number(skor.toFixed(1)) : null, olasilik: yuzde }}
      not={
        <p>
          Kriterler, zayıflığı başka bir nedenle (distrofi, metabolik miyopati, ilaç/toksik, endokrin, nörojenik) açıklanamayan hastada uygulanır. Deri
          bulguları olan hastada biyopsi gerekmeden sınıflama yapılabilir. Anti-Jo-1 dışındaki miyozite özgü antikorlar kriterlere dahil değildir ama alt tip
          ayrımında yol gösterir. Lundberg IE ve ark., Ann Rheum Dis 2017.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="biyopsi" baslik="Kas biyopsisi" aciklama="Biyopsi yapıldıysa madde ağırlıkları ve eşikler değişir." secenekler={BIYOPSI_SECENEK} secili={biyopsi} onSec={setBiyopsi} rozetGizle />
        <SecimMaddesi
          id="yas"
          baslik="Hastalıkla ilişkili ilk semptomun başlangıç yaşı"
          secenekler={YAS.map((y) => ({ label: y.label, pts: y[kip] }))}
          secili={yas}
          onSec={setYas}
        />
      </div>

      {gruplar.map((g) => (
        <fieldset key={g.baslik} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <legend className="px-2 text-[12px] font-black text-blue-900">{g.baslik}</legend>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {g.maddeler.map((m) => {
              const aktif = secili.has(m.id);
              return (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                    ${aktif ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
                >
                  <input type="checkbox" checked={aktif} onChange={() => setSecili((s) => kumeDegistir(s, m.id))} className="w-4 h-4 accent-blue-900 shrink-0" />
                  <span className="flex-1 min-w-0 text-[12px] font-bold text-blue-950 leading-snug">{m.metin}</span>
                  <span className={`shrink-0 min-w-[2.5rem] h-7 px-1.5 rounded-lg flex items-center justify-center text-[11px] font-black ${aktif ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-700"}`}>
                    {tr(m[kip])}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <SonucDuyuru metin={sinif && yuzde !== null ? `${sinif} — olasılık %${yuzde}` : null} />
      {skor !== null && olasilik !== null && sinif ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${iim ? "border-rose-200 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-800"}`}>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Skor ({kip === "biyopsili" ? "biyopsili" : "biyopsisiz"})</p>
              <p className="text-4xl font-black">{tr(skor)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">İİM olasılığı</p>
              <p className="text-4xl font-black">%{yuzde}</p>
            </div>
          </div>
          <p className="text-xl font-black">{sinif}</p>
          <p className="text-[12px] font-bold">
            Eşikler ({kip === "biyopsili" ? "biyopsili" : "biyopsisiz"}): muhtemel ≥ {tr(ESIK[kip].olasi)} (%55) · kesin ≥ {tr(ESIK[kip].kesin)} (%90) · %50–54 olası
          </p>
          {altSinif && <p className="text-[13px] font-black">Alt sınıf: {altSinif}</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Biyopsi ve başlangıç yaşı sorularını yanıtlayın</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
