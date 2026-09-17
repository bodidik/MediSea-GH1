"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import PuanliKriterler, { kriterPuani, kumeDegistir, type KriterGrubu } from "@/app/tools/components/PuanliKriterler";

/**
 * EULAR/ACR 2012 polimiyalji romatika geçici sınıflama kriterleri (Dasgupta ve ark., Ann Rheum Dis 2012).
 *
 * Ön koşul: yaş ≥ 50, iki taraflı omuz ağrısı, anormal CRP ve/veya ESR.
 * Ultrason YAPILMADIYSA eşik ≥ 4 (0–6), YAPILDIYSA ultrason maddeleri eklenir ve eşik ≥ 5 (0–8).
 * Kip ultrason sorusundan gelir; ultrason maddeleri yalnızca "yapıldı" kipinde sayılır.
 */
const KLINIK: ReadonlyArray<KriterGrubu> = [
  {
    baslik: "Klinik ve laboratuvar", kural: "toplam", maddeler: [
      { id: "tutukluk", metin: "Sabah tutukluluğu > 45 dakika", puan: 2 },
      { id: "kalca", metin: "Kalça ağrısı ya da hareket kısıtlılığı", puan: 1 },
      { id: "seronegatif", metin: "RF ve ACPA negatif", puan: 2 },
      { id: "digerEklem", metin: "Başka eklem tutulumu yok", puan: 1 },
    ],
  },
];
const ULTRASON: ReadonlyArray<KriterGrubu> = [
  {
    baslik: "Ultrason", kural: "toplam", maddeler: [
      { id: "usOmuzKalca", metin: "≥ 1 omuzda subdeltoid bursit, biseps tenosinoviti ya da glenohumeral sinovit VE ≥ 1 kalçada sinovit ya da trokanterik bursit", puan: 1 },
      { id: "usIkiOmuz", metin: "İki omuzda subdeltoid bursit, biseps tenosinoviti ya da glenohumeral sinovit", puan: 1 },
    ],
  },
];

const EH: Secenek[] = [{ label: "Evet", pts: 0 }, { label: "Hayır", pts: 0 }];
const US: Secenek[] = [{ label: "Yapılmadı", pts: 0 }, { label: "Yapıldı", pts: 0 }];

export default function Pmr2012Page() {
  const [onkosul, setOnkosul] = React.useState<number | null>(null);
  const [us, setUs] = React.useState<number | null>(null);
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const degistir = (id: string) => setSecili((s) => kumeDegistir(s, id));

  const usVar = us === 1;
  const klinik = kriterPuani(KLINIK, secili).toplam;
  const usPuan = usVar ? kriterPuani(ULTRASON, secili).toplam : 0;
  const esik = usVar ? 5 : 4;
  const skor = onkosul === 0 && us !== null ? klinik + usPuan : null;

  const bantlar: Bant[] = [
    { aralik: `< ${esik}`, etiket: "Sınıflanmıyor", alt: "EULAR/ACR 2012 PMR sınıflama kriterleri karşılanmıyor.", renk: "slate" },
    { aralik: `≥ ${esik}`, etiket: "Polimiyalji romatika", alt: `EULAR/ACR 2012 PMR sınıflama kriterleri karşılanıyor (${usVar ? "ultrasonla" : "ultrasonsuz"}).`, renk: "rose" },
  ];
  const bant = skor === null ? null : skor >= esik ? bantlar[1] : bantlar[0];

  return (
    <OlcekKabugu
      slug="pmr-2012"
      ikon="🧍"
      baslik="EULAR/ACR 2012 PMR Kriterleri"
      altBaslik="Polimiyalji Romatika Sınıflaması · Ultrasonsuz ≥ 4 · Ultrasonla ≥ 5"
      paylasim={{ pmr: skor, us: us }}
      not={
        <p>
          Geçici sınıflama kriterleridir; PMR'yi taklit eden durumlar (seronegatif erken RA, dev hücreli arterit, enfeksiyon, malignite, hipotiroidi,
          statin miyopatisi) klinik olarak dışlanmalıdır. Glukokortikoide hızlı yanıt kriterlerde yer almaz. Dasgupta B ve ark., Ann Rheum Dis 2012.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi
          id="onkosul"
          baslik="Ön koşul — yaş ≥ 50, iki taraflı omuz ağrısı ve anormal CRP ve/veya ESR"
          secenekler={EH}
          secili={onkosul}
          onSec={setOnkosul}
          rozetGizle
        />
        <SecimMaddesi id="us" baslik="Ultrason değerlendirmesi" secenekler={US} secili={us} onSec={setUs} rozetGizle />
      </div>
      {onkosul === 1 && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Ön koşul karşılanmıyor — kriterler uygulanmaz; puan hesaplanmadı.
        </div>
      )}
      <PuanliKriterler gruplar={KLINIK} secili={secili} onDegistir={degistir} />
      {usVar && <PuanliKriterler gruplar={ULTRASON} secili={secili} onDegistir={degistir} />}
      <SkorPaneli
        skor={skor}
        payda={usVar ? 8 : 6}
        bantlar={bantlar}
        aktif={bant}
        eksikMetni={onkosul === 1 ? "Ön koşul karşılanmıyor" : "Ön koşulu ve ultrason sorusunu yanıtlayın"}
      />
    </OlcekKabugu>
  );
}
