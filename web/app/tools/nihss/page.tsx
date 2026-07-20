"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS: { id: string; label: string; detail: string; options: { label: string; pts: number }[] }[] = [
  {
    id: "consciousness",
    label: "1a. Bilinç Düzeyi",
    detail: "Yalnızca ilk yanıtı kaydedin — uyarı vermeyin",
    options: [
      { label: "0 — Uyanık, hemen yanıt veriyor", pts: 0 },
      { label: "1 — Uyarıyla uyarılabilir, basit komutlara uyuyor", pts: 1 },
      { label: "2 — Tekrar uyarıyla yanıt veriyor, stereotipik hareketler", pts: 2 },
      { label: "3 — Yanıtsız, yalnızca refleks hareketleri veya hareketsiz", pts: 3 },
    ],
  },
  {
    id: "loc_questions",
    label: "1b. Bilinç Sorular",
    detail: "Ay (şimdiki ay), yaş — entübe/afazik ise değerlendirilemez=1",
    options: [
      { label: "0 — İkisi de doğru", pts: 0 },
      { label: "1 — Biri doğru", pts: 1 },
      { label: "2 — İkisi de yanlış", pts: 2 },
    ],
  },
  {
    id: "loc_commands",
    label: "1c. Bilinç Komutlar",
    detail: "Gözleri aç/kapat, tuttuğun elini kapat/aç",
    options: [
      { label: "0 — İkisi de doğru", pts: 0 },
      { label: "1 — Biri doğru", pts: 1 },
      { label: "2 — İkisi de yanlış", pts: 2 },
    ],
  },
  {
    id: "gaze",
    label: "2. En İyi Bakış",
    detail: "Yalnızca yatay göz hareketi (okülosefal veya okülovestibüler manevra)",
    options: [
      { label: "0 — Normal", pts: 0 },
      { label: "1 — Kısmi bakış paralizisi veya izole INO", pts: 1 },
      { label: "2 — Zorunlu deviasyon veya total bakış paralizisi", pts: 2 },
    ],
  },
  {
    id: "visual",
    label: "3. Görme",
    detail: "Her kadran ayrı ayrı; parmak sayma veya tehdit",
    options: [
      { label: "0 — Görme kaybı yok", pts: 0 },
      { label: "1 — Kısmi hemianopsi", pts: 1 },
      { label: "2 — Komplet hemianopsi", pts: 2 },
      { label: "3 — Bilateral hemianopsi (körlük dahil)", pts: 3 },
    ],
  },
  {
    id: "facial",
    label: "4. Yüz Felci",
    detail: "Diş göstermesi veya kaş kaldırma",
    options: [
      { label: "0 — Normal simetrik hareketler", pts: 0 },
      { label: "1 — Hafif (silinmiş NLF, asimetri ile gülme)", pts: 1 },
      { label: "2 — Kısmi (alt yüz tam, üst kısmi felç)", pts: 2 },
      { label: "3 — Komplet (bir veya iki taraflı)", pts: 3 },
    ],
  },
  {
    id: "motor_arm_l",
    label: "5a. Motor Kol — Sol",
    detail: "Kolu 45° (supine) veya 90° (oturur) kaldırıp 10 sn tutmasını isteyin",
    options: [
      { label: "0 — Düşmüyor (10 sn tutar)", pts: 0 },
      { label: "1 — Düşüyor ama yatağa değmiyor", pts: 1 },
      { label: "2 — Yerçekimine karşı gelemiyor", pts: 2 },
      { label: "3 — Yerçekimine karşı hiç hareket yok", pts: 3 },
      { label: "4 — Hareket yok", pts: 4 },
    ],
  },
  {
    id: "motor_arm_r",
    label: "5b. Motor Kol — Sağ",
    detail: "Kolu 45° (supine) veya 90° (oturur) kaldırıp 10 sn tutmasını isteyin",
    options: [
      { label: "0 — Düşmüyor (10 sn tutar)", pts: 0 },
      { label: "1 — Düşüyor ama yatağa değmiyor", pts: 1 },
      { label: "2 — Yerçekimine karşı gelemiyor", pts: 2 },
      { label: "3 — Yerçekimine karşı hiç hareket yok", pts: 3 },
      { label: "4 — Hareket yok", pts: 4 },
    ],
  },
  {
    id: "motor_leg_l",
    label: "6a. Motor Bacak — Sol",
    detail: "Bacağı 30° kaldırıp 5 sn tutmasını isteyin (supin pozisyon)",
    options: [
      { label: "0 — Düşmüyor (5 sn tutar)", pts: 0 },
      { label: "1 — Düşüyor ama yatağa değmiyor", pts: 1 },
      { label: "2 — Yerçekimine karşı gelemiyor", pts: 2 },
      { label: "3 — Yerçekimine karşı hiç hareket yok", pts: 3 },
      { label: "4 — Hareket yok", pts: 4 },
    ],
  },
  {
    id: "motor_leg_r",
    label: "6b. Motor Bacak — Sağ",
    detail: "Bacağı 30° kaldırıp 5 sn tutmasını isteyin (supin pozisyon)",
    options: [
      { label: "0 — Düşmüyor (5 sn tutar)", pts: 0 },
      { label: "1 — Düşüyor ama yatağa değmiyor", pts: 1 },
      { label: "2 — Yerçekimine karşı gelemiyor", pts: 2 },
      { label: "3 — Yerçekimine karşı hiç hareket yok", pts: 3 },
      { label: "4 — Hareket yok", pts: 4 },
    ],
  },
  {
    id: "ataxia",
    label: "7. Uzuv Ataksisi",
    detail: "Parmak-burun ve topuk-diz testi; sadece ataksi ise puan ver (plej varsa 0)",
    options: [
      { label: "0 — Yok", pts: 0 },
      { label: "1 — Bir ekstremitede mevcut", pts: 1 },
      { label: "2 — İki ekstremitede mevcut", pts: 2 },
    ],
  },
  {
    id: "sensory",
    label: "8. Duygu",
    detail: "İğne batırma ile bilinç bozukluğu / afazide yüz grimasına bakın",
    options: [
      { label: "0 — Normal, kayıp yok", pts: 0 },
      { label: "1 — Hafif-orta kaybı veya etkilenen tarafta künt his", pts: 1 },
      { label: "2 — Ağır veya total duyu kaybı", pts: 2 },
    ],
  },
  {
    id: "language",
    label: "9. En İyi Dil",
    detail: "Tanımlama kartı, cümle okuma, nesne adlandırma",
    options: [
      { label: "0 — Normal, kayıp yok", pts: 0 },
      { label: "1 — Hafif-orta afazi; anlaşılabilir ama güçlük var", pts: 1 },
      { label: "2 — Ağır afazi; parçalı ifade, anlamada belirgin güçlük", pts: 2 },
      { label: "3 — Global afazi; konuşma veya anlama yok", pts: 3 },
    ],
  },
  {
    id: "dysarthria",
    label: "10. Dizartri",
    detail: "Standart kelime listesini okutun — entübe ise 1 puan",
    options: [
      { label: "0 — Normal", pts: 0 },
      { label: "1 — Hafif-orta; en azından bazı kelimeler anlaşılabilir", pts: 1 },
      { label: "2 — Ağır; konuşma anlaşılmaz / afazik", pts: 2 },
    ],
  },
  {
    id: "neglect",
    label: "11. İhmal (Extinction/İnattention)",
    detail: "Çift eşzamanlı uyarı; görsel, dokunsal, işitsel modaliteler",
    options: [
      { label: "0 — Anormallik yok", pts: 0 },
      { label: "1 — Bir modalitede dikkatsizlik / ihmal", pts: 1 },
      { label: "2 — Ağır hemispatyal ihmal; ikiden fazla modalite", pts: 2 },
    ],
  },
];

const getBand = (v: number) =>
  v === 0       ? { label: "NORMAL",         color: "emerald", sub: "Nörolojik defisit yok" } :
  v <= 4        ? { label: "HAFİF",          color: "sky",     sub: "Hafif inme" } :
  v <= 15       ? { label: "ORTA",           color: "amber",   sub: "Orta şiddetli inme" } :
  v <= 20       ? { label: "ORTA-AĞIR",      color: "orange",  sub: "Orta-ağır inme" } :
                  { label: "AĞIR",           color: "rose",    sub: "Ağır inme — trombektomi eşiği değerlendir" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function NIHSSPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="nihss" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧠</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">NIHSS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">NIH İnme Skalası · 11 Alan · 0–42 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/{ITEMS.length} alan</span>
          <div className="flex flex-wrap gap-0.5">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-3 h-2 rounded-sm transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div className="space-y-1.5">
                {item.options.map(opt => (
                  <button key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                      ${sel[item.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                      ${sel[item.id] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">NIHSS</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 42</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
                {total >= 6 && <p className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase tracking-widest">IV tPA: son 3–4.5 saat içinde değerlendir</p>}
                {total >= 6 && <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Trombektomi: ≥ 6 puan ve büyük damar oklüzyonunda</p>}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[7px]">
              {[
                { l: "Normal", r: "0" },
                { l: "Hafif", r: "1–4" },
                { l: "Orta", r: "5–15" },
                { l: "Orta-Ağır", r: "16–20" },
                { l: "Ağır", r: "≥ 21" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1 font-black
                  ${(b.l === "Normal" && total === 0) || (b.l === "Hafif" && total >= 1 && total <= 4) || (b.l === "Orta" && total >= 5 && total <= 15) || (b.l === "Orta-Ağır" && total >= 16 && total <= 20) || (b.l === "Ağır" && total >= 21) ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm alanları tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              NIHSS eğitim gerektiren standart bir nöroloji değerlendirmesidir. Posterior dolaşım inmelerinde duyarlılığı düşük olabilir. Brott et al., Stroke 1989.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
