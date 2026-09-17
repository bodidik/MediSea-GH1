"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Tilburg Kırılganlık Göstergesi (TFI) — Gobbens ve ark., JAMDA 2010. B bölümü, 15 madde.
 *
 * "Bazen" şıkkının puanı MADDEYE göre değişir: bellekte 0, çökkünlük/kaygı/
 * yalnızlıkta 1. Ortak bir evet/bazen/hayır dizisi bu farkı silerdi.
 */
type Madde = { id: string; baslik: string; aciklama?: string; secenekler: Secenek[] };

const EVET1: Secenek[] = [{ label: "Evet", pts: 1 }, { label: "Hayır", pts: 0 }];
const HAYIR1: Secenek[] = [{ label: "Evet", pts: 0 }, { label: "Hayır", pts: 1 }];
const BAZEN1: Secenek[] = [{ label: "Evet", pts: 1 }, { label: "Bazen", pts: 1 }, { label: "Hayır", pts: 0 }];

const FIZIKSEL: ReadonlyArray<Madde> = [
  { id: "saglikli", baslik: "Kendinizi fiziksel olarak sağlıklı hissediyor musunuz?", secenekler: HAYIR1 },
  {
    id: "kilo", baslik: "İstemediğiniz hâlde son zamanlarda çok kilo kaybettiniz mi?",
    aciklama: "Son 6 ayda ≥ 6 kg ya da son 1 ayda ≥ 3 kg.", secenekler: EVET1,
  },
  { id: "yurume", baslik: "Günlük yaşamda yürüme güçlüğü nedeniyle sorun yaşıyor musunuz?", secenekler: EVET1 },
  { id: "denge", baslik: "… dengenizi korumada güçlük nedeniyle?", secenekler: EVET1 },
  { id: "isitme", baslik: "… iyi duyamamanız nedeniyle?", secenekler: EVET1 },
  { id: "gorme", baslik: "… iyi görememeniz nedeniyle?", secenekler: EVET1 },
  { id: "el", baslik: "… ellerinizde güç kaybı nedeniyle?", secenekler: EVET1 },
  { id: "yorgunluk", baslik: "… fiziksel yorgunluk nedeniyle?", secenekler: EVET1 },
];
const PSIKOLOJIK: ReadonlyArray<Madde> = [
  { id: "bellek", baslik: "Belleğinizle ilgili sorunlarınız var mı?", secenekler: [{ label: "Evet", pts: 1 }, { label: "Bazen", pts: 0 }, { label: "Hayır", pts: 0 }] },
  { id: "cokkun", baslik: "Son 1 ayda kendinizi çökkün hissettiniz mi?", secenekler: BAZEN1 },
  { id: "kaygi", baslik: "Son 1 ayda kendinizi sinirli ya da kaygılı hissettiniz mi?", secenekler: BAZEN1 },
  { id: "basa", baslik: "Sorunlarla iyi başa çıkabiliyor musunuz?", secenekler: HAYIR1 },
];
const SOSYAL: ReadonlyArray<Madde> = [
  { id: "yalniz", baslik: "Yalnız mı yaşıyorsunuz?", secenekler: EVET1 },
  { id: "ozlem", baslik: "Bazen etrafınızda insanların olmamasını özlüyor musunuz?", secenekler: BAZEN1 },
  { id: "destek", baslik: "Başkalarından yeterli destek alıyor musunuz?", secenekler: HAYIR1 },
];

const BOLUMLER = [
  { id: "fiziksel", ad: "Fiziksel", liste: FIZIKSEL, payda: 8 },
  { id: "psikolojik", ad: "Psikolojik", liste: PSIKOLOJIK, payda: 4 },
  { id: "sosyal", ad: "Sosyal", liste: SOSYAL, payda: 3 },
] as const;
const TUM = [...FIZIKSEL, ...PSIKOLOJIK, ...SOSYAL];

const BANTLAR: Bant[] = [
  { aralik: "0–4", etiket: "Kırılgan değil", alt: "TFI eşiğinin altında.", renk: "emerald" },
  { aralik: "≥ 5", etiket: "Kırılgan", alt: "Çok boyutlu kırılganlık — hangi alanın ağır bastığına göre multidisipliner değerlendirme.", renk: "rose" },
];

function toplam(liste: ReadonlyArray<Madde>, sel: Record<string, number | null>): number | null {
  if (liste.some((m) => sel[m.id] === null)) return null;
  return liste.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0);
}

export default function TilburgPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(TUM.map((m) => [m.id, null])));
  const puanlar = BOLUMLER.map((b) => toplam(b.liste, sel));
  const skor = puanlar.every((p) => p !== null) ? (puanlar as number[]).reduce((a, b) => a + b, 0) : null;
  const bant = skor === null ? null : skor >= 5 ? BANTLAR[1] : BANTLAR[0];
  const eksik = TUM.filter((m) => sel[m.id] === null).length;

  return (
    <OlcekKabugu
      slug="tilburg-kirilganlik"
      ikon="🧩"
      baslik="Tilburg Kırılganlık Göstergesi"
      altBaslik="TFI · Fiziksel · Psikolojik · Sosyal · 0–15"
      paylasim={{ tfi: skor }}
      not={
        <p>
          TFI, kırılganlığı yalnız fiziksel değil psikolojik ve sosyal boyutlarıyla ele alır; kendi bildirimine dayalıdır. Bu sayfa ölçeğin
          B bölümünü (kırılganlık bileşenleri) içerir; A bölümündeki sosyodemografik ve hastalık soruları puanlanmaz. Eşik ≥ 5.
          Gobbens RJ ve ark., J Am Med Dir Assoc 2010.
        </p>
      }
    >
      {BOLUMLER.map((b, i) => (
        <section key={b.id} className="space-y-3" aria-labelledby={`tfi-${b.id}`}>
          <div className="flex items-baseline justify-between px-1">
            <h2 id={`tfi-${b.id}`} className="text-sm font-black text-blue-900 uppercase tracking-widest">{b.ad}</h2>
            <span className="text-[11px] font-black text-slate-600">
              {puanlar[i] === null ? `${b.liste.filter((m) => sel[m.id] === null).length} madde kaldı` : `${puanlar[i]} / ${b.payda}`}
            </span>
          </div>
          {b.liste.map((m) => (
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
      ))}
      <SkorPaneli
        skor={skor}
        payda={15}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${eksik} madde yanıtlanmadı`}
        ek={
          skor !== null ? (
            <p className="text-[11px] font-bold text-slate-700">
              {BOLUMLER.map((b, i) => `${b.ad} ${puanlar[i]} / ${b.payda}`).join(" · ")}
            </p>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
