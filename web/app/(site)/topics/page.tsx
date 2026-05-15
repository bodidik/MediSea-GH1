"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopicsFilters from "./_components/TopicsFilters";

// Arama parametrelerini okumak için Client Component içinde güvenli yapı
function TopicsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // URL'den q (arama) ve sort (sıralama) değerlerini alıyoruz
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "title_asc";

  useEffect(() => {
    async function fetchTopics() {
      setLoading(true);
      try {
        // Senin o meşhur Search API'ni (Çelik Kubbe) çağırıyoruz
        const res = await fetch(`/api/topics/search?q=${encodeURIComponent(q)}&sort=${sort}`, {
          cache: "no-store"
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Sonar tarama hatası:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, [q, sort]);

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Üst Panel: Başlık ve Filtreler */}
        <div className="border-b-4 border-blue-900/10 pb-12 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-4 h-4 rounded-full bg-blue-900 animate-pulse"></span>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.5em]">
              MediSea Dijital Arşiv Sistemi
            </span>
          </div>
          <h1 className="text-7xl font-black text-blue-950 uppercase italic tracking-tighter mb-8 leading-none">
            Akademik <span className="text-slate-300 not-italic">Kütüphane</span>
          </h1>
          
          {/* Senin filtreleme bileşenin */}
          <TopicsFilters q={q} sort={sort} />
        </div>

        {/* Sonuç Listesi */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="text-4xl animate-spin">⚓</div>
            <div className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Sonar taranıyor...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.items?.length > 0 ? (
              data.items.map((item: any) => (
                <Link 
                  key={item.id || item.slug} 
                  href={`/topics/${item.section?.toLowerCase() || 'genel'}/${item.slug}`}
                  className="group relative p-10 bg-slate-50 border border-slate-100 rounded-[3rem] hover:border-blue-900 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
                >
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 bg-amber-50 w-fit px-3 py-1 rounded-full">
                    {item.section || "Genel"}
                  </div>
                  <h3 className="text-2xl font-black text-blue-950 group-hover:text-blue-700 transition-colors uppercase italic leading-tight mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 font-bold leading-relaxed line-clamp-3 mb-8">
                    {item.snippet || "İçerik detayları ve güncel kılavuzlar için tıklayınız."}
                  </p>
                  
                  <div className="mt-auto flex items-center text-[10px] font-black text-blue-900 uppercase tracking-widest group-hover:gap-2 transition-all">
                    İncele <span className="text-lg">→</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                <p className="text-slate-400 font-black uppercase italic tracking-widest">
                  Aradığınız kriterlere uygun kayıt bulunamadı.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mock/Yedek Motor Bilgisi */}
        {data?.mock && (
          <div className="mt-16 p-6 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] text-center">
            <p className="text-[9px] font-black text-blue-900/40 uppercase tracking-[0.3em]">
              ⚠️ Çelik Kubbe Devrede: Backend yanıt vermediği için yedek veriler gösteriliyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js useSearchParams kullanımı için Suspense şarttır
export default function TopicsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black">Yükleniyor...</div>}>
      <TopicsContent />
    </Suspense>
  );
}