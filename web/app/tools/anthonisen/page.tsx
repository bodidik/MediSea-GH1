"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";

/**
 * Anthonisen kriterleri — Anthonisen NR ve ark., Ann Intern Med 1987;106:196–204.
 *   Tip 1: üç kardinal belirti (dispne artışı, balgam hacmi artışı, balgam pürülansı)
 *   Tip 2: üçünden ikisi
 *   Tip 3: biri + en az bir yan bulgu (son 5 günde ÜSYE, başka nedeni olmayan ateş, hışıltı artışı, öksürük artışı,
 *          solunum sayısı ya da nabızda bazale göre %20 artış)
 * Antibiyotik (GOLD): üç kardinal belirti; ya da ikisi, biri pürülans ise; ya da mekanik ventilasyon (invaziv/non-invaziv) gerekiyorsa.
 * Tip tanımları Montes de Oca M, Med Sci 2018;6:50 (Tablo 1) aktarımıyla karşılaştırıldı.
 */
const VY: Secenek[] = [{ label: "Yok", pts: 0 }, { label: "Var", pts: 1 }];
const KARDINAL = [
  { id: "dispne", baslik: "Dispne artışı" },
  { id: "hacim", baslik: "Balgam hacminde artış" },
  { id: "purulans", baslik: "Balgam pürülansı (renk değişimi)" },
] as const;
const YAN = [
  { id: "usye", baslik: "Son 5 günde üst solunum yolu enfeksiyonu (boğaz ağrısı, burun akıntısı)" },
  { id: "ates", baslik: "Başka nedeni olmayan ateş" },
  { id: "hisilti", baslik: "Hışıltı artışı" },
  { id: "oksuruk", baslik: "Öksürük artışı" },
  { id: "ss", baslik: "Solunum sayısı ya da nabızda bazale göre %20 artış" },
] as const;

export default function AnthonisenPage() {
  const [k, setK] = React.useState<Record<string, number | null>>({ dispne: null, hacim: null, purulans: null });
  const [y, setY] = React.useState<Record<string, number | null>>(Object.fromEntries(YAN.map((m) => [m.id, null])));
  const [mv, setMv] = React.useState<number | null>(null);

  const kTamam = KARDINAL.every((m) => k[m.id] !== null);
  const kSayi = KARDINAL.filter((m) => k[m.id] === 1).length;
  const yanGerekli = kTamam && kSayi === 1;
  const yTamam = YAN.every((m) => y[m.id] !== null);
  const ySayi = YAN.filter((m) => y[m.id] === 1).length;
  const tamam = kTamam && mv !== null && (!yanGerekli || yTamam);

  const tip = !tamam ? null : kSayi === 3 ? "Tip 1" : kSayi === 2 ? "Tip 2" : kSayi === 1 && ySayi >= 1 ? "Tip 3" : null;
  const antibiyotik = !tamam ? null : kSayi === 3 || (kSayi === 2 && k.purulans === 1) || mv === 1;

  const eksik = [
    !kTamam && "kardinal belirtiler",
    yanGerekli && !yTamam && "yan bulgular",
    mv === null && "mekanik ventilasyon",
  ].filter(Boolean) as string[];

  const baslik = tip ?? (kSayi === 0 ? "Kardinal belirti yok" : "Anthonisen tanımına uymuyor");
  const ozet = !tamam
    ? null
    : antibiyotik
      ? "Antibiyotik önerilir (GOLD)."
      : "Antibiyotik için GOLD ölçütü karşılanmıyor — klinik ve CRP ile birlikte değerlendirin.";

  return (
    <OlcekKabugu
      slug="anthonisen"
      ikon="💊"
      baslik="Anthonisen Kriterleri"
      altBaslik="KOAH Alevlenmesi · Tip 1–3 · Antibiyotik Kararı"
      paylasim={{ kardinal: kTamam ? kSayi : null, tip }}
      not={
        <p>
          Anthonisen çalışmasında antibiyotiğin yararı en belirgin Tip 1'de, sınırlı olarak Tip 2'de görüldü; Tip 3'te plasebodan farkı yoktu. GOLD
          antibiyotiği üç kardinal belirtide, pürülansın da bulunduğu iki belirtide ya da mekanik ventilasyon gerekiyorsa önerir; süre genellikle 5
          gündür. Anthonisen NR ve ark., Ann Intern Med 1987;106:196–204; GOLD 2026.
        </p>
      }
    >
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Kardinal belirtiler</p>
        {KARDINAL.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={VY} secili={k[m.id]} onSec={(s) => setK((o) => ({ ...o, [m.id]: s }))} rozetGizle />
        ))}
        {yanGerekli && (
          <>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1 pt-2">Yan bulgular (tek kardinal belirtide Tip 3 için en az biri)</p>
            {YAN.map((m) => (
              <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={VY} secili={y[m.id]} onSec={(s) => setY((o) => ({ ...o, [m.id]: s }))} rozetGizle />
            ))}
          </>
        )}
        <SecimMaddesi id="mv" baslik="Mekanik ventilasyon (invaziv ya da non-invaziv) gerekiyor mu?" secenekler={[{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }]} secili={mv} onSec={setMv} rozetGizle />
      </div>

      <SonucDuyuru metin={tamam ? `${baslik}. ${ozet}` : null} />
      {tamam ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${antibiyotik ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">Kardinal belirti: {kSayi} / 3</p>
          <p className="text-3xl font-black">{baslik}</p>
          <p className="text-[13px] font-bold">{ozet}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
