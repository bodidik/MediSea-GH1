'use client';

import React from 'react';
import { 
  ChevronLeft, ChevronRight, Activity, Microscope, Zap, Heart, Bone, 
  ShieldAlert, BarChart3, Dna, Syringe, Info, AlertTriangle, 
  Stethoscope, Pill, Baby, Target
} from 'lucide-react';import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AkromegaliPremiumPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-8 px-4 sm:px-6 font-sans text-slate-800">
      
      {/* ÜST NAVİGASYON */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link 
          href={`/${lang}/premium/ydus/endokrinoloji/hipofiz`}
          className="flex items-center gap-2 text-amber-600 font-black text-sm hover:text-amber-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform border border-amber-100">
            <ChevronLeft size={18} />
          </div>
          Hipofiz Karargahına Dön
        </Link>
      </div>

      <main className="max-w-5xl mx-auto">
        
        {/* HEADER KARTI */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-amber-100 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest">En güncel Akromegali</span>
              <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic shadow-lg">YDUS Premium</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4 tracking-tight uppercase italic flex items-center gap-4">
               <Activity size={48} className="text-amber-500" /> Akromegali
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-3xl italic">
              Tanı kriterlerinden yeni nesil oral SRL teknolojilerine, kardiyomiyopatide STE kullanımından gebelik yönetimine kadar en güncel klinik veriler.
            </p>
          </div>
        </div>

        {/* --- ÇÖZÜMLÜ SORULAR BAĞLANTI KARTI --- */}
        <section className="mb-10">
          <Link 
            href={`/${lang}/premium/ydus/quiz-coz?branch=endokrinoloji&id=akromegali-soru-bankasi`}
            className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-600 p-0.5 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[22px] bg-slate-900 px-8 py-6 transition-all group-hover:bg-slate-900/95 relative overflow-hidden">
              
              {/* Arka plan efekti */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-colors"></div>

              <div className="flex items-center gap-5 relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-inner border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Target size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Akromegali Çözümlü Sorular</h2>
                  <p className="text-sm font-medium text-slate-400 italic">YDUS formatında detaylı açıklamalı vaka analizleri ve board tipi sorular</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg group-hover:bg-white group-hover:text-indigo-700 transition-colors relative z-10">
                SORU ÇÖZ
                <ChevronRight size={16} />
              </div>
            </div>
          </Link>
        </section>
        {/* ----------------------------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL KOLON - TANI & KLİNİK */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Tanı ve Remisyon */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                  <Stethoscope size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase italic">1. Tanı & Remisyon Dinamikleri</h2>
              </div>
              
              <div className="space-y-6 text-sm leading-relaxed text-slate-700">
                
                {/* Tanı Dinamikleri */}
                <div>
                  <h4 className="font-black text-amber-700 mb-2 border-b border-amber-100 pb-1">Tanı Kriterleri ve IGF-1</h4>
                  <ul className="space-y-2">
                    <li>
                      <span className="text-amber-500 mr-2">■</span>
                      <strong>IGF-1 Eşiği:</strong> Tipik klinik bulgularda IGF-1 <strong>{'>'} 1.3 x ULN</strong> (Üst Sınır) tanıyı kesinleştirir. Gecelik açlık rastgele GH düzeyi prognozu öngörebilse de <em>tanı için artık zorunlu değildir.</em>
                    </li>
                    <li>
                      <span className="text-amber-500 mr-2">■</span>
                      <strong>OGTT Kullanımı:</strong> Sadece IGF-1 değerlerinin sınırda (equivocal) olduğu şüpheli vakalara saklanmalıdır. Tek bir evrensel eşik yoktur.
                    </li>
                    <li>
                      <span className="text-amber-500 mr-2">■</span>
                      <strong>VKİ Bazlı Kesim Değerleri:</strong> OGTT yapıldığında GH nadiri için VKİ kullanılmalıdır; VKİ {'<'} 25 kg/m² olanlarda <strong>{'<'} 0.4 µg/L</strong>, VKİ ≥ 25 kg/m² olan obezlerde ise <strong>{'<'} 0.2 µg/L</strong> dışlama için dikkate alınır.
                    </li>
                  </ul>
                </div>

                {/* Remisyon Dinamikleri */}
                <div>
                  <h4 className="font-black text-emerald-700 mb-2 border-b border-emerald-100 pb-1">Neden "Kür" Yerine "Remisyon"?</h4>
                  <ul className="space-y-2">
                    <li>
                      <span className="text-emerald-500 mr-2">■</span>
                      "Kür" mutlak eradikasyonu ima eder. Ancak mikroskobik hastalık kalabileceği için yeni kılavuzlar <strong>"remisyon"</strong> terimini (hastalık aktivitesinin saptanamaması) standart kabul etmiştir.
                    </li>
                    <li>
                      <span className="text-emerald-500 mr-2">■</span>
                      <strong>İdeal Hedef:</strong> Sekonder hipopitüitarizmi (GH eksikliği) önlemek için IGF-1 düzeyinin yaşa uygun referans aralığının <em>orta veya üst yarısında</em> tutulması hedeflenir.
                    </li>
                    <li>
                      <span className="text-emerald-500 mr-2">■</span>
                      <strong>Karar Zamanı:</strong> Kesin postoperatif biyokimyasal remisyon kararı vermek için IGF-1 ölçümü cerrahiden <strong>12 hafta sonra</strong> yapılmalıdır.
                    </li>
                  </ul>
                </div>

                {/* Spot Kutusu */}
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-start gap-4 shadow-inner mt-4">
                  <Zap size={24} className="text-rose-500 shrink-0 mt-1" />
                  <div className="space-y-2">
                    <div className="text-xs font-black text-rose-800 uppercase tracking-widest border-b border-rose-200/50 pb-1 inline-block">YDUS Altın Spotlar</div>
                    <p className="text-xs font-bold text-rose-900 leading-relaxed">
                      1. Cerrahiden hemen sonraki 1-14. günlerde ölçülen yüksek GH, kalıcı hastalığın en güçlü habercisidir. <br/>
                      2. Pegvisomant kullananlarda dolaşımdaki GH düşmez (hatta artar). Bu nedenle takipte <strong>SADECE IGF-1</strong> normalleşmesine bakılır!
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* 2. Kardiyovasküler & Osteopatik Komplikasyonlar (Dark Mega Kart - Grid Layout) */}
            <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-slate-200 relative overflow-hidden mt-8">
              {/* Karanlık arayüz arka plan ışıltısı */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-rose-400 border border-slate-700 shadow-sm">
                    <Heart size={22} />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-wider">
                    2. Komplikasyonlarda Yeni Araçlar ve Yönetim
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Kardiyomiyopati (STE) */}
                  <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                      <h4 className="text-rose-400 font-black text-[13px] uppercase flex items-center gap-2">
                        <Activity size={16}/> Kardiyomiyopati & STE
                      </h4>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                        Erken Tanı
                      </span>
                    </div>
                    <div className="text-[12px] leading-relaxed space-y-3 flex-grow text-slate-300">
                      <p>
                        <strong className="text-white">LVEF Yanılgısı:</strong> Klasik EKO'da Sol Ventrikül Ejeksiyon Fraksiyonu (LVEF) geç döneme kadar normal kalır ve interstisyel fibrozise bağlı miyokardiyal hasarı gizleyebilir.
                      </p>
                      <p>
                        <strong className="text-white">Speckle Tracking (STE):</strong> Subklinik sistolik disfonksiyonun en erken ve en duyarlı göstergesi, STE ile ölçülen <strong>Global Longitudinal Strain (GLS)</strong> bozulmasıdır.
                      </p>
                      <p>
                        <strong className="text-white">Diyastolik Göstergeler:</strong> Erken diyastolik disfonksiyonu saptamada <strong>Sol Atriyal (LA) Strain</strong> düşüklüğü ve interventriküler septumda <strong>Elastic Recoil Sign (ERS)</strong> kaybı kritik yeni belirteçlerdir.
                      </p>
                    </div>
                    <div className="bg-rose-950/50 p-3 rounded-xl border border-rose-800/50 mt-4 text-[11px] text-rose-200 italic shadow-inner">
                      <strong>YDUS Spotu:</strong> Başarılı akromegali tedavisi ile GH/IGF-1 normalizasyonu sağlandığında, kardiyak ilaca gerek kalmadan GLS, LA Strain ve ERS değerlerinde tam geri dönüş izlenebilir.
                    </div>
                  </div>

                  {/* Osteopati (TBS) */}
                  <div className="bg-teal-900/20 p-5 rounded-2xl border border-teal-500/20 flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-teal-800/50 pb-3 mb-3">
                      <h4 className="text-teal-400 font-black text-[13px] uppercase flex items-center gap-2">
                        <Bone size={16}/> Osteopati & TBS
                      </h4>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                        Gizli Kırıklar
                      </span>
                    </div>
                    <div className="text-[12px] leading-relaxed space-y-3 flex-grow text-slate-300">
                      <p>
                        <strong className="text-white">KMD (BMD) Paradoksu:</strong> GH fazlalığı periostal apozisyonla kortikal kemiği kalınlaştırdığı için DXA ölçümleri normal veya yüksek çıkabilir. Ancak yüksek kemik döngüsü trabeküler mikro-mimariyi bozar.
                      </p>
                      <p>
                        <strong className="text-white">Trabeküler Kemik Skoru (TBS):</strong> DXA görüntüleri üzerinden piksel varyasyonlarını ölçen TBS, KMD'den bağımsız olarak düşüktür ve vertebral fraktür (VF) riskini çok daha doğru öngörür.
                      </p>
                      <p>
                        <strong className="text-white">Sessiz Fraktürler:</strong> Hastaların %60'ına varan kısmında torakolomber VF'ler görülür ve bunlar sıklıkla asemptomatiktir; tanı anında rutin <strong>lateral X-ray / morfometri</strong> şarttır.
                      </p>
                    </div>
                    <div className="bg-teal-950/50 p-3 rounded-xl border border-teal-800/50 mt-4 text-[11px] text-teal-200 italic shadow-inner">
                      <strong>YDUS Spotu:</strong> Aktif akromegali, artan Vitamin D Bağlayıcı Protein (VDBP) nedeniyle <strong>D vitamini direncine</strong> yol açar. Proaktif Kolekalsiferol (D Vit) replasmanı, insidan VF riskini anlamlı ölçüde azaltır.
                    </div>
                  </div>
                </div>

                {/* Aritmi, Kapak ve KAH Paradoksu (Alt Bilgi Blokları) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Aritmi ve Kapak (2 Sütun) */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                      <h4 className="text-amber-400 font-black text-[12px] uppercase mb-2">Aritmi Dinamikleri</h4>
                      <p className="text-[11px] text-slate-300">
                        En sık AFib görülür. Aritmi patogenezinde GH düzeyinden ziyade <strong>hastalığın süresi ve interstisyel fibrozis (skar)</strong> temel belirleyicidir. QT değişkenliği riski artırır.
                      </p>
                    </div>
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                      <h4 className="text-amber-400 font-black text-[12px] uppercase mb-2">Kapak Hastalıkları</h4>
                      <p className="text-[11px] text-slate-300">
                        GH'nin mitojenik etkisiyle en sık <strong>mitral ve aort kapak yetmezlikleri</strong> görülür. Aortik anüler dilatasyona yatkınlık mevcuttur.
                      </p>
                    </div>
                  </div>

                  {/* KAH Paradoksu (1 Sütun) */}
                  <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/30 relative overflow-hidden h-full flex flex-col justify-center">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                    <h4 className="font-black text-rose-400 mb-2 flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                      <ShieldAlert size={14}/> Şaşırtıcı KAH Paradoksu
                    </h4>
                    <p className="text-[10px] text-rose-100/80 leading-relaxed font-medium">
                      HT, DM, dislipidemi ve endotel disfonksiyonu gibi devasa risklere rağmen; dev kohortlarda <strong>KAH ve İnme prevalansının genel popülasyondan yüksek OLMADIĞI</strong> saptanmıştır!
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. Akromegali tedavi ajanları (Genişletilmiş Mega Kart) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-100 relative overflow-hidden mt-8">
              {/* Arka plan deseni */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-indigo-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                    <Pill size={22} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 uppercase italic">3. </h2>
                </div>

                <p className="text-sm text-slate-500 italic mb-6">
                  Geleceğin farmakolojik yaklaşımları: Hormon baskılamanın ötesinde hasta uyumunu artırma, enjeksiyon yükünü sıfırlama ve genetik/moleküler düzeyde hedefe yönelik tedaviler.
                </p>

                <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">

                  {/* Oral Oktreotid */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-black text-indigo-800 mb-2 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-md text-[10px]">1</span> 
                      Oral Oktreotid (Mycapssa®)
                    </h4>
                    <ul className="space-y-1.5 ml-7 list-disc text-indigo-900/80 marker:text-indigo-400">
                      <li><strong>TPE Teknolojisi:</strong> Hidrofilik partiküllerin lipofilik ortamda süspansiyonu ile bağırsaktaki <em>sıkı kavşakları (tight junctions)</em> geçici açarak parasellüler emilim sağlar.</li>
                      <li><strong>Kullanım:</strong> Besinle emilimi %90 azaldığı için <strong>tamamen aç karnına</strong> alınmalıdır.</li>
                      <li><strong>Kısıtlılık:</strong> Tedavi naiflerde KULLANILMAZ! Sadece daha önce enjektabl SRL'lere yanıt vermiş hastaların <em>idame tedavisinde</em> FDA onaylıdır.</li>
                    </ul>
                  </div>

                  {/* Paltusotine */}
                  <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                    <h4 className="font-black text-teal-800 mb-2 flex items-center gap-2">
                      <span className="bg-teal-600 text-white w-5 h-5 flex items-center justify-center rounded-md text-[10px]">2</span> 
                      Paltusotine
                    </h4>
                    <p className="ml-7 text-teal-900/80">
                      Peptit yapıda olmayan, oral SST2 reseptör agonistidir. Reseptör internalizasyonundan ziyade, baskılayıcı Gi sinyal yolağını aktive eden <strong>"biased agonism"</strong> mekanizmasıyla çalışır. Hem SRL ile kontrol altındakilerde hem de <em>yeni tanı (treatment-naive)</em> hastalarda IGF-1'i normalize ettiği gösterilmiştir.
                    </p>
                  </div>

                  {/* Cimdelirsen & ASO */}
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    <h4 className="font-black text-purple-800 mb-2 flex items-center gap-2">
                      <Dna size={18} className="text-purple-600"/> Cimdelirsen & Antisense Oligonükleotidler (ASO)
                    </h4>
                    <p className="ml-7 text-purple-900/80">
                      Karaciğeri hedefleyen bir ASO molekülüdür. <strong>GH Reseptörünün (GHR) mRNA'sına bağlanarak yıkımını indükler.</strong> Pegvisomant'a benzer şekilde tümör boyutuna etki etmez, periferik IGF-1 sentezini kırar.
                    </p>
                  </div>

                  {/* Ufuktaki Diğer Tedaviler */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-widest text-[11px]">
                      <Zap size={16} className="text-amber-500"/> Ufuktaki Diğer Formülasyonlar (YDUS Ek Bilgi)
                    </h4>
                    <div className="space-y-3 ml-7">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">CAM2029 (Oclaiz™):</span>
                        <span className="text-slate-600"><strong>FluidCrystal®</strong> teknolojisi ile subkütan enjekte edilir; sıvıyla temas edince jele dönüşerek ilacı hapseder ve yavaş salınır.</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">Somatropim (DG3173):</span>
                        <span className="text-slate-600">SST2, SST4 ve SST5'e bağlanan ancak <strong>insülin sekresyonunu bozmayan</strong> (Pasireotid yan etkisinden kaçınan) yeni nesil SRL.</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">AZP-3813:</span>
                        <span className="text-slate-600">16-amino asitli bisiklik peptit yapısında, subkütan yeni nesil GHR antagonistidir.</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </div>

          {/* SAĞ KOLON - TUZAKLAR & ÖZEL DURUMLAR */}
          <div className="space-y-6">
            
            {/* Pasireotid & Diyabet (Genişletilmiş Mega Kart) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-red-100 relative overflow-hidden">
              {/* Arka plan deseni */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-red-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                    <Target size={22} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Diyabet Yönetimi (YDUS)</h3>
                </div>

                <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">

                  {/* Pasireotid ve SST5 Mekanizması */}
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-inner">
                    <h4 className="font-black text-rose-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={16}/> Pasireotid ve Hiperglisemi (%75 Risk)
                    </h4>
                    <p className="text-rose-900 font-medium mb-2">
                      Birinci kuşak analoglar (SST2) dengeli baskılarken, <strong>SST5 afinitesi yüksek</strong> Pasireotid güçlü diyabetojeniktir:
                    </p>
                    <ul className="space-y-1 text-rose-800 list-disc list-inside">
                      <li><strong>Doğrudan Etki:</strong> Beta hücrelerinde SST5 aktivasyonu ile endojen insülin sekresyonunu baskılar.</li>
                      <li><strong>İnkretin Kaybı (Temel Neden):</strong> K ve L hücrelerindeki SST5'e bağlanarak <strong>GIP ve GLP-1 salınımını dramatik düşürür.</strong></li>
                    </ul>
                  </div>

                  {/* Diğer Akromegali İlaçları */}
                  <div>
                    <h4 className="font-black text-blue-600 mb-1.5 flex items-center gap-2">
                      <Activity size={16}/> Diğer İlaçların Glukoz Etkisi
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        <span className="text-blue-500 mr-2">■</span>
                        <strong>Pegvisomant:</strong> Endojen glukoz üretimini ve lipolizi baskılayarak insülin duyarlılığını artırır. DM'si olan akromegali hastalarında glukoz metabolizmasında <em>en olumlu</em> etkiye sahip ajandır.
                      </li>
                      <li>
                        <span className="text-blue-500 mr-2">■</span>
                        <strong>Dopamin Agonistleri:</strong> İnsülin direncini kırarak glukoz toleransına pozitif katkı sağlar.
                      </li>
                    </ul>
                  </div>

                  {/* Farmakolojik Yönetim */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                      <Pill size={16}/> Farmakolojik Tedavi Basamakları
                    </h4>
                    <div className="space-y-3">
                      <p><strong>1. Basamak:</strong> İnsülin direncini kırmak için temel tercih <strong>Metformin</strong>'dir.</p>
                      <p>
                        <strong>2. Basamak (GLP-1 RA):</strong> Pasireotid kullananlarda asıl sorun inkretin eksikliği olduğu için, patofizyolojik olarak <strong>en rasyonel yaklaşım inkretin bazlı tedavilerdir</strong> (GLP-1 RA veya DPP-4 İnhibitörleri). İnsüline kıyasla çok daha üstün etkinlik gösterir.
                      </p>
                    </div>
                  </div>

                  {/* SGLT-2 Uyarısı */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 border-l-4 border-l-amber-500">
                    <h4 className="font-black text-amber-800 mb-1 flex items-center gap-2 uppercase tracking-widest text-[11px]">
                      <ShieldAlert size={14}/> Kritik YDUS Uyarısı: SGLT-2 İnhibitörleri
                    </h4>
                    <p className="text-amber-900 font-medium">
                      Aktif akromegali zaten bir DKA tetikleyicisidir. Pasireotid'in insülini baskılamasıyla oluşan "rölatif insülin eksikliği", SGLT-2 inhibitörleri ile birleştiğinde <strong>Diyabetik Ketoasidoz (DKA) riskini ciddi şekilde artırır!</strong> SGLT-2 inhibitörleri sadece biyokimyasal kontrolü sağlanan vakalara saklanmalıdır.
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* Gebelik (Genişletilmiş Mega Kart) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-pink-100 relative overflow-hidden">
              {/* Arka plan deseni */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-pink-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100 shadow-sm">
                    <Baby size={22} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Gebelik Yönetimi</h3>
                </div>

                <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">

                  {/* Fizyopatoloji */}
                  <div>
                    <h4 className="font-black text-pink-600 mb-1.5 flex items-center gap-2">
                      <Activity size={16}/> Fizyopatolojik Adaptasyon
                    </h4>
                    <p>
                      Artan yüksek östrojen karaciğerde <strong>GH direnci</strong> yaratır. Bu durum IGF-1'i düşürerek fetüsü yüksek maruziyetten korur ve sağlıklı gebeliğe olanak tanır.
                    </p>
                  </div>

                  {/* Kardiyometabolik Risk */}
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-inner">
                    <h4 className="font-black text-rose-800 mb-1.5 flex items-center gap-2">
                      <Heart size={16}/> Ana Risk: Kardiyometabolik
                    </h4>
                    <p className="text-rose-900 font-medium">
                      Tümör büyümesinden ziyade GDM ve Hipertansiyon riski (%50'ye kadar) öndedir. <strong>OGTT ile GDM taraması zorunludur.</strong> Konsepsiyon anındaki IGF-1 düzeyi komplikasyonlar için en iyi öngörücüdür.
                    </p>
                  </div>

                  {/* Takip Kuralı */}
                  <div>
                    <h4 className="font-black text-indigo-600 mb-1.5 flex items-center gap-2">
                      <Target size={16}/> Gebelikte Takip Dinamikleri
                    </h4>
                    <ul className="space-y-1.5 list-disc list-inside">
                      <li>Rutin GH ve IGF-1 ölçümü <strong>yapılmamalıdır</strong> (Plasental GH ile örtüşür, klinik değer taşımaz).</li>
                      <li>Makroadenomlarda her 4-6 haftada bir <strong>görme alanı</strong> muayenesi şarttır.</li>
                      <li>Görüntüleme sadece ciddi klinik şüphede yapılır, gadolinyumdan kaçınılır.</li>
                    </ul>
                  </div>

                  {/* Medikal Yönetim */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-black text-amber-800 mb-1.5 flex items-center gap-2">
                      <Pill size={16}/> Tıbbi Tedavi (Kes/Başla)
                    </h4>
                    <p className="text-amber-900">
                      Konsepsiyonda tüm ilaçlar kesilir. İlk trimester tesadüfi maruziyeti terminasyon endikasyonu <strong>değildir.</strong> Kitle etkisine bağlı semptomlarda tedaviye dönülür; en geniş güvenlik verisi <strong>Oktreotid</strong>'e aittir. Cerrahi çok nadiren (2. trimesterde) uygulanır.
                    </p>
                  </div>

                  {/* Postpartum */}
                  <div>
                    <h4 className="font-black text-emerald-600 mb-1.5 flex items-center gap-2">
                      <Info size={16}/> Postpartum & Laktasyon
                    </h4>
                    <p>
                      Östrojen baskısı kalkınca GH/IGF-1'de <strong>rebound yükselme</strong> görülür; erken dönemde MR çekilmelidir. Laktasyon güvenlidir. SSA kullanan anneler emzirebilir (bebek gelişimi normaldir), ancak <strong>Dopamin Agonistlerinin laktasyonu (sütü) durduracağı</strong> unutulmamalıdır!
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* Genetik Spotlar */}
            <section className="bg-indigo-900 rounded-3xl p-6 text-white">
              <h3 className="text-xs font-black text-indigo-300 uppercase mb-3 tracking-widest">Moleküler Spotlar</h3>
              <div className="space-y-3 text-[10px] opacity-90 leading-relaxed">
                <p>• <strong>miR-107:</strong> AIP&apos;yi baskılayarak tümörogenez yapar.</p>
                <p>• <strong>miR-185:</strong> SRL yanıtını etkileyen belirteçtir.</p>
                <p>• <strong>SST2 Düşüklüğü:</strong> MRG&apos;de T2 hiperintens (parlak) tümör demektir; dirençli seyreder.</p>
              </div>
            </section>

            {/* Prostat Hatırlatması */}
            <section className="bg-amber-100 rounded-3xl p-6 border border-amber-200">
              <h3 className="text-amber-800 font-black text-xs uppercase mb-2">Prostat Notu</h3>
              <p className="text-[10px] text-amber-900 leading-relaxed">
                Hipogonadizm olsa dahi GH etkisiyle BPH gelişir. Tedavi sonrası prostat hacmi <strong>küçülür.</strong>
              </p>
            </section>

          </div>
        </div>
{/* --- PRATİK MODÜLLER (FLASHCARD / İNCİLER / QUIZ) --- */}
        <section className="mt-10 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={24} className="text-amber-500" />
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Pratik Eğitim Modülleri</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Flashcard Kartı */}
            <Link href={`/${lang}/premium/ydus/hizli-tekrar?branch=endokrinoloji&id=akromegali`} className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-amber-500/50 hover:shadow-xl transition-all flex flex-col">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
              <h4 className="text-slate-800 font-black mb-2 uppercase tracking-tight text-lg italic">Hızlı Tekrar</h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1">79 soruluk Akromegali flaşkart setini çöz ve hafızana kazı.</p>
              <div className="flex items-center justify-between text-amber-600 font-black text-[10px] uppercase tracking-widest">
                Görevi Başlat <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* İnciler Kartı */}
            <Link href={`/${lang}/premium/ydus/inciler?branch=endokrinoloji&id=akromegali`} className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-500/50 hover:shadow-xl transition-all flex flex-col">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">💎</div>
              <h4 className="text-slate-800 font-black mb-2 uppercase tracking-tight text-lg italic">Klinik İnciler</h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1">Nokta atışı vaka şifreleri ve özel uzmanlık spotları.</p>
              <div className="flex items-center justify-between text-blue-600 font-black text-[10px] uppercase tracking-widest">
                İstihbaratı Oku <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Sınav Kartı */}
            <Link href={`/${lang}/premium/ydus/quiz-coz?branch=endokrinoloji&id=akromegali-quiz`} className="group bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-rose-500/50 transition-all relative overflow-hidden flex flex-col shadow-lg">
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest italic shadow-md">Board Tipi</div>
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📝</div>
              <h4 className="text-white font-black mb-2 uppercase tracking-tight text-lg italic">Mega Deneme</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-8 flex-1">YDUS formatında zorlayıcı vaka analizleri ve testler.</p>
              <div className="flex items-center justify-between text-rose-400 font-black text-[10px] uppercase tracking-widest">
                Sınava Gir <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>
        {/* ----------------------------------------------------- */}
        <div className="mt-8 bg-slate-100 rounded-2xl p-6 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            MediSea Premium içerik &bull; En güncel akromegali 
          </p>
        </div>

      </main>
    </div>
  );
}