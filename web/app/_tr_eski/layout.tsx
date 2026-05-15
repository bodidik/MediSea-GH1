import "../globals.css";
import type { Metadata } from "next";
import TopicSidebar from "@/components/TopicSidebar";
import SiteHeader from "@/components/SiteHeader"; 
import TableOfContents from "@/components/TableOfContents";

export const metadata: Metadata = {
  title: "MediSea TR",
  description: "İç Hastalıkları Eğitim Platformu",
};

export default function TrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* 2. ANA ŞALTER: Üst Menüyü (Arama Çubuğu) Buraya Taktık */}
      <SiteHeader />

      {/* Konteyner genişliği: 1800px (Ferah) */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto px-4 py-4">
        
        {/* Gap-4 (16px) ile sütunları birbirine yaklaştırdık, ortaya yer açtık */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* --- SOL BLOK (Navigasyon + TOC) --- */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-6">
              
              {/* 1. GENEL MENÜ (OTOMATİK SİSTEM) */}
              <div className="bg-white/50 rounded-lg p-3 border border-slate-200/60">
                <TopicSidebar />
              </div>

             {/* 2. BU SAYFADA (TOC) - ARTIK OTOMATİK! 🧠 */}
              {/* Altındaki tüm eski kodları sildik, sadece bu kalacak: */}
              <TableOfContents />

            </div>
          </aside>


          {/* --- ORTA BLOK (İçerik) --- */}
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>


          {/* --- SAĞ BLOK (Reklam/Pro) --- */}
          <aside className="hidden xl:block w-64 shrink-0 sticky top-20">
            <div className="space-y-3">
              {/* Premium Kutusu */}
              <div className="bg-slate-900 rounded-lg p-3 text-white shadow-md">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-yellow-400 text-[10px] font-bold">PREMIUM</span>
                  <span className="text-sm">⚡️</span>
                </div>
                <h3 className="font-bold text-xs mb-0.5">Sınav Modu</h3>
                <p className="text-slate-400 text-[10px] mb-2 leading-tight">Bu konuda 4 çıkmış TUS sorusu var.</p>
                <button className="w-full py-1 bg-white text-slate-900 font-bold rounded text-[10px] hover:bg-slate-100 transition">Soruları Çöz</button>
              </div>

              {/* Dikey Reklam */}
              <div className="h-[500px] rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-300 gap-1 shadow-sm">
                <span className="text-xs font-semibold">Reklam</span>
                <span className="text-[10px]">(Skyscraper)</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
      
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-[10px] text-slate-400">
        © 2026 MediSea
      </footer>

    </div>
  );
}
