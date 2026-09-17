"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import PuanliKriterler, { kriterPuani, kumeDegistir, type KriterGrubu } from "@/app/tools/components/PuanliKriterler";

/**
 * ACR/EULAR 2022 dev hücreli arterit sınıflama kriterleri (Ponte ve ark., Ann Rheum Dis 2022).
 * Ön koşullar: tanıda yaş ≥ 50 ve orta–büyük damar vasküliti tanısı konmuş olması (taklitçiler dışlanmış). ≥ 6 GCA.
 */
const GRUPLAR: ReadonlyArray<KriterGrubu> = [
  {
    baslik: "Klinik", kural: "toplam", maddeler: [
      { id: "tutukluk", metin: "Omuz ya da boyunda sabah tutukluluğu", puan: 2 },
      { id: "gorme", metin: "Ani görme kaybı", puan: 3 },
      { id: "klodikasyon", metin: "Çene ya da dil klodikasyonu", puan: 2 },
      { id: "basAgrisi", metin: "Yeni temporal baş ağrısı", puan: 2 },
      { id: "sacliDeri", metin: "Saçlı deri hassasiyeti", puan: 2 },
      { id: "muayene", metin: "Temporal arter muayenesinde anormallik (nabız azalması, hassasiyet, nodülarite)", puan: 2 },
    ],
  },
  {
    baslik: "Laboratuvar, görüntüleme ve biyopsi", kural: "toplam", maddeler: [
      { id: "akut", metin: "En yüksek ESR ≥ 50 mm/saat ya da en yüksek CRP ≥ 10 mg/L", puan: 3 },
      { id: "biyopsi", metin: "Temporal arter biyopsisi pozitif ya da ultrasonda halo işareti", puan: 5 },
      { id: "aksiller", metin: "İki taraflı aksiller arter tutulumu (anjiyografi, BT/MR anjiyografi, US ya da PET-BT)", puan: 2 },
      { id: "pet", metin: "FDG-PET'te aort boyunca aktivite", puan: 2 },
    ],
  },
];

const ONKOSUL: Secenek[] = [{ label: "Evet", pts: 0 }, { label: "Hayır", pts: 0 }];

const BANTLAR: Bant[] = [
  { aralik: "< 6", etiket: "Sınıflanmıyor", alt: "ACR/EULAR 2022 GCA sınıflama kriterleri karşılanmıyor.", renk: "slate" },
  { aralik: "≥ 6", etiket: "Dev hücreli arterit", alt: "ACR/EULAR 2022 GCA sınıflama kriterleri karşılanıyor.", renk: "rose" },
];

export default function DevHucreliArteritPage() {
  const [yas, setYas] = React.useState<number | null>(null);
  const [vaskulit, setVaskulit] = React.useState<number | null>(null);
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const { toplam } = kriterPuani(GRUPLAR, secili);
  const uygun = yas === 0 && vaskulit === 0;
  const uygunDegil = yas === 1 || vaskulit === 1;
  const skor = uygun ? toplam : null;
  const bant = skor === null ? null : skor >= 6 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="dev-hucreli-arterit"
      ikon="👁️"
      baslik="ACR/EULAR 2022 Dev Hücreli Arterit"
      altBaslik="GCA Sınıflama Kriterleri · ≥ 6 Puan"
      paylasim={{ gca: skor }}
      not={
        <p>
          Kriterler vaskülit tanısı konmuş hastalarda GCA'yı diğer vaskülitlerden ayırmak içindir — GCA şüphesinde tanı ya da tedaviye başlama aracı değildir.
          Görme kaybı riski varsa biyopsi ya da görüntüleme beklenmeden yüksek doz glukokortikoid başlanır. Ponte C ve ark., Ann Rheum Dis 2022.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="yas" baslik="Ön koşul — tanıda yaş ≥ 50" secenekler={ONKOSUL} secili={yas} onSec={setYas} rozetGizle />
        <SecimMaddesi id="vaskulit" baslik="Ön koşul — orta ya da büyük damar vasküliti tanısı konmuş, taklitçiler dışlanmış" secenekler={ONKOSUL} secili={vaskulit} onSec={setVaskulit} rozetGizle />
      </div>
      {uygunDegil && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Ön koşul karşılanmıyor — kriterler uygulanmaz; puan hesaplanmadı.
        </div>
      )}
      <PuanliKriterler gruplar={GRUPLAR} secili={secili} onDegistir={(id) => setSecili((s) => kumeDegistir(s, id))} />
      <SkorPaneli skor={skor} bantlar={BANTLAR} aktif={bant} eksikMetni={uygunDegil ? "Ön koşul karşılanmıyor" : "Önce ön koşulları yanıtlayın"} />
    </OlcekKabugu>
  );
}
