// C:\Users\hucig\Medknowledge\web\next.config.js
//
// Bu dosya daha önce hiç yoktu; iki somut kusuru kapatıyor.

const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  // 1) Dockerfile runner aşaması `/app/.next/standalone` kopyalıyor ve kendi
  //    yorumunda bu ayarı istiyor. Ayar olmadığı için o dizin hiç üretilmiyor,
  //    imaj kurulamıyordu. (Normal .next çıktısı bundan etkilenmez, standalone
  //    ona EK olarak üretilir.)
  output: 'standalone',

  // 2) Next, çalışma alanı kökünü birden fazla lockfile görünce yanlış
  //    seçiyordu: C:\Users\hucig\package-lock.json — yani projenin DIŞINDA,
  //    kullanıcının ev dizini. standalone çıktısında dosya izleme oradan
  //    başlayacağı için imaja alakasız dosyalar girebilirdi. Kökü buraya sabitle.
  outputFileTracingRoot: __dirname,

  // 3) Doğrulama derlemesi için kaçış: canlı `next dev` çalışırken `next build`
  //    aynı .next dizinini ezip geliştirme sunucusunu bozuyor. Ayrı bir dizine
  //    derlemek için: NEXT_DIST_DIR=.next-verify npm run build
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // 4) Eskimiş konu adresleri.
  //
  // İçerik HTML'lerinin içindeki bağlantılar denetlendi (scripts/link-denetim.cjs):
  // 18 iç bağlantının 3'ü kırıktı. Hepsi hematolojik maligniteler sayfasından
  // çıkıyor ve hedefleri yeniden adlandırılmış: hodgkin-lenfoma → hodgkin,
  // nhl → nhl-genel, burkitt-lenfoma → burkitt.
  //
  // İçeriği düzenlemek yerine yönlendirme konuyor. İki sebep: içerik
  // kullanıcının alanı, ve eski adresler arama motorunda ya da birinin
  // yer imlerinde kalmış olabilir — 301 ikisini birden kurtarır.
  async redirects() {
    return [
      { source: '/topics/hematoloji/hodgkin-lenfoma', destination: '/topics/hematoloji/hodgkin', permanent: true },
      { source: '/topics/hematoloji/nhl', destination: '/topics/hematoloji/nhl-genel', permanent: true },
      { source: '/topics/hematoloji/burkitt-lenfoma', destination: '/topics/hematoloji/burkitt', permanent: true },
    ];
  },
};
