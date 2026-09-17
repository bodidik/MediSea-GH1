"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { kriterPuani, kumeDegistir, type KriterGrubu } from "@/app/tools/components/PuanliKriterler";

/**
 * ACR/EULAR 2022 ANCA ilişkili vaskülit sınıflama kriterleri — GPA (Robson), MPA (Suppiah), EGPA (Grayson);
 * Ann Rheum Dis 2022.
 *
 * Üç set AYNI bulgulardan ayrı ayrı puanlanır; bulgu bir kez işaretlenir, her setin kendi ağırlığıyla
 * (negatif puanlar dahil) sayılır. Ön koşul: küçük/orta damar vasküliti tanısı ve taklitçilerin dışlanması.
 * Birden fazla set eşiği geçerse araç hepsini gösterir — hangisinin seçileceği klinik karardır.
 */
type Bulgu = { id: string; metin: string };
const BULGULAR: ReadonlyArray<Bulgu> = [
  { id: "burun", metin: "Burun tutulumu: kanlı akıntı, ülser, kabuklanma, tıkanıklık, septum defekti/perforasyonu" },
  { id: "kikirdak", metin: "Kıkırdak tutulumu (kulak ya da burun kıkırdağında inflamasyon, ses kısıklığı/stridor, endobronşiyal tutulum, semer burun)" },
  { id: "isitme", metin: "İletim ya da sensörinöral işitme kaybı" },
  { id: "obstruktif", metin: "Obstrüktif hava yolu hastalığı (astım)" },
  { id: "polip", metin: "Nazal polip" },
  { id: "mononorit", metin: "Mononöritis multipleks" },
  { id: "cAnca", metin: "cANCA ya da anti-PR3 pozitif" },
  { id: "pAnca", metin: "pANCA ya da anti-MPO pozitif" },
  { id: "eozinofil", metin: "Eozinofil ≥ 1 × 10⁹/L" },
  { id: "nodul", metin: "Göğüs görüntülemesinde nodül, kitle ya da kavitasyon" },
  { id: "fibroz", metin: "Göğüs görüntülemesinde fibroz ya da interstisyel akciğer hastalığı" },
  { id: "sinus", metin: "Görüntülemede nazal/paranazal sinüzit, konsolidasyon, efüzyon ya da mastoidit" },
  { id: "granulom", metin: "Biyopside granülom, ekstravasküler granülomatöz inflamasyon ya da dev hücre" },
  { id: "eozinofilikInf", metin: "Biyopside ekstravasküler eozinofil baskın inflamasyon" },
  { id: "pauciGN", metin: "Biyopside pauci-immün glomerülonefrit" },
  { id: "hematuri", metin: "Hematüri" },
];

const SETLER: ReadonlyArray<{ ad: string; esik: number; puan: Record<string, number> }> = [
  {
    ad: "Granülomatöz polianjiit (GPA)", esik: 5,
    puan: { burun: 3, kikirdak: 2, isitme: 1, cAnca: 5, nodul: 2, granulom: 2, sinus: 1, pauciGN: 1, pAnca: -1, eozinofil: -4 },
  },
  {
    ad: "Mikroskobik polianjiit (MPA)", esik: 5,
    puan: { pAnca: 6, fibroz: 3, pauciGN: 3, cAnca: -1, eozinofil: -4, burun: -3 },
  },
  {
    ad: "Eozinofilik granülomatöz polianjiit (EGPA)", esik: 6,
    puan: { obstruktif: 3, polip: 3, mononorit: 1, eozinofil: 5, eozinofilikInf: 2, cAnca: -3, hematuri: -1 },
  },
];

function setGrubu(puan: Record<string, number>): KriterGrubu[] {
  return [{ baslik: "", kural: "toplam", maddeler: BULGULAR.filter((b) => b.id in puan).map((b) => ({ ...b, puan: puan[b.id] })) }];
}

export default function AncaVaskulitPage() {
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const [onkosul, setOnkosul] = React.useState(false);

  const sonuclar = SETLER.map((s) => {
    const toplam = kriterPuani(setGrubu(s.puan), secili).toplam;
    return { ...s, toplam, karsilaniyor: toplam >= s.esik };
  });
  const karsilanan = sonuclar.filter((s) => s.karsilaniyor);
  const hazir = onkosul && secili.size > 0;
  const duyuru = !hazir ? null : karsilanan.length ? `Karşılanan: ${karsilanan.map((s) => s.ad).join(", ")}` : "Üç setin hiçbiri karşılanmıyor";

  return (
    <OlcekKabugu
      slug="anca-vaskulit"
      ikon="🩸"
      baslik="ACR/EULAR 2022 ANCA Vaskülitleri"
      altBaslik="GPA ≥ 5 · MPA ≥ 5 · EGPA ≥ 6 · Aynı Bulgulardan Üç Set"
      paylasim={{ gpa: sonuclar[0].toplam, mpa: sonuclar[1].toplam, egpa: sonuclar[2].toplam }}
      not={
        <p>
          Kriterler, küçük ya da orta damar vasküliti tanısı konmuş hastada alt tipi sınıflamak içindir; ANCA pozitifliği ya da vaskülit şüphesi olan hastada
          tanı aracı değildir. Taklitçiler (enfeksiyon, malignite, ilaç ilişkili ANCA vasküliti, anti-GBM hastalığı) dışlanmalıdır. Robson JC, Suppiah R,
          Grayson PC ve ark., Ann Rheum Dis 2022.
        </p>
      }
    >
      <label className="flex items-start gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer min-h-[44px]">
        <input type="checkbox" checked={onkosul} onChange={() => setOnkosul((v) => !v)} className="w-4 h-4 mt-0.5 accent-blue-900 shrink-0" />
        <span className="text-[12px] font-bold text-blue-950 leading-snug">
          <span className="font-black text-blue-900">Ön koşul: </span>küçük ya da orta damar vasküliti tanısı konmuş ve vaskülit taklitçileri dışlanmış
        </span>
      </label>

      <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <legend className="px-2 text-[12px] font-black text-blue-900">Var olan bulguları işaretleyin</legend>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {BULGULAR.map((m) => {
            const aktif = secili.has(m.id);
            const puanlar = SETLER.map((s) => (m.id in s.puan ? s.puan[m.id] : null));
            return (
              <label
                key={m.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                  ${aktif ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
              >
                <span className="flex items-center gap-3 flex-1 min-w-0">
                  <input type="checkbox" checked={aktif} onChange={() => setSecili((s) => kumeDegistir(s, m.id))} className="w-4 h-4 accent-blue-900 shrink-0" />
                  <span className="text-[12px] font-bold text-blue-950 leading-snug">{m.metin}</span>
                </span>
                <span className="flex gap-1 shrink-0 pl-7 sm:pl-0">
                  {puanlar.map((p, i) => (
                    <span
                      key={i}
                      className={`min-w-[3.25rem] h-7 px-1 rounded-lg flex items-center justify-center text-[10px] font-black
                        ${p === null ? "bg-white border border-slate-200 text-slate-500" : p < 0 ? "bg-rose-100 text-rose-900" : "bg-amber-100 text-amber-900"}`}
                    >
                      {["GPA", "MPA", "EGPA"][i]} {p === null ? "—" : p > 0 ? `+${p}` : p}
                    </span>
                  ))}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <SonucDuyuru metin={duyuru} />
      {!onkosul ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Önce ön koşulu işaretleyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sonuclar.map((s) => (
            <div key={s.ad} className={`rounded-2xl border-2 p-4 ${s.karsilaniyor ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-800"}`}>
              <p className="text-[11px] font-black uppercase tracking-wide leading-snug">{s.ad}</p>
              <p className="text-3xl font-black mt-1">{s.toplam}</p>
              <p className="text-[12px] font-black">{s.karsilaniyor ? `Karşılanıyor (≥ ${s.esik})` : `Karşılanmıyor (≥ ${s.esik} gerekli)`}</p>
            </div>
          ))}
        </div>
      )}
      {onkosul && karsilanan.length > 1 && (
        <p role="alert" className="text-[12px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Birden fazla setin eşiği geçildi — alt tip klinik, histolojik ve serolojik bütünlükle belirlenmelidir.
        </p>
      )}
    </OlcekKabugu>
  );
}
