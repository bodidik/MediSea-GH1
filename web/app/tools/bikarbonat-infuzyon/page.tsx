"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Sodyum bikarbonat — açık hesabı ve infüzyon kurulumu.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU ARAÇ BİKARBONAT VERİLİP VERİLMEYECEĞİNE KARAR VERMEZ. Metabolik
 * asidozda bikarbonat endikasyonu tartışmalıdır ve asidozun SEBEBİNE
 * bağlıdır: laktik asidoz ve diyabetik ketoasidozda rutin kullanım
 * önerilmez, oysa salisilat zehirlenmesinde ya da ağır hiperkalemide
 * tedavinin kendisidir. Araç yalnızca karar verildikten SONRAKİ aritmetiği
 * yapar.
 *
 * DAĞILIM HACMİ SABİTİ TARTIŞMALIDIR ve bilerek görünür: bikarbonat
 * yaklaşık vücut ağırlığının %50'sine dağılır, ama ağır asidozda bu oran
 * yükselir (%60-80). Araç 0.5'i varsayılan alıyor ve kullanıcının
 * değiştirmesine izin veriyor — sabiti gizlemek, hesabı olduğundan kesin
 * gösterirdi.
 * ─────────────────────────────────────────────────────────────────────
 */

const yuvarla = (n: number, b = 0) => Math.round(n * 10 ** b) / 10 ** b;

/** %8.4 NaHCO₃ = 1 mEq/mL. Türkiye'de yaygın ampul 10 mL = 10 mEq. */
const AMPUL_MEQ = 10;
/** İzotonik bikarbonat: 1 L %5 dekstroz içine 150 mEq. */
const IZOTONIK_MEQ_L = 150;

const DAGILIM_SECENEKLERI = [
  { v: 0.5, ad: "0.5 — olağan" },
  { v: 0.6, ad: "0.6 — ağır asidoz" },
  { v: 0.8, ad: "0.8 — çok ağır" },
];

/**
 * MODÜL DÜZEYİNDE — sayfa fonksiyonunun içinde tanımlanırsa React her
 * render'da <input>u söküp yeniden takar ve kullanıcı her rakamdan sonra
 * odağı kaybeder (bu depoda ölçülmüş bir kusur).
 */
function SayiAlani({
  id, etiket, birim, deger, ayarla, ipucu,
}: {
  id: string; etiket: string; birim: string;
  deger: string; ayarla: (v: string) => void; ipucu?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2"
      >
        {etiket}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
          {birim}
        </span>
      </div>
    </div>
  );
}

export default function BikarbonatSayfasi() {
  const [kilo, setKilo] = React.useState("");
  const [olculen, setOlculen] = React.useState("");
  const [hedef, setHedef] = React.useState("15");
  const [dagilim, setDagilim] = React.useState(0.5);

  const kiloNum = parseLocaleNumber(kilo);
  const olculenNum = parseLocaleNumber(olculen);
  const hedefNum = parseLocaleNumber(hedef);

  const makul =
    kilo.trim() !== "" && kiloNum >= 1 && kiloNum <= 400 &&
    olculen.trim() !== "" && olculenNum >= 1 && olculenNum <= 60 &&
    hedef.trim() !== "" && hedefNum >= 1 && hedefNum <= 60;

  /** Hedef ölçülenin altındaysa açık yoktur; bunu sessizce eksi göstermeyiz. */
  const hedefDusuk = makul && hedefNum <= olculenNum;

  const acik = yuvarla(dagilim * kiloNum * (hedefNum - olculenNum), 0);
  const yarim = yuvarla(acik / 2, 0);
  const ampul = yuvarla(acik / AMPUL_MEQ, 1);
  const izotonikMl = yuvarla((acik / IZOTONIK_MEQ_L) * 1000, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="bikarbonat-infuzyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🫧</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Bikarbonat Açığı
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              NaHCO₃ dozu · ampul · izotonik infüzyon
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">⚠️</span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bikarbonat kararı asidozun SEBEBİNE bağlıdır.</strong> Laktik
            asidozda ve diyabetik ketoasidozda rutin kullanım önerilmez;
            salisilat zehirlenmesinde ve ağır hiperkalemide ise tedavinin
            kendisidir. Bu araç yalnızca doz aritmetiğini yapar.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <SayiAlani id="bik-kilo" etiket="Hasta ağırlığı" birim="kg"
            deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SayiAlani id="bik-olculen" etiket="Ölçülen HCO₃" birim="mEq/L"
              deger={olculen} ayarla={setOlculen} ipucu="ör. 8" />
            <SayiAlani id="bik-hedef" etiket="Hedef HCO₃" birim="mEq/L"
              deger={hedef} ayarla={setHedef} ipucu="ör. 15" />
          </div>

          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Dağılım hacmi katsayısı
            </span>
            <div className="flex flex-wrap gap-2">
              {DAGILIM_SECENEKLERI.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  aria-pressed={dagilim === d.v}
                  onClick={() => setDagilim(d.v)}
                  className={`px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all
                    ${dagilim === d.v
                      ? "bg-blue-900 border-blue-900 text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:border-blue-900/30"}`}
                >
                  {d.ad}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
              Bikarbonat yaklaşık vücut ağırlığının yarısına dağılır; ağır
              asidozda oran yükselir. Katsayı hesabın en belirsiz parçası,
              o yüzden gizlenmiyor.
            </p>
          </div>
        </div>

        {/* SONUÇ */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl">
          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Ağırlık, ölçülen ve hedef HCO₃ değerlerini girin.
            </p>
          ) : hedefDusuk ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Hedef HCO₃, ölçülenin üzerinde olmalı — bu değerlerle açık yok.
            </p>
          ) : (
            <>
              <div className="text-center">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
                  Toplam HCO₃ açığı
                </span>
                <div className="text-6xl font-black text-white mt-2">{acik}</div>
                <span className="text-[11px] font-bold text-blue-300">mEq</span>
                <p className="mt-3 text-[11px] text-blue-200">
                  {dagilim} × {yuvarla(kiloNum, 1)} kg × ({yuvarla(hedefNum, 1)} − {yuvarla(olculenNum, 1)})
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                    Önce yarısı
                  </span>
                  <div className="text-2xl font-black text-white mt-1">{yarim} mEq</div>
                  <p className="text-[10px] text-blue-300 mt-1">
                    Olağan yaklaşım: yarısı verilir, kan gazı tekrarlanır.
                  </p>
                </div>
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                    Ampul karşılığı
                  </span>
                  <div className="text-2xl font-black text-white mt-1">{ampul}</div>
                  <p className="text-[10px] text-blue-300 mt-1">
                    %8.4 NaHCO₃ · 10 mL = 10 mEq
                  </p>
                </div>
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                    İzotonik hacim
                  </span>
                  <div className="text-2xl font-black text-white mt-1">{izotonikMl} mL</div>
                  <p className="text-[10px] text-blue-300 mt-1">
                    150 mEq / 1 L %5 dekstroz üzerinden
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">Bolus bikarbonat izotonik değildir:</strong> %8.4
            çözelti 1000 mEq/L'dir, yani plazmanın yaklaşık altı katı ozmolarite
            taşır. Hızlı puşe hipernatremi, hipokalemi ve paradoksal
            intraselüler asidozla ilişkilidir; ağır hiperkalemi ve trisiklik
            zehirlenmesi gibi durumlar dışında infüzyon tercih edilir.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hesap bir başlangıç noktasıdır, hedef değil: bikarbonat verilirken
              kan gazı, sodyum ve potasyum yakından izlenir. Kurumunuzun
              protokolüyle karşılaştırın.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
