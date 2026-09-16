# MediSea Hızlı Bakış — kitap serisi

Kullanıcı kararları (15 Eylül 2026): **A4 · 4 renk · karışık şablon**, ilk branş **Endokrinoloji**.

| Sayfa türü | Sınıf | Ne zaman |
|---|---|---|
| Açık sayfa (B) | `tur-acik` | Standart: konu karşılıklı iki sayfa. Sol sayfa "30 saniyede" + şekil + Sayılarla, sağ sayfa tablo ve kutular |
| Başvuru (A) | `tur-basvuru` | Tek sayfaya sığan konu |
| Karar yolu (C) | `tur-karar` | Algoritması olan konu (acil, yaklaşım) |
| Anlatı | `tur-anlati` | Özet sayfalarının ardından: tek sütun düz metin + 48 mm kenar notu sütunu |

Anlatı metni sola yaslıdır: Chrome'da Türkçe tireleme sözlüğü yok, iki yana
yaslama sözcük arasında boşluk nehirleri açıyordu.

Kutu dili bütün seride sabit: **Sınav spotu** (pembe) · **Klinik inci** (mavi) ·
**Tuzak** (amber) · **Altın kural** (siyah). Branş rengi yalnızca yön bulma
(künye, tırnak, tablo başlığı, Sayılarla) için kullanılır.

İçerik yalnızca kullanıcının verdiği metinden gelir; dizgi sırasında olgu,
sayı ya da öneri eklenmez.

## Sayfa üzerinde düzenlemek

```bash
node kitap/duzenleyici-sunucu.cjs
```

Sonra http://localhost:3400 → bölümü seç. (Claude Code içinde: `kitap-duzenleyici`
başlatma ayarı.) Metin doğrudan düzeltilir; bloğa tıklayınca taşı · çoğalt ·
kes/yapıştır · sil · kutu türü · not çıkar. Üst panelde blok ve sayfa ekleme,
geri al, Kaydet (Ctrl+S) ve PDF üret var.

- Düzenleyici dosyaya **hiçbir iz bırakmaz**: `contenteditable`, `data-dz`, `dz-*`
  sınıfları kaydederken ayıklanır. Yalnızca `data-dz-not="…"` kalır — kullanıcının
  Claude'a bıraktığı talimattır, baskıda görünmez. Bulmak için:
  `grep -o 'data-dz-not="[^"]*"' kitap/endokrinoloji/*.html`
- Her kayıttan önce `kitap/.yedek/` altına zaman damgalı yedek alınır (son 40).
- Taşma rozeti: sarı = alt boşluğa giriyor, kırmızı = baskıda kesilir.
- Sayfa ekle/sil/taşı sonrası folyo numarası ve sol/sağ ayna otomatik düzelir.

## PDF üretmek

```bash
node kitap/pdf.cjs kitap/endokrinoloji/deneme-bolum.html              # PDF
node kitap/pdf.cjs kitap/endokrinoloji/deneme-bolum.html --onizleme   # + sayfa PNG'leri
```

Çıktı `kitap/cikti/` altına düşer (git'e girmez). Edge headless kullanılır.

- Sayfalar sabit A4 kutusudur (`.sayfa`, `overflow: hidden`): **taşan metin
  sessizce kesilir.** Her değişiklikten sonra `--onizleme` ile sayfaları gör.
- Tek sayfaya bakmak: `deneme-bolum.html?s=3`.
- Matbaa aşaması (CMYK dönüşümü, 3 mm taşma payı, kesim işaretleri) henüz
  yok; olgunlaşan bölüm InDesign'a taşınırken yapılacak.
