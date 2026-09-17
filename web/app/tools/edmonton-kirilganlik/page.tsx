"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Edmonton Kırılganlık Ölçeği (EFS) — Rolfson ve ark., Age Ageing 2006.
 * 9 alan, 11 madde, 0–17. Saat çizme ve Süreli Kalk-Yürü testi performansa dayalı.
 */
const EVET1: Secenek[] = [
  { label: "Hayır", pts: 0 },
  { label: "Evet", pts: 1 },
];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  {
    id: "bilis",
    baslik: "Biliş — Saat çizme",
    aciklama: "Önceden çizilmiş daireye rakamları yerleştirip saati \"on biri on geçe\" gösterecek şekilde akrep ve yelkovanı çizmesi istenir.",
    secenekler: [
      { label: "Hatasız", pts: 0 },
      { label: "Küçük aralık hataları", pts: 1 },
      { label: "Diğer hatalar", pts: 2 },
    ],
  },
  {
    id: "yatis",
    baslik: "Genel sağlık — Son 1 yılda kaç kez hastaneye yattı?",
    secenekler: [
      { label: "0", pts: 0 },
      { label: "1–2", pts: 1 },
      { label: "> 2", pts: 2 },
    ],
  },
  {
    id: "saglik",
    baslik: "Genel sağlık — Genel olarak sağlığınızı nasıl tanımlarsınız?",
    secenekler: [
      { label: "Mükemmel / çok iyi / iyi", pts: 0 },
      { label: "Orta", pts: 1 },
      { label: "Kötü", pts: 2 },
    ],
  },
  {
    id: "bagimsizlik",
    baslik: "Fonksiyonel bağımsızlık — Kaç etkinlikte yardım gerekiyor?",
    aciklama: "Yemek hazırlama · alışveriş · ulaşım · telefon · ev işi · çamaşır · para yönetimi · ilaçlarını alma",
    secenekler: [
      { label: "0–1", pts: 0 },
      { label: "2–4", pts: 1 },
      { label: "5–8", pts: 2 },
    ],
  },
  {
    id: "destek",
    baslik: "Sosyal destek — Yardıma ihtiyaç duyduğunuzda istekli ve yapabilecek birine güvenebilir misiniz?",
    secenekler: [
      { label: "Her zaman", pts: 0 },
      { label: "Bazen", pts: 1 },
      { label: "Hiçbir zaman", pts: 2 },
    ],
  },
  { id: "ilacSayi", baslik: "İlaç kullanımı — Düzenli olarak 5 ya da daha fazla reçeteli ilaç kullanıyor musunuz?", secenekler: EVET1 },
  { id: "ilacUnutma", baslik: "İlaç kullanımı — Zaman zaman ilaçlarınızı almayı unutuyor musunuz?", secenekler: EVET1 },
  { id: "beslenme", baslik: "Beslenme — Son zamanlarda giysileriniz bollaşacak kadar kilo kaybettiniz mi?", secenekler: EVET1 },
  { id: "duygu", baslik: "Duygudurum — Sık sık üzgün ya da çökkün hissediyor musunuz?", secenekler: EVET1 },
  { id: "kontinans", baslik: "Kontinans — İstemediğiniz hâlde idrar kaçırma sorununuz var mı?", secenekler: EVET1 },
  {
    id: "tug",
    baslik: "Fonksiyonel performans — Süreli Kalk ve Yürü testi",
    aciklama: "Kollu sandalyede sırtı dayalı otururken kalkıp 3 m yürümesi, dönüp gelmesi ve oturması istenir.",
    secenekler: [
      { label: "0–10 sn", pts: 0 },
      { label: "11–20 sn", pts: 1 },
      { label: "> 20 sn / isteksiz / yardım gerekiyor", pts: 2 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0–4", etiket: "Kırılgan değil", alt: "Kırılganlık bulgusu yok.", renk: "emerald" },
  { aralik: "5–6", etiket: "Kırılganlığa yatkın", alt: "Görünürde kırılganlığa yatkın (vulnerable).", renk: "amber" },
  { aralik: "7–8", etiket: "Hafif kırılgan", alt: "Hafif kırılganlık — kapsamlı geriatrik değerlendirme önerilir.", renk: "orange" },
  { aralik: "9–10", etiket: "Orta kırılgan", alt: "Orta kırılganlık.", renk: "rose" },
  { aralik: "≥ 11", etiket: "Ağır kırılgan", alt: "Ağır kırılganlık.", renk: "rose" },
];

function bantBul(s: number): Bant {
  if (s <= 4) return BANTLAR[0];
  if (s <= 6) return BANTLAR[1];
  if (s <= 8) return BANTLAR[2];
  if (s <= 10) return BANTLAR[3];
  return BANTLAR[4];
}

export default function EdmontonPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : bantBul(skor);

  return (
    <OlcekKabugu
      slug="edmonton-kirilganlik"
      ikon="🍁"
      baslik="Edmonton Kırılganlık Ölçeği"
      altBaslik="EFS · 9 Alan · 11 Madde · 0–17"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          EFS geriatri uzmanı olmayan klinisyenler için geliştirilmiş, performansa dayalı iki madde (saat çizme, Kalk ve Yürü) içeren çok boyutlu bir ölçektir;
          uygulama süresi ~5 dakikadır. Rolfson DB ve ark., Age Ageing 2006.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
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
      </div>
      <SkorPaneli
        skor={skor}
        payda={17}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
