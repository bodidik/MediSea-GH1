"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Primer aldosteronizm taraması — eşli plazma aldosteronu (PAC) ve plazma renin aktivitesi (PRA).
 * Kaynak: UpToDate, Young WF Jr. "Diagnosis of primary aldosteronism" (Endocrine Society 2025 ile uyumlu).
 *
 * Karar ORANLA değil eşli mutlak değerlerle verilir:
 *   pozitif = renin baskılı (PRA ≤ 1 ng/mL/saat) VE PAC ≥ 10 ng/dL (immünoassay) / ≥ 7,5 (LC-MS/MS).
 * Oran (PAC/PRA) yalnız destek olarak gösterilir: > 20 (immünoassay) / > 15 (LC-MS/MS).
 * Pozitif sonuçta lateralize hastalık olasılığı için aldosteron düzeyi ayrıca yorumlanır:
 *   belirgin = PRA < 0,2 VE PAC > 20 (immünoassay) / > 15 (LC-MS/MS) — hipokalemi de varsa baskılama testi gerekmez;
 *   sınırda  = PAC < 11 (immünoassay) / < 8 (LC-MS/MS) — normokalemide lateralize hastalık olasılığı düşük.
 * PRA ölçüm alt sınırı oranı katlarca değiştirdiği için oran hesabında PRA 0,2'ye taban kabul edilir ve ekranda söylenir.
 * Aldosteron pmol/L ise 27,7'ye bölünür.
 */
const PRA_TABAN = 0.2;
const RENIN_BASKILI = 1;
const ESIK = {
  ia: { pozitif: 10, oran: 20, belirgin: 20, sinirda: 11, ad: "immünoassay" },
  ms: { pozitif: 7.5, oran: 15, belirgin: 15, sinirda: 8, ad: "LC-MS/MS" },
} as const;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";
const kirmizi = "border-rose-200 bg-rose-50 text-rose-900";
const sari = "border-amber-200 bg-amber-50 text-amber-900";
const yesil = "border-emerald-200 bg-emerald-50 text-emerald-900";

export default function AldosteronReninPage() {
  const [aldo, setAldo] = React.useState("");
  const [birim, setBirim] = React.useState<"ngdl" | "pmol">("ngdl");
  const [yontem, setYontem] = React.useState<"ia" | "ms">("ia");
  const [pra, setPra] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const aldoHam = n(aldo);
  const aldoNgdl = birim === "ngdl" ? aldoHam : aldoHam / 27.7;
  const aldoOk = sayiGirildiMi(aldo) && aldoNgdl >= 0 && aldoNgdl <= 500;
  // Meşru düşük değer: PRA ölçüm sınırının altında olabilir.
  const praHam = n(pra);
  const praOk = sayiGirildiMi(pra) && praHam >= 0 && praHam <= 100;
  const praKullanilan = praOk ? Math.max(praHam, PRA_TABAN) : null;
  const tabanUygulandi = praOk && praHam < PRA_TABAN;
  const e = ESIK[yontem];

  const arr = aldoOk && praKullanilan !== null ? Math.round((aldoNgdl / praKullanilan) * 10) / 10 : null;
  const tr = (x: number, h = 1) => (Math.round(x * 10 ** h) / 10 ** h).toString().replace(".", ",");

  const yorum =
    arr === null ? null
      : praHam > RENIN_BASKILI
        ? { t: "Renin baskılı değil — tarama negatif", a: `PRA ${RENIN_BASKILI} ng/mL/saat'in üstünde. Primer aldosteronizmde renin baskılıdır. Ama ACE inhibitörü, ARB, direkt renin inhibitörü, diüretik ya da MRA renini yükseltir: bu ilaçlardan biri kullanılıyorsa PRA > 1 tanıyı dışlamaz. Aldosteron da yüksekse sekonder hiperaldosteronizmi (diüretik, renovasküler hastalık) düşünün.`, r: yesil }
      : aldoNgdl < e.pozitif
        ? { t: "Renin düşük, aldosteron düşük — tarama negatif", a: `Aldosteron ${tr(e.pozitif)} ng/dL'nin (${e.ad}) altında. Düşük reninli hipertansiyonda sık görülür. Hipokalemi varsa önce düzeltip tekrar ölçün (hipokalemi aldosteronu baskılar); hipokalemi sürüyorsa aldosteron dışı mineralokortikoid fazlasını (Cushing, Liddle, meyan kökü, KAH) düşünün. Klinik kuşku yüksekse ölçüm tekrarlanır — kişi içi değişkenlik yüksektir.`, r: yesil }
      : praHam < PRA_TABAN && aldoNgdl > e.belirgin
        ? { t: "Tarama pozitif — belirgin aldosteron fazlası", a: `Renin çok düşük ve aldosteron ${tr(e.belirgin)} ng/dL'nin üstünde. Kendiliğinden hipokalemi de varsa tanı kesindir ve lateralize hastalık olasılığı yüksektir: baskılama testi gerekmez; cerrahi düşünülüyorsa doğrudan alt tip ayrımına (adrenal BT, ≥35 yaşta adrenal ven örneklemesi), düşünülmüyorsa MRA.`, r: kirmizi }
      : aldoNgdl < e.sinirda
        ? { t: "Tarama pozitif — sınırda aldosteron", a: `Renin baskılı, aldosteron ${tr(e.pozitif)}–${tr(e.sinirda)} ng/dL arasında. Normokalemide lateralize hastalık olasılığı düşüktür: genellikle ek inceleme gerekmez, ampirik MRA denemesi makuldür.`, r: sari }
        : { t: "Tarama pozitif", a: "Renin baskılı ve aldosteron yüksek. Lateralize hastalık olasılığı ara düzeyde: cerrahi düşünülüyorsa aldosteron baskılama testi (oral tuz yükleme ya da salin infüzyonu), düşünülmüyorsa MRA.", r: kirmizi };

  return (
    <OlcekKabugu
      slug="aldosteron-renin"
      ikon="🧂"
      baslik="Aldosteron/Renin Oranı"
      altBaslik="Primer Aldosteronizm Taraması · eşli aldosteron ve PRA"
      paylasim={{ arr }}
      not={
        <p>
          Hipertansiyonu olan herkes taranır (Endocrine Society 2025). Örnek tercihen sabah, oturur durumdaki ayaktan hastadan; aldosteron, renin ve potasyum aynı anda.
          Çoğu antihipertansif sürdürülür, postür gerekmez; hipokalemi varsa önce düzeltilir. Karar oranla değil eşli değerlerle verilir: renin baskılı
          (PRA ≤ 1 ng/mL/saat) ve aldosteron ≥ 10 ng/dL (immünoassay) ya da ≥ 7,5 ng/dL (LC-MS/MS). Oran yalnız destektir (&gt; 20 ya da &gt; 15) ve PRA
          ölçüm alt sınırından çok etkilenir. MRA altında renin hâlâ baskılıysa test ilaç kesilmeden yorumlanabilir; baskılı değilse MRA 4–6 hafta kesilip
          tekrarlanır. Beta bloker ve santral α2 agonist renini düşürür ama sonuç yine yorumlanabilir. Direkt renin konsantrasyonu (DRC) bu araçla
          hesaplanmaz. Young WF Jr., Diagnosis of primary aldosteronism, UpToDate (2025).
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Aldosteron ({birim === "ngdl" ? "ng/dL" : "pmol/L"})</span>
            <input type="text" inputMode="decimal" value={aldo} onChange={(ev) => setAldo(ev.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Plazma renin aktivitesi (ng/mL/saat)</span>
            <input type="text" inputMode="decimal" value={pra} onChange={(ev) => setPra(ev.target.value)} className={girdi} />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div role="radiogroup" aria-labelledby="arr-birim" className="flex flex-col gap-2">
            <span id="arr-birim" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Aldosteron birimi</span>
            <div className="flex gap-2">
              {([["ngdl", "ng/dL"], ["pmol", "pmol/L"]] as const).map(([k, ad]) => (
                <label key={k} className={`flex-1 min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer ${birim === k ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  <input type="radio" name="arr-birim" className="sr-only" checked={birim === k} onChange={() => setBirim(k)} />
                  {ad}
                </label>
              ))}
            </div>
          </div>
          <div role="radiogroup" aria-labelledby="arr-yontem" className="flex flex-col gap-2">
            <span id="arr-yontem" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Aldosteron ölçüm yöntemi</span>
            <div className="flex gap-2">
              {([["ia", "İmmünoassay"], ["ms", "LC-MS/MS"]] as const).map(([k, ad]) => (
                <label key={k} className={`flex-1 min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer ${yontem === k ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  <input type="radio" name="arr-yontem" className="sr-only" checked={yontem === k} onChange={() => setYontem(k)} />
                  {ad}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SonucDuyuru metin={arr !== null && yorum ? `${yorum.t} — oran ${tr(arr)}` : null} />
      {arr !== null && yorum ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yorum.r}`}>
          <p className="text-lg font-black">{yorum.t}</p>
          <p className="text-[12px] font-bold">{yorum.a}</p>
          <p className="text-[12px] font-bold">
            {"Aldosteron " + tr(aldoNgdl) + " ng/dL" + (birim === "pmol" ? " (" + tr(aldoHam, 0) + " pmol/L ÷ 27,7)" : "") + " · PRA " + tr(praHam, 2) + " ng/mL/saat"}
          </p>
          <p className="text-[12px] font-bold">
            {"Destek: oran " + tr(arr) + " (" + e.ad + " eşiği > " + e.oran + (arr > e.oran ? ", üstünde" : ", altında") + ")" + (tabanUygulandi ? " · PRA ölçüm tabanının altında, oran için " + tr(PRA_TABAN) + " kabul edildi" : "")}
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
