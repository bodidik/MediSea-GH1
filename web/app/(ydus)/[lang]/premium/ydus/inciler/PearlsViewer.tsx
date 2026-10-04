'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { kalinHtml } from '@/app/lib/metin';
import { aramaEslesir } from '@/app/lib/arama';

// --- TİP TANIMLAMALARI ---
type Pearl = {
  id: string;
  level: string;
  title: string;
  content: string;
  trigger: string;
};

type PearlsData = {
  id: string;
  topic: string;
  pearls: Pearl[];
};

export default function PearlsViewer({ data, konuHref, quizHref, quizSoru }: { data: PearlsData; konuHref: string; quizHref?: string | null; quizSoru?: number }) {
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Arama örneği SETİN KENDİ etiketlerinden — sabit yazılıydı ("Acil, ATRA,
   * Diferansiyasyon") ve 20 setin çoğunda hiçbir inciyi bulmuyordu (ATRA
   * yalnızca AML'de geçer). İlk iki farklı etiket, kısa olanlar.
   */
  const aramaOrnegi = useMemo(() => {
    const gorulen = new Set<string>();
    for (const p of data.pearls) {
      const t = (p.trigger || '').trim();
      if (t && t.length <= 24 && !gorulen.has(t)) gorulen.add(t);
      if (gorulen.size === 2) break;
    }
    return [...gorulen].join(', ');
  }, [data.pearls]);

  // 100k Trafik Optimizasyonu: Canlı Arama Filtresi (useMemo ile zırhlandı)
  // Bu sayede kullanıcı her harf yazdığında tüm listeyi baştan hesaplamak yerine,
  // sadece arama terimi değiştiğinde filtreleme yapar. Telefon işlemcilerini yormaz.
  const filteredPearls = useMemo(() => {
    // Türkçe-duyarlı eşleşme (app/lib/arama.ts). `toLowerCase()` Türkçe
    // klavyeden gelen "İ" harfini bozuyordu: "İnsülin" araması hiçbir sonuç
    // vermiyordu. Boş arama tüm listeyi döndürmeli, o yüzden erken çıkış var.
    if (!searchTerm.trim()) return data.pearls;
    return data.pearls.filter(pearl =>
      aramaEslesir(pearl.title, searchTerm) ||
      aramaEslesir(pearl.content, searchTerm) ||
      aramaEslesir(pearl.trigger, searchTerm) ||
      aramaEslesir(pearl.level, searchTerm)
    );
  }, [searchTerm, data.pearls]);

  // Kategoriye Göre Güvenli Tailwind Renk Objesi (Replace Hack'i kaldırıldı)
  const getThemeByLevel = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('acil') || l.includes('hayat')) {
      return { border: 'border-rose-500', bg: 'bg-rose-900/10', text: 'text-rose-400', badgeBorder: 'border-rose-500/30', badgeBg: 'bg-rose-500/10' };
    }
    if (l.includes('kılavuz') || l.includes('prognostik')) {
      return { border: 'border-blue-500', bg: 'bg-blue-900/10', text: 'text-blue-400', badgeBorder: 'border-blue-500/30', badgeBg: 'bg-blue-500/10' };
    }
    if (l.includes('farmakoloji') || l.includes('tedavi')) {
      return { border: 'border-purple-500', bg: 'bg-purple-900/10', text: 'text-purple-400', badgeBorder: 'border-purple-500/30', badgeBg: 'bg-purple-500/10' };
    }
    if (l.includes('hardcore') || l.includes('expert')) {
      return { border: 'border-slate-500', bg: 'bg-slate-800/30', text: 'text-slate-200', badgeBorder: 'border-slate-500/30', badgeBg: 'bg-slate-700/50' };
    }
    // Default (Sarı/Uyarı)
    return { border: 'border-amber-500', bg: 'bg-amber-900/10', text: 'text-amber-400', badgeBorder: 'border-amber-500/30', badgeBg: 'bg-amber-500/10' };
  };

  return (
    // koyu-yuzey: yüzey baştan sona koyu; global ikincil-metin koyulaştırması
    // (açık zemin varsayar) sayacı 2.36 kontrasta düşürüyordu — ölçüldü.
    <div className="koyu-yuzey min-h-screen bg-slate-950 py-8 px-4 sm:px-8 font-sans text-slate-100">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* ÜST BİLGİ VE ARAMA ÇUBUĞU */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Kozmetik Parlama */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800/80 pb-6">
            <div>
              <span className="text-blue-500 font-black text-[10px] tracking-widest uppercase flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Tıbbi İstihbarat Notları
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                {data.topic}
              </h1>
            </div>
            {/* KONUYA DÖNER — panoya ("Köprüüstü", `/tr` sabit) gidiyordu: konudan
                gelen kullanıcı bağlamını kaybediyordu. Soru ve kart motorlarıyla
                aynı ad, aynı hedef. */}
            <Link
              href={konuHref}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-xl font-bold transition-all border border-slate-800 hover:border-blue-500/30 shadow-sm flex items-center gap-2"
            >
              <span aria-hidden="true">←</span> Konuya dön
            </Link>
          </div>

          <div className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              aria-label="Notlarda ara"
              placeholder={aramaOrnegi ? `İncilerde ara (ör. ${aramaOrnegi})` : 'İncilerde ara'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-200 font-medium placeholder-slate-500 shadow-inner"
            />
          </div>

          {/* Süzme sonucu — arama yazarken liste sessizce değişiyordu.
              Bölge ilk render'dan itibaren DOM'da duruyor: role="status"
              sonradan EKLENEN düğümü değil, içeriği DEĞİŞEN düğümü duyurur. */}
          {/* Sayaç GÖRÜNÜR — yalnızca ekran okuyucuya söyleniyordu; gören
              kullanıcı 100 incilik setin boyunu da, aramanın kaç sonuç
              verdiğini de bilmiyordu. Aynı bölge ikisini de taşır. */}
          <p role="status" aria-live="polite" className="relative z-10 mt-3 text-xs font-semibold text-slate-400">
            {searchTerm.trim()
              ? `${data.pearls.length} incinin ${filteredPearls.length} tanesi aramayla eşleşiyor`
              : `${data.pearls.length} inci`}
          </p>
        </div>

        {/* İNCİLER LİSTESİ */}
        <div className="grid gap-5">
          {filteredPearls.length > 0 ? (
            filteredPearls.map((pearl) => {
              const theme = getThemeByLevel(pearl.level);
              
              return (
                <div 
                  key={pearl.id} 
                  className={`bg-slate-900/80 rounded-2xl shadow-lg border border-slate-800 overflow-hidden hover:border-slate-700 transition-all group relative`}
                >
                  {/* Sol Kalın Çizgi */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.bg.replace('/10', '')} ${theme.border}`}></div>
                  
                  <div className={`pl-6 p-5 sm:p-6 flex flex-col gap-4 h-full ${theme.bg}`}>
                    <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${theme.badgeBorder} ${theme.badgeBg} ${theme.text} shadow-sm`}>
                        {pearl.level}
                      </span>
                      <span className="text-[10px] font-bold text-slate-200 uppercase flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                        {pearl.trigger}
                      </span>
                    </div>

                    <div>
                      {/* h2: sayfada h1'den sonra h2 yoktu, inci başlıkları h3'e atlıyordu. */}
                      <h2 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors leading-snug">
                        {pearl.title}
                      </h2>
                      {/* data-readable: her inci kendi kimliğiyle vurgulanabilir.
                          Arama filtresi listeyi değiştirse de vurgular inciye yapışık kalır. */}
                      {/* Boyut BURADA veriliyor: globals.css'teki okuma tabanı
                          `[data-readable]` ÇOCUKLARINI hedefliyor, inci metni ise
                          düz metin olarak doğrudan bu kapsayıcıya basıldığı için
                          (sarmalayan <p> yok) kural hiç değmiyordu ve gövde 14px'te
                          kalıyordu. Vaka ve quiz motorları 15px basıyor. */}
                      <div
                        data-readable={`pearl:${pearl.id}`}
                        /* SATIR UZUNLUĞU — `max-w-none` buradaydı, yani
                           `prose`un kendi okunabilir genişlik sınırı BİLEREK
                           kapatılmıştı. Ölçüldü (1440px, gerçek çizimde):
                           kap 846px, gövde 15px → satır **120 karakter**.
                           Rahat aralık 45–75; açık taraf 70, premium konu
                           sayfası 67.

                           Değer ölçümden: 846 / 120 = 7.05px ortalama
                           karakter → 70 × 7.05 = 493px ≈ **31rem**. `ch`
                           kullanılmadı; bu depoda iki kez yanılttı ("0"
                           karakteri düz metnin ortalamasından geniş, ve `ch`
                           yazı boyutuna bağlı). `prose`un varsayılan `65ch`i
                           de bu yüzden geri açılmadı.

                           `sm:` — dar ekranda üst sınır zaten ısırmıyor,
                           ama kırılma açık taraftaki yazı/genişlik kuralıyla
                           aynı noktada tutuluyor ki ikisi ayrışmasın. */
                        className="text-[15px] text-slate-300/90 leading-relaxed font-medium prose prose-invert prose-p:mb-2 last:prose-p:mb-0 max-w-none sm:max-w-[31rem]"
                        // Bu alan ZATEN ham HTML basıyor; `kalinHtml` yalnızca
                        // `**` çiftini `<strong>`'a çeviriyor, yeni bir risk
                        // eklemiyor. React düğümü döndüren `kalinIsle`
                        // kullanılamadı: o, mevcut sözleşmeyi bozup içerikteki
                        // olası HTML etiketlerini düz metne çevirirdi.
                        dangerouslySetInnerHTML={{ __html: kalinHtml(pearl.content) }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
              <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
              <h3 className="text-lg font-black text-slate-200 uppercase tracking-widest mb-1">Sonuç bulunamadı</h3>
              <p className="text-slate-200 text-sm font-medium">Başka bir kelimeyle aramayı deneyebilirsin.</p>
            </div>
          )}

          {/* SONRAKİ ADIM — liste bir çıkmaz sokakla bitiyordu (yalnız tepedeki
              "Konuya dön"). Okunan bilgiyi sınamak için konunun soru setine
              köprü; quiz dosyası gerçekten doluysa (sunucu envanterden sayar). */}
          {quizHref && (
            <a
              href={quizHref}
              className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/60 bg-emerald-900/40 px-5 py-4 text-emerald-50 no-underline hover:bg-emerald-900/60 transition-colors"
            >
              <span>
                <span className="block text-[12px] text-emerald-200">İncileri okudun — şimdi sına</span>
                <span className="block text-[15px] font-bold">Bu konunun {quizSoru ? `${quizSoru} sorusunu` : "sorularını"} çöz</span>
              </span>
              <span aria-hidden="true" className="text-lg">→</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}