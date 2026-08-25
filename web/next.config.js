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
  // 5) Premium yolundaki [lang] parçası HER dizeyi kabul ediyordu.
  //
  //    Ölçüldü: /tr, /en, /fr, /zzz, /sayfa-yok — beşi de 200 dönüp aynı
  //    Türkçe sayfayı basıyordu. Yani sınırsız bir kopya adres alanı vardı;
  //    arama motoru aynı içeriği sonsuz adreste görebiliyordu.
  //
  //    Sayfaya kendine dönen canonical eklendi, bu kopya sorununu arama
  //    motoru tarafında zaten kapatıyor. Yönlendirme ise adresleri gerçekten
  //    ortadan kaldırıyor: tarama bütçesi boşa gitmiyor ve dışarıdan gelen
  //    yanlış önekli bir bağlantı 404 yerine doğru sayfaya düşüyor.
  //
  //    404 yerine yönlendirme seçildi çünkü [lang] segmentinde
  //    dynamicParams'ı kapatmak premium ağacının TAMAMININ rota
  //    davranışını değiştirirdi; yönlendirme rotalamadan önce çalışır ve
  //    hiçbir sayfanın oluşturulma biçimine dokunmaz.
  async redirects() {
    return [
      { source: '/topics/hematoloji/hodgkin-lenfoma', destination: '/topics/hematoloji/hodgkin', permanent: true },
      { source: '/topics/hematoloji/nhl', destination: '/topics/hematoloji/nhl-genel', permanent: true },
      { source: '/topics/hematoloji/burkitt-lenfoma', destination: '/topics/hematoloji/burkitt', permanent: true },
      // AYNI SKOR İKİ AYRI ARAÇ OLARAK DURUYORDU: /tools/heart-score (Kardiyoloji)
      // ve /tools/heart (Acil), ikisinin de adı "HEART Skoru". Ayrı uygulama
      // oldukları için AYNI hastada farklı davranıyorlardı — ölçüldü:
      // heart-score hiç dokunulmamış formda "0 · Düşük Risk (<2% MACE)" yani
      // bir TABURCU kararı basıyordu; heart ise kapılı (null varsayılan,
      // beş kriter de yanıtlanmadan sonuç yok, "0/5 kriter" göstergesi var).
      // Kapılı olan tutuldu, öteki buraya yönlendirildi: adres kırılmıyor.
      { source: '/tools/heart-score', destination: '/tools/heart', permanent: true },
      // AYNI İNDEKS İKİ AYRI ARAÇ OLARAK DURUYORDU — ikisinin de <h1>'i
      // "SLEDAI-2K". Ama biri EKSİKTİ ve fark ölçüldü:
      //
      //   /tools/sle       24 tanımlayıcı · tavan 105   ← yayımlanmış SLEDAI-2K
      //   /tools/sledai2k  16 tanımlayıcı · tavan  61
      //
      // Yayımlanmış SLEDAI-2K 24 tanımlayıcı taşır ve azami 105'tir
      // (8 puanlık 8 madde + 4 puanlık 6 + 2 puanlık 7 + 1 puanlık 3).
      // Eksik sürümde 8 puanlık dört madde yok (organik beyin sendromu,
      // görme bozukluğu, kraniyal sinir tutulumu, lupus baş ağrısı) ve
      // renal/serolojik maddelerin bir kısmı da eksik.
      //
      // Bedeli tarayıcıda ölçüldü: HER kutusu işaretlenmiş bir hastada
      // /tools/sledai2k "SKOR 61 · YÜKSEK AKTİVİTE" basıyor — kendi en üst
      // bandına bile ulaşamıyor. /tools/sle aynı durumda "105 · Çok Yüksek
      // Aktivite" veriyor. Yani ağır nöropsikiyatrik ya da renal lupusta
      // hastalık aktivitesi SİSTEMATİK olarak olduğundan düşük çıkıyordu.
      //
      // `heart-score → heart` ile aynı karar: TAM olan tutuldu, eksik olan
      // buraya yönlendirildi. Adres kırılmıyor.
      { source: '/tools/sledai2k', destination: '/tools/sle', permanent: true },
      //    DİKKAT 1: olumsuz ileri-bakış `(?!tr/)` biçiminde olmak zorunda.
      //    İlk yazımı `(?!tr$)` idi ve `$` segment sonuna değil TÜM yolun
      //    sonuna baktığı için koşul her zaman sağlanıyordu: /tr kendine
      //    yönleniyor, tarayıcı 50 atlamada pes ediyordu. Yani premium
      //    bölümünün tamamı erişilemez hale gelmişti. Yereldeki ölçüm yakaladı.
      //
      //    DİKKAT 2: `api` de elenmeli. İlk sürüm elemiyordu ve `:lang`
      //    parçası `api`yi de dil sanıyordu: /api/premium/daily-program ve
      //    /api/premium/quiz/* istekleri /tr/premium/... HTML sayfalarına
      //    308'leniyordu. PremiumDailyProgram ve PremiumQuizHistory
      //    bileşenleri bu uçları çağırıyor; ikisi de erişim kapısının
      //    arkasındaki panoda olduğu için kusur birkaç tur fark edilmedi.
      {
        source: '/:lang((?!tr/|api/)[^/]+)/premium/:yol*',
        destination: '/tr/premium/:yol*',
        permanent: true,
      },
    ];
  },
};
