"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * Kiloya göre IV fraksiyone olmayan heparin — yükleme ve idame.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU ARAÇ ANTİKOAGÜLASYON KARARI VERMEZ ve aPTT'ye göre doz ayarlamaz.
 * Endikasyon, kanama riski ve izlem hedefi (aPTT ya da anti-Xa) klinik
 * karardır; ayarlama nomogramları kurumdan kuruma değişir ve bu araca
 * BİLEREK konmadı — yanlış kurumun nomogramını uygulamak, hiç
 * uygulamamaktan kötüdür.
 *
 * ARACIN TAŞIDIĞI ASIL RİSK TAVANLARDA. Akut koroner sendrom nomogramında
 * yükleme 4000 üniteyi, idame 1000 ünite/saati aşmaz. Tavanı atlamak ağır
 * hastada dozu iki katına çıkarır; bu yüzden tavan uygulandığında ekranda
 * AÇIKÇA söyleniyor, sessizce kırpılmıyor.
 * ─────────────────────────────────────────────────────────────────────
 */

type Endikasyon = {
  key: string;
  ad: string;
  aciklama: string;
  bolusUKg: number;
  bolusTavan: number | null;
  idameUKgSaat: number;
  idameTavan: number | null;
};

/** Sabitler tek yerde ve okunur. */
const ENDIKASYONLAR: Endikasyon[] = [
  {
    key: "vte",
    ad: "VTE (DVT / PE)",
    aciklama: "Venöz tromboembolizmde yaygın kullanılan kiloya göre nomogram.",
    bolusUKg: 80, bolusTavan: null,
    idameUKgSaat: 18, idameTavan: null,
  },
  {
    key: "aks",
    ad: "AKS",
    aciklama: "Akut koroner sendromda daha düşük dozlu nomogram; yükleme ve idamenin TAVANI vardır.",
    bolusUKg: 60, bolusTavan: 4000,
    idameUKgSaat: 12, idameTavan: 1000,
  },
];

const yuvarla = (n: number, b = 0) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da <input>u
 * söküp yeniden takar ve kullanıcı her rakamdan sonra odağı kaybeder.
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

export default function HeparinNomogramSayfasi() {
  const [kilo, setKilo] = React.useState("");
  const [endKey, setEndKey] = React.useState(ENDIKASYONLAR[0].key);
  const [torbaU, setTorbaU] = React.useState("25000");
  const [torbaMl, setTorbaMl] = React.useState("250");

  const end = ENDIKASYONLAR.find((e) => e.key === endKey) ?? ENDIKASYONLAR[0];

  const kiloNum = parseLocaleNumber(kilo);
  const uNum = parseLocaleNumber(torbaU);
  const mlNum = parseLocaleNumber(torbaMl);

  const kiloMakul = kilo.trim() !== "" && kiloNum >= 1 && kiloNum <= 400;
  const torbaMakul =
    torbaU.trim() !== "" && uNum > 0 && uNum <= 1_000_000 &&
    torbaMl.trim() !== "" && mlNum > 0 && mlNum <= 5000;
  const makul = kiloMakul && torbaMakul;

  const derisim = torbaMakul ? uNum / mlNum : 0;   // ünite/mL

  const bolusHam = kiloNum * end.bolusUKg;
  const bolus = end.bolusTavan ? Math.min(bolusHam, end.bolusTavan) : bolusHam;
  const bolusTavanUygulandi = makul && end.bolusTavan !== null && bolusHam > end.bolusTavan;

  const idameHam = kiloNum * end.idameUKgSaat;
  const idame = end.idameTavan ? Math.min(idameHam, end.idameTavan) : idameHam;
  const idameTavanUygulandi = makul && end.idameTavan !== null && idameHam > end.idameTavan;

  const bolusMl = derisim ? yuvarla(bolus / derisim, 1) : 0;
  const idameMlSaat = derisim ? yuvarla(idame / derisim, 1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="heparin-nomogram" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🩹</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Heparin Nomogramı
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              Kiloya göre IV fraksiyone olmayan heparin
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">⚠️</span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bu araç aPTT'ye göre doz ayarlamaz.</strong> Ayarlama
            nomogramları kurumdan kuruma değişir; yanlış kurumun nomogramını
            uygulamak hiç uygulamamaktan kötüdür. Araç yalnızca başlangıç
            dozlarını hesaplar.
          </p>
        </div>

        {/* ENDİKASYON */}
        <div className="flex flex-wrap gap-2">
          {ENDIKASYONLAR.map((e) => (
            <button
              key={e.key}
              type="button"
              aria-pressed={endKey === e.key}
              onClick={() => setEndKey(e.key)}
              className={`px-5 py-3 rounded-2xl border-2 text-left transition-all
                ${endKey === e.key
                  ? "bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-900/30"}`}
            >
              <span className="block text-[11px] font-black uppercase tracking-widest">{e.ad}</span>
              <span className={`block text-[10px] font-bold mt-0.5 ${endKey === e.key ? "text-blue-200" : "text-slate-400"}`}>
                {e.bolusUKg} Ü/kg · {e.idameUKgSaat} Ü/kg/saat
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <SayiAlani id="hep-kilo" etiket="Hasta ağırlığı" birim="kg"
            deger={kilo} ayarla={setKilo} ipucu="ör. 70" />

          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Torba karışımı
            </span>
            <div className="grid grid-cols-2 gap-4">
              <SayiAlani id="hep-u" etiket="Heparin" birim="Ü"
                deger={torbaU} ayarla={setTorbaU} />
              <SayiAlani id="hep-ml" etiket="Hacim" birim="mL"
                deger={torbaMl} ayarla={setTorbaMl} />
            </div>
            {torbaMakul && (
              <p className="mt-2 text-[11px] font-bold text-slate-500">
                Derişim: {yuvarla(derisim, 1)} Ü/mL
              </p>
            )}
          </div>
        </div>

        {/* SONUÇ */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-3">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
            {end.ad}
          </span>

          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              {!kiloMakul ? "Hasta ağırlığını girin (1–400 kg)." : "Torba karışımını girin."}
            </p>
          ) : (
            <>
              <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest">
                    Yükleme (bolus)
                  </span>
                  <span className="text-[10px] font-bold text-blue-300">
                    {end.bolusUKg} Ü/kg{end.bolusTavan ? ` · tavan ${end.bolusTavan} Ü` : ""}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-black text-white">{yuvarla(bolus)} Ü</span>
                  <span className="text-sm font-bold text-blue-300">≈ {bolusMl} mL</span>
                </div>
                {bolusTavanUygulandi && (
                  <p className="mt-2 text-[11px] font-bold text-amber-300" role="status">
                    Kiloya göre {yuvarla(bolusHam)} Ü çıkıyordu; nomogram tavanı
                    olan {end.bolusTavan} Ü uygulandı.
                  </p>
                )}
              </div>

              <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest">
                    İdame infüzyonu
                  </span>
                  <span className="text-[10px] font-bold text-blue-300">
                    {end.idameUKgSaat} Ü/kg/saat{end.idameTavan ? ` · tavan ${end.idameTavan} Ü/saat` : ""}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-black text-white">{yuvarla(idame)} Ü/saat</span>
                  <span className="text-sm font-bold text-blue-300">≈ {idameMlSaat} mL/saat</span>
                </div>
                {idameTavanUygulandi && (
                  <p className="mt-2 text-[11px] font-bold text-amber-300" role="status">
                    Kiloya göre {yuvarla(idameHam)} Ü/saat çıkıyordu; nomogram
                    tavanı olan {end.idameTavan} Ü/saat uygulandı.
                  </p>
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-blue-200">{end.aciklama}</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">İzlem:</strong> ilk aPTT (ya da
            anti-Xa) genellikle 6. saatte alınır ve doz kurumun ayarlama
            çizelgesine göre değiştirilir. Trombosit sayısı heparine bağlı
            trombositopeni açısından izlenir.{" "}
            <strong className="text-blue-900">Obezitede</strong> bazı
            protokoller düzeltilmiş vücut ağırlığı kullanır; hangi ağırlığın
            girileceği kurum kararıdır.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3 opacity-70">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Torba varsayılanı 25.000 Ü / 250 mL (100 Ü/mL) yaygın bir
              karışımdır; kendi kurumunuzunkini girin. Hesaplanan dozu
              uygulamadan önce ikinci bir kişiyle doğrulayın.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
