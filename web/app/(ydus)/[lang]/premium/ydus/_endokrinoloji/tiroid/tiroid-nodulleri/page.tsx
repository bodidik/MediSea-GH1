// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\endokrinoloji\tiroid\tiroid-nodulleri\page.tsx"
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, ScanSearch, Info, Stethoscope, 
  Syringe, Dna, Bot, Activity, ShieldAlert, CheckCircle2, Baby 
} from 'lucide-react';

export default function NoduleArticlePage() {
  const params = useParams();
  const lang = params?.lang || 'tr';

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-8 px-4 sm:px-6 font-sans text-slate-800 relative">
      
      {/* 1. ÜST NAVİGASYON (Geri Dönüş) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href={`/${lang}/premium/ydus/endokrinoloji/tiroid`}
          className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft size={18} />
          </div>
          Tiroid İndeksine Dön
        </Link>
      </div>

      <main className="max-w-4xl mx-auto">
        
        {/* 2. HEADER KARTI */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-8 border border-indigo-100 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-widest shadow-sm">Bölüm 12</span>
              <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest shadow-sm">TEMD & Williams Derlemesi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase italic flex items-center gap-3">
               <ScanSearch size={40} className="text-indigo-500" /> Tiroid Nodüllerine Yaklaşım
            </h1>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              Etyoloji, USG risk sınıflandırması, Bethesda sitolojisi, gebelikte yönetim ve güncel TEMD takip algoritmaları üzerine kapsamlı klinik istihbarat dosyası.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        </div>

        {/* 3. MAKALE İÇERİĞİ */}
        <div className="space-y-6">
          
          {/* Etyoloji ve İnsidans */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100">
                <Info size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Etyoloji ve İnsidans</h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 space-y-4">
              <p>
                Tiroid nodülü, tiroid bezinde yer kaplayan, çevresindeki normal tiroid dokusundan kıvam olarak farklı, tiroid parankiminden ultrasonografi (US) gibi görüntüleme yöntemleri ile ayırt edilebilen ayrık lezyonlardır. 
                Etyolojisinde <strong className="text-slate-800">benign nodüler guatr, basit veya hemorajik kistler, foliküler adenom, fokal tiroidit alanları, primer tiroid kanserleri</strong> (papiller, foliküler, medüller, anaplastik), primer tiroid lenfoması ve metastatik tümörler (renal hücreli karsinom, meme, akciğer vb.) yer alabilmektedir.
              </p>
              <p>
                Tiroid nodül insidansı palpasyon tekniği kullanılarak %4-7 arasında iken, görüntüleme yöntemleri ile bu oran 10 katına ulaşmaktadır. Otopsi serilerine göre erişkin çağda %50-60 oranında tiroid nodülü bulunmaktadır. Kadınlarda erkeklere göre daha sık görülmekte olup (4:1), yaşla birlikte (özellikle 40 yaş sonrası) prevalans her iki cinsiyet için de artmaktadır. Ülkemizde US değerlendirmesiyle 18-65 yaş arasında prevalans %23,5 iken, 65 yaşın üzerinde bu sıklık %37 olarak bildirilmiştir.
              </p>
            </div>
          </section>

          {/* Klinik Değerlendirme ve Tanı */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100">
                <Stethoscope size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Klinik Değerlendirme ve Tanı</h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 space-y-4">
              <p>
                Tiroid nodülü tespit edildiğinde ilk basamakta detaylı hikaye almak önem taşır. Hastanın yaşı, komorbiditeleri, nodülün seyri, hipotiroidi veya hipertiroidi semptomları, hızlı büyüme öyküsü ve bası bulguları (<strong className="text-slate-800">disfaji, disfoni, dispne, ses kısıklığı ve öksürük</strong>) sorgulanmalıdır. Ayrıca hastanın baş-boyun bölgesine aldığı radyasyon öyküsü veya ailesel tiroid kanseri geçmişi mutlaka araştırılmalıdır.
              </p>
              <div className="bg-indigo-50/50 border-l-4 border-indigo-400 p-4 rounded-r-xl italic">
                <p>
                  Laboratuvar tetkiklerinde tiroid disfonksiyonunu değerlendirmek amacıyla <strong className="text-indigo-900">ilk bakılacak test TSH ölçümü olmalıdır</strong>. Tiroglobulin (Tg) düzeyi nodül değerlendirmesinde tümör belirteci olarak kullanılmamalıdır. Kalsitonin (KT) ölçümünün rutinde yeri olmamakla birlikte, şüpheli biyopsilerde, tekrarlayan yetersiz biyopsilerde ve medüller tiroid kanseri (MTK) şüphesinde bakılması önerilir.
                </p>
              </div>
            </div>
          </section>

          {/* Radyolojik Değerlendirme */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100">
                <ScanSearch size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Radyolojik Değerlendirme (Ultrasonografi)</h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 space-y-4">
              <p>
                Radyolojik değerlendirmede ilk basamak tiroid US’dir. Nodül varlığında, tiroid ile birlikte anterior ve lateral kompartmanlar da US ile değerlendirilmelidir. 
              </p>
              
              <div className="my-6 flex justify-center text-center italic text-sm text-slate-400 border border-dashed border-slate-200 p-4 rounded-xl">
                
              </div>

              <p>
                Malignite ile uyumlu olan riskli USG bulguları şunlardır: <strong className="text-rose-600">hipoekojenite, infiltratif, düzensiz veya lobule kontürlü kenarlar, intranodüler mikrokalsifikasyonlar ve uzunluğun genişliğinden fazla olmasıdır (taller-than-wide).</strong> Nodüller US özelliklerine göre Tiroid Görüntüleme ve Raporlama Veri Sistemleri'ne (TIRADS) göre risk sınıflandırmasına tabi tutulmalıdır.
              </p>
            </div>
          </section>

          {/* TİİAB ve Bethesda */}
          <section className="bg-indigo-900 rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-800 text-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-800 flex items-center justify-center text-indigo-300 border border-indigo-700 shadow-inner">
                <Syringe size={20} />
              </div>
              <h2 className="text-xl font-black text-white">TİİAB ve Bethesda Sınıflandırması</h2>
            </div>
            
            <p className="text-sm sm:text-base font-medium leading-relaxed mb-6">
              TİİAB, tiroid nodüllerinin benign-malign ayrımında <strong className="text-white">altın standart testtir</strong>. Biyopsi kararı EU-TIRADS skorlamasına ve nodül boyutuna göre verilmesi önerilir. 
              <br/><br/>
              <strong className="text-indigo-300">EU-TIRADS 3 (düşük risk) &gt;20 mm, EU-TIRADS 4 (orta risk) &gt;15 mm ve EU-TIRADS 5 (yüksek risk) nodüllerde &gt;10 mm</strong> olduğunda TİİAB yapılmalıdır. Sitolojik inceleme sonuçları Bethesda sınıflandırma sistemine göre değerlendirilir:
            </p>

            <div className="my-6 flex justify-center text-center italic text-xs text-indigo-300/60 border border-dashed border-indigo-700/50 p-4 rounded-xl">
              
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { cat: "Kategori I", title: "Yetersiz tanı", desc: "Biyopsi tekrarı gerektirir." },
                { cat: "Kategori II", title: "Benign", desc: "Görüntüleme ile takip önerilir." },
                { cat: "Kategori III", title: "Önemi belirsiz atipi", desc: "Biyopsi tekrarı, moleküler analiz, lobektomi veya takip." },
                { cat: "Kategori IV", title: "Foliküler neoplazi", desc: "Moleküler analiz veya lobektomi." },
                { cat: "Kategori V", title: "Malignite şüphesi", desc: "Moleküler analiz, lobektomi veya tiroidektomi." },
                { cat: "Kategori VI", title: "Malign", desc: "Lobektomi veya total tiroidektomi gerektirir." },
              ].map((item, idx) => (
                <div key={idx} className="bg-indigo-950/50 p-4 rounded-xl border border-indigo-800/50">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.cat}</div>
                  <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                  <div className="text-xs text-indigo-200/80">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* İleri Gör. - Moleküler - Yapay Zeka */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <ScanSearch size={18} className="text-indigo-500" />
                <h3 className="font-black text-slate-800">İleri Görüntüleme</h3>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                BT ve MRG rutin değildir. Ancak substernal/retrosternal uzanımı olan nodüllerde trakeal veya özofagial basıyı değerlendirmek için kullanılır. İnsidental olarak <strong className="text-slate-800">18-FDG PET</strong> görüntülemelerinde fokal tutulum saptandığında USG ile değerlendirilmeli ve biyopsi yapılmalıdır.
              </p>
            </section>
            
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Dna size={18} className="text-indigo-500" />
                <h3 className="font-black text-slate-800">Moleküler Testler</h3>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                Sitolojik olarak indetermine nodüllerde (Bethesda 3 ve 4) <strong className="text-slate-800">BRAF, RAS mutasyonları, RET/PTC ve PAX8/PPARG</strong> re-aranjmanları gibi genetik belirteçlerin araştırılması gereksiz tanısal cerrahileri önlemek bakımından yardımcı olabilir.
              </p>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Bot size={18} className="text-indigo-500" />
                <h3 className="font-black text-slate-800">Yapay Zeka (AI)</h3>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                Yapay zeka uygulamaları bilgisayar sistemleri tarafından insana ait öğrenme ve problem çözme yeteneğine dayanır. Riskli sonografik özelliklere sahip görüntülerin tanımlanmasıyla malign nodüllerin benign olanlardan ayrımı öngörülebilir.
              </p>
            </section>
          </div>

          {/* Tiroid Nodül Takibi */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100">
                <Activity size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Tiroid Nodül Takibi</h2>
            </div>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-600">
              Nodüllerin sitolojik tanıları temel alınarak yapılacak takip planları belirlenmelidir. Benign sitolojide, asemptomatik ise 12-24 ay aralıklarla US ile takip edilebilir. Nodül boyut artışı, <strong className="text-slate-800">en az 2 boyutta ve en az 2 mm olmak üzere, büyüme veya volümde %50’den fazla artış</strong> şeklinde tanımlanmalıdır. Semptomatik hale gelen, büyüme gösteren veya şüpheli US özellikleri geliştiren nodüllerde re-biyopsi düşünülebilir. 4 cm üzeri büyük nodüllerde neoplastik ihtimal arttığı için cerrahi veya termal ablasyon planlanabilir.
            </p>
          </section>

          {/* Gebelikte Tiroid Nodülleri */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                <Baby size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Gebelikte Tiroid Nodülleri</h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600">
              <p>
                Gebelikte tiroid nodüllerine yaklaşım gebe olmayanlar gibidir; ancak <strong className="text-rose-600">radyonüklid tanı ve tedavi yöntemlerinden kaçınmak gereklidir</strong>. Biyopsi endikasyonu varsa fetüsün gestasyonel haftasından bağımsız olarak işlem için kontrendikasyon bulunmamaktadır. İndetermine sitoloji sonuçlarında US takibe devam edilmesi ve cerrahi kararının doğum sonrasına kaydırılması önerilir.
              </p>
            </div>
          </section>

          {/* TEMD ÖNERİLERİ */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-200/60 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">TEMD Önerileri</h2>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Klinik Özet ve Kılavuz</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "Tiroid nodülü olan hastada detaylı tıbbi öykü (radyasyon öyküsü, ailede kanser öyküsü, ilaç/iyot kullanımı vb.) alınmalıdır.",
                "Fizik muayenede nodülün boyutu, sertliği ve lenf nodu durumu mutlaka değerlendirilmelidir.",
                "Nodül değerlendirmesindeki ilk laboratuvar tetkiki tiroid disfonksiyonunu değerlendirmek amacıyla TSH ölçümüdür.",
                "İnsidentalomalar ve palpabl tiroid nodüllerinin değerlendirmesinde tiroid ultrasonu (US) ilk basamak tetkiktir; rutin tarama amaçlı US önerilmez.",
                "TİİAB kararı US risk sınıflandırma sistemlerine (RSS) göre verilmelidir."
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium leading-relaxed text-slate-700">{text}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </main>
    </div>
  );
}