"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Genant yarı-kantitatif vertebral kırık derecesi — Genant HK ve ark., J Bone Miner Res 1993;8:1137–1148.
 *   Ön (A), orta (M), arka (P) yükseklikte azalma:  < %20 derece 0 · %20–25 derece 1 (hafif) · %25–40 derece 2 (orta) · > %40 derece 3 (şiddetli)
 *   Sınırdaki %25 ve %40 bir üst dereceye yazılmaz (orijinal: "approximately 20–25%", "25–40%", "> 40%").
 * Bu araç yöntemin ölçüme dayalı karşılığını verir: kayıp = 1 − (en kısa yükseklik / referans). Referans, verilmişse
 * komşu sağlam vertebranın arka yüksekliği, verilmemişse aynı vertebranın en uzun yüksekliği (çökme tipinde bu kaybı göremez).
 * Şekil: ön kısa → kama · orta kısa → bikonkav · üçü birlikte kısa → çökme (crush).
 */
const DERECE = [
  { d: 0, ad: "Derece 0 — kırık yok", r: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  { d: 1, ad: "Derece 1 — hafif", r: "border-amber-200 bg-amber-50 text-amber-900" },
  { d: 2, ad: "Derece 2 — orta", r: "border-orange-200 bg-orange-50 text-orange-900" },
  { d: 3, ad: "Derece 3 — şiddetli", r: "border-rose-200 bg-rose-50 text-rose-900" },
] as const;
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const yuzde = (x: number) => "%" + (x * 100).toFixed(1).replace(".", ",");

export default function GenantVertebraPage() {
  const [on, setOn] = React.useState("");
  const [orta, setOrta] = React.useState("");
  const [arka, setArka] = React.useState("");
  const [komsu, setKomsu] = React.useState("");
  const n = parseLocaleNumber;
  const ok = (s: string) => sayiGirildiMi(s) && n(s) >= 2 && n(s) <= 60;
  const alanlar = [["ön", on], ["orta", orta], ["arka", arka]] as const;
  const hatali = [...alanlar, ["komşu vertebra", komsu] as const]
    .filter(([, d]) => sayiGirildiMi(d) && !ok(d))
    .map(([a]) => `${a} yükseklik 2–60 mm olmalı`);
  const tamam = alanlar.every(([, d]) => ok(d));
  const kOk = ok(komsu);

  let sonuc: { kayip: number; derece: (typeof DERECE)[number]; sekil: string; ref: string } | null = null;
  if (tamam) {
    const A = n(on), M = n(orta), P = n(arka);
    const enUzun = Math.max(A, M, P);
    const ref = kOk ? Math.max(n(komsu), enUzun) : enUzun;
    const enKisa = Math.min(A, M, P);
    // 1 − 20/25 kayan noktada 0,19999… çıkıyor; tam %20 derece 0 sayılmasın diye dört ondalığa yuvarlanır.
    const kayip = Math.max(0, Math.round((1 - enKisa / ref) * 1e4) / 1e4);
    const d = kayip < 0.2 ? 0 : kayip <= 0.25 ? 1 : kayip <= 0.4 ? 2 : 3;
    const kisa = (h: number) => Math.round((1 - h / ref) * 1e4) / 1e4 >= 0.2;
    const sekil =
      d === 0 ? "—" : kisa(A) && kisa(M) && kisa(P) ? "çökme (crush)" : enKisa === A ? "kama (ön yükseklik kayıplı)" : enKisa === M ? "bikonkav (orta yükseklik kayıplı)" : "arka yükseklik kayıplı (kama tersi — kırık dışı nedenleri düşünün)";
    sonuc = { kayip, derece: DERECE[d], sekil, ref: kOk ? "komşu sağlam vertebra" : "aynı vertebranın en uzun yüksekliği" };
  }

  const eksik = alanlar.filter(([, d]) => !sayiGirildiMi(d)).map(([a]) => `${a} yükseklik`);

  return (
    <OlcekKabugu
      slug="genant-vertebra"
      ikon="🩻"
      baslik="Genant Vertebral Kırık Derecesi"
      altBaslik="Yarı-Kantitatif Yöntem · Yükseklik Kaybı · Derece 0–3"
      paylasim={{ kayip: sonuc ? Math.round(sonuc.kayip * 100) : null }}
      not={
        <p>
          Genant yöntemi görsel (yarı-kantitatif) bir derecelendirmedir; bu araç ölçülen yüksekliklerden kaybı hesaplar. Yükseklik kaybı tek başına kırık
          demek değildir: Schmorl nodülü, dejeneratif değişiklik ve gelişimsel kısa vertebra ayırt edilmelidir. Klinik ya da morfometrik vertebra kırığı
          KMY'den bağımsız olarak yüksek kırık riskidir; çoklu vertebra kırığı TEMD'ye göre çok yüksek risktir. Genant HK ve ark., J Bone Miner Res
          1993;8:1137–1148.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        {([
          ["Ön yükseklik (mm)", on, setOn],
          ["Orta yükseklik (mm)", orta, setOrta],
          ["Arka yükseklik (mm)", arka, setArka],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
        <label className="flex flex-col gap-2 min-w-0 sm:col-span-3">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Komşu sağlam vertebranın arka yüksekliği (mm) — isteğe bağlı, çökme tipi için</span>
          <input type="text" inputMode="decimal" value={komsu} onChange={(e) => setKomsu(e.target.value)} className={girdi} />
        </label>
      </div>

      {hatali.length > 0 && (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{hatali.join(" · ")}</p>
      )}

      <SonucDuyuru metin={sonuc ? `${sonuc.derece.ad} — yükseklik kaybı ${yuzde(sonuc.kayip)}` : null} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${sonuc.derece.r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">En büyük yükseklik kaybı {yuzde(sonuc.kayip)}</p>
          <p className="text-2xl font-black">{sonuc.derece.ad}</p>
          <p className="text-[12px] font-bold">Şekil: {sonuc.sekil} · Referans: {sonuc.ref}</p>
        </div>
      ) : (
        eksik.length > 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
          </div>
        )
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
        {[["Derece 0", "< %20"], ["Derece 1", "%20–25"], ["Derece 2", "%25–40"], ["Derece 3", "> %40"]].map(([a, b], i) => (
          <div key={a} className={`rounded-xl p-2 font-black ${sonuc?.derece.d === i ? "bg-blue-900 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
            <p>{a}</p>
            <p className="font-bold">{b}</p>
          </div>
        ))}
      </div>
    </OlcekKabugu>
  );
}
