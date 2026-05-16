// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\endokrinoloji\tiroid\tiroiditler\riedel-tiroiditi\page.tsx"
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, Activity, ShieldAlert, 
  Stethoscope, Microscope, Zap, Pill, Info, AlertTriangle, Fingerprint 
} from 'lucide-react';

export default function RiedelThyroiditisPage() {
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
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest shadow-sm">Kronik Sklerozan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase italic flex items-center gap-3">
               <Fingerprint size={40} className="text-slate-600" /> Riedel Tiroiditi
            </h1>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              "Demir sertliğinde guatr" (Struma Lignosa) kliniği; IgG4 ilişkili sistemik fibrozis süreci, histopatolojik ayırıcı tanı zorlukları ve tedavi yönetim algoritmaları.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>

        {/* 3. MAKALE İÇERİĞİ */}
        <div className="space-y-6">
          
          {/* Tanım ve Terminoloji */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-500 border border-slate-100">
                <Info size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Tanım, Terminoloji ve Epidemiyoloji</h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 space-y-4">
              <p>
                Riedel tiroiditi (RT), tiroid parankiminin ve çevre dokuların sınırları belirsiz, yoğun fibrozis ile yer değiştirmesiyle karakterize, oldukça nadir görülen kronik bir inflamatuvar hastalıktır. Tıbbi literatürde ilk olarak 1896&apos;da Bernhard Riedel tarafından tanımlanmış olup, klinik görünümünden dolayı <strong className="text-slate-800">Morbus Riedel, Riedel Struma, demir sertliğinde guatr (Eisenharte Struma) ve struma lignosa</strong> gibi isimlerle de anılmaktadır. 
              </p>
              <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-xl italic">
                <p>
                  Güncel tıbbi veriler ışığında, bu hastalığın tamamen tiroid bezine özgü lokal bir olay olmaktan ziyade, sistemik <strong className="text-slate-900">IgG4 ilişkili hastalıkların (IgG4-RSD)</strong> tiroidi tutan bir formu (IgG4-ilişkili sklerozan tiroidit) olduğu kabul edilmektedir.
                </p>
              </div>
              <p>
                Genel tiroid hastalıkları içerisinde insidansı en düşük olan (%0.06 - %0.3) tiroidit formudur. Nadir görülmesine rağmen genellikle 30 ila 60 yaş arasındaki yetişkinleri etkiler. Kadınlarda erkeklere oranla yaklaşık 3-4 kat daha sık saptanır.
              </p>
            </div>
          </section>

          {/* Etyopatogenez & Patoloji */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-teal-500" />
                <h3 className="text-lg font-black text-slate-800">Etyopatogenez</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm font-medium leading-relaxed text-slate-600 space-y-3">
                <p>
                  Hastalığın etyopatogenezinde otoimmün ve primer fibrojenik bir süreç rol almaktadır. B ve/veya T lenfositlerinden salgılanan sitokinlerin uyarısıyla fibroblastların ve fibroblast benzeri hücrelerin şiddetli proliferasyonu söz konusudur. Ayrıca lezyon alanlarında eozinofillerin degranülasyonu da progresif fibrozis oluşumuna katkıda bulunur.
                </p>
                <p>
                  RT hastalarının yaklaşık üçte birinde süreç tiroidle sınırlı kalmaz; eş zamanlı olarak <strong className="text-slate-800">retroperitoneal fibrozis, mediastinal fibrozis, sklerozan kolanjit, orbital psödotümör</strong> gibi multifokal sistemik fibrosklerozis (IgG4-RSD hedef organ) bulguları tabloya eşlik eder.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Microscope size={20} className="text-teal-500" />
                <h3 className="text-lg font-black text-slate-800">Patoloji ve Histopatoloji</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm font-medium leading-relaxed text-slate-600 space-y-3">
                <p>
                  Tanıdaki en büyük zorluk dokunun aşırı sert olması nedeniyle, İİAB&apos;nin çoğunlukla hücreden fakir ve tanısal olmayan (Bethesda I) materyal gelmesidir. Kesin tanı için <strong className="text-slate-800">kalın iğne (kor) veya açık insizyonel biyopsi</strong> gereklidir.
                </p>
                <p>
                  Histolojik incelemede tiroid foliküllerinin yerini yoğun ve sınırları belirsiz, <strong className="text-slate-800">hasır örgüsü benzeri (storiform) fibrozis</strong> almıştır. Fibrozise lenfosit ve bol plazma hücresi infiltrasyonu eşlik eder. 
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mt-2">
                  <p className="text-amber-800 text-xs sm:text-sm font-bold m-0">
                    YDUS İNCİSİ: Tipik IgG4-RSD bulgusu olan damar tıkanıklığı yaratan iltihap, yani <span className="underline">obliteratif flebit (anjiyit)</span> karakteristiktir. Tanı, &gt;80 IgG4(+) plazma hücresi/mm² görülmesi ve IgG4/IgG oranının &gt;%40 olması ile doğrulanır. Granülom veya dev hücre (Subakut Tiroidit aksine) İZLENMEZ.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Klinik Bulgular ve Seyir */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-500 border border-slate-100">
                <Stethoscope size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Klinik Bulgular ve Komplikasyonlar</h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 mb-6">
              <p>
                Hastalar kliniğe sıklıkla boynun orta hattında <strong className="text-slate-900">ağrısız, asimetrik, &quot;taş veya demir gibi sert&quot;</strong> ve yutkunmakla hareket etmeyen (çevre dokulara fikse) bir guatr ile başvururlar.
              </p>
              <p>
                Fibrotik sürecin tiroid kapsülünü aşıp çevre kas, damar ve sinir yapılarına yayılması (ekstratiroidal invazyon) en tipik klinik bulgusudur. Bu yoğun dışa taşan fibrozis ve bası nedeniyle hastalarda <strong className="text-rose-600">ciddi dispne, disfaji, seste kalınlaşma, stridor ve boğulma hissi</strong> ortaya çıkar.
              </p>
            </div>

            <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-100 shadow-sm">
              <h3 className="text-rose-700 font-bold text-sm mb-2 flex items-center gap-2">
                <ShieldAlert size={16} /> İnvazyon Komplikasyonları
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 font-medium">
                <li>Trakeal ve özofageal bası.</li>
                <li>Reküren laringeal sinir tutulumuyla <strong className="text-slate-900">ses teli felci</strong>.</li>
                <li>Sempatik zincir tutulumuyla <strong className="text-slate-900">Horner sendromu</strong>.</li>
                <li>Paratiroid bezlerinin sklerozisi sonucu nadiren <strong className="text-slate-900">hipoparatiroidi (hipokalsemi)</strong>.</li>
              </ul>
            </div>
          </section>

          {/* Laboratuvar ve Görüntüleme */}
          <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 text-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 border border-slate-700 shadow-inner">
                <Zap size={20} />
              </div>
              <h2 className="text-xl font-black text-white">Laboratuvar ve Görüntüleme Bulguları</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-teal-400 font-bold text-sm uppercase tracking-widest mb-2">Laboratuvar</h3>
                  <ul className="space-y-2 text-sm text-slate-300 font-medium">
                    <li><strong className="text-white">Tiroid Fonksiyonları:</strong> Başvuru anında hastaların çoğu ötiroiddir; ancak fonksiyonel tiroid dokusunun fibrozisle tamamen yıkıldığı olguların yaklaşık üçte birinde hipotiroidi gelişir.</li>
                    <li><strong className="text-white">İmmün Markerlar:</strong> Çoğunda (%67) Anti-TPO pozitiftir, ancak titreleri Hashimoto&apos;dan düşüktür.</li>
                    <li><strong className="text-white">IgG4 ve Akut Faz:</strong> Serum <strong className="text-rose-400">IgG4 seviyeleri artmış (&gt;135 mg/dL)</strong> olabilir, ancak tek başına spesifik değildir. ESR ve CRP&apos;de hafif artış olabilir, belirgin lökositoz beklenmez.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-teal-400 font-bold text-sm uppercase tracking-widest mb-2">Görüntüleme Yöntemleri</h3>
                  <ul className="space-y-2 text-sm text-slate-300 font-medium">
                    <li><strong className="text-white">USG ve Elastografi:</strong> Düzensiz sınırlı ve kaba hipoekoiktir. Fibröz septasyonlar yalancı nodül görünümü yaratır. Elastografik olarak son derece sert bir kitle imajı verir. Renkli Doppler&apos;de kanlanma saptanmaz (avasküler).</li>
                    <li><strong className="text-white">BT ve MRG:</strong> Fibrozisin çevre organlarla olan ilişkisini, özellikle trakea basısını ve karotis arteri sarma durumunu (encasement) preoperatif göstermek için tercih edilir.</li>
                    <li><strong className="text-white">Sintigrafi ve PET:</strong> Sintigrafide soğuk alan olarak izlenir. Aktif inflamasyon sürecinde 18F-FDG PET&apos;te tiroid lojunda yoğun madde tutulumu izlenebilir.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Ayırıcı Tanı */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Ayırıcı Tanı</h2>
            </div>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-600 mb-4">
              Riedel tiroiditinin en önemli ayırıcı tanısı, <strong className="text-slate-900">ileri yaşta hızla büyüyen, son derece sert, ağrısız, asimetrik ve çevre dokulara fikse kitle</strong> prezentasyonu nedeniyle malignitelerdir:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Anaplastik Tiroid Kanseri" },
                { title: "Primer Tiroid Lenfoması" },
                { title: "Tiroid Sarkomları" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-100 rounded-lg bg-slate-50 text-center">
                  <strong className="text-rose-600 text-sm block">{item.title}</strong>
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-slate-500 mt-4 text-center">
              Bu tabloları ekarte etmek ve RT tanısını doğrulamak için mutlaka yeterli doku örneği (açık biyopsi) şarttır.
            </p>
          </section>

          {/* Yönetim ve Tedavi */}
          <section className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm">
                <Pill size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Yönetim ve Tedavi</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">İlk Yaklaşım Medikaldir</p>
              </div>
            </div>
            
            <p className="text-sm font-medium text-slate-700 mb-6">
              Tedavide ilk yaklaşım cerrahi değil, medikaldir. Spesifik küratif bir tedavisi yoktur, hastalık nadir görüldüğünden standartlaşmış kılavuzları bulunmamaktadır.
            </p>

            <div className="space-y-4">
              <div className="bg-white/80 p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-800 font-bold text-sm mb-2">1. Medikal Tedaviler</h3>
                <ul className="list-disc pl-5 space-y-3 text-sm text-slate-600 font-medium">
                  <li>
                    <strong className="text-slate-800">Glikokortikoidler:</strong> Sistemik hastalığın ilk aşaması olan hücresel inflamasyon fazında başlanılan oral kortikosteroidler (ör: 100 mg/gün prednizolon), birinci basamak tedavidir. Erken evrelerde tümör boyutunu ve bası semptomlarını dramatik şekilde azaltabilir. Ancak fibrozisin ön planda olduğu geç evrelerde yanıt düşüktür.
                  </li>
                  <li>
                    <strong className="text-slate-800">Tamoksifen:</strong> Steroid tedavisine yanıt alınamayan, kontrendike olduğu veya hastalığın inaktif fibrotik faza girdiği vakalarda kullanılan ve fibroblast üremesini inhibe eden (TGF-beta üzerinden) bir ajandır.
                  </li>
                  <li>
                    <strong className="text-slate-800">İmmünomodülatör Ajanlar:</strong> Klasik tedaviye dirençli vakalarda IgG4 mekanizmaları hedeflenerek mikofenolat mofetil, azatioprin ve rituksimab gibi ilaçlar kullanılmaktadır.
                  </li>
                </ul>
              </div>

              <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-100 shadow-sm">
                <h3 className="text-rose-700 font-bold text-sm mb-2 flex items-center gap-2">
                  <ShieldAlert size={16} /> 2. Cerrahi Tedavi
                </h3>
                <p className="text-sm text-slate-700 font-medium mb-2">
                  Normal cerrahi planların fibrozise bağlı olarak kaybolması ve çevre damar-sinir ağına yapışıklık nedeniyle, RT vakalarında <strong className="text-rose-600">total tiroidektomi girişimi son derece risklidir</strong> (artan kalıcı reküren sinir hasarı ve hipoparatiroidi tehlikesi).
                </p>
                <p className="text-sm text-slate-700 font-medium">
                  Cerrahi ancak teşhis için yeterli açık biyopsi almak veya ciddi trakeal bası obstrüksiyonunu gidermek maksadıyla uygulanan <strong className="text-slate-900">kama ismusektomi (dekompresyon ismusektomisi)</strong> operasyonları ile sınırlı kalmalıdır.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-800 font-bold text-sm mb-2">3. Yerine Koyma Tedavileri</h3>
                <p className="text-sm text-slate-600 font-medium">
                  Tiroid fonksiyon yetmezliği varlığında ömür boyu Levotiroksin (LT4); paratiroid bezlerinde hasar varlığında ise vitamin D ve kalsiyum replasmanı yapılmalıdır. Ayrıca hiperkalsemi görülmez. Hastalar sistemik fibrozisin tespiti için periyodik kontrollere çağrılmalıdır.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}