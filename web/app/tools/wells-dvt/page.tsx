"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

type Item = { key: string; label: string; pts: number; sub?: string };

const ITEMS: Item[] = [
  { key: "cancer",      label: "Aktif Kanser",                         pts:  1, sub: "Son 6 ayda tedavi görmüş veya palyatif" },
  { key: "paralysis",   label: "Paralizi / Parezi",                    pts:  1, sub: "Alt ekstremitede immobilizasyon" },
  { key: "immob",       label: "Yakın Cerrahi / İmmobilizasyon",       pts:  1, sub: "Son 4 haftada cerrahi veya ≥3 gün yatak istirahati" },
  { key: "tenderness",  label: "Derin Ven Hattı Boyunca Hassasiyet",   pts:  1, sub: "Lokalize hassasiyet" },
  { key: "wholeleg",    label: "Tüm Bacak Şişliği",                    pts:  1, sub: "Ekstremitenin tamamı" },
  { key: "calf3",       label: "Baldır Çevresi Farkı > 3 cm",          pts:  1, sub: "Tibial tüberositenin 10 cm altından ölçülen" },
  { key: "pitting",     label: "Pitting Ödem",                         pts:  1, sub: "Sadece semptomatik bacakta" },
  { key: "collateral",  label: "Yüzeyel Kollateral Venler",            pts:  1, sub: "Varis değil, yeni gelişen" },
  { key: "prevDVT",     label: "Önceki DVT Öyküsü",                    pts:  1, sub: "Belgelenmiş VTE geçmişi" },
  { key: "altDx",       label: "Alternatif Tanı Olasılığı",            pts: -2, sub: "DVT'den daha olası bir tanı varlığı" },
];

// Gösterim skalası: 0 – 9 (negatif skorlar 0'a yapışır)
const DVT_DISPLAY_MAX = 9;
const ZONES = [
  { from: -Infinity, to: 1,  label: "DÜŞÜK",  prob: "~%5",  fill: "#10b981", text: "#065f46", band: "< 1 pt" },
  { from: 1,         to: 2,  label: "ORTA",   prob: "~%17", fill: "#f59e0b", text: "#78350f", band: "1 pt" },
  { from: 2,         to: 9,  label: "YÜKSEK", prob: "~%53", fill: "#f43f5e", text: "#881337", band: "≥ 2 pt" },
];

// Display zones mapped to 0-9 range
const DISPLAY_ZONES = [
  { from: 0, to: 1, label: "DÜŞÜK",  prob: "~%5",  fill: "#10b981", text: "#065f46", band: "< 1 pt" },
  { from: 1, to: 2, label: "ORTA",   prob: "~%17", fill: "#f59e0b", text: "#78350f", band: "1 pt" },
  { from: 2, to: 9, label: "YÜKSEK", prob: "~%53", fill: "#f43f5e", text: "#881337", band: "≥ 2 pt" },
];

const ACTIONS = [
  { label: "DÜŞÜK",  action: "D-dimer (negatifse DVT dışla; pozitifse Doppler USG)" },
  { label: "ORTA",   action: "D-dimer negatifse dışla; pozitifse Doppler USG" },
  { label: "YÜKSEK", action: "Doğrudan Doppler USG — D-dimer bekleme" },
];

export default function WellsDVTPage() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initial: Record<string, boolean> = {};
  ITEMS.forEach(i => { initial[i.key] = s?.get(i.key) === "1"; });

  const [sel, setSel] = React.useState<Record<string, boolean>>(initial);
  function toggle(k: string) { setSel(v => ({ ...v, [k]: !v[k] })); }

  const score = ITEMS.reduce((sum, it) => sum + (sel[it.key] ? it.pts : 0), 0);

  const activeZone = ZONES.slice().reverse().find(z => score >= z.from) ?? ZONES[0];
  const activeAction = ACTIONS.find(a => a.label === activeZone.label)!;

  const params: Record<string, string | number> = {};
  ITEMS.forEach(i => { if (sel[i.key]) params[i.key] = 1; });

  // SVG gauge
  const W = 400; const H = 68; const R = 10;
  const displayScore = Math.max(0, Math.min(score, DVT_DISPLAY_MAX));
  const indX = (displayScore / DVT_DISPLAY_MAX) * W;
  const zoneRects = DISPLAY_ZONES.map(z => ({
    ...z,
    x: (z.from / DVT_DISPLAY_MAX) * W,
    w: ((z.to - z.from) / DVT_DISPLAY_MAX) * W,
  }));

  const selectedItems = ITEMS.filter(it => sel[it.key] && it.pts > 0);
  const deductItem = ITEMS.filter(it => sel[it.key] && it.pts < 0);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="wells-dvt" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🦵</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Wells (DVT)</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Derin Ven Trombozu Risk Analizi</p>
          </div>
        </div>

        {/* KRİTERLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map((it) => (
              <label key={it.key}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${sel[it.key]
                    ? it.pts > 0
                      ? "bg-blue-900 border-blue-900 text-white shadow-md"
                      : "bg-slate-200 border-slate-300 text-blue-950"
                    : "bg-slate-50 border-slate-100 hover:border-blue-900/30"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${sel[it.key]
                      ? it.pts > 0
                        ? "bg-amber-400 border-amber-400 text-blue-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        : "bg-blue-900 border-blue-900 text-white"
                      : "bg-white border-slate-200 text-transparent"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <span className={`text-sm font-bold block transition-colors
                      ${sel[it.key] ? it.pts > 0 ? "text-white" : "text-blue-950" : "text-blue-900/70 group-hover:text-blue-900"}`}>{it.label}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest
                      ${sel[it.key] ? it.pts > 0 ? "text-blue-200/60" : "text-slate-500" : "text-slate-400"}`}>{it.sub}</span>
                  </div>
                </div>
                <input type="checkbox" className="hidden" checked={!!sel[it.key]} onChange={() => toggle(it.key)} />
                <span className={`text-[10px] font-black tracking-widest
                  ${sel[it.key] ? it.pts > 0 ? "text-amber-400" : "text-blue-900" : "text-slate-400"}`}>
                  {it.pts > 0 ? `+${it.pts}` : it.pts}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* GRAFİK SKOR KARTI */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">

          {/* Skor + risk özet */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
              <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest">SKOR</span>
              <span className="text-4xl font-black text-white leading-none">{score}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">RİSK KATEGORİSİ</p>
              <p className="text-2xl font-black italic tracking-tight" style={{ color: activeZone.text }}>
                {activeZone.label} RİSK <span className="text-sm font-bold opacity-60">{activeZone.prob}</span>
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{activeAction.action}</p>
            </div>
          </div>

          {/* SVG Gauge Bar */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Skor Skalası (0 – 9)</p>
            <svg viewBox={`-2 -2 ${W + 4} ${H + 28}`} className="w-full" style={{ overflow: "visible" }}>
              <defs>
                <clipPath id="dvt-bar-outer"><rect x="0" y="0" width={W} height={H} rx={R} ry={R} /></clipPath>
                <clipPath id="dvt-bar-fill"><rect x="0" y="0" width={Math.max(indX, 0)} height={H} /></clipPath>
              </defs>

              {/* Zone arka plan */}
              <g clipPath="url(#dvt-bar-outer)">
                {zoneRects.map(z => (
                  <rect key={z.label + "bg"} x={z.x} y={0} width={z.w} height={H} fill={z.fill} opacity={0.12} />
                ))}
              </g>

              {/* Dolu dolgu */}
              <g clipPath="url(#dvt-bar-outer)">
                <g clipPath="url(#dvt-bar-fill)">
                  {zoneRects.map(z => (
                    <rect key={z.label + "fill"} x={z.x} y={0} width={z.w} height={H} fill={z.fill} opacity={0.55} />
                  ))}
                </g>
              </g>

              {/* Zone ayırıcı çizgiler */}
              <g clipPath="url(#dvt-bar-outer)">
                {zoneRects.slice(1).map(z => (
                  <line key={z.label + "div"} x1={z.x} y1={0} x2={z.x} y2={H} stroke="white" strokeWidth="2" opacity={0.7} />
                ))}
              </g>

              {/* Zone etiketleri */}
              {zoneRects.map(z => (
                <g key={z.label + "lbl"}>
                  <text x={z.x + z.w / 2} y={H / 2 - 6} textAnchor="middle"
                    fill={z.fill} fontSize={10} fontWeight="900" fontFamily="sans-serif"
                    style={{ letterSpacing: 1.5 }}>{z.label}</text>
                  <text x={z.x + z.w / 2} y={H / 2 + 10} textAnchor="middle"
                    fill={z.text} fontSize={9} fontWeight="700" fontFamily="sans-serif" opacity={0.7}>{z.band}</text>
                </g>
              ))}

              {/* Çerçeve */}
              <rect x="0" y="0" width={W} height={H} rx={R} ry={R} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* İndikatör */}
              {displayScore > 0 && (
                <>
                  <line x1={indX} y1={4} x2={indX} y2={H - 4} stroke="white" strokeWidth="2.5" opacity={0.9} />
                  <circle cx={indX} cy={H / 2} r={13} fill={activeZone.fill} stroke="white" strokeWidth="2.5" />
                  <text x={indX} y={H / 2 + 5} textAnchor="middle" fill="white" fontSize={10} fontWeight="900" fontFamily="sans-serif">{score}</text>
                </>
              )}

              {/* Ölçek */}
              {[0, 1, 2, 9].map(v => (
                <g key={v}>
                  <line x1={(v / DVT_DISPLAY_MAX) * W} y1={H + 1} x2={(v / DVT_DISPLAY_MAX) * W} y2={H + 6} stroke="#cbd5e1" strokeWidth="1.5" />
                  <text x={(v / DVT_DISPLAY_MAX) * W} y={H + 18}
                    textAnchor={v === 0 ? "start" : v === 9 ? "end" : "middle"}
                    fill="#94a3b8" fontSize={9} fontWeight="700" fontFamily="sans-serif">{v}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Kriter katkı listesi */}
          {(selectedItems.length > 0 || deductItem.length > 0) && (
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seçili Kriterler</p>
              {selectedItems.map(it => (
                <div key={it.key} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-blue-900 truncate flex-1">{it.label}</span>
                  <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div className="h-full rounded-full bg-blue-900" style={{ width: `${(it.pts / 9) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-amber-600 w-6 text-right shrink-0">+{it.pts}</span>
                </div>
              ))}
              {deductItem.map(it => (
                <div key={it.key} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 truncate flex-1 line-through">{it.label}</span>
                  <div className="w-28 h-2 bg-rose-100 rounded-full overflow-hidden shrink-0">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: "22%" }} />
                  </div>
                  <span className="text-[10px] font-black text-rose-500 w-6 text-right shrink-0">{it.pts}</span>
                </div>
              ))}
            </div>
          )}

          {/* 3-zone özet bantlar */}
          <div className="grid grid-cols-3 gap-2">
            {DISPLAY_ZONES.map(z => {
              const active = z.label === activeZone.label;
              return (
                <div key={z.label} className="rounded-xl p-3 text-center border transition-all"
                  style={{
                    background: active ? z.fill : `${z.fill}18`,
                    borderColor: active ? z.fill : `${z.fill}40`,
                  }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: active ? "white" : z.text }}>{z.label}</p>
                  <p className="text-[8px] font-bold" style={{ color: active ? "rgba(255,255,255,0.8)" : z.text + "99" }}>{z.band}</p>
                  <p className="text-[9px] font-black mt-0.5" style={{ color: active ? "white" : z.fill }}>{z.prob}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ALT PANEL */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Wells DVT skoru, klinik olasılığı belirlemek içindir. "DVT Olası" (≥2) grubundaki hastalara Doppler USG, "DVT Olası Değil" (&lt;2) grubundaki hastalara ise D-dimer tetkiki önerilir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
