"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import PuanliKriterler, { kriterPuani, kumeDegistir, type KriterGrubu } from "@/app/tools/components/PuanliKriterler";

/**
 * EULAR/ACR 2019 SLE sınıflama kriterleri (Aringer ve ark., Arthritis Rheumatol 2019).
 *
 * Giriş kriteri: ANA ≥ 1:80 (HEp-2) en az bir kez. Her alanda EN YÜKSEK puanlı madde sayılır.
 * Sınıflama: toplam ≥ 10 VE en az bir KLİNİK kriter. Yalnızca immünolojik maddelerle 10'a
 * ulaşan hasta (ör. anti-dsDNA 6 + düşük C3 ve C4 4) SLE SINIFLANMIYOR — ayrı denetleniyor.
 */
const KLINIK: ReadonlyArray<KriterGrubu> = [
  { baslik: "Konstitüsyonel", kural: "enYuksek", maddeler: [{ id: "ates", metin: "Ateş (> 38,3 °C)", puan: 2 }] },
  {
    baslik: "Hematolojik", kural: "enYuksek", maddeler: [
      { id: "lokopeni", metin: "Lökopeni (< 4000/mm³)", puan: 3 },
      { id: "trombositopeni", metin: "Trombositopeni (< 100 000/mm³)", puan: 4 },
      { id: "hemoliz", metin: "Otoimmün hemoliz", puan: 4 },
    ],
  },
  {
    baslik: "Nöropsikiyatrik", kural: "enYuksek", maddeler: [
      { id: "deliryum", metin: "Deliryum", puan: 2 },
      { id: "psikoz", metin: "Psikoz", puan: 3 },
      { id: "nobet", metin: "Nöbet", puan: 5 },
    ],
  },
  {
    baslik: "Mukokutanöz", kural: "enYuksek", maddeler: [
      { id: "alopesi", metin: "Skar bırakmayan alopesi", puan: 2 },
      { id: "oral", metin: "Oral ülser", puan: 2 },
      { id: "subakut", metin: "Subakut kutanöz ya da diskoid lupus", puan: 4 },
      { id: "akutKutanoz", metin: "Akut kutanöz lupus", puan: 6 },
    ],
  },
  {
    baslik: "Seröz zar", kural: "enYuksek", maddeler: [
      { id: "efuzyon", metin: "Plevral ya da perikardiyal efüzyon", puan: 5 },
      { id: "perikardit", metin: "Akut perikardit", puan: 6 },
    ],
  },
  { baslik: "Kas-iskelet", kural: "enYuksek", maddeler: [{ id: "eklem", metin: "Eklem tutulumu (≥ 2 eklemde sinovit ya da ≥ 2 eklemde hassasiyet + ≥ 30 dk sabah tutukluluğu)", puan: 6 }] },
  {
    baslik: "Böbrek", kural: "enYuksek", maddeler: [
      { id: "proteinuri", metin: "Proteinüri > 0,5 g/24 saat", puan: 4 },
      { id: "sinif25", metin: "Böbrek biyopsisi: lupus nefriti sınıf II ya da V", puan: 8 },
      { id: "sinif34", metin: "Böbrek biyopsisi: lupus nefriti sınıf III ya da IV", puan: 10 },
    ],
  },
];

const IMMUN: ReadonlyArray<KriterGrubu> = [
  { baslik: "Antifosfolipid antikorları", kural: "enYuksek", maddeler: [{ id: "apl", metin: "Antikardiyolipin, anti-β2GP1 ya da lupus antikoagülanı pozitif", puan: 2 }] },
  {
    baslik: "Kompleman", kural: "enYuksek", maddeler: [
      { id: "c3yaC4", metin: "Düşük C3 YA DA düşük C4", puan: 3 },
      { id: "c3veC4", metin: "Düşük C3 VE düşük C4", puan: 4 },
    ],
  },
  { baslik: "SLE'ye özgü antikorlar", kural: "enYuksek", maddeler: [{ id: "dsdna", metin: "Anti-dsDNA ya da anti-Smith pozitif", puan: 6 }] },
];

const ANA: Secenek[] = [{ label: "Evet (≥ 1:80)", pts: 0 }, { label: "Hayır", pts: 0 }];

const BANTLAR: Bant[] = [
  { aralik: "< 10 ya da klinik kriter yok", etiket: "Sınıflanmıyor", alt: "EULAR/ACR 2019 SLE sınıflama kriterleri karşılanmıyor.", renk: "slate" },
  { aralik: "≥ 10 + ≥ 1 klinik", etiket: "SLE", alt: "EULAR/ACR 2019 SLE sınıflama kriterleri karşılanıyor.", renk: "rose" },
];

export default function Sle2019Page() {
  const [ana, setAna] = React.useState<number | null>(null);
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const degistir = (id: string) => setSecili((s) => kumeDegistir(s, id));

  const klinik = kriterPuani(KLINIK, secili);
  const immun = kriterPuani(IMMUN, secili);
  const toplam = klinik.toplam + immun.toplam;
  const klinikVar = klinik.toplam > 0;
  const skor = ana === 0 ? toplam : null;
  const bant = skor === null ? null : skor >= 10 && klinikVar ? BANTLAR[1] : BANTLAR[0];
  const yalnizImmun = ana === 0 && toplam >= 10 && !klinikVar;

  return (
    <OlcekKabugu
      slug="sle-2019"
      ikon="🦋"
      baslik="EULAR/ACR 2019 SLE Kriterleri"
      altBaslik="Sistemik Lupus Eritematozus Sınıflaması · ≥ 10 Puan + ≥ 1 Klinik Kriter"
      paylasim={{ sle2019: skor }}
      not={
        <p>
          Bir kriter, SLE'den daha olası bir açıklaması varsa sayılmaz (ör. enfeksiyona bağlı ateş). Kriterlerin aynı anda bulunması gerekmez; en az bir kez
          görülmesi yeterlidir. Sınıflama kriterleridir — tanı klinik karardır ve kriteri karşılamayan hasta SLE olabilir. Aringer M ve ark.,
          Arthritis Rheumatol 2019.
        </p>
      }
    >
      <SecimMaddesi id="ana" baslik="Giriş kriteri — HEp-2 hücrelerinde ANA ≥ 1:80 (en az bir kez)" secenekler={ANA} secili={ana} onSec={setAna} rozetGizle />
      {ana === 1 && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Giriş kriteri karşılanmıyor — EULAR/ACR 2019 kriterleri uygulanmaz; puan hesaplanmadı.
        </div>
      )}
      <section aria-labelledby="sle-klinik" className="space-y-2">
        <h2 id="sle-klinik" className="px-1 text-sm font-black text-blue-900 uppercase tracking-widest">Klinik alanlar · {klinik.toplam} puan</h2>
        <PuanliKriterler gruplar={KLINIK} secili={secili} onDegistir={degistir} />
      </section>
      <section aria-labelledby="sle-immun" className="space-y-2">
        <h2 id="sle-immun" className="px-1 text-sm font-black text-blue-900 uppercase tracking-widest">İmmünolojik alanlar · {immun.toplam} puan</h2>
        <PuanliKriterler gruplar={IMMUN} secili={secili} onDegistir={degistir} />
      </section>

      {yalnizImmun && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Toplam {toplam} puan ama hiçbir klinik kriter yok — yalnızca immünolojik maddelerle SLE sınıflanmaz.
        </div>
      )}
      <SkorPaneli
        skor={skor}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={ana === null ? "Önce giriş kriterini yanıtlayın" : "Giriş kriteri karşılanmıyor"}
        ek={skor !== null ? <p className="text-[11px] font-bold text-slate-700">Klinik {klinik.toplam} · immünolojik {immun.toplam}</p> : null}
      />
    </OlcekKabugu>
  );
}
