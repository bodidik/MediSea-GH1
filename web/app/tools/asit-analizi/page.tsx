"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Asit sıvısı analizi.
 *   SAAG = serum albümin − asit albümin (g/dL, aynı gün)
 *     ≥ 1,1  portal hipertansif asit
 *     < 1,1  portal hipertansiyon dışı
 *   SAAG ≥ 1,1 iken asit total proteini: < 2,5 siroz lehine · ≥ 2,5 kardiyak asit / Budd-Chiari / sinüzoidal obstrüksiyon
 *   Asit PMN ≥ 250/mm³ → spontan bakteriyel peritonit (sekonder peritonit dışlanmalı)
 *
 * Protein ve PMN İSTEĞE BAĞLI; girilmezse o yorum hiç basılmıyor — "SBP yok" gibi girilmeyen
 * veriden olumsuz sonuç üretmemek için.
 * SAAG karşılaştırması 1 haneye yuvarlanmış EKRAN değeriyle yapılıyor — ekranda "1,1" yazıp "< 1,1" denmesin.
 */
const ALB_UST = 7;
const PROT_UST = 10;
const PMN_UST = 1000000;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function AsitAnaliziPage() {
  const [sAlb, setSAlb] = React.useState("");
  const [aAlb, setAAlb] = React.useState("");
  const [prot, setProt] = React.useState("");
  const [pmn, setPmn] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const sAlbOk = sayiGirildiMi(sAlb) && n(sAlb) > 0 && n(sAlb) <= ALB_UST;
  // Meşru sıfır: asit albümini 0'a yakın olabilir.
  const aAlbOk = sayiGirildiMi(aAlb) && n(aAlb) >= 0 && n(aAlb) <= ALB_UST;
  const protGirildi = prot.trim() !== "";
  const protOk = sayiGirildiMi(prot) && n(prot) >= 0 && n(prot) <= PROT_UST;
  const pmnGirildi = pmn.trim() !== "";
  const pmnOk = sayiGirildiMi(pmn) && Number.isInteger(n(pmn)) && n(pmn) >= 0 && n(pmn) <= PMN_UST;

  const eksik = [
    !sAlbOk && `serum albümin (0–${ALB_UST} g/dL)`,
    !aAlbOk && `asit albümin (0–${ALB_UST} g/dL)`,
  ].filter(Boolean) as string[];
  const hatali = [
    protGirildi && !protOk && `asit total protein (0–${PROT_UST} g/dL)`,
    pmnGirildi && !pmnOk && "PMN (tam sayı, hücre/mm³)",
  ].filter(Boolean) as string[];

  const saag = eksik.length === 0 ? Math.round((n(sAlb) - n(aAlb)) * 10) / 10 : null;
  const tutarsiz = saag !== null && saag < 0;
  const portal = saag !== null && !tutarsiz ? saag >= 1.1 : null;

  let saagYorum = "";
  if (portal === true) {
    saagYorum = "Portal hipertansif asit (SAAG ≥ 1,1) — siroz, alkolik hepatit, kardiyak asit, Budd-Chiari, masif karaciğer metastazı.";
    if (protGirildi && protOk)
      saagYorum = n(prot) < 2.5
        ? "Portal hipertansif asit, düşük protein (< 2,5 g/dL) — siroz lehine."
        : "Portal hipertansif asit, yüksek protein (≥ 2,5 g/dL) — kardiyak asit, Budd-Chiari ya da sinüzoidal obstrüksiyon sendromu lehine.";
  } else if (portal === false) {
    saagYorum = "Portal hipertansiyon dışı asit (SAAG < 1,1) — peritoneal karsinomatoz, tüberküloz peritoniti, pankreatik asit, nefrotik sendrom, serozit.";
  }

  const sbp = pmnGirildi && pmnOk ? n(pmn) >= 250 : null;
  const dusukProtein = protGirildi && protOk && n(prot) < 1.5;

  const tr = (x: number) => String(x).replace(".", ",");
  const duyuru = portal === null ? null : `SAAG ${tr(saag!)} — ${portal ? "portal hipertansif" : "portal hipertansiyon dışı"}${sbp === true ? " · SBP ölçütü karşılanıyor" : ""}`;

  return (
    <OlcekKabugu
      slug="asit-analizi"
      ikon="💧"
      baslik="Asit Sıvısı Analizi"
      altBaslik="SAAG · Asit Total Proteini · PMN ile SBP"
      paylasim={{ saag }}
      not={
        <p>
          Serum ve asit örnekleri aynı gün alınmalıdır. Serum albümini &lt; 1,1 g/dL ya da belirgin hiperglobulinemi SAAG'ı yanıltabilir. PMN = asit lökositi ×
          nötrofil yüzdesi. Hemorajik asitte her 250 eritrosit için 1 PMN düşülür. Runyon BA ve ark., Ann Intern Med 1992; AASLD asit kılavuzu 2021.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Serum albümin (g/dL)</span>
            <input type="text" inputMode="decimal" value={sAlb} onChange={(e) => setSAlb(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Asit albümin (g/dL)</span>
            <input type="text" inputMode="decimal" value={aAlb} onChange={(e) => setAAlb(e.target.value)} className={girdi} />
          </label>
        </div>
        <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest pl-1">İsteğe bağlı</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Asit total protein (g/dL)</span>
            <input type="text" inputMode="decimal" value={prot} onChange={(e) => setProt(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Asit PMN (hücre/mm³)</span>
            <input type="text" inputMode="numeric" value={pmn} onChange={(e) => setPmn(e.target.value)} className={girdi} />
          </label>
        </div>
      </div>

      {(hatali.length > 0 || tutarsiz) && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          {tutarsiz ? "Asit albümini serum albümininden yüksek — değerleri ya da örneklerin aynı gün alındığını kontrol edin. " : ""}
          {hatali.length > 0 ? `Kontrol edin: ${hatali.join(" · ")}` : ""}
        </div>
      )}

      <SonucDuyuru metin={duyuru} />
      {portal !== null ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white space-y-3">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">SAAG</p>
          <p className="text-4xl font-black text-blue-900">{tr(saag!)} <span className="text-lg">g/dL</span></p>
          <p className={`text-[13px] font-black ${portal ? "text-orange-800" : "text-blue-900"}`}>{saagYorum}</p>
          {sbp !== null && (
            <p className={`text-[13px] font-black rounded-xl px-3 py-2 ${sbp ? "bg-rose-50 text-rose-900 border border-rose-200" : "bg-emerald-50 text-emerald-900 border border-emerald-200"}`}>
              {sbp
                ? `PMN ${n(pmn)}/mm³ ≥ 250 — spontan bakteriyel peritonit. Kültür sonucunu beklemeden ampirik antibiyotik ve albümin; sekonder peritonit bulgularını araştırın.`
                : `PMN ${n(pmn)}/mm³ < 250 — SBP ölçütü karşılanmıyor.`}
            </p>
          )}
          {dusukProtein && (
            <p className="text-[12px] font-bold text-slate-700">
              Asit proteini &lt; 1,5 g/dL: ek risk etkenleri (böbrek ya da karaciğer işlev bozukluğu) varsa primer SBP profilaksisi açısından değerlendirin.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            {tutarsiz ? "Değerler tutarsız" : `Eksik: ${eksik.join(" · ")}`}
          </p>
        </div>
      )}
    </OlcekKabugu>
  );
}
