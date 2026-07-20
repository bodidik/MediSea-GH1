"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// Her madde için en yüksek puan 1'dir (bağımsız = 1)
const ITEMS: { id: string; label: string; detail: string; options: { label: string; pts: number }[] }[] = [
  {
    id: "phone",
    label: "Telefon Kullanma",
    detail: "Arama yapma ve cevaplama becerisi",
    options: [
      { label: "Numaraları kendisi arar ve cevaplar", pts: 1 },
      { label: "Sadece birkaç tanıdık numarayı arar", pts: 1 },
      { label: "Telefonu cevaplar ama arayamaz", pts: 1 },
      { label: "Telefonu hiç kullanamaz", pts: 0 },
    ],
  },
  {
    id: "shopping",
    label: "Alışveriş",
    detail: "Temel ihtiyaçları karşılamak için alışveriş",
    options: [
      { label: "Tüm alışverişini bağımsız yapar", pts: 1 },
      { label: "Küçük alışverişleri bağımsız yapar", pts: 0 },
      { label: "Her alışverişte eşlik edilmesine ihtiyaç duyar", pts: 0 },
      { label: "Alışveriş yapamaz", pts: 0 },
    ],
  },
  {
    id: "cooking",
    label: "Yemek Hazırlama",
    detail: "Öğünleri planlama ve pişirme",
    options: [
      { label: "Yemekleri bağımsız planlar, hazırlar ve servis eder", pts: 1 },
      { label: "Malzemeler verilirse yemek pişirir", pts: 0 },
      { label: "Hazır yemekleri ısıtır ve servis eder", pts: 0 },
      { label: "Yemek hazırlamaya ve servisine ihtiyaç duyar", pts: 0 },
    ],
  },
  {
    id: "housekeeping",
    label: "Ev Bakımı / Temizlik",
    detail: "Rutin ev temizliği ve bakımı",
    options: [
      { label: "Evi tek başına veya zaman zaman yardımla temizler", pts: 1 },
      { label: "Bulaşık yıkama ve yatak yapma gibi hafif işleri yapar", pts: 1 },
      { label: "Hafif işleri yapar ama ev yeterince temiz değil", pts: 1 },
      { label: "Her ev işinde yardıma ihtiyaç duyar", pts: 1 },
      { label: "Hiçbir ev işine katılmaz", pts: 0 },
    ],
  },
  {
    id: "laundry",
    label: "Çamaşır Yıkama",
    detail: "Kendi kıyafetlerini yıkama becerisi",
    options: [
      { label: "Tüm çamaşır yıkama işini kendisi yapar", pts: 1 },
      { label: "Çoraplar gibi küçük şeyleri yıkar", pts: 1 },
      { label: "Çamaşır yıkama işini başkası yapmalı", pts: 0 },
    ],
  },
  {
    id: "transport",
    label: "Ulaşım",
    detail: "Bağımsız seyahat edebilme",
    options: [
      { label: "Araç kullanır veya toplu taşımayı bağımsız kullanır", pts: 1 },
      { label: "Taksi ile seyahat eder ama toplu taşıma kullanamaz", pts: 1 },
      { label: "Birisi eşliğinde toplu taşıma kullanır", pts: 1 },
      { label: "Taksi veya araçla yalnızca eşlik edilirse seyahat eder", pts: 0 },
      { label: "Hiç seyahat etmez", pts: 0 },
    ],
  },
  {
    id: "medication",
    label: "İlaç Yönetimi",
    detail: "Düzenli ilaç alımı ve dozlama",
    options: [
      { label: "Kendi ilaçlarını doğru doz ve zamanda alır", pts: 1 },
      { label: "İlaçlar önceden hazırlanırsa alabilir", pts: 0 },
      { label: "İlaçları kendisi yönetemez", pts: 0 },
    ],
  },
  {
    id: "finances",
    label: "Finansal Yönetim",
    detail: "Para ve fatura yönetimi",
    options: [
      { label: "Mali işlerini bağımsız yönetir (bütçe, ödemeler)", pts: 1 },
      { label: "Günlük alışverişleri yapar ama hesap/banka işlemleri için yardım ister", pts: 1 },
      { label: "Para yönetiminde tamamen yetersiz", pts: 0 },
    ],
  },
];

export default function LawtonIadlPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? ITEMS.reduce((s, item) => {
        const idx = sel[item.id] as number;
        return s + (item.options[idx]?.pts ?? 0);
      }, 0)
    : null;

  const getBand = (v: number) =>
    v >= 8 ? { label: "BAĞIMSIZ",         sub: "Tüm enstrümental aktivitelerde bağımsız",       color: "emerald" } :
    v >= 5 ? { label: "KISMEN BAĞIMLI",   sub: "Bazı aktivitelerde yardım gerekli",              color: "amber" } :
    v >= 3 ? { label: "ORTA BAĞIMLILIK",  sub: "Çoğu aktivitede desteğe ihtiyaç var",            color: "amber" } :
             { label: "AĞIR BAĞIMLILIK",  sub: "Kapsamlı bakım desteği gerekli",                 color: "rose" };

  const band = total !== null ? getBand(total) : null;
  const COLOR = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
  };
  const c = band ? COLOR[band.color as keyof typeof COLOR] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="lawton-iadl" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🏠</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Lawton IADL</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Enstrümental Günlük Yaşam Aktiviteleri · 8 Madde · 0–8 Puan</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-blue-800">📌 Lawton IADL, Barthel İndeksi'ni tamamlar: Barthel temel öz-bakımı (beslenme, banyo), Lawton daha karmaşık toplumsal aktiviteleri (alışveriş, ilaç, finans) değerlendirir.</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/8 madde tamamlandı</span>
          <div className="flex gap-1">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-5 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div className="space-y-1.5">
                {item.options.map((opt, oi) => (
                    <button key={oi} type="button"
                      onClick={() => setSel(s => ({ ...s, [item.id]: oi }))}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all
                        ${(sel[item.id] as number | null) === oi
                          ? "border-blue-900 bg-blue-900 text-white"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                        ${(sel[item.id] as number | null) === oi
                          ? opt.pts === 1 ? "bg-amber-400 text-blue-900" : "bg-slate-400 text-white"
                          : "bg-white border border-slate-200 text-slate-400"}`}>
                        {opt.pts}
                      </span>
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
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 8</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(total / 8) * 100}%`, background: band.color === "emerald" ? "#10b981" : band.color === "amber" ? "#f59e0b" : "#f43f5e" }} />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 8 maddeyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={Object.fromEntries(ITEMS.map(i => [i.id, i.options[sel[i.id] as number]?.pts ?? 0]))} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Lawton IADL bağımsız yaşam becerilerini değerlendirir; bakım planlaması ve geriatrik değerlendirmede Barthel ile birlikte kullanılır. Kültürel ve cinsiyet faktörlerini hesaba katarak yorumlanmalıdır. Lawton & Brody, 1969.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
