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

  // KULLANILMAYAN DEGISKEN KURALI BILEREK KAPALI - olculdu, ucuz degil.
  //
  // Bu yapilandirma kullanilmayan ice aktarmalari YAKALAMIYOR; bir turda
  // elle tarayip bes tane bulundu (birisi checkTopicAccess idi ve AccessGate
  // yaninda durdugu icin "iki erisim denetimi var" izlenimi veriyordu).
  //
  // Kurali acmanin uc yolu denendi ve uculu de olculdu:
  //
  //   temel 'no-unused-vars'          -> TS tip imzalarindaki parametre
  //                                      adlarini degisken saniyor (SAHTE
  //                                      pozitif: InlineTopicEditor'daki
  //                                      build: (title, body) => ...)
  //   extends 'next/typescript'       -> 212 bulgu (cogu no-explicit-any)
  //   yalniz eklenti + tek kural      -> 82 bulgu; catch parametreleri
  //                                      elenince 59
  //
  // 59 bulgu bir kapi degil, ayri bir temizlik isi. Yapilirsa dogru ayar:
  //   plugins: ['@typescript-eslint'],
  //   '@typescript-eslint/no-unused-vars': ['error',
  //     { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }]
}
