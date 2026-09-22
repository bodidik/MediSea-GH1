"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";

/**
 * WHO kanama ölçeği (Miller ve ark., Cancer 1981) — trombositopenik hastada kanamanın derecesi.
 *   0 kanama yok · 1 peteşiyal / hafif kanama · 2 hafif kan kaybı (klinik olarak anlamlı, transfüzyon gerekmez)
 *   3 belirgin kan kaybı, transfüzyon gerekir · 4 yıkıcı kan kaybı: retina ya da beyin kanaması, ölümle ilişkili
 *
 * Bulgular işaretlenir ve EN YÜKSEK derece raporlanır — bulgu sayısı dereceyi artırmaz.
 * Derece 2 ve üstü transfüzyon çalışmalarında (ör. PLADO) "klinik olarak anlamlı kanama" sonlanımıdır.
 */
type Bulgu = { id: string; metin: string; derece: 1 | 2 | 3 | 4 };
const BULGULAR: ReadonlyArray<Bulgu> = [
  { id: "petesi", metin: "Peteşi ya da küçük ekimoz", derece: 1 },
  { id: "mukoza1", metin: "Kısa süreli ağız ya da burun kanaması, kendiliğinden duran", derece: 1 },
  { id: "idrar1", metin: "Yalnız mikroskopik hematüri ya da gaitada gizli kan", derece: 1 },
  { id: "purpura", metin: "Yaygın purpura ya da büyük ekimoz / hematom", derece: 2 },
  { id: "mukoza2", metin: "Uzun süren ya da tekrarlayan epistaksis / diş eti kanaması", derece: 2 },
  { id: "makro", metin: "Makroskopik hematüri, melena, hematemez, hemoptizi ya da vajinal kanama — transfüzyon gerektirmeyen", derece: 2 },
  { id: "transfuzyon", metin: "Kanamaya bağlı eritrosit transfüzyonu gerektiren kan kaybı", derece: 3 },
  { id: "hemodinamik", metin: "Hemodinamik bozulmaya yol açan kanama", derece: 4 },
  { id: "retina", metin: "Görmeyi bozan retina kanaması", derece: 4 },
  { id: "kafaici", metin: "Kafa içi kanama", derece: 4 },
  { id: "olumcul", metin: "Ölümcül kanama", derece: 4 },
];

const TANIM = [
  "Kanama yok",
  "Peteşiyal ya da hafif kanama",
  "Hafif kan kaybı — klinik olarak anlamlı, transfüzyon gerekmez",
  "Belirgin kan kaybı — transfüzyon gerekir",
  "Yıkıcı kan kaybı — retina / beyin kanaması ya da ölümcül",
] as const;
const RENK = [
  "border-emerald-200 bg-emerald-50 text-emerald-900",
  "border-emerald-200 bg-emerald-50 text-emerald-900",
  "border-amber-200 bg-amber-50 text-amber-900",
  "border-orange-200 bg-orange-50 text-orange-900",
  "border-rose-200 bg-rose-50 text-rose-900",
] as const;

export default function WhoKanamaPage() {
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const [yok, setYok] = React.useState(false);

  const derece = yok ? 0 : secili.size > 0 ? Math.max(...BULGULAR.filter((b) => secili.has(b.id)).map((b) => b.derece)) : null;
  const belirleyen = derece && derece > 0 ? BULGULAR.filter((b) => secili.has(b.id) && b.derece === derece).map((b) => b.metin) : [];

  return (
    <OlcekKabugu
      slug="who-kanama"
      ikon="🩸"
      baslik="WHO Kanama Ölçeği"
      altBaslik="Trombositopenide Kanama Derecesi · 0–4"
      paylasim={{ derece }}
      not={
        <p>
          Ölçek kanamanın ağırlığını tanımlar, trombosit sayısını değil; aynı sayıda hastalar çok farklı kanayabilir (ateş, enfeksiyon, üremi,
          koagülopati ve ilaçlar riski artırır). Klinik çalışmalarda değiştirilmiş biçimleri (ör. PLADO) organ sistemi başına ayrıntılı tanımlar
          kullanır; burada ana basamaklar ve tipik örnekler var. Miller AB ve ark., Cancer 1981.
        </p>
      }
    >
      <label className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer min-h-[44px]">
        <input type="checkbox" checked={yok} onChange={() => { setYok((v) => !v); setSecili(new Set()); }} className="w-4 h-4 accent-blue-900 shrink-0" />
        <span className="text-[12px] font-black text-blue-900">Kanama bulgusu yok</span>
      </label>

      {!yok && ([1, 2, 3, 4] as const).map((d) => (
        <fieldset key={d} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <legend className="px-2 text-[12px] font-black text-blue-900">Derece {d} bulguları</legend>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {BULGULAR.filter((b) => b.derece === d).map((b) => (
              <label key={b.id} className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer ${secili.has(b.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                <input type="checkbox" checked={secili.has(b.id)} onChange={() => setSecili((s) => kumeDegistir(s, b.id))} className="w-4 h-4 accent-blue-900 shrink-0" />
                <span className="text-[12px] font-bold text-blue-950 leading-snug">{b.metin}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <SonucDuyuru metin={derece !== null ? `WHO derece ${derece} — ${TANIM[derece]}` : null} />
      {derece !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${RENK[derece]}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">WHO kanama derecesi</p>
          <p className="text-4xl font-black">Derece {derece}</p>
          <p className="text-[12px] font-bold">{TANIM[derece]}</p>
          {belirleyen.length > 0 && <p className="text-[12px] font-bold">Dereceyi belirleyen: {belirleyen.join(" · ")}</p>}
          {derece >= 2 && <p className="text-[12px] font-bold">Derece ≥ 2 klinik olarak anlamlı kanamadır — trombosit eşiği, kanama odağı ve koagülasyon birlikte değerlendirilmelidir.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Bulguları işaretleyin ya da "kanama bulgusu yok"u seçin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
