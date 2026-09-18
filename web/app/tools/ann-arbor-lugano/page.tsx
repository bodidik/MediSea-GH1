"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";

/**
 * Lenfoma evrelemesi — Lugano 2014 (Ann Arbor'un modifikasyonu; Cheson ve ark., J Clin Oncol 2014).
 *
 *   I    tek lenf nodu ya da komşu nod grubu · IE: nod tutulumu olmadan tek ekstranodal lezyon
 *   II   diyaframın aynı tarafında ≥ 2 nod grubu · IIE: II + komşuluk yoluyla sınırlı ekstranodal yayılım
 *   III  diyaframın iki tarafında nod ya da diyafram üstü nod + dalak tutulumu
 *   IV   komşu olmayan ek ekstranodal tutulum (ör. kemik iliği, karaciğer, akciğer parankimi, BOS)
 * "E" eki yalnızca I–II'de kullanılır. A/B (sistemik semptom) eki Lugano'da YALNIZ Hodgkin lenfomada korunur.
 * Bulky tanımı: Hodgkin'de ≥ 10 cm ya da toraks çapının > 1/3'ü; NHL'de histolojiye göre 6–10 cm — araç "bulky"yi yalnız evre II'de raporlar.
 */
const TIP: Secenek[] = [{ label: "Hodgkin lenfoma", pts: 0 }, { label: "Non-Hodgkin lenfoma", pts: 0 }];
const UZAK: Secenek[] = [
  { label: "Yok", pts: 0 },
  { label: "Var — komşu olmayan ekstranodal tutulum (kemik iliği, karaciğer, akciğer parankimi, BOS …)", pts: 0 },
];
const NOD: Secenek[] = [
  { label: "Nod tutulumu yok (yalnız tek ekstranodal lezyon)", pts: 0 },
  { label: "Tek nod bölgesi ya da komşu nod grubu", pts: 0 },
  { label: "Diyaframın aynı tarafında ≥ 2 nod grubu", pts: 0 },
  { label: "Diyaframın iki tarafında nod", pts: 0 },
  { label: "Diyafram üstü nod + dalak tutulumu", pts: 0 },
];
const EH: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];

export default function AnnArborLuganoPage() {
  const [tip, setTip] = React.useState<number | null>(null);
  const [uzak, setUzak] = React.useState<number | null>(null);
  const [nod, setNod] = React.useState<number | null>(null);
  const [komsu, setKomsu] = React.useState<number | null>(null);
  const [b, setB] = React.useState<number | null>(null);
  const [bulky, setBulky] = React.useState<number | null>(null);

  const hodgkin = tip === 0;
  const evreIII = nod === 3 || nod === 4;
  const evreIV = uzak === 1;
  const erken = uzak === 0 && (nod === 0 || nod === 1 || nod === 2);
  const komsuSor = erken && nod !== 0;
  const bulkySor = uzak === 0 && nod === 2;

  const eksik = [
    tip === null && "lenfoma tipi",
    uzak === null && "uzak ekstranodal tutulum",
    uzak === 0 && nod === null && "nod tutulumu",
    komsuSor && komsu === null && "komşu ekstranodal yayılım",
    bulkySor && bulky === null && "bulky",
    hodgkin && b === null && "B semptomları",
  ].filter(Boolean) as string[];

  let evre: string | null = null;
  let aciklama = "";
  if (eksik.length === 0) {
    if (evreIV) { evre = "IV"; aciklama = "Komşu olmayan ekstranodal tutulum — ileri evre."; }
    else if (evreIII) { evre = "III"; aciklama = nod === 4 ? "Diyafram üstü nod + dalak — ileri evre." : "Diyaframın iki tarafında nod — ileri evre."; }
    else if (nod === 0) { evre = "IE"; aciklama = "Nod tutulumu olmadan tek ekstranodal lezyon — sınırlı evre."; }
    else if (nod === 1) { evre = komsu === 1 ? "IE" : "I"; aciklama = "Tek nod bölgesi — sınırlı evre."; }
    else { evre = komsu === 1 ? "IIE" : "II"; aciklama = bulkySor && bulky === 1 ? "Aynı tarafta ≥ 2 nod grubu, bulky — tedavide çoğunlukla ileri evre gibi değerlendirilir." : "Diyaframın aynı tarafında ≥ 2 nod grubu — sınırlı evre."; }
  }
  // Bulky yalnızca sorunun sorulduğu evre II/IIE'de: gizlenen soruda eski yanıt kalabiliyor ve
  // "III".startsWith("II") doğru döndüğü için ek bir dönem evre III'e de yapışıyordu.
  const bulkyEk = bulkySor && bulky === 1 && (evre === "II" || evre === "IIE");
  const tamEvre = evre ? `${evre}${hodgkin ? (b === 1 ? "B" : "A") : ""}${bulkyEk ? " (bulky)" : ""}` : null;
  const ileri = evre === "III" || evre === "IV";

  return (
    <OlcekKabugu
      slug="ann-arbor-lugano"
      ikon="🔬"
      baslik="Ann Arbor / Lugano Evrelemesi"
      altBaslik="Hodgkin ve Non-Hodgkin Lenfoma · Lugano 2014"
      paylasim={{ evre: tamEvre }}
      not={
        <p>
          Evreleme FDG-PET/BT ile yapılır (FDG'yi tutan histolojilerde); PET'te homojen kemik iliği tutulumu olmayan Hodgkin ve DBBHL'de kemik iliği biyopsisi
          genellikle gerekmez. B semptomları: açıklanamayan ateş &gt; 38 °C, drenajlı gece terlemesi, son 6 ayda &gt; %10 kilo kaybı. Dalak tutulumu evre
          III'te nod gibi sayılır. Cheson BD ve ark., J Clin Oncol 2014.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="tip" baslik="Lenfoma tipi" secenekler={TIP} secili={tip} onSec={setTip} rozetGizle />
        <SecimMaddesi id="uzak" baslik="Komşu olmayan (yaygın) ekstranodal tutulum" secenekler={UZAK} secili={uzak} onSec={setUzak} rozetGizle />
        {uzak === 0 && <SecimMaddesi id="nod" baslik="Lenf nodu tutulumu" secenekler={NOD} secili={nod} onSec={setNod} rozetGizle />}
        {komsuSor && <SecimMaddesi id="komsu" baslik="Nod tutulumuna komşu, sınırlı ekstranodal yayılım (E)" secenekler={EH} secili={komsu} onSec={setKomsu} rozetGizle />}
        {bulkySor && <SecimMaddesi id="bulky" baslik="Bulky hastalık" aciklama="Hodgkin: ≥ 10 cm ya da toraks çapının > 1/3'ü · NHL: histolojiye göre 6–10 cm." secenekler={EH} secili={bulky} onSec={setBulky} rozetGizle />}
        {hodgkin && <SecimMaddesi id="b" baslik="B semptomları" aciklama="Ateş > 38 °C, drenajlı gece terlemesi, 6 ayda > %10 kilo kaybı." secenekler={EH} secili={b} onSec={setB} rozetGizle />}
      </div>

      <SonucDuyuru metin={tamEvre ? `Evre ${tamEvre}` : null} />
      {tamEvre ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${ileri ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">Lugano evresi</p>
          <p className="text-4xl font-black">{tamEvre}</p>
          <p className="text-[12px] font-bold">{aciklama}</p>
          {!hodgkin && <p className="text-[11px] font-bold">Non-Hodgkin lenfomada Lugano A/B ekini kullanmaz; semptomlar prognostik skorlarda (IPI) ayrıca değerlendirilir.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
