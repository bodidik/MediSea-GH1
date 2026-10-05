"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/**
 * SPICT — Destekleyici ve Palyatif Bakım Göstergeleri Aracı (SPICT™,
 * Edinburgh Üniversitesi; Highet ve ark., BMJ Support Palliat Care 2014;
 * güncel sürüm SPICT-2022). Bir PUAN değil, tarama listesidir: genel
 * göstergeler ile hastalığa özgü klinik göstergeler aranır. Kılavuz:
 * "iki ya da daha fazla genel gösterge VE/VEYA ilerlemiş hastalığın en az bir
 * klinik göstergesi" → destekleyici ve palyatif bakım ihtiyacını değerlendir,
 * bakım planlamasını konuş.
 *
 * Puan rozeti bilerek YOK: SPICT maddeleri ağırlıklandırmaz; "toplam" bir
 * sayı göstermek kesinlik izlenimi verirdi.
 */
const GENEL: ReadonlyArray<{ id: string; metin: string }> = [
  { id: "yatis", metin: "Planlanmamış hastane yatış(lar)ı" },
  { id: "performans", metin: "Performans durumu kötü ya da kötüleşiyor; düzelme sınırlı (günün yarısından fazlası yatakta/koltukta)" },
  { id: "bagimlilik", metin: "Artan fiziksel ve/veya zihinsel sağlık sorunları nedeniyle bakım için başkalarına bağımlı" },
  { id: "bakimveren", metin: "Bakım veren kişinin daha fazla yardıma ve desteğe ihtiyacı var" },
  { id: "kilo", metin: "Son 3–6 ayda belirgin kilo kaybı ve/veya düşük vücut kitle indeksi" },
  { id: "semptom", metin: "Altta yatan hastalığın en uygun tedavisine rağmen süren semptomlar" },
  { id: "istek", metin: "Hasta (ya da ailesi) palyatif bakım istiyor; tedaviyi azaltmayı, durdurmayı ya da yaşam kalitesine odaklanmayı seçiyor" },
];

const KLINIK: ReadonlyArray<{ id: string; grup: string; metin: string }> = [
  { id: "kanser", grup: "Kanser", metin: "İlerleyici metastatik kanserle fonksiyonel yetenekte azalma ya da tedaviye yanıt alınamaması / tedaviyi tolere edememe" },
  { id: "demans", grup: "Demans / kırılganlık", metin: "Yardımsız giyinme, yürüme, yeme yapamama; yemek ve içmeyi azaltma, yutma güçlüğü; idrar ve gaita inkontinansı; düşmeler" },
  { id: "norolojik", grup: "Nörolojik hastalık", metin: "İlerleyici fiziksel ve/veya bilişsel işlev kaybı; konuşma güçlüğü, yutma güçlüğüyle tekrarlayan aspirasyon pnömonisi, solunum yetersizliği" },
  { id: "kalp", grup: "Kalp / damar hastalığı", metin: "Dinlenmede ya da minimal eforda dispne/göğüs ağrısıyla kalp yetersizliği ya da yaygın, tedavi edilemeyen koroner hastalık; ağır, ameliyat edilemeyen periferik damar hastalığı" },
  { id: "solunum", grup: "Solunum hastalığı", metin: "Hastalık stabilken dinlenmede ya da minimal eforda dispneyle ağır kronik akciğer hastalığı; uzun süreli oksijen ya da ventilasyon gereksinimi" },
  { id: "bobrek", grup: "Böbrek hastalığı", metin: "Sağlığı kötüleşen evre 4–5 KBH; diyalizi durdurma ya da diyalize girmeme tercihi; böbrek yetersizliğinin başka hastalığı/tedaviyi karmaşıklaştırması" },
  { id: "karaciger", grup: "Karaciğer hastalığı", metin: "Son bir yılda komplikasyonlu ilerlemiş siroz (dirençli asit, hepatik ensefalopati, hepatorenal sendrom, bakteriyel peritonit, tekrarlayan varis kanaması); nakil uygun değil" },
  { id: "diger", grup: "Diğer durumlar", metin: "Geri dönüşsüz başka bir hastalık ya da komplikasyon nedeniyle kötüleşen ve ölüm riski taşıyan durum; mevcut tedavinin yarar sağlamayacağı" },
];

function Kutu({ id, etiket, alt, secili, onDegistir }: { id: string; etiket: string; alt?: string; secili: boolean; onDegistir: () => void }) {
  return (
    <label htmlFor={`spict-${id}`} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer min-h-[44px] ${secili ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <input id={`spict-${id}`} type="checkbox" checked={secili} onChange={onDegistir} className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800" />
      <span className="min-w-0">
        {alt && <span className="block text-[11px] font-black text-blue-900">{alt}</span>}
        <span className="block text-[12px] text-slate-700 leading-snug">{etiket}</span>
      </span>
    </label>
  );
}

export default function SpictPage() {
  const [secili, setSecili] = React.useState<Set<string>>(new Set());
  const degistir = (id: string) =>
    setSecili((s) => {
      const y = new Set(s);
      if (y.has(id)) y.delete(id);
      else y.add(id);
      return y;
    });

  const genel = GENEL.filter((g) => secili.has(g.id)).length;
  const klinik = KLINIK.filter((k) => secili.has(k.id)).length;
  const hicbiri = genel === 0 && klinik === 0;
  // Kılavuz ölçütü: ≥2 genel gösterge VE/VEYA ≥1 klinik gösterge.
  const pozitif = genel >= 2 || klinik >= 1;
  const sonuc = hicbiri
    ? null
    : pozitif
      ? "Palyatif bakım ihtiyacı değerlendirmesi önerilir"
      : "SPICT ölçütü karşılanmadı";

  return (
    <OlcekKabugu
      slug="spict"
      ikon="🧭"
      baslik="SPICT"
      altBaslik="Destekleyici ve Palyatif Bakım Göstergeleri · Tarama Listesi"
      paylasim={{ secili: [...secili].sort().join(",") || null }}
      not={
        <>
          <p>
            SPICT bir prognoz skoru değildir; sağlığı kötüleşen ve ölüm riski taşıyan kişileri, destekleyici ve palyatif bakım
            ihtiyacı ile ileriye dönük bakım planlaması açısından tanımaya yarar. Ölçüt: iki ya da daha fazla genel gösterge
            ve/veya ilerlemiş hastalığın en az bir klinik göstergesi.
          </p>
          <p>
            Maddeler SPICT™'nin Türkçe özetidir; ayrıntılı tam metin için www.spict.org.uk. Highet G ve ark., BMJ Support Palliat
            Care 2014.
          </p>
        </>
      }
    >
      <section className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-3" aria-labelledby="spict-genel">
        <h2 id="spict-genel" className="text-[12px] font-black text-blue-900 uppercase tracking-widest" style={{ marginTop: 0, fontFamily: "inherit" }}>
          Genel göstergeler <span className="text-slate-500 normal-case tracking-normal">({genel} işaretli)</span>
        </h2>
        {GENEL.map((g) => (
          <Kutu key={g.id} id={g.id} etiket={g.metin} secili={secili.has(g.id)} onDegistir={() => degistir(g.id)} />
        ))}
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-3" aria-labelledby="spict-klinik">
        <h2 id="spict-klinik" className="text-[12px] font-black text-blue-900 uppercase tracking-widest" style={{ marginTop: 0, fontFamily: "inherit" }}>
          İlerlemiş hastalığın klinik göstergeleri <span className="text-slate-500 normal-case tracking-normal">({klinik} işaretli)</span>
        </h2>
        {KLINIK.map((k) => (
          <Kutu key={k.id} id={k.id} alt={k.grup} etiket={k.metin} secili={secili.has(k.id)} onDegistir={() => degistir(k.id)} />
        ))}
      </section>

      <SonucDuyuru metin={sonuc} />

      <div className={`rounded-[2rem] p-6 border-2 border-dashed ${hicbiri ? "border-slate-200 bg-slate-50" : pozitif ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
        <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest block mb-1">SONUÇ</span>
        {hicbiri ? (
          <p className="text-sm text-slate-700">Henüz gösterge işaretlenmedi.</p>
        ) : (
          <>
            <p className={`text-xl font-black ${pozitif ? "text-amber-800" : "text-emerald-800"}`}>{sonuc}</p>
            <p className="text-[12px] text-slate-700 mt-2">
              {genel} genel · {klinik} klinik gösterge.{" "}
              {pozitif
                ? "Mevcut bakımı ve ilacı gözden geçirin, hasta ve ailesiyle bakım hedeflerini ve ileriye dönük bakım planını konuşun, gerekiyorsa palyatif bakıma danışın."
                : "Ölçüt için 2 genel ya da 1 klinik gösterge gerekir; durum değiştiğinde yeniden değerlendirin."}
            </p>
          </>
        )}
      </div>
    </OlcekKabugu>
  );
}
