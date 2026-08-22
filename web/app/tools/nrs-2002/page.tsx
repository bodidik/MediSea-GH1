"use client";

import React, { useState } from "react";
import ToolShare from "../components/ToolShare";
import ToolTopNav from "../components/ToolTopNav";

/**
 * MediSea Donanması - Nütrisyon Üssü
 * NRS-2002 Beslenme Riski Taraması
 *
 * ─────────────────────────────────────────────────────────────────────────
 * AŞAMA 1 BİR DÖNEM ÖLÜ DENETİMDİ. Dört soru ekranda duruyor, basılıyor,
 * kendi vurgusu değişiyordu ama hesap onları YOK SAYIYORDU — kullanıcı bir
 * seçim yaptığını sanıyor, hiçbir sayı oynamıyordu. Kodun kendi yorumu
 * ("sadece biri Evet ise anlamlıdır") bunu biliyordu ama uygulanmıyordu.
 *
 * NRS-2002'de aşama 1 bir SÜZGEÇTİR: dördüne birden HAYIR denen hastada ana
 * tarama yapılmaz, haftalık tekrar gerekir. Herhangi birine EVET denince ana
 * taramaya geçilir.
 *
 * İKİNCİ KUSUR — BOŞ FORMDAN KLİNİK ETİKET. Hiç dokunulmamış sayfa
 * "SKOR 0 · RİSK DÜŞÜK - HAFTALIK TAKİP" basıyordu. Yatıştırıcı bir etiket,
 * hiçbir veri girilmeden.
 *
 * MEŞRU SIFIR AYRILDI. Bu araçta 0 gerçek bir cevap: "hepsine hayır" da
 * "beslenme durumu normal" de meşru. O yüzden ayrım DEĞERE değil, CEVAP
 * VERİLİP VERİLMEDİĞİNE bakıyor: aşama 1 üç durumlu (evet/hayır/boş), aşama 2
 * seçim kutuları boş bir seçenekle başlıyor.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Cevap = "evet" | "hayir" | null;

const ON_TARAMA = [
  { id: "bmi", label: "VKİ < 20.5 kg/m² mi?" },
  { id: "weightLoss", label: "Son 3 ayda kilo kaybı var mı?" },
  { id: "intake", label: "Geçen hafta alımında azalma var mı?" },
  { id: "severeIll", label: "Hasta ağır derecede hasta mı? (YBÜ vb.)" },
] as const;

type OnTaramaId = (typeof ON_TARAMA)[number]["id"];

const BESLENME = [
  { p: 0, label: "Normal beslenme durumu (0 puan)" },
  { p: 1, label: "Hafif: >%5 kilo kaybı (3 ay) veya %50-75 alım (1 puan)" },
  { p: 2, label: "Orta: >%5 kilo kaybı (2 ay) veya %25-50 alım (2 puan)" },
  { p: 3, label: "Ağır: >%5 kilo kaybı (1 ay) veya %0-25 alım (3 puan)" },
];

const SIDDET = [
  { p: 0, label: "Normal besin gereksinimi (0 puan)" },
  { p: 1, label: "Hafif: kalça kırığı, kronik komplikasyonlar (1 puan)" },
  { p: 2, label: "Orta: majör cerrahi, inme, ağır pnömoni (2 puan)" },
  { p: 3, label: "Ağır: kafa travması, KİT, yoğun bakım hastası (3 puan)" },
];

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanan bileşen her render'da yeni kimlik
 * alır ve React kontrolü söküp yeniden takar (bu depoda 14 araçta ölçülmüş,
 * düzeltilmiş kusur).
 */
function EvetHayir({
  id,
  soru,
  deger,
  ayarla,
}: {
  id: string;
  soru: string;
  deger: Cevap;
  ayarla: (v: Cevap) => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center gap-3">
      <span id={`${id}-etiket`} className="text-sm font-bold text-blue-900 flex-1">
        {soru}
      </span>
      <div className="flex gap-2" role="group" aria-labelledby={`${id}-etiket`}>
        {(["evet", "hayir"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={deger === v}
            onClick={() => ayarla(deger === v ? null : v)}
            className={`px-5 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all
              ${
                deger === v
                  ? v === "evet"
                    ? "bg-blue-900 border-blue-900 text-white"
                    : "bg-slate-700 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-900/30"
              }`}
          >
            {v === "evet" ? "Evet" : "Hayır"}
          </button>
        ))}
      </div>
    </div>
  );
}

function PuanSecimi({
  id,
  etiket,
  secenekler,
  deger,
  ayarla,
}: {
  id: string;
  etiket: string;
  secenekler: { p: number; label: string }[];
  deger: number | null;
  ayarla: (v: number | null) => void;
}) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">
        {etiket}
      </label>
      <select
        id={id}
        value={deger === null ? "" : String(deger)}
        onChange={(e) => ayarla(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-sm outline-none ring-2 ring-slate-100 focus:ring-amber-400 text-blue-900"
      >
        {/* Boş seçenek ŞART: yoksa "normal" cevabı ile hiç dokunulmamış kutu
            ayırt edilemez ve araç boş formdan klinik etiket üretir. */}
        <option value="">— seçin —</option>
        {secenekler.map((s) => (
          <option key={s.p} value={String(s.p)}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function NRS2002Page() {
  const [onTarama, setOnTarama] = useState<Record<OnTaramaId, Cevap>>({
    bmi: null,
    weightLoss: null,
    intake: null,
    severeIll: null,
  });
  const [beslenme, setBeslenme] = useState<number | null>(null);
  const [siddet, setSiddet] = useState<number | null>(null);
  const [yasli, setYasli] = useState<Cevap>(null);

  const onCevaplar = ON_TARAMA.map((q) => onTarama[q.id]);
  const onTamam = onCevaplar.every((c) => c !== null);
  const onEvetVar = onCevaplar.some((c) => c === "evet");
  const anaTaramaGerekli = onTamam && onEvetVar;

  const anaTamam = beslenme !== null && siddet !== null && yasli !== null;
  const toplam = anaTamam ? beslenme! + siddet! + (yasli === "evet" ? 1 : 0) : null;

  /** Aşama 1 tamamlanmadan hiçbir sınıflama basılmaz. */
  const durum: "eksik-on" | "on-negatif" | "eksik-ana" | "sonuc" = !onTamam
    ? "eksik-on"
    : !onEvetVar
      ? "on-negatif"
      : !anaTamam
        ? "eksik-ana"
        : "sonuc";

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="nrs-2002" />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🍏</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">
                ☀️
              </span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                NRS-2002
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
              Nutritional Risk Screening — iki aşamalı
            </p>
          </div>
        </div>

        {/* AŞAMA 1 */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest">Aşama 1: Ön Tarama</h2>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-2">
              Bu aşama bir süzgeçtir: dördüne birden <strong>Hayır</strong> denirse
              ana tarama yapılmaz, hasta haftalık olarak yeniden taranır. Herhangi
              birine <strong>Evet</strong> denince ana taramaya geçilir.
            </p>
          </div>
          <div className="grid gap-2">
            {ON_TARAMA.map((q) => (
              <EvetHayir
                key={q.id}
                id={`on-${q.id}`}
                soru={q.label}
                deger={onTarama[q.id]}
                ayarla={(v) => setOnTarama((p) => ({ ...p, [q.id]: v }))}
              />
            ))}
          </div>
          {!onTamam && (
            <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3" role="status">
              {onCevaplar.filter((c) => c === null).length} soru yanıtlanmadı.
            </p>
          )}
        </div>

        {/* ÖN TARAMA NEGATİFSE ANA TARAMA GÖSTERİLMEZ */}
        {durum === "on-negatif" ? (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-[2rem] p-6" role="status">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-2">
              Ön tarama negatif
            </span>
            <p className="text-xl font-black text-emerald-900 italic uppercase">
              Ana tarama gerekmiyor
            </p>
            <p className="text-[12px] text-emerald-900 leading-relaxed mt-2">
              Dört sorunun dördüne de &ldquo;Hayır&rdquo; yanıtlandı. NRS-2002&apos;de bu
              durumda ana tarama yapılmaz; hasta <strong>haftalık aralıklarla
              yeniden taranır</strong>. Büyük bir ameliyat planlanıyorsa koruyucu bir
              beslenme planı yine de değerlendirilir.
            </p>
          </div>
        ) : (
          <>
            {/* AŞAMA 2 */}
            <div
              className={`rounded-[2rem] border p-6 shadow-sm space-y-6 ${
                anaTaramaGerekli
                  ? "bg-white border-slate-200"
                  : "bg-slate-50 border-dashed border-slate-300"
              }`}
            >
              <div className="border-b pb-2">
                <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest">
                  Aşama 2: Ana Tarama
                </h2>
                {!onTamam && (
                  <p className="text-[11px] text-slate-600 mt-2">
                    Ana taramanın gerekip gerekmediğini aşama 1 belirler; önce onu
                    tamamlayın.
                  </p>
                )}
              </div>

              <PuanSecimi
                id="nrs-beslenme"
                etiket="Beslenme durumunda bozulma"
                secenekler={BESLENME}
                deger={beslenme}
                ayarla={setBeslenme}
              />
              <PuanSecimi
                id="nrs-siddet"
                etiket="Hastalık şiddeti (besin gereksiniminde artış)"
                secenekler={SIDDET}
                deger={siddet}
                ayarla={setSiddet}
              />
              <EvetHayir
                id="nrs-yas"
                soru="Hasta 70 yaşında ya da daha büyük mü? (+1 puan)"
                deger={yasli}
                ayarla={setYasli}
              />
            </div>

            {/* SONUÇ */}
            {durum === "sonuc" ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 bg-blue-950 rounded-[2rem] p-6 text-center border-t-4 border-amber-400 shadow-xl">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                    Skor
                  </span>
                  <div className="text-5xl font-black text-white">{toplam}</div>
                  <p className="text-[10px] text-blue-300 mt-1">
                    {beslenme} + {siddet} + {yasli === "evet" ? 1 : 0}
                  </p>
                </div>
                <div
                  className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col items-center justify-center border-2 border-dashed text-center
                    ${toplam! >= 3 ? "bg-rose-50 border-rose-300 text-rose-800" : "bg-emerald-50 border-emerald-300 text-emerald-800"}`}
                >
                  <p className="text-xl font-black uppercase italic">
                    {toplam! >= 3 ? "Nütrisyonel risk var" : "Risk düşük — haftalık takip"}
                  </p>
                  <p className="text-[12px] leading-relaxed mt-2">
                    {toplam! >= 3
                      ? "Skor ≥ 3: beslenme planı başlatılır."
                      : "Skor < 3: haftalık yeniden tarama yapılır. Büyük bir ameliyat planlanıyorsa koruyucu beslenme planı değerlendirilir."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm font-bold text-slate-600" role="status">
                  {durum === "eksik-on"
                    ? "Önce aşama 1'deki dört soruyu yanıtlayın — ana taramanın gerekip gerekmediğini o belirler."
                    : "Aşama 2'deki üç alanın da yanıtlanması gerekiyor. Boş bırakılan alan, sıfır puan anlamına GELMEZ."}
                </p>
              </div>
            )}
          </>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ n: beslenme ?? 0, s: siddet ?? 0, a: yasli === "evet" ? 1 : 0 }} />
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Boş alan sıfır puan değildir.</strong> Bu
            araçta 0 meşru bir cevaptır (&ldquo;beslenme durumu normal&rdquo;,
            &ldquo;hepsine hayır&rdquo;) — bu yüzden hiçbir alan varsayılan olarak
            seçili gelmez ve eksik alan varken sınıflama basılmaz. Skor ≥ 3 ise
            beslenme planı başlatılır; risk saptanmazsa haftalık tarama tekrarlanır.
          </p>
          {/* Klinik uyarı satırı 131 aracın 130'unda vardı, yalnızca burada
              eksikti. Metin kabuğun ortak metni; araca özgü klinik iddia
              eklenmedi. */}
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Bu tarama eğitim ve referans amaçlıdır; sonucu hastanın klinik seyri ve
              yerel beslenme protokolleriyle birlikte değerlendirin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
