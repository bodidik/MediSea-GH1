"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";

/**
 * ASAS aksiyel spondiloartrit sınıflama kriterleri (Rudwaleit ve ark., Ann Rheum Dis 2009).
 * Giriş: ≥ 3 ay bel ağrısı ve başlangıç yaşı < 45.
 *   Görüntüleme kolu: sakroiliit (MR'da aktif inflamasyon ya da mNY radyografik) + ≥ 1 SpA bulgusu
 *   Klinik kol:       HLA-B27 + ≥ 2 DİĞER SpA bulgusu
 * HLA-B27 bir SpA bulgusudur; görüntüleme kolunda tek başına yeter, klinik kolda "diğer" iki bulgunun
 * içine SAYILMAZ — aynı B27 iki kez kullanılamaz.
 */
const BULGULAR = [
  { id: "ibp", metin: "İnflamatuvar bel ağrısı" },
  { id: "artrit", metin: "Artrit" },
  { id: "entezit", metin: "Entezit (topuk)" },
  { id: "uveit", metin: "Üveit" },
  { id: "daktilit", metin: "Daktilit" },
  { id: "psoriazis", metin: "Psoriazis" },
  { id: "iBH", metin: "Crohn hastalığı / ülseratif kolit" },
  { id: "nsaid", metin: "NSAİİ'ye iyi yanıt (24–48 saatte)" },
  { id: "aile", metin: "Ailede SpA öyküsü" },
  { id: "crp", metin: "Yüksek CRP" },
] as const;

const EH: Secenek[] = [{ label: "Evet", pts: 0 }, { label: "Hayır", pts: 0 }];

export default function AsasAxspaPage() {
  const [giris, setGiris] = React.useState<number | null>(null);
  const [sakroiliit, setSakroiliit] = React.useState<number | null>(null);
  const [b27, setB27] = React.useState<number | null>(null);
  const [bulgu, setBulgu] = React.useState<ReadonlySet<string>>(new Set());

  const digerSayisi = bulgu.size;
  const b27Var = b27 === 0;
  const sakroVar = sakroiliit === 0;
  const hazir = giris === 0 && sakroiliit !== null && b27 !== null;

  // Görüntüleme kolunda B27 de bir SpA bulgusu sayılır.
  const goruntulemeKolu = hazir && sakroVar && (digerSayisi + (b27Var ? 1 : 0)) >= 1;
  const klinikKol = hazir && b27Var && digerSayisi >= 2;
  const sonuc = !hazir ? null : goruntulemeKolu || klinikKol;

  const kollar = [goruntulemeKolu && "görüntüleme kolu", klinikKol && "klinik kol"].filter(Boolean).join(" ve ");

  return (
    <OlcekKabugu
      slug="asas-axspa"
      ikon="🦴"
      baslik="ASAS Aksiyel SpA Kriterleri"
      altBaslik="Aksiyel Spondiloartrit Sınıflaması · Görüntüleme ve Klinik Kol"
      paylasim={{ axspa: sonuc === null ? null : sonuc ? 1 : 0 }}
      not={
        <p>
          İnflamatuvar bel ağrısı (ASAS uzman ölçütü): başlangıç &lt; 40 yaş, sinsi başlangıç, egzersizle düzelme, dinlenmekle düzelmeme, gece ağrısı
          (kalkınca düzelen) — 5'ten ≥ 4'ü. MR'da sakroiliit: SpA ile uyumlu, ASAS tanımına uyan kemik iliği ödemi. Sınıflama kriterleridir; kronik bel
          ağrılı genel popülasyonda tanı aracı olarak kullanıldığında özgüllük düşer. Rudwaleit M ve ark., Ann Rheum Dis 2009.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="giris" baslik="Giriş — ≥ 3 ay süren bel ağrısı ve başlangıç yaşı < 45" secenekler={EH} secili={giris} onSec={setGiris} rozetGizle />
        {giris === 1 && (
          <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
            Giriş kriteri karşılanmıyor — ASAS aksiyel SpA kriterleri uygulanmaz.
          </div>
        )}
        <SecimMaddesi
          id="sakroiliit"
          baslik="Görüntülemede sakroiliit"
          aciklama="MR'da aktif (akut) inflamasyon ya da modifiye New York kriterlerine uyan radyografik sakroiliit."
          secenekler={EH}
          secili={sakroiliit}
          onSec={setSakroiliit}
          rozetGizle
        />
        <SecimMaddesi id="b27" baslik="HLA-B27 pozitif" secenekler={EH} secili={b27} onSec={setB27} rozetGizle />
        <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <legend className="px-2 text-[12px] font-black text-blue-900">Diğer SpA bulguları · {digerSayisi} işaretli</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {BULGULAR.map((b) => (
              <label
                key={b.id}
                className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                  ${bulgu.has(b.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
              >
                <input type="checkbox" checked={bulgu.has(b.id)} onChange={() => setBulgu((s) => kumeDegistir(s, b.id))} className="w-4 h-4 accent-blue-900 shrink-0" />
                <span className="text-[12px] font-bold text-blue-950">{b.metin}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <SonucDuyuru metin={sonuc === null ? null : sonuc ? `Aksiyel SpA — ${kollar}` : "ASAS aksiyel SpA kriterleri karşılanmıyor"} />
      {sonuc === null ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            {giris === 1 ? "Giriş kriteri karşılanmıyor" : "Giriş, sakroiliit ve HLA-B27 sorularını yanıtlayın"}
          </p>
        </div>
      ) : (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${sonuc ? "border-rose-200 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-800"}`}>
          <p className="text-xl font-black">{sonuc ? "Aksiyel spondiloartrit" : "Kriterler karşılanmıyor"}</p>
          <ul className="text-[12px] font-bold space-y-1">
            <li>
              Görüntüleme kolu: {goruntulemeKolu ? "karşılanıyor" : "karşılanmıyor"} — sakroiliit {sakroVar ? "var" : "yok"}, SpA bulgusu {digerSayisi + (b27Var ? 1 : 0)} (HLA-B27 dahil, ≥ 1 gerekli)
            </li>
            <li>
              Klinik kol: {klinikKol ? "karşılanıyor" : "karşılanmıyor"} — HLA-B27 {b27Var ? "pozitif" : "negatif"}, diğer SpA bulgusu {digerSayisi} (≥ 2 gerekli)
            </li>
          </ul>
        </div>
      )}
    </OlcekKabugu>
  );
}
