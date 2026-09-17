"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/**
 * Ottawa SAK Kuralı — Perry ve ark., JAMA 2013.
 *
 * Kural yalnızca DAHİL ETME ölçütlerini karşılayan hastada geçerli. Araç önce onları
 * soruyor; karşılanmıyorsa "kural uygulanamaz" diyor ve "SAK dışlandı" sonucu HİÇ
 * üretmiyor — geçersiz popülasyonda negatif sonuç en tehlikeli çıktı olurdu.
 */
const UYGUNLUK = [
  { id: "uyanik", metin: "Uyanık (GKS 15), ≥ 15 yaş", olmali: true },
  { id: "yeni", metin: "Yeni, şiddetli, travmatik olmayan baş ağrısı; 1 saat içinde en yüksek şiddete ulaştı", olmali: true },
  { id: "defisit", metin: "Yeni nörolojik defisit var", olmali: false },
  { id: "oyku", metin: "Önceden anevrizma, SAK ya da beyin tümörü öyküsü var", olmali: false },
  { id: "tekrar", metin: "Benzer baş ağrıları tekrarlıyor (≥ 6 ayda ≥ 3 atak)", olmali: false },
] as const;

const KRITERLER = [
  { id: "yas", metin: "Yaş ≥ 40" },
  { id: "boyun", metin: "Boyun ağrısı ya da sertliği" },
  { id: "bilinc", metin: "Tanıklı bilinç kaybı" },
  { id: "efor", metin: "Efor sırasında başlama" },
  { id: "gokgurultusu", metin: "Gök gürültüsü baş ağrısı (anında en yüksek şiddete ulaşan)" },
  { id: "fleksiyon", metin: "Muayenede boyun fleksiyonu kısıtlı" },
] as const;

type EH = boolean | null;

function Soru({ id, metin, deger, onSec }: { id: string; metin: string; deger: EH; onSec: (v: EH) => void }) {
  const bid = `osak-${id}`;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-slate-100 last:border-0">
      <p id={bid} className="flex-1 text-[12px] font-bold text-blue-950 leading-snug">{metin}</p>
      <div role="group" aria-labelledby={bid} className="flex gap-2 shrink-0">
        {([true, false] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={deger === v}
            onClick={() => onSec(deger === v ? null : v)}
            className={`min-h-[44px] min-w-[5rem] px-3 rounded-xl border-2 text-[12px] font-black transition-all
              ${deger === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"}`}
          >
            {v ? "Evet" : "Hayır"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OttawaSakPage() {
  const [uyg, setUyg] = React.useState<Record<string, EH>>(Object.fromEntries(UYGUNLUK.map((u) => [u.id, null])));
  const [kr, setKr] = React.useState<Record<string, EH>>(Object.fromEntries(KRITERLER.map((k) => [k.id, null])));

  const uygEksik = UYGUNLUK.some((u) => uyg[u.id] === null);
  const uygunDegil = UYGUNLUK.filter((u) => uyg[u.id] !== null && uyg[u.id] !== u.olmali);
  const krEksik = KRITERLER.filter((k) => kr[k.id] === null).length;
  const pozitif = KRITERLER.filter((k) => kr[k.id] === true);

  let sonuc: { baslik: string; alt: string; ton: string } | null = null;
  if (uygunDegil.length > 0)
    sonuc = {
      baslik: "Kural uygulanamaz",
      alt: `Hasta kuralın popülasyonunda değil (${uygunDegil.map((u) => u.metin.toLocaleLowerCase("tr-TR")).join("; ")}). SAK klinik değerlendirmeyle araştırılmalı.`,
      ton: "border-amber-200 bg-amber-50 text-amber-900",
    };
  else if (!uygEksik && pozitif.length > 0)
    sonuc = {
      baslik: "Araştırma gerekli",
      alt: `Pozitif ölçüt: ${pozitif.map((k) => k.metin.toLocaleLowerCase("tr-TR")).join(" · ")}. BT (6 saat içinde, uygun yorumlanmışsa yeterli) ± LP / BT anjiyografi.`,
      ton: "border-rose-200 bg-rose-50 text-rose-900",
    };
  else if (!uygEksik && krEksik === 0)
    sonuc = {
      baslik: "Ölçüt yok — SAK kuralla dışlanabilir",
      alt: "Altı ölçütün hiçbiri yok; kural bu hastada ileri görüntüleme gerektirmiyor (duyarlılık %100, özgüllük ~%15). Klinik kuşku sürüyorsa kural yargının önüne geçmez.",
      ton: "border-emerald-200 bg-emerald-50 text-emerald-900",
    };

  return (
    <OlcekKabugu
      slug="ottawa-sak"
      ikon="⚡"
      baslik="Ottawa SAK Kuralı"
      altBaslik="Akut Baş Ağrısında Subaraknoid Kanama Araştırması · 6 Ölçüt"
      paylasim={{ pozitif: pozitif.length }}
      not={
        <p>
          Kural yüksek duyarlılık için tasarlanmıştır ve özgüllüğü düşüktür; "araştırma gerekli" sonucu SAK olasılığının yüksek olduğu anlamına
          gelmez. Yalnızca dahil etme ölçütlerini karşılayan acil servis hastalarında geçerlidir. Perry JJ ve ark., JAMA 2013.
        </p>
      }
    >
      <section aria-labelledby="osak-uygunluk" className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
        <h2 id="osak-uygunluk" className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">1. Kural bu hastaya uygulanabilir mi?</h2>
        {UYGUNLUK.map((u) => (
          <Soru key={u.id} id={u.id} metin={u.metin} deger={uyg[u.id]} onSec={(v) => setUyg((o) => ({ ...o, [u.id]: v }))} />
        ))}
      </section>

      <section aria-labelledby="osak-kriter" className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
        <h2 id="osak-kriter" className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">2. Ölçütler</h2>
        {KRITERLER.map((k) => (
          <Soru key={k.id} id={k.id} metin={k.metin} deger={kr[k.id]} onSec={(v) => setKr((o) => ({ ...o, [k.id]: v }))} />
        ))}
      </section>

      <SonucDuyuru metin={sonuc ? sonuc.baslik : null} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${sonuc.ton}`}>
          <p className="text-xl font-black">{sonuc.baslik}</p>
          <p className="text-[12px] font-bold leading-snug">{sonuc.alt}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            {uygEksik ? "Önce uygulanabilirlik sorularını yanıtlayın" : `${krEksik} ölçüt yanıtlanmadı`}
          </p>
        </div>
      )}
    </OlcekKabugu>
  );
}
