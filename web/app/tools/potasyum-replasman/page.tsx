"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * IV potasyum replasmanı — hız, derişim ve süre sınırları.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU ARAÇ NE KADAR POTASYUM VERİLECEĞİNİ SÖYLEMEZ. Replasman miktarı serum
 * değeri, hücre içi açık, böbrek işlevi, asit-baz durumu ve süregelen kayıpla
 * belirlenir; "10 mEq serumu 0.1 mEq/L yükseltir" gibi kestirmeler güvenilmez
 * olduğu için bilerek KULLANILMADI.
 *
 * ARACIN İŞİ, VERİLECEK MİKTAR BELLİYKEN GÜVENLİ UYGULAMAYI KURMAK: potasyumda
 * ölümcül hatalar dozdan çok HIZ ve DERİŞİMDE oluyor. Periferik yoldan hızlı
 * ya da yoğun verilen potasyum damar yakar; santralden hızlı verilen potasyum
 * kardiyak arrest yapar. IV puşe potasyum ÖLÜMCÜLDÜR — araç bunu her durumda
 * yazıyor.
 * ─────────────────────────────────────────────────────────────────────
 */

type Yol = "periferik" | "santral";

/**
 * Sabitler tek yerde ve okunur. Bunlar YAYGIN sınırlardır; yoğun bakımda
 * sürekli EKG izlemiyle daha yüksek hızlara izin veren protokoller var ve
 * bu bir kurum kararı.
 */
const SINIRLAR: Record<Yol, { maxDerisimMeqL: number; maxHizMeqSaat: number; not: string }> = {
  periferik: {
    maxDerisimMeqL: 40,
    maxHizMeqSaat: 10,
    not: "Periferik damarda daha yoğun ya da daha hızlı potasyum flebit ve ağrı yapar; ekstravazasyon doku hasarına yol açar.",
  },
  santral: {
    maxDerisimMeqL: 100,
    maxHizMeqSaat: 20,
    not: "Santral yoldan daha yoğun karışım verilebilir. Sürekli EKG izlemi olan yoğun bakımda daha yüksek hızlara izin veren protokoller vardır; bu bir kurum kararıdır.",
  },
};

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da <input>u
 * söküp yeniden takar, kullanıcı her rakamdan sonra odağı kaybeder (bu
 * depoda ölçülmüş ve düzeltilmiş bir kusur).
 */
function SayiAlani({
  id, etiket, birim, deger, ayarla, ipucu,
}: {
  id: string; etiket: string; birim: string;
  deger: string; ayarla: (v: string) => void; ipucu?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
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

export default function PotasyumReplasmanSayfasi() {
  const [miktar, setMiktar] = React.useState("");
  const [yol, setYol] = React.useState<Yol>("periferik");

  const miktarNum = parseLocaleNumber(miktar);
  const makul = miktar.trim() !== "" && miktarNum > 0 && miktarNum <= 400;

  const s = SINIRLAR[yol];
  const enAzHacimMl = makul ? yuvarla((miktarNum / s.maxDerisimMeqL) * 1000, 0) : 0;
  const enAzSureSaat = makul ? yuvarla(miktarNum / s.maxHizMeqSaat, 1) : 0;
  const maxHizMlSaat = makul && enAzSureSaat > 0 ? yuvarla(enAzHacimMl / enAzSureSaat, 0) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="potasyum-replasman" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🍌</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Potasyum Replasmanı
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              IV uygulama — hız, derişim ve süre sınırları
            </p>
          </div>
        </div>

        {/* EN ÜSTTE, HER DURUMDA: puşe yasağı */}
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <p className="text-[12px] leading-relaxed text-rose-900">
            <strong>Potasyum IV puşe yapılmaz.</strong> Sulandırılmadan ya da
            hızlı verilen potasyum kardiyak arreste yol açar. Her zaman
            sulandırılıp kontrollü hızda infüze edilir.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">⚠️</span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bu araç ne kadar potasyum verileceğini söylemez.</strong> Miktar
            serum değeri, böbrek işlevi, asit-baz durumu ve süregelen kayıpla
            belirlenir. Araç, miktar belliyken güvenli uygulamayı kurar.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <SayiAlani
            id="k-miktar" etiket="Verilecek potasyum" birim="mEq"
            deger={miktar} ayarla={setMiktar} ipucu="ör. 40"
          />

          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Uygulama yolu
            </span>
            <div className="flex flex-wrap gap-2">
              {(["periferik", "santral"] as Yol[]).map((y) => (
                <button
                  key={y}
                  type="button"
                  aria-pressed={yol === y}
                  onClick={() => setYol(y)}
                  className={`px-5 py-3 rounded-2xl border-2 text-[11px] font-black uppercase tracking-widest transition-all
                    ${yol === y
                      ? "bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20"
                      : "bg-white border-slate-200 text-slate-500 hover:border-blue-900/30"}`}
                >
                  {y === "periferik" ? "Periferik" : "Santral"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SONUÇ */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-3">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            {yol === "periferik" ? "Periferik yol" : "Santral yol"} sınırları
          </span>

          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Verilecek potasyum miktarını girin (mEq).
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                    En az sulandırma
                  </span>
                  <div className="mt-1 text-3xl font-black text-white">{enAzHacimMl} mL</div>
                  <p className="mt-1 text-[10px] text-blue-300">
                    en çok {s.maxDerisimMeqL} mEq/L
                  </p>
                </div>
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                    En kısa süre
                  </span>
                  <div className="mt-1 text-3xl font-black text-white">{enAzSureSaat} saat</div>
                  <p className="mt-1 text-[10px] text-blue-300">
                    en çok {s.maxHizMeqSaat} mEq/saat
                  </p>
                </div>
                <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                    Pompa hızı
                  </span>
                  <div className="mt-1 text-3xl font-black text-white">{maxHizMlSaat}</div>
                  <p className="mt-1 text-[10px] text-blue-300">mL/saat (en yüksek)</p>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-blue-200">
                {miktarNum} mEq · en az {enAzHacimMl} mL içinde · en az{" "}
                {enAzSureSaat} saatte. Bunlar TAVAN değerleridir: daha yavaş ve
                daha seyreltik vermek her zaman güvenli yöndedir.
              </p>

              <p className="text-[11px] leading-relaxed text-blue-300">{s.not}</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">Birlikte bakılacaklar:</strong> dirençli
            hipokalemide magnezyum düzeltilmeden potasyum yerine konamaz —
            hipomagnezemi renal potasyum kaybını sürdürür.{" "}
            <strong className="text-blue-900">Böbrek yetmezliğinde</strong> aynı
            miktar çok daha yüksek serum yanıtı verir; hız ve miktar buna göre
            düşürülür. Hızlı replasman sırasında EKG izlemi ve sık serum kontrolü
            gerekir.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Buradaki sınırlar yaygın kabul görmüş değerlerdir; kendi
              kurumunuzun protokolüyle karşılaştırın. Hazır karışım (ör. 20 mEq
              içeren torbalar) kullanıyorsanız derişim zaten sabittir — o zaman
              yalnızca hız sınırı geçerlidir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
