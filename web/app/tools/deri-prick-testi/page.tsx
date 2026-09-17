"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Deri prick testi değerlendirmesi — EAACI/GA²LEN (Heinzerling ve ark., Clin Transl Allergy 2013).
 *
 * Ölçü papülün ORTALAMA çapı: (en uzun çap + ona dik çap) / 2, mm.
 * Kurallar:
 *   negatif kontrol ≥ 3 mm → dermografizm; test YORUMLANAMAZ
 *   pozitif kontrol (histamin) < 3 mm → antihistaminik etkisi olası; NEGATİF sonuçlar güvenilmez
 *   allerjen papülü − negatif kontrol ≥ 3 mm → pozitif
 *
 * "Sınırda" diye standart bir kategori YOK; araç uydurmuyor. 3 mm'nin altındaki net
 * papül negatif sayılıyor ve değeri ekranda duruyor.
 */
const ESIK = 3;
const MM_UST = 50;

type Satir = { anahtar: number; ad: string; mm: string };

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-900 outline-none font-bold min-w-0";
const tr = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

function mmOku(ham: string): number | null {
  const n = parseLocaleNumber(ham);
  // Meşru sıfır: papül yok = 0 mm.
  return sayiGirildiMi(ham) && n >= 0 && n <= MM_UST ? n : null;
}

export default function DeriPrickTestiPage() {
  const sayac = React.useRef(3);
  const [negatif, setNegatif] = React.useState("");
  const [histamin, setHistamin] = React.useState("");
  const [satirlar, setSatirlar] = React.useState<Satir[]>([
    { anahtar: 1, ad: "", mm: "" },
    { anahtar: 2, ad: "", mm: "" },
  ]);
  const guncelle = (anahtar: number, alan: "ad" | "mm", v: string) =>
    setSatirlar((s) => s.map((x) => (x.anahtar === anahtar ? { ...x, [alan]: v } : x)));

  const neg = mmOku(negatif);
  const his = mmOku(histamin);
  const kontrolEksik = neg === null || his === null;
  const dermografizm = neg !== null && neg >= ESIK;
  const histaminZayif = his !== null && his < ESIK;

  const cozum = satirlar.map((s) => {
    const mm = mmOku(s.mm);
    // Çıkarma 0,1 mm çözünürlüğe yuvarlanır: 3,3 − 0,3 kayan noktada 2,999… verir ve
    // tam eşikteki papülü NEGATİF sayardı.
    const net = mm !== null && neg !== null ? Math.round((mm - neg) * 10) / 10 : null;
    const pozitif = net !== null ? net >= ESIK : null;
    return { ...s, mm, net, pozitif, hatali: s.mm.trim() !== "" && mm === null };
  });
  const olculen = cozum.filter((c) => c.net !== null);
  const pozitifler = olculen.filter((c) => c.pozitif);

  let durum: { metin: string; ton: "rose" | "amber" | "emerald" | "slate" } | null = null;
  if (kontrolEksik) durum = null;
  else if (dermografizm) durum = { metin: "Yorumlanamaz — negatif kontrol ≥ 3 mm (dermografizm)", ton: "rose" };
  else if (olculen.length === 0) durum = null;
  else if (histaminZayif)
    durum = {
      metin: `Pozitif ${pozitifler.length} / ${olculen.length} — histamin < 3 mm: negatif sonuçlar güvenilmez`,
      ton: "amber",
    };
  else durum = { metin: `Pozitif ${pozitifler.length} / ${olculen.length} allerjen`, ton: pozitifler.length ? "rose" : "emerald" };

  const TON = {
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    slate: "border-slate-200 bg-white text-slate-700",
  };

  return (
    <OlcekKabugu
      slug="deri-prick-testi"
      ikon="💉"
      baslik="Deri Prick Testi"
      altBaslik="Papül Çapı · Kontrollerle Değerlendirme · EAACI"
      paylasim={{ allerjen: olculen.length, pozitif: pozitifler.length }}
      not={
        <>
          <p>
            Okuma 15–20 dakikada yapılır. Papül çapı = (en uzun çap + ona dik çap) / 2; psödopodlar ölçüme katılmaz. Antihistaminikler testten önce
            kesilmelidir (çoğu için ≥ 5–7 gün); trisiklik antidepresanlar ve yüksek doz sistemik steroid de yanıtı baskılar.
          </p>
          <p>
            <strong>Pozitif test duyarlanmayı gösterir, klinik allerjiyi değil</strong> — öyküyle birlikte yorumlanır. Heinzerling L ve ark., Clin Transl Allergy 2013.
          </p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-3">
        <p className="text-[12px] font-black text-blue-900">Kontroller (mm)</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Negatif kontrol (serum fizyolojik)</span>
            <input type="text" inputMode="decimal" value={negatif} onChange={(e) => setNegatif(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pozitif kontrol (histamin)</span>
            <input type="text" inputMode="decimal" value={histamin} onChange={(e) => setHistamin(e.target.value)} className={girdi} />
          </label>
        </div>
        {(negatif.trim() !== "" && neg === null) || (histamin.trim() !== "" && his === null) ? (
          <p role="alert" className="text-[11px] font-bold text-rose-800">Kontrol değerleri 0–{MM_UST} mm arasında olmalı.</p>
        ) : null}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-3">
        <p className="text-[12px] font-black text-blue-900">Allerjenler — ortalama papül çapı (mm)</p>
        {cozum.map((c, i) => (
          <div key={c.anahtar} className="grid grid-cols-[minmax(0,1fr)_6rem] sm:grid-cols-[minmax(0,1fr)_6rem_11rem_auto] gap-2 items-end border-b border-slate-100 pb-3 last:border-0">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Allerjen {i + 1}</span>
              <input type="text" value={c.ad} onChange={(e) => guncelle(c.anahtar, "ad", e.target.value)} placeholder="ör. D. pteronyssinus" className={girdi} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">mm</span>
              <input type="text" inputMode="decimal" value={c.mm} onChange={(e) => guncelle(c.anahtar, "mm", e.target.value)} className={girdi} />
            </label>
            <div className="min-h-[44px] flex items-center">
              {c.hatali ? (
                <span className="text-[11px] font-bold text-rose-800">0–{MM_UST} mm arası</span>
              ) : c.net !== null && !dermografizm ? (
                <span className={`rounded-lg px-2 py-1.5 text-[11px] font-black ${c.pozitif ? "bg-rose-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {c.pozitif ? "Pozitif" : histaminZayif ? "Negatif?" : "Negatif"} · net {tr(c.net)} mm
                </span>
              ) : c.mm !== null && neg === null ? (
                <span className="text-[11px] font-bold text-slate-600">Negatif kontrolü girin</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSatirlar((s) => s.filter((x) => x.anahtar !== c.anahtar))}
              disabled={satirlar.length === 1}
              aria-label={`Allerjen ${i + 1} satırını sil`}
              className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 text-[11px] font-black text-slate-700 hover:border-rose-300 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              Sil
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSatirlar((s) => [...s, { anahtar: sayac.current++, ad: "", mm: "" }])}
          disabled={satirlar.length >= 20}
          className="w-full min-h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-[12px] font-black text-blue-900 hover:border-blue-300 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          + Allerjen ekle
        </button>
      </div>

      <SonucDuyuru metin={durum ? durum.metin : null} />
      {durum ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${TON[durum.ton]}`}>
          <p className="text-lg font-black">{durum.metin}</p>
          {!dermografizm && pozitifler.length > 0 && (
            <p className="text-[12px] font-bold">
              Pozitif: {pozitifler.map((p, i) => `${p.ad.trim() || `Allerjen ${satirlar.findIndex((s) => s.anahtar === p.anahtar) + 1 || i + 1}`} (${tr(p.net!)} mm)`).join(" · ")}
            </p>
          )}
          <p className="text-[11px] font-bold">Kural: allerjen papülü − negatif kontrol ≥ {ESIK} mm → pozitif · histamin ≥ {ESIK} mm olmalı · negatif kontrol &lt; {ESIK} mm olmalı</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            {kontrolEksik ? "İki kontrolü de girin" : "En az bir allerjen değeri girin"}
          </p>
        </div>
      )}
    </OlcekKabugu>
  );
}
