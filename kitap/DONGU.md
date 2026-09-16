# Hızlı Bakış — konu döngüsü (16 Eylül 2026'da başladı, sürüyor)

Kullanıcı isteği: sıradaki konuyu kitaba ekle, **her turun arasında 5 dakika dinlen**; bitiş saati yok, kullanıcı söyleyene kadar sürer.
Her tur bu dosyayı okur, ilk `SIRADA` konuyu işler, günlüğe yazar.
Zamanlayıcı: CronCreate işi **75d8b386** (`*/5 * * * *`). Durdurmak için `CronDelete 75d8b386`.
Bir tur çalışırken bir sonraki tetik gelirse: konu `ÇALIŞIYOR` durumundaysa yeni konuya başlama, yarım kalanı bitir.
Kuyruk boşalırsa aday taraması yap (hem premium hem açık sayfa eşleşmesi şart) ve kullanıcıya sor.

## Önizleme kuralı (kullanıcı, 16 Eylül)

Önizlemeyi tüm bölüm için basma; **yalnızca üzerinde çalışılan kısmı** göster.
`node kitap/pdf.cjs <dosya> --onizleme --sayfa A-B` artık belgeden yalnız o aralığı
içeren geçici bir kopya (`cikti/…-parca.html`) üretip PDF ve PNG'yi ondan basıyor.
Tam belgeyi basmak gerekirse `--tam` eklenir. (80 sayfalık endokrin dosyasında
tam basım 120 saniyeyi aşıyordu; parça kipinde tek sayfa ~10 saniye.)

## Kurallar (kullanıcının sözleri)

- Endokrinden git; endokrinde daralırsan **gastroya** geç.
- **Açıkta VE premiumda bilgisi olanları** tercih et. Az bilgisi olanı, açık + premium tam hazır olmayanı **elleme**.
- Kaynak: açık ana sayfa + onun **ileri okuma** (alt) sayfaları + premium konu, quiz, kart. Dışarıdan bilgi ekleme.
- Kaynaklar birbirini tutmuyorsa kitapta **premium** sürümünü kullan, tutarsızlığı günlüğe yaz (düzeltme kullanıcının).
- **Yapay zeka yer tutucularını ATLA** (kullanıcı, 16 Eylül): "AI taslak", "🤖", "⚠️ Uyarı: MediSea…", "bu bölüm yapay zeka ile…", "[eklenecek]", "Lorem", "TODO", "örnek metin", içeriği olmayan kapsam paragrafları ve yarım/kopuk cümleler kitaba alınmaz. Her turda kaynaklar yer tutucu desenleriyle taranır, bulunanlar günlüğe yazılır.

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
| 20 | (hemato) KLL | kll (+ hematolojik maligniteler) | kll + quiz + 88 kart | BİTTİ (hemato s. 1–10) |
| 21 | (hemato) AML | aml, aml-tedavi-algoritmasi, aml-geriatrik-degerlendirme, aml-gilteritinib-* | aml-ana + quiz + 80 kart + 4 vaka + 10 inci | BİTTİ (hemato s. 11–22) |
| 22 | (nefro) Membranöz nefropati | membranoz-nefropati-mn, -patofizyolojisi, -klinik, -tedavi-yonetimi | membranoz-nefropati + quiz | BİTTİ (nefro s. 41–50) |
| 23 | (hemato) İmmün trombositopeni | immun-trombositopeni-itp, itp-tanisal-yaklasim, itp-tedavi, gebelikte-ITP | itp + quiz + 65 kart | BİTTİ (hemato s. 23–32) |
| 24 | (hemato) Antikoagülasyon stratejileri | antikoagulasyon-stratejileri (28 KB) | antikoagulasyon-stratejileri + quiz (5 vaka) | BİTTİ (hemato s. 33–44) |
| 25 | (enfeksiyon) Bruselloz | bruselloz (25 KB) — yeni branş | bruselloz + quiz (23 soru) | BİTTİ (enfeksiyon s. 1–12) |
| 26 | (endokrin) Hipertiroidi ve Graves | hipertiroidi (37 KB), yaslida-hipertiroidizm (31 KB), gebelikte-hipertiroidi-kilavuz-karsilastirmasi (25 KB) | hipertiroidi + graves-hastaligi + quiz + kart | BİTTİ (endokrin s. 69–80) |
| 27 | (enfeksiyon) İnvaziv fungal enfeksiyonlar | invazive-mantar-enfeksiyon (36 KB), mantar-enfeksiyon-ana-sayfa (13 KB) | invaziv-fungal-enfeksiyonlar + quiz | BİTTİ (enfeksiyon s. 13–24) |
| 28 | (endokrin) Feokromositoma ve paraganglioma | feokromositoma-ve-paraganglioma (25 KB) | feokromositoma + quiz | BİTTİ (endokrin s. 81–92) |
| 29 | (enfeksiyon) CRKP | crkp-enfeksiyonu (18 KB) | crkp + quiz + 80 kart | BİTTİ (enfeksiyon s. 25–36) |
| 30 | (endokrin) Erkek osteoporozu | erkek-osteoporozu-ana-sayfa (25 KB), erkek-osteoporozu-testosteron (32 KB) | erkek-osteoporozu + transplantasyon-osteoporozu + quiz | BİTTİ (s. 93–104) |
| 31 | (onko) Pankreas kanseri | pankreas-kanseri-ana-sayfa + 8 çocuk sayfa (KRAS, SMAD4, ileri tedaviler, RNA aşılar…) | pankreas-kanseri (onko + gastro) + quiz + kart | BİTTİ (s. 11–22) |

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

### Tur 20 — (hemato) Kronik lenfositik lösemi · hemato s. 1–10 · bitti (kullanıcı isteğiyle; cron döngüsü kapalı)
Yeni branş dosyası: `kitap/hematoloji/deneme-bolum.html`, branş rengi `#6E1E3C`.
Sayfalar: 1 bölüm açılışı (Kısım 1 · KLL) · 2–3 açık sayfa (Şekil 1: MBL → KLL/SLL → Richter şeridi; klinik prezentasyon; epidemiyoloji; tanı ölçütleri ve morfoloji; immünofenotip; KLL↔MCL tablosu) · 4 anlatı (hücrenin kökeni ve BCR, IGHV paradoksu, miR15/16–BCL-2, mikroçevre bağımlılığı, iki yüzlü bağışıklık; kenarda prognozun moleküler ekseni) · 5 başvuru (Rai, Binet, KLL-IPI, IPS-E, Lugano; riske göre yol; hangi test neyi söyler) · 6 karar yolu (klonalite → KLL/SLL → taklitçiler → risk → sitopeni ayrımı; vakadan karara 6 senaryo) · 7 karar yolu (iwCLL tedavi endikasyonları, karar şeridi, vakadan karara 6 senaryo) · 8 başvuru (BTKi, pirtobrutinib, venetoklaks, anti-CD20, idelalisib, CAR-T/nakil; kemoterapinin bugünü; MRD, relaps ve refrakter tanımları; yan etki yönetimi) · 9 başvuru (enfeksiyon ve aşılar, otoimmün komplikasyonlar, ikincil malignite, Richter transformasyonu) · 10 hızlı tekrar (40 soru).
Son ölçüm: taşma yok (en dolu s.9 −8,6 mm ve s.2 −8,7 mm; en boş s.4 −31,5 mm). Çift sayfa; sonraki kısım kapağı s. 11 (sağ).
Kaynaklar: premium `topics/hematoloji/kll` + `quizzes/hematoloji/kll-quiz-1` (10 soru) + `flashcards/hematoloji/kll` (88 kart) · açık `canonical/hematoloji/kll` (çocuk sayfası yok).
Kaynak tutarsızlıkları:
- **Richter sıklığı:** açık sayfa “%2–10” · kart seti “yıllık ~%1”. İkisi de s.9’da yazıldı (biri kümülatif, biri yıllık olabilir ama kaynaklar bunu söylemiyor).
- **Otoimmün komplikasyon sıklığı:** açık sayfa “%10–25” · premium yalnız “sık” diyor, sayı vermiyor. Kitapta açık sayfanın sayısı.
- **Lenfosit katlanma zamanı:** açık sayfa “doubling time %50 artış” (süre belirtmiyor) · kart seti “&lt;6 ay” ve ayrıca “2 ayda %50 artış”. Kitapta kart setinin iki ölçütü birlikte.
- **Masif splenomegali:** açık sayfa “kosta altını ≥6 cm geçen” · kart “sol kostal marjın ≥6 cm altında” — aynı ölçüt, farklı ifade.
- **İkincil solid tümör:** premium konu ve quiz “en sık cilt kanserleri (melanom ve non-melanom)” · kart seti “en sık ikincil solid organ tümörü akciğer kanseri”. İkisi de s.9’da, ayrımıyla yazıldı — içerik sahibi karar vermeli.
- **Kemik iliği infiltrasyon oranı %30** yalnız kart setinde; premium konu ve açık sayfa bu eşiği vermiyor.
- Premium konu sayfası evreleme (Rai/Binet), tedavi endikasyonları ve tedavi ajanlarını **hiç içermiyor**; bu bölümün tamamı açık sayfa ve kart setinden geldi. Premium konu daha çok tanı-biyoloji ağırlıklı.

---

## Döngü durumu
Cron döngüsü kapandı (pencere 16 Eylül 2026 04:50’de doldu; zamanlayıcıda iş kalmadı). Kuyruk boş — yeni konular kullanıcı onayıyla eklenecek.

### Tur 21 — (hemato) Akut miyeloid lösemi · hemato s. 11–22 (Kısım 2)
Sayfalar: 11 kısım kapağı (altı altın kural) · 12–13 açık sayfa (Şekil 2: CHIP → Tip 1 → Tip 2 → AML zinciri; sayılarla; tanıya giden sıra; klinik prezentasyon; tanının üç ayağı; tam remisyon ölçütleri; yanıt kategorileri CR/CRi/MRD/refrakter/relaps) · 14 anlatı (iki vuruş, klonal zemin ve CHIP, lösemik kök hücre, sınıflamanın değişme nedeni, yaş değil rezerv; kenarda zemin-yatkınlık ve MRD yöntemleri) · 15 başvuru (WHO5 ↔ ICC 2022 blast eşiği tablosu, temel genetik anormallikler, sekonder AML’nin moleküler imzası) · 16 başvuru (ELN 2022 üç grup, ELN 2024 güncellemeleri, riskten karara şeridi, vakadan karara 4 senaryo) · 17 karar yolu (dört onkolojik acil: lökostaz, APL koagülopatisi, diferansiyasyon sendromu, tümör lizis + özet tablo) · 18 karar yolu (7+3, genetiğe göre ekleme: midostaurin/quizartinib/GO/CPX-351, konsolidasyon, idame; vakadan karara 5 senaryo) · 19 karar yolu (kapsamlı geriatrik değerlendirme, üç kategori, unfit ilaçları, venetoklaks–azol etkileşimi) · 20 başvuru (midostaurin ↔ gilteritinib tablosu, relaps/refrakter, bypass direnci, gilteritinib QTc yönetimi) · 21 başvuru (APL indüksiyondan izleme, allo-HCT kime-ne zaman, hazırlık rejimleri) · 22 hızlı tekrar (40 soru).
Son ölçüm: taşma yok (en dolu s.16 −8,5 mm ve s.22 −7,4 mm; en boş s.14 −49,8 mm). Kısım 11–22 = 12 sayfa, çift.
Kaynaklar: premium `topics/hematoloji/aml-ana` + `quizzes/.../aml-ana-quiz-1` (9 soru) + `flashcards/.../aml-ana` (80 kart) + `pearls/.../aml-ana` (10 inci) + 4 vaka · açık `canonical/hematoloji/aml`, `aml-tedavi-algoritmasi`, `aml-geriatrik-degerlendirme`, `aml-gilteritinib-midostaurin`, `aml-gilteritinib-ds-yonetimi`.
Kaynak tutarsızlıkları ve kusurları:
- **CEBPA blast eşiği çelişkisi:** premium tablo “CEBPA mutasyonu — WHO5: ≥%20 blast şartı korunuyor · ICC: blasta bakılmaz” diyor; açık sayfa “WHO5, biallelik/bZIP mutant CEBPA için ≥%20 sınırını korumuştur” diyerek WHO5 tarafını doğruluyor ama ICC tarafını hiç vermiyor. Kitapta premium tablosu, altına açık sayfanın notu düşüldü (s.15).
- **AML kart setinde başka hastalıkların kartları var:** 80 kartın bir bölümü ALL (t(9;22) p190/p210, t(4;11), common ALL CD10), Burkitt t(8;14) ve KML ile ilgili. Bunlar AML bölümüne alınmadı — kart seti içerik sahibi için ayıklama adayı.
- **FLT3-ITD risk grubu:** premium genetik tablosu “Intermediate/Adverse” diyor; ELN 2022 tablosu ve kart seti “allelik orandan bağımsız Intermediate” diyor. Kitapta ELN tablosu ve kart (s.16).
- **Lökostazda ilk hamle:** premium acil tablosu “acil lökoferez veya hidroksiüre”, kart seti “lökoferez yerine öncelikle hızlı sitoredüktif kemoterapi” diyor. Kitapta kart setinin vurgusu, lökoferez ikinci sırada (s.17).
- **Karnofsky eşiği:** kart “≤%90 (bazen %70 eşiği)” — kaynak kendi içinde belirsiz; kitapta bu belirsizlikle yazıldı (s.21).
- **Richter benzeri bir ayrım yok ama “sekonder AML gen listesi” iki yerde farklı:** premium ek bilgi kutusu RUNX1’i MDS ilişkili adverse mutasyonlar arasında sayıyor, kart seti “WHO5’te listeden çıkarılan gen RUNX1” diyor. İkisi de yazıldı (s.15 ve s.16 spot).
- Premium quiz ve vakalar, açık sayfalarda bulunmayan iki pratik ayrıntıyı ekliyor: **venetoklaks–azol etkileşimi** (flukonazolle 400 → 100 mg ya da mikafungine geçiş) ve **gilteritinib QTc yönetimi** (elektrolit düzeltme, ilaç değişimi, geçici kesme, 80 mg ile yeniden başlama). İkisi de kitaba alındı (s.19 ve s.20).

### Tur 22 — (nefro) Membranöz nefropati · nefro s. 41–50 (Kısım 5)
Sayfalar: 41 kısım kapağı (altı altın kural) · 42–43 açık sayfa (Şekil 5: antikordan proteinüriye zinciri; sayılarla; paradigma değişimi; klinik başvuru; idrarda ne var ne yok; tanı anında istenecekler; başlangıç biçiminin ayırt ediciliği) · 44 anlatı (IgG4 paradoksu ve lektin yolağı, sublitik C5b-9, otofaji tıkanması, epitop yayılması, lipotoksisite; kenarda hiperkoagülabilite) · 45 başvuru (dokuz hedef antijenlik harita, IgG alt sınıfı ve birikim paterni, alt tipin değiştirdikleri) · 46 başvuru (tromboemboli, akut böbrek hasarı nedenleri, hiperlipidemi, pediyatrik MN, nefrotik sendromun sistemik yükü) · 47 karar yolu (altı adımlı tanı ve sekonderite; biyopside ne görülür) · 48 karar yolu (destekleyici bakım, KDIGO 2021 dört risk grubu, ajan seçiminde hasta faktörleri) · 49 başvuru (ajanlar ve kanıt: MENTOR, RI-CYCLO, STARMEN, yeni nesil anti-CD20, anti-CD38, kompleman/BAFF; direncin kaynakları; tedavi altında izlem) · 50 başvuru (21 senaryoluk vakadan karara).
Son ölçüm: taşma yok (en dolu s.43 −17,8 mm; en boş s.45 −41,4 mm). Kısım 41–50 = 10 sayfa, çift.
Kaynaklar: premium `topics/nefroloji/membranoz-nefropati` + `quizzes/nefroloji/membranoz-nefropati-quiz-1` (10 soru) · açık `canonical/nefroloji/membranoz-nefropati-mn`, `-patofizyolojisi`, `-klinik`, `-tedavi-yonetimi`.
Kaynak tutarsızlıkları ve kusurları:
- **Açık klinik sayfasında iki cümle yarım kalmış:** (1) “Kritik Eşik: VTE riski, serum albümin düzeyi  (veya” — eşik değeri yok; (2) “makroskobik hematüri erişkinlerde nadirdir (” — parantez kapanmamış. Kitapta VTE eşiği için tedavi sayfasının verdiği &lt;2,0–2,5 g/dL kullanıldı ve s.46’da bu not düşüldü.
- **THSD7A sıklığı:** premium konu “küçük bir kısmı” diyor, sayı vermiyor; açık MN sayfası “%2–5”. Kitapta açık sayfanın sayısı.
- **NELL-1 payı:** açık sayfa “PLA2R negatiflerin %10’u” · premium yalnız niteliksel anlatıyor.
- **Spontan remisyon oranı** (~%30) yalnız açık tedavi sayfasında; premium bu sayıyı vermiyor.
- **Renal ven trombozu prevalansı %5–63** çok geniş bir aralık olarak veriliyor (açık klinik sayfası); kaynak aralığın nereden geldiğini açıklamıyor, kitapta olduğu gibi aktarıldı.
- **Epitop yayılması ve anti-rituksimab antikorları** premium ve açık sayfada birbirini destekliyor (%23–43) — çelişki yok, iki kaynak da kullanıldı.
- Premium konu sayfası **evreleme/tedavi algoritması içermiyor**; KDIGO 2021 risk grupları, destekleyici bakım ve ajan kanıtları tamamen açık `-tedavi-yonetimi` sayfasından geldi. (AML turundaki kalıbın aynısı: premium biyoloji ağırlıklı, açık sayfa yönetim ağırlıklı.)

### Tur 23 — (hemato) İmmün trombositopeni · hemato s. 23–32 (Kısım 3)
Sayfalar: 23 kısım kapağı (altı altın kural) · 24–25 açık sayfa (Şekil 3: iki koldan trombositopeni şeridi; sayılarla; eşikler tablosu; evreleme ve tanımlar; klinik; İTP’de ne beklenir ne beklenmez) · 26 anlatı (antikor ve dalağın çifte rolü, kompleman ve Fc-bağımsız desialilasyon yolu, T hücre disregülasyonu, TPO’nun neden yükselmediği; kenarda yıkımın dört yolu, sekonderde mekanizma, makrofajın tarafı) · 27 karar yolu (beş adımlı dışlama tanısı + hangi test ne işe yarar) · 28 başvuru (sekonder İTP, ilaca bağlı İTP, vakadan karara) · 29 karar yolu (tedavi basamakları, eşikler, acil kanama paketi, IVIg mekanizması) · 30 başvuru (ajanlar tablosu, dirençli hastalıkta yeni hedefler, klasik immünsüpresanlar) · 31 başvuru (gebelik, yaşlı hasta, cerrahi köprüleme, gebelikte ayırıcı tanı) · 32 hızlı tekrar (40 soru).
Son ölçüm: taşma yok (en dolu s.26 −5,4 mm ve s.32 −7,4 mm; en boş s.31 −57,0 mm). Kısım 23–32 = 10 sayfa, çift.
Kaynaklar: premium `topics/hematoloji/itp` + `quizzes/hematoloji/itp-quiz-1` (10 soru) + `flashcards/hematoloji/itp` (65 kart) · açık `canonical/hematoloji/immun-trombositopeni-itp`, `itp-tanisal-yaklasim`, `itp-tedavi`, `gebelikte-immün-ITP-yonetimi`.
Kaynak tutarsızlıkları:
- **TPO düzeyi — doğrudan çelişki:** premium konu ve quiz “trombositopeni derecesine göre <b>uygunsuz normal ya da DÜŞÜK</b>” diyor; kart seti “İTP’de normal veya hafif YÜKSEK, aplastik anemide belirgin yüksek” diyor. Kitapta premium sürümü (kural gereği), ayrım s.26 ve s.27’de yazıldı — <b>kullanıcı kararı gerekiyor</b>.
- **Kemik iliği endikasyonu:** açık tanısal sayfa “yaşa bakılmaksızın yalnız belirli endikasyonlarda (Çin kılavuzları hâlâ rutin öneriyor)” · kart seti “60 yaş üstünde daha kritik”. Kitapta açık sayfanın güncel kuralı, yaşlıda sitogenetik+NGS notu s.30’da.
- **TPO-RA yanıt oranı:** açık `immun-trombositopeni-itp` “%70–80” · açık `itp-tedavi` “%70–90”. Kitapta geniş aralık (%70–90) kullanıldı.
- **Rituksimab kalıcı yanıtı:** `immun-trombositopeni-itp` “kalıcı kür ihtimali %20–30” · `itp-tedavi` “5. yılda %21”. İkisi de uyumlu; kitapta ikinci sayfanın sayısı.
- **Nöraksiyel anestezi eşiği:** `immun-trombositopeni-itp` “&gt;80” · gebelik sayfası “≥70–80”, kart “≥80”. Kitapta ≥70–80 aralığı ve “&lt;50’de kesinlikle yapılmaz” kuralı birlikte.
- **Splenektomi erteleme süresi:** “en az 12–24 ay” (iki açık sayfa) · kart “en az 12 ay”. Kitapta 12–24 ay.
- Premium konu sayfası yine **tedavi içermiyor** (saf patogenez); tanı, tedavi, gebelik ve yaşlı yönetimi tamamen açık sayfalardan geldi.

### Tur 24 — (hemato) Antikoagülasyon stratejileri · hemato s. 33–44 (Kısım 4)
Sayfalar: 33 kısım kapağı · 34–35 açık sayfa (Şekil 4: böbrek bağımlılığı ekseni; sayılarla; mekanizmalar; etkileşimler; düzey ölçümü; VKA↔DOAC karşılaştırma tablosu; warfarinden DOAC’a geçiş eşikleri) · 36 anlatı (ajan seçiminin dört ekseni: böbrek, emilim, kanama profili, geri dönüş planı + uyum) · 37 başvuru (CHA₂DS₂-VASc, tedavi eşikleri, subklinik AF sınıfları, kardiyoversiyon protokolü, DOAC ne zaman tercih edilir) · 38 karar yolu (akut VTE başlangıç fazı, doğrudan başlanabilenler ↔ ön tedavi zorunlu olanlar, warfarin örtüşmesi, geçiş pencereleri) · 39 başvuru (kanser ilişkili tromboz üç karar, Khorana skoru ve genişletilmiş modeller, trombositopenide akut VTE bandları, ek kanama risk faktörleri) · 40 başvuru (profilaksi eşikleri, obezite, kısa bağırsak sendromu, reprodüktif çağ kadın, DOAC kontrendike üç tablo) · 41 karar yolu (kesme süreleri tablosu, köprüleme, yeniden başlama, perioperatif akış şeridi) · 42 başvuru (kanama yönetimi, ajan ajan reversiyon, kanama profili sınıf farkları) · 43 başvuru (21 senaryoluk vakadan karara) · 44 hızlı tekrar (40 soru).
Son ölçüm: taşma yok; hematoloji dosyasının tamamı (44 sayfa) yeniden ölçüldü, en dolu s.11/23/33 kısım kapakları (0,0 mm) ve s.26 (−5 mm).
**Kendi hatam ve düzeltmesi:** Kısım 4 eklenince **bölüm açılışı içindekiler listesi 109 mm taştı** — dört kısmın tüm sayfaları tek tek listeleniyordu. Liste nefroloji dosyasındaki gibi kısım başına tek satıra indirildi (“Kapak · açık sayfa · anlatı · iki karar yolu · beş başvuru · tekrar”). Aynı taşma nefroloji Kısım 6 eklenirken de olacak; oradaki liste zaten kısım başına tek satır.
Kaynaklar: premium `topics/hematoloji/antikoagulasyon-stratejileri` (yalnız kapsam metni) + `quizzes/.../antikoagulasyon-stratejileri-quiz-1` (5 ileri vaka) · açık `canonical/hematoloji/antikoagulasyon-stratejileri` (21 bölüm) + ileri okumalar `vka-doac-karsilastirma`, `kanser-iliskili-tromboz`, `trombositopenide-antikoagulasyon`. (`kisa-bagirsak-sendromunda-antikoagulasyon` sayfası açılmadı; ana sayfa ve quiz aynı içeriği veriyordu.)
Kaynak tutarsızlıkları ve gözlemler:
- **Premium “konu” sayfası bu kez gerçek bir konu metni değil:** yalnızca quizin kapsamını anlatan tek paragraf. Yani bu turda premium katkısı tamamen quizden geldi — içerik sahibi için not: bu dosya konu sayfası gibi görünüyor ama değil.
- **Khorana yüksek risk kesimi:** ana sayfa “Khorana ≥2 olan orta-yüksek riskli hastada profilaksi düşünülür” diyor; CAT sayfası “yüksek risk ≥3, bazı güncel kılavuzlar ≥2” diyor. Kitapta ikisi de (s.39).
- **Dabigatranın protein bağlanması:** reversiyon bölümü “~%35”, quiz açıklaması yalnız “düşük” diyor — çelişki yok, sayı ana sayfadan.
- **Andeksanet alfa:** hem premium quiz hem açık sayfa Aralık 2025’te ABD pazarından çekildiğini söylüyor; kitapta bu tarih açıkça yazıldı (kaynak tarihli bilgi, sonradan güncellenmesi gerekebilir).
- **Nöraksiyel/cerrahi eşikleri** ve **kardiyoversiyon süreleri** açık sayfa ile quiz arasında uyumlu.
- Açık ana sayfa çok sayıda “Ayrıntı →” bağlantısıyla çocuk sayfalara gönderiyor; bu bölümde o çocuk sayfaların üçü de kitaba katıldı.

### Tur 25 — (enfeksiyon) Bruselloz · enfeksiyon s. 1–12 (yeni branş)
Yeni branş dosyası: `kitap/enfeksiyon/deneme-bolum.html`, branş rengi `#55671C` (zeytin yeşili). Dokuzuncu bölüm.
Sayfalar: 1 bölüm açılışı · 2–3 açık sayfa (Şekil 1: makrofaj içinde dört evre eBCV→T4SS→rBCV→aBCV; sayılarla; “neden büyük taklitçi”; dört tür; bulaş; çevre direnci ve biyogüvenlik; klinik tablo ve laboratuvar sıklıkları) · 4 anlatı (silahsız patojen, vakuolü ele geçirmek, konağı yeniden programlamak, Truva atı çıkışı; kenarda efektörler ve metabolik kayma) · 5 başvuru (osteoartiküler, endokardit, nörobruselloz, genitoüriner, vasküler; tüberkülozla karışan üç nokta; karaciğerin patolojik yelpazesi) · 6 başvuru (sitopeni dört mekanizma, OİHA, HLH-2004 kriterleri, DİK/TAT-PAP, granülomatöz hepatit, CHSB, Brucella SBP) · 7 karar yolu (maruziyet, kültür, seroloji, moleküler; hangi örnek ne zaman; prozon) · 8 karar yolu (üç kardinal ilke, iki rejim ve relaps oranları, fokal tutulumda süreler, ikinci seçenekler, “neden bu ajanlar”) · 9 başvuru (gebelik, çocuk, organ yetmezliği, laboratuvar maruziyeti, RB51; pediatrik dozlar; hepatotoksisite şeridi) · 10 başvuru (takip, relaps, korunma, hangi test takipte) · 11 başvuru (22 senaryoluk vakadan karara) · 12 hızlı tekrar (40 soru).
Son ölçüm: taşma yok (en dolu s.6 −2 mm ve s.12 −7 mm; en boş s.8 −59 mm).
Kaynaklar: premium `topics/enfeksiyon/bruselloz` + `quizzes/enfeksiyon/bruselloz-quiz-1` (23 soru) · açık `canonical/enfeksiyon/bruselloz` + ileri okumalar `bruselloz-tedavi-algoritmasi`, `bruselloz-hematolojik-komplikasyonlar`, `bruselloz-hepatobiliyer-tutulum`, `bruselloz-intrasellular-patobiyoloji` (dördü de kullanıldı).
Kaynak tutarsızlıkları ve gözlemler:
- **Premium “konu” sayfası yine gerçek bir konu metni değil:** bir tedavi tablosu + quizin kapsamını anlatan tek paragraf. Bu, arka arkaya ikinci tur (antikoagülasyonda da aynıydı) — premium `topics` klasöründe “kapsam dosyası” diye ayrı bir tür var gibi görünüyor; içerik sahibi için not.
- **Osteoartiküler tutulum sıklığı %10–85** olarak veriliyor; kaynak bu geniş aralığın popülasyon ve tanı ölçütü farkından geldiğini kendisi söylüyor. Kitapta aralık ve gerekçesi birlikte.
- **Gentamisin süresi:** ana sayfa “ilk 7–10 gün”, tedavi algoritması sayfası spondilodiskitte “ilk 7–14 gün”. İkisi de bağlamıyla yazıldı (s.8).
- **Rifampisin dozu** iki sayfada da 600–900 mg; tedavi algoritması ayrıca “15 mg/kg” diyor. Kitapta mg cinsinden doz.
- **Pediatrik ≥8 yaş rejimi:** ana sayfa doksisiklin + rifampisin ya da aminoglikozid; tedavi algoritması doz ayrıntısını veriyor (4,4 mg/kg). Çelişki yok, ayrıntı çocuk sayfasından geldi.
- **HLH tedavisi:** premium quiz “kemoterapiye gerek kalmadan antibrusellar tedaviyle kür”, açık ana sayfa “erken antibiyotik tedavisiyle steroid gerekmeyebilir” — aynı yönde.
- Açık ana sayfa bu turda görülen **en eksiksiz kaynak**: mikrobiyolojiden korunmaya kadar 9 bölüm; premiumun katkısı esas olarak vaka temelli pekiştirme oldu.

### Tur 26 — (endokrin) Hipertiroidi ve Graves · endokrin s. 69–80 (Kısım 9)
Sayfalar: 69 kısım kapağı · 70–71 açık sayfa (Şekil 10: TSH → RAIU/Doppler → sentez mi sızıntı mı; sayılarla; süre/şiddet okuması; etiyoloji iki sütun; T3’ün hedef dokuları; yıkıcı tiroiditler) · 72 anlatı (Graves immünopatogenezi, genetik zemin, orbitada TSHR–IGF-1R sinerjisi, T3 neden her sistemi tutar, yaşlıda neden sessiz; kenarda Graves’in nadir yüzleri) · 73 karar yolu (TSH’den etiyolojiye dört adım + basamak tablosu) · 74 başvuru (tedavi modaliteleri, GREAT, pediatrik Graves, üç etiyoloji karşılaştırması) · 75 başvuru (orbitopati: CAS, risk faktörleri, EUGOGO algoritması, patogenez zinciri) · 76 başvuru (amiodaron Tip 1↔Tip 2, Jod-Basedow, iyot yükünün üç yüzü, diğer ilaç kaynaklı tablolar) · 77 karar yolu (beta bloker → tionamid → iyot → kalıcı çözüm; subklinik endikasyonları; dört kol tablosu) · 78 karar yolu (Burch-Wartofsky, beşli protokol, tetikleyiciler, “neden beş basamak”) · 79 başvuru (gebelik, laktasyon, yaşlı; gebelikte ayrıntılar) · 80 hızlı tekrar (49 soru).
Son ölçüm: taşma yok (Kısım 9’da en dolu s.77 −30 mm, en boş s.73 −55 mm). Tüm dosya (80 sayfa) yeniden ölçüldü, taşma yok; bölüm açılışı listesi zaten kısım başına tek satır olduğu için Kısım 9 eklenince taşmadı.
Kaynaklar: premium `topics/endokrinoloji/hipertiroidi` (çok kapsamlı) + `topics/endokrinoloji/graves-hastaligi` + quizler + kart · açık `canonical/endokrinoloji/hipertiroidi`, `yaslida-hipertiroidizm`, `gebelikte-hipertiroidi-kilavuz-karsilastirmasi`.
Kaynak tutarsızlıkları ve gözlemler:
- **Subklinik hipertiroidi tanımında TSH eşiği:** premium hipertiroidi konusu bir yerde “TSH &lt;0,5 mU/L”, tedavi tablosunda “&lt;0,1 (Grade 2)” ve “0,1–0,4 (Grade 1)” diyor; açık sayfa ve kitapta Grade ayrımı kullanıldı. “&lt;0,5” ifadesi diğer eşiklerle çelişiyor — **kullanıcı kararı**.
- **sT3/sT4 oranı eşiği:** Graves premium konusu “sT3/sT4 &gt;0,3 veya T3/T4 &gt;20 ng/mcg”, hipertiroidi premium konusu yalnız “T3/T4 &gt;20 (ng/mcg)”. Kitapta ng/mcg eşiği (s.70, 73, 74).
- **Gebelikte nöraksiyel değil ama ATD geçişi:** açık gebelik sayfası 1. trimesterde PTU, ≥16. haftada metimazol diyor; premium Graves konusu “sonraki trimesterlerde embriyopati/hepatotoksisite dengesine göre PTU ya da MMI” diyerek daha esnek. Kitapta ikisi birlikte (s.79).
- **Gebelikte iyot desteği** yalnız açık kılavuz karşılaştırma sayfasında: ATA/ETA 150 µg/gün, TEMD 100–150 µg/gün (tuz kısıtlamasında 200). Premiumda yok.
- **TSH referans aralığı:** eski ATA 2011 sabit eşikleri (2,5 / 3,0 mU/L) ile ATA 2017 sonrası yerel referans yaklaşımı yalnız açık sayfada; kitapta güncel yaklaşım.
- **Yaşlıda metimazol başlangıç dozu (5–15 mg/gün)** ve **uzun süreli düşük doz (2,5–5 mg/gün)** yalnız açık yaşlı sayfasında.
- Premium Graves konusu, orbitopati ve yeni ajanlar (teprotumumab, tosilizumab, rituksimab) açısından açık sayfalardan **belirgin daha zengin**; iki kaynak bu turda birbirini tamamladı, çelişmedi.

### Tur 27 — (enfeksiyon) İnvaziv fungal enfeksiyonlar · enfeksiyon s. 13–24 (Kısım 2)
Sayfalar: 13 kısım kapağı · 14–15 açık sayfa (Şekil 2: hücre duvarının dört katmanı ve dört antifungal hedefi; sayılarla; mikozların derinliğe göre sınıflaması; risk grupları; bulaş yolları; laboratuvar araçları; antifungal sınıfların kör noktaları) · 16 anlatı (kültürün sağırlığı, her biyobelirtecin kör noktası, kültürsüz teknolojiler, <i>C. auris</i>’in kural dışılığı, biyofilm ve persister hücreler; kenarda direnç mekanizmaları) · 17 başvuru (patojen–sendrom haritası, zemin→patojen refleksi, <i>C. auris</i> profili) · 18 başvuru (biyobelirteçler ve moleküler testler; testi yorumlarken üç soru) · 19 başvuru (halo, hava-hilal, ters halo, PET/BT; örnekleme kararı) · 20 karar yolu (kandemi: ekinokandin → kateter → fundoskopi → step-down → süre; 5 senaryo) · 21 karar yolu (aspergilloz, mukormikoz, fusariosis, kriptokok; 5 senaryo) · 22 başvuru (direnç mekanizmaları, yeni ajanlar, <i>C. auris</i>’te amfoterisin B dozlama paradoksu) · 23 başvuru (özel sendromlar, profilaksi, çevresel kontrol) · 24 hızlı tekrar (40 soru).
Son ölçüm: taşma yok (Kısım 2’de en dolu s.13 kapak 0,0 ve s.24 −4 mm; en boş s.19 −64 mm). Bölüm açılışı listesi bu turda kısım başına tek satıra indirildi (hematolojideki taşmanın tekrarlanmaması için önceden).
Kaynaklar: premium `topics/enfeksiyon/invaziv-fungal-enfeksiyonlar` + `quizzes/.../invaziv-fungal-enfeksiyonlar-quiz-1` (10 soru) · açık `canonical/enfeksiyon/invazive-mantar-enfeksiyon` (13 bölüm) + `mantar-enfeksiyon-ana-sayfa` (genel mikoloji).
Kaynak tutarsızlıkları ve gözlemler:
- **Fusarium’un kan kültüründe üreme gerekçesi iki kaynakta farklı:** premium “in vivo <b>sporülasyon</b> yapabildiği için”, açık sayfa “yüksek oranda <b>psödohif</b> ürettiği için (%40–60)”. Kitapta sporülasyon (premium kuralı) + %40–60 oranı (açık sayfa) birlikte; mekanizma farkı kullanıcı kararına bırakıldı.
- **BDG duyarlılığı:** premium “%51–63’e düşer (maskeleme)”, açık sayfa genel duyarlılığı “%70–80” veriyor. Çelişki değil (biri tür bazlı, biri genel) ama yan yana okunduğunda karışabilir; kitapta ikisi ayrı satırda.
- **T2Candida duyarlılığı:** premium “1 CFU/mL saptar”, açık sayfa “%90’ın üzerinde duyarlılık”. İkisi de yazıldı.
- **EUCAST <i>C. auris</i> amfoterisin B kırılma noktası (S ≤0,001 mg/L, ECOFF 2 mg/L)** yalnız açık sayfanın final spot bölümünde; premiumda yok. Kitapta s.22’de.
- **Endokardit rejimi** (kaspofungin 150 mg/gün, 6 hafta, protez kapakta ömür boyu supresyon) yalnız premiumda.
- Premium bu kez gerçek bir konu metni (kapsam dosyası değil) — son iki turdaki kalıp kırıldı; iki kaynak birbirini tamamladı.

### Tur 28 — (endokrin) Feokromositoma ve paraganglioma · endokrin s. 81–92 (Kısım 10)
Sayfalar: 81 kısım kapağı · 82–83 açık sayfa (Şekil 11: üç moleküler küme ve fenotipleri; sayılarla; şüphe kimde doğar; terminoloji ve epidemiyoloji; klinik tablo ve tetikleyiciler; hangi kliniği taklit eder) · 84 anlatı (neden harika taklitçi, PNMT’nin fenotipi belirlemesi, kümelerin klinik karşılığı, hazırlığın gerekçesi, modern paradoks) · 85 karar yolu (beş adımlı biyokimyasal tanı: şüphe sınıflaması, test performansı, preanalitik kurallar, yalancı pozitiflik, klonidin; dışlama eşikleri) · 86 başvuru (BT/MRG ve dört fonksiyonel görüntüleme; görüntüleme sırası) · 87 başvuru (üç moleküler küme tablosu, üç genetik inci, genetik testin değiştirdikleri, soy ağacı spotu) · 88 karar yolu (alfa → tuz/hidrasyon → beta → kalsiyum kanal blokeri; dozlar; hazırlığın üç hedefi) · 89 karar yolu (cerrahi, kaçınılacak anestezikler, intraoperatif kriz ajanları, ilk 24–48 saat, izlem çizelgesi) · 90 başvuru (feokromositoma krizi, tetikleyiciler, ayırıcı tanı) · 91 başvuru (uzun dönem izlem + 21 senaryoluk vakadan karara) · 92 hızlı tekrar (49 soru).
Son ölçüm: taşma yok (Kısım 10’da en dolu s.85 −23 mm, en boş s.91 −61 mm). Tüm dosya (92 sayfa) ölçüldü, taşma yok.
Kaynaklar: premium `topics/endokrinoloji/feokromositoma` + `quizzes/endokrinoloji/feokromositoma-quiz-1` · açık `canonical/endokrinoloji/feokromositoma-ve-paraganglioma` (+ `adrenal-medulla-hastaliklari` çok kısa, katkısı sınırlı).
Kaynak tutarsızlıkları ve gözlemler:
- **Açık sayfa ile premium neredeyse birebir aynı:** küme tablosu, genetik inciler ve preoperatif protokol aynı cümlelerle iki kaynakta da var. Çelişki çıkmadı; premium birkaç ek ayrıntı taşıyor (Geroula skoru, klonidin protokol ayrıntısı, anestezi ajanları, rebound hipoglisemi oranı). İçerik sahibi için not: bu iki dosya birbirinin kopyası gibi — <b>tek kaynağa bağlanması</b> düşünülebilir.
- **Premium quiz tek soruluk** görünüyor (SDHD maternal damgalama vakası); diğer premium konularda 7–23 soru vardı. Quiz dosyası eksik olabilir.
- **Alfa blokaj paradoksu** (Wang ve ark. 2023 meta-analizi: intraoperatif fark yok, postoperatif vazopressör ihtiyacı 4,21 kat) hem premiumda hem açık sayfada var ve kılavuz önerisiyle çelişiyor — kitapta ikisi birlikte, “kılavuz yine de öneriyor” notuyla (s.84 ve s.88).
- **Kontrastsız BT eşiği** (&lt;10 HU dışlar) ve **kontrast güvenliği** (alfa blokajsız hastada düşük ozmolariteli kontrast güvenli) iki kaynakta da aynı.
- Ekstra: `adrenal-medulla-hastaliklari` sayfası yalnız birkaç cümlelik fizyoloji içeriyor; bu başlık altında ayrı bir ileri okuma sayfası gibi durmasına karşın içerik yok denecek kadar az.

### Tur 29 — (enfeksiyon) CRKP · enfeksiyon s. 25–36 (Kısım 3)
Sayfalar: 25 kısım kapağı · 26–27 açık sayfa (Şekil 3: enzimden ilaca şeridi; sayılarla; mikrobiyoloji notları; risk grupları; sessiz rezervuarlar; porin ve eflüks; risk ve mortalite sayıları) · 28 anlatı (direncin dört katmanı: enzim, porin, pompa, plazmit trafiği + virülans katmanı) · 29 başvuru (Ambler sınıfları, seftazidim-avibaktamın kapsamı, enzimlerin genetiği, ajan × enzim matrisi) · 30 başvuru (CR-hvKP virülans faktörleri, klasik ayrımın bozulması, moleküler imza) · 31 başvuru (metastatik yayılım, endoftalmi, üç suş karşılaştırması) · 32 karar yolu (enzimi tanımla → sınıfa göre ajan → eski ajanların yeri → kurtarma; ilaca göre direnç mekanizmaları) · 33 karar yolu (odağa göre ajan, kaynak kontrolü, karar sırası) · 34 başvuru (sürveyans yöntemleri, salgın kontrolü) · 35 başvuru (20 senaryoluk vakadan karara) · 36 hızlı tekrar (40 soru).
Son ölçüm: taşma yok (Kısım 3’te en dolu s.29 −30 mm ve s.36 −7 mm; en boş s.34 −81 mm).
Kaynaklar: premium `topics/enfeksiyon/crkp-karbapenem-direncli-klebsiella` + `quizzes/...-quiz-1` + `flashcards/...` (80 kart) · açık `canonical/enfeksiyon/crkp-enfeksiyonu` + ileri okumalar `cr-hvkp-hipervirulan-varyant`, `cr-hvkp-metastatik-yayilim`, `cr-hvkp-endoftalmi-komplikasyonu`.
Kaynak tutarsızlıkları ve gözlemler:
- **Mortalite oranı:** premium “kritik hastalarda %50–60”, kart seti “bildirilen mortalite ~%42”. İkisi de s.26’da ayrı ayrı yazıldı — hangi popülasyon olduğu kaynaklarda net değil, <b>kullanıcı kararı</b>.
- **String testi:** premium “en tipik özellik, 5 mm’den uzun iplikçik”, kart seti “düşük duyarlılık ve özgüllük; her hipervirülan suş hipermukoviskoz değildir”. Kitapta premium tanımı + kartın uyarısı birlikte (s.30).
- **Kolistin/tigesiklin:** premium “monoterapi olarak önerilmez”, açık sayfa menenjitte BOS geçişi nedeniyle kolistin ve tigesiklini seçenek olarak sayıyor. Kitapta ikisi de bağlamıyla (s.32 ve s.33).
- **MBL tanımı:** premium “yalnız aztreonama dokunamaz”; kart seti aynı bilgiyi “seftazidim-avibaktam veya meropenem-vaborbaktam tarafından inhibe edilemez” diye veriyor. İki ifade birbirini tamamlıyor, kitapta ikisi de var.
- **Bu bölüm kaynak hacmi bakımından 12 sayfaya görece zayıf kaldı:** premium konu ~20 KB, açık sayfa 18 KB, üç çocuk sayfa 5–6’şar KB. Boşluğu büyük ölçüde <b>80 kartlık flashcard seti</b> kapattı (Tn4401, IncL plazmit, mgrB/mcr-1, OqxAB, Xpert Carba-R, APACHE II, NDM-5, ST11-KL64, rmpA/iucA/pLVPK gibi ayrıntıların tamamı karttan geldi).

### Tur 30 — (endokrin) Erkek ve transplantasyon osteoporozu · endokrinoloji s. 93–104 (Kısım 11)
Sayfalar: 93 kısım kapağı · 94–95 açık sayfa (Şekil 12: testosteron → aromataz → östrojen → eşik zinciri; sayılarla; sessiz uyarılar; ilaç öyküsü incisi; tanısal eşikler; DXA endikasyonları; nonfarmakolojik temel; kadın–erkek karşılaştırması; izlem) · 96 anlatı (östrojenin erkekteki rolü, terapötik paradoks, Testosterone Trials ve paradoksu doğru okumak) · 97 başvuru (zorunlu laboratuvar paneli, sekonder nedenler sistemlere göre, hangi test neyi dışlar) · 98 karar yolu (tarama, doğru skor, sekonder neden, FRAX, izlem; üç sonuç üç yol) · 99 karar yolu (kemik ajanı dört ölçüt, TRT ayrı karar, tedaviye başlamadan önce, iki karar zinciri) · 100 başvuru (ajanlar, ardışık tedavi, anabolik ne zaman ilk seçenek) · 101 başvuru (ADT, denosumab rebound, ilaç tatili ve kime düşünülmez) · 102 karar yolu (transplantasyon: nakil öncesi değerlendirme, zamanlama, immünsüpresyon, böbreğe göre ajan, nonfarmakolojik zemin) · 103 başvuru (27 senaryoluk vakadan karara) · 104 hızlı tekrar (40 soru).
Son ölçüm: **104 sayfanın hiçbirinde taşma yok.** Kısım 11'de en dolu s.97 (−16,9 mm) ve s.104 (−19,6 mm); en boş s.95 (−46,9 mm). Üç tur gerekti: ilk taslak −105…−135 mm boştu, iki doldurma turu + iki taşma düzeltmesi (s.96'daki "Sessizliğin bedeli" → s.94; s.97'deki ilaç öyküsü incisi → s.94).
Bölüm açılışı (s.1) Kısım 11 eklenince +6,5 mm taştı → **içindekiler tümüyle kısım başına tek satıra indirildi** (Kısım 1–6 hâlâ sayfa sayfa listeleniyordu). Kural artık bu bölümde de uygulanıyor.
Kaynaklar: premium `topics/endokrinoloji/erkek-osteoporozu` + `quizzes/…-quiz-1` · premium `topics/endokrinoloji/transplantasyon-osteoporozu` + quiz · açık `canonical/endokrinoloji/erkek-osteoporozu-ana-sayfa` + ileri okuma `erkek-osteoporozu-testosteron` · açık `osteoporoz-organ-nakli-kaynakli`.
Kaynak tutarsızlıkları ve gözlemler:
- **KULLANICI KARARI GEREKİYOR — bölüm içi tekrar:** Kısım 6'nın s.56'sı zaten "Erkek osteoporozu ve kılavuz farkları" başlıklı tam bir başvuru sayfası. DXA endikasyonları, sekonder neden listesi, testosteron eşikleri (&lt;200 ng/dL, T ≤−3,5, T ≤−2,5 + kırık) ve ajan tablosu Kısım 11 ile **büyük ölçüde örtüşüyor**. Kısım 11 bunların üstüne Testosterone Trials paradoksunu, denosumab reboundunu, ilaç tatilini, ADT'yi ve transplantasyonun tamamını ekliyor. Seçenekler: (a) s.56'yı yalnız **kılavuz farkları tablosuna** indirip erkek osteoporozunu tümüyle Kısım 11'e bırakmak, (b) s.56'yı olduğu gibi tutup Kısım 11'den çapraz gönderme yapmak, (c) s.56'yı kaldırıp Kısım 6'yı 12 → 10 sayfaya indirmek (sayfa paritesi bozulmaz). **Hiçbiri uygulanmadı.**
- s.56'da bir eşik daha var: *"2 yıllık yeterli testosterona rağmen T ≤−2,5 ise kırık azaltıcı ilaç eklenir."* Premium konu ve quiz bu iki yıllık koşulu **hiç anmıyor** (yalnız T ≤−3,5 ve T ≤−2,5 + kırık). Kısım 11'e bilerek alınmadı — kaynağı belirsiz.
- Premium "erkek osteoporozu" konusu ile açık ana sayfa **tarama endikasyonlarında ve nutrisyon hedeflerinde birebir örtüşüyor**; ayrım quiz açıklamalarında. 12 sayfanın yarısından fazlası quiz açıklamalarından çıktı (Testosterone Trials'ın dört metodolojik sınırı, rebound, ilaç tatili, ADT'de denosumab, anabolik→antirezorptif geçiş).
- Transplantasyon kaynakları **renal eşikte iki ayrı sayı veriyor**: premium konu "kreatinin &gt;2 mg/dL ya da GFR &lt;%30 → doz yarıya indir/kes", quiz "GFR &lt;30–35 mL/dk → bisfosfonat kontrendike". İkisi ayrı satır olarak s.102'ye kondu; hangisinin hangi klinik durumda geçerli olduğu kaynaklarda net değil — **kullanıcı kararı**.
- Transplantasyon premium konusu da (bruselloz ve antikoagülasyonda olduğu gibi) gerçek konu metni yerine **kapsam paragrafı** taşıyor; içeriğin tamamı quizden geldi.
- Açık `erkek-osteoporozu-testosteron` sayfası neredeyse yalnız **başlıklardan** oluşuyor; Testosterone Trials bölümünün gövdesi premium quizde.

### Tur 31 — (onko) Pankreas kanseri · onkoloji s. 11–22 (Kısım 2)
Sayfalar: 11 kısım kapağı · 12–13 açık sayfa (Şekil 2: PanIN → PDAC zinciri; sayılarla; ne zaman düşünelim; risk faktörleri; kalıtsal sendromlar; yerleşime göre klinik; tanıya giden sıra; riskin büyüklüğü) · 14 anlatı (diyabet–PDAC çift yönlü ilişki, 8 yıl kuralı, adrenomedullin, tip 3c, inkretin sorusu; kenarda kırmızı bayraklar ve 2 hafta kuralı) · 15 başvuru (dört sürücü gen, SMAD4, kistik/nadir tümör imzaları, prediktif–prognostik ayrımı) · 16 karar yolu (BT, MRG, doku tanısı, NCCN rezektabilite, moleküler kimlik; Şekil 3: evreden ilk hamleye; CA 19-9 ve AJCC kenarı) · 17 karar yolu (lokalize hastalık: cerrahi, neoadjuvan, adjuvan, SMAD4 ve biyolojik rezektabilite, patoloji raporu) · 18 karar yolu (metastatik: performansa göre rejim, moleküler alt gruba göre ajan, çalışma sözlüğü) · 19 başvuru (KRAS inhibitörleri tablosu, daraxonrasib mekanizması, TTFields, nITRO, RNA aşıları) · 20 başvuru (kimi ne zaman tarayalım, FPC iki ölçüt, tarama yöntemi, tartışmalı ilaç sinyalleri) · 21 başvuru (palyatif bakım + 20 senaryoluk vakadan karara) · 22 hızlı tekrar (40 soru).
Son ölçüm: **onkoloji 22 sayfanın hiçbirinde taşma yok**; Kısım 2'de en dolu s.13 ve s.22 (−9 mm), en boş s.19 (−47 mm). İki doldurma turu gerekti (ilk taslak −55…−97 mm).
Bölüm açılışı: Kısım 1 içindekileri tek satıra indirildi, Kısım 2 eklendi; alt başlık "Febril nötropeni ve pankreas kanseri".
Kaynaklar: premium `topics/gastroenteroloji/pankreas-kanseri` + `quizzes/gastroenteroloji/…-quiz-1` (10 soru) + `quizzes/onkoloji/…-quiz-1` (26 soru) + `flashcards/gastroenteroloji/pankreas-kanseri` (80 kart) · açık `canonical/onkoloji/pankreas-kanseri-ana-sayfa` + 9 ileri okuma (diabetes, ileri-tedaviler, kras-mutasyonu, neden-ilaç-vs, neden-inkretin, rna-asilar, setidegrasib-protokolu, smad4, surveyans).

**Bu turda uygulanan yeni kural — yapay zeka yer tutucuları atlandı** (kaynak tarandı, şunlar kitaba ALINMADI):
- premium `topics/onkoloji/pankreas-kanseri`: gerçek konu metni yok; yalnız bir evreleme tablosu + "Bu soru seti … kapsar" **kapsam paragrafı**.
- `pankreas-kanseri-ileri-tedaviler`: "3." bölümün yerinde ana sayfanın evreleme bölümü **birebir kopyalanmış** (numaralama 1-2-📸-4-5-6 atlıyor) ve kopyanın içine anlamsız bir **"SMA modulation"** ifadesi girmiş; ayrıca "çalışmalaramda" bozuk sözcüğü.
- `pankreas-kanseri-setidegrasib-protokolu`: 6 KB'lık sayfada **hiç veri yok** (ORR/PFS/OS yok); "NEJM 2026 çalışması" başlığı ve "en birincil klinik kaynaktır" gibi dolgu cümleleri. Kitaba yalnız "G12D seçici, araştırma aşamasında, klinik çalışmaya yönlendir" alındı.
- `pankreas-kanseri-smad4` (31 KB): aynı içerik (SMAD4 kaybı → sistemik; korunmuş → lokal) **dört ayrı başlık altında tekrarlanıyor**; "Resepsiyonel Karşılaştırma" ve "Makro-Modality Optimizasyon" gibi anlamsız başlıklar. Tek kez özetlendi.
- `pankreas-kanseri-surveyans`: FPC tanımında bozuk metin **"en least iki"**.
- `pankreas-kanseri-rna-asilar`: 6 KB'ın neredeyse tamamı aynı cümlenin (mutant KRAS → CD8+ T hücre) farklı kelimelerle tekrarı; tek cümleye indirildi.
- `pankreas-kanseri-neden-inkretin`: "NK-kβ" bozuk yazımı; ilgili in vitro gemsitabin sinerjisi iddiası alınmadı.
- flashcard 14: "FAMMM" kartının metninde **Kiril harfler** (Fаmiliаl, Mеlаnоmа — görünüşte Latin, kodda Kiril). Kitaba Latin yazımla alındı; kart düzeltme adayı.

Kaynak tutarsızlıkları:
- **İnkretin ajanlar — KULLANICI KARARI:** premium onko quiz (s.22) ve açık risk/diyabet sayfaları "GLP-1 mimetikleri ve DPP-4 inhibitörleri riski ~3 kat artırır" diyor; açık `neden-inkretin` sayfası geniş kohortlarda artış **bulunmadığını** yazıyor (Sun OR 0,78; Dankner HR 0,50; Wang DPP-4i etkisiz). Kitapta premium ifade + kohort verisi yan yana (s.14, s.20).
- **FPC tanımı:** açık ana sayfa "en az bir birinci derece akraba", premium gastro "≥2 akraba (en az biri 1. derece)", onko quiz iki ölçüt (≥2 birinci derece / ≥3 akraba, en az biri birinci derece). Kitapta onko quiz (premium) tanımı (s.20).
- **Lenf nodu sayısı:** premium "en az 15–16", açık "en az 16". Kitapta premium.
- **Distal pankreatektomi:** premium "splenektomili (standart)", açık "± splenektomi". Kitapta premium.
- **Tarama başlangıç yaşı:** premium "genellikle 50", açık ana sayfa "40–50", sürveyans sayfası sendroma göre (PJS 30–35, FAMMM 40, PRSS1 40/atak+20 yıl, BRCA 50). Kitapta sendrom tablosu.
- **Sigara riski:** premium ve ana sayfa "2 kat", açık risk sayfası "en az 1,5 kat". Kitapta premium.
- **Olaparib şartı:** onko quiz "en az 16 hafta", ileri tedaviler sayfası ve gastro quiz "4 ay". Kitapta 16 hafta.
- **BRPC arter teması:** premium "<180°", kart 28 "≤180°". Kitapta premium.
- **Daraxonrasib FDA durumu:** KRAS sayfası "FDA incelemesinde, genişletilmiş erişim", ileri tedaviler sayfası "genişletilmiş erişim onaylandı". Kitapta KRAS sayfası.
- Kart 35 BRCA/PALB2'de platin örneği olarak "gemsitabin + sisplatin" veriyor; premium FOLFIRINOX diyor. İkisi de yazıldı (s.18).

**Tur sırasında bulunan iki şablon kusuru ve düzeltmesi:**
- **Endokrin dosyasında `ol.tekrar` stili hiç yoktu.** s.80, 92 ve 104'teki tekrar listeleri iki sütunlu düzen yerine düz liste olarak basılıyordu; bu yüzden sayfalar kısa ölçülmüş ve üzerlerine fazladan içerik eklenmişti (s.80 ve 92 "Kırk soruda" başlığına rağmen **48 soru**, s.104 fazladan iki kutu). Stil eklenince üç sayfa +41…+49 mm taştı. Düzeltme: s.80 ve 92'den en ayrıntılı 8'er soru çıkarıldı (başlıkla uyumlu 40), s.104'ün iki kutusu s.99 ve s.101'e taşındı, uzun cevaplar kısaltıldı. Stil onkoloji dosyasına da eklendi. **104 sayfanın hiçbirinde taşma yok.**
  Çıkarılan sorular — s.80: IgG1 alt sınıfı, Hashimoto kanlanması, biyotin 48 saat, iyot 1 saat, Lugol, MMI–PTU dönüşümü, yaşlıda MMI dozu, pediatrik relaps %68. s.92: mikrofeokromositoma, insidans, paroksizm süresi, ayakta eşikler, MIBG'nin yeri, maternal damgalama, magnezyum sülfat, tiramin. (Hepsinin bilgisi kendi sayfalarında duruyor.)
- **Küçük kutu (`.bw`) içindeki kalın vurgular başlık gibi basılıyordu** (`.bw b` kuralı içteki `<b>`'yi de büyük harf blok yapıyordu; ör. s.16'da "YA DA", "HER" ayrı satır). Dokuz bölüm dosyasına `.bw span b` satır içi kuralı eklendi; etkilenen yerler endokrin 14, onkoloji 18, enfeksiyon 9, hematoloji 6, nefroloji 1. Kural yalnızca yüksekliği azaltır; onkoloji yeniden ölçüldü, taşma yok.
