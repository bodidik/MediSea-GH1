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
};
