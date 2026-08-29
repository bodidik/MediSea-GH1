"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

export default function BmiPage() {
  const [height, setHeight] = React.useState("170");
  const [weight, setWeight] = React.useState("70");
  const [sex, setSex]       = React.useState<"m" | "f">("m");

  const h = parseLocaleNumber(height);
  const w = parseLocaleNumber(weight);

  /**
   * ÜST SINIR EKSİKTİ — ve bedeli bu araçta doğrudan DOZLAMA.
   *
   * Kapı yalnızca `h > 0` diyordu. Aracın kendi uyarısı ideal ağırlığın
   * "ilaç dozlaması ve solunum parametreleri" için kullanıldığını söylüyor,
   * yani buradan çıkan sayı bir hesabın girdisi oluyor. Ölçüldü:
   *
   *   boy 1700 cm (fazladan sıfır)  ->  İdeal ağırlık 1451.4 kg · Hamwi 1693.1
   *   boy 17 cm   (eksik sıfır)     ->  BMI 2422.1 · "OBEZİTE SINIF ..."
   *
   * İlki ARDS'de 6 mL/kg ile soluk hacmi hesaplayan biri için soluk başına
   * ~8.7 LİTRE demek. İkisi de tek karakterlik yazım hatası.
   *
   * ÇÖP KİLODA İDEAL AĞIRLIĞIN DURMASI DOĞRU ve öyle bırakıldı: Devine ve
   * Hamwi yalnızca BOYA bağlı, kiloya değil (SOFA'daki "her değer kendi
   * girdisine bağlı" dersi). Ölçüldü — kilo "abc" iken BMI "–" ama ideal
   * ağırlık 65.9/66.7 basılıyor, ki doğrusu bu.
   *
   * Sınırlar makullük sınırı: boy 50–250 cm · kilo 1–400 kg (deponun öteki
   * araçlarıyla aynı aile). `sayiGirildiMi` ayrıca çöp girdiyi eliyor.
   */
  const makul = (ham: string, alt: number, ust: number) => {
    if (!sayiGirildiMi(ham)) return false;
    const n = parseLocaleNumber(ham);
    return n >= alt && n <= ust;
  };
  const boyOk  = makul(height, 50, 250);
  const kiloOk = makul(weight, 1, 400);

  /**
   * SESSİZ BOŞLUK YERİNE SEBEP. Kapı konduktan sonra saçma bir girdide sonuç
   * yalnızca "–" oluyordu; kullanıcı neyin yanlış olduğunu göremiyordu.
   *
   * Bu araçta VARSAYILANLAR GEÇERLİ (170/70), yani sebep ancak kullanıcı
   * bir alanı bozduğunda çıkıyor — ayrı bir "girdi var mı" kapısı gerekmiyor.
   */
  const eksikAlan = [
    !boyOk && "boy (50–250 cm)",
    !kiloOk && "ağırlık (1–400 kg)",
  ].filter(Boolean) as string[];

  const bmi    = boyOk && kiloOk ? Math.round((w / (h / 100) ** 2) * 10) / 10 : 0;
  /**
   * İDEAL AĞIRLIK — iki formül, ikisi de cinsiyete bağlı.
   *
   * Devine (1974): erkek 50 kg, kadın 45.5 kg + İKİSİNDE DE inç başına 2.3 kg.
   * Hamwi  (1964): erkek 106 lb + 6 lb/inç (≈48 + 2.7), kadın 100 lb +
   *                5 lb/inç (≈45.5 + 2.2).
   *
   * Hamwi satırında bir dönem TABAN dallanıyor ama ARTIŞ dallanmıyordu:
   * `(sex === "m" ? 48 : 45.5) + 2.7 * …` — yani kadına erkek katsayısı
   * uygulanıyordu. Dal vardı ama yarımdı.
   *
   * Ölçüldü (kilo 70):
   *   erkek 170 cm  Devine 65.9  Hamwi 66.7   (doğru)
   *   kadın 170 cm  Devine 61.4  Hamwi 64.2 → doğrusu 60.7
   *   kadın 180 cm  Devine 70.5  Hamwi 74.8 → doğrusu 69.4
   *
   * Ekran kendi içinde çelişiyordu ve ayırt edici işaret buydu: erkekte
   * Hamwi Devine'in 0.8 kg ÜSTÜNDE, kadında 2.8 kg üstünde çıkıyordu —
   * oysa doğrusu 0.7 kg ALTINDA. İki formülün sırası cinsiyete göre ters
   * dönemez; dış bir kaynağa bakmadan görülebilen bir tutarsızlıktı.
   *
   * Sapma boyla büyüyor (170 cm'de 3.5 kg, 180 cm'de 5.4 kg) ve aracın
   * kendi uyarısı ideal ağırlığın "ilaç dozlaması ve solunum parametreleri"
   * için kullanıldığını söylüyor.
   */
  const devine = boyOk ? Math.round(((sex === "m" ? 50 : 45.5) + 2.3 * ((h - 152.4) / 2.54)) * 10) / 10 : 0;
  const hamwi  = boyOk ? Math.round(((sex === "m" ? 48 : 45.5) + (sex === "m" ? 2.7 : 2.2) * ((h - 152.4) / 2.54)) * 10) / 10 : 0;
  const ibw    = Math.max(devine, 0);

  const getBmiCat = () => {
    if (!bmi) return { label: "–", color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" };
    if (bmi < 18.5) return { label: "ZAYIF",            color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" };
    if (bmi < 25)   return { label: "NORMAL",            color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200" };
    if (bmi < 30)   return { label: "FAZLA KİLO",        color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" };
    if (bmi < 35)   return { label: "OBEZİTE SINIF I",   color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    if (bmi < 40)   return { label: "OBEZİTE SINIF II",  color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200" };
    return               { label: "OBEZİTE SINIF III (MORBİD)", color: "text-rose-900", bg: "bg-rose-100", border: "border-rose-300" };
  };
  const cat = getBmiCat();
  const params = { h, w, sex };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="bmi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">BMI & İdeal Kilo</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Vücut Kitle İndeksi + Devine / Hamwi İdeal Kilo</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-4">
          <div className="flex gap-3">
            {(["m", "f"] as const).map(v => (
              <label key={v} className={`focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                ${sex === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-blue-900/30'}`}>
                <input type="radio" className="sr-only" checked={sex === v} onChange={() => setSex(v)} />
                <span className={`text-sm font-bold ${sex === v ? 'text-white' : 'text-blue-900/80'}`}>{v === "m" ? "Erkek" : "Kadın"}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Boy (cm)</span>
              <input type="text" inputMode="decimal" value={height} onChange={e => setHeight(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Ağırlık (kg)</span>
              <input type="text" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          </div>
        </div>

        {eksikAlan.length > 0 && (
          <div role="alert" className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hesaplanamıyor</p>
            <p className="text-[11px] font-bold text-slate-600">
              Şu alan{eksikAlan.length > 1 ? "lar" : ""} makul bir değer bekliyor: {eksikAlan.join(" · ")}
            </p>
          </div>
        )}

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">VÜCUT KİTLE İNDEKSİ</span>
          <div className="text-7xl font-black text-white drop-shadow-lg">{bmi || "–"}</div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">kg / m²</span>
        </div>

        <SonucDuyuru metin={cat ? cat.label : null} />

        <div className={`p-6 rounded-[2rem] border-2 border-dashed ${cat.border} ${cat.bg}`}>
          <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest block mb-2">KATEGORİ</span>
          <p className={`text-2xl font-black italic tracking-tight ${cat.color}`}>{cat.label}</p>
        </div>

        {ibw > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">İDEAL VÜCUT AĞIRLIĞI</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-black text-blue-900">{devine > 0 ? devine : "–"} <span className="text-base">kg</span></div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Devine Formülü</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-black text-blue-900">{hamwi > 0 ? hamwi : "–"} <span className="text-base">kg</span></div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hamwi Formülü</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              BMI vücut yağ dağılımını yansıtmaz. İdeal vücut ağırlığı (Devine) ilaç dozlaması ve solunum parametreleri için kullanılır; hasta hedefi olarak değil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
