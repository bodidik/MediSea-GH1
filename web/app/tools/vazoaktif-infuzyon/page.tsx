"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Vazoaktif ve antihipertansif infüzyonlar — doz ↔ mL/saat.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU ARAÇ İLAÇ SEÇMEZ. Hangi ajanın hangi tabloda kullanılacağı (hipertansif
 * acil mi ivedilik mi, hedef organ hasarı, gebelik, aort diseksiyonu…)
 * klinik karardır. Araç yalnızca seçilen ilacın dozunu pompa hızına çevirir.
 *
 * İKİ AYRI DOZLAMA TABANI VAR ve karıştırılması gerçek bir hata kaynağı:
 * nitrogliserin ve labetalol KİLODAN BAĞIMSIZ (mcg/dk, mg/dk), ötekiler
 * kiloya göre (mcg/kg/dk). Araç her ilacın tabanını açıkça yazıyor ve
 * kilodan bağımsız ilaçlarda ağırlık alanını hesaba hiç katmıyor.
 *
 * TORBA DÜZENLENEBİLİR: karışım kurumdan kuruma değişiyor. Varsayılanlar
 * yaygın erişkin karışımları; kullanıcı kendi torbasını girebiliyor ve
 * hesap ondan yürüyor.
 * ─────────────────────────────────────────────────────────────────────
 */

type Ilac = {
  key: string;
  ad: string;
  /** true ise doz mcg/kg/dk, false ise kilodan bağımsız */
  kiloyaGore: boolean;
  /** doz biriminin ekranda görünen hâli */
  dozBirimi: string;
  /** dozun mikrogram cinsinden karşılığı (labetalol mg/dk → 1000) */
  dozMikrogramCarpani: number;
  olagenAlt: number;
  olagenUst: number;
  torbaMg: number;
  torbaMl: number;
  not?: string;
};

/** Sabitler tek yerde ve okunur — gözden geçirilebilsin diye. */
const ILACLAR: Ilac[] = [
  {
    key: "nitrogliserin", ad: "Nitrogliserin", kiloyaGore: false,
    dozBirimi: "mcg/dk", dozMikrogramCarpani: 1,
    olagenAlt: 5, olagenUst: 200, torbaMg: 50, torbaMl: 250,
    not: "Kilodan bağımsız dozlanır. Sürekli kullanımda taşiflaksi gelişir; sağ ventrikül infarktüsünde ve fosfodiesteraz-5 inhibitörü alanlarda kaçınılır.",
  },
  {
    key: "nitroprussid", ad: "Nitroprussid", kiloyaGore: true,
    dozBirimi: "mcg/kg/dk", dozMikrogramCarpani: 1,
    olagenAlt: 0.3, olagenUst: 10, torbaMg: 50, torbaMl: 250,
    not: "Işıktan korunur. Yüksek doz ve uzun süre siyanür/tiyosiyanat birikimi riski taşır; böbrek ve karaciğer yetmezliğinde risk artar.",
  },
  {
    key: "noradrenalin", ad: "Noradrenalin", kiloyaGore: true,
    dozBirimi: "mcg/kg/dk", dozMikrogramCarpani: 1,
    olagenAlt: 0.05, olagenUst: 3, torbaMg: 4, torbaMl: 250,
    not: "Tercihen santral yoldan. Ekstravazasyon doku nekrozu yapar.",
  },
  {
    key: "adrenalin", ad: "Adrenalin", kiloyaGore: true,
    dozBirimi: "mcg/kg/dk", dozMikrogramCarpani: 1,
    olagenAlt: 0.01, olagenUst: 0.5, torbaMg: 4, torbaMl: 250,
  },
  {
    key: "dopamin", ad: "Dopamin", kiloyaGore: true,
    dozBirimi: "mcg/kg/dk", dozMikrogramCarpani: 1,
    olagenAlt: 2, olagenUst: 20, torbaMg: 400, torbaMl: 250,
  },
  {
    key: "dobutamin", ad: "Dobutamin", kiloyaGore: true,
    dozBirimi: "mcg/kg/dk", dozMikrogramCarpani: 1,
    olagenAlt: 2, olagenUst: 20, torbaMg: 250, torbaMl: 250,
  },
  {
    key: "esmolol", ad: "Esmolol", kiloyaGore: true,
    dozBirimi: "mcg/kg/dk", dozMikrogramCarpani: 1,
    olagenAlt: 50, olagenUst: 300, torbaMg: 2500, torbaMl: 250,
    not: "Çok kısa etkili; yarı ömrü dakikalar içindedir. Yükleme dozu ayrı hesaplanır.",
  },
  {
    key: "labetalol", ad: "Labetalol", kiloyaGore: false,
    dozBirimi: "mg/dk", dozMikrogramCarpani: 1000,
    olagenAlt: 0.5, olagenUst: 2, torbaMg: 200, torbaMl: 200,
    not: "Kilodan bağımsız dozlanır. Astım, dekompanse kalp yetmezliği ve ileri kalp bloğunda kaçınılır.",
  },
];

const yuvarla = (n: number, b = 2) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa fonksiyonunun içinde tanımlanırsa React her
 * render'da <input>u söküp yeniden takar ve kullanıcı her rakamdan sonra
 * odağı kaybeder (bu depoda ölçülmüş ve düzeltilmiş bir kusur).
 */
function SayiAlani({
  id, etiket, birim, deger, ayarla, ipucu, pasif,
}: {
  id: string; etiket: string; birim: string; deger: string;
  ayarla: (v: string) => void; ipucu?: string; pasif?: boolean;
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
          aria-describedby={birim ? `${id}-birim` : undefined}
          type="text"
          inputMode="decimal"
          value={deger}
          disabled={pasif}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-xl font-black text-blue-900 focus:border-blue-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-dashed disabled:text-slate-500"
        />
        <span id={`${id}-birim`} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{birim}</span>
      </div>
    </div>
  );
}

export default function VazoaktifInfuzyonSayfasi() {
  const [ilacKey, setIlacKey] = React.useState(ILACLAR[0].key);
  const [kilo, setKilo] = React.useState("");
  const [doz, setDoz] = React.useState("");
  const [torbaMg, setTorbaMg] = React.useState(String(ILACLAR[0].torbaMg));
  const [torbaMl, setTorbaMl] = React.useState(String(ILACLAR[0].torbaMl));

  const ilac = ILACLAR.find((i) => i.key === ilacKey) ?? ILACLAR[0];

  const ilacDegistir = (key: string) => {
    const yeni = ILACLAR.find((i) => i.key === key);
    setIlacKey(key);
    // Torba varsayılanı ilaçla birlikte gelir; kullanıcı sonra değiştirebilir.
    if (yeni) { setTorbaMg(String(yeni.torbaMg)); setTorbaMl(String(yeni.torbaMl)); }
  };

  const kiloNum = parseLocaleNumber(kilo);
  const dozNum = parseLocaleNumber(doz);
  const mgNum = parseLocaleNumber(torbaMg);
  const mlNum = parseLocaleNumber(torbaMl);

  const kiloGerekli = ilac.kiloyaGore;
  const kiloMakul = !kiloGerekli || (kilo.trim() !== "" && kiloNum >= 1 && kiloNum <= 400);
  const dozMakul = doz.trim() !== "" && dozNum > 0 && dozNum <= 10000;
  const torbaMakul =
    torbaMg.trim() !== "" && mgNum > 0 && mgNum <= 100000 &&
    torbaMl.trim() !== "" && mlNum > 0 && mlNum <= 5000;

  const makul = kiloMakul && dozMakul && torbaMakul;

  /** Torbanın mikrogram/mL derişimi. */
  const derisim = torbaMakul ? (mgNum * 1000) / mlNum : 0;

  /**
   * mL/saat = (dakikadaki mikrogram × 60) ÷ derişim
   * Dakikadaki mikrogram, kiloya göre dozlanan ilaçlarda ağırlıkla çarpılır.
   */
  const mikrogramDk = dozNum * ilac.dozMikrogramCarpani * (kiloGerekli ? kiloNum : 1);
  const mlSaat = makul ? yuvarla((mikrogramDk * 60) / derisim, 1) : 0;

  const aralikDisi = dozMakul && (dozNum < ilac.olagenAlt || dozNum > ilac.olagenUst);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="vazoaktif-infuzyon" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">💧</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Vazoaktif İnfüzyon
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              Doz ↔ pompa hızı · {ILACLAR.length} ajan
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">⚠️</span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bu araç ilaç seçmez.</strong> Hangi ajanın kullanılacağı ve
            hedef kan basıncı klinik karardır; araç yalnızca dozu pompa hızına
            çevirir.
          </p>
        </div>

        {/* İLAÇ SEÇİMİ */}
        <div className="flex flex-wrap gap-2">
          {ILACLAR.map((i) => (
            <button
              key={i.key}
              type="button"
              aria-pressed={ilacKey === i.key}
              onClick={() => ilacDegistir(i.key)}
              className={`px-4 py-2.5 rounded-2xl border-2 text-[11px] font-black uppercase tracking-widest transition-all
                ${ilacKey === i.key
                  ? "bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20"
                  : "bg-white border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900"}`}
            >
              {i.ad}
            </button>
          ))}
        </div>

        {/* GİRDİLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SayiAlani
              id="vazo-kilo" etiket="Hasta ağırlığı" birim="kg"
              deger={kilo} ayarla={setKilo} ipucu="ör. 70"
              pasif={!kiloGerekli}
            />
            <SayiAlani
              id="vazo-doz" etiket="Doz" birim={ilac.dozBirimi}
              deger={doz} ayarla={setDoz}
              ipucu={`${ilac.olagenAlt}–${ilac.olagenUst}`}
            />
          </div>

          {!kiloGerekli && (
            <p className="text-[11px] font-bold text-blue-900/85">
              {ilac.ad} kilodan bağımsız dozlanır — ağırlık hesaba katılmıyor.
            </p>
          )}

          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Torba karışımı
            </span>
            <div className="grid grid-cols-2 gap-4">
              <SayiAlani id="vazo-mg" etiket="İlaç miktarı" birim="mg"
                deger={torbaMg} ayarla={setTorbaMg} />
              <SayiAlani id="vazo-ml" etiket="Toplam hacim" birim="mL"
                deger={torbaMl} ayarla={setTorbaMl} />
            </div>
            {torbaMakul && (
              <p className="mt-2 text-[11px] font-bold text-slate-500">
                Derişim: {yuvarla(derisim, 1)} mcg/mL
              </p>
            )}
          </div>
        </div>

        {/* SONUÇ */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block mb-3">
            Pompa hızı — {ilac.ad}
          </span>

          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              {kiloGerekli && !kiloMakul
                ? "Ağırlık ve doz girin."
                : !dozMakul
                  ? "Doz girin."
                  : "Torba karışımını girin."}
            </p>
          ) : (
            <>
              <div className="text-6xl font-black text-white">{mlSaat}</div>
              <div className="text-sm font-bold text-blue-300 mt-1">mL/saat</div>
              <p className="mt-4 text-[11px] leading-relaxed text-blue-200">
                {dozNum} {ilac.dozBirimi}
                {kiloGerekli ? ` × ${kiloNum} kg` : ""} ={" "}
                {yuvarla(mikrogramDk, 1)} mcg/dk · torba {yuvarla(derisim, 1)} mcg/mL
              </p>
            </>
          )}

          {aralikDisi && (
            <p className="mt-4 text-[11px] font-bold text-amber-300" role="status">
              Girilen doz olağan aralığın dışında ({ilac.olagenAlt}–{ilac.olagenUst}{" "}
              {ilac.dozBirimi}). Hesap yapıldı; aralık dışı kullanım bilinçli bir
              karar olmalı.
            </p>
          )}
        </div>

        {ilac.not && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
            <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest block mb-2">
              {ilac.ad} — dikkat
            </span>
            <p className="text-[12px] leading-relaxed text-slate-600">{ilac.not}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">Hipertansif acilde hedef</strong>{" "}
            kan basıncını normale indirmek değildir: ilk saatte ortalama arter
            basıncında ölçülü bir düşüş hedeflenir ve hız tabloya göre
            değişir (aort diseksiyonu ile iskemik inme aynı hızda düşürülmez).
            Hedefi tablo belirler, bu araç değil.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Torba karışımı varsayılanları yaygın erişkin karışımlarıdır;
              kendi kurumunuzun karışımını girin. Hesaplanan hızı pompaya
              girmeden önce ikinci bir kişiyle doğrulayın.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
