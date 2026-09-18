"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import PuanliKriterler, { kriterPuani, kumeDegistir, type KriterGrubu } from "@/app/tools/components/PuanliKriterler";

/**
 * ACR/EULAR 2023 antifosfolipid sendromu sınıflama kriterleri (Barbhaiya ve ark., Ann Rheum Dis 2023).
 *
 * Giriş kriteri: ≥ 1 klinik kriter + 3 yıl içinde pozitif aPL testi (LA ya da orta/yüksek titre aCL/aβ2GP1).
 * Her alanda EN YÜKSEK puanlı madde sayılır. Sınıflama: klinik alanlardan ≥ 3 VE laboratuvar alanlarından ≥ 3.
 * Toplam puan tek başına ölçüt DEĞİL — 2 klinik + 7 laboratuvar = 9 olan hasta APS sınıflanmaz; araç iki
 * toplamı ayrı gösteriyor ve ikisini ayrı denetliyor.
 *
 * "Yüksek riskli VTE/KVH profili" maddeleri, aynı olayı başka bir nedenle açıklayabilecek durumlar için
 * DÜŞÜK puan verir — kullanıcı bu profilin tanımını notta görür.
 */
const KLINIK: ReadonlyArray<KriterGrubu> = [
  {
    baslik: "D1 — Makrovasküler: venöz tromboembolizm", kural: "enYuksek", maddeler: [
      { id: "vteYuksek", metin: "VTE, yüksek riskli VTE profiliyle birlikte", puan: 1 },
      { id: "vteDusuk", metin: "VTE, yüksek riskli VTE profili olmadan", puan: 3 },
    ],
  },
  {
    baslik: "D2 — Makrovasküler: arteriyel tromboz", kural: "enYuksek", maddeler: [
      { id: "ateYuksek", metin: "Arteriyel tromboz, yüksek riskli KVH profiliyle birlikte", puan: 2 },
      { id: "ateDusuk", metin: "Arteriyel tromboz, yüksek riskli KVH profili olmadan", puan: 4 },
    ],
  },
  {
    baslik: "D3 — Mikrovasküler", kural: "enYuksek", maddeler: [
      { id: "mikroSupheli", metin: "Şüpheli: livedo racemosa, livedoid vaskülopati lezyonları, akut/kronik aPL nefropatisi ya da pulmoner hemoraji (klinik/laboratuvar)", puan: 2 },
      { id: "mikroKesin", metin: "Kesinleşmiş: livedoid vaskülopati ya da aPL nefropatisi (patoloji), pulmoner hemoraji (BAL/patoloji), miyokard hastalığı ya da adrenal hemoraji (görüntüleme/patoloji)", puan: 5 },
    ],
  },
  {
    baslik: "D4 — Obstetrik", kural: "enYuksek", maddeler: [
      { id: "obs3kayip", metin: "≥ 3 ardışık pre-fetal (< 10 hafta) ve/veya erken fetal (10+0 – 15+6 hafta) kayıp", puan: 1 },
      { id: "obsFetal", metin: "Ağır preeklampsi ya da ağır plasental yetmezlik olmadan fetal ölüm (16+0 – 33+6 hafta)", puan: 1 },
      { id: "obsTekil", metin: "Ağır preeklampsi (< 34 hafta) YA DA ağır bulgulu plasental yetmezlik (< 34 hafta), fetal ölümle ya da ölümsüz", puan: 3 },
      { id: "obsIkisi", metin: "Ağır preeklampsi VE ağır bulgulu plasental yetmezlik birlikte (< 34 hafta)", puan: 4 },
    ],
  },
  {
    baslik: "D5 — Kalp kapağı", kural: "enYuksek", maddeler: [
      { id: "kapakKalin", metin: "Kapak kalınlaşması", puan: 2 },
      { id: "kapakVej", metin: "Vejetasyon", puan: 4 },
    ],
  },
  { baslik: "D6 — Hematoloji", kural: "enYuksek", maddeler: [{ id: "trombositopeni", metin: "Trombositopeni (20–130 × 10⁹/L)", puan: 2 }] },
];

const LAB: ReadonlyArray<KriterGrubu> = [
  {
    baslik: "D7 — Lupus antikoagülanı (pıhtılaşma testi)", kural: "enYuksek", maddeler: [
      { id: "laTek", metin: "Pozitif LA — tek kez", puan: 1 },
      { id: "laKalici", metin: "Kalıcı pozitif LA (≥ 12 hafta arayla iki kez)", puan: 5 },
    ],
  },
  {
    baslik: "D8 — aCL / anti-β2GP1 (katı faz ELISA, kalıcı)", kural: "enYuksek", maddeler: [
      { id: "igm", metin: "Orta ya da yüksek pozitif IgM (aCL ve/veya aβ2GP1)", puan: 1 },
      { id: "iggOrta", metin: "Orta pozitif IgG (aCL ve/veya aβ2GP1)", puan: 4 },
      { id: "iggYuksek", metin: "Yüksek pozitif IgG (aCL YA DA aβ2GP1)", puan: 5 },
      { id: "iggIkisi", metin: "Yüksek pozitif IgG aCL VE aβ2GP1 birlikte", puan: 7 },
    ],
  },
];

export default function Aps2023Page() {
  const [giris, setGiris] = React.useState(false);
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const degistir = (id: string) => setSecili((s) => kumeDegistir(s, id));

  const klinik = kriterPuani(KLINIK, secili).toplam;
  const lab = kriterPuani(LAB, secili).toplam;
  const klinikTamam = klinik >= 3;
  const labTamam = lab >= 3;
  const sonuc = !giris ? null : klinikTamam && labTamam;

  return (
    <OlcekKabugu
      slug="aps-2023"
      ikon="🧬"
      baslik="ACR/EULAR 2023 APS Kriterleri"
      altBaslik="Antifosfolipid Sendromu Sınıflaması · Klinik ≥ 3 VE Laboratuvar ≥ 3"
      paylasim={{ klinik, lab }}
      not={
        <>
          <p>
            <strong>Yüksek riskli VTE profili:</strong> son 3 ayda majör geçici risk etkeni (hastaneye yatış, majör travma, cerrahi) ya da aktif kanser, uzun
            süreli immobilizasyon, östrojen/gebelik gibi birden fazla küçük risk etkeni. <strong>Yüksek riskli KVH profili:</strong> yüksek risk etkeni
            (ör. tedavili ağır hipertansiyon, diyabet komplikasyonları, KBH evre ≥ 4, ağır hiperlipidemi) ya da birden fazla orta risk etkeni.
            Ayrıntılı tanımlar ve eşzamanlılık kuralları (aPL testinin klinik olaydan önceki/sonraki 3 yıl) özgün makalededir.
          </p>
          <p>
            Bir kriter, APS'den daha olası bir nedenle açıklanıyorsa sayılmaz. Sınıflama kriterleridir, tanı kriteri değildir. Titre eşikleri laboratuvara
            göre belirlenir (orta 40–79, yüksek ≥ 80 birim). Barbhaiya M ve ark., Ann Rheum Dis 2023.
          </p>
        </>
      }
    >
      <label className="flex items-start gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer min-h-[44px]">
        <input type="checkbox" checked={giris} onChange={() => setGiris((v) => !v)} className="w-4 h-4 mt-0.5 accent-blue-900 shrink-0" />
        <span className="text-[12px] font-bold text-blue-950 leading-snug">
          <span className="font-black text-blue-900">Giriş kriteri: </span>
          en az bir klinik kriter ve bunun 3 yıl öncesi/sonrası içinde pozitif aPL testi (LA, ya da orta/yüksek titre aCL ya da anti-β2GP1 IgG/IgM)
        </span>
      </label>

      <section aria-labelledby="aps-klinik" className="space-y-2">
        <h2 id="aps-klinik" className="px-1 text-sm font-black text-blue-900 uppercase tracking-widest">Klinik alanlar · {klinik} puan</h2>
        <PuanliKriterler gruplar={KLINIK} secili={secili} onDegistir={degistir} />
      </section>
      <section aria-labelledby="aps-lab" className="space-y-2">
        <h2 id="aps-lab" className="px-1 text-sm font-black text-blue-900 uppercase tracking-widest">Laboratuvar alanları · {lab} puan</h2>
        <PuanliKriterler gruplar={LAB} secili={secili} onDegistir={degistir} />
      </section>

      <SonucDuyuru metin={sonuc === null ? null : sonuc ? "APS sınıflama kriterleri karşılanıyor" : "APS sınıflama kriterleri karşılanmıyor"} />
      {sonuc === null ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Önce giriş kriterini işaretleyin</p>
        </div>
      ) : (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${sonuc ? "border-rose-200 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-800"}`}>
          <p className="text-xl font-black">{sonuc ? "Antifosfolipid sendromu" : "Sınıflanmıyor"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest">Klinik</p>
              <p className="text-3xl font-black">{klinik}</p>
              <p className="text-[11px] font-bold">{klinikTamam ? "≥ 3 — tamam" : "≥ 3 gerekli"}</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest">Laboratuvar</p>
              <p className="text-3xl font-black">{lab}</p>
              <p className="text-[11px] font-bold">{labTamam ? "≥ 3 — tamam" : "≥ 3 gerekli"}</p>
            </div>
          </div>
          {!sonuc && klinik + lab >= 6 && (
            <p className="text-[12px] font-bold">Toplam {klinik + lab} puan ama iki alanın her biri ayrı ayrı ≥ 3 olmalı.</p>
          )}
        </div>
      )}
    </OlcekKabugu>
  );
}
