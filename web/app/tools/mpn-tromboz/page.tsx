"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";

/**
 * Miyeloproliferatif neoplazide tromboz risk sınıflaması.
 *   Polisitemia vera (ELN): yüksek risk = yaş ≥ 60 ve/veya tromboz öyküsü · aksi hâlde düşük risk
 *   Esansiyel trombositemi — revize IPSET-tromboz (Barbui ve ark., Blood Cancer J 2015):
 *     çok düşük  yaş ≤ 60, tromboz yok, JAK2 V617F negatif
 *     düşük      yaş ≤ 60, tromboz yok, JAK2 V617F pozitif
 *     orta       yaş > 60, tromboz yok, JAK2 V617F negatif
 *     yüksek     tromboz öyküsü (her yaşta) ya da yaş > 60 + JAK2 V617F pozitif
 * PV'de yaş eşiği "≥ 60", ET'de "> 60" — kaynaklar böyle; araç iki eşiği ayrı tutuyor.
 * ET'de JAK2 sorusu yalnızca ET seçildiğinde soruluyor.
 */
const TANI: Secenek[] = [{ label: "Polisitemia vera (PV)", pts: 0 }, { label: "Esansiyel trombositemi (ET)", pts: 0 }];
const EH: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];
const JAK2: Secenek[] = [{ label: "JAK2 V617F negatif", pts: 0 }, { label: "JAK2 V617F pozitif", pts: 0 }];

type Sonuc = { t: string; a: string; r: string };

export default function MpnTrombozPage() {
  const [tani, setTani] = React.useState<number | null>(null);
  const [yas, setYas] = React.useState<number | null>(null);
  const [tromboz, setTromboz] = React.useState<number | null>(null);
  const [jak2, setJak2] = React.useState<number | null>(null);

  const pv = tani === 0;
  const et = tani === 1;
  const yasSoru = pv ? "Yaş ≥ 60" : "Yaş > 60";

  let sonuc: Sonuc | null = null;
  if (pv && yas !== null && tromboz !== null) {
    sonuc = yas === 1 || tromboz === 1
      ? { t: "PV — yüksek risk", a: "Flebotomi (Hct < %45) + düşük doz aspirin + sitoredüktif tedavi (hidroksiüre ya da interferon alfa).", r: "border-rose-200 bg-rose-50 text-rose-900" }
      : { t: "PV — düşük risk", a: "Flebotomi (Hct < %45) + düşük doz aspirin; kardiyovasküler risk etkenlerinin sıkı kontrolü. Semptom yükü, ilerleyici splenomegali ya da flebotomi intoleransında sitoredüksiyon düşünülür.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  } else if (et && yas !== null && tromboz !== null && jak2 !== null) {
    if (tromboz === 1 || (yas === 1 && jak2 === 1)) sonuc = { t: "ET — yüksek risk", a: "Sitoredüktif tedavi (hidroksiüre ilk basamak; genç hastada interferon alfa, anagrelid) + aspirin; venöz trombozda antikoagülan.", r: "border-rose-200 bg-rose-50 text-rose-900" };
    else if (yas === 1) sonuc = { t: "ET — orta risk", a: "Kardiyovasküler risk etkeni varsa aspirin; sitoredüksiyon genellikle gerekmez, bireysel karar.", r: "border-orange-200 bg-orange-50 text-orange-900" };
    else if (jak2 === 1) sonuc = { t: "ET — düşük risk", a: "Düşük doz aspirin (trombosit > 1000–1500 × 10⁹/L ise edinsel von Willebrand açısından değerlendirin).", r: "border-amber-200 bg-amber-50 text-amber-900" };
    else sonuc = { t: "ET — çok düşük risk", a: "İzlem; kardiyovasküler risk etkeni ya da mikrovasküler belirti varsa aspirin.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  }

  const secTani = (v: number | null) => { setTani(v); setJak2(null); };

  return (
    <OlcekKabugu
      slug="mpn-tromboz"
      ikon="🩸"
      baslik="MPN Tromboz Riski"
      altBaslik="Polisitemia Vera (ELN) · Esansiyel Trombositemi (Revize IPSET)"
      paylasim={{ tani, sonuc: sonuc?.t ?? null }}
      not={
        <p>
          Tüm hastalarda hipertansiyon, sigara, diyabet ve hiperlipidemi agresif şekilde kontrol edilmelidir. CALR mutasyonlu ET'de aspirin yararı
          sınırlı, kanama riski artmış olabilir. Tedavi önerileri özet niteliğindedir; ayrıntı için ELN ve NCCN önerilerine bakın. Barbui T ve ark.,
          Leukemia 2018 (ELN); Barbui T ve ark., Blood Cancer J 2015 (revize IPSET).
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="tani" baslik="Tanı" secenekler={TANI} secili={tani} onSec={secTani} rozetGizle />
        {tani !== null && (
          <>
            <SecimMaddesi id="yas" baslik={yasSoru} secenekler={EH} secili={yas} onSec={setYas} rozetGizle />
            <SecimMaddesi id="tromboz" baslik="Arteriyel ya da venöz tromboz öyküsü" secenekler={EH} secili={tromboz} onSec={setTromboz} rozetGizle />
          </>
        )}
        {et && <SecimMaddesi id="jak2" baslik="JAK2 V617F" secenekler={JAK2} secili={jak2} onSec={setJak2} rozetGizle />}
      </div>

      <SonucDuyuru metin={sonuc ? sonuc.t : null} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${sonuc.r}`}>
          <p className="text-xl font-black">{sonuc.t}</p>
          <p className="text-[12px] font-bold">{sonuc.a}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{tani === null ? "Önce tanıyı seçin" : "Tüm soruları yanıtlayın"}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
