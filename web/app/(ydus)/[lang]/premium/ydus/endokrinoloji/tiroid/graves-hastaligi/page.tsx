'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, Eye, Activity, ShieldAlert, 
  Zap, Pill, Thermometer, Microscope, 
  Stethoscope, BarChart3, Info, Scale
} from 'lucide-react';

export default function GravesDiseasePage() {
  const params = useParams();
  const lang = params?.lang || 'tr';

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 font-sans text-slate-800">
      
      {/* 1. ÜST NAVİGASYON */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link 
          href={`/${lang}/premium/ydus/endokrinoloji/tiroid`}
          className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft size={18} />
          </div>
          Tiroid Hastalıkları İndeksine Dön
        </Link>
      </div>

      <main className="max-w-5xl mx-auto">
        
        {/* 2. HEADER KARTI */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-8 border border-indigo-100 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-widest">Otoimmün Hipertiroidi</span>
              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full border border-rose-200 uppercase tracking-widest italic">YDUS Premium</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4 tracking-tight uppercase italic flex items-center gap-4">
               <Activity size={48} className="text-indigo-600" /> Graves Hastalığı & Orbitopati
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-3xl">
              TSH reseptör antikorları (TRAb) aracılı multisistemik otoimmün süreç; tirotoksikoz, orbitopati ve dermopati üçlemesi.
            </p>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>

        {/* 3. İÇERİK AKIŞI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL KOLON - PATOGENEZ VE TANI */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Patogenez Bölümü */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Microscope size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase italic">1. İmmünopatogenez & Genetik</h2>
              </div>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                <p>
                  Genetik yatkınlık (%70) ve çevresel tetikleyicilerin etkileşimi esastır. 
                  <span className="text-indigo-600 font-bold italic ml-1">HCP5 geni (rs3094228)</span> varyantı, pediatrik ve erken başlangıçlı Graves için anahtar bir genetik belirteçtir.
                </p>
                <div className="bg-slate-50 p-5 rounded-2xl border-l-4 border-indigo-500 italic">
                  &quot;Temel mekanizma: TSAb/TSI antikorlarının Gs-alfa üzerinden adenilat siklaz yolunu sürekli aktif tutmasıdır.&quot;
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <li className="bg-indigo-50/50 p-3 rounded-xl text-xs border border-indigo-100">
                    <strong>HLA İlişkisi:</strong> DRB1*03, DQA1*05 ve DQB1*02 alelleri.
                  </li>
                  <li className="bg-indigo-50/50 p-3 rounded-xl text-xs border border-indigo-100">
                    <strong>Ekstra İmmünite:</strong> CTLA4, PTPN22 ve CD40 genetik polimorfizmleri.
                  </li>
                </ul>
              </div>
            </section>

            {/* Tanısal Dinamikler */}
            <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 text-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
                  <BarChart3 size={20} />
                </div>
                <h2 className="text-xl font-black text-white uppercase italic">2. Tanısal Dinamikler</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                  <h3 className="text-teal-400 font-bold text-xs uppercase mb-3 tracking-widest">Laboratuvar İpuçları</h3>
                  <ul className="space-y-3 text-sm font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500">•</span>
                      <span><strong>T3/T4 Oranı:</strong> {'>'} 20 ng/mcg (Graves lehinedir).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500">•</span>
                      <span><strong>3. Nesil TRAb:</strong> Duyarlılık %97, Özgüllük %99.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                  <h3 className="text-indigo-400 font-bold text-xs uppercase mb-3 tracking-widest">Görüntüleme</h3>
                  <ul className="space-y-3 text-sm font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500">•</span>
                      <span><strong>Doppler:</strong> &quot;Tiroid İnfernosu&quot; (Artmış vaskülarite).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500">•</span>
                      <span><strong>Sintigrafi:</strong> Diffüz artmış RAIU tutulumu.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Orbitopati Bölümü */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                  <Eye size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase italic">3. Graves Orbitopatisi (GO)</h2>
              </div>
              
              

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="font-black text-xs text-rose-600 mb-2 uppercase italic tracking-tighter">Sinyalozom & Crosstalk</h4>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      TSHR ve IGF-1R, orbital fibroblastlarda &quot;beta-arrestin 1&quot; iskelesinde çapraz konuşma yapar. Bu, hyaluronan sentezi ve adipogenezi sinerjik artırır.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="font-black text-xs text-indigo-600 mb-2 uppercase italic tracking-tighter">Fibroblast Alt Tipleri</h4>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      <strong>Thy1-:</strong> Adipositlere farklılaşır.<br />
                      <strong>Thy1+:</strong> Miyofibroblastlara (Fibrozis) dönüşür.
                    </p>
                  </div>
                </div>

                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                  <h4 className="text-sm font-black text-rose-700 mb-3 flex items-center gap-2 italic uppercase">
                    <Zap size={16} /> GO Tedavi Yaklaşımı (EUGOGO)
                  </h4>
                  <ul className="space-y-3 text-sm font-medium text-rose-900">
                    <li>• <strong>Hafif:</strong> Selenyum desteği (6 ay) + Lokal önlemler.</li>
                    <li>• <strong>Orta-Ağır:</strong> IV Metilprednizolon (Pulse) 4.5g - 8g kümülatif doz.</li>
                    <li>• <strong>Yeni Nesil:</strong> Teprotumumab (IGF-1R Antagonisti), Tocilizumab (IL-6 Blokajı).</li>
                    <li>• <strong>Acil (DON):</strong> Optik sinir basısında yüksek doz IVMP, yanıt yoksa orbital dekompresyon.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* SAĞ KOLON - YÖNETİM VE ÖZEL DURUMLAR */}
          <div className="space-y-6">
            
            {/* Tedavi Seçenekleri */}
            <section className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center border border-indigo-400">
                  <Pill size={20} />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Tedavi Yönetimi</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-indigo-700/50 p-4 rounded-2xl border border-indigo-500/50">
                  <h4 className="text-xs font-black mb-1 text-indigo-200 uppercase tracking-widest">Antitiroid (ATD)</h4>
                  <p className="text-sm font-medium">MMI ilk tercihtir. PTU; gebeliğin 1. trimesterinde ve tiroid fırtınasında seçilir.</p>
                </div>
                <div className="bg-indigo-700/50 p-4 rounded-2xl border border-indigo-500/50 font-medium">
                  <h4 className="text-xs font-black mb-1 text-indigo-200 uppercase tracking-widest italic">GREAT Skoru</h4>
                  <p className="text-xs opacity-90 italic text-white/80 leading-relaxed">
                    Yaş, guatr boyutu, sT4 ve TRAb seviyesi ile nüks riskini öngörür.
                  </p>
                </div>
                <div className="bg-amber-400 p-4 rounded-2xl text-amber-950">
                  <h4 className="text-xs font-black mb-1 uppercase italic">RAI Uyarısı!</h4>
                  <p className="text-xs font-bold leading-tight">
                    Orbitopatiyi alevlendirebilir. Riskli olgularda Steroid Profilaksisi şarttır.
                  </p>
                </div>
              </div>
            </section>

            {/* Kemik Metabolizması */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-800 text-sm mb-4 uppercase italic flex items-center gap-2">
                <Scale size={18} className="text-slate-400" /> Kemik & Metabolizma
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                Postmenopozal kadınlarda eutiroidi sağlansa bile yüksek TRAb seviyeleri kemik mineral yoğunluğunda (KMY) azalmanın devam etmesi ile ilişkilidir.
              </p>
            </section>

            {/* Tiroid Fırtınası Kartı */}
            <section className="bg-rose-600 rounded-3xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Thermometer size={24} className="animate-pulse" />
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Tiroid Fırtınası</h2>
              </div>
              <ul className="space-y-3 text-xs font-bold opacity-90">
                <li className="flex gap-2"><span>1.</span> <span>Beta-bloker (Propranolol/Esmolol)</span></li>
                <li className="flex gap-2"><span>2.</span> <span>PTU veya MMI (Sentez blokajı)</span></li>
                <li className="flex gap-2"><span>3.</span> <span>İyot preparatları (Salınım blokajı)</span></li>
                <li className="flex gap-2"><span>4.</span> <span>Glukokortikoid (Dönüşüm blokajı)</span></li>
              </ul>
            </section>

            {/* Nadir Bulgular */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-800 text-sm mb-4 uppercase italic flex items-center gap-2">
                <Info size={18} className="text-slate-400" /> Nadir Klinik Notlar
              </h3>
              <ul className="space-y-3 text-[11px] font-bold text-slate-500 leading-tight">
                <li className="p-2 bg-slate-50 rounded-lg border-l-2 border-indigo-400">
                  <strong className="text-slate-700">Basedow Paraplejisi:</strong> Akut bacak güçsüzlüğü/arefleksi.
                </li>
                <li className="p-2 bg-slate-50 rounded-lg border-l-2 border-indigo-400">
                  <strong className="text-slate-700">Kore:</strong> Striatumda dopamin döngüsü değişimi.
                </li>
                <li className="p-2 bg-slate-50 rounded-lg border-l-2 border-indigo-400">
                  <strong className="text-slate-700">MG Birlikteliği:</strong> %2-17; oküler MG ayırıcı tanısında pitoz kritiktir.
                </li>
              </ul>
            </section>

          </div>
        </div>

        {/* 4. FOOTER NOTE */}
        <div className="mt-8 bg-slate-100 rounded-2xl p-6 border border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">
            Hazırlayan: Gemini AI &bull; YDUS Yan Dal Endokrinoloji Serisi 2026
          </p>
        </div>

      </main>
    </div>
  );
}