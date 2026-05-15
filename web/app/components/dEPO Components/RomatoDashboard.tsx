"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

// TİPLER
type Topic = {
  slug: string;
  title: string;
  subcategory?: string;
  tags?: string[];
};

export default function RomatoDashboard({ topics }: { topics: Topic[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  
  // FAVORİLER (Romatoloji'ye özel hafıza)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("romato_favorites"); // <-- ÖNEMLİ: Anahtar farklı
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(slug)) {
      newFavs = favorites.filter((f) => f !== slug);
    } else {
      newFavs = [...favorites, slug];
    }
    setFavorites(newFavs);
    localStorage.setItem("romato_favorites", JSON.stringify(newFavs));
  };

  const categories = ["Tümü", "❤️ Favorilerim", ...Array.from(new Set(topics.map((t) => t.subcategory || "Diğer"))).sort()];

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesCategory = true;
      if (selectedCategory === "❤️ Favorilerim") {
        matchesCategory = favorites.includes(topic.slug);
      } else if (selectedCategory !== "Tümü") {
        matchesCategory = (topic.subcategory || "Diğer") === selectedCategory;
      }
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, topics, favorites]);

  if (!isClient) return null;

  return (
    <div>
      {/* --- KONTROL PANELİ (MAVİ TEMA) --- */}
      <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur py-4 border-b border-gray-200 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 shadow-sm transition-all">
        <div className="flex flex-col gap-4">
          
          {/* ARAMA */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Artrit, vaskülit veya otoantikor ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium"
            />
            <svg width="24" height="24" className="w-6 h-6 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>

          {/* KATEGORİ BUTONLARI */}
          <div className="w-full overflow-x-auto pb-1 no-scrollbar">
            <div className="flex space-x-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- KART LİSTESİ --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((t) => {
            const isFav = favorites.includes(t.slug);
            return (
              <Link key={t.slug} href={`/tr/topics/romatoloji/${t.slug}`} className="block group h-full">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
                  
                  {/* FAVORİ BUTONU */}
                  <button
                    onClick={(e) => toggleFavorite(e, t.slug)}
                    className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-200 active:scale-95 ${
                      isFav 
                        ? "text-red-500 bg-red-50 hover:bg-red-100 shadow-sm" 
                        : "text-gray-300 bg-transparent hover:bg-gray-50 hover:text-gray-400"
                    }`}
                  >
                    <svg width="24" height="24" className={`w-6 h-6 transition-colors ${isFav ? "fill-current" : "fill-none stroke-current stroke-2"}`} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 pr-10">
                    {t.subcategory || "Genel"}
                  </div>

                  <h3 className="font-bold text-gray-800 group-hover:text-blue-700 text-lg leading-snug mb-4">
                    {t.title}
                  </h3>

                  {t.tags && t.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                      {t.tags.map((tag, i) => (
                        <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            tag === "Acil" ? "bg-red-50 text-red-600 border-red-100" :
                            tag === "Algoritma" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-gray-50 text-gray-500 border-gray-100"
                          }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
             {selectedCategory === "❤️ Favorilerim" ? (
              <>
                <div className="text-4xl mb-3">❤️</div>
                <p className="text-gray-500 font-medium text-lg">Favori listeniz boş.</p>
                <button onClick={() => setSelectedCategory("Tümü")} className="mt-6 px-6 py-2 bg-blue-50 text-blue-700 rounded-full font-bold hover:bg-blue-100 transition-colors">
                  Tüm Konuları Gör
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">Sonuç bulunamadı.</p>
                <button onClick={() => {setSearchQuery(""); setSelectedCategory("Tümü")}} className="text-blue-600 font-bold hover:underline">
                  Temizle
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}