'use client';

import Link from 'next/link';
import { 
  ShieldCheck, Zap, AlertTriangle, Dna, Microscope, 
  Stethoscope, Flame, ChevronRight, Activity, Target, CheckCircle2, Baby
} from 'lucide-react';

// --- ZIRHLI İMPORTLAR ---
import PremiumVideoRecommendations from '@/components/PremiumVideoRecommendations';
import kmlVideoData from '@/content/premium/ydus/videos/hematoloji/kml-videos.json';
import kmlCanonicalData from '@/content/canonical/hematoloji/kml.json';

export default function KmlDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-100 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* 1. ÜST NAVİGASYON */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2 border-b border-slate-800/50">
          <Link href="/tr/premium/ydus" className="hover:text-blue-400 transition-colors">⚓ ANA KARARGAH</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/hematoloji" className="hover:text-rose-400 transition-colors">HEMATOLOJİ</Link>
          <span>/</span>
          <span className="text-slate-300 italic uppercase">KML Premium Özet</span>
        </nav>

        {/* 2. PREMIUM HERO BÖLÜMÜ */}
        <div className="bg-slate-900 rounded-3xl p-8 mb-8 border border-blue-900/30 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-[0.2em]">YDUS İstihbarat</span>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-[0.2em]">Ph(+) & TKI Çağı</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter italic uppercase">
              Kronik Miyeloid Lösemi (KML)
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl leading-relaxed italic">
              t(9;22) BCR::ABL1 resiprokal translokasyonu, ELTS risk skorlaması, güncel WHO/ICC sınıflandırması ve komorbiditelere göre hedefe yönelik TKI & TFR yönetimi.
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* 3. KRİTİK EŞİKLER PANELİ (WHO vs ICC Ayrımı ve ELTS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Sınıflandırma Çatışması */}
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 relative group overflow-hidden shadow-lg">
            <h3 className="text-blue-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" fill="currentColor" /> Sınıflandırma Çatışması
            </h3>
            <p className="text-slate-300 text-[13px] leading-relaxed mb-4 italic font-medium">
              3. Faz (Akselere Faz) sınıflandırmasında güncel kılavuz farkı:
            </p>
            <div className="space-y-2">
               <div className="flex items-center justify-between text-[11px] font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                 <span className="text-slate-500">WHO 2022:</span> 
                 <span className="text-rose-400 underline italic uppercase tracking-tighter">AP Kaldırıldı (Sadece CP ve BP)</span>
               </div>
               <div className="flex items-center justify-between text-[11px] font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                 <span className="text-slate-500">ICC 2022:</span> 
                 <span className="text-blue-400 italic font-black uppercase tracking-tighter">AP Tanımını (%10-19 Blast) Korur</span>
               </div>
               <div className="mt-2 text-[10px] text-slate-500 italic text-right">
                 *Ortak BP Kriteri: Kan/İlikte ≥%20 Blast veya Miyeloid Sarkom.
               </div>
            </div>
          </div>

          {/* ELTS Skoru */}
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-3xl p-6 relative flex flex-col justify-center shadow-lg group">
            <h3 className="text-emerald-400 font-black text-sm uppercase mb-4 flex items-center gap-2">
              <Target size={18} className="group-hover:scale-110 transition-transform" /> Modern Risk: ELTS Skoru
            </h3>
            <p className="text-slate-300 text-[13px] leading-relaxed mb-4">
              TKI çağında Sokal skorunun yerini alan, KML'ye bağlı ölümü (LRD) en iyi öngören modeldir. <span className="text-emerald-400 font-bold">"Yaş" faktörünün negatif etkisi Sokal'a göre belirgin düşüktür.</span>
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/20 flex flex-wrap gap-2">
               <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-800">Yaş</span>
               <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-800">Dalak Boyutu</span>
               <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-800">Periferik Blast %</span>
               <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-800">Trombosit</span>
            </div>
          </div>
        </div>

        {/* 4. KLİNİK ŞİFRELER TABLOSU (Transkriptler ve ACAs) */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest italic">
            <Microscope className="text-blue-500" /> KML Transkript ve Patoloji Şifreleri
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 border-b border-slate-800 font-black">
                  <tr className="text-blue-400 text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4">Varyant / Bulgu</th>
                    <th className="px-6 py-4">Klinik Fenotip</th>
                    <th className="px-6 py-4">YDUS İncisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium italic">
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">p210 (M-BCR)</td>
                    <td className="px-6 py-4 text-emerald-400">Klasik KML</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">Olguların %95'i (e13a2 veya e14a2).</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">p190 (e1a2)</td>
                    <td className="px-6 py-4 text-rose-400">Belirgin Monositoz</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">KMML'yi mikroskopide taklit edebilir. (Ph+ ALL'nin en sık nedeni).</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">p230 (e19a2)</td>
                    <td className="px-6 py-4 text-yellow-400">Belirgin Nötrofili</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">İndolent seyir. CNL (Kronik Nötrofilik Lösemi) benzeri tablo.</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-slate-200 uppercase font-black tracking-tighter">Kriptik Ph (-)</td>
                    <td className="px-6 py-4 text-slate-300">Karyotip Negatif</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">Tanı için mutlaka FISH veya kantitatif RT-PCR yapılmalıdır (%1-5).</td>
                  </tr>
                  <tr className="hover:bg-blue-500/5 transition-colors bg-blue-950/10">
                    <td className="px-6 py-4 text-blue-300 uppercase font-black tracking-tighter">Majör Rota ACAs</td>
                    <td className="px-6 py-4 text-blue-300 font-bold">Klonal Evrim</td>
                    <td className="px-6 py-4 text-slate-400 text-[13px]">Ph+ klonda +8, i(17q), +19, -7/7q-, 3q26.2. Kötü prognoz ve direnç göstergesi.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. TKI SEÇİMİ VE DİRENÇ MATRİSİ (Hap Bilgiler) */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-[2rem] p-8 mb-12 shadow-inner relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-5">
             <Dna size={200} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-emerald-400 mb-6 uppercase tracking-widest flex items-center gap-2 italic relative z-10">
            <ShieldCheck size={20} /> Komorbidite ve Mutasyona Göre TKI Matrisi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium leading-relaxed relative z-10">
            
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-white uppercase tracking-wider block mb-2 text-sm">İmatinib (1. Kuşak)</strong>
                 <p className="text-slate-400 italic mb-2">Güvenlilik profili en iyi olan ajan. Sıvı retansiyonu, kas krampları ve hipofosfatemi yapar.</p>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 text-rose-400 font-bold text-[10px] uppercase">Kontrendike: Ciddi ödem öyküsü</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-white uppercase tracking-wider block mb-2 text-sm">Dasatinib (2. Kuşak)</strong>
                 <p className="text-slate-400 italic mb-2">Plevral efüzyon (%20-30) ve PAH riski taşır. Emilim için asidik ortam gerekir (PPI ile verilmez).</p>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 text-rose-400 font-bold text-[10px] uppercase">Direnç: V299L, F317L/V/I/C</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-white uppercase tracking-wider block mb-2 text-sm">Nilotinib (2. Kuşak)</strong>
                 <p className="text-slate-400 italic mb-2">Arteriyel oklüziv olaylar, QTc uzaması ve hiperglisemi riski. Mutlaka aç karnına alınmalıdır.</p>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 text-rose-400 font-bold text-[10px] uppercase">Direnç: Y253H, E255K/V, F359V/I/C</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-white uppercase tracking-wider block mb-2 text-sm">Bosutinib (2. Kuşak)</strong>
                 <p className="text-slate-400 italic mb-2">En sık (%70) diyare yapar. Karaciğer disfonksiyonu (transaminaz yüksekliği) görülebilir.</p>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 text-rose-400 font-bold text-[10px] uppercase">Kontrendike: KC/Böbrek ytmz, İBH</div>
            </div>

            <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-500/30 hover:bg-rose-900/20 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-rose-400 uppercase tracking-wider block mb-2 text-sm">Ponatinib (3. Kuşak)</strong>
                 <p className="text-slate-400 italic mb-2">T315I mutasyonunda çok güçlüdür. Ancak fatal arteriyel/venöz tromboz ve kalp yetmezliği riski yüksektir.</p>
               </div>
               <div className="mt-3 pt-3 border-t border-rose-900/50 text-rose-300 font-bold text-[10px] uppercase">Taktik: Yanıt (≤%1) alınınca doz 15mg'a inilmeli.</div>
            </div>

            <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/40 hover:bg-emerald-900/30 transition-colors flex flex-col justify-between">
               <div>
                 <strong className="text-emerald-400 uppercase tracking-wider block mb-2 text-sm">Asciminib (STAMP / 4. Kuşak)</strong>
                 <p className="text-slate-300 italic mb-2">ATP cebine DEĞİL, ABL1'in miristoil cebine allosterik kilitlenir. Pankreatit/HT yapabilir.</p>
               </div>
               <div className="mt-3 pt-3 border-t border-emerald-900/50 text-emerald-300 font-bold text-[10px] uppercase">T315I varlığında: 5 Kat Doz (200mg BID)</div>
            </div>

          </div>
        </div>

        {/* 6. YDUS ÖZEL: TFR (Tedavisiz Remisyon) ve Gebelik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* TFR Kartı */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
            <h3 className="text-white font-black text-sm uppercase mb-4 flex items-center gap-2 italic">
              <CheckCircle2 size={18} className="text-emerald-500" /> TFR (Tedavisiz Remisyon) Şartları
            </h3>
            <ul className="space-y-3 text-[13px] text-slate-300 font-medium italic">
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Sadece ilk Kronik Faz'da (CP) olmak (AP/BP öyküsü yok).</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> En az 3-5 yıl aralıksız TKI kullanmış olmak.</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> En az 2 yıl boyunca kesintisiz DMR (MR4 veya MR4.5 / ≤%0.01) düzeyinde kalmak.</li>
            </ul>
            <div className="mt-5 p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-rose-300 text-xs italic">
              <strong>TKI Yoksunluk Sendromu:</strong> İlacı bırakanların %20-30'unda polimiyalji benzeri kas-eklem ağrıları görülür. Nükslerin çoğu ilk 6 ayda olur.
            </div>
          </div>

          {/* İleri Faz ve Gebelik */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
            <h3 className="text-white font-black text-sm uppercase mb-4 flex items-center gap-2 italic">
              <Baby size={18} className="text-blue-400" /> Gebelik ve Blastik Kriz
            </h3>
            <ul className="space-y-3 text-[13px] text-slate-300 font-medium italic">
              <li><strong className="text-blue-300">Gebelik:</strong> TKI'lar (özellikle ilk trimester) KESİNLİKLE teratojeniktir. Gebelik saptanırsa kesilir. Güvenli seçenek <strong>İnterferon-alfa</strong>'dır.</li>
              <li><strong className="text-blue-300">Blastik Kriz (BP):</strong> Krizlerin %70'i myeloid, %30'u lenfoiddir (TdT/CD10+). TKI monoterapisi yetersizdir, kemoterapi kombine edilip <strong>Allo-HSCT</strong> (tek küratif) yapılmalıdır.</li>
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
            {kmlCanonicalData?.sections?.map((sec: any, idx: number) => (
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
          </div>
        </div>

        {/* 8. TAKTİKSEL PANEL (Standardize Linkler) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link href="/tr/premium/ydus/hizli-tekrar?branch=hematoloji&id=kml" className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col shadow-lg">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Hızlı Tekrar</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1 italic">KML fazları, Cüce megakaryositler, Bazofili ve TKI kilometre taşları.</p>
            <div className="flex items-center justify-between text-emerald-500 font-black text-[10px] uppercase tracking-widest">Görevi Başlat <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
          </Link>

          <Link href="/tr/premium/ydus/inciler?branch=hematoloji&id=kml" className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-yellow-500/50 transition-all flex flex-col shadow-lg">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">💎</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">KML İncileri</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1 italic">CHIP mutasyonları (ASXL1), Atipik KML ayrımı ve p190/p230 spotları.</p>
            <div className="flex items-center justify-between text-yellow-500 font-black text-[10px] uppercase tracking-widest">İstihbaratı Oku <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
          </Link>

          <div className="group bg-slate-950 rounded-3xl p-8 border border-red-500/20 relative overflow-hidden flex flex-col shadow-2xl opacity-60 grayscale cursor-not-allowed">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest italic shadow-lg">Board Tipi</div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-2xl mb-6">📝</div>
            <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Mega Deneme</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1 italic font-bold tracking-tight">Kinaz Domain (KD) mutasyon dirençleri ve Vaka temelli KML kriz soruları yakında.</p>
          </div>
        </div>

        {/* 9. VİDEO RADAR */}
        <div className="bg-slate-900/20 backdrop-blur-xl p-8 rounded-[3rem] border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Flame size={120} className="text-orange-500" />
          </div>
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Activity className="text-emerald-500" /> KML Video Brifingleri
          </h2>
          <PremiumVideoRecommendations data={kmlVideoData} />
        </div>

      </div>
    </div>
  );
}