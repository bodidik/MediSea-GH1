"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Kronik lenfositik lösemi evrelemesi — Rai (1975, modifiye 3 grup) ve Binet (1981), aynı muayene ve kan sayımından.
 *
 * Rai:   0 yalnız lenfositoz · I + lenfadenopati · II + hepatomegali ve/veya splenomegali
 *        III Hb < 11 g/dL · IV trombosit < 100 × 10⁹/L        (düşük 0 · orta I–II · yüksek III–IV)
 * Binet: tutulum alanları (servikal, aksiller, inguinal lenf nodları — tek ya da iki taraflı fark etmez; dalak; karaciğer) — 5 alan
 *        A < 3 alan · B ≥ 3 alan · C Hb < 10 g/dL ya da trombosit < 100 × 10⁹/L (alan sayısından bağımsız)
 *
 * İki sistemin Hb eşiği FARKLI (Rai 11, Binet 10); araç tek bir Hb değerinden ikisini ayrı uyguluyor.
 * Sitopeni otoimmün (OİHA, İTP) kaynaklıysa evreyi yükseltmez — kullanıcı bunu ayrıca işaretler.
 */
const ALANLAR = [
  { id: "servikal", metin: "Servikal lenf nodu" },
  { id: "aksiller", metin: "Aksiller lenf nodu" },
  { id: "inguinal", metin: "İnguinal lenf nodu" },
  { id: "dalak", metin: "Dalak (palpabl)" },
  { id: "karaciger", metin: "Karaciğer (palpabl)" },
] as const;

const OTOIMMUN: Secenek[] = [{ label: "Hayır — sitopeni KLL infiltrasyonuna bağlı", pts: 0 }, { label: "Evet — otoimmün (OİHA / İTP)", pts: 0 }];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function KllEvrelemePage() {
  const [alan, setAlan] = React.useState<ReadonlySet<string>>(new Set());
  const [hb, setHb] = React.useState("");
  const [plt, setPlt] = React.useState("");
  const [otoimmun, setOtoimmun] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const hbOk = sayiGirildiMi(hb) && n(hb) >= 2 && n(hb) <= 25;
  const pltOk = sayiGirildiMi(plt) && n(plt) >= 0 && n(plt) <= 2000;
  const sitopeniVar = hbOk && pltOk && (n(hb) < 11 || n(plt) < 100);
  const otoimmunSorusu = sitopeniVar;
  const hazir = hbOk && pltOk && (!otoimmunSorusu || otoimmun !== null);
  const sitopeniSayilir = otoimmun !== 1;

  const lap = ["servikal", "aksiller", "inguinal"].some((a) => alan.has(a));
  const organ = alan.has("dalak") || alan.has("karaciger");

  let rai: number | null = null;
  let binet: string | null = null;
  if (hazir) {
    if (sitopeniSayilir && n(plt) < 100) rai = 4;
    else if (sitopeniSayilir && n(hb) < 11) rai = 3;
    else if (organ) rai = 2;
    else if (lap) rai = 1;
    else rai = 0;

    if (sitopeniSayilir && (n(hb) < 10 || n(plt) < 100)) binet = "C";
    else if (alan.size >= 3) binet = "B";
    else binet = "A";
  }
  const raiGrup = rai === null ? null : rai === 0 ? "düşük risk" : rai <= 2 ? "orta risk" : "yüksek risk";
  const ROMA = ["0", "I", "II", "III", "IV"];

  return (
    <OlcekKabugu
      slug="kll-evreleme"
      ikon="🔬"
      baslik="KLL Evrelemesi"
      altBaslik="Rai (Modifiye) ve Binet · Aynı Muayene ve Kan Sayımından"
      paylasim={{ rai, binet }}
      not={
        <p>
          Evreleme fizik muayene ve kan sayımıyla yapılır; görüntülemede saptanan lenfadenopati evreyi değiştirmez. Evre tek başına tedavi endikasyonu
          değildir — tedavi iwCLL "aktif hastalık" ölçütlerine göre başlanır. Prognoz için CLL-IPI aracını kullanın. Rai KR ve ark., Blood 1975;
          Binet JL ve ark., Cancer 1981; Hallek M ve ark. (iwCLL), Blood 2018.
        </p>
      }
    >
      <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <legend className="px-2 text-[12px] font-black text-blue-900">Fizik muayenede tutulum alanları · {alan.size}/5</legend>
        <p className="text-[11px] text-slate-600 px-2">Her lenf nodu bölgesi tek ya da iki taraflı olsun, 1 alan sayılır.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {ALANLAR.map((a) => (
            <label key={a.id} className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${alan.has(a.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}>
              <input type="checkbox" checked={alan.has(a.id)} onChange={() => setAlan((s) => kumeDegistir(s, a.id))} className="w-4 h-4 accent-blue-900 shrink-0" />
              <span className="text-[12px] font-bold text-blue-950">{a.metin}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Hemoglobin (g/dL)</span>
          <input type="text" inputMode="decimal" value={hb} onChange={(e) => setHb(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Trombosit (× 10⁹/L)</span>
          <input type="text" inputMode="numeric" value={plt} onChange={(e) => setPlt(e.target.value)} className={girdi} />
        </label>
      </div>
      {otoimmunSorusu && (
        <SecimMaddesi id="otoimmun" baslik="Sitopeni otoimmün kaynaklı mı?" aciklama="Otoimmün hemolitik anemi ya da immün trombositopeniye bağlı sitopeni evreyi yükseltmez." secenekler={OTOIMMUN} secili={otoimmun} onSec={setOtoimmun} rozetGizle />
      )}

      <SonucDuyuru metin={rai !== null && binet ? `Rai evre ${ROMA[rai]} (${raiGrup}) · Binet ${binet}` : null} />
      {rai !== null && binet && raiGrup ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-blue-900 bg-blue-50 p-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rai</p>
            <p className="text-4xl font-black text-blue-900">{ROMA[rai]}</p>
            <p className="text-[13px] font-black text-slate-800">Modifiye Rai: {raiGrup}</p>
          </div>
          <div className="rounded-2xl border-2 border-blue-900 bg-blue-50 p-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Binet</p>
            <p className="text-4xl font-black text-blue-900">{binet}</p>
            <p className="text-[13px] font-black text-slate-800">{binet === "C" ? "Hb < 10 ya da trombosit < 100" : `${alan.size} tutulum alanı`}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Hemoglobin ve trombosit değerlerini girin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
