"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Lee Prognostik İndeksi — 4 yıllık mortalite (Lee ve ark., JAMA 2006).
 * Toplumda yaşayan ≥ 50 yaş erişkinlerde (Health and Retirement Study) geliştirildi.
 * Kullanım yeri: tarama ve uzun vadeli koruyucu girişimlerin (ör. sıkı glisemik
 * kontrol, kanser taraması) yarar süresini beklenen yaşamla karşılaştırmak.
 */
const YAS_ALT = 50;
const YAS_UST = 110;

/** Yaş puanı — 60 altı 0. */
function yasPuani(yas: number): number {
  if (yas >= 85) return 7;
  if (yas >= 80) return 5;
  if (yas >= 75) return 4;
  if (yas >= 70) return 3;
  if (yas >= 65) return 2;
  if (yas >= 60) return 1;
  return 0;
}

const EVET_HAYIR = (puan: number): Secenek[] => [
  { label: "Hayır", pts: 0 },
  { label: "Evet", pts: puan },
];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "cinsiyet", baslik: "Cinsiyet", secenekler: [{ label: "Kadın", pts: 0 }, { label: "Erkek", pts: 2 }] },
  { id: "dm", baslik: "Diyabet", aciklama: "Hiç diyabet tanısı konmuş mu?", secenekler: EVET_HAYIR(1) },
  { id: "kanser", baslik: "Kanser", aciklama: "Küçük deri kanserleri hariç.", secenekler: EVET_HAYIR(2) },
  { id: "akciger", baslik: "Kronik akciğer hastalığı", aciklama: "Günlük etkinlikleri kısıtlayan ya da evde oksijen gerektiren.", secenekler: EVET_HAYIR(2) },
  { id: "ky", baslik: "Kalp yetmezliği", secenekler: EVET_HAYIR(2) },
  { id: "bki", baslik: "Beden kitle indeksi < 25 kg/m²", secenekler: EVET_HAYIR(1) },
  { id: "sigara", baslik: "Halen sigara içiyor", secenekler: EVET_HAYIR(2) },
  { id: "banyo", baslik: "Banyo yapma ya da duş almada güçlük", aciklama: "Sağlık ya da bellek sorunu nedeniyle.", secenekler: EVET_HAYIR(2) },
  { id: "para", baslik: "Parasını yönetmede güçlük", aciklama: "Faturaları ödemek, harcamaları takip etmek — sağlık ya da bellek sorunu nedeniyle.", secenekler: EVET_HAYIR(2) },
  { id: "yurume", baslik: "Birkaç sokak boyu yürümede güçlük", secenekler: EVET_HAYIR(2) },
  { id: "itme", baslik: "Ağır bir eşyayı (ör. koltuk) itmede ya da çekmede güçlük", secenekler: EVET_HAYIR(1) },
];

/** 4 yıllık mortalite — geliştirme kohortu (Lee 2006). */
const BANTLAR: Bant[] = [
  { aralik: "0–5 puan", etiket: "~%4", alt: "4 yıllık mortalite yaklaşık %4.", renk: "emerald" },
  { aralik: "6–9 puan", etiket: "~%15", alt: "4 yıllık mortalite yaklaşık %15.", renk: "amber" },
  { aralik: "10–13 puan", etiket: "~%42", alt: "4 yıllık mortalite yaklaşık %42.", renk: "orange" },
  { aralik: "≥ 14 puan", etiket: "~%64", alt: "4 yıllık mortalite yaklaşık %64.", renk: "rose" },
];

export default function LeeIndeksiPage() {
  const [yas, setYas] = React.useState("");
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );

  const yasGirildi = sayiGirildiMi(yas);
  const yasNum = parseLocaleNumber(yas);
  const yasGecerli = yasGirildi && Number.isInteger(yasNum) && yasNum >= YAS_ALT && yasNum <= YAS_UST;
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;

  const skor =
    yasGecerli && yanitlanan === MADDELER.length
      ? yasPuani(yasNum) + MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor <= 5 ? BANTLAR[0] : skor <= 9 ? BANTLAR[1] : skor <= 13 ? BANTLAR[2] : BANTLAR[3];

  const eksikler: string[] = [];
  if (!yasGecerli) eksikler.push(yas.trim() === "" ? "yaş girilmedi" : `yaş ${YAS_ALT}–${YAS_UST} arası tam sayı olmalı`);
  if (yanitlanan < MADDELER.length) eksikler.push(`${MADDELER.length - yanitlanan} madde yanıtlanmadı`);

  return (
    <OlcekKabugu
      slug="lee-indeksi"
      ikon="⏳"
      baslik="Lee Prognostik İndeksi"
      altBaslik="4 Yıllık Mortalite · Toplumda Yaşayan ≥ 50 Yaş · 0–26"
      paylasim={{ ...Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]])), yas: yasGecerli ? yasNum : null }}
      not={
        <p>
          Yüzdeler özgün geliştirme kohortuna (ABD, Health and Retirement Study) aittir ve hastaneye yatan ya da bakımevinde yaşayan hastaya
          genellenemez. Beklenen yaşam süresi, yararı yıllar sonra ortaya çıkan girişimlerin (kanser taraması, sıkı HbA1c hedefi) tartışılmasında kullanılır.
          Lee SJ ve ark., JAMA 2006; ePrognosis.
        </p>
      }
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-black text-blue-900">Yaş (yıl)</span>
          <span className="text-[11px] text-slate-600 leading-snug">
            60–64: 1 · 65–69: 2 · 70–74: 3 · 75–79: 4 · 80–84: 5 · ≥ 85: 7 puan (60 altı 0)
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={yas}
            onChange={(e) => setYas(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg sm:max-w-[12rem]"
          />
        </label>
        {yasGecerli && <p className="text-[11px] font-bold text-slate-700 mt-2">Yaş puanı: {yasPuani(yasNum)}</p>}
      </div>

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

      <SkorPaneli skor={skor} payda={26} bantlar={BANTLAR} aktif={bant} eksikMetni={eksikler.join(" · ")} />
    </OlcekKabugu>
  );
}
