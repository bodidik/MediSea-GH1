"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * RECIST 1.1 — solid tümörlerde yanıt değerlendirmesi (Eisenhauer ve ark., Eur J Cancer 2009).
 *
 * Hedef lezyon çaplarının toplamı (SLD; lenf nodunda KISA eksen) üç noktada karşılaştırılır:
 *   TY (CR)  tüm hedef lezyonlar kaybolmuş VE patolojik nodların kısa ekseni < 10 mm
 *   KY (PR)  başlangıca göre ≥ %30 azalma
 *   PH (PD)  NADİRE göre ≥ %20 artış VE mutlak ≥ 5 mm artış · ya da yeni lezyon · ya da hedef dışı kesin progresyon
 *   SH (SD)  ikisi de değil
 *
 * İKİ AYRI PAYDA: küçülme BAŞLANGIÇtan, büyüme NADİRden hesaplanır — tek paydayla bakmak
 * yanıt sonrası progresyonu kaçırır. Yeni lezyon ve hedef dışı kesin progresyon, ölçüm ne olursa olsun PH.
 * Karşılaştırmalar HAM değerle yapılıyor; ekrandaki yüzde yalnız gösterim.
 */
const EH: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];
const HEDEF_DISI: Secenek[] = [
  { label: "Yok / tam kayboldu", pts: 0 },
  { label: "Var, kesin progresyon YOK", pts: 0 },
  { label: "Kesin progresyon (unequivocal)", pts: 0 },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const y1 = (x: number) => x.toFixed(1).replace(".", ",");

type Yanit = { kod: string; ad: string; aciklama: string; renk: string };

export default function RecistPage() {
  const [baslangic, setBaslangic] = React.useState("");
  const [nadir, setNadir] = React.useState("");
  const [simdi, setSimdi] = React.useState("");
  const [tumKayboldu, setTumKayboldu] = React.useState<number | null>(null);
  const [nodKucuk, setNodKucuk] = React.useState<number | null>(null);
  const [yeni, setYeni] = React.useState<number | null>(null);
  const [disi, setDisi] = React.useState<number | null>(null);

  const n = parseLocaleNumber;
  const ok = (s: string, alt: number) => sayiGirildiMi(s) && n(s) >= alt && n(s) <= 2000;
  const bOk = ok(baslangic, 1), nOk = ok(nadir, 0), sOk = ok(simdi, 0);
  // Nod sorusu yalnız "tüm hedef lezyonlar kayboldu" dendiğinde anlamlı.
  const nodSor = tumKayboldu === 1;

  const eksik = [
    !bOk && "başlangıç toplam çap (mm)",
    !nOk && "nadir toplam çap (mm)",
    !sOk && "şimdiki toplam çap (mm)",
    tumKayboldu === null && "hedef lezyonların durumu",
    nodSor && nodKucuk === null && "patolojik nod kısa ekseni",
    yeni === null && "yeni lezyon",
    disi === null && "hedef dışı lezyonlar",
  ].filter(Boolean) as string[];
  const hazir = eksik.length === 0;

  const nadirTutarsiz = bOk && nOk && sOk && (n(nadir) > n(baslangic) || n(nadir) > n(simdi));

  let yanit: Yanit | null = null;
  let degisimBaslangic: number | null = null, degisimNadir: number | null = null, mutlakArtis: number | null = null;
  if (hazir) {
    const b = n(baslangic), na = n(nadir), s = n(simdi);
    degisimBaslangic = ((s - b) / b) * 100;
    degisimNadir = na > 0 ? ((s - na) / na) * 100 : s > 0 ? Infinity : 0;
    mutlakArtis = s - na;
    const progresyon = (degisimNadir >= 20 && mutlakArtis >= 5) || yeni === 1 || disi === 2;
    const tamYanit = tumKayboldu === 1 && nodKucuk === 1 && yeni === 0 && disi === 0;
    if (progresyon) {
      const sebep = yeni === 1 ? "Yeni lezyon" : disi === 2 ? "Hedef dışı lezyonlarda kesin progresyon" : `Nadire göre %${y1(degisimNadir)} ve ${y1(mutlakArtis)} mm artış`;
      yanit = { kod: "PH", ad: "Progresif hastalık", aciklama: `${sebep} — RECIST 1.1'e göre progresyon.`, renk: "border-rose-200 bg-rose-50 text-rose-900" };
    } else if (tamYanit) {
      yanit = { kod: "TY", ad: "Tam yanıt", aciklama: "Tüm hedef lezyonlar kaybolmuş, patolojik nodların kısa ekseni < 10 mm, yeni lezyon ve hedef dışı hastalık yok.", renk: "border-emerald-200 bg-emerald-50 text-emerald-900" };
    } else if (degisimBaslangic <= -30) {
      yanit = { kod: "KY", ad: "Kısmi yanıt", aciklama: `Başlangıca göre %${y1(Math.abs(degisimBaslangic))} azalma (eşik ≥ %30).`, renk: "border-emerald-200 bg-emerald-50 text-emerald-900" };
    } else {
      yanit = { kod: "SH", ad: "Stabil hastalık", aciklama: "Ne kısmi yanıt ne progresyon ölçütü karşılanıyor.", renk: "border-amber-200 bg-amber-50 text-amber-900" };
    }
  }

  return (
    <OlcekKabugu
      slug="recist"
      ikon="📏"
      baslik="RECIST 1.1 Yanıt Değerlendirmesi"
      altBaslik="Solid Tümörlerde Tam / Kısmi Yanıt · Stabil · Progresif Hastalık"
      paylasim={{ yanit: yanit?.kod ?? null }}
      not={
        <p>
          En fazla 5 hedef lezyon (organ başına 2) seçilir; ölçülebilirlik için lezyon ≥ 10 mm (BT'de), lenf nodu KISA ekseni ≥ 15 mm olmalıdır. Hedef
          lezyon toplamına nodların kısa ekseni girer. Tam ve kısmi yanıt en az 4 hafta sonra doğrulanmalıdır (doğrulama gerektiren çalışmalarda).
          İmmünoterapide psödoprogresyon için iRECIST ayrı değerlendirilir. Eisenhauer EA ve ark., Eur J Cancer 2009.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        {([
          ["Başlangıç toplam çap (mm)", baslangic, setBaslangic],
          ["Nadir — en küçük toplam (mm)", nadir, setNadir],
          ["Şimdiki toplam çap (mm)", simdi, setSimdi],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      {nadirTutarsiz && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Nadir, başlangıçtan ya da şimdiki ölçümden büyük — nadir, tedavi boyunca ölçülen EN KÜÇÜK toplamdır (başlangıç da dahil).
        </div>
      )}

      <div className="space-y-3">
        <SecimMaddesi id="tumkayboldu" baslik="Tüm hedef lezyonlar tamamen kayboldu mu?" secenekler={EH} secili={tumKayboldu} onSec={setTumKayboldu} rozetGizle />
        {nodSor && (
          <SecimMaddesi id="nodkucuk" baslik="Patolojik lenf nodlarının kısa ekseni < 10 mm mi?" aciklama="Nod tamamen kaybolmasa da kısa eksen 10 mm'nin altına indiyse tam yanıt sayılır." secenekler={EH} secili={nodKucuk} onSec={setNodKucuk} rozetGizle />
        )}
        <SecimMaddesi id="yeni" baslik="Yeni lezyon var mı?" secenekler={EH} secili={yeni} onSec={setYeni} rozetGizle />
        <SecimMaddesi id="disi" baslik="Hedef dışı lezyonların durumu" secenekler={HEDEF_DISI} secili={disi} onSec={setDisi} rozetGizle />
      </div>

      <SonucDuyuru metin={yanit ? `${yanit.ad} (${yanit.kod})` : null} />
      {yanit ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yanit.renk}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">RECIST 1.1 genel yanıt</p>
          <p className="text-4xl font-black">{yanit.ad}</p>
          <p className="text-[12px] font-bold">{yanit.aciklama}</p>
          {degisimBaslangic !== null && degisimNadir !== null && mutlakArtis !== null && (
            <p className="text-[11px] font-bold">
              Başlangıca göre {degisimBaslangic > 0 ? "+" : ""}{y1(degisimBaslangic)}% · nadire göre {degisimNadir === Infinity ? "tanımsız" : `${degisimNadir > 0 ? "+" : ""}${y1(degisimNadir)}%`} ({mutlakArtis > 0 ? "+" : ""}{y1(mutlakArtis)} mm)
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
