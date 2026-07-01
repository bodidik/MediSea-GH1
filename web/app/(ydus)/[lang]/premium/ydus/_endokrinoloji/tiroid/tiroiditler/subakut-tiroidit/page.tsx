// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\endokrinoloji\tiroid\tiroiditler\subakut-tiroidit\page.tsx"
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, Activity, Flame, ShieldAlert, 
  Stethoscope, Microscope, Zap, Pill, Info, AlertTriangle, Syringe
} from 'lucide-react';

export default function SubacuteThyroiditisPage() {
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
              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full border border-rose-200 uppercase tracking-widest shadow-sm">De Quervain</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase italic flex items-center gap-3">
               <Flame size={40} className="text-rose-500" /> Subakut Granülomatöz Tiroidit
            </h1>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              Ağrılı tiroidit (De Quervain) kliniği; post-viral etyopatogenez, karakteristik 4 fazlı seyir, laboratuvar/USG bulguları ve tedavi yönetim algoritmaları.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-rose-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
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
                Subakut tiroidit, tiroid bezinin inflamasyonu ile karakterize, ağrılı, kendi kendini sınırlayan geçici bir hastalığıdır. Tıbbi literatürde bu tablo için <strong className="text-slate-800">subakut granülomatöz tiroidit, dev hücreli tiroidit, ağrılı tiroidit, subakut nonsüpüratif tiroidit ve De Quervain tiroiditi</strong> isimlendirmeleri de eş anlamlı olarak kullanılmaktadır.
              </p>
              <p>
                Genel hipertiroidi nedenleri arasında nispeten nadir görülen bir tablodur. Kadınlarda erkeklere oranla 3 ila 5 kat daha sık ortaya çıkar. İnsidansı 12.1/100.000/yıl olup, en sık genç erişkinlik ve orta yaş grubunda saptanır.
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
                  Hastalığın temelinde viral enfeksiyonlar ve postviral inflamatuvar immün yanıt yatmaktadır. Vakaların büyük kısmında, bulguların başlamasından 2-8 hafta önce geçirilmiş bir <strong className="text-slate-800">üst solunum yolu enfeksiyonu (ÜSYE)</strong> öyküsü bulunur. Suçlanan virüsler: Coxsackievirus, kabakulak, kızamık, adenovirüs ve SARS-CoV-2'dir.
                </p>
                <p>
                  Tiroid otoimmünitesinin birincil rolü yoktur; ancak genetik zemin olarak <strong className="text-rose-600">HLA-B35 ile güçlü ilişkisi</strong> vardır. Viral antijenin HLA-B35'e bağlanarak sitotoksik T lenfositleri aktive ettiği ve çapraz reaksiyonla tiroid foliküllerine saldırdığı öngörülmektedir.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Microscope size={20} className="text-teal-500" />
                <h3 className="text-lg font-black text-slate-800">Patoloji</h3>
              </div>
              <div className="prose prose-slate max-w-none text-sm font-medium leading-relaxed text-slate-600 space-y-3">
                <p>
                  İİAB veya doku örneklemesinde tiroid foliküllerinin destrüksiyonu, lenfosit/nötrofil infiltrasyonu ve makrofaj birikimi görülür.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mt-2">
                  <p className="text-amber-800 text-xs sm:text-sm font-bold m-0">
                    YDUS İNCİSİ: En kritik patognomonik özellik histolojide <span className="underline">multinükleer dev hücrelerin ve granülomların</span> varlığıdır. 
                  </p>
                </div>
                <p>
                  İnflamasyon yatıştıktan sonra gland histolojisi tamamen normale döner.
                </p>
              </div>
            </section>
          </div>

          {/* Klinik Bulgular ve Seyir */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-500 border border-slate-100">
                <Stethoscope size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Klinik Bulgular ve 4 Klasik Faz</h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-sm sm:text-base font-medium leading-relaxed text-slate-600 mb-6">
              <p>
                En karakteristik klinik bulgu, boyunda tiroid loju üzerinde <strong className="text-rose-600">şiddetli ağrı ve hassasiyetin</strong> gelişmesidir. Ağrı yutkunma, baş hareketleri veya öksürme ile artar; kulaklara, çeneye, boğaza ve üst göğse yayılım gösterebilir. Ağrıya ateş (37.5-38.5 ºC), yorgunluk, miyalji ve iştahsızlık eşlik eder.
              </p>
              <p>
                Fizik muayenede tiroid bezi hafif-orta derecede büyümüştür ve palpasyonla <strong className="text-slate-800">son derece sert ve duyarlıdır</strong>. İnflamasyon başlangıçta tek bir lobu tutup günler-haftalar içinde diğer loba göç edebilir ki buna klinikte <strong className="italic text-teal-700">"creeping tiroidit" (sürünen tiroidit)</strong> adı verilir.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: "1. Tirotoksikoz Fazı (2-8 Hafta)", desc: "Yıkıma uğrayan tiroid foliküllerinden dolaşıma bol miktarda depolanmış tiroglobulin, T3 ve T4 dökülmesi sonucu ortaya çıkan 'destrüktif tirotoksikoz' evresidir.", color: "text-rose-600", bg: "bg-rose-50" },
                { title: "2. Ötiroidi Fazı (1-3 Hafta)", desc: "Depoların tükenmesi ve geçici bir denge kurulması dönemidir.", color: "text-teal-600", bg: "bg-teal-50" },
                { title: "3. Hipotiroidi Fazı (2-8 Hafta)", desc: "Hasarlı dokunun yeni hormon sentezleyememesi ve önceki TSH baskılanması nedeniyle %25 hastada geçici hipotiroidi gelişir.", color: "text-blue-600", bg: "bg-blue-50" },
                { title: "4. İyileşme Fazı", desc: "Dokunun kendini rejenere etmesi ile kalıcı ötiroidi sağlanır. %10-15'inde kalıcı hipotiroidi bildirilmiştir. Relaps ihtimali nadirdir (%1.6-4).", color: "text-emerald-600", bg: "bg-emerald-50" }
              ].map((faz, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-slate-100/50 ${faz.bg}`}>
                  <div className={`text-sm font-black mb-1 ${faz.color}`}>{faz.title}</div>
                  <div className="text-sm text-slate-700 font-medium">{faz.desc}</div>
                </div>
              ))}
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
                    <li>
                      <strong className="text-white">ESR ve CRP:</strong> Akut faz reaktantlarında belirgin yükseklik (ESR {'>'} 50-100 mm/saat) en spesifik ipucudur.
                    </li>
                    <li>
                      <strong className="text-white">TFT:</strong> T3/T4 oranı {'<'} 20&apos;dir (Graves&apos;in aksine destrüksiyonu kanıtlar).
                    </li>
                    <li>
                      <strong className="text-white">Diğer:</strong> Tiroglobulin yüksek, otoantikorlar negatiftir.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h3 className="text-teal-400 font-bold text-sm uppercase tracking-widest mb-2">Görüntüleme</h3>
                <ul className="space-y-2 text-sm text-slate-300 font-medium">
                  <li>
                    <strong className="text-white">RAIU (Uptake):</strong> Belirgin düşük veya sıfıra yakındır ({'<'} %2).
                  </li>
                  <li>
                    <strong className="text-white">USG:</strong> Hipoekoik bulutsu alanlar ve azalmış vaskülarite izlenir.
                  </li>
                </ul>
              </div>
            </div> 
          </section>

         {/* 5. AYIRICI TANI */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                <ShieldAlert size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic">Ayırıcı Tanı</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Akut Süpüratif Tiroidit", desc: "Apseli kitle, yüksek ateş ve lökositoz. TFT normaldir." },
                { title: "Nodül İçi Kanama", desc: "Ani ağrı yapar ama ateş veya tirotoksikoz yapmaz." },
                { title: "Graves Hastalığı", desc: "Ağrı yoktur. RAIU (Uptake) yüksektir." },
                { title: "Malignite", desc: "Hızlı büyüme ve ağrı ile SAT'ı taklit edebilir." }
              ].map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-100 rounded-lg bg-slate-50 font-medium">
                  <strong className="text-slate-800 text-sm block mb-1">{item.title}</strong>
                  <span className="text-slate-600 text-xs">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Yönetim ve Tedavi */}
          <section className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-200/60 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 border border-teal-200">
                <Pill size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Yönetim ve Tedavi</h2>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Sekelsiz ve Kendini Sınırlayan Süreç</p>
              </div>
            </div>
            
            <p className="text-sm font-medium text-slate-700 mb-6">
              Subakut tiroidit temelde sekelsiz kendi kendini sınırlayan bir süreç olduğundan tedavi <strong className="text-slate-900">tamamen semptomatiktir</strong>. Süreci hızlandıran primer antiviral ya da spesifik küratif tedavi yoktur.
            </p>

            <div className="space-y-4">
              <div className="bg-white/80 p-4 rounded-xl border border-teal-100 shadow-sm">
                <h3 className="text-teal-700 font-bold text-sm mb-2">1. Ağrı ve İnflamasyon Kontrolü</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 font-medium">
                  <li>Hafif/orta şiddette ağrılarda, <strong className="text-slate-800">NSAİİ</strong> (örn: ibuprofen 1200-3200 mg/gün veya naproksen) ve istirahat tercih edilir.</li>
                  <li>Şiddetli ağrılarda veya 2-3 günlük NSAİİ tedavisine yanıt alınamayan olgularda <strong className="text-slate-800">Glikokortikoidler (Oral prednizolon, 40 mg/gün)</strong> başlanır. Steroid tedavisine başlandıktan sonra 1-2 gün içinde dramatik ve hızlı bir analjezik etki görülür (<em className="text-rose-600">hızlı klinik yanıt alınmazsa SAT tanısı sorgulanmalıdır</em>).</li>
                  <li>Steroid 6-8 haftalık sürede kademeli azaltılarak (tapering) kesilir. Hastaların %20'sinde steroide bağlı geçici nüks veya tedavi bağımlılığı saptanabilir.</li>
                </ul>
              </div>

              <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-100 shadow-sm">
                <h3 className="text-rose-700 font-bold text-sm mb-2 flex items-center gap-2">
                  <ShieldAlert size={16} /> 2. Tirotoksikozun Tedavisi
                </h3>
                <p className="text-sm text-slate-700 font-medium mb-2">
                  Taşikardi, tremor, anksiyete gibi adrenerjik semptomları yatıştırmak için kardiyoselektif olmayan <strong className="text-slate-900">Beta-Blokerler</strong> (propranolol veya atenolol) kullanılmalıdır.
                </p>
                <div className="bg-rose-100/50 border-l-4 border-rose-500 p-3 rounded-r-lg text-rose-900 text-xs sm:text-sm font-bold">
                  DİKKAT: SAT'ta tirotoksikoz sentez artışına değil, yıkıma bağlı hormon deşarjına sekonderdir. Bu nedenle hormon sentezini durduran Antitiroid İlaçlar (propiltiyourasil, metimazol) ve Radyoaktif İyot tedavisi KESİNLİKLE KONTRENDİKEDİR.
                </div>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-teal-100 shadow-sm">
                <h3 className="text-teal-700 font-bold text-sm mb-2">3. Hipotiroidi Tedavisi</h3>
                <p className="text-sm text-slate-600 font-medium">
                  Çoğu hipotiroidi atağı subklinik ve geçicidir, izlem yeterlidir. Ancak <strong className="text-slate-800">TSH &gt;10 mU/L ise</strong> veya hasta ileri derecede semptomatikse kısa süreli (6-8 haftalık) Levotiroksin (LT4) replasmanı yapılabilir. 6-8 hafta sonra ilaç kesilerek doku iyileşmesi re-evalüe edilmelidir.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}