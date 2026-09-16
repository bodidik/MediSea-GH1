# Hızlı Bakış — konu döngüsü (16 Eylül 2026, 00:30 → 04:50)

Kullanıcı isteği: 12 dakika aralıkla sıradaki konuyu kitaba ekle; **04:50'de döngüyü bitir** (kullanıcı 01:5x’te 03:50’den uzattı).
Her tur bu dosyayı okur, ilk `SIRADA` konuyu işler, günlüğe yazar.
Zamanlayıcı: CronCreate işi **210fae10** (01:5x’te d54fd27c yerine, bitiş 04:50) (`*/12 * * * *`). 04:50'yi geçen ilk turda `CronDelete 210fae10` ile sil ve özet ver.
Bir tur çalışırken bir sonraki tetik gelirse: konu `ÇALIŞIYOR` durumundaysa yeni konuya başlama, yarım kalanı bitir.

## Kurallar (kullanıcının sözleri)

- Endokrinden git; endokrinde daralırsan **gastroya** geç.
- **Açıkta VE premiumda bilgisi olanları** tercih et. Az bilgisi olanı, açık + premium tam hazır olmayanı **elleme**.
- Kaynak: açık ana sayfa + onun **ileri okuma** (alt) sayfaları + premium konu, quiz, kart. Dışarıdan bilgi ekleme.
- Kaynaklar birbirini tutmuyorsa kitapta **premium** sürümünü kullan, tutarsızlığı günlüğe yaz (düzeltme kullanıcının).

## Teknik kurallar

- Dosya: `kitap/endokrinoloji/deneme-bolum.html` (gastro için `kitap/gastroenteroloji/deneme-bolum.html` aç; şablon ve sınıflar aynı, `--brans` rengini değiştir).
- Yapı: **kısım kapağı (sağ, tek sayfa)** → **açık sayfa (sol + sağ)** → anlatı / başvuru / karar yolu sayfaları. Kısmın toplam sayfa sayısı **çift** olmalı ki sonraki kapak yine sağa düşsün; gerekirse sona **Notlar** sayfası koy.
- Başlamadan önce dosyada `data-dz-not` var mı bak (kullanıcının talimatı) — varsa önce onu uygula, sonra özniteliği kaldır. Kullanıcı düzenlediyse üzerine yazma; eklemeleri ekleme olarak yap.
- Taşma ölçümü: `http://localhost:3400/endokrinoloji/deneme-bolum.html` (düzenleyici sunucusu; kapalıysa `kitap-duzenleyici` başlat) sayfasında sayfa başına alt sınır ölçümü; `> 0 mm` olan sayfayı düzelt. Görsel kontrol: `node kitap/pdf.cjs <dosya> --onizleme --sayfa A-B`.
- Sayfa 1 (bölüm açılışı) içindekilerine kısmı ekle. **Tur 6’da içindekiler iki sütuna bölündü, kutu kılavuzu üstte şerit oldu;** alt sınıra ~38 mm var. Sonraki kısımları grup etiketi + 1–2 satırla ekle.
- Commit YOK.

## Kuyruk

| # | Konu | Açık kaynak | Premium | Durum |
|---|---|---|---|---|
| 1 | Hipertiroidi · amiodaron · fırtına · santral hipotiroidizm | hipertiroidi, amiodaron, santral(+lt4) | hipertiroidi, santral | BİTTİ (s. 2–12) |
| 2 | Hipotiroidi ve Hashimoto | hipotiroidi-hashimoto-miksoedem, hipotiroidizm-anasayfa + 6 alt | hashimoto-tiroiditi + quiz | BİTTİ (s. 13–21) |
| 3 | Gebelikte tiroid hastalıkları | gebelik-ve-tiroid-yonetimi + gebelikte-hiper/hipo + GTT + izole maternal hipotiroksinemi + kılavuz karşılaştırması | gebelik-tiroid + quiz | BİTTİ (s. 22–30; 22 ve 30 Notlar) |
| 4 | Cushing sendromu | cushing-sendromu-patofizyoloji-klinik (+3 alt), genetik-inovasyonlar, siddetli-cushing, usp8-pasireotid | cushing-sendromu + quiz | BİTTİ (s. 31–38) |
| 5 | MEN1 / MEN sendromları | men1-sendromu (+9 alt) | men1-sendromu, men-sendromlari + quiz + kart | BİTTİ (s. 39–48; 48 Notlar) |
| 6 | Osteoporoz | osteoporoz-ana-sayfa (+5 alt), osteoporoz-tedavisi, TEMD özet | osteoporoz + quiz + kart | BİTTİ (s. 49–56) |
| 7 | SGLT2 inhibitörleri | sglt2-kardiyorenal-metabolik (+alt), pleiotropik-yan-etkiler, sick-day | sglt2-inhibitorleri + quiz | BİTTİ (s. 57–62) |
| 8 | Tirzepatid | tirzepatid-genel-profil (+2 alt) | tirzepatid + quiz | BİTTİ (s. 63–68) |
| 9 | (gastro) Asit ve portal hipertansiyon | ascit-yonetimi (+5 alt) | asit-portal-hipertansiyon + quiz + 2 kart seti | BİTTİ (gastro s. 1–10) |
| 10 | (gastro) Çölyak hastalığı | colyak (+6 alt), refrakter çölyak | colyak-hastaligi + quiz | BİTTİ (gastro s. 11–20) |
| 11 | (kardiyo) Akut koroner sendromlar | akut-koroner-sendromlar (29K), gebelikte-AKS, akut kalp yetersizliği | akut-koroner-sendromlar + quiz | BİTTİ (kardiyo s. 1–12) |
| 12 | (kardiyo) Klinik lipidoloji ve ASKVH | lipidoloji-tedavi-ana + 12 alt sayfa | klinik-lipidoloji-ascvd + quiz + kart | BİTTİ (kardiyo s. 13–24) |
| 13 | (romato) Behçet hastalığı | behcet-hastaligi-yonetimi, vasküler tutulum, hasar indeksleri, nörobehçet | behcet-hastaligi + quiz + kart | BİTTİ (romato s. 1–10) |
| 14 | (nefro) Polikistik böbrek (ADPKD) | polikistik-bobrek-hastaligi-pkd + 5 alt sayfa | adpkd + quiz | BİTTİ (nefro s. 1–10) |
| 15 | (nefro) IgA nefropatisi | iga-nefropatisi-berger, güncel tedavi, MEST-C | iga-nefropatisi + quiz | BİTTİ (nefro s. 11–20) |
| 16 | (onko) Febril nötropeni | febril-notropeni-konu, MASCC, CISNE | febril-notropeni + quiz | BİTTİ (onko s. 1–10) |
| 17 | (nefro) KBH’de hiperfosfatemi ve MKB | kbh-hiperfosfatemi-yonetimi, kbh-mkb-kapsamli, bisfosfonat kontrendikasyonu, fosfor homeostazı | kbh-hiperfosfatemi + quiz + 2 kart seti | BİTTİ (nefro s. 21–30) |
| 18 | (nefro) Asit-baz bozuklukları | asit-baz-denge-bozukluklari, fizyopatoloji, kompanzasyon, delta-delta, metabolik asidoz/alkaloz, RTA | asit-baz-dengesi + quiz + kart | BİTTİ (nefro s. 31–40) |
| 19 | (gogus) Sarkoidoz | sarkoidoz-ana, ayırıcı tanı, hiperkalsemi | sarkoidoz + quiz + vaka | BİTTİ (gogus s. 1–10) |
| 20 | (hemato) KLL | kll (+ hematolojik maligniteler) | kll + quiz | SIRADA |

**İkinci aday taraması (16 Eyl 03:18):** kuyruk yine bitti; açık + premium eşleşmesi olan yeni konular eklendi. Göğüs hastalıkları premiumunda TKP, HKP, VİP ve akciğer kanseri var ama açık tarafta `canonical/gogus` yalnız sarkoidoz üçlüsünü taşıyor (akciğer kanseri açık sayfası onkolojide) — bu yüzden yalnız sarkoidoz kuyruğa alındı. Erişkin Still hastalığı ve HFpEF premiumda dolu, açık eşleşme yok: elendi.

**Yeni branşlar (16 Eyl 02:15 taraması):** endokrin ve gastro kuyruğu bittiği için açık + premium içeriği dolu branşlara geçildi; her yeni branş için `kitap/<branş>/deneme-bolum.html` aç, şablon aynı, `--brans` rengi farklı (endokrin #177A5B, gastro #0F6F86). Aynı branşın ikinci konusu aynı dosyaya yeni kısım olarak eklenir. Elenen yeni adaylar: romatoloji FMF (açık sayfa gizli, 3 KB) · gastro HCC ve pankreas kanseri (açık sayfa yok ya da gizli) · romatoloji SLE (açık sle-lupus yalnız 3,7 KB).

**Elenenler:** feokromositoma (açık sayfa gizli) · Graves, hipoparatiroidizm (açık sayfa yok) · erkek osteoporozu, transplantasyon osteoporozu, subklinik tiroid, tiroid nodül/kanser (premium ~2 KB, boş) · gastro HCC, pankreas kanseri, primer skuamöz (açık yok ya da gizli) · Harrison seçme sorular (konu değil soru seti).

## Günlük

### Tur 2 — Hipotiroidi ve Hashimoto (s. 13–21)
Kaynak tutarsızlıkları (kitapta premium kullanıldı):
- LT4 tam doz: premium 1,5–1,7 · Hashimoto açık 1,6–1,8 · hipotiroidizm açık 1,5–1,6 µg/kg/gün.
- Yaşlı/KAH titrasyonu: premium 6–8 haftada · Hashimoto açık 7–10 günde.
- Miksödem koması T4 yüklemesi: 200–400 µg (Hashimoto açık + miksödem koması sayfası) · 300–500 µg (hipotiroidizm açık). Hidrokortizon: 50–100 mg 6–8 saatte (koma sayfası) · 100–200 mg (hipotiroidizm açık).
- Kadın/erkek oranı: premium 4–10 kat · açık 8 kat.
- Mutsuz hipotiroidi sıklığı: %10–15 (kendi sayfası) · %5–10 (Hashimoto açık).
- Mutsuz hipotiroidi formülü: z = x − 3y (20 µg LT3 → LT4 60 µg azalır) ↔ aynı sayfada "her 20 µg LT3 için 25–50 µg azalt". Kitapta formül + kılavuzun 5–10 µg / 12,5–25 µg pratiği yazıldı, "25–50" satırı konmadı.

### Tur 3 — Gebelik ve tiroid (s. 22–30) · bitti 00:29
Sayfalar: 22 Notlar (kısım 2'yi çift yapar) · 23 kapak · 24–25 açık sayfa (Şekil 4: gebelik haftası takvimi) · 26–27 anlatı · 28 karar yolu (TSH baskılı gebe) · 29 başvuru (fetüs, nodül, emzirme, kılavuz tablosu) · 30 Notlar.
Kaynak tutarsızlıkları:
- Fetal tiroid: premium "10–12. haftaya kadar anneye bağımlı" · açık yönetim sayfası "18–20. haftaya kadar işlevsel değil" · kılavuz sayfası ikisini birleştiriyor (10–12 iyot tutar, 18–20 işlevsel). Kitapta kılavuz sayfasının ifadesi kullanıldı.
- 1. trimester TSH üst sınırı: premium ve açık sayfalar sabit 2,5 · kılavuz sayfası "ATA 2017 sabit 2,5'i aşırı tanı gerekçesiyle bıraktı, yerel veri yoksa ~4,0". Kitapta premium kural + s.29'da ATA 2017 notu ve tuzak kutusu.
- LT4 artışı: premium ve yönetim sayfası %25–50 · gebelikte hipotiroidizm açık sayfası %25–30.
- PTU:MMI oranı: premium 1:20 · kılavuz 1:15–20. Kitapta premium (Sayılarla) + kılavuz tablosunda 1:15–20.
- TRAb izlem eşiği: açık yönetim ">2,5–3 kat" · kılavuz ">3 kat ya da >3,75 IU/L". Kitapta ">3 kat".
- Emzirmede PTU üst dozu: premium 300 mg/gün · kılavuz 300–450. Kitapta 300.
- RAI sonrası gebelik: gebelik sayfaları "en az 6 ay" · hipertiroidi kart seti "kadın 4–6 ay" (s.7'de 4–6 yazıyor). Bölüm içinde iki farklı sayı var.
- hCG–TSH benzerliği: GTT sayfası "ortak alfa alt ünite" · gebelikte hipertiroidizm açık sayfası "beta alt birimleri arasında homoloji". Kitapta "yapısal benzerlik" dendi, alt ünite yazılmadı.

### Tur 4 — Cushing sendromu (s. 31–38) · bitti 00:44
Sayfalar: 31 kapak · 32–33 açık sayfa (Şekil 5: tanı algoritması) · 34–35 anlatı (klinik/komplikasyon · moleküler genetik) · 36 başvuru (tedavi) · 37 karar yolu (şiddetli Cushing) · 38 başvuru (ektopik ACTH). Çift sayfa: Notlar gerekmedi. Sayfa 1 açılışı sıkılaştırıldı (renk bandı 150→112 mm, içindekiler tek satır).
Kaynaklar: premium cushing-sendromu + quiz (10) · açık cushing-sendromu-patofizyoloji-klinik, genetik-ve-inovasyonlar, siddetli-cushing, pbmah-genetik, usp8-pasireotid, ektopik-acth-sendromu (ebeveynsiz açık sayfa, Cushing ailesi olduğu için kullanıldı).
Kaynak tutarsızlıkları:
- Kadın/erkek: premium Cushing hastalığı "3–8:1" · açık "endojen CS kadınlarda 3–4 kat". Kitapta Cushing hastalığı için 3–8:1, genel için "daha sık".
- ACTH-bağımsız oran: premium ~%20 · açık %15–20.
- USP8 sıklığı: premium ve genetik sayfası %40–50 · patofizyoloji ve USP8 sayfası ~%40. Kitapta %40–50.
- PBMAH sıklığı: premium <%1 · PBMAH sayfası <%2.
- USP8–pasireotid: premium "daha iyi yanıt" kesin ifade · USP8 sayfası "in vitro gösterildi, klinik üstünlük doğrulanmadı". Kitapta ikisi birlikte (kural kutusu premium, anlatıda sınırlılık).
- AÇIK SİTE KUSURU (kitabı etkilemedi): 6 içerik dosyasının HTML’inde JSX kaçış kalıntısı `{'<'}` / `{'>'}` literal duruyor (ör. Cushing “<strong>{'<'}1.8 mcg/dL”). Dosyalar: endokrinoloji/cushing-sendromu-patofizyoloji-klinik, gebelikte-hipertiroidizm-yonetimi, gebelikte-hipotiroidizm-yonetimi, sglt2-hasta-gunler-kurali-sick-day · enfeksiyon/prokalsitonin-genel, prokalsitonin-yukselme-paterni. Eski not: (JSON'da "{' (50 nmol/L)" gibi kırık metin; ACTH ve BIPSS satırlarında da  kalıntısı) — içerik dosyası render hatası, düzeltilmesi gerekebilir.

### Tur 5 — MEN sendromları (s. 39–48)
Sayfalar: 39 kapak · 40–41 açık sayfa (Şekil 6: MEN1 tümör sıklığı çubuk grafiği) · 42–43 anlatı (paratiroid + kalsiyum–gastrin aksı · gastrinoma ve insülinoma) · 44 karar yolu (NF-pNET izle mi kes mi) · 45 başvuru (sürveyans 2012→2025) · 46 başvuru (hipofiz, adrenal, MEN1’de ektopik Cushing, K⁺ 4,5–5 kuralı) · 47 başvuru (MEN2A/2B, MEN4, MEN5) · 48 Notlar. Sayfa 1 içindekileri: tek satır eklendi (alt sınıra ~19 mm kaldı; sonraki branş/kısım için içindekileri iki sütuna bölmek gerekecek).
Kaynaklar: premium men1-sendromu + men-sendromlari · açık men1-sendromu + 2025 kılavuz değişimleri, ailesel tarama, gastrinoma-ZES, insülinoma, NF-pNET, meme kanseri taraması, MEN1 ektopik Cushing, somatotropinoma, hipokalemi-aritmi. Osilodrostat alt sayfaları (block-replace, protokol, yan etki, mineralokortikoid), menin/lösemi, ektopik CRH mekanizma, meme patogenez okunmadı — kitapta yalnızca özet düzeyinde (K⁺ kuralı) yer aldı.
Kaynak tutarsızlıkları:
- Prevalans: men1 premium 2–20/100.000 · men-sendromları premium 2–10 (bazı kaynaklarda 3–20).
- Hipofiz tümörü sıklığı: men1 premium %30–50 · men-sendromları premium %15–50 · somatotropinoma sayfası %30–46 · ektopik Cushing sayfası ~%42. Kitapta %30–50.
- Adrenal lezyon: men1 premium %40–73 · men-sendromları %20–73. Lipom: %30 · %17–33.
- Gastrinoma: premium penetrans %30–40 · gastrinoma sayfası "taşıyıcıların %20–60’ında gastrinoma veya asemptomatik hipergastrinemi".
- NF-pNET oranı: men-sendromları "GEP-NET’lerin %70–90’ı" · NF-pNET sayfası "pankreatik lezyonların %70–80’i".
- PHPT cerrahi sonrası nüks: men1 premium/açık SPTX %45 (Fransız seri) · men-sendromları premium "uzun dönem nüks %16–30 (reoperasyon %70’e varabilir)".
- Meme taraması: men1 premium ve 2025 kılavuz sayfası "40 yaşından yıllık mamografi" · meme kanseri sayfası "yıllık muayene, mamografi 2 yılda bir". Kitapta yıllık (premium).
- Sürveyans aralığı: men1 premium Ca/PRL/IGF-1 "1–3 yılda bir" · men-sendromları premium "10 yaşından yıllık"; pankreas MRG men-sendromları "10–15 yaş 2–3 yılda bir" · men1 premium "ilk bazal 10–15, normalse 2–3 yılda". Ailesel tarama açık sayfası 2012 takvimini (PTH, gastrin, CgA, PET/BT) veriyor — sayfanın kendisi 2025 ile farkı belirtiyor.

### Tur 6 — Osteoporoz (s. 49–56) · bitti 01:14
Sayfalar: 49 kapak · 50–51 açık sayfa (Şekil 7: ilaç kullanım süreleri, 10 yıllık ölçek) · 52 anlatı (döngü, tanı, yaşam tarzı) · 53 anlatı (ilaçlar, denosumab çıkışı) · 54 karar yolu (hangi ilaç, hangi sırayla) · 55 başvuru (glukokortikoid, KBH-MBD, nakil, kanser) · 56 başvuru (erkek osteoporozu + ABD/Avrupa/TEMD tablosu). Çift sayı, Notlar gerekmedi. Sayfa 1 içindekileri iki sütuna bölündü.
Kaynaklar: premium osteoporoz · açık osteoporoz-ana-sayfa, osteoporoz-tedavisi, TEMD 2025 özeti, kılavuz karşılaştırması, KBH-osteoporoz (CKD-MBD), organ nakli, erkek osteoporozu ana sayfa. Okunmayan alt sayfalar: erkek-osteoporozu-testosteron, KBH hiperfosfatemi/sevelamer/kalsimimetik zinciri, postransplant bisfosfonat ve kalsinörin inhibitörü sayfaları.
Kaynak tutarsızlıkları:
- **GIOP profilaksi eşiği (klinik önemi yüksek):** premium ve erkek osteoporozu sayfası ≥7,5 mg/gün prednizon ≥3 ay · açık ana sayfa ≥5 mg/gün ≥3 ay. Kitapta premium + parantezde açık sayfanın eşiği yazıldı (s.55).
- D vitamini: premium 800–2000 IU, hedef 30–50 ng/mL · tedavi ve TEMD sayfaları 800–1500 IU, hedef >20–30.
- Alkol: premium <2–3 birim/gün · tedavi sayfası <2 birim ya da <30 g.
- Teriparatid süresi: premium 18–24 ay · tedavi sayfası teriparatid 24 / abaloparatid 18 ay · TEMD 76 hafta. Kitapta üçü de yer aldı.
- Romosozumab kontrendikasyonu: premium "MI veya inme öyküsü" · ana sayfa spotu "son 1 yıl içinde" · tedavi sayfası "yakın zamanda". Kitapta "öykü".
- Çok yüksek risk tanımı: premium listesinde "son 12 ayda kırık" yok · tedavi sayfasında var. Kitapta birlikte.
- Nakil sonrası yoğun kayıp dönemi: premium "ilk 6–12 ay" · nakil sayfası "ilk 3–6 ay".
- Erkekte anabolik eşiği: erkek sayfası T ≤−3,0 · genel sayfalar T ≤−3,5.

### Tur 7 — SGLT2 inhibitörleri (s. 57–62) · bitti 01:23
Sayfalar: 57 kapak · 58–59 açık sayfa (Şekil 8: böbrek TGF zinciri + kalp mekanizmaları) · 60 anlatı (moleküler: NHE3–MAP17, ferroptoz, açlık taklidi, NHE1, keton, kreatinin yanılgısı) · 61 karar yolu (hasta günleri kuralı + eşlik eden ilaçlar tablosu) · 62 başvuru (advers profil, farmakoloji, sarkopenik yaşlı). Çift sayı. Sayfa 1 içindekileri: alt kenar 244 mm (sınır ~277). Yan düzeltme: s.7 ve s.60’ta 1 mm’lik alt boşluk taşması kırpıldı.
Kaynaklar: premium sglt2-inhibitorleri + quiz (10) · açık sglt2-kardiyorenal-metabolik, pleiotropik-ve-yan-etkiler, hasta-gunler-kurali. Kaynak dar (üç açık sayfa, ~38 KB) — bu yüzden 6 sayfa.
Kaynak tutarsızlıkları: belirgin çelişki yok. Notlar:
- Açık sayfalar klasik mekanizmayı (TGF, glukozüri) anlatıyor, premium ileri molekülerini (NHE3–MAP17, ferroptoz, mTOR); tamamlayıcılar.
- Hasta günleri sayfasında JSX kalıntısı nedeniyle cümle kesik: "Kan şekeri genellikle {'..." (EDKA eşiği yarım kalmış; kitapta <250 mg/dL pleiotropik sayfadan alındı). Açık site kusuru listesine zaten ekli.
- "Uzun vadede AKI %25–30 azalır" ve "AKI dikkat: yaşlı, loop, ACEi, NSAİİ" yalnız açık sayfada; premium’da yok.

### Tur 8 — Tirzepatid (s. 63–68) · bitti 01:42
Sayfalar: 63 kapak (Kısım 8 · Diyabet ve obezite farmakolojisi) · 64–65 açık sayfa (Şekil 9: titrasyon basamakları + çalışmalarda kilo kaybı, 0–%25 ölçeği; çalışma programı tablosu; uygulama ve MEN-2 arka planı) · 66 anlatı (molekül, mekanizma, SURPASS/SURMOUNT) · 67 karar yolu (anestezi ve endoskopi öncesi, aspirasyon zinciri) · 68 başvuru (yan etki, etkileşim, gebelik, vakadan karara tablosu, "neden en az 1 ay" şeridi). Çift sayı, Notlar gerekmedi. Sayfa 1: içindekiler + alt başlık "…kemik, diyabet ve obezite".
İlk yerleşimde 64/65/67/68’de 72–85 mm boşluk kaldı; quizin açıklamalarından (SURMOUNT-4 tasarımı, enjeksiyon yerleri, MEN-2A/2B bileşenleri, 4–5 yarı ömür gerekçesi, vaka senaryoları) dolduruldu. Son ölçüm: taşma yok (64’te −1,5 mm, 67’de 29,5 mm boş).
Kaynaklar: premium tirzepatid + quiz (10, açıklamalarıyla) · açık tirzepatid-genel-profil, tirzepatid-kardiyorenal-koruma, tirzepatid-vs-semaglutid. Kart seti yok.
Kaynak tutarsızlıkları:
- **Laktasyon:** açık genel profil "gebelikte ve laktasyonda KESİN KONTRENDİKE (artmış maternal mortalite riski)" · premium "veri yetersiz, kaçınılmalı". Kitapta ikisi de yazıldı (s.68).
- **Böbrek:** premium ve quiz "şiddetli yetmezlikte bile doz ayarı yok, güvenle" · kardiyorenal sayfa aynı + "ESRD’de veri kısıtlı, rutin önerilmez". Kitapta ikisi birlikte (s.65–66).
- **Perioperatif ara verme:** genel profil bir bölümde "ilaca uygun süre ara vermek en çok tercih edilen yaklaşım", sonraki bölümde "ilacı bırakmaktan çok açlık/USG/prokinetik stratejileri öne çıkıyor". Kitapta kaynak notu olarak (s.67).
- **Prokinetik örneği:** quiz açıklaması metoklopramid · açık sayfa eritromisin. Kitapta eritromisin.
- **SURPASS HbA1c süresi:** açık sayfalar "104 haftalık süreçlerde" · premium süre vermiyor. Kitapta süre yazılmadı.
- **OKS etkileşimi:** premium ve quiz Cmax %55–66 ↓ (AUC değişmez vurgusu parasetamolde) · açık sayfa "AUC ve Cmax düşüşü". Kitapta Cmax.
- Açık sayfanın "yağsız kütle korunur" ifadesi quizde "yağsız kütle oranı göreceli korunur"; kitapta ikincisi.

### Tur 9 — (gastro) Asit ve portal hipertansiyon · `kitap/gastroenteroloji/deneme-bolum.html` s. 1–10 · bitti 01:56
Yeni dosya: endokrin dosyasının şablon + şekil CSS’i kopyalandı, branş rengi `--brans:#0F6F86` (petrol mavisi). Kısım 1’in kapağı bölüm açılışıdır (endokrindeki gibi); sonraki kısım kapağı **s. 11 (sağ)**.
Sayfalar: 1 bölüm açılışı · 2–3 açık sayfa (Şekil 1: vazodilatasyon zinciri ve tedavinin vurduğu halka; Şekil 2: tedavi merdiveni; evre/muayene, kaçınılacak ilaçlar, sıvı analizi ilk bakış, parasentez pratiği, hiponatremi) · 4 anlatı (patofizyoloji, kalp ve pencere hipotezi, prognoz, parasentez endikasyonu, albümin) · 5 karar yolu (sıvı analizi: görünüm, SAAG × protein dört kare, PMN × kültür) · 6 başvuru (diüretik basamakları, izlem, komplikasyon tablosu) · 7 karar yolu (refrakter asit, TIPS seçimi) · 8 başvuru (SBP ampirik tedavi, albümin, profilaksi) · 9 başvuru (siroz dışı asit, HRS/terlipressin/vaptan, finerenon ve SGLT2, HE kesişimi) · 10 hızlı tekrar (kart setlerinden 38 soru-cevap). Son ölçüm: taşma yok (en dolu s.8 −0,5 mm; s.2’de 34 mm boş).
Kaynaklar: premium asit-portal-hipertansiyon (konu adı yalnız asit) + quiz (25) + 2 kart seti (77 + 80) · açık ascit-yonetimi, ascit-sıvısı, ascit-sivisi-analizi, ascit-diuretik-tedavisi, ascit-enfeksiyonu-antibiyotik-tedavisi, tips-hasta-secimi. Varis kanaması ve HE’nin ayrı açık sayfaları okunmadı (kuyrukta değil).
Kaynak tutarsızlıkları:
- **Sıvı kısıtlaması eşiği (klinik önemi yüksek):** premium ve quiz Na ≤120–125 mEq/L · açık ascit-yonetimi, ascit-sıvısı ve kart seti 2 Na <125–130. Kitapta premium.
- **SBP riski için asit proteini:** premium "<2,5 g/dL klasik siroz; düşük opsonik aktivite, SBP riski yüksek" · açık analiz sayfası ve iki kart seti <1,5 g/dL (primer profilaksi eşiği de 1,5). Kitapta 1,5 (profilaksi ölçütüyle tutarlı olsun diye) — premium kuralından sapma, kullanıcı kararı.
- **TIPS eşikleri:** premium ve ascit-sıvısı MELD ≥18 · Child-Pugh ≥11 kontrendike · tips-hasta-secimi MELD >18–19, Child-Pugh >11 kontrendike ve "CTP ≤11 gerekli"; bilirubin ≤3 (bazı kaynaklarda <4,5). Kitapta premium.
- **TIPS kardiyak eşik:** tips-hasta-secimi EF >%50 şart · kart seti 2 "KKY veya EF <%30–35 mutlak kontrendikasyon". Kitapta EF >%50 (s.7), tekrar sayfasında "KKY ya da düşük EF".
- **Portal basınç eşiği:** premium portal HT >10 mmHg · kart seti 1 "asit için minimum 12 mmHg". Kitapta ikisi de, anlatıda ayrı ayrı.
- **Parasentez albümini:** premium ve açık 6–8 g/L · kart seti 1 "8 g". Kitapta 6–8.
- **Spironolakton etki süresi:** diüretik sayfası "en erken 72 saat" · kart seti 2 "3–5 gün". Kitapta 72 saat.
- **Refrakter asitte idrar Na:** diüretik sayfası "diüretik altında <30 mmol/gün ise kes" · kart seti 2 "refrakter tanımı <78 mmol/gün". Farklı soruların cevabı olabilir; kitapta ikisi ayrı bağlamda.
- **GİS kanamasında seftriakson süresi:** açık 5–7 gün · kart 7 gün.
- **Hemorajik asit:** premium ve kart >50.000/mm³ · analiz sayfası >50.000–100.000/µL.
- **Prokinetik/ACEi mekanizması** gibi ayrıntılar tamamlayıcı, çelişki değil.
- Premium konunun adı "Asit"; portal hipertansiyonun kendisi (HVPG ölçümü, varis, Baveno) premiumda yok — kısım adı "Asit ve portal hipertansiyon" ama içerik asit odaklı.

### Tur 10 — (gastro) Çölyak hastalığı · gastro s. 11–20 · bitti 02:12
Sayfalar: 11 kapak (Kısım 2 · İnce bağırsak) · 12–13 açık sayfa (Şekil 3: Oslo fenotipleri belirti × seroloji × atrofi matrisi; Şekil 4: Marsh–Oberhuber şeridi; seroloji basamakları, biyopsisiz tanı, test öncesi kontrol listesi) · 14 anlatı (üç bileşen, tTG’nin çifte rolü, bukalemun klinik, kilo paradoksu, mukozal iyileşme; kenarda çölyak ↔ ÇDGH) · 15 karar yolu (tanı: diyet → tTG+IgA → biyopsisiz ölçütler → biyopsi → gri zon → tanı sonrası ilk iş) · 16 başvuru (belirteçlerin güçlü/zayıf yanı, ÇDGH karşılaştırması, hangi soruya hangi test) · 17 karar yolu (tanısız glutensiz diyet: seroloji → HLA → gluten yükleme → biyopsi; Şekil 6) · 18 başvuru (izlem takvimi Şekil 5, erişkin ↔ çocuk zıtlıkları, beslenme, riskli bebekte gluten, diyetin tuzakları) · 19 karar yolu (yanıtsız çölyak → RCD; tip 1 ↔ tip 2 dalı, akım sitometri/TCR/JAK-STAT, lenfoma araması) · 20 başvuru (RCD tedavisi, Şekil 7 sağkalım, EATL, vakadan karara). Çift sayı; sonraki kapak s. 21 (sağ).
Son ölçüm: taşma yok (en dolu s.12 −13,5 mm; en boş s.15 −49,8 mm).
Kaynaklar: premium colyak-hastaligi + quiz (10) · açık colyak, refrakter-colyak-hastaligi-rcd, colyak-belirtecler-avantaj-dezavantaj, colyak-tanisiz-diyet-algoritmasi, colyak-vs-cdgh-karsilastirma, colyak-bebeklerde-gluten-baslama, colyak-beslenme, colyak-akdeniz-beslenme, colyak-glutensiz-obezite, colyak-lif-alimi, colyak-psodotahillar-kilo. Okunmayan: colyak-pseudotahillar, colyak-pseudotahil-mikrobesin, colyak-diyetsel-yag-riski (içerikleri okunanlarla örtüşüyor). Kart seti yok.
Kaynak tutarsızlıkları:
- **HLA taşıyıcılığı:** premium "hastaların %99’undan fazlası" · açık colyak "vakaların >%95’i". Kitapta ikisi de anlatıda yazıldı.
- **DXA:** premium "erişkinde risk faktörü varsa 1. yılda" · açık colyak bir yerde "DXA taraması şarttır", aynı sayfanın izlem bölümünde premiumla aynı risk koşulu. Kitapta premium (risk varsa).
- **Pnömokok aşısı:** premium "özellikle 65 yaş üstü, refrakter ya da ağır otoimmün komplikasyonlu hastalara" · açık "tüm hastalara mutlaka". Kitapta koşulsuz öneri (açık), premium sınırlaması yazılmadı — kullanıcı kararı.
- **Kontrol biyopsisi (erişkin):** premium "semptomu geçmeyen ya da riskli erişkinde 1–2. yılda düşünülebilir" · açık ">45 yaşta tanı, ağır tablo, geçmeyen belirti: güçlü şekilde desteklenir". Kitapta açık sayfanın ölçütleri, premiumun "düşünülebilir" tonu.
- **Gluten eşiği:** premium "<10 mg/gün" · beslenme sayfası "gıdada <20 ppm". Farklı birimler, çelişki değil; ikisi de yazıldı.
- **RCD tip 2 aberran IEL:** premium ">%20" · RCD sayfası "≥%20". Kitapta ≥%20.
- **Sıvı/ayrıntı farkı yok**: RCD tedavi basamakları iki kaynakta uyumlu; budesonid dozu yalnız açık RCD sayfasında (9 → 6 → 3 mg).
- Kuyruk bu turla bitti; sonraki turlar için aday tarama yapıldı (aşağıda).

### Tur 11 — (kardiyo) Akut koroner sendromlar · `kitap/kardiyoloji/deneme-bolum.html` s. 1–12 · bitti 02:35
Yeni dosya: şablon ve şekil CSS’i endokrin dosyasından kopyalandı, branş rengi `--brans:#9B2033` (bordo). Kısım 1’in kapağı bölüm açılışıdır; sonraki kısım kapağı **s. 13 (sağ)**.
Sayfalar: 1 bölüm açılışı · 2–3 açık sayfa (Şekil 1: plak rüptürü ↔ erozyonu ikilisi; spektrum tablosu, 4. evrensel tanım, STEMI ve NSTE-AKS EKG ölçütleri, GRACE/TIMI, acil serviste ilk saat) · 4 anlatı (yırtılma, aşınma, kararsız anginanın kayması, skorların kararı nasıl değiştirdiği, taburculukta üç soru) · 5 başvuru (ST yükselmesi olmadan tıkanmayı gören paternler: de Winter, Wellens, Sgarbossa, posterior, Aslanger; klinik prezentasyon; gebelikte EKG) · 6 karar yolu (STEMI reperfüzyon saati, süre hedefleri, gecikme, damar seçimi, SCAD uyarısı, fibrinoliz başarısı, işlem ilaçları) · 7 karar yolu (NSTE-AKS invaziv strateji zamanlaması, MINOCA, triyaj) · 8 başvuru (DAPT, OAC’li hastada üçlü → ikili yol → tek DOAC şeması Şekil 2, ajan seçimi, lipid basamakları, GDMT) · 9 başvuru (mekanik komplikasyonlar, SCAI şok evreleri, mekanik dolaşım desteği, Killip, taburculuk öncesi risk) · 10 başvuru (gebelikte AKS: etiyoloji, troponin, radyasyon, reperfüzyon, ilaç güvenliği, peripartum yönetim) · 11 başvuru (SCAD: iki mekanizma Şekil 3, Saw sınıflaması, zemin ve tetikleyiciler, tedavi) · 12 Notlar.
Son ölçüm: taşma yok (en dolu s.4 −6,1 mm; en boş s.5 −64,7 mm). Sayfa sayısı çift.
Kaynaklar: premium akut-koroner-sendromlar + quiz (5) · açık akut-koroner-sendromlar, aks-oac-antitrombotik-yonetim, gebelikte-akut-koroner-sendrom, spontan-koroner-arter-disseksiyonu-scad. Kart seti yok. Okunmayanlar: akut-kalp-yetersizligi, aritmiler-af-vt-vf, kapak/miyokardit sayfaları (ayrı konular).
Kaynak tutarsızlıkları:
- **Sgarbossa üçüncü ölçütü:** açık sayfa klasik puanlamayı veriyor (aşırı diskordan ST yükselmesi ≥5 mm, 2 puan; toplam ≥3), premium modifiye ölçütü (orantı kuralı ST/S ≤ −0,25). Kitapta ikisi de, ayrı ayrı etiketlenerek.
- **de Winter yaygınlığı:** premium V1–V4/V5 + sıklıkla aVR’de ST yükselmesi · açık sayfa V1–V6. Kitapta premium.
- **GP IIb/IIIa:** premium “rutin önerilmez; masif trombüs, no-reflow, kurtarıcı PCI’da” · açık sayfa aynı ajanları adjuvan listesinde sayıyor. Kitapta premium.
- **Bivalirudin:** premium primer PCI’da BRIGHT-4 rejimiyle üstün · açık sayfa yalnız “yüksek kanama riskli PCI”. Kitapta ikisi de (s.6 ve s.8).
- **Beta-bloker zamanlaması:** premium “kontrendikasyon yoksa başlanır” · açık sayfa “ilk 24 saatte”. Kitapta açık sayfanın süresi.
- **Üçlü tedavi süresi:** açık OAC sayfası aspirin için “1–4 hafta (1–30 gün)”, yüksek iskemik riskte 1–3 ay; premium bu konuyu işlemiyor. Kitapta açık sayfa.
- **LDL hedefi:** premium AKS sonrası basamaklı algoritmada ≥55 mg/dL eşiği · quiz “maksimal statine rağmen ≥70 mg/dL’de non-statin ekle (sınıf 1)”. İkisi farklı eşikler; kitapta ikisi de (tablo ve inci kutusu) — kullanıcı kararı.
- SCAD’de premium yalnız “gebelik/genç kadında en önemli neden” diyor; ayrıntı (Saw sınıflaması, FMD oranı, %95 spontan iyileşme) yalnız açık sayfada.

### Tur 12 — (kardiyo) Klinik lipidoloji ve ASKVH · kardiyo s. 13–24 · bitti 02:47
Sayfalar: 13 kapak (Kısım 2 · Lipidoloji) · 14–15 açık sayfa (Şekil 4: eksojen, endojen ve ters transport yolakları, her halkada hedef ajanlar; PCSK9 genetiği; aterojenik partiküller; PREVENT-ASKVH ve CAC; hedef-popülasyon tablosu) · 16 anlatı (üç yolak, log-doğrusal ve süreklilik kuralı, itirazlara köprü) · 17 karar yolu (hedef → yüksek yoğunluklu statin → ezetimib (IMPROVE-IT, RACING) → PCSK9/inklisiran → intoleransta bempedoik asit) · 18 başvuru (LDL ve TG düşürücü ajanlar, bempedoik asit güvenliği) · 19 karar yolu (SAMS: patern, CK, ikincil nedenler, molekül değişimi, kesin intolerans, IMNM alarmı) · 20 başvuru (statinler arası farklar; non-statinlerin kas güvenliği; farmakogenomik ve ClC-1; özel popülasyon) · 21 başvuru (trigliseritin iki dünyası, Lp(a), HoFH, ailesel hiperkolesterolemi pratiği) · 22 başvuru (hedef tartışması: destekleyen kanıt ↔ itirazlar; beyin kolesterolü) · 23 hızlı tekrar (kart setinden 37 soru) · 24 Notlar.
Son ölçüm: taşma yok (en dolu s.23 −23,6 mm; en boş s.22 −88,3 mm). Kısım çift sayfa; sonraki kapak s. 25 (sağ).
Kaynaklar: premium klinik-lipidoloji-ascvd + kart seti (75) · açık lipidoloji-tedavi-ana, lipidoloji-guncel-kilavuz, lipid-ezetimibe, pcsk9-inhibitorleri, lipidoloji-bempedoik-asit, lipidoloji-statin-karsilastirmasi, lipidoloji-statin-miyopatisi-sams, klinik-sams, sams-yeni-nesil-araclar, statin-intolerans-ezetimibe, lipid-hedef-itirazlari, hiperlipidemi-log-dogrusal-risk, hiperlipidemi-dusuk-ldl-hedefleri, lipidoloji-pcsk9-lpa. Premium quiz (38 KB) bu turda okunmadı — sonraki tura not.
Kaynak tutarsızlıkları:
- **Ezetimibin ek düşüşü:** premium ve tedavi ana sayfası %15–25 · kılavuz sayfası %17–18 · ezetimib sayfası %20–25 (monoterapi %18–24) · kart “yaklaşık %20”. Kitapta %15–25, parantezde monoterapi aralığı.
- **LDL hedef eşiği:** premium ve açık sayfalar sekonder korumada &lt;55 mg/dL · AKS quiz açıklaması “maksimal statine rağmen ≥70 mg/dL’de non-statin ekle”. İki eşik s. 22’de yan yana konuldu; karar kullanıcının.
- **Ağır hipertrigliseridemi eşiği:** premium “&gt;1000 mg/dL pankreatit riski” · tedavi ana sayfası “TG ≥500 mg/dL’de fibrat” · kart “hedef &lt;500”. Kitapta ikisi de (≥500 tedavi eşiği, &gt;1000 en yüksek risk).
- **Bempedoik asidin gücü:** premium ~%20 · bempedoik asit sayfası monoterapide %21–24, statine ek %17–18, ezetimible %38. Kitapta açık sayfanın ayrıntısı.
- **PCSK9 inhibitörünün Lp(a) etkisi:** premium %15–20 (pelacarsen karşılaştırmasında) · pcsk9-lpa ve tedavi sayfası %15–30. Kitapta %15–30, bazal yüksekse %15–20 notu.
- **Statin ilişkili yeni diyabet:** premium “çok nadir” · kart “yılda ~%0,2” · SAMS sayfası risk grubunu tanımlıyor. Kitapta kart verisi.
- Kılavuz ayrışması kitapta açıkça yazıldı: ACC/AHA &lt;70, ESC/EAS &lt;55 mg/dL.

### Tur 13 — (romato) Behçet hastalığı · `kitap/romatoloji/deneme-bolum.html` s. 1–10 · bitti 03:05
Yeni dosya: şablon ve şekil CSS’i endokrin dosyasından kopyalandı, branş rengi `--brans:#5B3E8E` (mor). Kısım 1’in kapağı bölüm açılışıdır; sonraki kısım kapağı **s. 11 (sağ)**.
Sayfalar: 1 bölüm açılışı · 2–3 açık sayfa (Şekil 1: fenotip kümeleri ve tutulum haritası; tanıda işe yarayan ayrıntılar; ISG 1990 ↔ ICBD 2014 karşılaştırması; mukokutanöz bulgular) · 4 anlatı (MHC-I-opati, mimikri ve mikrobiyota, nötrofil–NET ve trombo-inflamasyon, yapışık pıhtı, otoimmün mü otoinflamatuvar mı) · 5 başvuru (organ organ tutulum, ayırıcı tanı) · 6 karar yolu (vasküler Behçet: mekanizma, USG, PAA araması, immünsüpresyon, cerrahi zamanlaması) · 7 karar yolu (nöro-Behçet: tip ayrımı, siklosporin kontrendikasyonu, akut ve idame tedavi, nöro-oküler hasta, yardımcı incelemeler) · 8 başvuru (tutuluma göre tedavi, gebelik, paradoksal etkiler, biyolojik ajanlar) · 9 başvuru (BODI ↔ BDI ↔ VDI, izlem soruları, vakadan karara) · 10 hızlı tekrar (kart setinden 40 soru).
Son ölçüm: taşma yok (en dolu s.10 −0,9 mm; en boş s.5 −76 mm). Çift sayfa.
Kaynaklar: premium behcet-hastaligi + quiz (10) + kart seti (80) · açık behcet-hastaligi-yonetimi, behcet-vaskuler-tutulum, norobehcet-tedavi-algoritmasi, behcet-hasar-indeksleri.
Kaynak tutarsızlıkları:
- **Arteriyel tutulum sıklığı:** premium oran vermiyor (“venöz afinite daha yüksek”) · vasküler sayfa “~%15”. Kitapta ~%15.
- **Talidomid:** premium GİS tutulumunda anti-TNF ile birlikte sayıyor · yönetim sayfası “yan etki ve teratojenite nedeniyle pek tercih edilmez”. Kitapta ikisi de (tedavi tablosunda seçenek, paradoks tablosunda uyarı).
- **Oküler idame:** premium “azatiyoprin/siklosporin” · yönetim sayfası aynı, ama nöro öyküsünde siklosporin dışlanıyor. Kitapta ikisi birlikte, s.7’de kontrendikasyon vurgulandı.
- **BDI süre eşiği:** hasar indeksleri sayfası BDI için ≥3 ay diyor, kart seti VDI için 3 ay diyor; premium yalnız BODI/BDI’yi anıyor. Kitapta üçü ayrı satır (BODI 6 ay, BDI ve VDI 3 ay) — BDI’nin süre eşiği yalnız açık sayfadan.
- **Paterji iğnesi (20 G) ve oral ülser süresi (7–14 gün)** yalnız kart setinde; premium ve açık sayfalarda yok.
- **Faktör V Leiden katkısı (3,69 kat)** yalnız vasküler sayfada.
- Premium “arteriyel tutulumda oklüzyondan çok anevrizma” derken kart “en sık patoloji anevrizma” diyor: uyumlu.

### Tur 14 — (nefro) ADPKD · `kitap/nefroloji/deneme-bolum.html` s. 1–10 · bitti 03:08
Yeni dosya: şablon endokrin dosyasından, branş rengi `--brans:#0E6E6E` (koyu turkuaz). Kısım 1’in kapağı bölüm açılışıdır; sonraki kısım kapağı **s. 11 (sağ)**.
Sayfalar: 1 bölüm açılışı · 2–3 açık sayfa (Şekil 1: kistogenez zinciri ve ilaç hedefleri; bozulan yolaklar tablosu; genetik; Pei-Ravine; böbrek bulguları; doğal seyir ve izlem) · 4 anlatı (siliyopati, iki vuruş ve eşik modeli, kalsiyum–cAMP ekseni, damar duvarı, erken hipertansiyon) · 5 başvuru (polikistik karaciğer, intrakraniyal anevrizma, diğer organ kistleri, karın duvarı, kalp) · 6 karar yolu (tanı ve risk: aile öyküsü, genetik test, Mayo sınıfı, PROPKD, kopeptin) · 7 karar yolu (kan basıncı hedefleri, su-tuz-kilo-protein, tolvaptan endikasyonu ve izlemi, diğer ajanlar) · 8 başvuru (komplikasyon yönetimi, girişim seçenekleri, nakil öncesi kontrol) · 9 başvuru (kardiyovasküler tutulum, damar duvarında mekanizma) · 10 başvuru (15 senaryoluk vakadan karara).
Son ölçüm: taşma yok (en dolu s.7 −14,8 mm; en boş s.9 ve s.10 −83 mm). Çift sayfa.
Kaynaklar: premium adpkd + quiz (10) · açık polikistik-bobrek-hastaligi-pkd, polikistik-bobrek-tedavi, polikistik-bobrek-ekstrarenal, polikistik-bobrek-kardiyovaskuler, polikistik-bobrek-vasculary, polikistik-bobrek-molekuler. Kart seti yok.
Kaynak tutarsızlıkları:
- **Kapak hastalığı sıklığı (klinik önemi var):** premium ve ekstrarenal sayfa “%25–30 kapak anormalliği, en sık MVP” · kardiyovasküler sayfa “güncel katı ölçütlerle çocukta %1, erişkinde %3,4, genel popülasyona yakın”. Kitapta ikisi de s.9’da yan yana.
- **İntrakraniyal anevrizma prevalansı:** premium %9–12 · ekstrarenal sayfa %8–12 · pkd ana sayfası “%10”. Aile öyküsüyle risk: premium %25, ekstrarenal %21–27. Kitapta %8–12 ve %21–27.
- **PKD2 payı:** premium ve pkd ana sayfası %10–15 · moleküler sayfa %15–20. Kitapta %10–15.
- **Nefrolitiazis sıklığı:** premium %20–30 · pkd ana sayfası %20.
- **SDBY yaşı:** premium PKD1 için 55–58 · pkd ana sayfası 54–58.
- **Tolvaptan endikasyonu:** premium yalnız Mayo 1C–1E · pkd ana sayfası “ya da yıllık eGFR kaybı ≥3 mL/dk” ekliyor. Kitapta ikisi de (s.3 ve s.7).
- **Hepatotoksisite sıklığı** (~%5) ve **TEMPO 3:4 sayıları** yalnız açık tedavi sayfasında; premium oran vermiyor.
- **Su alımı:** premium “>2,5–3 L, idrar ozmolalitesi &lt;280” · tedavi sayfası aynı ama PREVENT-ADPKD’nin anlamlı fark göstermediğini ekliyor. Kitapta ikisi de.

### Tur 15 — (nefro) IgA nefropatisi · nefro s. 11–20 · bitti 03:17
Sayfalar: 11 kapak (Kısım 2 · Glomerüler hastalıklar) · 12–13 açık sayfa (Şekil 2: dört vuruş ve her halkayı hedefleyen ajanlar; epidemiyoloji; klinik tablolar; histopatoloji; genetik ve kompleman; izlem) · 14 anlatı (mukozal köken, ikinci-üçüncü-dördüncü vuruş, podositopati, paradigma değişimi) · 15 başvuru (Oxford MEST-C, kısıtlılıklar, çocukta ISKDC, skoru klinikle birleştirme) · 16 karar yolu (sekonder nedenleri dışla, histoloji, tahmin aracı, proteinüri yorumu, acil karar, biyobelirteç) · 17 karar yolu (destekleyici zemin, SGLT2i, endotelin yolağı, TRF-budesonid, sistemik steroid) · 18 başvuru (yeni nesil ajanlar, onay durumu ve kanıt düzeyi) · 19 başvuru (kresentik varyant, IgA vasküliti, kompleman yolağı, ayırıcı tanı) · 20 başvuru (vakadan karara, hasta soruları).
Son ölçüm: taşma yok (en dolu s.12 −14,1 mm; en boş s.16 −70,8 mm). Çift sayfa; sonraki kısım kapağı s. 21 (sağ).
Kaynaklar: premium iga-nefropatisi + quiz (10, açıklamalarıyla) · açık iga-nefropatisi-berger, iga-nefropatisi-guncel-tedavi, iga-nefropatisi-mest-c-iskdc. Kart seti yok.
Kaynak tutarsızlıkları:
- **C1 kresentin anlamı:** premium “C1: %1-24 glomerülde” diyor ve prognostik yorumu C2 üzerinden veriyor · MEST-C sayfası C1 için “yalnız immünsüpresyon almayanlarda kötü prognoz” diyor. Kitapta açık sayfanın ayrımı.
- **M tanımı:** premium “glomerüllerin yarısından fazlasında mesangiyal alanda &gt;4 hücre” · açık sayfalar yalnız “mesangiyal hiperselülarite” diyor. Kitapta premium tanımı.
- **Steroid dozu:** premium TESTING’in düşük doz koluna dozu yazmıyor · güncel tedavi sayfası 0,4 mg/kg/gün metilprednizolon veriyor. Kitapta açık sayfanın dozu.
- **SDBY oranı:** premium %30–45 (bazı kohortlarda %80) · berger sayfası oran vermeden “önemli bir kısmı” diyor.
- **İptakopan proteinüri etkisi** (~%38) ve **narsoplimab faz 3’ünün durdurulması** yalnız açık tedavi sayfasında.
- **Kan basıncı hedefi:** güncel tedavi sayfasında hedef metni içerik kaynağında kesilmiş (“Kan Basıncı Hedefi:” sonrası boş); premium da IgAN’ye özgü sayı vermiyor. Kitapta sayısal hedef yazılmadı, yalnız “hedefe titre et” dendi — açık site içeriğinde eksik alan olarak not.
- Premium ve açık sayfalar yeni ajan listelerinde uyumlu; adlandırma farkı (atacicept/atasisept gibi) Türkçeleştirmede birleştirildi.

### Tur 16 — (onko) Febril nötropeni · `kitap/onkoloji/deneme-bolum.html` s. 1–10 · bitti 03:27
Yeni dosya: şablon endokrin dosyasından, branş rengi `--brans:#7A4B12` (tarçın). Kısım 1’in kapağı bölüm açılışıdır; sonraki kısım kapağı **s. 11 (sağ)**.
Sayfalar: 1 bölüm açılışı · 2–3 açık sayfa (Şekil 1: mukozadan sepsise zinciri ve her halkada önlem; tanımlar; mikrobiyoloji; risk grupları; görüntüleme ve biyobelirteç) · 4 anlatı (bariyer çöküşü, etken profilinin değişimi, maskelenen inflamasyon, 60 dakika kuralı, ateşin geç düşmesi) · 5 karar yolu (ilk 60 dakika: tanım, muayene, örnekleme, antibiyotik, görüntüleme, yatış kararı, risk) · 6 başvuru (MASCC ve CISNE puanlamaları, risk karşılıkları, skordan bağımsız yatış ölçütleri) · 7 karar yolu (ampirik tedavi: monoterapi, ikinci ajan, vankomisin endikasyonları, düşük riskli oral rejim, kinolon istisnası) · 8 başvuru (dirençli ateş, antifungal zamanlaması, biyobelirteçler, de-eskalasyon) · 9 başvuru (profilaksi ve G-CSF) · 10 başvuru (17 senaryoluk vakadan karara).
Son ölçüm: taşma yok (en dolu s.4 −31,5 mm; en boş s.10 −84,5 mm). Çift sayfa.
Kaynaklar: premium febril-notropeni + quiz (10) · açık febril-notropeni-konu, febril-notropeni-mascc-indexi, febril-notropeni-cisne-indexi. Kart seti yok.
Kaynak tutarsızlıkları:
- **Vankomisin kesme süresi:** premium “ilk 48–72 saatte dirençli gram-pozitif izole edilmezse kesilmeli” · açık konu sayfası “2–3 gün içinde hızla stoplanmalı”. Aynı aralık, farklı ifade; kitapta 48–72 saat.
- **Penisilin alerjisinde alternatif:** premium yalnız aztreonam + vankomisin · açık sayfa siprofloksasin + klindamisin seçeneğini de veriyor. Kitapta ikisi de.
- **Düşük riskli ayaktan rejimde alerji:** MASCC sayfası “penisilin alerjisinde klindamisin” diyor; premium bu ayrıntıyı vermiyor.
- **Ampirik ikinci gram-negatif ajan:** premium “aminoglikozid veya kinolon eklenebilir” · açık sayfa “aminoglikozit/karbapenem eklenir” diyor. Kitapta premium.
- **Terapötik G-CSF istisnaları:** premium yalnız “sepsis veya ciddi solunum yetmezliği” · açık sayfa dört maddelik liste veriyor (ANC &lt;100 ve &gt;10 gün, radyolojik pnömoni, ağır invaziv fungal enfeksiyon, sepsis/şok). Kitapta açık sayfanın listesi.
- **Ayaktan tedavi öncesi gözlem süresi** (en az 4 saat) ve **MASCC skor bantlarındaki komplikasyon-mortalite oranları** yalnız MASCC sayfasında.
- **CISNE orta risk (1–2 puan) için standart şema olmaması** yalnız CISNE sayfasında; premium CISNE’yi yalnız ≥3 eşiğiyle anıyor.

### Tur 17 — (nefro) KBH’de hiperfosfatemi ve mineral-kemik bozukluğu · nefro s. 21–30 · bitti 03:40
Sayfalar: 21 kapak (Kısım 3 · Mineral metabolizması) · 22–23 açık sayfa (Şekil 3: adaptasyondan maladaptasyona zinciri; KDIGO hedefleri; diyet fosforunun kaynak hiyerarşisi; vasküler kalsifikasyon ve CPP; renal osteodistrofinin iki ucu) · 24 anlatı (kompanzasyonun bedeli, Klotho direnci, damarın kemikleşmesi, adinamik kemik paradoksu) · 25 başvuru (bağırsak ve böbrek taşıyıcıları, hormonal kontrol ve NHERF1, yeni sensörler, taşıyıcı bozukluğu-sendrom tablosu) · 26 karar yolu (üç D: diyet, ilaç, diyaliz; izlem; hedefler) · 27 başvuru (bağlayıcılar, tenapanor, sinakalset, hangi hastaya hangi ajan) · 28 karar yolu (kemik döngüsünü tahmin et, adinamik kemiği tanı ve geri al, anabolik seçenek) · 29 başvuru (KBH’de osteoporoz ilaçları, bisfosfonatın üç yasak gerekçesi, Klotho’nun öteki yüzü, vakadan karara) · 30 hızlı tekrar (kart setlerinden 38 soru).
Son ölçüm: taşma yok (en dolu s.27 −6,4 mm; en boş s.28 −65,5 mm). Çift sayfa; sonraki kısım kapağı s. 31 (sağ).
Kaynaklar: premium kbh-hiperfosfatemi + quiz (10) + 2 kart seti (kbh-hiperfosfatemi ve hiperf-kbh; ikisi büyük ölçüde aynı içerik) · açık kbh-hiperfosfatemi-yonetimi, kbh-mkb-kapsamli-inceleme, kbh-mkb-bisfosfonat-kontrendikasyonu, bobrek-fosfor-homeostazi-fizyoloji.
Kaynak tutarsızlıkları:
- **Maladaptif evrenin GFR eşiği:** premium “GFR &lt;20–30 mL/dk” · yönetim sayfası “GFR 25–40 mL/dk’nın altına düştüğünde”. Kitapta premium.
- **Diyalizde uzaklaşan fosfor:** açık yönetim sayfası “seans başına ~900 mg” · quiz açıklaması “haftalık 2,1–3,6 g”. İkisi de yazıldı (s.22 ve s.26).
- **Diyalizat kalsiyumu:** iki kart seti aynı soruyu farklı birimle veriyor (2 mEq/L ↔ 1,25 mmol/L = 2,5 mEq/L). Kitapta 2,5 mEq/L (1,25 mmol/L) — kart setlerinden biri “2 mEq/L” diyor, çelişki kullanıcıya bırakıldı.
- **Sinakalsetin konumu:** kapsamlı inceleme sayfası sHPT’de öneriyor · kart seti adinamik kemikte kontrendike sayıyor. Kitapta ikisi de bağlamıyla (s.27 ve s.28).
- **Ferrik sitrat:** premium “sistemik demir emilimiyle depoları doldurur” · yönetim sayfası aynı; sukroferrik oksihidroksitte “sistemik emilim minimal” ayrımı yalnız premiumda.
- **Kemik biyopsisi:** premium altın standart demiyor, kapsamlı inceleme ve kart setleri diyor. Kitapta altın standart.
- İki premium kart seti (70’er kart) neredeyse birebir aynı; yalnız ifade farkları var — içerik sahibi için birleştirme adayı.

### Tur 18 — (nefro) Asit-baz bozuklukları · nefro s. 31–40 · bitti 03:55
Sayfalar: 31 kapak (Kısım 4 · Asit-baz) · 32–33 açık sayfa (Şekil 4: üç savunma hattı ve Tip A interkale hücre; günlük asit yükü; dört bozukluk; solunumsal nedenler; potasyum ilişkisi; bikarbonat endikasyonları) · 34 anlatı (oranın korunması, aşırı kompanzasyonun imkânsızlığı, sınırlar, böbreğin SID işi, delta oranının neden 1:1 olmadığı) · 35 karar yolu (beş adım + klinik korelasyon) · 36 başvuru (kompanzasyon formülleri, miks imzaları, SIG, Stewart bakışı) · 37 başvuru (GOLDMARK, normal AG nedenleri) · 38 başvuru (metabolik alkaloz iki fazı, idrar klorürü algoritması, RTA tipleri) · 39 başvuru (delta-delta hesabı ve yorumu, UAG’nin sınırı ve idrar ozmolal açığı) · 40 başvuru (18 senaryoluk vakadan karara).
Son ölçüm: taşma yok (en dolu s.32 −36,5 mm; en boş s.37 −102 mm; sayfa 37’deki RTA tablosu 10 mm taşma nedeniyle s.38’e taşındı).
Kaynaklar: premium asit-baz-dengesi · açık asit-baz-kompanzasyon-ilkeleri, metabolik-asidoz, metabolik-alkaloz, delta-anyon-acigi-delta-delta-orani, renal-tubuler-asidoz-rta-tipleri. **Premium quiz (242 KB) bu turda okunmadı** — dosya çok büyük, sonraki tura not. asit-baz-denge-bozukluklari ve asit-baz-fizyopatoloji sayfaları da okunmadı (diğerleriyle örtüşüyor).
Kaynak tutarsızlıkları:
- **Normal anyon açığı aralığı:** premium “8–12 mEq/L” · delta sayfası “10 ± 2 ya da 12 ± 4, analizöre bağlı”. Kitapta premium aralığı, delta sayfasındaki not s.39’da.
- **Delta oranı eşikleri:** premium “1–1,6 saf; &lt;1 ek hiperkloremik; &gt;1,6 (bazen &gt;2) ek alkaloz” · delta sayfası eşik vermeden niteliksel anlatıyor. Kitapta premium eşikleri.
- **Bikarbonat endikasyonu:** premium “pH &lt;7,1 + hemodinamik bozulma” · metabolik asidoz sayfası pH &lt;7,10 (ya da HCO₃⁻ &lt;6), ayrıca pH 7,10–7,20 + ağır AKI (BICAR-ICU) ve ağır hiperkloremik asidozda pH &lt;7,20. Kitapta açık sayfanın ayrıntılı listesi.
- **Metabolik alkalozda kompanzasyon formülü** (0,7 × HCO₃⁻ + 20) ve **solunumsal bozuklukların akut/kronik katsayıları ve limitleri** yalnız kompanzasyon sayfasında; premium bunları vermiyor.
- **Tip 2 RTA’da idrar pH’ı** açık RTA sayfasında içerik kesilmiş görünüyor (“idrar pH’ı  olabilir”); kitapta “başlangıçta alkali, eşiğe inince düşebilir” biçiminde yazıldı — açık sitede eksik alan olarak not.
- **UAG yalancı pozitifliği ve idrar ozmolal açığı** yalnız metabolik asidoz sayfasında; premium yalnız UAG’yi anlatıyor.

### Tur 19 — (gogus) Sarkoidoz · gogus s. 1–10 · bitti 07:40 (kullanıcı “devam” dedi; cron penceresi 04:50’de dolmuştu)
Yeni branş dosyası: `kitap/gogus/deneme-bolum.html`, branş rengi `#1D5A96`. Kanonik dizin adı `canonical/gogus` (premium tarafında `gogus-hastaliklari`).
Sayfalar: 1 bölüm açılışı (Kısım 1 · Sarkoidoz) · 2–3 açık sayfa (Şekil 1: antijenden granüloma zinciri; Scadding evreleri ve remisyon oranları; HRCT; genetik yatkınlık; granülom mimarisi; fonksiyon-izlem; prognozu kötüleştirenler) · 4 anlatı (yatkınlık-tetik, Th1/Th17.1 polarizasyonu, mTORC1 ve JAK-STAT ile kalıcılık, kalsiyumun hikâyesi, steroidin neden hızlı çalıştığı, prognozun kalpte belirlenmesi) · 5 başvuru (ekstrapulmoner tutulum, Löfgren ve Heerfordt, ayak bileği artritinin ayırıcı tanısı, böbreğin iki yolu, invazif tanı gerekmeyen/gereken durumlar) · 6 karar yolu (üç ayaklı tanı, BAL okuma tablosu, ARB/GMS/PAS-kültür-PCR zorunluluğu) · 7 başvuru (kalsiyum metabolizması: mekanizma, laboratuvar profili, sıklıklar, tedavi basamakları, renal bedel) · 8 karar yolu (kimi neyle tedavi edelim: SARCORT, PREDMETH, ikinci basamak, anti-TNF, JAK/antifibrotik, steroid tasarrufu) · 9 başvuru (ayırıcı tanı: üç ikiz tablosu, DISR ilaçları, organa özgü ikizler, PET/BT çaresizliği) · 10 başvuru (20 senaryoluk vakadan karara + hiperkalsemi ayırıcı tablosu).
Son ölçüm: taşma yok (en dolu s.6 −0,7 mm ve s.10 −4,6 mm; en boş s.8 −53,6 mm). Çift sayfa; sonraki kısım kapağı s. 11 (sağ).
Kaynaklar: premium `topics/gogus-hastaliklari/sarkoidoz` + `quizzes/.../sarkoidoz-quiz-1` (7 soru) + `vakalar/.../sarkoidoz-vaka-1` (4 adım) · açık `canonical/gogus/sarkoidoz-ana`, `sarkoidoz-ayirici-tani`, `sarkoidoz-hiperkalsemi`.
Kaynak tutarsızlıkları ve kusurları:
- **Premium “Pratik Özet — 5 Altın Spot” maddesi 3 BOZUK:** “sT4↓ + TSH hafif↑ değil, bu AML — burada: sIL-2R > ACE tanıda.” Başka bir konudan metin sızmış görünüyor; kitaba alınmadı, yalnız “sIL-2R tanıda ACE’den üstün” kısmı başka kaynaklarla doğrulandığı için kullanıldı.
- **Hiperkalsiüri sıklığı:** premium quiz “~%40” · açık hiperkalsemi sayfası da %40; açık ana sayfa %20. Kitapta iki değer de yan yana yazıldı (s.7).
- **Hiperkalsemi sıklığı:** premium ve açık hiperkalsemi sayfası “%2–20” · açık ana sayfa “%5–10”. İkisi de yazıldı (s.7).
- **Kardiyak tutulum otopsi sıklığı:** premium “%20–70” · açık ana sayfa “%25–70”. Kitapta premium (s.5).
- **Metotreksat dozu:** premium konu “15 mg/hafta”, quiz ve vaka “10–15 mg/hafta”. Kitapta 10–15 mg/hafta.
- **Löfgren’de HLA:** DRB1*0301+DQB1*0201 iyi prognoz, DRB1*15 yokluğu kötü prognoz — bu ikisi yalnız premium quizde birlikte veriliyor; açık sayfa yalnız birincisini anlatıyor.
- **BAL referans bandı** (normal 1,5–3,5) yalnız premium quizde; açık ayırıcı tanı sayfası yalnız eşikleri (>3,5 / <2,0 / <1,0) veriyor.
- **Hidroksiklorokin ve siklosporinin yeri** yalnız premium vakada geçiyor; premium konu sayfası bu iki ajanı saymıyor.
