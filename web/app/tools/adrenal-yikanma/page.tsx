"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Adrenal kitlede BT atenüasyonu ve kontrast yıkanması (washout).
 *   Mutlak yıkanma (%)  = (portal venöz − geç) / (portal venöz − kontrastsız) × 100    ≥ %60 adenom lehine
 *   Göreli yıkanma (%)  = (portal venöz − geç) / portal venöz × 100                     ≥ %40 adenom lehine
 * portal venöz ~60–70 sn, geç faz 15 dk. Kontrastsız ≤ 10 HU → lipitten zengin adenom; yıkanma gerekmez.
 *
 * Kontrastsız değer girilmezse yalnızca göreli yıkanma hesaplanır — mutlak yıkanma basılmaz.
 * Payda ≤ 0 olan (kontrastlanmayan) kitlede yıkanma tanımsızdır; araç sayı üretmiyor.
 */
const HU_ALT = -200, HU_UST = 400;
const BOYUT_UST = 30;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function AdrenalYikanmaPage() {
  const [kontrastsiz, setKontrastsiz] = React.useState("");
  const [portal, setPortal] = React.useState("");
  const [gec, setGec] = React.useState("");
  const [boyut, setBoyut] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const huOk = (s: string) => sayiGirildiMi(s) && n(s) >= HU_ALT && n(s) <= HU_UST;
  const ksGirildi = kontrastsiz.trim() !== "";
  const ksOk = huOk(kontrastsiz);
  const pOk = huOk(portal);
  const gOk = huOk(gec);
  const boyutOk = sayiGirildiMi(boyut) && n(boyut) > 0 && n(boyut) <= BOYUT_UST;

  const lipitZengin = ksOk && n(kontrastsiz) <= 10;
  const mutlakPayda = ksOk && pOk ? n(portal) - n(kontrastsiz) : null;
  const mutlak = mutlakPayda !== null && mutlakPayda > 0 && gOk ? Math.round(((n(portal) - n(gec)) / mutlakPayda) * 100) : null;
  const goreli = pOk && gOk && n(portal) > 0 ? Math.round(((n(portal) - n(gec)) / n(portal)) * 100) : null;
  const kontrastlanmiyor = mutlakPayda !== null && mutlakPayda <= 0;

  const adenomMutlak = mutlak !== null ? mutlak >= 60 : null;
  const adenomGoreli = goreli !== null ? goreli >= 40 : null;

  let sonuc: { t: string; a: string; r: string } | null = null;
  if (lipitZengin) sonuc = { t: "Lipitten zengin adenom", a: "Kontrastsız ≤ 10 HU — benign adenom; yıkanma çalışması gerekmez. Hormonal değerlendirme (kortizol fazlalığı, feokromositoma, hiperaldosteronizm) yine yapılmalı.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  else if (adenomMutlak === true || (adenomMutlak === null && adenomGoreli === true)) sonuc = { t: "Lipitten fakir adenom lehine", a: "Yıkanma değerleri adenomla uyumlu. Feokromositoma da hızlı yıkanma gösterebilir — metanefrin ölçümü atlanmamalı.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  else if (adenomMutlak === false || adenomGoreli === false) sonuc = { t: "Belirsiz / adenom dışı olasılık", a: "Yıkanma adenom eşiğinin altında — feokromositoma, adrenokortikal karsinom ya da metastaz dışlanmalı; MR, FDG-PET/BT, izlem ya da cerrahi multidisipliner kararla.", r: "border-rose-200 bg-rose-50 text-rose-900" };

  const buyuk = boyutOk && n(boyut) > 4;
  const tr = (x: number) => String(x).replace(".", ",");

  return (
    <OlcekKabugu
      slug="adrenal-yikanma"
      ikon="🫘"
      baslik="Adrenal Kitle BT Yıkanma Hesabı"
      altBaslik="Kontrastsız Atenüasyon · Mutlak ve Göreli Yıkanma"
      paylasim={{ mutlak, goreli }}
      not={
        <p>
          ESE/ENSAT 2023 kılavuzu kontrastsız atenüasyonu ≤ 10 HU olan homojen kitleyi benign kabul eder ve yıkanma çalışmasının tanısal doğruluğunun
          daha önce düşünülenden düşük olduğunu vurgular — yıkanma tek başına karar verdirmez, görüntüleme ve hormonal değerlendirmeyle birlikte yorumlanır. Fassnacht M ve ark., Eur J Endocrinol 2023.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Kontrastsız atenüasyon (HU)", kontrastsiz, setKontrastsiz],
          ["Portal venöz faz (HU, ~60–70 sn)", portal, setPortal],
          ["Geç faz (HU, 15 dk)", gec, setGec],
          ["Kitle çapı (cm) — isteğe bağlı", boyut, setBoyut],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      {((ksGirildi && !ksOk) || kontrastlanmiyor) && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          {ksGirildi && !ksOk ? `HU değerleri ${HU_ALT} ile ${HU_UST} arasında olmalı. ` : ""}
          {kontrastlanmiyor ? "Portal venöz değer kontrastsızdan yüksek değil — kitle kontrastlanmıyor; mutlak yıkanma tanımsız." : ""}
        </div>
      )}

      <SonucDuyuru metin={sonuc ? sonuc.t : null} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${sonuc.r}`}>
          <p className="text-xl font-black">{sonuc.t}</p>
          <div className="flex flex-wrap gap-6">
            {ksOk && <div><p className="text-[10px] font-black uppercase tracking-widest">Kontrastsız</p><p className="text-2xl font-black">{tr(n(kontrastsiz))} HU</p></div>}
            <div><p className="text-[10px] font-black uppercase tracking-widest">Mutlak yıkanma</p><p className="text-2xl font-black">{mutlak !== null ? `%${mutlak}` : "—"}</p><p className="text-[11px] font-bold">adenom ≥ %60</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-widest">Göreli yıkanma</p><p className="text-2xl font-black">{goreli !== null ? `%${goreli}` : "—"}</p><p className="text-[11px] font-bold">adenom ≥ %40</p></div>
          </div>
          <p className="text-[12px] font-bold">{sonuc.a}</p>
          {buyuk && <p className="text-[12px] font-black">Çap &gt; 4 cm — malignite olasılığı artar; özellikle belirsiz görüntüleme özelliklerinde multidisipliner değerlendirme ve cerrahi seçeneği.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Kontrastsız değer ≤ 10 HU değilse portal venöz ve geç faz değerlerini girin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
