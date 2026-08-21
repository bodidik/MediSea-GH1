"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * IV kalsiyum — tuz seçimi, doz, süre ve pompa hızı.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARACIN VARLIK SEBEBİ: "BİR AMPUL KALSİYUM" CÜMLESİ ANLAMSIZDIR.
 *
 * Kalsiyum glukonat %10 ve kalsiyum klorür %10 ampulleri AYNI HACİMDE (10 mL,
 * 1 g tuz) ama taşıdıkları elementer kalsiyum yaklaşık ÜÇ KAT farklı:
 *   glukonat 1 g ->  93 mg elementer (4.65 mEq)
 *   klorür   1 g -> 273 mg elementer (13.6 mEq)
 *
 * Yani "10 mL kalsiyum verildi" bilgisi, hangi tuz olduğu söylenmeden ne
 * verildiğini söylemiyor. Araç her sonucun yanında elementer karşılığı
 * yazıyor; sayıyı doğrulamanın tek yolu bu.
 *
 * İKİNCİ AYRIM — İKİ FARKLI İŞ: membran stabilizasyonu (hiperkalemi, kalsiyum
 * kanal blokeri zehirlenmesi, hipermagnezemi) ile hipokalsemi replasmanı aynı
 * ilacın çok farklı kullanımları. Membran stabilizasyonu potasyumu DÜŞÜRMEZ;
 * yalnızca kalbi korur ve etkisi 30-60 dakikada geçer.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Araç ne kadar kalsiyum verileceğini kendi başına KARARLAŞTIRMAZ: miktar
 * semptoma, iyonize düzeye ve nedene göre belirlenir. Aracın işi, miktar
 * belliyken tuz dönüşümünü, süreyi ve pompa hızını doğru kurmak.
 */

type TuzSlug = "glukonat" | "klorur";

const TUZLAR: Record<
  TuzSlug,
  {
    ad: string;
    kisa: string;
    /** 1 g tuzun içindeki elementer kalsiyum (mg). */
    elementerMgPerG: number;
    mEqPerG: number;
    /** %10 çözeltide 1 g tuz kaç mL. */
    mlPerG: number;
    yol: string;
    not: string;
  }
> = {
  glukonat: {
    ad: "Kalsiyum glukonat %10",
    kisa: "Glukonat",
    elementerMgPerG: 93,
    mEqPerG: 4.65,
    mlPerG: 10,
    yol: "Periferik yoldan verilebilir",
    not: "Periferik damarda tercih edilen tuz. Ekstravazasyonda doku hasarı klorüre göre çok daha az; yine de büyük bir damar ve iyi çalışan bir yol gerekir.",
  },
  klorur: {
    ad: "Kalsiyum klorür %10",
    kisa: "Klorür",
    elementerMgPerG: 273,
    mEqPerG: 13.6,
    mlPerG: 10,
    yol: "Santral yol tercih edilir",
    not: "Aynı hacimde yaklaşık üç kat elementer kalsiyum taşır, bu yüzden acil durumda tercih edilir. Güçlü bir vezikandır: ekstravazasyonu doku nekrozu yapar, periferik yoldan verilecekse büyük damar ve yakın izlem şarttır.",
  },
};

type Kip = {
  slug: string;
  ad: string;
  ozet: string;
  /** Bu kipte olağan tuz dozu (g) — tuz başına ayrı, çünkü uygulamada eşdeğer kullanılmıyor. */
  olagan: Record<TuzSlug, [number, number]>;
  varsayilanDoz: Record<TuzSlug, number>;
  varsayilanDakika: number;
  varsayilanHacimMl: number;
  aciklama: string;
  uyari?: string;
};

const KIPLER: Kip[] = [
  {
    slug: "membran",
    ad: "Membran stabilizasyonu",
    ozet: "Hiperkalemi (EKG değişikliği), kalsiyum kanal blokeri, hipermagnezemi",
    olagan: { glukonat: [1, 3], klorur: [0.5, 1] },
    varsayilanDoz: { glukonat: 1, klorur: 0.5 },
    varsayilanDakika: 3,
    varsayilanHacimMl: 10,
    aciklama:
      "EKG düzelmezse 5-10 dakika sonra tekrarlanır. Etki dakikalar içinde başlar ve 30-60 dakikada geçer; bu süre içinde asıl tedavi kurulmuş olmalıdır.",
    uyari:
      "Membran stabilizasyonu potasyumu DÜŞÜRMEZ — yalnızca kalbi korur. İnsülin/glukoz, beta agonist, gerekiyorsa diyaliz ayrıca gerekir. Digoksin toksisitesi düşünülüyorsa kalsiyum kararı dikkatle verilir.",
  },
  {
    slug: "semptomatik",
    ad: "Semptomatik hipokalsemi — bolus",
    ozet: "Tetani, nöbet, laringospazm, QT uzaması",
    olagan: { glukonat: [1, 2], klorur: [0.5, 1] },
    varsayilanDoz: { glukonat: 2, klorur: 1 },
    varsayilanDakika: 15,
    varsayilanHacimMl: 100,
    aciklama:
      "Sulandırılıp 10-20 dakikada verilir. Bolusun etkisi kısa sürer (yaklaşık 1-2 saat); süregelen hipokalsemide ardından sürekli infüzyon gerekir.",
    uyari:
      "Bolus tek başına kalıcı çözüm değildir. Neden (hipoparatiroidi, D vitamini eksikliği, hipomagnezemi, sitrat yükü) araştırılmadan replasman tekrarlayıp durur. Dirençli hipokalsemi magnezyum düzeltilmeden düzelmez.",
  },
  {
    slug: "infuzyon",
    ad: "Sürekli infüzyon (kalsiyum damlası)",
    ozet: "Bolus sonrası süregelen hipokalsemide, kiloya göre",
    olagan: { glukonat: [0.5, 2], klorur: [0.5, 2] },
    varsayilanDoz: { glukonat: 1, klorur: 1 },
    varsayilanDakika: 60,
    varsayilanHacimMl: 1000,
    aciklama:
      "Elementer kalsiyum üzerinden 0.5-2 mg/kg/saat hızında verilir ve iyonize kalsiyuma göre titre edilir.",
    uyari:
      "Sürekli infüzyon sırasında iyonize kalsiyum düzenli izlenir. Uzun süren infüzyonda damar yolu ve infüzyon bölgesi de izlenmelidir.",
  },
];

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da <input>u
 * söküp yeniden takar ve kullanıcı her rakamdan sonra odağı kaybeder.
 */
function SayiAlani({
  id,
  etiket,
  birim,
  deger,
  ayarla,
  ipucu,
  pasif,
}: {
  id: string;
  etiket: string;
  birim: string;
  deger: string;
  ayarla: (v: string) => void;
  ipucu?: string;
  pasif?: boolean;
}) {
  return (
    <div className={pasif ? "opacity-50" : ""}>
      <label
        htmlFor={id}
        className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2"
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
          disabled={pasif}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-xl font-black text-blue-900 focus:border-blue-900 outline-none disabled:bg-slate-100"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">
          {birim}
        </span>
      </div>
    </div>
  );
}

function KutuBilgi({ etiket, deger, alt }: { etiket: string; deger: string; alt?: string }) {
  return (
    <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
      <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block">
        {etiket}
      </span>
      <div className="mt-1 text-3xl font-black text-white">{deger}</div>
      {alt && <p className="mt-1 text-[10px] text-blue-300">{alt}</p>}
    </div>
  );
}

export default function KalsiyumInfuzyonSayfasi() {
  const [kipSlug, setKipSlug] = React.useState(KIPLER[0].slug);
  const [tuz, setTuz] = React.useState<TuzSlug>("glukonat");

  const kip = KIPLER.find((k) => k.slug === kipSlug)!;
  const t = TUZLAR[tuz];
  const infuzyonKipi = kip.slug === "infuzyon";

  // Bolus kipleri
  const [doz, setDoz] = React.useState(String(KIPLER[0].varsayilanDoz.glukonat));
  const [dakika, setDakika] = React.useState(String(KIPLER[0].varsayilanDakika));
  const [hacim, setHacim] = React.useState(String(KIPLER[0].varsayilanHacimMl));

  // İnfüzyon kipi
  const [kilo, setKilo] = React.useState("");
  const [hiz, setHiz] = React.useState("1");
  const [torbaG, setTorbaG] = React.useState("11");
  const [torbaMl, setTorbaMl] = React.useState("1000");

  /** Kip ya da tuz değişince o kipin kendi varsayılanlarına dön. */
  const kipSec = (slug: string) => {
    const k = KIPLER.find((x) => x.slug === slug)!;
    setKipSlug(slug);
    setDoz(String(k.varsayilanDoz[tuz]));
    setDakika(String(k.varsayilanDakika));
    setHacim(String(k.varsayilanHacimMl));
  };
  const tuzSec = (yeni: TuzSlug) => {
    setTuz(yeni);
    if (!infuzyonKipi) setDoz(String(kip.varsayilanDoz[yeni]));
  };

  const dozNum = parseLocaleNumber(doz);
  const dakikaNum = parseLocaleNumber(dakika);
  const hacimNum = parseLocaleNumber(hacim);
  const kiloNum = parseLocaleNumber(kilo);
  const hizNum = parseLocaleNumber(hiz);
  const torbaGNum = parseLocaleNumber(torbaG);
  const torbaMlNum = parseLocaleNumber(torbaMl);

  /**
   * Makullük kapısı. parseLocaleNumber çözemediği her şeyi 0 döndürüyor;
   * ham dize boş mu diye ayrıca bakılıyor, çünkü 0 bu alanlarda meşru değil
   * ama boş alan da 0 üretiyor.
   */
  const bolusMakul =
    !infuzyonKipi &&
    doz.trim() !== "" && dozNum > 0 && dozNum <= 10 &&
    dakika.trim() !== "" && dakikaNum > 0 && dakikaNum <= 240 &&
    hacim.trim() !== "" && hacimNum > 0 && hacimNum <= 1000;

  const infMakul =
    infuzyonKipi &&
    kilo.trim() !== "" && kiloNum >= 20 && kiloNum <= 300 &&
    hiz.trim() !== "" && hizNum > 0 && hizNum <= 5 &&
    torbaG.trim() !== "" && torbaGNum > 0 && torbaGNum <= 50 &&
    torbaMl.trim() !== "" && torbaMlNum >= 50 && torbaMlNum <= 2000;

  // ── Bolus hesapları ────────────────────────────────────────────────
  const mlTuz = bolusMakul ? yuvarla(dozNum * t.mlPerG, 1) : 0;
  const elementerMg = bolusMakul ? Math.round(dozNum * t.elementerMgPerG) : 0;
  const mEq = bolusMakul ? yuvarla(dozNum * t.mEqPerG, 1) : 0;
  const pompaMlSaat = bolusMakul ? Math.round((hacimNum / dakikaNum) * 60) : 0;
  const ampulSayisi = bolusMakul ? yuvarla(dozNum, 2) : 0; // 1 g = 1 ampul (%10, 10 mL)

  // ── İnfüzyon hesapları ─────────────────────────────────────────────
  const elementerMgSaat = infMakul ? yuvarla(kiloNum * hizNum, 0) : 0;
  const torbaElementerMg = infMakul ? torbaGNum * t.elementerMgPerG : 0;
  const derisimMgMl = infMakul ? torbaElementerMg / torbaMlNum : 0;
  const infMlSaat = infMakul && derisimMgMl > 0 ? yuvarla(elementerMgSaat / derisimMgMl, 1) : 0;
  const torbaSaat = infMakul && elementerMgSaat > 0 ? yuvarla(torbaElementerMg / elementerMgSaat, 1) : 0;

  const aralik = kip.olagan[tuz];
  const aralikDisi = bolusMakul && (dozNum < aralik[0] || dozNum > aralik[1]);
  const hizAralikDisi = infMakul && (hizNum < 0.5 || hizNum > 2);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="kalsiyum-infuzyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🦴</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">
                ☀️
              </span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Kalsiyum İnfüzyonu
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Glukonat / klorür dönüşümü · doz · süre · pompa hızı
            </p>
          </div>
        </div>

        {/* HER DURUMDA GÖRÜNÜR: tuz karışıklığı bu aracın asıl konusu */}
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">
            🛑
          </span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>&ldquo;Bir ampul kalsiyum&rdquo; anlamsız bir talimattır.</strong>{" "}
              Glukonat ve klorür ampulleri aynı hacimde (10 mL, 1 g tuz) ama
              taşıdıkları elementer kalsiyum yaklaşık <strong>üç kat</strong>{" "}
              farklı: glukonat 1 g = 93 mg, klorür 1 g = 273 mg. Hangi tuz
              olduğu söylenmeden verilen hacim ne verildiğini söylemez.
            </p>
            <p>
              <strong>Kalsiyum ve bikarbonat aynı yoldan aynı anda verilmez</strong>{" "}
              — çökelti oluşur. Aynı damar yolu kullanılacaksa arada serum
              fizyolojikle yıkanır.
            </p>
          </div>
        </div>

        {/* ── Kip ve tuz ────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">
              Kullanım
            </span>
            <div className="grid grid-cols-1 gap-2">
              {KIPLER.map((k) => (
                <button
                  key={k.slug}
                  type="button"
                  aria-pressed={kipSlug === k.slug}
                  onClick={() => kipSec(k.slug)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all
                    ${
                      kipSlug === k.slug
                        ? "bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/20"
                        : "bg-white border-slate-200 hover:border-blue-900/30"
                    }`}
                >
                  <span
                    className={`block text-[12px] font-black ${kipSlug === k.slug ? "text-white" : "text-blue-900"}`}
                  >
                    {k.ad}
                  </span>
                  <span
                    className={`block text-[10px] mt-0.5 leading-snug ${kipSlug === k.slug ? "text-blue-200" : "text-slate-600"}`}
                  >
                    {k.ozet}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3">
              Tuz
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(TUZLAR) as TuzSlug[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={tuz === s}
                  onClick={() => tuzSec(s)}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition-all
                    ${
                      tuz === s
                        ? "bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/20"
                        : "bg-white border-slate-200 hover:border-blue-900/30"
                    }`}
                >
                  <span
                    className={`block text-[12px] font-black ${tuz === s ? "text-white" : "text-blue-900"}`}
                  >
                    {TUZLAR[s].ad}
                  </span>
                  <span
                    className={`block text-[10px] mt-0.5 ${tuz === s ? "text-blue-200" : "text-slate-600"}`}
                  >
                    1 g = {TUZLAR[s].elementerMgPerG} mg elementer · {TUZLAR[s].mEqPerG} mEq
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed mt-3">
              <strong className="text-blue-900">{t.yol}.</strong> {t.not}
            </p>
          </div>

          {/* ── Girdiler ───────────────────────────────── */}
          <div className="pt-4 border-t border-slate-100">
            {!infuzyonKipi ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SayiAlani
                  id="ca-doz"
                  etiket={`${t.kisa} dozu`}
                  birim="g"
                  deger={doz}
                  ayarla={setDoz}
                  ipucu={`${aralik[0]}–${aralik[1]}`}
                />
                <SayiAlani
                  id="ca-hacim"
                  etiket="Sulandırma"
                  birim="mL"
                  deger={hacim}
                  ayarla={setHacim}
                  ipucu="ör. 100"
                />
                <SayiAlani
                  id="ca-dakika"
                  etiket="Süre"
                  birim="dk"
                  deger={dakika}
                  ayarla={setDakika}
                  ipucu="ör. 15"
                />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SayiAlani id="ca-kilo" etiket="Ağırlık" birim="kg" deger={kilo} ayarla={setKilo} ipucu="ör. 70" />
                  <SayiAlani
                    id="ca-hiz"
                    etiket="Hız (elementer)"
                    birim="mg/kg/sa"
                    deger={hiz}
                    ayarla={setHiz}
                    ipucu="0.5–2"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    Torba karışımı
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SayiAlani
                      id="ca-torba-g"
                      etiket={`${t.kisa} miktarı`}
                      birim="g"
                      deger={torbaG}
                      ayarla={setTorbaG}
                      ipucu="ör. 11"
                    />
                    <SayiAlani
                      id="ca-torba-ml"
                      etiket="Sulandırma hacmi"
                      birim="mL"
                      deger={torbaMl}
                      ayarla={setTorbaMl}
                      ipucu="ör. 1000"
                    />
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed mt-3">
                    Karışım kurumdan kuruma değişir; varsayılan yaygın bir
                    erişkin karışımıdır. Girdiğiniz torbanın derişimi aşağıda
                    elementer kalsiyum olarak yazılıyor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sonuç ─────────────────────────────────────── */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            {kip.ad} · {t.ad}
          </span>

          {!infuzyonKipi && !bolusMakul && (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Doz, sulandırma hacmi ve süreyi girin.
            </p>
          )}
          {infuzyonKipi && !infMakul && (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Ağırlık, hız ve torba karışımını girin.
            </p>
          )}

          {bolusMakul && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <KutuBilgi
                  etiket="Verilecek hacim"
                  deger={`${mlTuz} mL`}
                  alt={`%10 çözelti · ${ampulSayisi} ampul (10 mL)`}
                />
                <KutuBilgi
                  etiket="Elementer kalsiyum"
                  deger={`${elementerMg} mg`}
                  alt={`${mEq} mEq`}
                />
                <KutuBilgi etiket="Pompa hızı" deger={`${pompaMlSaat}`} alt="mL/saat" />
              </div>

              <p className="text-[11px] leading-relaxed text-blue-200">
                {dozNum} g {t.kisa.toLocaleLowerCase("tr")} ({mlTuz} mL) ·{" "}
                {hacimNum} mL içinde · {dakikaNum} dakikada.
              </p>

              {aralikDisi && (
                <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                  <strong>Girilen doz olağan aralığın dışında.</strong> Bu kipte{" "}
                  {t.kisa.toLocaleLowerCase("tr")} için olağan aralık {aralik[0]}–
                  {aralik[1]} g. Hesap yine yapıldı — aralık dışı kullanım meşru
                  olabilir, ama bilerek seçilmiş olmalı.
                </p>
              )}
            </>
          )}

          {infMakul && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <KutuBilgi
                  etiket="Elementer kalsiyum"
                  deger={`${elementerMgSaat} mg/sa`}
                  alt={`${kiloNum} kg × ${hizNum} mg/kg/sa`}
                />
                <KutuBilgi
                  etiket="Torba derişimi"
                  deger={`${yuvarla(derisimMgMl, 2)}`}
                  alt="mg/mL elementer"
                />
                <KutuBilgi etiket="Pompa hızı" deger={`${infMlSaat}`} alt="mL/saat" />
              </div>

              <p className="text-[11px] leading-relaxed text-blue-200">
                {torbaGNum} g {t.kisa.toLocaleLowerCase("tr")} ={" "}
                {Math.round(torbaElementerMg)} mg elementer kalsiyum, {torbaMlNum} mL
                içinde. Bu torba yaklaşık <strong>{torbaSaat} saat</strong> yeter.
              </p>

              {hizAralikDisi && (
                <p className="text-[11px] leading-relaxed text-amber-200" role="status">
                  <strong>Hız olağan aralığın dışında.</strong> Elementer kalsiyum
                  için olağan aralık 0.5–2 mg/kg/saat.
                </p>
              )}
            </>
          )}

          <p className="text-[11px] leading-relaxed text-blue-200 border-t border-blue-800 pt-4">
            {kip.aciklama}
          </p>
          {kip.uyari && (
            <p className="text-[11px] leading-relaxed text-amber-200">
              <strong>Dikkat:</strong> {kip.uyari}
            </p>
          )}
        </div>

        {/* ── Tuz karşılaştırma tablosu ─────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            İki tuz yan yana — 10 mL %10 ampul
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 440 }}>
              <thead>
                <tr className="border-b border-slate-200">
                  {["", "Glukonat", "Klorür"].map((h) => (
                    <th
                      key={h || "bos"}
                      className="text-[10px] font-black text-slate-600 uppercase tracking-widest py-2 pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Tuz miktarı", "1 g", "1 g"],
                  ["Elementer kalsiyum", "93 mg", "273 mg"],
                  ["mEq", "4.65", "13.6"],
                  ["Damar yolu", "Periferik uygun", "Santral tercih"],
                ].map((satir) => (
                  <tr key={satir[0]} className="border-b border-slate-100">
                    {satir.map((h, i) => (
                      <td
                        key={h + i}
                        className={`py-2 pr-4 text-[12px] ${i === 0 ? "font-black text-blue-900" : "font-bold text-slate-700"}`}
                        style={{ minWidth: 110 }}
                      >
                        {h}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Tablodaki fark uygulamada <strong>eşdeğer doz</strong> olarak
            kullanılmaz: her tuzun kendi olağan doz aralığı vardır ve araç
            seçilen tuza göre onu gösterir. Tabloyu, verilen miktarı elementer
            kalsiyum üzerinden doğrulamak için kullanın.
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Birlikte bakılacaklar:</strong> ağır
            hastada total kalsiyum yanıltıcıdır — albümin düşükse total düşük
            görünür, oysa iyonize kalsiyum normal olabilir; kararın{" "}
            <strong>iyonize kalsiyuma</strong> göre verilmesi tercih edilir.
            Dirençli hipokalsemi magnezyum düzeltilmeden düzelmez. Masif
            transfüzyon ve sitratlı diyalizde kalsiyum bağlanır; orada sorun
            eksiklik değil, bağlanmadır.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-blue-900">
                Bu araç ne kadar kalsiyum verileceğine karar vermez.
              </strong>{" "}
              Miktar semptoma, iyonize düzeye ve altta yatan nedene göre
              belirlenir. Araç, miktar belliyken tuz dönüşümünü, süreyi ve pompa
              hızını kurar. Doz aralıkları erişkin, yaygın protokollerdir; kendi
              kurumunuzun protokolüyle karşılaştırın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
