"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";

/**
 * Yamaguchi kriterleri — erişkin başlangıçlı Still hastalığı (Yamaguchi ve ark., J Rheumatol 1992).
 * ≥ 5 kriter, en az 2'si MAJÖR ve dışlama kriterlerinin HİÇBİRİ yok.
 *
 * Dışlamalar işaretlenmediyse sonuç "karşılanıyor" DEĞİL "dışlamalar değerlendirilmedi" der — enfeksiyon,
 * malignite ve diğer romatizmal hastalıklar dışlanmadan Still sınıflaması yapmak kriterin kendisine aykırı.
 */
const MAJOR = [
  { id: "ates", metin: "Ateş ≥ 39 °C, ≥ 1 hafta süren" },
  { id: "artralji", metin: "Artralji ya da artrit, ≥ 2 hafta süren" },
  { id: "dokuntu", metin: "Tipik döküntü (ateşle birlikte, somon renkli, kaşıntısız makülopapüler)" },
  { id: "lokosit", metin: "Lökositoz ≥ 10 000/mm³ ve granülosit ≥ %80" },
] as const;
const MINOR = [
  { id: "bogaz", metin: "Boğaz ağrısı" },
  { id: "lap", metin: "Lenfadenopati" },
  { id: "hsm", metin: "Hepatomegali ya da splenomegali" },
  { id: "kcft", metin: "Anormal karaciğer testleri (transaminaz ya da LDH yüksekliği)" },
  { id: "seronegatif", metin: "RF ve ANA negatif" },
] as const;
const DISLAMA = [
  { id: "enfeksiyon", metin: "Enfeksiyonlar (özellikle sepsis, EBV/CMV gibi viral enfeksiyonlar) dışlandı" },
  { id: "malignite", metin: "Maligniteler (özellikle lenfoma) dışlandı" },
  { id: "romatizmal", metin: "Diğer romatizmal hastalıklar (özellikle vaskülitler) dışlandı" },
] as const;

export default function YamaguchiPage() {
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const degistir = (id: string) => setSecili((s) => kumeDegistir(s, id));

  const major = MAJOR.filter((m) => secili.has(m.id)).length;
  const minor = MINOR.filter((m) => secili.has(m.id)).length;
  const toplam = major + minor;
  const dislamalar = DISLAMA.filter((d) => secili.has(d.id)).length;
  const kriterSayisal = toplam >= 5 && major >= 2;
  const tamDislama = dislamalar === DISLAMA.length;

  const durum =
    secili.size === 0 ? null
      : !kriterSayisal ? { t: "Kriterler karşılanmıyor", a: `${toplam} kriter (${major} majör) — ≥ 5 kriter ve ≥ 2 majör gerekli.`, r: "border-slate-200 bg-slate-50 text-slate-800" }
      : !tamDislama ? { t: "Sayısal koşul karşılanıyor — dışlamalar eksik", a: `${toplam} kriter (${major} majör). Sınıflama için ${DISLAMA.length - dislamalar} dışlama kriteri daha değerlendirilmeli.`, r: "border-amber-200 bg-amber-50 text-amber-900" }
      : { t: "Erişkin başlangıçlı Still hastalığı", a: `${toplam} kriter (${major} majör), dışlamalar tamam — Yamaguchi kriterleri karşılanıyor.`, r: "border-rose-200 bg-rose-50 text-rose-900" };

  const liste = (baslik: string, maddeler: ReadonlyArray<{ id: string; metin: string }>, sayac: string) => (
    <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <legend className="px-2 text-[12px] font-black text-blue-900">{baslik} · {sayac}</legend>
      <div className="grid grid-cols-1 gap-2 mt-2">
        {maddeler.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
              ${secili.has(m.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
          >
            <input type="checkbox" checked={secili.has(m.id)} onChange={() => degistir(m.id)} className="w-4 h-4 accent-blue-900 shrink-0" />
            <span className="text-[12px] font-bold text-blue-950 leading-snug">{m.metin}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <OlcekKabugu
      slug="yamaguchi"
      ikon="🌡️"
      baslik="Yamaguchi Kriterleri"
      altBaslik="Erişkin Başlangıçlı Still Hastalığı · ≥ 5 Kriter, ≥ 2 Majör, Dışlamalar"
      paylasim={{ major, minor }}
      not={
        <p>
          En yüksek duyarlılıklı Still kriter setidir (~%96). Belirgin hiperferritinemi ve düşük glikozile ferritin (&lt; %20) kriterlerde yoktur ama tanıyı
          destekler (Fautrel kriterleri). Ağır hiperferritinemi, sitopeni ve fibrinojen düşüklüğünde makrofaj aktivasyon sendromu açısından HScore'a bakın.
          Yamaguchi M ve ark., J Rheumatol 1992.
        </p>
      }
    >
      {liste("Majör kriterler", MAJOR, `${major}/4`)}
      {liste("Minör kriterler", MINOR, `${minor}/5`)}
      {liste("Dışlama kriterleri — hepsi dışlanmış olmalı", DISLAMA, `${dislamalar}/3 dışlandı`)}

      <SonucDuyuru metin={durum ? durum.t : null} />
      {durum ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${durum.r}`}>
          <p className="text-xl font-black">{durum.t}</p>
          <p className="text-[12px] font-bold">{durum.a}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Var olan kriterleri işaretleyin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
