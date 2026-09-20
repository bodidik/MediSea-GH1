"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";

/**
 * ESC 2019 akut pulmoner emboli erken (hastane içi / 30 gün) mortalite risk sınıflaması (Konstantinides ve ark., Eur Heart J 2020).
 *
 *   Yüksek        hemodinamik instabilite
 *   Orta-yüksek   PESI III–V ya da sPESI ≥ 1 + RV disfonksiyonu VE yüksek troponin (ikisi birden)
 *   Orta-düşük    PESI III–V ya da sPESI ≥ 1 + en fazla biri; YA DA PESI I–II / sPESI 0 iken RV ya da troponin pozitif
 *   Düşük         PESI I–II / sPESI 0 ve (değerlendirildiyse) RV ile troponin negatif
 *
 * İnstabilite "evet" iken öteki sorular GİZLENİYOR ve yanıtları hesaba girmiyor (gizli sorudaki eski yanıt sızmasın).
 * Klinik ağırlık pozitif ama RV/troponin değerlendirilmemişse orta risk alt sınıfı UYDURULMUYOR.
 */
const EH: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];
const EHD: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }, { label: "Değerlendirilmedi", pts: 0 }];

type Sonuc = { ad: string; aciklama: string; renk: string };
const R = {
  yuksek: "border-rose-200 bg-rose-50 text-rose-900",
  oy: "border-orange-200 bg-orange-50 text-orange-900",
  od: "border-amber-200 bg-amber-50 text-amber-900",
  dusuk: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export default function EscPeRiskPage() {
  const [instabil, setInstabil] = React.useState<number | null>(null);
  const [klinik, setKlinik] = React.useState<number | null>(null);
  const [rv, setRv] = React.useState<number | null>(null);
  const [trop, setTrop] = React.useState<number | null>(null);

  const stabil = instabil === 0;
  const eksik = [
    instabil === null && "hemodinamik durum",
    stabil && klinik === null && "PESI/sPESI",
    stabil && rv === null && "sağ ventrikül",
    stabil && trop === null && "troponin",
  ].filter(Boolean) as string[];

  let sonuc: Sonuc | null = null;
  if (instabil === 1) {
    sonuc = { ad: "Yüksek risk", aciklama: "Hemodinamik instabilite — acil reperfüzyon (sistemik tromboliz; kontrendikasyonda cerrahi embolektomi ya da kateter tedavisi).", renk: R.yuksek };
  } else if (eksik.length === 0) {
    const rvP = rv === 1, trP = trop === 1;
    // Biri NEGATİF ölçüldüyse ikisi birden pozitif olamaz → orta-düşük kesin; belirsizlik yalnız hiçbiri negatif değilken.
    const birNegatif = rv === 0 || trop === 0;
    if (klinik === 1) {
      if (rvP && trP) sonuc = { ad: "Orta-yüksek risk", aciklama: "Klinik ağırlık + RV disfonksiyonu + yüksek troponin — antikoagülasyon, ilk 2–3 gün yakın izlem; kötüleşirse kurtarıcı reperfüzyon. Rutin tam doz tromboliz önerilmez.", renk: R.oy };
      else if (!birNegatif) sonuc = { ad: "Orta risk (alt sınıf belirsiz)", aciklama: "Klinik ağırlık pozitif — orta-yüksek ile orta-düşüğü ayırmak için RV (EKO ya da BTPA) ve troponin birlikte gerekir.", renk: R.od };
      else sonuc = { ad: "Orta-düşük risk", aciklama: "Klinik ağırlık pozitif, RV disfonksiyonu ve yüksek troponin birlikte değil — hastanede antikoagülasyon.", renk: R.od };
    } else if (rvP || trP) {
      sonuc = { ad: "Orta-düşük risk", aciklama: "PESI I–II / sPESI 0 olsa da RV disfonksiyonu ya da yüksek troponin var — düşük risk sayılmaz, hastanede antikoagülasyon.", renk: R.od };
    } else {
      sonuc = { ad: "Düşük risk", aciklama: "Erken taburculuk ya da ayaktan tedavi düşünülebilir (sosyal koşullar ve Hestia ölçütleri uygunsa).", renk: R.dusuk };
    }
  }

  return (
    <OlcekKabugu
      slug="esc-pe-risk"
      ikon="🫀"
      baslik="ESC 2019 PE Risk Sınıflaması"
      altBaslik="Akut Pulmoner Emboli · Erken Mortalite Riski"
      paylasim={{ risk: sonuc?.ad ?? null }}
      not={
        <p>
          Hemodinamik instabilite: kardiyak arrest, obstrüktif şok (sistolik &lt; 90 mmHg ya da vazopresör gereksinimi + uç organ hipoperfüzyonu) ya da
          15 dakikadan uzun süren sistolik &lt; 90 mmHg / ≥ 40 mmHg düşüş. RV disfonksiyonu: EKO'da RV/LV &gt; 1,0, TAPSE &lt; 16 mm ya da BTPA'da RV/LV ≥ 1,0.
          Düşük risk sınıfında RV ve troponin ölçümü isteğe bağlıdır; ölçüldüyse negatif olmalıdır. Konstantinides SV ve ark., Eur Heart J 2020.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="instabil" baslik="Hemodinamik instabilite" aciklama="Kardiyak arrest, obstrüktif şok ya da persistan hipotansiyon." secenekler={EH} secili={instabil} onSec={setInstabil} rozetGizle />
        {stabil && (
          <>
            <SecimMaddesi id="klinik" baslik="Klinik ağırlık: PESI sınıf III–V ya da sPESI ≥ 1" secenekler={EH} secili={klinik} onSec={setKlinik} rozetGizle />
            <SecimMaddesi id="rv" baslik="EKO ya da BT pulmoner anjiyografide RV disfonksiyonu" secenekler={EHD} secili={rv} onSec={setRv} rozetGizle />
            <SecimMaddesi id="trop" baslik="Kardiyak troponin yüksek" secenekler={EHD} secili={trop} onSec={setTrop} rozetGizle />
          </>
        )}
      </div>

      <SonucDuyuru metin={sonuc ? sonuc.ad : null} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${sonuc.renk}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">ESC 2019 erken mortalite riski</p>
          <p className="text-3xl font-black">{sonuc.ad}</p>
          <p className="text-[12px] font-bold">{sonuc.aciklama}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
