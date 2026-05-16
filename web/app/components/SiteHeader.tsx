"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchAction } from "@/app/actions"; // Senin orijinal arama eylemin

// Arama sonucu tipi
type SearchResult = {
  title: string;
  section: string;
  slug: string;
  type: 'topic' | 'section';
};

export default function SiteHeader() {
  const router = useRouter();
  
  // Branşlar Listesi
  const branches = [
    { name: "Romatoloji", slug: "romatoloji" },
    { name: "Gastro", slug: "gastroenteroloji" },
    { name: "Endokrin", slug: "endokrinoloji" },
    { name: "Nefroloji", slug: "nefroloji" },
    { name: "Hematoloji", slug: "hematoloji" },
    { name: "Kardiyoloji", slug: "kardiyoloji" },
    { name: "Enfeksiyon", slug: "enfeksiyon" },
    { name: "Göğüs", slug: "gogus" },
    { name: "Onkoloji", slug: "onkoloji" },
  ];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Arama Motoru Mantığı
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const data = await searchAction(query);
          setResults(data);
        } catch (error) {
          console.error("Arama hatası", error);
        } finally {
          setLoading(false);
          setIsOpen(true);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center px-4 max-w-[1800px] mx-auto gap-3 sm:gap-6">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 font-black text-2xl text-slate-900 tracking-tight shrink-0">
          <span className="text-blue-600 italic">Medi</span><span className="text-slate-300">Sea</span>
        </Link>

        {/* BRANŞ LİNKLERİ (Sadece çok geniş ekranda) */}
        <nav className="hidden 2xl:flex items-center gap-5 overflow-x-auto no-scrollbar mask-edges flex-shrink-0">
          {branches.map((branch) => (
            <Link
              key={branch.slug}
              href={`/topics/${branch.slug}`}
              className="text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {branch.name}
            </Link>
          ))}
        </nav>

        {/* ORTA: ARAMA KUTUSU */}
        <div className="flex-1 max-w-xl relative ml-auto" ref={wrapperRef}>
          <div className="relative group">
            <span className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Hastalık, semptom veya vaka ara..."
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
            />
            
            {loading && (
              <span className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}

            {!loading && query.length > 0 && (
              <button 
                onClick={() => { setQuery(""); setIsOpen(false); }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* SONUÇ PENCERESİ */}
          {isOpen && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {results.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-50 mb-1">
                    Sonuçlar
                  </div>
                  {results.map((result, index) => (
                    <Link
                      key={index}
                      href={result.type === 'section' ? `/topics/${result.section}` : `/topics/${result.section}/${result.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 group border-l-4 border-transparent hover:border-blue-500 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${result.type === 'section' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {result.type === 'section' ? '📂' : '📄'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{result.title}</p>
                        <p className="text-xs text-slate-500 capitalize">
                           {result.type === 'section' ? 'Ana Bölüm' : `${result.section} Rehberi`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              ) : (
                !loading && (
                   <div className="p-8 text-center text-slate-500">
                      <div className="text-4xl mb-2">🤔</div>
                      <p className="text-sm font-medium">Sonuç bulunamadı.</p>
                      <p className="text-xs text-slate-400 mt-1">Farklı bir kelime deneyin.</p>
                   </div>
                )
              )}
            </div>
          )}
        </div>

        {/* --- VİTRİN BUTONLARI --- */}
        <div className="hidden xl:flex items-center gap-3 shrink-0 ml-4">
          <Link href="/tr/premium/ydus" className="bg-amber-400 hover:bg-amber-500 text-blue-950 text-xs font-black tracking-widest px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            PREMİUM YDUS <span>⚓</span>
          </Link>
          
          {/* KLİNİK ARAÇLAR AÇILIR MENÜ (DROPDOWN) */}
          <div className="relative group">
            <Link href="/tools" className="bg-white hover:bg-slate-50 border border-slate-200 text-blue-950 text-xs font-black tracking-widest px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
              <span>🧪</span> KLİNİK ARAÇLAR
              {/* Oku ekledik */}
              <svg className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Fare Üzerine Gelince Açılan Liste */}
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden p-2">
              <Link href="/tools/hesaplayicilar" className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors group/item">
                <span className="text-lg">🧮</span>
                <span className="text-sm font-bold text-slate-700 group-hover/item:text-blue-700">Hesaplayıcılar</span>
              </Link>
              <Link href="/tools/algoritmalar" className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors group/item">
                <span className="text-lg">🗺️</span>
                <span className="text-sm font-bold text-slate-700 group-hover/item:text-blue-700">Algoritmalar</span>
              </Link>
              <Link href="/tools/ilac-etkilesim" className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors group/item">
                <span className="text-lg">💊</span>
                <span className="text-sm font-bold text-slate-700 group-hover/item:text-blue-700">İlaç Etkileşimleri</span>
              </Link>
              
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              
              <Link href="/tools" className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group/item">
                <span className="text-[10px] font-black tracking-widest text-slate-400 group-hover/item:text-slate-600">TÜM ARAÇLAR</span>
                <span className="text-slate-300 group-hover/item:text-slate-500 group-hover/item:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SAĞ: GİRİŞ / ÜYE OL */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2 border-l border-slate-200 pl-4 sm:pl-6">
          <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 hover:text-blue-700 transition-colors">
            Giriş
          </Link>
          <Link href="/register" className="bg-blue-950 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-800 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>Üye Ol</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse hidden sm:block"></span>
          </Link>
        </div>

      </div>
    </header>
  );
}