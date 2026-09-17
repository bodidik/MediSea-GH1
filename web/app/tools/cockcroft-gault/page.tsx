"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { KILO_ALT, KILO_UST, kiloMakulMu, parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Cockcroft-Gault kreatinin klirensi (Cockcroft & Gault, Nephron 1976).
 *
 *   CrCl (mL/dk) = (140 − yaş) × ağırlık / (72 × SCr)   × 0,85 kadında
 *
 * eGFR'nin aksine vücut yüzeyine NORMALİZE DEĞİL; ilaç prospektüslerinin çoğu
 * doz ayarını bu değerle verdiği için ayrı araç. Hangi AĞIRLIĞIN kullanılacağı
 * formülün kendisinde tanımlı değil — araç üçünü de hesaplıyor ve hangisinin
 * yaygın uygulamada seçildiğini söylüyor, kararı gizlemiyor.
 */
const YAS_ALT = 18;
const YAS_UST = 120;
const SCR_ALT = 0.1;
const SCR_UST = 30;
const BOY_ALT = 120;
const BOY_UST = 250;

/** Obezite ölçütü: BKİ ≥ 30 ya da gerçek ağırlık ideal ağırlığın %120'sinden fazla. */
const OBEZ_BKI = 30;
const OBEZ_IBW_ORANI = 1.2;
const AYARLI_KATSAYI = 0.4;

type Cinsiyet = "male" | "female";

function crcl(yas: number, kilo: number, scr: number, c: Cinsiyet): number {
  return ((140 - yas) * kilo) / (72 * scr) * (c === "female" ? 0.85 : 1);
}

/** Devine (1974) — `bmi` aracıyla aynı katsayılar. */
function idealKilo(boyCm: number, c: Cinsiyet): number {
  return (c === "male" ? 50 : 45.5) + 2.3 * ((boyCm - 152.4) / 2.54);
}

const BANTLAR: Bant[] = [
  { aralik: "≥ 90", etiket: "Normal", alt: "Böbrek işlevine göre doz ayarı genellikle gerekmez.", renk: "emerald" },
  { aralik: "60–89", etiket: "Hafif azalmış", alt: "Dar terapötik aralıklı ilaçlarda prospektüsü kontrol edin.", renk: "amber" },
  { aralik: "30–59", etiket: "Orta azalmış", alt: "Böbrekten atılan ilaçların çoğunda doz ayarı gerekir.", renk: "orange" },
  { aralik: "15–29", etiket: "Ağır azalmış", alt: "Pek çok ilaç kontrendike ya da belirgin doz azaltımı gerekir.", renk: "rose" },
  { aralik: "< 15", etiket: "Böbrek yetmezliği", alt: "Diyaliz durumunu da hesaba katarak ilaç ilaç değerlendirin.", renk: "rose" },
];

function bantBul(v: number): Bant {
  if (v >= 90) return BANTLAR[0];
  if (v >= 60) return BANTLAR[1];
  if (v >= 30) return BANTLAR[2];
  if (v >= 15) return BANTLAR[3];
  return BANTLAR[4];
}

const girdiSinifi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg";

export default function CockcroftGaultPage() {
  const [yas, setYas] = React.useState("");
  const [kilo, setKilo] = React.useState("");
  const [scr, setScr] = React.useState("");
  const [boy, setBoy] = React.useState("");
  const [cinsiyet, setCinsiyet] = React.useState<Cinsiyet>("male");

  const yasN = parseLocaleNumber(yas);
  const kiloN = parseLocaleNumber(kilo);
  const scrN = parseLocaleNumber(scr);
  const boyN = parseLocaleNumber(boy);

  const yasOk = sayiGirildiMi(yas) && yasN >= YAS_ALT && yasN <= YAS_UST;
  const kiloOk = kiloMakulMu(kilo);
  const scrOk = sayiGirildiMi(scr) && scrN >= SCR_ALT && scrN <= SCR_UST;
  const boyGirildi = boy.trim() !== "";
  const boyOk = sayiGirildiMi(boy) && boyN >= BOY_ALT && boyN <= BOY_UST;

  const eksikler = [
    !yasOk && `yaş (${YAS_ALT}–${YAS_UST})`,
    !kiloOk && `ağırlık (${KILO_ALT}–${KILO_UST} kg)`,
    !scrOk && `kreatinin (${String(SCR_ALT).replace(".", ",")}–${SCR_UST} mg/dL)`,
    boyGirildi && !boyOk && `boy (${BOY_ALT}–${BOY_UST} cm) — ya da boş bırakın`,
  ].filter(Boolean) as string[];

  const temelOk = yasOk && kiloOk && scrOk && (!boyGirildi || boyOk);
  const gercek = temelOk ? crcl(yasN, kiloN, scrN, cinsiyet) : null;

  // Boy verildiyse ideal ve ayarlanmış ağırlık.
  const ibw = temelOk && boyOk ? idealKilo(boyN, cinsiyet) : null;
  const bki = temelOk && boyOk ? kiloN / (boyN / 100) ** 2 : null;
  const ayarliKilo = ibw !== null ? ibw + AYARLI_KATSAYI * (kiloN - ibw) : null;

  type Satir = { id: "gercek" | "ideal" | "ayarli"; ad: string; kilo: number; deger: number };
  const satirlar: Satir[] = [];
  if (gercek !== null) satirlar.push({ id: "gercek", ad: "Gerçek ağırlık", kilo: kiloN, deger: gercek });
  if (ibw !== null && ibw > 0 && ayarliKilo !== null) {
    satirlar.push({ id: "ideal", ad: "İdeal ağırlık (Devine)", kilo: ibw, deger: crcl(yasN, ibw, scrN, cinsiyet) });
    satirlar.push({ id: "ayarli", ad: "Ayarlanmış ağırlık", kilo: ayarliKilo, deger: crcl(yasN, ayarliKilo, scrN, cinsiyet) });
  }

  /**
   * Yaygın uygulama: gerçek < ideal → gerçek; obez → ayarlanmış; öteki → ideal.
   * Boy yoksa seçim yapılamaz ve gerçek ağırlık kullanılır — ekranda bu söyleniyor.
   */
  let onerilen: Satir["id"] = "gercek";
  let gerekce = "Boy girilmedi — gerçek ağırlık kullanıldı. Obez ya da zayıf hastada boy girerek ideal/ayarlanmış ağırlıkla karşılaştırın.";
  if (satirlar.length === 3 && ibw !== null && bki !== null) {
    if (kiloN < ibw) {
      onerilen = "gercek";
      gerekce = "Gerçek ağırlık ideal ağırlığın altında — gerçek ağırlık kullanılır.";
    } else if (bki >= OBEZ_BKI || kiloN > ibw * OBEZ_IBW_ORANI) {
      onerilen = "ayarli";
      gerekce = `Obezite (BKİ ${bki.toFixed(1).replace(".", ",")} ya da ağırlık ideal ağırlığın %120'sinden fazla) — ayarlanmış ağırlık kullanılır.`;
    } else {
      onerilen = "ideal";
      gerekce = "Ağırlık ideal ile ideal ağırlığın %120'si arasında — ideal ağırlık kullanılır.";
    }
  }

  const secilen = satirlar.find((s) => s.id === onerilen) ?? null;
  const sonuc = secilen ? Math.round(secilen.deger) : null;
  const bant = sonuc !== null ? bantBul(sonuc) : null;

  const tr = (n: number) => n.toFixed(1).replace(".", ",");

  return (
    <OlcekKabugu
      slug="cockcroft-gault"
      ikon="🧪"
      baslik="Cockcroft-Gault"
      altBaslik="Kreatinin Klirensi · İlaç Doz Ayarı · mL/dk"
      paylasim={{ yas: yasOk ? yasN : null, kilo: kiloOk ? kiloN : null, scr: scrOk ? scrN : null, boy: boyOk ? boyN : null, cinsiyet }}
      not={
        <>
          <p>
            CrCl = (140 − yaş) × ağırlık / (72 × kreatinin) × 0,85 (kadın). Sonuç vücut yüzeyine göre normalize <strong>edilmemiştir</strong>;
            KDIGO evrelemesi için eGFR (CKD-EPI 2021) kullanın. Kararsız böbrek işlevinde (AKI), çok düşük kas kütlesinde ve ampute hastada güvenilmez.
          </p>
          <p>
            Yaşlı hastada düşük kreatinini 1,0 mg/dL'ye yuvarlamak yaygın ama kanıta dayanmayan bir uygulamadır; araç girilen değeri olduğu gibi kullanır.
            Ağırlık seçimi yaygın uygulamayı izler — ilacın prospektüsü farklı bir ağırlık tanımlıyorsa o geçerlidir.
            Cockcroft DW, Gault MH, Nephron 1976.
          </p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Yaş (yıl)</span>
          <input type="text" inputMode="numeric" value={yas} onChange={(e) => setYas(e.target.value)} className={girdiSinifi} />
        </label>
        <div role="radiogroup" aria-labelledby="cg-cinsiyet" className="flex flex-col gap-2">
          <span id="cg-cinsiyet" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Cinsiyet</span>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((c) => (
              <label
                key={c}
                className={`flex-1 min-h-[52px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer
                  ${cinsiyet === c ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
              >
                <input type="radio" name="cg-cinsiyet" className="sr-only" checked={cinsiyet === c} onChange={() => setCinsiyet(c)} />
                {c === "male" ? "Erkek" : "Kadın"}
              </label>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Gerçek ağırlık (kg)</span>
          <input type="text" inputMode="decimal" value={kilo} onChange={(e) => setKilo(e.target.value)} className={girdiSinifi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Serum kreatinin (mg/dL)</span>
          <input type="text" inputMode="decimal" value={scr} onChange={(e) => setScr(e.target.value)} className={girdiSinifi} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Boy (cm) — isteğe bağlı, ideal/ayarlanmış ağırlık için</span>
          <input type="text" inputMode="decimal" value={boy} onChange={(e) => setBoy(e.target.value)} className={`${girdiSinifi} sm:max-w-[16rem]`} />
        </label>
      </div>

      <BinlikUyari girdiler={[{ ad: "Ağırlık", ham: kilo }]} />

      {eksikler.length > 0 && (yas + kilo + scr + boy).trim() !== "" && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Hesaplanamadı — kontrol edin: {eksikler.join(" · ")}
        </div>
      )}

      <SkorPaneli
        skor={sonuc}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni="Yaş, ağırlık ve kreatinin girin"
        ek={
          sonuc !== null ? (
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-slate-800">
                <span className="text-2xl font-black text-blue-900">{sonuc}</span> mL/dk · {gerekce}
              </p>
              {satirlar.length === 3 && (
                <table className="w-full text-[11px] bg-white/70 rounded-xl overflow-hidden">
                  <caption className="sr-only">Üç ağırlıkla kreatinin klirensi</caption>
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th scope="col" className="px-3 py-2">Ağırlık</th>
                      <th scope="col" className="px-3 py-2">kg</th>
                      <th scope="col" className="px-3 py-2">CrCl (mL/dk)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {satirlar.map((s) => (
                      <tr key={s.id} className={s.id === onerilen ? "font-black text-blue-900" : "text-slate-700"}>
                        <th scope="row" className="px-3 py-1.5 text-left font-[inherit]">
                          {s.ad}{s.id === onerilen ? " (kullanılan)" : ""}
                        </th>
                        <td className="px-3 py-1.5">{tr(s.kilo)}</td>
                        <td className="px-3 py-1.5">{Math.round(s.deger)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
