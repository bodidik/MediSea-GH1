"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";
import { SINIRLAR } from "../lib/asit-baz";

export default function GnriPage() {
  const [alb, setAlb]       = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [sex, setSex]       = React.useState<"m" | "f">("m");

  const albN    = parseLocaleNumber(alb);
  const weightN = parseLocaleNumber(weight);
  const heightN = parseLocaleNumber(height);

  /**
   * İdeal ağırlık — Lorentz formülü, GNRI'nin (Bouillanne 2005) kullandığı hâli.
   *
   * BÖLEN CİNSİYETE BAĞLI: erkekte 4, kadında 2.5. Bir dönem burada koşulsuz
   * 4 yazıyordu, yani HER hastaya erkek varyantı uygulanıyordu — üstelik
   * araçta cinsiyet alanı hiç yoktu, yani varsayım ekranda görünmüyordu.
   *
   * Ölçüldü (165 cm · 55 kg · albumin 3.6 g/dL bir kadın):
   *   erkek varyantı → ideal 61.3 kg → GNRI 91.0 → "ORTA RİSK"
   *   kadın varyantı → ideal 59.0 kg → GNRI 92.5 → "DÜŞÜK RİSK"
   * Tek bir bant kayıyor. GNRI geriyatrik bir indeks ve o yaş grubunda
   * kadınlar çoğunlukta, yani sapma hedef nüfusun büyük kısmını vuruyordu.
   *
   * Kardeş araç `bmi` bu kalıbı zaten doğru kuruyor (Devine ve Hamwi de
   * cinsiyete bağlı, orada seçici var); `gnri` istisnaydı.
   */
  /**
   * ÜST SINIR EKSİKTİ — ve en tehlikelisi BOY alanıydı.
   *
   * Kapı yalnızca `> 0` diyordu. Çöp ve boş girdi doğru eleniyordu (ölçüldü),
   * ama fizyolojik olarak imkânsız YÜKSEK değerler geçiyordu. Ölçüldü
   * (albümin 3.6 g/dL · kilo 55 kg · boy 165 cm → GNRI 91.0 ORTA RİSK):
   *
   *   boy 1700 cm      ->  GNRI 55.5  · "YÜKSEK RİSK"     ← GERÇEKÇİ GÖRÜNÜYOR
   *   albümin 99 g/dL  ->  GNRI 1511.6 · "RİSK YOK"
   *
   * Boy vakası ayırt edici: fazladan bir sıfır (170 yerine 1700) tipik bir
   * yazım hatası ve sonuç 55.5 — gerçek bir ağır malnütrisyon GNRI'sinden
   * ayırt edilemez. Kullanıcı hatayı SONUÇTAN göremiyor.
   *
   * KİLO ZATEN KORUMALIYDI ve sebebi kayda değer: `Math.min(weightN/ibw, 1)`
   * oranı 1'de tavanlıyor, yani 700 kg ile 70 kg AYNI sonucu (95.3) veriyor.
   * Yani saçma kilo kararı değiştirmiyor — tavan burada kazara bir koruma.
   *
   * Sınırlar makullük sınırı: albümin SINIRLAR.albumin · kilo 20–300 kg ·
   * boy 50–250 cm (deponun öteki araçlarıyla aynı aile).
   */
  const makul = (ham: string, altS: number, ustS: number) => {
    if (!sayiGirildiMi(ham)) return false;
    const n = parseLocaleNumber(ham);
    return n >= altS && n <= ustS;
  };
  /**
   * Albümin sınırı TEK KAYNAKTAN (`SINIRLAR.albumin` = 0,5–7 g/dL).
   *
   * Bir dönem burada 1–7 yazılıydı ve OLCULDU: albümin 0,9 g/dL girildiğinde
   * araç "Hesaplanamıyor" diyordu. Oysa ağır hipoalbüminemi tam da bu indeksin
   * TANIMLAMAK için var olduğu hasta — yani araç en yüksek riskli hastayı
   * skorlamayı reddediyordu. Depoda aynı analitin sınırı üç ayrı yerde farklı
   * yazılmıştı (0,5–8 · 1–7 · 0,5–7); `anion-gap` ↔ `abg` turunda olduğu gibi
   * kanonik olan `SINIRLAR`a bağlandı. Mesaj metni de sabitten TÜRÜYOR.
   */
  const albOk    = makul(alb, ...SINIRLAR.albumin);
  const kiloOk   = makul(weight, 20, 300);
  const boyOk    = makul(height, 50, 250);

  /**
   * SESSİZ BOŞLUK YERİNE SEBEP. Kapı konduktan sonra saçma bir girdide sonuç
   * hiç basılmıyordu; kullanıcı neyin yanlış olduğunu göremiyordu.
   *
   * Bu araç BOŞ açılıyor (varsayılan yok), o yüzden sebep ancak kullanıcı bir
   * şey girdiyse basılıyor — bomboş formda susuluyor.
   */
  const eksikAlan = [
    !albOk && `albümin (${SINIRLAR.albumin[0]}–${SINIRLAR.albumin[1]} g/dL)`,
    !kiloOk && "ağırlık (20–300 kg)",
    !boyOk && "boy (50–250 cm)",
  ].filter(Boolean) as string[];
  const girdiVar = [alb, weight, height].some((x) => x.trim() !== "");

  const ibw = boyOk ? (heightN - 100) - (heightN - 150) / (sex === "m" ? 4 : 2.5) : null;
  const wRatio = ibw !== null && ibw > 0 && kiloOk ? Math.min(weightN / ibw, 1) : null;

  // GNRI = 1.489 × Albumin (g/L) + 41.7 × (Weight / IBW)
  // Note: albumin must be in g/L (×10 from g/dL)
  /**
   * TEK SAYI: ekranda basilan deger ile bantlanan deger AYNI olmali.
   * Bir donem bant HAM degerden, ekran `toFixed(1)` ile YUVARLANMIS degerden
   * besleniyordu ve ikisi sinirda ayrisiyordu -- OLCULDU:
   *   kadin, alb 3.566 / 55 kg / 165 cm -> ham 91.97 -> ekranda "92.0", bant "GNRI 82-91"
   * Ekran kendi belirttigi araligin disinda bir sayi gosteriyordu ve ayni
   * sayiyi goren iki hasta zit hukum aliyordu. Depo kalibi zaten uc kardes
   * aracta var (meld-na `round(meldNa,0)`, rapid3 `parseFloat(...toFixed(1))`,
   * scorad `Math.round`): BIR KEZ yuvarla, hem bas hem bantla.
   */
  const gnri = albOk && wRatio !== null
    ? Math.round((1.489 * (albN * 10) + 41.7 * wRatio) * 10) / 10
    : null;

  const getResult = (s: number) => {
    if (s > 98)    return { label: "RİSK YOK", sub: "GNRI > 98", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s >= 92)   return { label: "DÜŞÜK RİSK", sub: "GNRI 92–98", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
    if (s >= 82)   return { label: "ORTA RİSK", sub: "GNRI 82–91", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "YÜKSEK RİSK", sub: "GNRI < 82", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = gnri !== null ? getResult(gnri) : null;
  const params = { alb: albN, weight: weightN, height: heightN, sex };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="gnri" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">GNRI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Geriyatrik Nütrisyon Risk İndeksi — Albumin & İdeal Ağırlık</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-5">
          <div className="flex gap-3">
            {(["m", "f"] as const).map(v => (
              <label key={v} className={`focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                ${sex === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-blue-900/30'}`}>
                <input type="radio" name="gnri-cinsiyet" className="sr-only" checked={sex === v} onChange={() => setSex(v)} />
                <span className={`text-sm font-bold ${sex === v ? 'text-white' : 'text-blue-900/80'}`}>{v === "m" ? "Erkek" : "Kadın"}</span>
              </label>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest mb-1">Formül</p>
            <p className="text-sm font-bold text-blue-900">GNRI = 1.489 × Albumin (g/L) + 41.7 × (Mevcut Ağırlık / İdeal Ağırlık)</p>
            <p className="text-[9px] font-bold text-blue-900/80 mt-1">İdeal ağırlık (Lorentz, {sex === "m" ? "erkek" : "kadın"}): Boy(cm) − 100 − (Boy − 150)/{sex === "m" ? "4" : "2,5"}</p>
          </div>

          {[
            { label: "Albumin (g/dL)", value: alb, set: setAlb, ph: "ör. 3.5", ref: "N: 3.5–5.0 g/dL" },
            { label: "Mevcut Ağırlık (kg)", value: weight, set: setWeight, ph: "ör. 58" },
            { label: "Boy (cm)", value: height, set: setHeight, ph: "ör. 165" },
          ].map(({ label, value, set, ph, ref }) => (
            <label key={label} className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
              <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              {ref && <span className="text-[9px] font-bold text-slate-400 pl-1">{ref}</span>}
            </label>
          ))}

          {girdiVar && eksikAlan.length > 0 && (
            <div role="alert" className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hesaplanamıyor</p>
              <p className="text-[11px] font-bold text-slate-600">
                Şu alan{eksikAlan.length > 1 ? "lar" : ""} makul bir değer bekliyor: {eksikAlan.join(" · ")}
              </p>
            </div>
          )}
          {ibw !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">İdeal Ağırlık</div>
                <div className="text-2xl font-black text-blue-900">{ibw.toFixed(1)} kg</div>
              </div>
              {wRatio !== null && (
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ağırlık Oranı</div>
                  <div className="text-2xl font-black text-blue-900">{(wRatio * 100).toFixed(0)}%</div>
                </div>
              )}
            </div>
          )}

          {gnri !== null && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GNRI</span>
              <span className="text-4xl font-black text-blue-900">{gnri.toFixed(1)}</span>
            </div>
          )}
        </div>

        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest mb-2">GNRI = {gnri?.toFixed(1)}</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color}`}>{result.sub}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Risk yok", r: "> 98", c: "bg-emerald-100 text-emerald-700" },
                { l: "Düşük", r: "92–98", c: "bg-sky-100 text-sky-700" },
                { l: "Orta", r: "82–91", c: "bg-amber-100 text-amber-700" },
                { l: "Yüksek", r: "< 82", c: "bg-rose-100 text-rose-700" },
              ].map(x => (
                <div key={x.l} className={`rounded-xl p-2 text-center text-[9px] font-black uppercase tracking-widest ${x.c}`}>
                  <div>{x.l}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              GNRI özellikle yaşlı ve hemodiyaliz hastalarında malnütrisyon ve mortalite riskini değerlendirmek için geliştirilmiştir. Ağırlık/İBW oranı 1'i geçse de hesapta 1 olarak alınır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
