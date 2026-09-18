"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Aldosteron/renin oranı (ARR) — primer aldosteronizm taraması, plazma renin aktivitesiyle (PRA).
 *   ARR = aldosteron (ng/dL) / PRA (ng/mL/saat)
 * Aldosteron pmol/L ise 27,7'ye bölünür. PRA ölçüm alt sınırının altındaysa oran yapay olarak büyür;
 * araç PRA'yı 0,2 ng/mL/saat'e taban kabul ediyor ve bunu ekranda söylüyor.
 *
 * Tarama pozitifliği için oran YETMEZ, aldosteron da anlamlı olmalı (≥ 15 ng/dL, bazı merkezler ≥ 10);
 * oran yüksek ama aldosteron düşükse yanlış pozitif ihtimali yazılıyor.
 */
const PRA_TABAN = 0.2;
const ARR_ESIK = 30;
const ALDO_ESIK = 15;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function AldosteronReninPage() {
  const [aldo, setAldo] = React.useState("");
  const [birim, setBirim] = React.useState<"ngdl" | "pmol">("ngdl");
  const [pra, setPra] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const aldoHam = n(aldo);
  const aldoNgdl = birim === "ngdl" ? aldoHam : aldoHam / 27.7;
  const aldoOk = sayiGirildiMi(aldo) && aldoNgdl >= 0 && aldoNgdl <= 500;
  // Meşru düşük değer: PRA ölçüm sınırının altında olabilir.
  const praOk = sayiGirildiMi(pra) && n(pra) >= 0 && n(pra) <= 100;
  const praKullanilan = praOk ? Math.max(n(pra), PRA_TABAN) : null;
  const tabanUygulandi = praOk && n(pra) < PRA_TABAN;

  const arr = aldoOk && praKullanilan !== null ? Math.round((aldoNgdl / praKullanilan) * 10) / 10 : null;
  const tr = (x: number, h = 1) => (Math.round(x * 10 ** h) / 10 ** h).toString().replace(".", ",");

  const yorum =
    arr === null ? null
      : arr >= ARR_ESIK && aldoNgdl >= ALDO_ESIK ? { t: "Tarama pozitif", a: "Primer aldosteronizm olası — doğrulama testi (salin infüzyon, oral tuz yükleme, kaptopril ya da fludrokortizon) ya da belirgin tabloda (hipokalemi, baskılı renin, aldosteron > 20 ng/dL) doğrudan lokalizasyon.", r: "border-rose-200 bg-rose-50 text-rose-900" }
      : arr >= ARR_ESIK ? { t: "Oran yüksek, aldosteron düşük", a: `ARR ≥ ${ARR_ESIK} ama aldosteron < ${ALDO_ESIK} ng/dL — oran düşük renin nedeniyle yükselmiş olabilir (yaş, beta bloker, düşük reninli hipertansiyon). Ölçümü koşulları düzelterek tekrarlayın.`, r: "border-amber-200 bg-amber-50 text-amber-900" }
      : arr >= 20 ? { t: "Sınırda (20–29)", a: "Bazı merkezlerin eşiği 20 — klinik şüphe yüksekse tekrar ölçüm ya da doğrulama testi.", r: "border-amber-200 bg-amber-50 text-amber-900" }
      : { t: "Tarama negatif", a: "Primer aldosteronizm olasılığı düşük (interferans yapan ilaçlar ve hipokalemi dışlandıysa).", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };

  return (
    <OlcekKabugu
      slug="aldosteron-renin"
      ikon="🧂"
      baslik="Aldosteron/Renin Oranı"
      altBaslik="Primer Aldosteronizm Taraması · PRA ile ARR"
      paylasim={{ arr }}
      not={
        <p>
          Örnek sabah, kalktıktan ≥ 2 saat sonra, 5–15 dk oturur pozisyonda alınır; hipokalemi düzeltilmiş, tuz alımı kısıtlanmamış olmalıdır. Mineralokortikoid
          reseptör antagonistleri ve amilorid 4 hafta önce kesilir; ACE inhibitörü, ARB, diüretik (yanlış negatif) ile beta bloker ve santral α2 agonist
          (yanlış pozitif) oranı etkiler. Eşikler laboratuvara göre 20–40 arasında değişir; burada 30 kullanıldı. Direkt renin konsantrasyonu (DRC) ile
          hesaplanan oran farklı eşik gerektirir. Funder JW ve ark., Endocrine Society kılavuzu, JCEM 2016.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Aldosteron ({birim === "ngdl" ? "ng/dL" : "pmol/L"})</span>
            <input type="text" inputMode="decimal" value={aldo} onChange={(e) => setAldo(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Plazma renin aktivitesi (ng/mL/saat)</span>
            <input type="text" inputMode="decimal" value={pra} onChange={(e) => setPra(e.target.value)} className={girdi} />
          </label>
        </div>
        <div role="radiogroup" aria-labelledby="arr-birim" className="flex flex-col gap-2">
          <span id="arr-birim" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Aldosteron birimi</span>
          <div className="flex gap-2 sm:max-w-sm">
            {([["ngdl", "ng/dL"], ["pmol", "pmol/L"]] as const).map(([k, ad]) => (
              <label key={k} className={`flex-1 min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer ${birim === k ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <input type="radio" name="arr-birim" className="sr-only" checked={birim === k} onChange={() => setBirim(k)} />
                {ad}
              </label>
            ))}
          </div>
        </div>
      </div>

      <SonucDuyuru metin={arr !== null && yorum ? `ARR ${tr(arr)} — ${yorum.t}` : null} />
      {arr !== null && yorum ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yorum.r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">ARR (ng/dL ÷ ng/mL/saat)</p>
          <p className="text-4xl font-black">{tr(arr)}</p>
          <p className="text-lg font-black">{yorum.t}</p>
          <p className="text-[12px] font-bold">{yorum.a}</p>
          <p className="text-[12px] font-bold">
            Aldosteron {tr(aldoNgdl)} ng/dL{birim === "pmol" ? ` (${tr(aldoHam, 0)} pmol/L ÷ 27,7)` : ""}
            {tabanUygulandi ? ` · PRA ${tr(n(pra), 2)} ölçüm tabanının altında, ${tr(PRA_TABAN)} kabul edildi` : ""}
          </p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Aldosteron ve PRA değerlerini girin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
