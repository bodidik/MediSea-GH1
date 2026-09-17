"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import PuanliKriterler, { kriterPuani, kumeDegistir, type KriterGrubu } from "@/app/tools/components/PuanliKriterler";

/**
 * ACR/EULAR 2013 sistemik skleroz sınıflama kriterleri (van den Hoogen ve ark., Arthritis Rheum 2013). ≥ 9 SSc.
 *
 * "Her iki elde MKF eklemlerinin proksimaline uzanan parmak deri kalınlaşması" TEK BAŞINA yeterli (9 puan).
 * Parmak derisi ve parmak ucu alanlarında EN YÜKSEK madde sayılır; PAH/İAH ve otoantikor alanlarının tavanı
 * maddelerin çokluğundan bağımsız olarak tek madde puanıdır (hepsi "enYuksek").
 * Deri kalınlaşması MKF'yi atlayıp parmaklarda yoksa ya da tabloyu daha iyi açıklayan bir hastalık varsa uygulanmaz.
 */
const GRUPLAR: ReadonlyArray<KriterGrubu> = [
  { baslik: "Yeterli kriter", kural: "enYuksek", maddeler: [{ id: "proksimal", metin: "Her iki elde MKF eklemlerinin proksimaline uzanan parmak deri kalınlaşması", puan: 9 }] },
  {
    baslik: "Parmak deri kalınlaşması", kural: "enYuksek", maddeler: [
      { id: "sisParmak", metin: "Şiş parmaklar (puffy fingers)", puan: 2 },
      { id: "sklerodaktili", metin: "Sklerodaktili (MKF distalinde, PIF'e kadar)", puan: 4 },
    ],
  },
  {
    baslik: "Parmak ucu lezyonları", kural: "enYuksek", maddeler: [
      { id: "ulser", metin: "Parmak ucu ülserleri", puan: 2 },
      { id: "skar", metin: "Parmak ucunda çukur skarlar (pitting scars)", puan: 3 },
    ],
  },
  { baslik: "Telenjiektazi", kural: "enYuksek", maddeler: [{ id: "telenjiektazi", metin: "Telenjiektaziler", puan: 2 }] },
  { baslik: "Tırnak yatağı kapilleroskopisi", kural: "enYuksek", maddeler: [{ id: "kapiller", metin: "Anormal tırnak yatağı kapillerleri", puan: 2 }] },
  {
    baslik: "Akciğer", kural: "enYuksek", maddeler: [
      { id: "pah", metin: "Pulmoner arteriyel hipertansiyon", puan: 2 },
      { id: "iah", metin: "İnterstisyel akciğer hastalığı", puan: 2 },
    ],
  },
  { baslik: "Raynaud fenomeni", kural: "enYuksek", maddeler: [{ id: "raynaud", metin: "Raynaud fenomeni", puan: 3 }] },
  {
    baslik: "SSc ile ilişkili otoantikorlar", kural: "enYuksek", maddeler: [
      { id: "aca", metin: "Antisentromer", puan: 3 },
      { id: "topo", metin: "Anti-topoizomeraz I (anti-Scl-70)", puan: 3 },
      { id: "rnap", metin: "Anti-RNA polimeraz III", puan: 3 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "< 9", etiket: "Sınıflanmıyor", alt: "ACR/EULAR 2013 SSc sınıflama kriterleri karşılanmıyor.", renk: "slate" },
  { aralik: "≥ 9", etiket: "Sistemik skleroz", alt: "ACR/EULAR 2013 SSc sınıflama kriterleri karşılanıyor.", renk: "rose" },
];

export default function Ssc2013Page() {
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const [basladi, setBasladi] = React.useState(false);
  const { toplam } = kriterPuani(GRUPLAR, secili);
  const skor = basladi ? toplam : null;
  const bant = skor === null ? null : skor >= 9 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="ssc-2013"
      ikon="✋"
      baslik="ACR/EULAR 2013 Sistemik Skleroz"
      altBaslik="SSc Sınıflama Kriterleri · ≥ 9 Puan"
      paylasim={{ ssc: skor }}
      not={
        <p>
          Kriterler, parmaklarda deri kalınlaşması olmayan ya da tablonun sklerodermayı taklit eden bir hastalıkla (nefrojenik sistemik fibroz, jeneralize
          morfea, eozinofilik fasiit, skleredema, skleromiksödem, porfiri, liken skleroz, GVHD, diyabetik şeyroartropati) daha iyi açıklandığı hastaya
          uygulanmaz. van den Hoogen F ve ark., Arthritis Rheum 2013.
        </p>
      }
    >
      <PuanliKriterler
        gruplar={GRUPLAR}
        secili={secili}
        onDegistir={(id) => {
          setBasladi(true);
          setSecili((s) => kumeDegistir(s, id));
        }}
      />
      <button
        type="button"
        onClick={() => { setBasladi(true); setSecili(new Set()); }}
        className="w-full min-h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-[12px] font-black text-blue-900 hover:border-blue-300"
      >
        Hiçbir kriter yok (0 puan)
      </button>
      <SkorPaneli skor={skor} bantlar={BANTLAR} aktif={bant} eksikMetni="Var olan kriterleri işaretleyin" />
    </OlcekKabugu>
  );
}
