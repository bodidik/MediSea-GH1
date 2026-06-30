'use client';

import Link from 'next/link';
import { 
  ShieldCheck, Zap, AlertTriangle, Dna, Microscope, 
  Stethoscope, Flame, ChevronRight, Info, Activity 
} from 'lucide-react';

// --- ZIRHLI İMPORTLAR ---
import PremiumVideoRecommendations from '@/app/components/PremiumVideoRecommendations';
import amlVideoData from '@/content/premium/ydus/videos/hematoloji/aml-videos.json';
import amlCanonicalData from '@/content/canonical/hematoloji/aml.json';

export default function AmlDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-100 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* ÜST NAVİGASYON */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2 border-b border-slate-800/50">
          <Link href="/tr/premium/ydus" className="hover:text-blue-400 transition-colors">⚓ ANA KARARGAH</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/hematoloji" className="hover:text-rose-400 transition-colors">HEMATOLOJİ</Link>
          <span>/</span>
          <span className="text-slate-300 italic">AML GÜNCEL REHBER</span>
        </nav>

        {/* HERO: AML ÖZEL BAŞLIK */}
        <div className="bg-slate-900 rounded-3xl p-8 mb-8 border border-blue-900/30 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-[0.2em]">YDUS Premium</span>
              <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-[0.2em]">WHO5 & ICC 2022 ENTEGRE</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter italic uppercase">
              Akut Myeloid Lösemi (AML)
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl leading-relaxed italic">
              Morfolojinin yerini moleküler imzaların aldığı, blast eşiklerinin genetiğe göre esnediği yeni dönem hematoloji rehberi.
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* 1. KISIM: KRİTİK EŞİKLER VE SINAV TUZAKLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Blast Eşiği Kartı */}
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-800/50 transition-all">
            <h3 className="text-blue-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
              <ShieldCheck size={18} /> Blast Eşiği & Genetik
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              <strong className="text-white font-black italic">PML::RARA, t(8;21), inv(16)</strong> veya <strong className="text-white font-black italic">NPM1</strong> saptandığında:
            </p>
            <div className="space-y-2">
               <div className="flex justify-between text-[11px] font-bold bg-slate-950 p-2 rounded-lg border border-slate-800">
                 <span className="text-slate-500">WHO5:</span> 
                 <span className="text-emerald-400 italic">Blast Oranına Bakılmaz</span>
               </div>
               <div className="flex justify-between text-[11px] font-bold bg-slate-950 p-2 rounded-lg border border-slate-800">
                 <span className="text-slate-500">ICC 2022:</span> 
                 <span className="text-blue-400 italic">≥%10 Blast Yeterlidir</span>
               </div>
            </div>
          </div>

          {/* BCR::ABL1 Kesin Kural */}
          <div className="bg-red-900/10 border border-red-500/30 rounded-3xl p-6 relative flex flex-col justify-center">
            <h3 className="text-red-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> ALTIN VURUŞ (Sınav Tuzağı)
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white italic underline underline-offset-4">t(9;22) / BCR::ABL1</strong> pozitifliğinde, KML blastik krizinden ayırım için <span className="text-red-400 font-black text-lg underline decoration-2">≥%20 BLAST ŞARTI</span> her iki kılavuzda da KESİN OLARAK korunmaktadır.
            </p>
          </div>
        </div>

        {/* 2. KISIM: VAKA ŞİFRELERİ VE İPUÇLARI (TABLO) */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest italic">
            <Stethoscope className="text-blue-500" /> Vaka Sorularının Şifreleri
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-black text-blue-400 uppercase tracking-widest text-[10px]">Klinik/Morfolojik Bulgu</th>
                    <th className="px-6 py-4 font-black text-blue-400 uppercase tracking-widest text-[10px]">Genetik Şifre</th>
                    <th className="px-6 py-4 font-black text-blue-400 uppercase tracking-widest text-[10px]">Prognostik Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">Anemi + Trombositoz + Küçük Megakaryositler</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono italic">inv(3) veya t(3;3)</td>
                    <td className="px-6 py-4 text-slate-500 text-[11px] font-bold">Adverse (Çok Kötü) Risk</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">CD34 (-) ve HLA-DR (-) İmmünofenotip</td>
                    <td className="px-6 py-4 text-rose-400 font-black italic">APL (t(15;17))</td>
                    <td className="px-6 py-4 text-slate-500 text-[11px] font-bold">DIC Riski / Acil ATRA</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">Bazofili + Düşük Lökosit Sayısı</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono italic">t(6;9) / DEK::NUP214</td>
                    <td className="px-6 py-4 text-slate-500 text-[11px] font-bold">FLT3-ITD eşlik edebilir</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">Aberran CD19 Ekspresyonu</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono italic">t(8;21)</td>
                    <td className="px-6 py-4 text-slate-500 text-[11px] font-bold">Favorable (İyi) Risk</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. KISIM: KANONİK TEORİK İÇERİK (JSON'dan Gelen) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 mb-12 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
             <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3 italic">
                <Microscope className="text-blue-500" /> Teorik Veri Üssü
             </h2>
             <span className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-lg text-slate-500 font-bold border border-slate-700">
               ARŞİV GÜNCELLEME: {amlCanonicalData.meta.updatedAt}
             </span>
          </div>

          <div className="space-y-12">
            {amlCanonicalData.sections.map((sec: any, idx: number) => (
              <div key={idx} className="group">
                <h3 className="text-lg font-black text-blue-200 mb-4 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> {sec.heading}
                </h3>
                <div 
                  className="text-slate-300 leading-relaxed text-[15px] prose-strong:text-white prose-strong:font-black prose-ul:list-disc prose-ul:pl-5 space-y-4"
                  dangerouslySetInnerHTML={{ __html: sec.text }} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. KISIM: PRATİK MODÜLLER (FLASHCARD / İNCİLER / QUIZ) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Flashcard Kartı */}
          <Link href="/tr/premium/ydus/hizli-tekrar?branch=hematoloji&id=aml" className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Hızlı Tekrar</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1">Genetik mutasyonları hafızana kazı.</p>
            <div className="flex items-center justify-between text-blue-500 font-black text-[10px] uppercase tracking-widest">
              Görevi Başlat <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* İnciler Kartı */}
          <Link href="/tr/premium/ydus/inciler?branch=hematoloji&id=aml" className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-yellow-500/50 transition-all flex flex-col">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">💎</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Klinik İnciler</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1">Nokta atışı vaka şifreleri.</p>
            <div className="flex items-center justify-between text-yellow-500 font-black text-[10px] uppercase tracking-widest">
              İstihbaratı Oku <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Sınav Kartı */}
          <Link href="/tr/premium/ydus/quiz-coz?branch=hematoloji&id=aml-quiz-1" className="group bg-slate-950 rounded-3xl p-8 border border-red-500/20 hover:border-red-500/50 transition-all relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest italic shadow-lg">Board Tipi</div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📝</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Mega Deneme</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1">Vaka temelli zorlayıcı analizler.</p>
            <div className="flex items-center justify-between text-red-500 font-black text-[10px] uppercase tracking-widest">
              Sınava Gir <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 5. KISIM: VİDEO RADAR */}
        <div className="bg-slate-900/20 backdrop-blur-xl p-8 rounded-[3rem] border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Flame size={120} className="text-orange-500" />
          </div>
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Activity className="text-orange-500" /> Nokta Atışı Video Brifingleri
          </h2>
          <PremiumVideoRecommendations data={amlVideoData} />
        </div>

      </div>
    </div>
  );
}