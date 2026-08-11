// C:\Users\hucig\Medknowledge\web\.eslintrc.js
//
// CI her push'ta "npm run lint" calistirir; bu dosya olmadan `next lint`
// etkilesimli soru soruyor ve etkilesimsiz ortamda adim dusuyordu.

module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Uygulama metni Turkce; kesme isareti her yerde geciyor ("MEN1'de",
    // "hastanin"). Hepsini &apos; yapmak kaynagi okunmaz hale getirir ve
    // hicbir sey kazandirmaz. Kuralin yakaladigi GERCEK tehlike olan
    // kacirilmis < ve > karakterlerini TypeScript zaten sozdizimi hatasi
    // olarak veriyor (bkz. tools/dlqi, tools/flipi, tools/heart).
    'react/no-unescaped-entities': 'off',
  },
}
