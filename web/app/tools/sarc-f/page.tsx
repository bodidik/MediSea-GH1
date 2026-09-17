"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * SARC-F (Malmstrom & Morley, JAMDA 2013) + isteğe bağlı SARC-CalF
 * (Barbosa-Silva ve ark., JAMDA 2016). EWGSOP2 sarkopeni vaka bulmada SARC-F öneriyor.
 */
const ZORLUK: Secenek[] = [
  { label: "Hiç zorlanmıyor", pts: 0 },
  { label: "Biraz", pts: 1 },
  { label: "Çok / yapamıyor", pts: 2 },
];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama: string; secenekler: Secenek[] }> = [
  { id: "guc", baslik: "S — Güç", aciklama: "4,5 kg'lık bir yükü kaldırmakta ya da taşımakta ne kadar zorlanıyor?", secenekler: ZORLUK },
  {
    id: "yurume",
    baslik: "A — Yürümede yardım",
    aciklama: "Bir odanın bir ucundan öbür ucuna yürümekte ne kadar zorlanıyor?",
    secenekler: [
      { label: "Hiç zorlanmıyor", pts: 0 },
      { label: "Biraz", pts: 1 },
      { label: "Çok / yardımcı araç kullanıyor / yapamıyor", pts: 2 },
    ],
  },
  {
    id: "kalkma",
    baslik: "R — Sandalyeden kalkma",
    aciklama: "Sandalyeden ya da yataktan kalkıp geçmekte ne kadar zorlanıyor?",
    secenekler: [
      { label: "Hiç zorlanmıyor", pts: 0 },
      { label: "Biraz", pts: 1 },
      { label: "Çok / yardımsız yapamıyor", pts: 2 },
    ],
  },
  { id: "merdiven", baslik: "C — Merdiven çıkma", aciklama: "10 basamaklık bir kat merdiveni çıkmakta ne kadar zorlanıyor?", secenekler: ZORLUK },
  {
    id: "dusme",
    baslik: "F — Düşmeler",
    aciklama: "Son 1 yılda kaç kez düştü?",
    secenekler: [
      { label: "Hiç", pts: 0 },
      { label: "1–3 kez", pts: 1 },
      { label: "4 ya da daha fazla", pts: 2 },
    ],
  },
];

/** SARC-CalF baldır çevresi eşiği (cm) — bu değer ve altı +10 puan. */
const BALDIR_ESIK = { male: 34, female: 33 } as const;
const BALDIR_ALT = 15;
const BALDIR_UST = 70;

const BANT_F: Bant[] = [
  { aralik: "0–3", etiket: "Tarama negatif", alt: "Sarkopeni açısından tarama negatif.", renk: "emerald" },
  { aralik: "≥ 4", etiket: "Sarkopeni şüphesi", alt: "Kas gücü (el kavrama, sandalyeden kalkma) ve kas kütlesi ile doğrulayın (EWGSOP2).", renk: "rose" },
];
const BANT_CALF: Bant[] = [
  { aralik: "0–10", etiket: "Tarama negatif", alt: "SARC-CalF negatif.", renk: "emerald" },
  { aralik: "≥ 11", etiket: "Sarkopeni şüphesi", alt: "SARC-CalF pozitif — kas gücü ve kas kütlesi ile doğrulayın (EWGSOP2).", renk: "rose" },
];

export default function SarcFPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const [cinsiyet, setCinsiyet] = React.useState<"male" | "female" | null>(null);
  const [baldir, setBaldir] = React.useState("");

  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const sarcF =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;

  const baldirGirildi = sayiGirildiMi(baldir);
  const baldirNum = parseLocaleNumber(baldir);
  const baldirMakul = baldirGirildi && baldirNum >= BALDIR_ALT && baldirNum <= BALDIR_UST;
  // CalF kipi: kullanıcı baldır alanına bir şey yazdığı anda devreye girer.
  const calfKipi = baldir.trim() !== "";
  const calfEksik = calfKipi && (!baldirMakul || cinsiyet === null);
  const calfPuan = calfKipi && !calfEksik ? (baldirNum <= BALDIR_ESIK[cinsiyet!] ? 10 : 0) : 0;

  const skor = sarcF === null || calfEksik ? null : sarcF + calfPuan;
  const bantlar = calfKipi ? BANT_CALF : BANT_F;
  const bant = skor === null ? null : calfKipi ? (skor >= 11 ? BANT_CALF[1] : BANT_CALF[0]) : skor >= 4 ? BANT_F[1] : BANT_F[0];

  let eksik = `${MADDELER.length - yanitlanan} madde yanıtlanmadı`;
  if (sarcF !== null && calfEksik) {
    eksik = cinsiyet === null
      ? "SARC-CalF için cinsiyet seçin"
      : `Baldır çevresi ${BALDIR_ALT}–${BALDIR_UST} cm aralığında olmalı`;
  }

  return (
    <OlcekKabugu
      slug="sarc-f"
      ikon="💪"
      baslik="SARC-F"
      altBaslik="Sarkopeni Taraması · 0–10 · isteğe bağlı SARC-CalF 0–20"
      paylasim={{ ...Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]])), calf: calfKipi ? 1 : 0 }}
      not={
        <p>
          SARC-F duyarlılığı düşük, özgüllüğü yüksek bir vaka bulma aracıdır — negatif sonuç sarkopeniyi dışlamaz. Baldır çevresinin eklenmesi
          (SARC-CalF) duyarlılığı artırır; ödem ya da obezite baldır çevresini yanıltabilir. Malmstrom TK, Morley JE, JAMDA 2013;
          Barbosa-Silva TG ve ark., JAMDA 2016; Cruz-Jentoft AJ ve ark. (EWGSOP2), Age Ageing 2019.
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

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <p className="text-[11px] font-black text-blue-900 uppercase tracking-wide">SARC-CalF — isteğe bağlı</p>
        <p className="text-[11px] text-slate-600 leading-snug">
          Baldır çevresi (en geniş yer, oturur ya da ayakta) erkekte ≤ {BALDIR_ESIK.male} cm, kadında ≤ {BALDIR_ESIK.female} cm ise +10 puan.
          Boş bırakılırsa yalnızca SARC-F hesaplanır.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div role="radiogroup" aria-labelledby="calf-cinsiyet" className="flex flex-col gap-2">
            <span id="calf-cinsiyet" className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cinsiyet</span>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((c) => (
                <label
                  key={c}
                  className={`flex-1 min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[11px] font-black cursor-pointer
                    ${cinsiyet === c ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  <input type="radio" name="calf-cinsiyet" className="sr-only" checked={cinsiyet === c} onChange={() => setCinsiyet(c)} />
                  {c === "male" ? "Erkek" : "Kadın"}
                </label>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Baldır çevresi (cm)</span>
            <input
              type="text"
              inputMode="decimal"
              value={baldir}
              onChange={(e) => setBaldir(e.target.value)}
              placeholder="ör. 32"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg"
            />
          </label>
        </div>
      </div>

      <SkorPaneli
        skor={skor}
        payda={calfKipi ? 20 : 10}
        bantlar={bantlar}
        aktif={bant}
        eksikMetni={eksik}
        ek={
          calfKipi && skor !== null ? (
            <p className="text-[11px] font-bold text-slate-700">
              SARC-F {sarcF} + baldır {calfPuan} = {skor}
            </p>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
