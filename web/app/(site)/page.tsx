"use client";

import React from "react";
import Link from "next/link";

// --- MEDISEA BRANŞ DÜZENLEMESİ ---
const SPECIALTIES = [
  
 {
    title: "Gastroenteroloji",
    slug: "gastroenteroloji",
    desc: "Konu anlatımları, Hepatoloji, İBH",
    icon: "🍎",
    color: "hover:border-orange-500 hover:shadow-orange-100",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  {
    title: "Kardiyoloji",
    slug: "kardiyoloji",
    desc: "AKS, Kalp Yetersizliği, Aritmiler",
    icon: "❤️",
    color: "hover:border-red-500 hover:shadow-red-100",
    bg: "bg-red-50",
    text: "text-red-600",
  },
  {
    title: "LİTERATÜR & JOURNAL CLUB",
    icon: "📰",
    desc: "En güncel Faz 3 çalışmaları ve literatür özetleri",
    slug: "journal-club",
    color: "hover:border-blue-500 hover:shadow-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
},
  {
    title: "Endokrinoloji",
    slug: "endokrinoloji",
    desc: "Diyabet, Tiroid, Adrenal",
    icon: "🦋",
    color: "hover:border-purple-500 hover:shadow-purple-100",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  {
    title: "Klinik Nütrisyon",
    slug: "klinik-nutrisyon",
    desc: "Enteral ve Parenteral Nütrisyon, ESPEN/ASPEN Kılavuzları, Malnütrisyon Yönetimi, PEG ve Refeeding Sendromu",
    icon: "🍏",
    color: "hover:border-emerald-500 hover:shadow-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    title: "Nefroloji",
    slug: "nefroloji",
    desc: "ABH, KBH, Elektrolitler",
    icon: "💧",
    color: "hover:border-emerald-500 hover:shadow-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-500",
  },
  {
    title: "Hematoloji",
    slug: "hematoloji",
    desc: "Anemiler, Lösemiler, Pıhtılaşma",
    icon: "🩸",
    color: "hover:border-rose-500 hover:shadow-rose-100",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    title: "Romatoloji",
    slug: "romatoloji",
    desc: "Artritler, Vaskülitler, SLE",
    icon: "🦴",
    color: "hover:border-blue-500 hover:shadow-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    title: "Enfeksiyon",
    slug: "enfeksiyon",
    desc: "Sepsis, Menenjit, Antibiyotikler",
    icon: "🦠",
    color: "hover:border-teal-500 hover:shadow-teal-100",
    bg: "bg-teal-50",
    text: "text-teal-600",
  },
  {
    title: "Göğüs Hast.",
    slug: "gogus",
    desc: "KOAH, Astım, Pnömoni",
    icon: "🫁",
    color: "hover:border-cyan-500 hover:shadow-cyan-100",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  {
    title: "Onkoloji",
    slug: "onkoloji",
    desc: "Solid Tümörler, Aciller",
    icon: "🎗️",
    color: "hover:border-yellow-500 hover:shadow-yellow-100",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    title: "Palyatif",
    slug: "palyatif",
    icon: "🕊️",
    desc: "Ağrı yönetimi, semptom kontrolü, yaşam sonu bakımı",
    color: "hover:border-teal-500 hover:shadow-teal-100",
    bg: "bg-teal-50",
    text: "text-teal-600",
 },
 {
    "title": "Genel Dahiliye",
    "slug": "genel-dahiliye",
    "desc": "İç hastalıkları, tanı ve tedavi süreçleri",
    "icon": "⚕️",
    "color": "hover:border-blue-500 hover:shadow-blue-100",
    "bg": "bg-blue-50",
    "text": "text-blue-600"
}
];

const FEATURED_TOOLS = [
  { slug: "wells-pe", name: "Wells PE", icon: "🔍" },
  { slug: "chads-vasc", name: "CHA₂DS₂-VASc", icon: "❤️" },
  { slug: "egfr", name: "eGFR (2021)", icon: "🧪" },
  { slug: "news2", name: "NEWS2", icon: "🚨" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-blue-950">
      
      {/* --- HERO SECTION --- */}
      <div className="relative pt-6 pb-10 sm:pt-16 sm:pb-24 overflow-hidden border-b-4 border-blue-900/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-50 via-indigo-50 to-yellow-50 rounded-full blur-3xl -z-10 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            <span className="rounded-full bg-blue-50 text-blue-900 border border-blue-100 px-4 py-1 text-[10px] font-black uppercase tracking-widest">
              Beta
            </span>
            <Link href="/tr/premium/ydus" className="rounded-full bg-yellow-400 text-blue-950 px-4 py-1 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-md">
              Premium YDUS ⚓
            </Link>
            <Link href="/tools" className="rounded-full bg-white border border-slate-200 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-900 hover:border-blue-900 transition-all">
              🧪 Klinik Hesaplayıcılar
            </Link>
          </div>
          
          <h1 className="text-5xl font-black text-blue-950 sm:text-6xl mb-4 italic uppercase tracking-tighter leading-none">
            MediSea <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 not-italic uppercase">
              Akademi
            </span>
          </h1>
          <p className="text-xl leading-relaxed text-slate-500 max-w-3xl mx-auto mb-1 font-medium">
            Klinik karar destek mekanizmaları, güncel ve uzman düzeyinde tıp eğitimi.
          </p>
        </div>
      </div>

      {/* --- BRANŞLAR VE ALTINDAKİ ARAÇLAR --- */}
      <div className="max-w-7xl mx-auto px-4 lg:px-4 py-8">
        
        {/* Başlık Bölümü */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3 border-l-8 border-blue-900 pl-2">
          <div>
            <h2 className="text-3xl font-black text-blue-950 uppercase italic tracking-tighter">Klinik Branşlar</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Uzmanlık Düzeyinde Güncel Anlatımlar</p>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase max-w-xs text-right hidden md:block">
            Hekimlere yönelik eğitsel bilgi içerir
          </p>
        </div>
        
        {/* Branş Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {SPECIALTIES.map((item) => (
            <Link 
              key={item.slug} 
              href={`/topics/${item.slug}`}
              className={`group relative flex flex-col p-7 bg-white rounded-[3rem] border border-slate-100 transition-all duration-500 hover:-translate-y-3 hover:shadow-3xl ${item.color}`}
            >
              <div className="flex items-center gap-5 mb-4">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl ${item.bg} group-hover:rotate-12 transition-all shadow-inner`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter">
                  {item.title}
                </h3>
              </div>
              
              <p className="text-slate-500 text-sm font-medium mb-3 flex-grow leading-relaxed">
                {item.desc}
              </p>

              <div className={`mt-auto flex items-center text-[10px] font-black uppercase tracking-widest ${item.text}`}>
                Konulara git
                <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* HIZLI HESAPLAYICI BARI (Branşların Altında) */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2.5rem] p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-center gap-4">
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] px-4 border-r border-slate-200 hidden md:block">Hızlı Erişim</span>
            {FEATURED_TOOLS.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-slate-100 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-0.5 transition-all group">
                <span className="text-base">{tool.icon}</span>
                <span className="text-xs font-bold text-blue-950">{tool.name}</span>
              </Link>
            ))}
            <Link href="/tools" className="text-xs font-black text-blue-600 px-4 hover:underline uppercase tracking-tighter">Tümü →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}