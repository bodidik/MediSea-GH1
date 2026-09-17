"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Antikolinerjik Bilişsel Yük (ACB) ölçeği — Boustani ve ark., Aging Health 2008;
 * 2012 güncellemesi (Aging Brain Care, Indiana Üniversitesi).
 *
 * Liste ACB'nin tamamı DEĞİL: Türkiye'de ruhsatlı ya da sık karşılaşılan etken
 * maddeler seçildi. Listede olmayan bir ilaç 0 puan sayılır — bu yüzden ekranda
 * "listede yoksa 0 sayılır" diye AÇIKÇA yazıyor; aksi hâlde düşük skor
 * "antikolinerjik yük yok" diye okunurdu.
 */
type Ilac = { ad: string; sinif: string; puan: 1 | 2 | 3 };

const ILACLAR: ReadonlyArray<Ilac> = [
  // ── 3 puan ──
  { ad: "Amitriptilin", sinif: "Trisiklik antidepresan", puan: 3 },
  { ad: "Klomipramin", sinif: "Trisiklik antidepresan", puan: 3 },
  { ad: "İmipramin", sinif: "Trisiklik antidepresan", puan: 3 },
  { ad: "Nortriptilin", sinif: "Trisiklik antidepresan", puan: 3 },
  { ad: "Doksepin", sinif: "Trisiklik antidepresan", puan: 3 },
  { ad: "Paroksetin", sinif: "SSRI", puan: 3 },
  { ad: "Klorpromazin", sinif: "Antipsikotik", puan: 3 },
  { ad: "Klozapin", sinif: "Antipsikotik", puan: 3 },
  { ad: "Olanzapin", sinif: "Antipsikotik", puan: 3 },
  { ad: "Ketiapin", sinif: "Antipsikotik", puan: 3 },
  { ad: "Trifluoperazin", sinif: "Antipsikotik", puan: 3 },
  { ad: "Tiyoridazin", sinif: "Antipsikotik", puan: 3 },
  { ad: "Oksibutinin", sinif: "Mesane antimuskariniği", puan: 3 },
  { ad: "Tolterodin", sinif: "Mesane antimuskariniği", puan: 3 },
  { ad: "Solifenasin", sinif: "Mesane antimuskariniği", puan: 3 },
  { ad: "Darifenasin", sinif: "Mesane antimuskariniği", puan: 3 },
  { ad: "Fesoterodin", sinif: "Mesane antimuskariniği", puan: 3 },
  { ad: "Trospiyum", sinif: "Mesane antimuskariniği", puan: 3 },
  { ad: "Propiverin", sinif: "Mesane antimuskariniği", puan: 3 },
  { ad: "Flavoksat", sinif: "Mesane antispazmodiği", puan: 3 },
  { ad: "Difenhidramin", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Klorfeniramin", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Hidroksizin", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Prometazin", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Dimenhidrinat", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Doksilamin", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Meklizin", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Klemastin", sinif: "1. kuşak antihistaminik", puan: 3 },
  { ad: "Atropin", sinif: "Antimuskarinik", puan: 3 },
  { ad: "Skopolamin (hiyosin hidrobromür)", sinif: "Antimuskarinik", puan: 3 },
  { ad: "Disiklomin", sinif: "GİS antispazmodiği", puan: 3 },
  { ad: "Triheksifenidil", sinif: "Antiparkinson (antikolinerjik)", puan: 3 },
  { ad: "Benztropin", sinif: "Antiparkinson (antikolinerjik)", puan: 3 },
  { ad: "Orfenadrin", sinif: "Kas gevşetici", puan: 3 },
  { ad: "Metokarbamol", sinif: "Kas gevşetici", puan: 3 },
  // ── 2 puan ──
  { ad: "Karbamazepin", sinif: "Antiepileptik", puan: 2 },
  { ad: "Okskarbazepin", sinif: "Antiepileptik", puan: 2 },
  { ad: "Amantadin", sinif: "Antiparkinson", puan: 2 },
  { ad: "Siklobenzaprin", sinif: "Kas gevşetici", puan: 2 },
  { ad: "Siproheptadin", sinif: "Antihistaminik", puan: 2 },
  { ad: "Petidin (meperidin)", sinif: "Opioid", puan: 2 },
  { ad: "Levomepromazin", sinif: "Antipsikotik", puan: 2 },
  { ad: "Pimozid", sinif: "Antipsikotik", puan: 2 },
  { ad: "Nefopam", sinif: "Analjezik", puan: 2 },
  // ── 1 puan ──
  { ad: "Alprazolam", sinif: "Benzodiazepin", puan: 1 },
  { ad: "Diazepam", sinif: "Benzodiazepin", puan: 1 },
  { ad: "Klorazepat", sinif: "Benzodiazepin", puan: 1 },
  { ad: "Haloperidol", sinif: "Antipsikotik", puan: 1 },
  { ad: "Risperidon", sinif: "Antipsikotik", puan: 1 },
  { ad: "Aripiprazol", sinif: "Antipsikotik", puan: 1 },
  { ad: "Paliperidon", sinif: "Antipsikotik", puan: 1 },
  { ad: "Trazodon", sinif: "Antidepresan", puan: 1 },
  { ad: "Venlafaksin", sinif: "Antidepresan", puan: 1 },
  { ad: "Bupropiyon", sinif: "Antidepresan", puan: 1 },
  { ad: "Fluvoksamin", sinif: "SSRI", puan: 1 },
  { ad: "Kodein", sinif: "Opioid", puan: 1 },
  { ad: "Morfin", sinif: "Opioid", puan: 1 },
  { ad: "Fentanil", sinif: "Opioid", puan: 1 },
  { ad: "Loperamid", sinif: "Antidiyareik", puan: 1 },
  { ad: "Setirizin / levosetirizin", sinif: "2. kuşak antihistaminik", puan: 1 },
  { ad: "Loratadin / desloratadin", sinif: "2. kuşak antihistaminik", puan: 1 },
  { ad: "Ranitidin", sinif: "H2 reseptör blokörü", puan: 1 },
  { ad: "Simetidin", sinif: "H2 reseptör blokörü", puan: 1 },
  { ad: "Furosemid", sinif: "Diüretik", puan: 1 },
  { ad: "Klortalidon", sinif: "Diüretik", puan: 1 },
  { ad: "Triamteren", sinif: "Diüretik", puan: 1 },
  { ad: "Digoksin", sinif: "Kardiyak glikozit", puan: 1 },
  { ad: "Metoprolol", sinif: "Beta blokör", puan: 1 },
  { ad: "Atenolol", sinif: "Beta blokör", puan: 1 },
  { ad: "Kaptopril", sinif: "ACE inhibitörü", puan: 1 },
  { ad: "Nifedipin", sinif: "Kalsiyum kanal blokörü", puan: 1 },
  { ad: "Hidralazin", sinif: "Vazodilatör", puan: 1 },
  { ad: "İzosorbid", sinif: "Nitrat", puan: 1 },
  { ad: "Dipiridamol", sinif: "Antiagregan", puan: 1 },
  { ad: "Varfarin", sinif: "Antikoagülan", puan: 1 },
  { ad: "Kinidin", sinif: "Antiaritmik", puan: 1 },
  { ad: "Dizopiramid", sinif: "Antiaritmik", puan: 1 },
  { ad: "Teofilin", sinif: "Bronkodilatör", puan: 1 },
  { ad: "Prednizon", sinif: "Kortikosteroid", puan: 1 },
  { ad: "Hidrokortizon", sinif: "Kortikosteroid", puan: 1 },
  { ad: "Kolşisin", sinif: "Antigut", puan: 1 },
  { ad: "Klidinyum", sinif: "GİS antispazmodiği", puan: 1 },
  { ad: "Alverin", sinif: "GİS antispazmodiği", puan: 1 },
];

const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "Yük yok", alt: "Listedeki ilaçlardan antikolinerjik yük saptanmadı.", renk: "emerald" },
  { aralik: "1–2", etiket: "Olası etki", alt: "Olası antikolinerjik etki — özellikle demans ve deliryum riski olan hastada gözden geçirin.", renk: "amber" },
  { aralik: "≥ 3", etiket: "Klinik anlamlı", alt: "Klinik olarak anlamlı yük — bilişsel bozulma, düşme ve mortalite artışıyla ilişkili. Azaltma ya da değiştirme seçeneklerini değerlendirin.", renk: "rose" },
];

/** Türkçe katlama: `İ`→`i`, `I`→`ı` — `toLowerCase` ASCII kuralıyla yanlış katlıyor. */
function katla(s: string): string {
  return s.toLocaleLowerCase("tr-TR").normalize("NFC");
}

export default function AntikolinerjikYukPage() {
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const [arama, setArama] = React.useState("");

  const toplam = ILACLAR.reduce((t, i) => t + (secili.has(i.ad) ? i.puan : 0), 0);
  const ucPuanli = ILACLAR.filter((i) => i.puan === 3 && secili.has(i.ad));
  const bant = toplam === 0 ? BANTLAR[0] : toplam <= 2 ? BANTLAR[1] : BANTLAR[2];

  const q = katla(arama.trim());
  const gorunen = q === "" ? ILACLAR : ILACLAR.filter((i) => katla(i.ad).includes(q) || katla(i.sinif).includes(q));

  const degistir = (ad: string) =>
    setSecili((s) => {
      const y = new Set(s);
      if (y.has(ad)) y.delete(ad);
      else y.add(ad);
      return y;
    });

  return (
    <OlcekKabugu
      slug="antikolinerjik-yuk"
      ikon="💊"
      baslik="Antikolinerjik Yük (ACB)"
      altBaslik="Anticholinergic Cognitive Burden · İlaç Başına 1–3 Puan"
      paylasim={{ acb: toplam, ilac: secili.size }}
      not={
        <>
          <p>
            <strong>Listede olmayan ilaç 0 puan sayılır</strong> — bu liste ACB'nin tamamı değil, sık karşılaşılan etken maddelerden bir seçkidir.
            Aynı ilacın dozu puanı değiştirmez; farklı ölçekler (ARS, ADS) bazı ilaçlara farklı puan verir.
          </p>
          <p>
            1 puan: in vitro antikolinerjik aktivite, klinik bilişsel etki kanıtı yok · 2–3 puan: klinik olarak kanıtlanmış antikolinerjik etki
            (3 = kan–beyin bariyerini geçer, deliryumla ilişkili). Boustani M ve ark., Aging Health 2008; ACB 2012 güncellemesi.
          </p>
        </>
      }
    >
      <SkorPaneli
        skor={toplam}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni=""
        ek={
          <p className="text-[11px] font-bold text-slate-700">
            {secili.size} ilaç seçili{ucPuanli.length > 0 ? ` · 3 puanlı: ${ucPuanli.map((i) => i.ad).join(", ")}` : ""}
          </p>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-black text-blue-900">İlaç ya da sınıf ara</span>
          <input
            type="search"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="ör. oksibutinin, antihistaminik"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold"
          />
        </label>
        <p className="text-[11px] text-slate-600" aria-live="polite">
          {gorunen.length} / {ILACLAR.length} ilaç gösteriliyor
        </p>
      </div>

      {([3, 2, 1] as const).map((p) => {
        const grup = gorunen.filter((i) => i.puan === p);
        if (grup.length === 0) return null;
        return (
          <fieldset key={p} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <legend className="px-2 text-[12px] font-black text-blue-900">{p} puanlı ilaçlar</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {grup.map((i) => {
                const aktif = secili.has(i.ad);
                return (
                  <label
                    key={i.ad}
                    className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                      ${aktif ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
                  >
                    <input type="checkbox" checked={aktif} onChange={() => degistir(i.ad)} className="w-4 h-4 accent-blue-900 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-[12px] font-bold text-blue-950">{i.ad}</span>
                      <span className="block text-[10px] text-slate-600">{i.sinif}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </OlcekKabugu>
  );
}
