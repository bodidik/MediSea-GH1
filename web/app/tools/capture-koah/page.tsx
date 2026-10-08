"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * CAPTURE — birinci basamakta tanı almamış KOAH taraması (Martinez FJ ve ark., Am J Respir Crit Care Med 2017).
 * Beş soru, 0–6 puan (dört evet/hayır + geçen yılki solunum yolu enfeksiyonu sayısı 0 / 1–2 / ≥ 3 → 0 / 1 / 2).
 *   0–1 → KOAH olası değil · 5–6 → doğrudan spirometri · 2–4 → zirve akım (PEF): erkek ≤ 350, kadın ≤ 250 L/dk ise spirometri
 * Puanlama ve akış: Leidy NK ve ark., Int J Chron Obstruct Pulmon Dis 2018;13:1901–1912 (PMC6005334) yöntem bölümü.
 * Soru metinleri resmî Türkçe sürüm değildir; içerik özgün maddelerin anlamına göre yazıldı.
 */
const EH: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];
const SORULAR: ReadonlyArray<{ id: string; baslik: string; secenekler: Secenek[] }> = [
  { id: "maruziyet", baslik: "Uzun süre duman, gaz, toz ya da başka hava kirleticiye (iş yerinde, evde ya da sigara dumanı dahil) maruz kaldınız mı?", secenekler: EH },
  { id: "mevsim", baslik: "Nefes alışınız mevsimlere, havaya ya da hava kalitesine göre değişiyor mu?", secenekler: EH },
  { id: "efor", baslik: "Ağır yük taşıma, kar küreme, koşma gibi işlerde nefesiniz yüzünden zorlanıyor musunuz?", secenekler: EH },
  { id: "yorgunluk", baslik: "Yaşıtlarınıza göre daha kolay yoruluyor musunuz?", secenekler: EH },
  { id: "enfeksiyon", baslik: "Son 12 ayda nezle, bronşit ya da zatürre nedeniyle kaç kez işe/okula gidemediniz ya da günlük işinizi aksattınız?", secenekler: [{ label: "Hiç", pts: 0 }, { label: "1–2 kez", pts: 1 }, { label: "3 kez ya da daha fazla", pts: 2 }] },
];
const CINSIYET: Secenek[] = [{ label: "Erkek", pts: 0 }, { label: "Kadın", pts: 0 }];
const ESIK = [350, 250] as const;
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";

export default function CaptureKoahPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(SORULAR.map((m) => [m.id, null])));
  const [cins, setCins] = React.useState<number | null>(null);
  const [pef, setPef] = React.useState("");
  const yanitlanan = SORULAR.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === SORULAR.length ? SORULAR.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const ara = skor !== null && skor >= 2 && skor <= 4;
  const pGir = sayiGirildiMi(pef);
  const pOk = pGir && parseLocaleNumber(pef) >= 50 && parseLocaleNumber(pef) <= 900;

  type Karar = { t: string; a: string; r: string };
  const SPIRO = "border-rose-200 bg-rose-50 text-rose-900";
  let karar: Karar | null = null;
  if (skor !== null && skor <= 1) karar = { t: "KOAH olası değil", a: "Bu taramayla ek değerlendirme gerekmiyor.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  else if (skor !== null && skor >= 5) karar = { t: "Spirometri önerilir", a: "Puan 5–6: zirve akım ölçmeden doğrudan tanısal spirometriye yönlendirin.", r: SPIRO };
  else if (ara && cins !== null && pOk) {
    const p = parseLocaleNumber(pef);
    karar = p <= ESIK[cins]
      ? { t: "Spirometri önerilir", a: `Zirve akım ${p} L/dk ≤ ${ESIK[cins]} L/dk (${cins === 0 ? "erkek" : "kadın"} eşiği).`, r: SPIRO }
      : { t: "Şimdilik spirometri gerekmiyor", a: `Zirve akım ${p} L/dk > ${ESIK[cins]} L/dk (${cins === 0 ? "erkek" : "kadın"} eşiği). Semptom sürerse yeniden değerlendirin.`, r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  }

  const eksik = [
    yanitlanan < SORULAR.length && `${SORULAR.length - yanitlanan} soru`,
    ara && cins === null && "cinsiyet",
    ara && !pOk && "zirve akım (50–900 L/dk)",
  ].filter(Boolean) as string[];

  return (
    <OlcekKabugu
      slug="capture-koah"
      ikon="🔎"
      baslik="CAPTURE"
      altBaslik="Birinci Basamakta Tanı Almamış KOAH Taraması · 0–6 + Zirve Akım"
      paylasim={{ capture: skor }}
      not={
        <p>
          Semptomlu hastada vaka bulma aracıdır; asemptomatik bireyde KOAH taraması önerilmez. Tanı spirometriyle konur. ABD birinci basamak
          çalışmasında duyarlılık %48, özgüllük %89 bulundu. Soru metinleri resmî Türkçe sürüm değildir. Martinez FJ ve ark., Am J Respir Crit Care Med
          2017;195:748–756; Leidy NK ve ark., Int J Chron Obstruct Pulmon Dis 2018;13:1901–1912; Martinez FJ ve ark., JAMA 2023;329:490–501.
        </p>
      }
    >
      <div className="space-y-3">
        {SORULAR.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>

      {ara && (
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-blue-950 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">Puan {skor}: ara bölge — zirve akım (PEF) ölçün.</p>
          <SecimMaddesi id="cinsiyet" baslik="Cinsiyet (PEF eşiği için)" secenekler={CINSIYET} secili={cins} onSec={setCins} rozetGizle />
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
            <label className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Zirve akım — PEF (L/dk, en iyi deneme)</span>
              <input type="text" inputMode="decimal" value={pef} onChange={(e) => setPef(e.target.value)} className={girdi} />
            </label>
          </div>
          {pGir && !pOk && <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">Zirve akım 50–900 L/dk aralığında olmalı.</p>}
        </div>
      )}

      <SonucDuyuru metin={karar && skor !== null ? `CAPTURE ${skor} puan — ${karar.t}` : null} />
      {karar && skor !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${karar.r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">CAPTURE puanı (0–6)</p>
          <p className="text-4xl font-black">{skor}</p>
          <p className="text-lg font-black">{karar.t}</p>
          <p className="text-[12px] font-bold">{karar.a}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
