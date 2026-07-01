'use client';

import Link from 'next/link';
import { 
  ShieldCheck, Zap, AlertTriangle, Dna, Microscope, 
  Stethoscope, Flame, ChevronRight, Activity, Target, CheckCircle2, Baby, Syringe
} from 'lucide-react';

// --- ZIRHLI İMPORTLAR ---
// NOT: Aşağıdaki yolları kendi klasör yapına göre (romatoloji vs.) ayarlayabilirsin.
import PremiumVideoRecommendations from '@/components/PremiumVideoRecommendations';
import fmfVideoData from '@/content/premium/ydus/videos/romatoloji/fmf-videos.json';
import fmfCanonicalData from '@/content/canonical/romatoloji/fmf.json';

export default function FmfDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-100 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* 1. ÜST NAVİGASYON */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2 border-b border-slate-800/50">
          <Link href="/tr/premium/ydus" className="hover:text-blue-400 transition-colors">⚓ ANA KARARGAH</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/romatoloji" className="hover:text-rose-400 transition-colors">ROMATOLOJİ</Link>
          <span>/</span>
          <span className="text-slate-300 italic uppercase">FMF Premium Özet</span>
        </nav>

        {/* 2. PREMIUM HERO BÖLÜMÜ */}
        <div className="bg-slate-900 rounded-3xl p-8 mb-8 border border-blue-900/30 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-[0.2em]">YDUS İstihbarat</span>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-[0.2em]">Otoenflamatuar Monogenik</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter italic uppercase">
              Ailesel Akdeniz Ateşi (FMF)
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl leading-relaxed italic">
              16p13.3 MEFV geni fonksiyon kazanımı (Gain-of-Function), Pirin inflamozomu (IL-1β) hiperaktivasyonu, Kolşisin direnci ve ölümcül AA Amiloidoz yönetimi.
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* 3. KRİTİK EŞİKLER PANELİ (Sınıflandırma ve Amiloidoz Riski) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Tanı Kriterleri Çatışması */}
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 relative group overflow-hidden shadow-lg">
            <h3 className="text-blue-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" fill="currentColor" /> Güncel Tanı Kriterleri
            </h3>
            <p className="text-slate-300 text-[13px] leading-relaxed mb-4 italic font-medium">
              Erişkinlerde Tel-Hashomer, çocuklarda Yalçınkaya-Özen kullanılırken; güncel kılavuzlarda Genetik + Klinik entegrasyonu şarttır:
            </p>
            <div className="space-y-2">
               <div className="flex items-center justify-between text-[11px] font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                 <span className="text-slate-500">Eurofever/PRINTO:</span> 
                 <span className="text-rose-400 underline italic uppercase tracking-tighter">Doğrulayıcı Genotip + En az 1 Klinik Bulgu</span>
               </div>
               <div className="flex items-center justify-between text-[11px] font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                 <span className="text-slate-500">Tanısal Ex Vivo Test:</span> 
                 <span className="text-blue-400 italic font-black uppercase tracking-tighter">C. difficile Toksin A ile IL-1β İnhibisyonu</span>
               </div>
               <div className="mt-2 text-[10px] text-slate-500 italic text-right">
                 *Ex vivo kolşisin testi %100 özgüllük ile çığır açıcıdır.
               </div>
            </div>
          </div>

          {/* Kolşisin Direnci ve Amiloidoz Riski */}
          <div className="bg-rose-900/10 border border-rose-500/30 rounded-3xl p-6 relative flex flex-col justify-center shadow-lg group">
            <h3 className="text-rose-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
              <Target size={18} className="group-hover:scale-110 transition-transform" /> Amiloidoz & Direnç Modifikatörleri
            </h3>
            <p className="text-slate-300 text-[13px] leading-relaxed mb-4">
              Ataklar arası <strong>subklinik inflamasyon (Yüksek SAA ve CRP)</strong> AA Amiloidozu için en sinsi risk faktörüdür.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/20 flex flex-wrap gap-2">
               <span className="bg-slate-900 text-rose-400 font-bold text-[10px] px-2 py-1 rounded border border-slate-800">M694V Homozigotluğu</span>
               <span className="bg-slate-900 text-rose-400 font-bold text-[10px] px-2 py-1 rounded border border-slate-800">Erkek Cinsiyet</span>
               <span className="bg-slate-900 text-rose-400 font-bold text-[10px] px-2 py-1 rounded border border-slate-800">SAA1 alfa/alfa Genotipi</span>
               <span className="bg-slate-900 text-rose-400 font-bold text-[10px] px-2 py-1 rounded border border-slate-800">Fenotip 2 FMF</span>
            </div>
          </div>
        </div>

        {/* 4. KLİNİK ŞİFRELER TABLOSU (MEFV Mutasyonları ve YDUS İncileri) */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest italic">
            <Microscope className="text-blue-500" /> Genotip ve Fenotip Şifreleri
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 border-b border-slate-800 font-black">
                  <tr className="text-blue-400 text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4">Varyant / Tablo</th>
                    <th className="px-6 py-4">Klinik Karşılık</th>
                    <th className="px-6 py-4">YDUS İncisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium italic">
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">M694V (Ekson 10)</td>
                    <td className="px-6 py-4 text-rose-400 font-bold">En Ağır Fenotip</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">Erken başlangıç, Erizipel Benzeri Eritem (ELE), yüksek amiloidoz ve kolşisin direnci.</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">E148Q (Ekson 2)</td>
                    <td className="px-6 py-4 text-emerald-400">Düşük Penetrans</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">Benign polimorfizm kabul edilir. Ancak "in cis" kompleks allelde M694V'yi agreve eder.</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">Fenotip 2 FMF</td>
                    <td className="px-6 py-4 text-yellow-400 font-bold">Sessiz Amiloidoz</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">Hiç atak öyküsü olmadan ilk bulgu olarak AA Amiloidoz (proteinüri/Nefrotik Sendrom) ile geliş.</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">Yersinia Pestis</td>
                    <td className="px-6 py-4 text-slate-300">Evrimsel Avantaj</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">Akdeniz'de MEFV taşıyıcılığının artması, vebaya karşı hücresel direnç sağlamasıyla açıklanır.</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors bg-blue-950/10">
                    <td className="px-6 py-4 text-blue-300 uppercase font-black tracking-tighter">Dominant Kalıtım</td>
                    <td className="px-6 py-4 text-blue-300 font-bold">M692del / H478Y</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">FMF resesif olsa da, bu delesyon ve missense mutasyonlar gerçek otozomal dominant geçer.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. TEDAVİ VE FARMAKOLOJİ MATRİSİ (Hap Bilgiler) */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-[2rem] p-8 mb-12 shadow-inner relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-5">
             <Syringe size={200} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-emerald-400 mb-6 uppercase tracking-widest flex items-center gap-2 italic relative z-10">
            <ShieldCheck size={20} /> Hedefe Yönelik Tedavi ve Farmakoloji
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium leading-relaxed relative z-10">
            
            {/* Kolşisin */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-white uppercase tracking-wider block mb-2 text-sm">Kolşisin (1. Basamak)</strong>
                 <p className="text-slate-400 italic mb-2">Mikrotübül polimerizasyonunu bozar ➔ GEF-H1 artar ➔ RhoA aktifleşir ➔ PKN1/2 Pirin'i fosforile eder ➔ 14-3-3 inhibisyonu sağlar.</p>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 text-rose-400 font-bold text-[10px] uppercase">Kontrendike Kombinasyon: Makrolidler (CYP3A4/P-gp)</div>
            </div>

            {/* IL-1 İnhibitörleri */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-white uppercase tracking-wider block mb-2 text-sm">Anakinra & Canakinumab</strong>
                 <p className="text-slate-400 italic mb-2">Kolşisin dirençli/intoleran vakalarda kullanılır. Anakinra kısa etkili (günlük SC, "on-demand" verilebilir), Canakinumab uzun etkilidir (4-8 hft).</p>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 text-blue-400 font-bold text-[10px] uppercase">Taktik: Amiloidoz koruması için Kolşisin ile KOMBİNE edilir.</div>
            </div>

            {/* Tocilizumab */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-yellow-500/50 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-white uppercase tracking-wider block mb-2 text-sm">Tocilizumab (Anti-IL-6)</strong>
                 <p className="text-slate-400 italic mb-2">IL-6, karaciğerden SAA üretiminin ana uyarıcısıdır. Kolşisin/IL-1 blokerlerine dirençli, renal AA Amiloidozu gelişmiş hastalarda kullanılır.</p>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 text-yellow-400 font-bold text-[10px] uppercase">Hedef: Proteinüriyi stabilize etmek.</div>
            </div>

          </div>
        </div>

        {/* 6. YDUS ÖZEL: Komorbidite ve Atipik Tutulumlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Özel Ağrı Sendromları */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
            <h3 className="text-white font-black text-sm uppercase mb-4 flex items-center gap-2 italic">
              <Flame size={18} className="text-orange-500" /> Kolşisine Dirençli Ağrı Sendromları
            </h3>
            <ul className="space-y-4 text-[13px] text-slate-300 font-medium italic">
              <li>
                <strong className="text-orange-400 block mb-1">Uzamış Febril Miyalji (PFM):</strong> 
                8 haftaya kadar sürebilen, yüksek ESR ancak <span className="underline">Normal CK/EMG</span> ile seyreden ağır tablodur. Kolşisine dirençlidir. Tedavide <strong>Yüksek doz Steroid</strong> (1mg/kg) veya Anakinra kullanılır.
              </li>
              <li className="pt-2 border-t border-slate-800">
                <strong className="text-orange-400 block mb-1">Egzersizle İndüklenen Bacak Ağrısı:</strong> 
                Ataklardan bağımsız, baldırda gelişen non-epizodik ağrıdır. Kolşisin etkisizdir. <strong>İstirahat ve NSAİİ</strong> ile tedavi edilir.
              </li>
            </ul>
          </div>

          {/* Gebelik, PAN ve MS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
            <h3 className="text-white font-black text-sm uppercase mb-4 flex items-center gap-2 italic">
              <Baby size={18} className="text-blue-400" /> Gebelik & Spesifik Komplikasyonlar
            </h3>
            <ul className="space-y-3 text-[13px] text-slate-300 font-medium italic">
              <li className="flex gap-2"><span className="text-blue-500">❖</span> <strong className="text-white">Gebelik:</strong> Kolşisin KESİNLİKLE GÜVENLİDİR. Atakları ve amiloidozu önlemek için tedaviye <span className="underline">asla ara verilmez.</span></li>
              <li className="flex gap-2"><span className="text-blue-500">❖</span> <strong className="text-white">FMF İlişkili PAN:</strong> İdiyopatik Poliarteritis Nodoza'dan farklı olarak daha erken yaşta başlar ve <strong>Perirenal hematom</strong> ile glomerüler tutulum riski yüksektir.</li>
              <li className="flex gap-2"><span className="text-blue-500">❖</span> <strong className="text-white">Nörolojik Tutulum:</strong> Multipl Skleroz (MS) demyelinizan hastalık riski artmıştır.</li>
              <li className="flex gap-2"><span className="text-blue-500">❖</span> <strong className="text-white">Akut Skrotum Yanılgısı:</strong> Tunika vajinalis inflamasyonu testis torsiyonunu taklit eder ancak cerrahi gerektirmeyen steril serozittir.</li>
            </ul>
          </div>

        </div>

        {/* 7. ANA KANONİK İÇERİK (JSON'dan Gelen Ekstra Detaylar İçin) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 mb-12 shadow-2xl relative">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4 font-black uppercase">
             <h2 className="text-lg font-black text-slate-400 tracking-widest flex items-center gap-3 italic">
                Ayrıntılı Teori Ana Üssü (Kanonik)
             </h2>
          </div>
          <div className="space-y-8 font-medium">
            {/* Eğer JSON bağlanırsa burası dolacak. Şablon bozulmasın diye opsiyonel bırakıldı. */}
            {fmfCanonicalData?.sections?.map((sec: any, idx: number) => (
              <div key={idx} className="group">
                <h3 className="text-base font-bold text-slate-300 mb-2 flex items-center gap-2 group-hover:translate-x-1 transition-transform italic">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full" /> {sec.heading}
                </h3>
                <div 
                  className="text-slate-400 leading-relaxed text-[14px] prose-strong:text-slate-200 prose-ul:list-disc prose-ul:pl-5 space-y-2"
                  dangerouslySetInnerHTML={{ __html: sec.html || sec.text }} 
                />
              </div>
            ))}
            {(!fmfCanonicalData || !fmfCanonicalData.sections) && (
              <div className="text-slate-500 text-sm italic text-center py-4">
                Kanonik JSON verisi bu alana entegre edilecektir.
              </div>
            )}
          </div>
        </div>

        {/* 8. TAKTİKSEL PANEL (Standardize Linkler) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link href="/tr/premium/ydus/hizli-tekrar?branch=romatoloji&id=fmf" className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col shadow-lg">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Hızlı Tekrar</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1 italic">Pirin inflamozom yolağı, Kaspaz-1, Piroptozis (Gasdermin D) ve S100A12 biyobelirteci.</p>
            <div className="flex items-center justify-between text-emerald-500 font-black text-[10px] uppercase tracking-widest">Görevi Başlat <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
          </Link>

          <Link href="/tr/premium/ydus/inciler?branch=romatoloji&id=fmf" className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-yellow-500/50 transition-all flex flex-col shadow-lg">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">💎</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">FMF İncileri</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1 italic">HLA-B27 bağımsız sakroiliit, E148Q sinerjistik etkisi ve Akut batında ileus dominansı.</p>
            <div className="flex items-center justify-between text-yellow-500 font-black text-[10px] uppercase tracking-widest">İstihbaratı Oku <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
          </Link>

          <div className="group bg-slate-950 rounded-3xl p-8 border border-red-500/20 relative overflow-hidden flex flex-col shadow-2xl opacity-60 grayscale cursor-not-allowed">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest italic shadow-lg">Board Tipi</div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-2xl mb-6">📝</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Mega Deneme</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1 italic font-bold tracking-tight">Makrolid toksisitesi ve amiloidoz progresyonlu vaka temelli sorular yakında.</p>
          </div>
        </div>

        {/* 9. VİDEO RADAR */}
        <div className="bg-slate-900/20 backdrop-blur-xl p-8 rounded-[3rem] border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Activity className="text-emerald-500" /> FMF Video Brifingleri
          </h2>
          {/* FMF video listesi JSON üzerinden okunacak */}
          <PremiumVideoRecommendations data={fmfVideoData as any} />
        </div>

      </div>
    </div>
  );
}