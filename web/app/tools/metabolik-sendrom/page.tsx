"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Metabolik sendrom — iki tanım yan yana.
 *   NCEP ATP III (2005 revizyonu): 5 ölçütten ≥ 3; bel erkek > 102, kadın > 88 cm
 *   IDF (2005):                   santral obezite ZORUNLU (Avrupa kökenli ölçü: erkek ≥ 94, kadın ≥ 80 cm) + diğer 4'ten ≥ 2
 *   Ortak ölçütler: TG ≥ 150 mg/dL ya da tedavi · HDL erkek < 40, kadın < 50 ya da tedavi · KB ≥ 130/85 ya da tedavi ·
 *                   açlık glukozu ≥ 100 mg/dL ya da tedavi / tip 2 DM
 * Bel çevresi eşiği iki tanımda FARKLI olduğu için bel ölçütü iki kez değerlendiriliyor; diğerleri ortak.
 * IDF, Orta Doğu ve Doğu Akdeniz popülasyonu için Avrupa kökenli eşikleri önerir.
 */
const CINSIYET: Secenek[] = [{ label: "Erkek", pts: 0 }, { label: "Kadın", pts: 0 }];
const TEDAVI: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function MetabolikSendromPage() {
  const [cins, setCins] = React.useState<number | null>(null);
  const [bel, setBel] = React.useState("");
  const [tg, setTg] = React.useState("");
  const [hdl, setHdl] = React.useState("");
  const [sks, setSks] = React.useState("");
  const [dks, setDks] = React.useState("");
  const [glu, setGlu] = React.useState("");
  const [tgTed, setTgTed] = React.useState<number | null>(null);
  const [hdlTed, setHdlTed] = React.useState<number | null>(null);
  const [kbTed, setKbTed] = React.useState<number | null>(null);
  const [gluTed, setGluTed] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const ok = (s: string, a: number, b: number) => sayiGirildiMi(s) && n(s) >= a && n(s) <= b;
  const hazir =
    cins !== null && [tgTed, hdlTed, kbTed, gluTed].every((x) => x !== null) &&
    ok(bel, 40, 250) && ok(tg, 10, 5000) && ok(hdl, 5, 200) && ok(sks, 60, 300) && ok(dks, 30, 200) && ok(glu, 20, 1000);

  const erkek = cins === 0;
  const ortak = hazir
    ? {
        tg: n(tg) >= 150 || tgTed === 1,
        hdl: (erkek ? n(hdl) < 40 : n(hdl) < 50) || hdlTed === 1,
        kb: n(sks) >= 130 || n(dks) >= 85 || kbTed === 1,
        glu: n(glu) >= 100 || gluTed === 1,
      }
    : null;
  const belNcep = hazir ? (erkek ? n(bel) > 102 : n(bel) > 88) : null;
  const belIdf = hazir ? (erkek ? n(bel) >= 94 : n(bel) >= 80) : null;
  const ortakSayi = ortak ? Object.values(ortak).filter(Boolean).length : 0;
  const ncepSayi = ortakSayi + (belNcep ? 1 : 0);
  const ncep = hazir ? ncepSayi >= 3 : null;
  const idf = hazir ? belIdf! && ortakSayi >= 2 : null;

  const alan = (ad: string, deger: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
      <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
    </label>
  );
  const kart = (baslik: string, var_: boolean, detay: string) => (
    <div className={`rounded-2xl border-2 p-4 ${var_ ? "border-rose-300 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
      <p className="text-[10px] font-black uppercase tracking-widest">{baslik}</p>
      <p className="text-xl font-black mt-1">{var_ ? "Metabolik sendrom var" : "Metabolik sendrom yok"}</p>
      <p className="text-[12px] font-bold mt-1">{detay}</p>
    </div>
  );

  const ortakListe = ortak ? [ortak.tg && "trigliserid", ortak.hdl && "düşük HDL", ortak.kb && "kan basıncı", ortak.glu && "glukoz"].filter(Boolean).join(", ") : "";

  return (
    <OlcekKabugu
      slug="metabolik-sendrom"
      ikon="⚖️"
      baslik="Metabolik Sendrom"
      altBaslik="NCEP ATP III ve IDF Tanımları Yan Yana"
      paylasim={{ ncep: ncep === null ? null : ncep ? 1 : 0, idf: idf === null ? null : idf ? 1 : 0 }}
      not={
        <p>
          Bel çevresi ayakta, ekspiryum sonunda, son kaburga ile iliak kanat arasının orta noktasından ölçülür. 2009 "uyumlaştırılmış" tanım 5 ölçütten
          ≥ 3'ü ister ve bel eşiğini popülasyona göre belirler. Metabolik sendrom bir risk kümesidir; kardiyovasküler risk ayrıca hesaplanmalıdır.
          Grundy SM ve ark., Circulation 2005; Alberti KG ve ark. (IDF), Lancet 2005.
        </p>
      }
    >
      <SecimMaddesi id="cins" baslik="Cinsiyet" secenekler={CINSIYET} secili={cins} onSec={setCins} rozetGizle />
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {alan("Bel çevresi (cm)", bel, setBel)}
        {alan("Açlık glukozu (mg/dL)", glu, setGlu)}
        {alan("Trigliserid (mg/dL)", tg, setTg)}
        {alan("HDL (mg/dL)", hdl, setHdl)}
        {alan("Sistolik KB (mmHg)", sks, setSks)}
        {alan("Diyastolik KB (mmHg)", dks, setDks)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SecimMaddesi id="tgTed" baslik="Trigliserid için ilaç tedavisi" secenekler={TEDAVI} secili={tgTed} onSec={setTgTed} rozetGizle />
        <SecimMaddesi id="hdlTed" baslik="Düşük HDL için ilaç tedavisi" secenekler={TEDAVI} secili={hdlTed} onSec={setHdlTed} rozetGizle />
        <SecimMaddesi id="kbTed" baslik="Antihipertansif tedavi" secenekler={TEDAVI} secili={kbTed} onSec={setKbTed} rozetGizle />
        <SecimMaddesi id="gluTed" baslik="Glukoz düşürücü tedavi ya da tip 2 diyabet" secenekler={TEDAVI} secili={gluTed} onSec={setGluTed} rozetGizle />
      </div>

      <SonucDuyuru metin={ncep === null ? null : `NCEP ATP III: ${ncep ? "var" : "yok"} · IDF: ${idf ? "var" : "yok"}`} />
      {hazir && ncep !== null && idf !== null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kart("NCEP ATP III", ncep, `${ncepSayi}/5 ölçüt (≥ 3 gerekli) — bel ${belNcep ? `> ${erkek ? 102 : 88} cm` : "eşiğin altında"}${ortakListe ? `, ${ortakListe}` : ""}`)}
          {kart("IDF", idf, belIdf ? `Santral obezite var (≥ ${erkek ? 94 : 80} cm) + ${ortakSayi}/4 ölçüt (≥ 2 gerekli)` : `Santral obezite yok (< ${erkek ? 94 : 80} cm) — IDF tanımı için zorunlu`)}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Tüm alanları doldurun ve tedavi sorularını yanıtlayın</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
