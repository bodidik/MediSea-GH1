/* MediSea YDUS Dergisi — sayfa üzerinde düzenleyici ayarı.
   Sunucu: node kitap/duzenleyici-sunucu.cjs --kok dergi --port 3410 --ad "YDUS Dergisi"
   Düzenleyicinin kendisi kitap/sablon/duzenleyici.js; burada yalnızca dergiye
   özgü seçiciler ve şablonlar durur. Dergi akan düzendir (A4 sayfalamayı tarayıcı
   yapar), bu yüzden taşma denetimi ve sayfa numaralama kapalı. */
window.DZ_AYAR = {
  ad: "YDUS Dergisi",
  sayfa: "body > section",
  sabitSayfa: false,
  // Tıklanınca seçilen bloklar (en yakını seçilir)
  blok: [
    "aside.kutu", "aside.akil", "aside.kenar", "aside.dur", "figure", ".zincir",
    ".sayilar", ".sayilar > div", ".yoklama", ".yoklama li", "ul.spot li", "ul.spot",
    "p.anlatim", ".govde > h4", "h3.ara", "table tr", "figure.akis li", ".kk", ".kk dd",
    ".adim", ".soru", ".aciklamalar p", ".icindekiler li", ".kapak-liste li",
    ".kose > header", ".manset", ".nasil", ".dur-cevap", ".arac", ".govde > p"
  ],
  duzenlenemez: "[data-dz], .lejant",
  kutu: "aside.kutu",
  kutuAd: ":scope > b:first-child",
  kutuTurleri: { uyari: "İkaz", pratik: "Pratik", ek_bilgi: "Biliyor muydun?", temd: "TEMD ne diyor?" },
  satir: "tr, ul.spot li, .yoklama li, .sayilar > div, figure.akis li, .kk dd, .aciklamalar p, .soru",
  sablon: {
    spot: '<ul class="spot"><li>Yeni spot.</li></ul>',
    uyari: '<aside class="kutu uyari"><b>İkaz</b>Yeni ikaz.</aside>',
    pratik: '<aside class="kutu pratik"><b>Pratik</b>Yeni pratik bilgi.</aside>',
    ek_bilgi: '<aside class="kutu ek_bilgi"><b>Biliyor muydun?</b>Yeni bilgi.</aside>',
    akil: '<aside class="akil"><b>Akıl notu</b><span class="on">Soru yüzü.</span><span class="arka">Cevap.</span></aside>',
    inci: '<aside class="kenar inci"><b>Klinik inci</b><strong>Başlık</strong>Yeni inci.</aside>',
    baslik: "<h4>Yeni ara başlık</h4>",
    anlatim: '<p class="anlatim">Yeni anlatım cümlesi.</p>',
    zincir: '<div class="zincir"><span>Adım</span><i>→</i><span>Adım</span><i>→</i><span>Adım</span></div>',
    tablo: '<figure class="tablo"><figcaption>Tablo başlığı</figcaption><table><thead><tr><th>Başlık</th><th>Başlık</th></tr></thead><tbody><tr><td>Satır</td><td>Değer</td></tr><tr><td>Satır</td><td>Değer</td></tr></tbody></table></figure>'
  },
  ekleAd: {
    spot: "Spot listesi", uyari: "İkaz kutusu", pratik: "Pratik kutusu", ek_bilgi: "Biliyor muydun?",
    akil: "Akıl notu", inci: "Klinik inci (kenar)", baslik: "Ara başlık", anlatim: "Anlatım paragrafı",
    zincir: "Zincir (ok dizisi)", tablo: "Tablo"
  },
  sayfaSablon: {
    kose: `<section class="kose orta" style="--b:#00727A">
  <header><span class="etiket">Köşe · Branş</span><h2>Yeni köşe başlığı</h2></header>
  <div class="govde tam"><h4>Ara başlık</h4><p class="anlatim">Anlatım.</p><ul class="spot"><li>Spot.</li></ul></div>
</section>`
  },
  sayfaAd: { kose: "Ardına yeni köşe ekle" }
};
