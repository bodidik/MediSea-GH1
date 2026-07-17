"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

type Option = { label: string; desc: string; pts: number };

const CRITERIA: { id: string; title: string; subtitle: string; options: Option[] }[] = [
  {
    id: "thrombocytopenia",
    title: "Trombositopeni",
    subtitle: "Platelet düşüşünün büyüklüğü ve nadiri",
    options: [
      { pts: 2, label: "> %50 düşüş ve nadir ≥ 20×10⁹/L", desc: "Belirgin trombositopeni, nadir güvenli sınırda" },
      { pts: 1, label: "%30–50 düşüş veya nadir 10–19×10⁹/L", desc: "Orta düzeyde trombositopeni" },
      { pts: 0, label: "< %30 düşüş veya nadir < 10×10⁹/L", desc: "Minimal düşüş veya çok derin nadir" },
    ],
  },
  {
    id: "timing",
    title: "Zamanlama",
    subtitle: "Platelet düşüşünün heparinle ilişkisi",
    options: [
      { pts: 2, label: "Açıkça 5–10. gün veya ≤ 1 gün (son 30 gün heparin)", desc: "Klasik zamanlama veya önceki heparinle resensitizasyon (≤ 30 gün)" },
      { pts: 1, label: "5–10. günle uyumlu ama belirsiz veya > 10. gün veya ≤ 1 gün (30–100 gün önce heparin)", desc: "Atipik zamanlama veya önceki heparinle olası resensitizasyon" },
      { pts: 0, label: "< 4. gün — yakın geçmişte heparin yok", desc: "Platelet düşüşü heparinden önce veya çok erken" },
    ],
  },
  {
    id: "thrombosis",
    title: "Tromboz veya Diğer Komplikasyonlar",
    subtitle: "Yeni veya ilerleyen trombotik olay",
    options: [
      { pts: 2, label: "Yeni konfirme tromboz, deri nekrozu veya IV bolus sonrası akut reaksiyon", desc: "HIT'e özgü komplikasyonlar güçlü kanıt oluşturur" },
      { pts: 1, label: "İlerleyen/tekrarlayan tromboz, eritemli deri lezyonu veya şüpheli (kanıtlanmamış) tromboz", desc: "HIT olasılığını destekler ama konfirme değil" },
      { pts: 0, label: "Yok", desc: "Trombotik komplikasyon veya deri bulgusu yok" },
    ],
  },
  {
    id: "other",
    title: "Diğer Trombositopeni Nedenleri",
    subtitle: "Alternatif açıklama olasılığı",
    options: [
      { pts: 2, label: "Başka neden yok", desc: "Alternatif etiyoloji dışlandı" },
      { pts: 1, label: "Olası başka neden var", desc: "İlaç, sepsis, DIC, post-operatif düşüş gibi eş zamanlı etkenler mevcut" },
      { pts: 0, label: "Kesin başka neden var", desc: "Trombositopeniyi açıklayan belirgin alternatif etiyoloji" },
    ],
  },
];

const SCORE_BANDS = [
  { min: 0, max: 3, label: "DÜŞÜK OLASILIK", prob: "< %2", color: "emerald", action: "HIT olası değil. Heparine devam edilebilir. Anti-PF4/heparin antikor testi çoğunlukla gerekmez." },
  { min: 4, max: 5, label: "ORTA OLASILIK", prob: "~%14", color: "amber", action: "HIT olası. Heparin kesilmeli, alternatif antikoagülan başlanmalı. Anti-PF4/heparin antikoru (ELISA/SRA) için kan gönderilmeli." },
  { min: 6, max: 8, label: "YÜKSEK OLASILIK", prob: "~%64", color: "rose", action: "HIT yüksek olasılıklı. Heparin derhal kesilmeli, non-heparin antikoagülan (argatroban, fondaparinuks, bivalirudin) başlanmalı. Tüm heparin kaynaklarını kesin (yıkama, kaplama)." },
];

const colorMap = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-900 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-900 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",     badge: "bg-rose-900 text-white" },
};

export default function HitPage() {
  const [selections, setSelections] = React.useState<Record<string, number | null>>({
    thrombocytopenia: null,
    timing:           null,
    thrombosis:       null,
    other:            null,
  });

  const select = (id: string, pts: number) =>
    setSelections(prev => ({ ...prev, [id]: prev[id] === pts ? null : pts }));

  const answered = Object.values(selections).filter(v => v !== null).length;
  const total    = answered === 4 ? Object.values(selections).reduce<number>((s, v) => s + (v ?? 0), 0) : null;
  const band     = total !== null ? SCORE_BANDS.find(b => total >= b.min && total <= b.max) : null;
  const colors   = band ? colorMap[band.color as keyof typeof colorMap] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="4t-hit" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩸</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">4T Skoru — HIT</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Heparine Bağlı Trombositopeni Klinik Olasılık Skoru</p>
          </div>
        </div>

        {/* İlerleme */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/4 kriter tamamlandı</span>
          <div className="flex gap-1">
            {CRITERIA.map(c => (
              <div key={c.id} className={`w-8 h-2 rounded-full transition-all ${selections[c.id] !== null ? 'bg-blue-900' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {/* Kriterler */}
        {CRITERIA.map((crit, ci) => (
          <div key={crit.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{ci + 1}</div>
              <div>
                <p className="font-black text-blue-900 uppercase italic tracking-tight">{crit.title}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{crit.subtitle}</p>
              </div>
            </div>

            <div className="space-y-2">
              {crit.options.map(opt => {
                const selected = selections[crit.id] === opt.pts;
                return (
                  <button key={opt.pts} type="button" onClick={() => select(crit.id, opt.pts)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4
                      ${selected ? 'border-blue-900 bg-blue-900 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-blue-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 transition-all
                      ${selected ? 'bg-white text-blue-900' : 'bg-white border border-slate-200 text-slate-500'}`}>
                      {opt.pts}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-black text-sm leading-tight ${selected ? 'text-white' : 'text-blue-950'}`}>{opt.label}</p>
                      <p className={`text-[9px] font-bold mt-0.5 leading-snug ${selected ? 'text-white/60' : 'text-slate-400'}`}>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sonuç */}
        {total !== null && band && colors ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${colors.border} ${colors.bg} space-y-4`}>
            <div>
              <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">4T TOPLAM PUAN</div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className={`text-6xl font-black ${colors.text}`}>{total}</span>
                <span className={`text-sm font-black ${colors.text} opacity-60`}>/ 8 puan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${colors.badge}`}>{band.label}</span>
                <span className={`text-sm font-bold ${colors.text}`}>HIT olasılığı {band.prob}</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${colors.border} bg-white/60`}>
              <p className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest mb-2">ÖNERİLEN YÖNETİM</p>
              <p className={`text-sm font-bold ${colors.text} leading-relaxed`}>{band.action}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SCORE_BANDS.map(b => {
                const bc = colorMap[b.color as keyof typeof colorMap];
                const active = b.min === band.min;
                return (
                  <div key={b.label} className={`rounded-xl p-2 text-center border ${active ? bc.badge + ' border-transparent' : bc.bg + ' ' + bc.border}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest leading-tight ${active ? 'text-white' : bc.text}`}>{b.label.split(' ')[0]}</div>
                    <div className={`text-[10px] font-bold ${active ? 'text-white/80' : 'text-slate-500'}`}>{b.min}–{b.max} pt</div>
                    <div className={`text-[9px] font-black ${active ? 'text-white/60' : 'text-slate-400'}`}>{b.prob}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 4 kriteri seçin</p>
          </div>
        )}

        {/* Referans tablo */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Alternatif Antikoagülanlar (Heparin Kesildikten Sonra)</p>
          <div className="space-y-2">
            {[
              { drug: "Argatroban", note: "Direkt trombin inhibitörü — karaciğer metabolizması; KBY'de tercih" },
              { drug: "Fondaparinuks", note: "Anti-Xa — trombositopeni yapma riski düşük, daha uygun maliyetli" },
              { drug: "Bivalirudin", note: "Direkt trombin inhibitörü — böbrek/karaciğer yetmezliğinde doz ayarı" },
              { drug: "Danaparoid", note: "Anti-Xa — bazı ülkelerde mevcut, çapraz reaktivite az" },
            ].map(r => (
              <div key={r.drug} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-[10px] font-black text-blue-900 w-28 shrink-0">{r.drug}</span>
                <span className="text-[10px] font-bold text-blue-900/60">{r.note}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-bold text-slate-400 mt-3 italic">⚠ Warfarin, aktif tromboz çözülmeden başlanmamalı (protein C/S eksikliği riski). LMWH çapraz reaktivite nedeniyle kontrendike.</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={selections} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              4T skoru klinik bir ön test olasılık aracıdır; tek başına HIT tanısı koydurmaz. Orta-yüksek olasılıkta anti-PF4/heparin ELISA ve/veya serotonin salınım testi (SRA) ile doğrulama gereklidir. Neeman et al. 2006; Lo et al. 2006 validasyon çalışmaları.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
