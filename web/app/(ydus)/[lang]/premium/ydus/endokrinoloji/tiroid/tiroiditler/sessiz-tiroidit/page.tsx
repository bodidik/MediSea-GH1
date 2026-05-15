// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\endokrinoloji\tiroid\tiroiditler\sessiz-tiroidit\page.tsx"
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, Baby, ShieldAlert, Activity, 
  Stethoscope, Zap, Pill, LineChart, AlertTriangle, Clock 
} from 'lucide-react';

export default function PostpartumThyroiditisPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-8 px-4 sm:px-6 font-sans text-slate-800 relative">
      
      {/* 1. ÜST NAVİGASYON (Geri Dönüş) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href={`/${lang}/premium/ydus/endokrinoloji/tiroid/tiroiditler`}
          className="flex items-center gap-2 text-teal-600 font-black text-sm hover:text-teal-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft size={18} />
          </div>
          Tiroiditler İndeksine Dön
        </Link>
      </div>

      <main className="max-w-4xl mx-auto">
        
        {/* 2. HEADER KARTI */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-8 border border-teal-100 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-teal-50 text-teal-600 text-[10px] font-black px-3 py-1 rounded-full border border-teal-200 uppercase tracking-widest shadow-sm">Klinik Derleme</span>
              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full border border-rose-200 uppercase tracking-widest shadow-sm">Otoimmün Rebound</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase italic flex items-center gap-3">
               <Baby size={40} className="text-rose-500" /> Postpartum Tiroidit (PPT)
            </h1>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              Gebelik sonrası immün rebound ile tetiklenen bifazik seyir; PPT ile Graves ayrımı, riskli gruplarda tarama ve tedavi yönetim algoritmaları.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-rose-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>

        {/* 3. MAKALE İÇERİĞİ */}
        <div className="space-y-6">
          
          {/* Tanım ve Epidemiyoloji */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-500 border border-slate-100">
                <ShieldAlert size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">1. Temel Tanım ve Epidemiyoloji</h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 space-y-4">
              <p>
                Postpartum tiroidit (PPT), gebelik sonlanmasını (doğum, düşük veya abortus) takip eden ilk 1 yıl içinde ortaya çıkan, otoimmün mekanizmalı, ağrısız destrüktif bir tiroidittir. Genel toplumdaki kadınlarda görülme sıklığı ortalama %5-8 civarındadır. Ancak, yüksek riskli bazı spesifik gruplarda bu oran dramatik şekilde artar:
              </p>
              
              <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-100 shadow-sm mt-4">
                <strong className="text-rose-900 block mb-2 text-sm uppercase tracking-widest">Yüksek Riskli Gruplar:</strong>
                <ul className="list-disc pl-5 space-y-2 text-rose-900/80 text-sm">
                  <li><strong className="text-rose-800">Tip 1 Diabetes Mellitus</strong> hastalarında: ~%25.</li>
                  <li><strong className="text-rose-800">Daha önce PPT öyküsü olanlarda:</strong> ~%42-%70 (sonraki gebeliklerde nüks riski çok yüksektir).</li>
                  <li><strong className="text-rose-800">Gebeliğin erken döneminde TPO antikoru pozitif</strong> saptanan ötiroid kadınlarda: %33-%60.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Patogenez */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-500 border border-slate-100">
                <Activity size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">2. Patogenez</h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 space-y-4">
              <p>
                PPT, patolojik ve histolojik olarak kronik otoimmün tiroiditin (Hashimoto tiroiditi) bir varyantı kabul edilir; tiroid bezinde lenfositik infiltrasyon ve folikül destrüksiyonu görülür. 
              </p>
              
              

              <div className="bg-slate-50 border-l-4 border-teal-400 p-4 rounded-r-xl italic">
                <p>
                  Gebelik boyunca fetüsü korumak amacıyla baskılanan maternal immün sistemin, doğumdan sonra bu baskıdan kurtulması ve hücresel/hümoral immünitenin şiddetle geri dönmesi <strong className="text-teal-800">(immünolojik rebound)</strong> hastalığı tetikleyen temel mekanizmadır. 
                </p>
              </div>
              <p>
                Meydana gelen inflamasyon, tiroid foliküllerinde harabiyete yol açar ve depolanmış tiroglobulinin proteolizi sonucunda kana bol miktarda preforme tiroid hormonu (T4 ve T3) salınır.
              </p>
            </div>
          </section>

          {/* Klinik Seyir (Fazlar) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-500 border border-slate-100">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">3. Klinik Seyir (Fazlar)</h2>
            </div>
            
            <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-600 mb-6">
              PPT tipik olarak bifazik bir seyir izler, ancak hastaların çoğunda izole fazlar da görülebilir:
            </p>

            

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <h3 className="text-blue-700 font-bold text-sm mb-2">1. Sadece Hipotiroidi Fazı (%40-50)</h3>
                <p className="text-sm text-slate-700 font-medium">
                  En sık görülen klinik tablodur. Tipik olarak doğumdan 2-6 ay (veya 3-12 ay) sonra ortaya çıkar. Hastalarda yorgunluk, soğuğa intolerans, cilt kuruluğu ve konsantrasyon bozukluğu ön plandadır; ayrıca anne sütü miktarında azalmaya neden olabilir.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50">
                <h3 className="text-rose-700 font-bold text-sm mb-2">2. Sadece Tirotoksikoz Fazı (%20-40)</h3>
                <p className="text-sm text-slate-700 font-medium">
                  Genellikle 2-6. aylarda gözlenir. Semptomlar anksiyete, çarpıntı, yorgunluk ve kilo kaybı şeklinde olup nispeten hafiftir; genellikle yeni anneliğin getirdiği olağan yorgunluk veya stres ile karıştırılabilir.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/50">
                <h3 className="text-teal-700 font-bold text-sm mb-2">3. Klasik Bifazik Seyir (%20-30)</h3>
                <p className="text-sm text-slate-700 font-medium">
                  Hastalık doğumdan 1-4 ay sonra başlayan ve 1-2 ay süren bir tirotoksik faz ile başlar. Tiroid bezindeki hormon depoları tükendiğinde, bunu 4-8. aylarda başlayan ve 4-6 ay süren hipotiroidik faz izler. Son aşamada bez kendini toparlar ve ötiroidi sağlanır.
                </p>
              </div>
            </div>
          </section>

          {/* YDUS İÇİN KRİTİK BÖLÜM: Tanı ve Ayırıcı Tanı */}
          <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 text-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30 shadow-inner">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">YDUS İÇİN KRİTİK: Tanı ve Ayırıcı Tanı</h2>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">PPT vs. Graves Hastalığı</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base font-medium leading-relaxed mb-6">
              Postpartum tirotoksikoz tablosuyla başvuran bir hastada en önemli adım, PPT&apos;nin postpartum dönemde nüks edebilen veya yeni başlayabilen Graves hastalığından ayrılmasıdır. Bu iki tablonun yönetimi birbirinden <strong className="text-white">tamamen farklıdır:</strong>
            </p>

            

            <div className="space-y-4">
              {[
                { title: "Zamanlama", ppt: "Tipik olarak erken dönemde (1-4. aylar arası) başlar.", graves: "Doğumdan daha geç (genellikle 4-12. aylar arası) alevlenir." },
                { title: "Fizik Muayene", ppt: "Bez normal veya hafif büyümüş olup oftalmopati izlenmez.", graves: "Diffüz büyümüş, vaskülaritesi artmış guatr, oftalmopati ve pretibial miksödem bulunabilir." },
                { title: "Hormon Profili (T3/T4 Oranı)", ppt: "Destrüktif tiroidit olduğundan preforme hormon salınır ve T3/T4 oranı DÜŞÜKTÜR.", graves: "T3 sentezi orantısız şekilde arttığı için T3/T4 oranı YÜKSEKTİR (>20)." },
                { title: "Antikorlar", ppt: "TRAb/TSI negatiftir. Olguların %60-85'inde TPO antikoru pozitiftir.", graves: "TRAb / TSI (Tirotropin Reseptör Antikoru) POZİTİFTİR." },
                { title: "Tiroid Kan Akımı (Doppler USG)", ppt: "Kan akımı azalmış veya normaldir (heterojen ekotekstür).", graves: "Tiroidin kan akımı ARTMIŞTIR (Tiroid inferno)." },
                { title: "Radyoaktif İyot Uptake (RAIU)", ppt: "Destrüksiyona bağlı <1% (düşük uptake) saptanır.", graves: "Uptake YÜKSEKTİR (Laktasyonda emzirmeye ara verilerek yapılır)." }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/4">
                    <h3 className="text-teal-400 font-bold text-sm uppercase tracking-widest">{item.title}</h3>
                  </div>
                  <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">PPT</span>
                      <p className="text-sm text-slate-300 font-medium">{item.ppt}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Graves</span>
                      <p className="text-sm text-slate-300 font-medium">{item.graves}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tedavi Yönetimi */}
          <section className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-200/60 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 border border-teal-200">
                <Pill size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">5. Tedavi Yönetimi</h2>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Faza Özgü Yaklaşım</p>
              </div>
            </div>
            
            <p className="text-sm font-medium text-slate-700 mb-6">
              Postpartum tiroidit tedavisinde yaklaşım, içinde bulunulan faza göre şekillenir:
            </p>

            <div className="space-y-4">
              <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-100 shadow-sm">
                <h3 className="text-rose-700 font-bold text-sm mb-2 flex items-center gap-2">
                  <Zap size={16} /> 1. Tirotoksik Faz Tedavisi
                </h3>
                <p className="text-sm text-slate-700 font-medium mb-3">
                  Bu fazda tiroid hormon sentezinde bir artış yoktur; dolaşımdaki hormonlar yıkılan foliküllerden dökülen preforme hormonlardır. Tedavi genellikle semptomatiktir; belirgin çarpıntı, tremor ve anksiyetesi olan hastalara <strong className="text-slate-900">beta-bloker</strong> başlanır. Laktasyonda süte geçişi daha az olan <strong className="text-slate-900">propranolol veya metoprolol</strong> tercih edilmelidir.
                </p>
                <div className="bg-rose-100/50 border-l-4 border-rose-500 p-3 rounded-r-lg text-rose-900 text-xs sm:text-sm font-bold">
                  DİKKAT: Antitiroid ilaçların (Metimazol, Propiltiourasil) tedavisinde hiçbir yeri YOKTUR ve kesinlikle kontrendikedir.
                </div>
              </div>

              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-blue-700 font-bold text-sm mb-2">2. Hipotiroidik Faz Tedavisi</h3>
                <p className="text-sm text-slate-700 font-medium">
                  Semptomatik olanlar, aktif olarak tekrar gebelik planlayanlar veya serum <strong className="text-slate-900">TSH değeri &ge; 10 mIU/L</strong> olan asemptomatik hastalar <strong className="text-slate-900">Levotiroksin (LT4)</strong> ile tedavi edilmelidir. Başlangıç dozu hastanın kilosuna göre tam replasman veya daha düşük (50-75 mcg/gün) dozlarda olabilir, zira tiroid henüz tamamen destrükte olmamıştır.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-teal-100 shadow-sm">
                <h3 className="text-teal-700 font-bold text-sm mb-2">3. İlacın Kesilmesi</h3>
                <p className="text-sm text-slate-700 font-medium">
                  PPT sıklıkla geçici bir tablo olduğundan, LT4 tedavisi ömür boyu doğrudan devam ettirilmez. Yeni bir gebelik planlanmıyorsa, postpartum 6. ile 12. aylar arasında ilacın dozu yarıya indirilip TSH takibi yapılarak kesilmesi denenmelidir.
                </p>
              </div>
            </div>
          </section>

          {/* Prognoz, İzlem ve Tarama */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                <LineChart size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">6. Prognoz, Uzun Dönem İzlem ve Tarama</h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 space-y-4">
              <p>
                Hastaların büyük çoğunluğu birinci yılın sonunda ötiroid hale gelerek iyileşir. Ancak, iyileşme sonrasında hastaların <strong className="text-slate-800">%20 ila %50'sinde zaman içinde kalıcı hipotiroidi gelişir</strong>.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                <strong className="text-amber-900 block mb-1">Kalıcı Hipotiroidi Gelişimini Öngören Risk Faktörleri:</strong>
                <ul className="list-disc pl-5 space-y-1 text-amber-900/80 text-sm">
                  <li>Çok yüksek TPO antikoru titresi</li>
                  <li>İlk atakta hipotiroidik fazın şiddetli geçmesi (çok yüksek TSH)</li>
                  <li>İleri anne yaşı</li>
                  <li>Multiparite</li>
                  <li>Ultrasonda belirgin hipoekojenite varlığı</li>
                </ul>
              </div>

              <p>
                Bu risk sebebiyle, tiroid fonksiyonları normale dönse bile hastaların hayat boyu (özellikle ilk 5-10 yıl) yıllık TSH ile takibi gereklidir.
              </p>
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-800 block mb-1">Tarama Önerileri:</strong>
                <p className="text-sm">
                  Tüm gebe veya lohusalara evrensel PPT taraması önerilmemektedir. Fakat <strong className="text-slate-800">Tip 1 Diabetes Mellitus, yüksek titrede TPO antikoru pozitifliği veya daha önce geçirilmiş PPT öyküsü</strong> olan yüksek riskli gebelerde postpartum 3. ve 6. aylarda serum TSH düzeyi ile tarama yapılması gereklidir. Güncel literatürde, LT4, iyot veya selenyum takviyesinin PPT'yi önlediğine dair yeterli ve tutarlı bir kanıt bulunmamaktadır.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}