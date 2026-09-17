"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Tinetti POMA — Performansa Dayalı Mobilite Değerlendirmesi (Tinetti, JAGS 1986).
 * Denge 16 + yürüme 12 = 28. İki bileşik madde (360° dönüş ve adım uzunluğu/
 * yüksekliği) özgün formda olduğu gibi ALT MADDELERE bölündü: tek şıkla
 * sorulsalar "sürekli ama dengesiz" gibi bileşimler seçilemezdi.
 */
type Madde = { id: string; baslik: string; aciklama?: string; secenekler: Secenek[] };

const DENGE: ReadonlyArray<Madde> = [
  {
    id: "d1", baslik: "1. Oturma dengesi", aciklama: "Kolsuz, sert bir sandalyede oturuyor.",
    secenekler: [{ label: "Yana eğiliyor ya da kayıyor", pts: 0 }, { label: "Dengeli, güvenli", pts: 1 }],
  },
  {
    id: "d2", baslik: "2. Ayağa kalkma",
    secenekler: [{ label: "Yardımsız kalkamıyor", pts: 0 }, { label: "Kalkıyor, kollarından destek alarak", pts: 1 }, { label: "Kollarını kullanmadan kalkıyor", pts: 2 }],
  },
  {
    id: "d3", baslik: "3. Kalkma girişimleri",
    secenekler: [{ label: "Yardımsız kalkamıyor", pts: 0 }, { label: "Kalkıyor, > 1 girişimle", pts: 1 }, { label: "Tek girişimde kalkıyor", pts: 2 }],
  },
  {
    id: "d4", baslik: "4. Kalkınca ilk denge (ilk 5 sn)",
    secenekler: [
      { label: "Dengesiz (sendeliyor, ayaklarını oynatıyor, gövde salınımı)", pts: 0 },
      { label: "Dengeli, ama yürüteç ya da başka destek kullanıyor", pts: 1 },
      { label: "Destek olmadan dengeli", pts: 2 },
    ],
  },
  {
    id: "d5", baslik: "5. Ayakta denge",
    secenekler: [
      { label: "Dengesiz", pts: 0 },
      { label: "Dengeli, ama geniş tabanlı (topuklar arası > 10 cm) ya da baston/destek kullanıyor", pts: 1 },
      { label: "Dar tabanlı, destek olmadan dengeli", pts: 2 },
    ],
  },
  {
    id: "d6", baslik: "6. İtilme", aciklama: "Ayakları olabildiğince bitişik; inceleyici sternuma avuç içiyle üç kez hafifçe iter.",
    secenekler: [{ label: "Düşmeye başlıyor", pts: 0 }, { label: "Sendeliyor, tutunuyor, kendini topluyor", pts: 1 }, { label: "Dengeli", pts: 2 }],
  },
  {
    id: "d7", baslik: "7. Gözler kapalı", aciklama: "6. maddedeki pozisyonda.",
    secenekler: [{ label: "Dengesiz", pts: 0 }, { label: "Dengeli", pts: 1 }],
  },
  {
    id: "d8a", baslik: "8a. 360° dönüş — adımlar",
    secenekler: [{ label: "Kesik kesik adımlar", pts: 0 }, { label: "Sürekli adımlar", pts: 1 }],
  },
  {
    id: "d8b", baslik: "8b. 360° dönüş — denge",
    secenekler: [{ label: "Dengesiz (tutunuyor, sendeliyor)", pts: 0 }, { label: "Dengeli", pts: 1 }],
  },
  {
    id: "d9", baslik: "9. Oturma",
    secenekler: [
      { label: "Güvensiz (mesafeyi yanlış tahmin ediyor, sandalyeye düşüyor)", pts: 0 },
      { label: "Kollarını kullanıyor ya da hareket akıcı değil", pts: 1 },
      { label: "Güvenli, akıcı hareket", pts: 2 },
    ],
  },
];

const YURUME: ReadonlyArray<Madde> = [
  {
    id: "y10", baslik: "10. Yürümeye başlama", aciklama: "\"Yürü\" komutundan hemen sonra.",
    secenekler: [{ label: "Tereddüt ya da birden fazla girişim", pts: 0 }, { label: "Tereddüt yok", pts: 1 }],
  },
  { id: "y11a", baslik: "11a. Sağ salınım ayağı — ilerleme", secenekler: [{ label: "Sol basma ayağını geçmiyor", pts: 0 }, { label: "Sol basma ayağını geçiyor", pts: 1 }] },
  { id: "y11b", baslik: "11b. Sağ ayak — yerden kalkma", secenekler: [{ label: "Yerden tam kalkmıyor", pts: 0 }, { label: "Yerden tam kalkıyor", pts: 1 }] },
  { id: "y11c", baslik: "11c. Sol salınım ayağı — ilerleme", secenekler: [{ label: "Sağ basma ayağını geçmiyor", pts: 0 }, { label: "Sağ basma ayağını geçiyor", pts: 1 }] },
  { id: "y11d", baslik: "11d. Sol ayak — yerden kalkma", secenekler: [{ label: "Yerden tam kalkmıyor", pts: 0 }, { label: "Yerden tam kalkıyor", pts: 1 }] },
  {
    id: "y12", baslik: "12. Adım simetrisi",
    secenekler: [{ label: "Sağ ve sol adım uzunluğu eşit değil", pts: 0 }, { label: "Eşit görünüyor", pts: 1 }],
  },
  {
    id: "y13", baslik: "13. Adım sürekliliği",
    secenekler: [{ label: "Adımlar arasında duraklama ya da kesinti", pts: 0 }, { label: "Adımlar sürekli", pts: 1 }],
  },
  {
    id: "y14", baslik: "14. Yol", aciklama: "~3 m boyunca bir ayağın düz çizgiden sapması izlenir.",
    secenekler: [
      { label: "Belirgin sapma", pts: 0 },
      { label: "Hafif–orta sapma ya da yürüme yardımcısı kullanıyor", pts: 1 },
      { label: "Yardımcı olmadan düz", pts: 2 },
    ],
  },
  {
    id: "y15", baslik: "15. Gövde",
    secenekler: [
      { label: "Belirgin salınım ya da yürüme yardımcısı kullanıyor", pts: 0 },
      { label: "Salınım yok ama diz/sırt fleksiyonu var ya da kollarını açarak yürüyor", pts: 1 },
      { label: "Salınım, fleksiyon, kol kullanımı ve yardımcı yok", pts: 2 },
    ],
  },
  {
    id: "y16", baslik: "16. Yürüme tabanı",
    secenekler: [{ label: "Topuklar ayrık", pts: 0 }, { label: "Yürürken topuklar neredeyse değiyor", pts: 1 }],
  },
];

const TUM = [...DENGE, ...YURUME];

const BANTLAR: Bant[] = [
  { aralik: "≤ 18", etiket: "Yüksek düşme riski", alt: "Düşme önleme programı, yürüme yardımcısı ve fizyoterapi değerlendirmesi.", renk: "rose" },
  { aralik: "19–23", etiket: "Orta düşme riski", alt: "Denge ve kuvvet egzersizleri; düşme risk etkenlerini gözden geçirin.", renk: "amber" },
  { aralik: "≥ 24", etiket: "Düşük düşme riski", alt: "Belirgin mobilite sorunu yok.", renk: "emerald" },
];

function toplam(liste: ReadonlyArray<Madde>, sel: Record<string, number | null>): number | null {
  if (liste.some((m) => sel[m.id] === null)) return null;
  return liste.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0);
}

export default function TinettiPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(TUM.map((m) => [m.id, null]))
  );
  const denge = toplam(DENGE, sel);
  const yurume = toplam(YURUME, sel);
  const skor = denge !== null && yurume !== null ? denge + yurume : null;
  const bant = skor === null ? null : skor <= 18 ? BANTLAR[0] : skor <= 23 ? BANTLAR[1] : BANTLAR[2];
  const eksik = TUM.filter((m) => sel[m.id] === null).length;

  const bolum = (ad: string, liste: ReadonlyArray<Madde>, puan: number | null, payda: number) => (
    <section className="space-y-3" aria-labelledby={`bolum-${ad}`}>
      <div className="flex items-baseline justify-between px-1">
        <h2 id={`bolum-${ad}`} className="text-sm font-black text-blue-900 uppercase tracking-widest">
          {ad === "denge" ? "Denge" : "Yürüme"}
        </h2>
        <span className="text-[11px] font-black text-slate-600">
          {puan === null ? `${liste.filter((m) => sel[m.id] === null).length} madde kaldı` : `${puan} / ${payda}`}
        </span>
      </div>
      {liste.map((m) => (
        <SecimMaddesi
          key={m.id}
          id={m.id}
          baslik={m.baslik}
          aciklama={m.aciklama}
          secenekler={m.secenekler}
          secili={sel[m.id]}
          onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))}
        />
      ))}
    </section>
  );

  return (
    <OlcekKabugu
      slug="tinetti"
      ikon="🚶"
      baslik="Tinetti POMA"
      altBaslik="Denge (16) + Yürüme (12) · Düşme Riski · 0–28"
      paylasim={{ denge, yurume }}
      not={
        <p>
          Yürüme bölümünde hasta olağan hızında, alışık olduğu yürüme yardımcısıyla koridor boyunca yürür ve güvenli hızda geri döner.
          Eşikler (≤ 18 yüksek · 19–23 orta · ≥ 24 düşük risk) yaygın kullanılan sınıflamadır; farklı yayınlarda küçük değişiklikler görülür.
          Tinetti ME, J Am Geriatr Soc 1986.
        </p>
      }
    >
      {bolum("denge", DENGE, denge, 16)}
      {bolum("yurume", YURUME, yurume, 12)}
      <SkorPaneli
        skor={skor}
        payda={28}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${eksik} madde yanıtlanmadı`}
        ek={skor !== null ? <p className="text-[11px] font-bold text-slate-700">Denge {denge} / 16 · Yürüme {yurume} / 12</p> : null}
      />
    </OlcekKabugu>
  );
}
