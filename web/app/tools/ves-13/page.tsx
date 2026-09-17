"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * VES-13 — Vulnerable Elders Survey (Saliba ve ark., JAGS 2001). 13 soru, 0–10.
 *
 * Puanlama madde toplamı DEĞİL, bölüm tavanlı:
 *   yaş 75–84 = 1 · ≥ 85 = 3
 *   sağlık "orta/kötü" = 1
 *   6 fiziksel etkinlik: "çok zorlanıyor/yapamıyor" başına 1, bölüm TAVANI 2
 *   5 günlük iş: herhangi birinde yardım gerekiyorsa bölüm 4 (tek sefer)
 * Bu yüzden şıkların yanında görünen rozet MADDE puanı; bölüm toplamı ayrıca basılıyor.
 */
const YAS: Secenek[] = [
  { label: "< 75", pts: 0 },
  { label: "75–84", pts: 1 },
  { label: "≥ 85", pts: 3 },
];
const SAGLIK: Secenek[] = [
  { label: "Mükemmel / çok iyi / iyi", pts: 0 },
  { label: "Orta / kötü", pts: 1 },
];
const ZORLUK: Secenek[] = [
  { label: "Zorlanmıyor", pts: 0 },
  { label: "Biraz", pts: 0 },
  { label: "Orta", pts: 0 },
  { label: "Çok zorlanıyor", pts: 1 },
  { label: "Yapamıyor", pts: 1 },
];
const YARDIM: Secenek[] = [
  { label: "Hayır", pts: 0 },
  { label: "Evet — yardım alıyor ya da sağlığı yüzünden yapmıyor", pts: 4 },
];

const FIZIKSEL = [
  { id: "egilme", baslik: "Eğilme, çömelme ya da diz çökme" },
  { id: "tasima", baslik: "Yaklaşık 4,5 kg'lık bir yükü kaldırma ya da taşıma" },
  { id: "uzanma", baslik: "Kollarını omuz hizasının üstüne uzatma" },
  { id: "yazma", baslik: "Yazı yazma ya da küçük nesneleri tutma" },
  { id: "yurume", baslik: "Yaklaşık 400 m yürüme" },
  { id: "evisi", baslik: "Ağır ev işi (yer silme, cam silme)" },
];
const GUNLUK = [
  { id: "alisveris", baslik: "Kişisel eşyalar için alışveriş" },
  { id: "para", baslik: "Parasını yönetme (faturalar, harcamalar)" },
  { id: "oda", baslik: "Odanın içinde yürüme (baston ya da yürüteç kullanılabilir)" },
  { id: "hafifIs", baslik: "Hafif ev işleri (bulaşık, toparlama)" },
  { id: "banyo", baslik: "Banyo yapma ya da duş alma" },
];

const TUM_ID = ["yas", "saglik", ...FIZIKSEL.map((m) => m.id), ...GUNLUK.map((m) => m.id)];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "Kırılganlığa yatkın (vulnerable) değil.", renk: "emerald" },
  { aralik: "≥ 3", etiket: "Kırılganlığa yatkın", alt: "2 yıl içinde ölüm ya da fonksiyonel gerileme riski ~4 kat — kapsamlı geriatrik değerlendirme.", renk: "rose" },
];

export default function Ves13Page() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(TUM_ID.map((id) => [id, null])));
  const sec = (id: string) => (s: number | null) => setSel((o) => ({ ...o, [id]: s }));
  const eksik = TUM_ID.filter((id) => sel[id] === null).length;

  let skor: number | null = null;
  let fizikselPuan = 0;
  let gunlukPuan = 0;
  if (eksik === 0) {
    fizikselPuan = Math.min(2, FIZIKSEL.reduce((t, m) => t + ZORLUK[sel[m.id] as number].pts, 0));
    gunlukPuan = GUNLUK.some((m) => YARDIM[sel[m.id] as number].pts > 0) ? 4 : 0;
    skor = YAS[sel.yas as number].pts + SAGLIK[sel.saglik as number].pts + fizikselPuan + gunlukPuan;
  }
  const bant = skor === null ? null : skor >= 3 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="ves-13"
      ikon="🧭"
      baslik="VES-13"
      altBaslik="Vulnerable Elders Survey · 13 Soru · 0–10"
      paylasim={{ ves13: skor }}
      not={
        <p>
          Toplumda yaşayan ≥ 65 yaş bireylerde kendi bildirimine dayalı, ~5 dakikalık bir ankettir; telefonla da uygulanabilir.
          Fiziksel etkinlik bölümü en fazla 2, günlük işler bölümü en fazla 4 puan katkı verir. Saliba D ve ark., J Am Geriatr Soc 2001.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="yas" baslik="Yaş" secenekler={YAS} secili={sel.yas} onSec={sec("yas")} />
        <SecimMaddesi
          id="saglik"
          baslik="Aynı yaştakilerle karşılaştırıldığında sağlığınız genel olarak nasıl?"
          secenekler={SAGLIK}
          secili={sel.saglik}
          onSec={sec("saglik")}
        />
      </div>

      <section className="space-y-3" aria-labelledby="ves-fiziksel">
        <div className="flex items-baseline justify-between px-1 gap-3">
          <h2 id="ves-fiziksel" className="text-sm font-black text-blue-900 uppercase tracking-widest">Ortalama olarak ne kadar zorlanıyor?</h2>
          <span className="text-[11px] font-black text-slate-600 shrink-0">en fazla 2</span>
        </div>
        {FIZIKSEL.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={ZORLUK} secili={sel[m.id]} onSec={sec(m.id)} />
        ))}
      </section>

      <section className="space-y-3" aria-labelledby="ves-gunluk">
        <div className="flex items-baseline justify-between px-1 gap-3">
          <h2 id="ves-gunluk" className="text-sm font-black text-blue-900 uppercase tracking-widest">Sağlığı ya da fiziksel durumu nedeniyle yardım gerekiyor mu?</h2>
          <span className="text-[11px] font-black text-slate-600 shrink-0">herhangi biri: 4</span>
        </div>
        {GUNLUK.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} secenekler={YARDIM} secili={sel[m.id]} onSec={sec(m.id)} />
        ))}
      </section>

      <SkorPaneli
        skor={skor}
        payda={10}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${eksik} soru yanıtlanmadı`}
        ek={
          skor !== null ? (
            <p className="text-[11px] font-bold text-slate-700">
              Yaş {YAS[sel.yas as number].pts} · sağlık {SAGLIK[sel.saglik as number].pts} · fiziksel {fizikselPuan} · günlük işler {gunlukPuan}
            </p>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
