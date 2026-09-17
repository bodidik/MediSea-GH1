"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * FIB-4 = yaş × AST / (trombosit × √ALT) (Sterling ve ark., Hepatology 2006).
 *
 * Alt eşik YAŞA bağlı: ≥ 65 yaşta 1,30 yerine 2,0 (McPherson ve ark., Am J Gastroenterol 2017) —
 * aksi hâlde yaşlıların büyük kısmı sırf yaş yüzünden "belirsiz" grubuna düşer.
 * 35 yaş altında skor güvenilir değil; araç sayıyı basıyor ama bant vermiyor.
 * Bant ham değerle değil ekranda görünen 2 haneli değerle belirleniyor.
 */
const YAS_ALT = 18, YAS_UST = 110;
const ENZIM_UST = 10000;
const PLT_ALT = 1, PLT_UST = 2000;
const GUVENILIR_YAS = 35;

function bantlar(yasli: boolean): Bant[] {
  const alt = yasli ? "2,0" : "1,30";
  return [
    { aralik: `< ${alt}`, etiket: "İleri fibroz olası değil", alt: "İleri fibroz (F3–F4) dışlanabilir — birinci basamakta risk etkenleri yönetimi ve 1–3 yılda bir tekrar.", renk: "emerald" },
    { aralik: `${alt}–2,67`, etiket: "Belirsiz", alt: "İkinci basamak test: transient elastografi (FibroScan) ya da ELF.", renk: "amber" },
    { aralik: "> 2,67", etiket: "İleri fibroz olası", alt: "İleri fibroz riski yüksek — hepatoloji değerlendirmesi ve elastografi.", renk: "rose" },
  ];
}

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function Fib4Page() {
  const [yas, setYas] = React.useState("");
  const [ast, setAst] = React.useState("");
  const [alt, setAlt] = React.useState("");
  const [plt, setPlt] = React.useState("");

  const yasN = parseLocaleNumber(yas), astN = parseLocaleNumber(ast), altN = parseLocaleNumber(alt), pltN = parseLocaleNumber(plt);
  const yasOk = sayiGirildiMi(yas) && yasN >= YAS_ALT && yasN <= YAS_UST;
  const astOk = sayiGirildiMi(ast) && astN > 0 && astN <= ENZIM_UST;
  const altOk = sayiGirildiMi(alt) && altN > 0 && altN <= ENZIM_UST;
  const pltOk = sayiGirildiMi(plt) && pltN >= PLT_ALT && pltN <= PLT_UST;

  const eksik = [
    !yasOk && `yaş (${YAS_ALT}–${YAS_UST})`,
    !astOk && "AST (U/L)",
    !altOk && "ALT (U/L)",
    !pltOk && `trombosit (${PLT_ALT}–${PLT_UST} × 10⁹/L)`,
  ].filter(Boolean) as string[];

  const fib4 = eksik.length === 0 ? Math.round(((yasN * astN) / (pltN * Math.sqrt(altN))) * 100) / 100 : null;
  const yasli = yasOk && yasN >= 65;
  const genc = yasOk && yasN < GUVENILIR_YAS;
  const B = bantlar(yasli);
  const altEsik = yasli ? 2.0 : 1.3;
  const bant = fib4 === null || genc ? null : fib4 < altEsik ? B[0] : fib4 <= 2.67 ? B[1] : B[2];

  return (
    <OlcekKabugu
      slug="fib-4"
      ikon="🫘"
      baslik="FIB-4 İndeksi"
      altBaslik="Karaciğer Fibrozu Taraması · MASLD · Kronik Viral Hepatit"
      paylasim={{ fib4 }}
      not={
        <p>
          Metabolik disfonksiyonla ilişkili yağlı karaciğer hastalığında (MASLD) ilk basamak risk sınıflaması olarak önerilir (EASL-EASD-EASO 2024, AASLD 2023).
          Akut hepatit, belirgin transaminaz yükselmesi ya da trombositopeni yapan başka bir durum sonucu yanıltır. Sterling RK ve ark., Hepatology 2006;
          McPherson S ve ark., Am J Gastroenterol 2017.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Yaş (yıl)</span>
          <input type="text" inputMode="numeric" value={yas} onChange={(e) => setYas(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Trombosit (× 10⁹/L)</span>
          <input type="text" inputMode="numeric" value={plt} onChange={(e) => setPlt(e.target.value)} placeholder="ör. 220" className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">AST (U/L)</span>
          <input type="text" inputMode="numeric" value={ast} onChange={(e) => setAst(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">ALT (U/L)</span>
          <input type="text" inputMode="numeric" value={alt} onChange={(e) => setAlt(e.target.value)} className={girdi} />
        </label>
      </div>

      {fib4 !== null && genc && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          FIB-4 {String(fib4).replace(".", ",")} — {GUVENILIR_YAS} yaş altında skor doğrulanmamıştır ve fibrozu olduğundan düşük gösterir; bant verilmedi. Elastografi tercih edin.
        </div>
      )}

      <SkorPaneli
        skor={bant ? fib4 : null}
        skorBasligi="FIB-4"
        bantlar={B}
        aktif={bant}
        eksikMetni={fib4 !== null && genc ? `${GUVENILIR_YAS} yaş altında yorumlanmadı` : `Eksik: ${eksik.join(" · ")}`}
        ek={bant && yasli ? <p className="text-[11px] font-bold text-slate-700">≥ 65 yaş: alt eşik 2,0 kullanıldı.</p> : null}
      />
    </OlcekKabugu>
  );
}
