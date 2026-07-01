'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, Scissors, Pill, Radiation, 
  Baby, RotateCcw, Zap, AlertTriangle, 
  Target, Info, ShieldCheck, Activity,
  ShieldAlert
} from 'lucide-react';

export default function AkromegaliTedaviPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';

  return (
    <div className="min-h-screen bg-[#fdfcfb] py-8 px-4 sm:px-6 font-sans text-slate-800">
      
      {/* 1. ÜST NAVİGASYON */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href={`/${lang}/premium/ydus/endokrinoloji/hipofiz/akromegali`}
          className="flex items-center gap-2 text-amber-700 font-black text-xs hover:text-amber-900 transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform border border-amber-100">
            <ChevronLeft size={16} />
          </div>
          AKROMEGALİ 2026 ANA ÜNİTEYE DÖN
        </Link>
        <div className="hidden sm:flex gap-2">
          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-md border border-amber-200 uppercase tracking-tighter">Tedavi Protokolleri</span>
          <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-tighter italic">YDUS Masterclass</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL KOLON: YÖNLENDİRME & KISA YOLLAR (SIDEBAR) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm sticky top-8">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">Tedavi Adımları</h3>
            <nav className="space-y-1">
              {[
                { label: "Cerrahi (E-TSA)", icon: <Scissors size={14} />, id: "cerrahi" },
                { label: "Medikal (SRL/Peg)", icon: <Pill size={14} />, id: "medikal" },
                { label: "Radyoterapi (SRS)", icon: <Radiation size={14} />, id: "radyo" },
                { label: "Nüks Yönetimi", icon: <RotateCcw size={14} />, id: "nuks" },
                { label: "Gebelik Süreci", icon: <Baby size={14} />, id: "gebelik" },
              ].map((item) => (
                <button 
                  key={item.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-all border border-transparent hover:border-amber-100 text-left"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-slate-900 rounded-xl text-white">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <Target size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Hedef</span>
              </div>
              <p className="text-[10px] font-medium leading-relaxed opacity-80 italic">
                GH ve IGF-1 normalizasyonu, kitle küçültülmesi ve komorbidite riskinin popülasyon düzeyine çekilmesi.
              </p>
            </div>
          </div>
        </aside>

        {/* ORTA KOLON: ANA İÇERİK */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* 1. CERRAHİ BÖLÜM */}
          <section id="cerrahi" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-inner">
                <Scissors size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">1. Cerrahi Tedavi</h2>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest italic">Altın Standart: E-TSA</span>
              </div>
            </div>

            <div className="space-y-4 text-sm font-medium leading-relaxed text-slate-600">
              <p>
                Akromegalide ilk basamak <strong className="text-slate-900">Endoskopik Endonazal Transsfenoidal Yaklaşımdır (E-TSA)</strong>. 
                Geniş görüş açısı ve psödokapsül rezeksiyonu avantajı sağlar.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-black text-slate-800 mb-2 uppercase italic">Remisyon Başarısı</h4>
                  <ul className="text-[11px] space-y-1 font-bold opacity-80">
                    <li>• Mikroadenom: %75-100</li>
                    <li>• Makroadenom: %54-67</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-bold">
                  <h4 className="text-xs font-black text-slate-800 mb-2 uppercase italic">Prediktörler</h4>
                  <p className="text-[11px] opacity-80">
                    Düşük bazal GH, küçük çap ve <span className="text-amber-700 underline">Knosp Evresi (Kavernöz İnvazyon Yokluğu)</span> anahtar faktörlerdir.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. MEDİKAL BÖLÜM */}
          <section id="medikal" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Pill size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic">2. Medikal Farmakoterapi</h2>
            </div>

            <div className="space-y-6">
              {/* SRL'ler */}
              <div className="border-l-4 border-indigo-200 pl-4 space-y-4">
                <h3 className="font-black text-indigo-700 text-sm uppercase">Somatostatin Reseptör Ligandları (SRL)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="text-[11px] font-black mb-1 italic">1. Kuşak (Oktreotid/Lanreotid)</h4>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">SST2 afinitesi yüksektir. Dens granüle tümörlerde yanıt mükemmeldir.</p>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <h4 className="text-[11px] font-black text-rose-700 mb-1 italic">2. Kuşak (Pasireotid)</h4>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">SST5 afinitesi hakimdir. Seyrek granüle ve SST2 dirençli vakalarda seçilir.</p>
                  </div>
                </div>
                {/* Pasireotid-DM Notu */}
                <div className="bg-rose-100/50 p-4 rounded-xl border-l-4 border-rose-500 text-rose-900 text-[11px] font-bold">
                  <ShieldAlert size={16} className="mb-2" />
                  PASİREOTİD-DM: Bağırsak K/L hücrelerindeki SST5 baskılanmasıyla GLP-1/GIP salgısını durdurur. Diyabet riski çok yüksektir!
                </div>
              </div>

              {/* Mycapssa & Oral Teknolojisi */}
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 mb-2 text-amber-700">
                  <Zap size={18} />
                  <h4 className="text-sm font-black uppercase">Oral Oktreotid (Mycapssa®)</h4>
                </div>
                <p className="text-xs font-bold text-amber-950 leading-relaxed italic">
                   TPE (Transient Permeability Enhancer) teknolojisiyle parasellüler sıkı kavşakları geçici olarak açar. 
                   Sadece enjektabl ile kontrol edilen hastaların idamesinde (aç karnına) kullanılır.
                </p>
              </div>

              {/* Pegvisomant */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/3">
                    <h4 className="font-black text-amber-400 mb-2 uppercase italic tracking-widest">Pegvisomant (GHR-Antagonist)</h4>
                    <p className="text-xs opacity-80 leading-relaxed font-medium">
                      Periferik etkilidir, karaciğerde GH reseptörünü bloke eder. IGF-1 normalizasyonu {'>'} %90. 
                      <span className="block mt-1 text-amber-200">NOT: Takipte GH düzeyi anlamsızdır, sadece IGF-1 bakılır.</span>
                    </p>
                  </div>
                  <div className="md:w-1/3 bg-white/10 p-4 rounded-xl border border-white/20 text-[10px] font-bold italic">
                    d3-GHR polimorfizmi taşıyanlarda Pegvisomant ve Pasireotid yanıtı farklılık gösterebilir.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. RADYOTERAPİ & NÜKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section id="radyo" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 text-sm mb-4 uppercase italic flex items-center gap-2">
                <Radiation size={18} className="text-rose-500" /> Radyoterapi (SRS)
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Gamma Knife (SRS) daha hızlı hormonal düşüş sağlar. Kiazmaya mesafe {'>'} 3mm olmalıdır. 
                <span className="block mt-2 font-bold text-rose-700 underline">Hipopitüitarizm (%19) en önemli uzun dönem risktir.</span>
              </p>
            </section>
            
            <section id="nuks" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 text-sm mb-4 uppercase italic flex items-center gap-2">
                <RotateCcw size={18} className="text-indigo-500" /> Nüks Yönetimi
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                Nüks veya rezidüde <strong className="text-slate-900 italic">Medikal Tedavi ve Radyoterapi</strong>, re-operasyondan daha yüksek remisyon oranlarına sahiptir.
                Skar dokusu cerrahi riskini ciddi artırır.
              </p>
            </section>
          </div>

          {/* 4. GEBELİK BÖLÜMÜ */}
          <section id="gebelik" className="bg-pink-50 rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-pink-500 border border-pink-200">
                <Baby size={20} />
              </div>
              <h2 className="text-lg font-black text-pink-800 uppercase italic">Gebelikte Akromegali</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3 text-xs font-bold text-pink-900/80 leading-relaxed italic">
                <p>• Östrojen etkisiyle karaciğerde GH direnci oluşur, IGF-1 düşebilir.</p>
                <p>• Konsepsiyonla medikal tedavi (SRL, Peg, DA) kesilir.</p>
                <p>• Tümör büyümesi varsa Oktreotid tekrar başlanması güvenlidir.</p>
              </div>
              <div className="bg-white/60 p-4 rounded-2xl border border-pink-200 text-[10px] text-pink-900 font-bold leading-relaxed">
                <AlertTriangle size={16} className="mb-2" />
                Dirençli ve kiazmaya bası yapan makroadenomlarda 2. trimesterde cerrahi gerekebilir.
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
          MedKnowledge Premium Content &bull; Endokrinoloji Serisi 2026
        </p>
      </footer>
    </div>
  );
}