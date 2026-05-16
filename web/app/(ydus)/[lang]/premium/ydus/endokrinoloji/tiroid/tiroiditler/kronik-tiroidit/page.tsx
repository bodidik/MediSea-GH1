// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\endokrinoloji\tiroid\tiroiditler\kronik-tiroidit\page.tsx"
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, ShieldAlert, Dna, Activity, 
  Microscope, Pill, AlertTriangle, Bug, ArrowRightLeft, Stethoscope 
} from 'lucide-react';

export default function HashimotoThyroiditisPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-8 px-4 sm:px-6 font-sans text-slate-800 relative">
      
      {/* 1. ÜST NAVİGASYON (Geri Dönüş) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href={`/${lang}/premium/ydus/endokrinoloji/tiroid/tiroiditler`}
          className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft size={18} />
          </div>
          Tiroiditler İndeksine Dön
        </Link>
      </div>

      <main className="max-w-4xl mx-auto">
        
        {/* 2. HEADER KARTI */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-8 border border-indigo-100 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-widest shadow-sm">YDUS Premium Özet</span>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest shadow-sm">Otoimmünite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase italic flex items-center gap-3">
               <ShieldAlert size={40} className="text-indigo-500" /> Hashimoto Tiroiditi (HT)
            </h1>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              İmmünopatogenez, genetik yatkınlık, bağırsak-tiroid ekseni, PTK ilişkisi ve güncel medikal/takviye tedavi yaklaşımları.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>

        {/* 3. MAKALE İÇERİĞİ */}
        <div className="space-y-6">
          
          {/* İmmünopatogenez ve Genetik */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                <Dna size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">1. İmmünopatogenez ve Genetik</h2>
            </div>
            
            <div className="space-y-4 text-sm sm:text-base font-medium leading-relaxed text-slate-600">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-indigo-700 block mb-1">Hücresel Yanıt:</strong>
                Patogenezin temelinde <strong className="text-slate-800">Th1 ve Th17 hücre baskınlığı</strong> ile T-regülatör (Treg) hücre disfonksiyonu (Th17/Treg dengesizliği) yer alır. CD8+ sitotoksik T hücreleri; perforin, granzim ve Fas/FasL apoptoz yolağı üzerinden tiroid folikül hücre harabiyeti yapar.
              </div>

              

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-indigo-700 block mb-1">Hümoral Yanıt:</strong>
                TPOAb ve TgAb otoantikorları, antikora bağımlı hücresel sitotoksisite (ADCC) ve kompleman aktivasyonu ile tiroid yıkımına katkıda bulunur.
              </div>

              <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 shadow-sm">
                <strong className="text-indigo-900 block mb-2 flex items-center gap-2">
                  <Activity size={16} /> Genetik Yatkınlık:
                </strong>
                <ul className="list-disc pl-5 space-y-1 text-indigo-900/80">
                  <li><strong className="text-indigo-800">HLA-DR3</strong> (en güçlü HLA ilişkisi)</li>
                  <li><strong className="text-indigo-800">PTPN22</strong> (T ve B hücre sinyalizasyonunda artış)</li>
                  <li><strong className="text-indigo-800">CTLA4</strong> (T hücre inhibisyonunda azalma)</li>
                  <li><strong className="text-indigo-800">FOXP3</strong> (Treg disfonksiyonu) ve CD40 gen polimorfizmleri en sık suçlanan genetik faktörlerdir.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-indigo-700 block mb-1">İnflamazom Aktivasyonu:</strong>
                Tiroid folikül hücrelerinde <strong className="text-slate-800">NLRP1 ve NLRP3</strong> inflamazomlarının aşırı ekspresyonu, kaspaz-1 aktivasyonu ile IL-1β ve IL-18 salınımını artırarak tiroid hasarını tetikler.
              </div>
            </div>
          </section>

          {/* Bağırsak-Tiroid Ekseni (Gut-Thyroid Axis) */}
          <section className="bg-emerald-900 rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-800 text-emerald-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 border border-emerald-700 shadow-inner">
                <Bug size={20} />
              </div>
              <h2 className="text-xl font-black text-white">2. Bağırsak-Tiroid Ekseni ve Mikrobiyota</h2>
            </div>
            
            <p className="text-sm sm:text-base font-medium leading-relaxed mb-4">
              HT hastalarında bağırsak mikrobiyota çeşitliliği azalmış, <strong className="text-emerald-300">Firmicutes/Bacteroidetes oranı artmıştır</strong>.
            </p>

            

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-800/50">
                <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Sızdıran Bağırsak (Leaky Gut)</h3>
                <p className="text-sm text-emerald-100/90 font-medium">
                  Bağırsak epitel sıkı bağlantılarını (tight junction) düzenleyen <strong className="text-white">Zonulin proteini</strong> HT hastalarında yüksektir. Artmış geçirgenlik, antijenlerin dolaşıma katılmasına yol açar.
                </p>
              </div>
              <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-800/50">
                <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Moleküler Mimikri</h3>
                <p className="text-sm text-emerald-100/90 font-medium">
                  <em className="text-white">Helicobacter pylori</em>&apos;nin <strong className="text-white">CagA proteini ile TPO</strong> arasında ve <em className="text-white">Borrelia</em> ile <strong className="text-white">TSH reseptörü (TSHR)</strong> arasında aminoasit dizilim benzerliği (homoloji) mevcuttur.
                </p>
              </div>
            </div>
          </section>

          {/* PTK İlişkisi ve Graves Geçişi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Microscope size={20} className="text-rose-500" />
                <h3 className="text-lg font-black text-slate-800">3. PTK ile HT İlişkisi</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm font-medium leading-relaxed text-slate-600 space-y-3">
                <p>
                  HT, Papiller Tiroid Kanseri (PTC) gelişimi için inflamatuar bir risk faktörüdür; ancak tümör progresyonuna karşı koruyucu (<strong className="italic text-slate-800">&quot;çift keskinli kılıç&quot;</strong>) bir mikroçevre oluşturur.
                </p>
                <p>
                  HT zemininde gelişen PTC&apos;lerde tümör boyutu daha küçük, ekstratiroidal yayılım ve lenf nodu metastazı daha azdır; ancak <strong className="text-slate-800">multifokalite (çok odaklılık) sıklığı artmıştır</strong>.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mt-2">
                  <p className="text-amber-800 text-xs sm:text-sm font-bold m-0">
                    YDUS İNCİSİ: Kötü prognoz ve agresif seyir göstergesi olan <span className="underline">BRAF V600E mutasyonu</span>, HT birlikteliği olan PTC&apos;lerde anlamlı ölçüde daha NADİR görülür.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRightLeft size={20} className="text-amber-500" />
                <h3 className="text-lg font-black text-slate-800">4. Graves Hastalığına Geçiş</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm font-medium leading-relaxed text-slate-600 space-y-3">
                <p>
                  HT&apos;den Graves hastalığına (hipertiroidiye) geçiş nadirdir ve immünolojik olarak <strong className="text-slate-800">Th1 baskınlığından Th2 baskınlığına kayma</strong> ile karakterizedir.
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                  <p className="text-slate-700 text-xs sm:text-sm font-bold m-0 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    Bu değişimi öngörmede, HT takibinde tiroid stimüle edici antikor (TSAb) düzeylerinin pozitifleşmesi çok önemli bir belirteçtir.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Tedavi ve Ek Gıda Takviyeleri */}
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-100 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-sm">
                <Pill size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">5. Tedavi ve Ek Gıda Takviyeleri</h2>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Güncel Fonksiyonel Yaklaşımlar</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-indigo-700 font-bold text-sm mb-1">Levotiroksin</h3>
                <p className="text-sm text-slate-600 font-medium">Hipotiroidizm yönetiminde temel ve standart tedavidir.</p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-indigo-700 font-bold text-sm mb-1">Selenyum</h3>
                <p className="text-sm text-slate-600 font-medium">Antioksidan enzimlerin (Glutatyon peroksidaz) kofaktörüdür. Oksidatif stresi (Malondialdehit düzeylerini) ve <strong className="text-slate-800">TPOAb titrelerini anlamlı şekilde düşürür</strong>.</p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-indigo-700 font-bold text-sm mb-1">D Vitamini</h3>
                <p className="text-sm text-slate-600 font-medium">Th17/Tr1 (Treg) oranını azaltarak immünomodülatör etki gösterir. Eksikliği belirgin HT ve artmış otoantikor titreleri ile güçlü şekilde ilişkilidir.</p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-indigo-700 font-bold text-sm mb-1">Myo-Inositol</h3>
                <p className="text-sm text-slate-600 font-medium">Selenyum ile kombine kullanıldığında tirositlerde TSH duyarlılığını iyileştirir ve CXCL10 gibi pro-inflamatuar kemokinleri baskılar.</p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 shadow-sm sm:col-span-2">
                <h3 className="text-indigo-700 font-bold text-sm mb-1">Metformin</h3>
                <p className="text-sm text-slate-600 font-medium">AMPK aktivasyonu ile Th17 hücrelerini ve makrofaj (M1) polarizasyonunu baskılayarak otoantikor düzeylerini azaltabilir.</p>
              </div>
            </div>
          </section>

          {/* Lokal Semptomlar */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                <Stethoscope size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">6. Lokal Semptomlar (ThyPRO)</h2>
            </div>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-600">
              HT, tiroid hormon düzeylerinden bağımsız olarak tiroid bezindeki volüm artışı ve inflamasyona bağlı boyun ağrısı (<strong className="text-slate-800">Ağrılı HT varyantı</strong>), yutma güçlüğü (disfaji), ses kısıklığı ve nefes darlığı gibi lokal bası semptomlarına neden olabilir.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}