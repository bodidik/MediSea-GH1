"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * OPİOİD EŞDEĞER DOZ — günlük oral morfin eşdeğeri (OME) ve opioid değişimi.
 *
 * Katsayılar (oral morfin mg'ı başına): CDC 2022 opioid reçeteleme kılavuzu
 * dönüşüm tablosu (Dowell ve ark., MMWR 2022) — kodein 0,15 · hidromorfon 5 ·
 * oksikodon 1,5 · tapentadol 0,4 · tramadol 0,2 · transdermal fentanil
 * µg/saat × 2,4. Parenteral morfin için oral:parenteral 3:1 kullanılır
 * (palyatif kaynaklarda 2:1–3:1 aralığı var; ekranda yazılı).
 *
 * BİLEREK YOK: metadon (doza bağlı doğrusal olmayan dönüşüm, uzun ve değişken
 * yarı ömür) ve buprenorfin. Bu ajanlarla dönüşüm uzman gerektirir.
 *
 * Kapı: her satırda opioid SEÇİLMİŞ ve doz GERÇEKTEN sayı (boş ≠ 0, "abc" ≠ 0)
 * olmadan sonuç basılmaz; makul üst sınırı aşan doz sonuç değil uyarı üretir.
 * Hedef doz ancak hedef opioid ve azaltma oranı SEÇİLİNCE çıkar.
 */
type Opioid = { id: string; ad: string; birim: "mg/gün" | "µg/saat"; katsayi: number; ust: number };

const OPIOIDLER: ReadonlyArray<Opioid> = [
  { id: "morfin-oral", ad: "Morfin (oral)", birim: "mg/gün", katsayi: 1, ust: 3000 },
  { id: "morfin-parenteral", ad: "Morfin (IV / SC)", birim: "mg/gün", katsayi: 3, ust: 1000 },
  { id: "oksikodon", ad: "Oksikodon (oral)", birim: "mg/gün", katsayi: 1.5, ust: 2000 },
  { id: "hidromorfon", ad: "Hidromorfon (oral)", birim: "mg/gün", katsayi: 5, ust: 600 },
  { id: "tapentadol", ad: "Tapentadol (oral)", birim: "mg/gün", katsayi: 0.4, ust: 500 },
  { id: "tramadol", ad: "Tramadol (oral)", birim: "mg/gün", katsayi: 0.2, ust: 400 },
  { id: "kodein", ad: "Kodein (oral)", birim: "mg/gün", katsayi: 0.15, ust: 360 },
  { id: "fentanil-td", ad: "Fentanil (transdermal bant)", birim: "µg/saat", katsayi: 2.4, ust: 600 },
];
const bul = (id: string | null) => OPIOIDLER.find((o) => o.id === id) ?? null;

const AZALTMA = [
  { id: "25", oran: 0.25, etiket: "%25" },
  { id: "33", oran: 0.33, etiket: "%33" },
  { id: "50", oran: 0.5, etiket: "%50" },
];

const fmt = (n: number, basamak = 1) =>
  n.toLocaleString("tr-TR", { maximumFractionDigits: basamak, minimumFractionDigits: 0 });

type Satir = { opioid: string | null; doz: string };

export default function OpioidDonusumPage() {
  const [satirlar, setSatirlar] = React.useState<Satir[]>([{ opioid: null, doz: "" }]);
  const [hedef, setHedef] = React.useState<string | null>(null);
  const [azaltma, setAzaltma] = React.useState<string | null>(null);

  const guncelle = (i: number, p: Partial<Satir>) =>
    setSatirlar((s) => s.map((x, k) => (k === i ? { ...x, ...p } : x)));

  // Her satırın durumu: boş · eksik · geçersiz · aşırı · tamam
  const durumlar = satirlar.map((s) => {
    const o = bul(s.opioid);
    const dozVar = s.doz.trim() !== "";
    if (!o && !dozVar) return { tur: "bos" as const };
    if (!o) return { tur: "hata" as const, mesaj: "Opioid seçilmedi." };
    if (!dozVar) return { tur: "eksik" as const };
    if (!sayiGirildiMi(s.doz)) return { tur: "hata" as const, mesaj: "Doz sayı olarak okunamadı." };
    const d = parseLocaleNumber(s.doz);
    if (d <= 0) return { tur: "hata" as const, mesaj: "Doz sıfırdan büyük olmalı." };
    if (d > o.ust) return { tur: "hata" as const, mesaj: `${fmt(d)} ${o.birim} bu ajan için makul üst sınırın (${fmt(o.ust)}) üzerinde — doz ve birimi kontrol edin.` };
    return { tur: "tamam" as const, ome: d * o.katsayi };
  });

  const doluSatir = durumlar.filter((d) => d.tur !== "bos");
  const hatalar = durumlar
    .map((d, i) => (d.tur === "hata" ? `${i + 1}. satır: ${d.mesaj}` : null))
    .filter(Boolean) as string[];
  const hepsiTamam = doluSatir.length > 0 && doluSatir.every((d) => d.tur === "tamam");
  const ome = hepsiTamam ? doluSatir.reduce((t, d) => t + (d.tur === "tamam" ? d.ome : 0), 0) : null;

  const h = bul(hedef);
  const a = AZALTMA.find((x) => x.id === azaltma) ?? null;
  const hedefDoz = ome !== null && h && a ? (ome * (1 - a.oran)) / h.katsayi : null;
  // Kurtarma dozu: günlük dozun ~1/6'sı (oral morfin eşdeğeri üzerinden); transdermal
  // fentanilde kurtarma oral/SC kısa etkili opioidle verilir → OME/6 oral morfin olarak.
  const kurtarmaOme = ome !== null && a ? (ome * (1 - a.oran)) / 6 : null;
  const kurtarmaMetni =
    hedefDoz === null || kurtarmaOme === null || !h
      ? null
      : h.id === "fentanil-td"
        ? `≈ ${fmt(kurtarmaOme)} mg oral morfin (ya da eşdeğeri) — gerektiğinde, kısa etkili`
        : h.birim === "mg/gün"
          ? `≈ ${fmt(hedefDoz / 6)} mg ${h.ad.toLowerCase()} — gerektiğinde, kısa etkili form`
          : null;

  const duyuru =
    hedefDoz !== null && h
      ? `Günlük oral morfin eşdeğeri ${fmt(ome as number, 0)} mg; hedef ${h.ad} yaklaşık ${fmt(hedefDoz)} ${h.birim}`
      : ome !== null
        ? `Günlük oral morfin eşdeğeri ${fmt(ome, 0)} mg`
        : null;

  return (
    <OlcekKabugu
      slug="opioid-donusum"
      ikon="💊"
      baslik="Opioid Eşdeğer Doz"
      altBaslik="Günlük Oral Morfin Eşdeğeri (OME) ve Opioid Değişimi"
      paylasim={{
        s: satirlar.map((s) => `${s.opioid ?? ""}:${s.doz}`).join("|"),
        hedef,
        azaltma,
      }}
      not={
        <>
          <p>
            Eşdeğer dozlar yaklaşıktır ve bireyler arası farklılık büyüktür. Opioid DEĞİŞTİRİLİRKEN eksik çapraz tolerans
            nedeniyle hesaplanan eşdeğerden %25–50 azaltılarak başlanır; yaşlı, kırılgan, böbrek/karaciğer yetersizliği olan
            hastada daha fazla azaltma ve daha yakın izlem gerekir. Doz titrasyonu klinik yanıta göre yapılır.
          </p>
          <p>
            Metadon ve buprenorfin bu hesaplamaya bilerek dahil edilmemiştir (doğrusal olmayan dönüşüm). Parenteral morfin
            için oral:parenteral 3:1 kullanıldı; bazı palyatif kaynaklar 2:1 önerir. Transdermal fentanil bandı başlanırken
            önceki opioid bandın etkisi başlayana kadar (~12 saat) sürdürülür.
          </p>
          <p>Katsayılar: Dowell D ve ark., CDC Clinical Practice Guideline for Prescribing Opioids for Pain, MMWR 2022.</p>
        </>
      }
    >
      <section className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-4" aria-labelledby="mevcut-baslik">
        <h2 id="mevcut-baslik" className="text-[12px] font-black text-blue-900 uppercase tracking-widest" style={{ marginTop: 0, fontFamily: "inherit" }}>
          1. Şu anki opioid(ler) — günlük toplam doz
        </h2>
        {satirlar.map((s, i) => {
          const o = bul(s.opioid);
          return (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_auto] gap-2 items-end">
              <label className="block">
                <span className="text-[11px] font-bold text-slate-700">Opioid {satirlar.length > 1 ? i + 1 : ""}</span>
                <select
                  value={s.opioid ?? ""}
                  onChange={(e) => guncelle(i, { opioid: e.target.value || null })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm min-h-[44px]"
                >
                  <option value="">Seçin…</option>
                  {OPIOIDLER.map((x) => (
                    <option key={x.id} value={x.id}>{x.ad}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-slate-700">Günlük doz ({o?.birim ?? "mg/gün"})</span>
                <input
                  inputMode="decimal"
                  value={s.doz}
                  onChange={(e) => guncelle(i, { doz: e.target.value })}
                  placeholder={o?.birim === "µg/saat" ? "ör. 25" : "ör. 60"}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm min-h-[44px]"
                />
              </label>
              {satirlar.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSatirlar((x) => x.filter((_, k) => k !== i))}
                  className="text-[12px] font-bold text-rose-700 underline min-h-[44px] px-2"
                >
                  Satırı sil
                </button>
              )}
            </div>
          );
        })}
        {satirlar.length < 3 && (
          <button
            type="button"
            onClick={() => setSatirlar((x) => [...x, { opioid: null, doz: "" }])}
            className="text-[12px] font-bold text-blue-800 underline min-h-[44px]"
          >
            + Başka bir opioid ekle (en çok 3)
          </button>
        )}
        <BinlikUyari girdiler={satirlar.map((s, i) => ({ ad: `${i + 1}. satır dozu`, ham: s.doz }))} />
        {hatalar.length > 0 && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800 space-y-1">
            {hatalar.map((h) => <p key={h}>{h}</p>)}
          </div>
        )}
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-4" aria-labelledby="hedef-baslik">
        <h2 id="hedef-baslik" className="text-[12px] font-black text-blue-900 uppercase tracking-widest" style={{ marginTop: 0, fontFamily: "inherit" }}>
          2. Geçilecek opioid ve çapraz tolerans azaltması
        </h2>
        <label className="block">
          <span className="text-[11px] font-bold text-slate-700">Hedef opioid</span>
          <select
            value={hedef ?? ""}
            onChange={(e) => setHedef(e.target.value || null)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm min-h-[44px]"
          >
            <option value="">Seçin…</option>
            {OPIOIDLER.map((x) => (
              <option key={x.id} value={x.id}>{x.ad}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-[11px] font-bold text-slate-700">Azaltma (eksik çapraz tolerans)</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {AZALTMA.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={azaltma === x.id}
                onClick={() => setAzaltma((s) => (s === x.id ? null : x.id))}
                className={`rounded-xl border px-4 py-2 text-sm font-bold min-h-[44px] ${azaltma === x.id ? "border-blue-800 bg-blue-800 text-white" : "border-slate-300 bg-white text-blue-900"}`}
              >
                {x.etiket}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <SonucDuyuru metin={duyuru} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl border-t-4 border-amber-400">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1">GÜNLÜK ORAL MORFİN EŞDEĞERİ</span>
          {ome !== null ? (
            <p className="text-4xl font-black text-white">{fmt(ome, 0)} <span className="text-base text-blue-200">mg/gün</span></p>
          ) : (
            <p className="text-sm text-blue-100">Opioid ve günlük dozu girin.</p>
          )}
        </div>
        <div className="rounded-[2rem] p-6 border-2 border-dashed border-amber-300 bg-amber-50">
          <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest block mb-1">HEDEF DOZ</span>
          {hedefDoz !== null && h && a ? (
            <>
              <p className="text-3xl font-black text-amber-900">
                {fmt(hedefDoz)} <span className="text-base">{h.birim}</span>
              </p>
              <p className="text-[12px] text-slate-700 mt-1">{h.ad} · eşdeğerden {a.etiket} azaltılmış</p>
              {h.id === "fentanil-td" && (
                <p className="text-[12px] text-slate-700 mt-1">Bant güçleri 12 · 25 · 50 · 75 · 100 µg/saat — hesaplanan değerin altındaki en yakın güçle başlayın.</p>
              )}
              {kurtarmaMetni && <p className="text-[12px] text-slate-800 mt-2"><b>Kurtarma dozu:</b> {kurtarmaMetni}</p>}
            </>
          ) : (
            <p className="text-sm text-slate-700">
              {ome === null ? "Önce şu anki opioidi girin." : "Hedef opioidi ve azaltma oranını seçin."}
            </p>
          )}
        </div>
      </div>
    </OlcekKabugu>
  );
}
