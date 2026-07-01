'use client';
import { useState } from 'react';
import Link from 'next/link';

const NEPHRO_CATEGORIES = [
  {
    id: "glomeruler",
    title: "Glomerüler Hastalıklar",
    icon: "🔬",
    desc: "Nefrotik ve Nefritik Sendromlar",
    color: "emerald",
    items: [
      { title: "Lupus Nefriti Yönetimi", href: "/tr/premium/ydus/nefroloji/lupus-nefriti", isReady: true, badges: ["VAKA", "YENİ"] },
      { title: "IgA Nefropatisi", href: "#", isReady: false, badges: ["YAKINDA"] },
      { title: "Membranöz Nefropati", href: "#", isReady: false, badges: ["YAKINDA"] },
    ]
  },
  {
    id: "yetersizlik",
    title: "Böbrek Yetersizliği",
    icon: "🫘",
    desc: "ABH ve KBY Yönetimi",
    color: "blue",
    items: [
      { title: "Akut Böbrek Hasarı (KDIGO)", href: "#", isReady: false, badges: ["YAKINDA"] },
      { title: "SDBY ve Diyaliz Endikasyonları", href: "#", isReady: false, badges: ["YAKINDA"] },
    ]
  }
];

export default function NefrolojiDashboard() {
  const [openCategory, setOpenCategory] = useState<string | null>("glomeruler");
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500">
          <Link href="/tr/premium/ydus" className="hover:text-slate-800">🏠 Lobi</Link>
          <span>/</span>
          <span className="text-emerald-600">Nefroloji</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-8">Nefroloji İndeksi</h1>
        {/* Akordiyon yapısı buraya gelecek (Hematoloji ile aynı mantık) */}
        <div className="grid gap-4">
           {/* Kategori Map'leme */}
           {NEPHRO_CATEGORIES.map(cat => (
             <div key={cat.id} className="bg-white rounded-2xl border-2 border-slate-100 p-4">
                <button onClick={() => setOpenCategory(cat.id)} className="w-full text-left font-bold text-lg flex items-center gap-3">
                  <span>{cat.icon}</span> {cat.title}
                </button>
                {openCategory === cat.id && (
                  <div className="mt-4 flex flex-col gap-2">
                    {cat.items.map((item, i) => (
                      <Link key={i} href={item.href} className="p-3 bg-slate-50 rounded-xl flex justify-between">
                        <span className={item.isReady ? "font-bold" : "text-slate-400"}>{item.title}</span>
                        <div className="flex gap-1">
                          {item.badges.map(b => <span key={b} className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black">{b}</span>)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}