"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { searchAction } from "@/app/actions"; // 👈 Eğer app/actions yoksa yorum satırında kalsın, hata vermesin.

// Arama sonucu tipi
type SearchResult = {
  title: string;
  section: string;
  slug: string;
  type: 'topic' | 'section';
};

export default function SiteHeader() {
  const router = useRouter();
  
  // --- YENİ EKLENEN BRANŞLAR LİSTESİ ---
  const branches = [
    { name: "Romatoloji", slug: "romatoloji" },
    { name: "Gastro", slug: "gastroenteroloji" },
    { name: "Endokrin", slug: "endokrinoloji" },
    { name: "Nefroloji", slug: "nefroloji" },
    { name: "Hematoloji", slug: "hematoloji" },
    { name: "Kardiyo", slug: "kardiyoloji" },
    { name: "Enfeksiyon", slug: "enfeksiyon" },
    { name: "Göğüs", slug: "gogus" },
    { name: "Onkoloji", slug: "onkoloji" },
  ];

  // --- STATE (DURUM) YÖNETİMİ ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // --- ARAMA MOTORU MANTIĞI ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          // İleride arama aksiyonun hazır olunca burayı açarsın
          // const data = await searchAction(query);
          // setResults(data);
          
          // Şimdilik sahte sonuç gösterelim ki UI patlamasın
          setResults([
            { title: `${query} ile ilgili YDUS Vaka Sorusu`, section: "hematoloji", slug: "aml", type: "topic" }
          ]);
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

  // Sayfa değişince menüyü kapat
  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // Kutunun dışına tıklayınca kapat
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 max-w-[1800px] mx-auto gap-4 sm:gap-6">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-slate-900 tracking-tight shrink-0">
          <span className="text-blue-600">Medi</span>Sea
        </Link>

        {/* --- YENİ EKLENEN: BRANŞ LİNKLERİ (Sadece geniş ekranda) --- */}
        <nav className="hidden lg:flex items-center gap-5 overflow-x-auto no-scrollbar mask-edges ml-4 flex-shrink-0">
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

        {/* --- ORTA: ARAMA KUTUSU --- */}
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
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                           {result.type === 'section' ? 'Ana