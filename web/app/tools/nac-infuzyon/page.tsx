"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * N-asetilsistein (IV) infüzyon hesabı — parasetamol intoksikasyonu.
 *
 * ─────────────────────────────────────────────────────────────────────
 * BU ARAÇ TEDAVİ KARARI VERMEZ. Hastanın NAC alıp almayacağı Rumack-Matthew
 * nomogramı, alım zamanı, kronik alım/risk faktörleri ve klinik gidişle
 * belirlenir. Buradaki hesap yalnızca KARAR VERİLDİKTEN SONRAKİ aritmetiği
 * yapar: kiloya göre miligram, sulandırma hacmi ve saatlik hız.
 *
 * REJİMLER standart yayımlanmış protokollerdir ve ekranda kaynağıyla
 * birlikte gösterilir. Bir protokolün seçimi ve yerel uyarlaması KLİNİK
 * karardır; sabitler bilerek tek yerde ve okunur biçimde duruyor.
 * ─────────────────────────────────────────────────────────────────────
 */

type Torba = {
  ad: string;
  mgKg: number;
  hacimMl: number;
  saat: number;
  not?: string;
};

type Rejim = {
  key: string;
  ad: string;
  ozet: string;
  kaynak: string;
  torbalar: Torba[];
};

/**
 * Kilo tavanı: her iki rejimde de dozlama 110 kg üzerinde artırılmıyor.
 * Obez hastada mutlak doz orantısız yükseldiği için protokoller kiloyu
 * bu değerde sabitler.
 */
const KILO_TAVANI = 110;

const REJIMLER: Rejim[] = [
  {
    key: "uc-torba",
    ad: "3 torba (klasik)",
    ozet: "Toplam 300 mg/kg · 21 saat",
    kaynak: "Prescott/Rumack 21 saatlik IV rejim",
    torbalar: [
      { ad: "1. torba (yükleme)", mgKg: 150, hacimMl: 200, saat: 1,
        not: "Bazı protokollerde 15-60 dk arası verilir; hızlı infüzyonda anaflaktoid reaksiyon sıklığı artar." },
      { ad: "2. torba", mgKg: 50, hacimMl: 500, saat: 4 },
      { ad: "3. torba", mgKg: 100, hacimMl: 1000, saat: 16 },
    ],
  },
  {
    key: "iki-torba",
    ad: "2 torba (SNAP)",
    ozet: "Toplam 300 mg/kg · 20 saat",
    kaynak: "SNAP çalışması — 2 torbalı kısaltılmış rejim",
    torbalar: [
      { ad: "1. torba (yükleme)", mgKg: 200, hacimMl: 500, saat: 4 },
      { ad: "2. torba", mgKg: 100, hacimMl: 1000, saat: 16 },
    ],
  },
];

const yuvarla = (n: number, b = 0) => Math.round(n * 10 ** b) / 10 ** b;

/**
 * ODAK KAYBI TUZAĞI: bu bileşen MODÜL DÜZEYİNDE duruyor, sayfa
 * fonksiyonunun içinde DEĞİL. İçeride tanımlansaydı her render'da yeni bir
 * bileşen kimliği oluşur, React <input>u söküp yeniden takar ve kullanıcı
 * her rakamdan sonra odağı kaybederdi (bu depoda ölçülmüş bir kusur).
 */
function KiloAlani({
  deger, ayarla,
}: { deger: string; ayarla: (v: string) => void }) {
  return (
    <div>
      <label
        htmlFor="nac-kilo"
        className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2"
      >
        Hasta ağırlığı
      </label>
      <div className="relative">
        <input
          id="nac-kilo"
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder="ör. 70"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-14 text-2xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
          kg
        </span>
      </div>
    </div>
  );
}

export default function NacInfuzyonSayfasi() {
  const [kilo, setKilo] = React.useState("");
  const [rejimKey, setRejimKey] = React.useState(REJIMLER[0].key);

  const rejim = REJIMLER.find((r) => r.key === rejimKey) ?? REJIMLER[0];
  const kiloNum = parseLocaleNumber(kilo);

  /**
   * MAKULLÜK KAPISI — bu depoda ölçülmüş bir kusur sınıfı: parseLocaleNumber
   * ayrıştıramadığını 0'a çeviriyor ve araçlar boş formda somut klinik değer
   * basıyordu. Doz hesaplayan bir araçta bu kabul edilemez.
   */
  const makul = kilo.trim() !== "" && kiloNum >= 1 && kiloNum <= 400;
  const kiloKullanilan = Math.min(kiloNum, KILO_TAVANI);
  const tavanUygulandi = makul && kiloNum > KILO_TAVANI;

  const satirlar = rejim.torbalar.map((t) => {
    const mg = kiloKullanilan * t.mgKg;
    return {
      ...t,
      mg: yuvarla(mg, 0),
      gram: yuvarla(mg / 1000, 2),
      hizMlSaat: yuvarla(t.hacimMl / t.saat, 1),
    };
  });

  const toplamMg = yuvarla(satirlar.reduce((s, r) => s + r.mg, 0), 0);
  const toplamSaat = rejim.torbalar.reduce((s, t) => s + t.saat, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="nac-infuzyon" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">💊</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                NAC İnfüzyonu
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              Parasetamol intoksikasyonu · IV N-asetilsistein
            </p>
          </div>
        </div>

        {/* KARAR UYARISI — aracın ne YAPMADIĞI en başta */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">⚠️</span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bu araç tedavi kararı vermez.</strong> NAC endikasyonu
            Rumack-Matthew nomogramı, alım zamanı ve klinik gidişle belirlenir.
            Burada yalnızca karar verildikten sonraki doz aritmetiği yapılır.
          </p>
        </div>

        {/* GİRDİ */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <KiloAlani deger={kilo} ayarla={setKilo} />

          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Rejim
            </span>
            <div className="flex flex-wrap gap-2">
              {REJIMLER.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  aria-pressed={rejimKey === r.key}
                  onClick={() => setRejimKey(r.key)}
                  className={`px-4 py-3 rounded-2xl border-2 text-left transition-all
                    ${rejimKey === r.key
                      ? "bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-900/30"}`}
                >
                  <span className="block text-[11px] font-black uppercase tracking-widest">{r.ad}</span>
                  <span className={`block text-[10px] font-bold mt-0.5 ${rejimKey === r.key ? "text-blue-200" : "text-slate-400"}`}>
                    {r.ozet}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SONUÇ */}
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-baseline justify-between mb-5">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">
              {rejim.ad}
            </span>
            <span className="text-[10px] font-bold text-blue-300">
              {makul ? `toplam ${toplamMg} mg · ${toplamSaat} saat` : "—"}
            </span>
          </div>

          {!makul ? (
            <p className="text-amber-300 text-sm font-bold py-6 text-center" role="status">
              Hasta ağırlığını girin (1–400 kg).
            </p>
          ) : (
            <div className="space-y-3">
              {satirlar.map((r) => (
                <div key={r.ad} className="bg-blue-950/50 rounded-2xl p-4 border border-blue-800">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest">
                      {r.ad}
                    </span>
                    <span className="text-[10px] font-bold text-blue-300">
                      {r.mgKg} mg/kg · {r.saat} saat
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-black text-white">{r.mg} mg</span>
                    <span className="text-sm font-bold text-blue-300">({r.gram} g)</span>
                  </div>
                  <p className="mt-2 text-[11px] text-blue-200">
                    {r.hacimMl} mL içinde · <strong className="text-white">{r.hizMlSaat} mL/saat</strong>
                  </p>
                  {r.not && (
                    <p className="mt-2 text-[10px] leading-relaxed text-blue-300/90">{r.not}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {tavanUygulandi && (
            <p className="mt-4 text-[11px] font-bold text-amber-300" role="status">
              Ağırlık {KILO_TAVANI} kg üzerinde: doz {KILO_TAVANI} kg üzerinden
              hesaplandı (protokol tavanı).
            </p>
          )}
        </div>

        {/* ALT BİLGİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">Kaynak:</strong> {rejim.kaynak}. Sulandırma
            hacimleri yetişkin protokolüne göredir; sıvı kısıtlı hastada ve
            çocukta hacimler kuruma göre uyarlanır.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hesaplanan dozları uygulamadan önce kendi kurumunuzun protokolüyle
              ve ilacın prospektüsüyle karşılaştırın. Anaflaktoid reaksiyon
              yükleme dozunda en sıktır; infüzyon hızının yavaşlatılması ve
              antihistaminik gereksinimi klinik karardır.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
