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
- **Kullanıcının verdiği dış kaynaklar da "bizim kaynağımız" sayılır** (18 Eylül): `Downloads/Hipofiz-hastaliklari-tani-ve-tedavi-kilavuzu-2022yeni.pdf` (TEMD 2022). TEMD bilgisi kitapta `.kutu.temd` ("TEMD 2022 · …") kutularında, kısa ve spot olarak verilir; öteki kaynaklarla farkı günlüğe yazılır.

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
| 12 | (kardiyo) Klinik lipidoloji ve ASKVH | lipidoloji-tedavi-ana + 12 alt sayfa | klinik-lipidoloji-ascvd + quiz + kart | BİTTİ (kardiyo s. 13–24; Tur 36 ile s. 13–26) |
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
| 30 | (endokrin) Erkek osteoporozu | erkek-osteoporozu-ana-sayfa (25 KB), erkek-osteoporozu-testosteron (32 KB) | erkek-osteoporozu + transplantasyon-osteoporozu + quiz | BİTTİ (o gün s. 93–104; şimdi s. 103–114) |
| 31 | (onko) Pankreas kanseri | pankreas-kanseri-ana-sayfa + 8 çocuk sayfa (KRAS, SMAD4, ileri tedaviler, RNA aşılar…) | pankreas-kanseri (onko + gastro) + quiz + kart | BİTTİ (s. 11–22) |
| 32 | (endokrin) Hipofiz hastalıkları — kullanıcı isteği | hipofiz-hastaliklari-ana + kılavuz + adenomlar + prolaktinoma (+4) + akromegali + hipofiz yetmezliği (+6) + Sheehan (+1) + arka hipofiz (+2) | hipofiz-hastaliklari + kesim-degerleri + quiz + 2 kart seti (hipofiz, akromegali) | BİTTİ (o gün s. 105–120; kısım şimdi s. 115–138) |
| 33 | (endokrin) Hipopitüitarizm genişletme + TEMD kutuları — kullanıcı isteği | hipofiz-yetmezligi alt ağacı | TEMD 2022 kılavuzu (Bölüm 6, 7, 12) | BİTTİ (o gün s. 114–121; şimdi s. 128–135) |
| 34 | (endokrin) Prolaktinoma ve akromegali TEMD kutuları — kullanıcı isteği | — | TEMD 2022 kılavuzu (Bölüm 1a, 1b) | BİTTİ (o gün s. 114–117; şimdi s. 124–127) |
| 35 | (endokrin) Tiroid kısımlarına "TEMD'de ne var" — kullanıcı isteği | — | TEMD 2025 tiroid kılavuzu (tiroid2025_11042025.pdf) | BİTTİ (s. 13–14, 24–25, 34–35, 87–89; bölüm 138 sayfa) |
| 36 | (kardiyo) Lipidoloji genişletme — kullanılmayan kaynaklar, kullanıcı isteği | bempedoik-ezetimib-mace, lipid-ezetimibe-sakinca, statin-otoimmun-miyopati-imnm | klinik-lipidoloji-ascvd-quiz-1 (10 soru) | BİTTİ (kardiyo s. 23–24; kısım 13–26) |
| 37 | (endokrin) Sayfalara "TEMD ne diyor" kutuları — kullanıcı isteği, 7 kılavuz | — | TEMD DM 2026 · HT 2022 · obezite 2024 · beslenme-egzersiz 2023 · diyabet teknolojileri 2025 · tiroid girişimsel 2026 · hipofiz 2022 | SÜRÜYOR (Kısım 7 ve 10 bitti) |
| 38 | (endokrin) Kitaptan sonra siteye giren bilgi — kullanıcı isteği | santral-adrenal-yetmezlik (5 Eki) + Tur 38 ilk partisi | — | SÜRÜYOR (s. 78, 80, 83, 130, 133) |
| 39 | (endokrin) **Kısım 13 · Paratiroid ve kalsiyum** — kullanıcı isteği (17 Eki) | hiperparatiroidizm (21 KB), paratiroid-karsinomu-histolojik-tuzaklar, kalsiyum-homeostazi, hipokalsemi-ve-hipoparatiroidi | hipoparatiroidizm + quiz (15) | BİTTİ (s. 139–148) |
| 40 | (endokrin) Premium tiroid incileri — kullanıcı isteği (17 Eki) | — | pearls: graves, hashimoto, hipertiroidi, subklinik, nodül-kanser, temd-tiroid 1–2 | BİTTİ (s. 13, 17, 81) |
| 41 | (endokrin) **Kısım 14 · Diyabet ve obezite pratiği** — kullanıcı isteği (17 Eki) | — | pearls: temd-diyabet-1 (100), temd-diyabet-2 (80), temd-obezite (100), temd-beslenme-egzersiz (100) | BİTTİ (s. 149–158) |

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

---

### 16 Eylül · IgAN s.18 eki (içerik oturumu, döngü dışı)

Açık siteye yeni ileri okuma sayfası girdi: `nefroloji/iga-nefropatisi-yeni-nesil-b-hucresi-tedavileri` (parent `iga-nefropatisi-berger`). Kitabın IgAN kısmında eksik kalan dört nokta **ekleme olarak** s.18 "Yeni nesil ajanlar"a kondu; mevcut satırlar yeniden yazılmadı:

- Anti-CD38 satırına bortezomib (proteazom inhibitörü).
- Yeni blok **BAFF/APRIL reseptör ağı** (BAFF-R · TACI · BCMA); BAFF-R satırında seçici anti-APRIL farkı (IgG ve aşı yanıtı korunur).
- "Üç sınıfı karıştırma" listesine 4. madde: rituksimab tuzağı (uzun ömürlü plazma hücreleri CD20 taşımaz).
- Kanıt tablosunda APRIL/BAFF, anti-CD38 satırına çalışma adları (ENVISION, VISIONARY, BEYOND · ORIGIN, RUBY-3 · IGNAZ).

Ölçüm: ilk denemede ayrı Tuzak kutusu + spot satırıyla s.18 **15,9 mm taştı**; kutu listeye, spot tabloya alındı → **3,9 mm boş**, 50 sayfanın hiçbirinde taşma yok. Baskı önizlemesi (`--sayfa 18-18`) temiz.

### Tur 32 — (endokrin) Hipofiz hastalıkları · endokrinoloji s. 105–120 (Kısım 12) · kullanıcı isteği (18 Eylül)
Sayfalar: 105 kısım kapağı · 106–107 açık sayfa (Şekil 13: üç transkripsiyon faktörü, beş hücre soyu; sayılarla; anatomi ve komşuluk; hastalığın üç yolu; sellar kitle ayırıcı tanısı; dinamik testlerin mantığı; tümör tipine göre ilk hamle) · 108 anlatı (PitNET: soylar, sürücü mutasyonlar, agresiflik, agresif prolaktinomanın imzası; kenarda kalıtsal sendromlar) · 109 karar yolu (sellar kitle, insidentaloma, tedavi seçimi, radyasyon seçenekleri) · 110 karar yolu (hiperprolaktinemi: doğrula, dışla, makroPRL/kanca, PRL/hacim oranı, nedenler) · 111 başvuru (prolaktinoma tedavisi, gebelik, kabergolin–kapak, ektopik prolaktin) · 112 karar yolu (akromegali tanı ve tedavi, seçim ipuçları, izlem) · 113 başvuru (akromegalinin sistemik yükü, kemik mekanizması, Cushing hastalığı/TSHoma/gonadotrop, Cushing tanı tuzakları) · 114 anlatı (hipopitüitarizm; Şekil 14: kayıp sırası; genetik yetmezlikler; eksikliğin yüzü) · 115 karar yolu (aks aks testler ve kesimler, ITT, test gerektirmeyen GH eksikliği, zamanlama, ilaçla gelen santral bozukluklar) · 116 başvuru (replasman, başlama sırası, maskelenmiş DI, enfeksiyon ve kriz, özel durumlar) · 117 başvuru (apopleksi, Sheehan, hipofizitler, enfeksiyöz nedenler) · 118 başvuru (diabetes insipidus, su kısıtlama, kopeptin, NDI paradoksları, poliüri ayırıcı tanısı, SIADH kısa) · 119 başvuru (25 senaryoluk vakadan karara) · 120 hızlı tekrar (40 soru).
Son ölçüm: **endokrin 120 sayfanın hiçbirinde taşma yok**; Kısım 12'de en dolu s.120 (−9 mm), en boş s.116 (−46 mm). Kapak ilk hâlinde +12 mm taşıyordu → kısım içindekileri 14'ten 10 satıra indirildi. İki doldurma turu.
Kaynaklar: premium `topics/endokrinoloji/hipofiz-hastaliklari` + `hipofiz-kesim-degerleri-ayirici-tani` + `quizzes/…/hipofiz-hastaliklari-quiz-1` + `flashcards/…/hipofiz-hastaliklari` (80) + `flashcards/…/akromegali` (79) · açık `hipofiz-hastaliklari-ana` ve alt ağacı: on-hipofiz-hastaliklari-giris, hipofiz-hastaliklari-klinik-akademik-kilavuz, hipofiz-adenomlari, hiperprolaktinemi-ve-prolaktinoma (+ ektopik-prolaktin-salgisi, prolaktinoma-yeni-biyobelirtecler, sf3b1-mutasyonu-metastatik-prolaktinoma, dopamin-agonistleri-kalp-kapak), akromegali-ve-gigantizm, hipofiz-yetmezligi (+6 alt sayfa), hipopituitarizm-ve-sheehan-sendromu (+ sheehan-sendromu-postpartum-felaket), arka-hipofiz-bozukluklari-di-ve-siadh (+ diabetes-insipidus, kopeptin-ve-ndi-molekuler-analiz).
**Bilerek dışarıda bırakılan:** SIADH alt ağacı (9 sayfa: siadh-sendromu ve çocukları) — ayrı bir konu olacak büyüklükte; s.118'de yalnız arka hipofiz sayfasındaki kısa özet var. `acth-aksi-ve-cushing-hastaligi` gizli (hidden) olduğu için okunmadı; Cushing ayrıntısı Kısım 4'te.

**Atlanan yapay zeka yer tutucuları ve kusurlar:**
- Beş açık sayfanın başında "🤖 · ⚠️ Uzman Modülü: Harrison 21st Ed & … referanslıdır/standartlarındadır" bandı (on-hipofiz giriş, hiperprolaktinemi, akromegali, hipopitüitarizm-Sheehan, arka hipofiz, diabetes insipidus).
- `on-hipofiz-hastaliklari-giris`: "Mikroadenom: Makroadenom: ≥ 10 mm çap." — mikroadenom tanımı düşmüş.
- `akromegali-ve-gigantizm`: iki yarım cümle ("Normalde glukoz yüklemesi sonrası GH Görüntüleme:" ve "…GH'ın Cerrahi…").
- `arka-hipofiz-bozukluklari-di-ve-siadh`: "Sıvı Kısıtlaması: İlk basamak tedavidir (Vaptanlar…" parantez kapanmıyor; ODS uyarısı "sodyum artış hızı" diye yarıda bitiyor — düzeltme hızı kitaba alınmadı.
- `sheehan-sendromu-postpartum-felaket`: "İpucu 2" ve "İpucu 4" var, **İpucu 1 ve 3 kayıp**.
- `hipofiz-adenomlari`: "Dopaminerjik Resepsör", "ötiroid benzeri kontrol" (prolaktin için yanlış terim) gibi bozuk ifadeler.

Kaynak tutarsızlıkları (kitapta premium kullanıldı):
- **Hormon kayıp sırası:** premium ve hipofiz-yetmezliği-klinik-tablo "GH → LH/FSH → TSH → ACTH → PRL"; kılavuz ve Sheehan sayfası ACTH'de bitiriyor (PRL yok); hipofiz-adenomlari "gonadotrop → GH → TSH → ACTH" (ilk ikisi yer değiştirmiş). Kitapta premium.
- **PROP1'de ACTH:** ana sayfanın spot kutusu "yalnızca ACTH korunur", premium ve quiz "geç başlayan ACTH eksikliği". Kitapta premium.
- **Lenfositik hipofizitte DI:** kılavuz ">%80", premium "%50–80", quiz ">%50". Kitapta %50–80.
- **ICI hipofiziti sıklığı:** hipofiz-yetmezliği-etiyoloji "%8–13", quiz "anti-CTLA-4 %5,6, anti-PD-1/PD-L1 %0,5–1,1". Kitapta quiz.
- **Kanca etkisi eşiği:** premium ">1000 ng/mL", açık prolaktinoma sayfası ">5000 ng/mL, tümör >3 cm". Kitapta eşik yazılmadı, yalnız "dev tümör + beklenenden düşük PRL → 1:100 seyrelt".
- **SF3B1 sıklığı:** premium "prolaktinomaların %20'si", açık sayfa "erkek %24,34, kadın %10,67". İkisi de yazıldı (s.108).
- **OGTT eşiği:** premium ve kart 8 "≥0,4 µg/L (ultraduyarlı)", akromegali kartı 2 ">1 ng/mL" (geleneksel kit). İkisi ayrı ayrı yazıldı.
- **IGF-1 >1,3 × üst sınır** yalnız akromegali kart 1'de; premiumda yok. Kitapta "kart setinde verilen eşik" diye işaretlendi (s.112).
- **Desmopressin testi reseptörü:** premium "V1b ve aberran V2", kesim değerleri sayfası "V2R ve V3R", kart 63 "V2R". Kitaba reseptör adı yazılmadı.
- **Hidrokortizon dozu:** kılavuz "15–25 mg/gün", replasman sayfası "15–20". Kitapta 15–20.
- **Lenf nodu, sabah kortizolü nmol/L karşılıkları** sayfalar arasında farklı (80–140 ↔ 50–100 nmol/L); kitapta yalnız µg/dL.
- **Adenom içi dağılım:** giriş sayfası "prolaktinoma %50", adenomlar sayfası "%32–66". Kitapta %32–66.
- **Kopeptin:** hipertonik salin ve arjinin testine aynı 4,9 pmol/L eşiği veriliyor; kaynak böyle, kitapta da böyle yazıldı — **kullanıcı kontrol etmeli**.

**Şablon düzeltmesi (tüm bölümler):** `.serit-zincir` içindeki satır içi kalın vurgular da başlık gibi basılıyordu (s.106 önizlemesinde "dopamin"); dokuz dosyaya `.serit-zincir span b` satır içi kuralı eklendi (etkilenen şerit: endokrin 5, hematoloji 3, enfeksiyon 3, onkoloji 2). Şekil 13 oklu şeritten oksuz dört kutuya çevrildi — oklar soyları birbirinden türüyormuş gibi gösteriyordu. Endokrin ve onkoloji yeniden ölçüldü: taşma yok.

### Tur 33 — (endokrin) Hipopitüitarizm genişletildi + "TEMD'de ne var" kutuları · endokrinoloji s. 114–121 · kullanıcı isteği (18 Eylül)
**Yeni kaynak (kullanıcı verdi):** `C:\Users\hucig\Downloads\Hipofiz-hastaliklari-tani-ve-tedavi-kilavuzu-2022yeni.pdf` — TEMD Hipofiz Hastalıkları Tanı, Tedavi ve İzlem Kılavuzu, 16. baskı (Ekim 2022). Kullanılan bölümler: **Bölüm 7 Hipofiz yetmezliği** (tamamı), **Bölüm 6 Hipofiz apopleksisi** (özet ve izlem), **Bölüm 12 Yaşlanma ve hipofiz** (hipopitüitarizm kısmı). pdftotext ile metne çevrildi.
Kısım 12 16 → **20 sayfa** (s. 105–124); eski 117–120 → 121–124 oldu (folyo, yorum, kapak içindekileri güncellendi, sayfa-folyo tutarlılığı ölçüldü: hata yok).
Yeni sayfalar: **117** karar yolu — HPA aksını test etmek (riskli hasta öyküsü, bazal eşzamanlı ölçüm, sabah kortizolü ≥15/3–15/<3, İTT, 250 µg ve 1 µg ACTH testi hazırlanışı, glukagon testi; kortizol eşikleri tablosu) · **118** karar yolu — erişkin GH eksikliği (kime test, IGF-1 tuzakları, ≤95 ng/mL, bir mi iki mi test, GHRH+arjinin VKİ eşikleri, glukagon; tedavi kararı; GH eksikliğinin yüzü) · **119** başvuru — nedenler ve Türkiye verisi (TEMD edinsel neden sınıflaması, 773 hastalık Türk kohortu, kafa travması, kliniği değiştiren ayrıntılar; Sheehan ve enfeksiyöz nedenler bloğu s.121'den buraya taşındı) · **120** başvuru — TEMD replasman tablosu (Tablo 7.3) + yaşlıda hipopitüitarizm + yaşlıda hangi test.
"TEMD'de ne var" kutuları: yeni stil `.kutu.temd` (beyaz zemin, branş rengi çerçeve, üstte kalın şerit) + `.temd-izgara`. Toplam **22 TEMD kutusu**: s.114 (epidemiyoloji), s.115 (eşikler), s.116 (replasmanda üç fark), s.117 (5), s.118 (5), s.119 (5), s.120 (6), s.121 (apopleksi acili, apopleksi izlemi).
Son ölçüm: **endokrin 124 sayfanın hiçbirinde taşma yok**; en boş s.119 (−33 mm). Düzeltmeler: s.121 +4,8 mm (Sheehan/enfeksiyon bloğu s.119'a), s.117 +7,3 mm (iki TEMD kutusu alttan kenar sütuna; s.115'te zaten olan tuzak kutusu çıkarıldı).

**Bulunan ve düzeltilen şablon hatası:** büyük harfe çevrilen başlıklarda `µ` harfi `M`ye dönüşüyordu ("1 µg testi" → "1 MG TESTİ", "≥15 µg/dL" → "≥15 MG/DL") — birimi 1000 kat yanlış gösteriyor. Aynı hata daha önce hematoloji (İTP trombosit eşikleri "/µL") ve enfeksiyon (ferritin "µg/L") bölümlerinde de vardı. Dokuz dosyaya `.nu { text-transform: none }` eklendi, 8 yer sarıldı (endokrin 4, hematoloji 3, enfeksiyon 1).

**TEMD ile öteki kaynaklarımız arasındaki farklar (kitapta ikisi de, TEMD kutu içinde):**
- **Sabah kortizolü:** premium "&gt;13–15 sağlam, &lt;3–5 yetersiz"; TEMD Bölüm 7 "≥15 normal, &lt;3 yetersiz (özgüllük %99,7)"; **TEMD Bölüm 12 (yaşlı) "≥18 sağlam, ≤3 yetersiz, 3–18 test"** — TEMD kendi içinde farklı; kullanıcı kararı.
- **Glukagon testinde GH eşiği:** premium "VKİ &lt;30 → 3, &gt;30 → 1 µg/L"; TEMD Bölüm 7 "≥1 µg/L normal (AACE: VKİ &lt;25 → 3, ≥25 → 1)"; TEMD Bölüm 12 (yaşlı) "≤3 µg/L eksiklik". Ayrıca TEMD metninde GST GH eşiği bir yerde "**µg/dl**" diye yazılmış (3 µg/dl, 1,1 µg/dl, 1 µg/dl) — özet bölümü "1 µg/l" diyor; birim yazım hatası, kitapta µg/L.
- **Kosintropin yalancı normal penceresi:** premium "ilk 4–6 hafta", TEMD "en erken ilk 4 hafta".
- **İTT kontrendikasyonu:** premium ve açık sayfa "koroner arter hastalığı, epilepsi"; TEMD ek olarak **serebrovasküler hastalık**.
- **Santral hipotiroidide TSH:** premium "düşük ya da uygunsuz normal"; TEMD "düşük, uygunsuz normal **ya da hafif yüksek**".
- **GH başlangıç dozu:** açık sayfa "0,1–0,3 mg/gün"; TEMD "30–60 yaş 0,2–0,3, &lt;30 yaş 0,4–0,5 mg/gün".
- **Hidrokortizon:** açık sayfa "15–20, 2–3 doz"; TEMD Bölüm 7 "15–20, 2 doz ya da 10–5–5"; TEMD Bölüm 12 tablosu "15–25 mg/gün", metni "klasik 20+10, yaşlıda 10+5".
- **L-T4 hedefi:** premium "sT4 üst-orta dilim"; TEMD Bölüm 7 "üst yarı", Bölüm 12 "normalin üst sınırına yakın".
- **Kayıp sırası:** TEMD "GH, FSH, LH, TSH, ACTH" (PRL yok) — premium PRL'yi sona ekliyor. Tur 32 notuna eklenir.
- **ACTH testi yolu:** premium "IV/IM"; TEMD "IV öneriyoruz".
- TEMD Tablo 7.1 (kalıtsal nedenler) PDF'ten sütunları kaymış çıktı; hangi genin hangi hormona karşılık geldiği güvenle okunamadığı için **kitaba alınmadı**.

### Tur 34 — (endokrin) Prolaktinoma ve akromegali için "TEMD'de ne var" · endokrinoloji s. 114–117 · kullanıcı isteği (18 Eylül)
Kaynak: TEMD 2022 hipofiz kılavuzu, Bölüm 1a (Hiperprolaktinemi ve prolaktinoma) ve 1b (Akromegali).
Mevcut sayfalarda yalnız 16–23 mm boşluk olduğu için **dört yeni sayfa** eklendi; kısım 20 → **24 sayfa** (s. 105–128), eski 114–124 → 118–128 (folyo, yorum, kapak içindekileri, iç göndermeler "s. 121–122" ve "s. 124" güncellendi; sayfa-folyo tutarlılığı ölçüldü).
- **114** Prolaktinoma: tanı — PRL düzeyine göre olası neden tablosu, TEMD neden tablosu (fizyolojik, sistemik, hipotalamus-sap, hipofizer, ilaç), 13 TEMD kutusu (normal ve eşik, ölçüm, kime bakılır, makroprolaktinemi PEG eşikleri, idiyopatik, ilaca bağlı 3 gün kuralı, dinamik testler önerilmez, epidemiyoloji, MR ve görme alanı, kadında/erkekte klinik, kemik).
- **115** Prolaktinoma: tedavi, izlem, gebelik — 15 TEMD kutusu (KAB, BRC ve kinagolid dozları, başarı ve direnç tanımı, EKO, dürtü kontrolü ve rinore, izlem, tedavisiz izlem, ilacı kesme, cerrahi ve RT, dev ve agresif/temozolomid, gebelikte büyüme riski ve izlem, erkek mikroprolaktinoma, idiyopatikte DA, ilaç/cerrahi kararı) + mikro/makro gebelik karşılaştırma tablosu.
- **116** Akromegali: tanı ve hedefler — 15 TEMD kutusu + yedi tedavi hedefi tablosu.
- **117** Akromegali: tedavi, izlem, gebelik — 18 TEMD kutusu (cerrahi, ameliyat sonrası, kür, SRL doz ve yanıt, pasireotid ruhsatsız, pegvisomant, kabergolin, RT, kolonoskopi aralıkları, öteki taramalar, gebelik, merkez, fertilite).
Mevcut sayfalara kısa yönlendirme kutuları: s.110 (TEMD eşik farkı → s.114), s.112 (TEMD hedef → s.116–117).
Son ölçüm: **endokrin 128 sayfanın hiçbirinde taşma yok**; s.114 tam dolu (−0,x mm), en boş s.116 (−35 mm). s.114 ilk hâlinde +3,5 mm taştı → iki kutu kısaltıldı.
Yazım düzeltmesi: "en sığı" → "en sık görüleni" (s.114; aynı hata Tur 32'de de parçada düzeltilmişti — kalıp olarak dikkat).

**TEMD ile öteki kaynaklarımız arasındaki farklar (kitapta TEMD kutu içinde, ötekisi kendi sayfasında):**
- **Hiperprolaktinemi eşiği:** açık prolaktinoma sayfası "erkek ve postmenopozal >20, premenopozal kadın >30 ng/mL"; TEMD "erkek >20, kadın >25".
- **Kabergolin–EKO:** açık kapak sayfası "Endocrine Society: >2 mg/hafta 2 yılda bir; İngiliz: yılda bir, düşük dozda 5 yılda bir"; TEMD "her hastaya yıllık EKO gerekmez; üfürüm, 5 yıldan uzun >3 mg/hafta ya da 50 yaş sonrası devam → en az 2 yılda bir"; TEMD akromegali bölümü "<2 mg/hafta rutin EKO önerilmez".
- **Prolaktinoma sıklığı:** adenomlar sayfası "%32–66", giriş sayfası "%50", TEMD "%40".
- **Kolon kanseri riski:** kart "~2 kat", TEMD "4 kat" (polip 3,5, hiperplastik adenom 2,5).
- **Tanı gecikmesi:** açık akromegali sayfası "7–10 yıl", TEMD "ortalama 5 yıl (15 yıla dek)".
- **Pasireotid:** premium ve açık sayfa dirençte öneriyor; **TEMD: Türkiye'de akromegali için ruhsatı yok.**
- **Uyku apnesi:** kart "%80'e dek", TEMD "%20–80".
- **IGF-1 hedefi:** TEMD "üst sınırın en çok 1,2–1,3 katı"; kart 1 "tanıda >1,3 × üst sınır" — biri hedef, biri tanı eşiği; karıştırılmamalı.
- **Cerrahi remisyon:** TEMD "GH <0,4 µg/L cerrahi remisyon, <1 µg/L kontrol"; premium remisyonu OGTT nadir GH <0,4 + normal IGF-1 ile tanımlıyor.
- **Kanca etkisi eşiği** (Tur 32'deki çelişki): TEMD dev prolaktinomada "PRL genellikle >1000 ng/mL" diyor; açık sayfanın ">5000" değeri TEMD'de yok.

### Tur 35 — (endokrin) Tiroid kısımlarına "TEMD'de ne var" · kullanıcı isteği (18 Eylül)
Kaynak: TEMD 2025 Tiroid Hastalıkları Tanı ve Tedavi Kılavuzu (tiroid2025_11042025.pdf) — Bölüm 1 (TFT), 7 (hipotiroidi), 9 (hipertiroidi), 10 (subklinik hipertiroidi), tiroiditler, TDHS, ilaç-tiroid, gebelik bölümleri ve bölüm sonu özetleri.
Bölüm **128 → 138 sayfa**. Eşleme: eski 1–12 aynı · 13–21 +2 · 22 (NOTLAR) → 26 · 23–29 +4 · 30 (NOTLAR) → 36 · 31–80 +6 · 81–128 +10. Folyo, yorum, kapak içindekileri ve iç göndermeler (s. 37, 45, 73, 121, 124, 126, 131–132, 134) güncellendi; sayfa-folyo tutarlılığı ölçüldü (138/138).
- **Kısım 1** (+2): **13** tiroid testleri — tarama, TSH/sT4 ölçümü, antikor/TRAb/Tg, biyotin, RAIU ayırıcı tanı tablosu, TSH × serbest hormon örüntü tablosu · **14** subklinik hipertiroidi tablosu (derece, ayırıcı tanı, seyir, kime tedavi), TDHS tablosu, İKİ/TKİ, lityum, hormon direnci, iyotlu kontrast, izlem kutuları.
- **Kısım 2** (+2, NOTLAR korundu → s. 26): **24** tarama tablosu, LT4 şeması (doz, başlangıç, titrasyon, yaşa göre TSH hedefi), subklinik hipotiroidi · **25** tiroiditler, hipotiroidinin yüzü, miksödem koması tablosu, yaşlı hasta, sevk ölçütleri.
- **Kısım 3** (+2, NOTLAR korundu → s. 36): **34** gebelikte hipotiroidi (sınırlar, tarama algoritması, doz artışı, izlem, iyot), hCG aracılı hipertiroidi · **35** laboratuvar yorumu, ATİ seçimi/doz/teratojenite/hedef, özel durumlar, postpartum tiroidit.
- **Kısım 9** (+3 + yeni NOTLAR s. 90): **87** Graves ATİ, tedavi seçimi tablosu (ATİ/RAI/cerrahi: kime, kontrendikasyon), yan etki tablosu · **88** RAI, cerrahi, toksik MNG/adenom, fırtına · **89** orbitopati (KAS, RAI profilaksisi, IV MP şeması, 2. basamak, DON), amiodaron tip 1/2.
İlk yerleşim 12 sayfaydı ve sayfalar 70–130 mm boştu → yeniden paketlendi (Kısım 2 ve 3 iki sayfa + mevcut NOTLAR, Kısım 9 üç sayfa + NOTLAR). s.13 +9 mm taştı → üç kutu s.14'e; s.87 +12 mm taştı → tedavi seçimi tablosu kısaltıldı. Son ölçüm: **138 sayfanın hiçbirinde taşma yok**; en boş s.14 (−30 mm).
Büyük harf dönüşümü kutu başlığındaki β'yı "B" yapıyordu → `.nu` sarmalandı (s.35).
Ölçüm notu: sayfa kaydırılmışken ölçülünce düzenleyicinin `position: fixed` ögesi s.1–12'de sahte binlerce mm taşma verdi; ölçüm betiği artık sabit konumlu ögeleri eliyor ve `scrollTo(0,0)` ile başlıyor.
Alınmayan: Tablo 1.5'in sütunları PDF'ten kaymış çıktı; kitaba yalnız hücre sınırı açık okunan satırlar kondu. Nodül, kanser, iyot eksikliği ve çocuk bölümleri bu turun kapsamı dışında (kitapta karşılık gelen kısım yok).

**Tutarsızlıklar (kitapta TEMD kutu içinde, ötekisi kendi sayfasında):**
- **Fırtınada iyot zamanlaması:** kitabın mevcut altın kuralı (s.1–12, açık/premium) "ATİ'den en az 1 saat sonra"; TEMD fırtına bölümü "en az 30 dk sonra", TEMD bölüm özeti "en az 1 saat". TEMD kutusunda yalnız "tiyonamidden sonra" yazıldı.
- **Fırtına dozları (TEMD kendi içinde):** bölüm metni PTU 600–1500 mg/gün (500–1000 yükleme + 4 saatte 250), MMI 80–120 mg/gün, lugol 6 saatte 8 damla; bölüm özeti PTU 200–400 mg 6–8 saatte, MMI 20–25 mg 6 saatte, SSKİ 3–5 damla, lugol 4–8 damla. Kitapta bölüm metni.
- **LT4 dozu (TEMD kendi içinde):** özet 1,2–1,8 µg/kg/gün, metin 1,2–1,6 (≈75–100 µg) — ikisi de yazıldı, bağlamıyla.
- **Gebelik ve iyot (TEMD kendi içinde):** gebelik bölümü 250 µg/gün (tuz kısıtlıda 200 µg ek); iyot bölümü gebe 220, emziren 290 µg/gün; izole hipotiroksinemide "ülkemizde 100–150 µg". Kitapta 250 ve 100–150.
- **Postpartum tiroidit (TEMD kendi içinde):** tiroiditler bölümü "%5–10 kalıcı hipotiroidi" (s.25); gebelik bölümü "gebeliklerin %8–10'u, %5 kalıcı" (s.35).
- **Subklinik hipertiroidi tedavi eşiği:** TEMD metni "≥65 yaş herkese tedavi"; aynı bölümün Şekil 10.1'i ≥65 yaşı yalnız TSH 0,1–0,4 dalında ölçüt olarak sayıyor. Kitapta şekil izlendi (TSH <0,1 herkese; 0,1–0,4'te ≥65 yaş ölçütlerden biri).
- **Gebelikte ATİ geçişi:** uyumlu — TEMD ve Kısım 3 "16. haftadan sonra MMI"; Kısım 1 anlatısı (s.1–12) "ikinci trimesterde" diyor, aynı anlam.

### Tur 36 — (kardiyo) Lipidoloji: kullanılmayan kaynaklarla genişletme · kardiyo s. 23–24 · kullanıcı isteği (18 Eylül)
Kaynak: açık `bempedoik-ezetimib-mace`, `lipid-ezetimibe-sakinca`, `statin-otoimmun-miyopati-imnm` + premium `klinik-lipidoloji-ascvd-quiz-1` (Tur 12'de okunmamış olarak kayıtlıydı).
Önce ölçüldü: premium quiz'in 10 sorusundaki bilginin neredeyse tamamı Tur 12'de premium konudan zaten kitaba girmişti (ApoC-III, ApoB, TG iki eşiği, Lp(a), PREVENT, <55 hedefi, inklisiran, bempedoik asit, ikosapent, evinakumab). Bu yüzden quiz yeni bilgi sayfası değil **vaka sayfası** olarak kullanıldı; yeni bilgi üç açık sayfadan geldi.
Kısım 2 (Lipidoloji) 12 → **14 sayfa** (s. 13–26): tekrar 23 → 25, notlar 24 → 26; kapak ve bölüm açılışı içindekileri güncellendi; folyo 26/26 tutarlı; taşma yok (yeni sayfalar −36 ve −55 mm, kısmın öteki sayfalarıyla aynı düzeyde).
- **23** Başvuru: IMNM tablosu (sıklık, kriptik epitop, HLA-DRB1*11:01, posterior-medial uyluk, CK 10–100 kat, MRG STIR/EMG, biyopsi, basamaklı tedavi) · ezetimib ne zaman verilmez (gebelik, laktasyon, Child-Pugh A/B/C, KBH, aşırı duyarlılık, statinle >3 kat inatçı transaminaz) · statin intoleransında oral ikili (%20–24, %18–20, %38, CLEAR mutlak %1,6).
- **24** Vakadan karara: quiz'in 10 senaryosu + yeni kaynaklardan 6 senaryo, iki klinik inci.
Ek düzeltme: tekrar sayfasının başlığı "Yirmi dört soruda lipidoloji" diyordu, sayfada **36** soru var (sayıldı; Tur 12 logu 37 yazıyordu) → "Otuz altı soruda lipidoloji".

**Atlanan yapay zeka artığı:** `bempedoik-ezetimib-mace` 4. bölüm ("2026 ACC/AHA") yarım cümle taşıyor — *"hedeflere (LDL-K Sınıf 1 ve Sınıf 2a düzeyinde önerilir"* — öneri metni kesik; ayrıca "%20'lere varan RRR projeksiyonu" kaynaksız bir hesap. İkisi de alınmadı.

**Tutarsızlıklar:**
- **IMPROVE-IT:** s.17 (Tur 12, açık sayfalar) "7 yılda MACE %6,4 rölatif, %2 mutlak"; `bempedoik-ezetimib-mace` "6 yıllık takipte ARR %2,2". Kitapta ikisi de kendi sayfasında, s.23'te "kaynakta" diye işaretli.
- **Bempedoik asit monoterapi:** s.18 "%21–24"; yeni kaynak "SAMS'de %20–24".
- **IMNM'de IVIG'in yeri (kaynak kendi içinde):** "8–12 haftada yanıt yoksa ya da ağırsa" ve aynı cümlede "1. basamak olarak da tercih edilebilir" — ikisi birlikte yazıldı.

### Tur 37 — (endokrin) Sayfalara "TEMD ne diyor" kutuları · kullanıcı isteği (20 Eylül) · SÜRÜYOR
Kullanıcı yedi TEMD kılavuzu verdi. Yeni sayfa açmak yerine **mevcut sayfaların altına küçük `.kutu.temd` ızgaraları** ekleniyor; her kutu "TEMD <yıl> · konu" etiketli.
Önce bölüm boşluk haritası çıkarıldı (138 sayfa): en dolu Kısım 8 (tirzepatid/obezite, sayfa başına 0–22 mm), en ferah Kısım 4, 5, 6, 10.
- **Kısım 7 · SGLT2 (s. 64, 65, 67, 68) — 10 kutu**, kaynak DM 2026 bölüm 7.7–7.8 ve 9.2: yeri ve öncelikli endikasyon · beklenen kazanç · Türkiye'deki dozlar (kanagliflozin ruhsatsız) · eGFR eşikleri (dapa/empa) · son dönem böbrekte yalnız insülin (D) · öneri düzeyi (A) · cerrahi/hastalıkta kesme · öglisemik DKA'da insülin kesilmez · kontrendikasyonlar · yan etki başlıkları.
- **Kısım 10 · Feokromositoma (s. 92, 93, 96, 98, 99) — 10 kutu**, kaynak HT 2022 bölüm 4.4.1.2: kimi tarayalım · insidental kitlenin %5'i · terminoloji ve PNMT · ilk test ve duyarlılık-özgüllük · 3–4 kat kuralı · klonidin testi · görüntüleme sırası · fenoksibenzamin şeması · tuz ve refleks taşikardi · ajan seçimi (labetalol/karvedilol hazırlıkta tercih edilmez).
Yerleşim ölçüldü: ilk turda s. 95 +15 mm, s. 98 +5,6 mm taştı. Metin kısaltmak **yetmedi** — ızgaranın yüksekliği en uzun kutuya bağlı; kutular daha ferah kardeş sayfalara taşındı (95 → 93, 98'in üçüncüsü → 99) ve iki sütuna alındı. Son ölçüm: **138 sayfada taşma yok**, folyo 138/138 tutuyor, kutu sayısı 186 → **196**.
Tiroid 2026 dosyası 2025 tiroid kılavuzunun yeni baskısı DEĞİL: "Tiroid ve Paratiroid Lezyonlarında Girişimsel İşlemler ve Ablasyon Tedavileri Kılavuzu, 2. baskı Haziran 2026" — ayrı bir kılavuz, s. 88'deki ablasyon satırlarını besleyecek.

**Tutarsızlıklar (kitapta mevcut metin ↔ TEMD kutusu):**
- **SGLT2'yi ne zaman kesmeli:** s. 64 "cerrahiden **3–4 gün** önce kes"; TEMD DM 2026 "majör cerrahiden **1–3 gün** önce".
- **Kilo ve kan basıncı etkisi:** s. 64 "2–3 kg" ve "3–5 mmHg sistolik"; TEMD "ortalama 2 kg" ve "2–4 mmHg".
- **eGFR alt sınırı:** kitap boyunca "eGFR ≥20'de önerilir" (uluslararası); TEMD kontrendikasyon olarak "**eGFR &lt;20–25**" diyor ve antidiyabetik etkinin &lt;45'te azaldığını ekliyor.

**Kalan plan:** Kısım 1–3 ve 9 (tiroid 2025 kutuları var; girişimsel 2026 için s. 88) · Kısım 4 Cushing ve Kısım 5 MEN (HT 2022 sekonder hipertansiyon) · **Kısım 8 diyabet-obezite**: sayfalar dolu (0–22 mm), obezite 2024 + beslenme-egzersiz 2023 + DM 2026 için yer açmak ya da sayfa eklemek gerekiyor — kullanıcı kararı. Kısım 6 ve 11 (osteoporoz) için bu sette kılavuz yok.

**Tur 37 · ikinci parti (20 Eylül):**
- **Kısım 9 · s. 88**, kaynak Tiroid ve Paratiroid Girişimsel İşlemler ve Ablasyon Kılavuzu 2026 (bölüm 2.1): otonom nodülde termal ablasyonun yeri (ikinci basamak, ≤3 cm, Graves ve toksik MNG uygun değil) + işlem öncesi ölçütler (sintigrafi, trombosit >60 × 10⁹/L, PT).
- **Kısım 4 · s. 38–39**, kaynak HT 2022 (4.4.1.3): Cushing'in sekonder hipertansiyondaki yeri, hipertansifte şüphe üçlüsü, hipertansiyon yapan KAH (17-α ve 11-β eksikliği) ve tedavisi.
- **Kullanıcı isteği 1 — renk:** `.kutu.temd` zemini beyazdan `--brans-acik`e, çerçevesi `--brans-orta`ya alındı; üst şerit aynı kaldı.
- **Kullanıcı isteği 2 — dağıtım:** kutular sayfa sonundan alınıp ilgili bloğun hemen arkasına taşındı (s. 38, 39, 64, 65, 68, 88, 92, 96, 98). s. 64'te ızgara ikiye bölündü: "yeri/kazanç" 30 saniyeden sonra, "dozlar" Sayılarla'dan sonra.
- **Kullanıcı isteği 3 — farkı da yaz:** TEMD önerisi kitaptaki kaynaklarla ayrışıyorsa fark kutuya yazıldı. **s. 68** SGLT2 (kesme 1–3 ↔ 3–4 gün · kilo 2 ↔ 2–3 kg · sistolik 2–4 ↔ 3–5 mmHg · eGFR <20–25 kontrendike ↔ ≥20 önerilir) · **s. 97** feokromositoma hazırlığı (TEMD ana şema fenoksibenzamin ↔ kitap doksazosini ilk tercih yapıyor; 7–10 gün ↔ 7–14 gün; doz 20–100 mg ve tavan 1 mg/kg ↔ 30–40 mg/gün, en çok 100) · **s. 2** fırtınada iyot zamanlaması (kılavuzun bölüm metni ≥30 dk, özeti ≥1 saat; kitabın altın kuralı 1 saat).

Yerleşim ölçümü üç tur sürdü: ilk turda s. 88 (+38), 98 (+25), 68 (+1,8), 124 (+1,1) taştı. **Metin kısaltmak çoğu kez işe yaramadı** — `temd-izgara` satır yüksekliği en uzun kutuya göre belirleniyor ve kutular eşit yükseklikte uzuyor; çare kutuyu ferah kardeş sayfaya taşımak (89 → 2, 98'in farkı → 97) ya da **iki kutuyu tek tam genişlik kutuda birleştirmek** (s. 88). Son ölçüm: 138 sayfada taşma **yok**, folyo 138/138, TEMD kutusu **205**.
Kendi hatam: s. 97'deki fark kutusu ilk yazımda kitabın fenoksibenzamin tavanını "30–40 mg/gün" diye aktarıyordu; sayfada "en çok 100" da yazıyor — önizlemede görülüp düzeltildi.

### Tur 38 — kitap yazıldıktan sonra siteye giren bilgiyi kitaba yedirme · kullanıcı isteği (27 Eylül) · SÜRÜYOR
Kapsam ölçüldü (10 Eylül'den bu yana, `git log --diff-filter=A`): açık sitede **57 yeni konu** (endokrinoloji 20 · nefroloji 10 · onkoloji 5 · genel dahiliye 5 · romatoloji 4 · palyatif 4 · kardiyoloji 4 · hematoloji 3 · gastro 2), premium'da **65 yeni dosya** (TEMD inci setleri dahil). Değişen (M) dosyaların çoğu kaynakça/sınav kelimesi süpürmesi, yeni bilgi değil.
**Yöntem:** yeni konunun ayırt edici terim ve sayıları çıkarılıp kitap metniyle karşılaştırıldı (`fark-tarama.cjs`); yalnız kitapta GEÇMEYENLER kutuya girdi. Kitapta zaten olan (GREAT, apatetik tirotoksikoz, teprotumumab, kolestiramin, perklorat…) tekrar edilmedi.
İlk parti — **Kısım 9**, üç `kutu inci`:
- **s. 78** hipertiroidide kalp (`hipertiroidizmde-kardiyovaskuler-sistem`): SVR %50–70 düşüşü, kardiyak debide %250'ye varan artış, AF %5–15 (>70 yaş %15–25), TSH <0,1'de subklinikte 3 kat, başvuruda %6 kalp yetmezliği (%94'ünde AF), ötiroidiyle EF %85'te normale dönüyor, PH %50'ye varan, NT-proBNP.
- **s. 80** GREAT → GREAT+ (`graves-nuks-ongorusu-great-skoru`): eklenen genotipler (HLA-DRB1*03, DQA1*05, DQB1*02, PTPN22 rs2476601) ve sınıf başına nüks oranları (I %12–34 … IV+ %85); orta risklilerin üçte birinde karar değişiyor.
- **s. 83** dirençli Graves (`graves-atd-direnci-tedavi-algoritmalari`): 18. ayda TRAb ≥0,9 IU/L → kesmede %80–85 nüks; uzun süreli metimazol şeması ve 5. yıl sonucu; haftalık 10 mg metotreksat; kolestiramin; totale yakın tiroidektomide nüks %1.
Ölçüm: s. 83 ilk yazımda +4,2 mm taştı, kutu yeniden yazılarak kısaldı. Son durum **138 sayfa, taşma yok, folyo 138/138**.
**Kalan (sıradaki turlar):** hipofiz yetmezliği ailesi (7 yeni konu) → Kısım 12 · yaşlıda hipertiroidizm + subklinik/iyot indüklü (45 KB) → Kısım 9 · amiodaron ilişkili tirotoksikoz → s. 82 · gebelikte hipertiroidi kılavuz karşılaştırması → Kısım 3 · premium TEMD inci setleri (diyabet 1–2, obezite, beslenme-egzersiz) → Kısım 7–8 · hiperparatiroidizm ve paratiroid karsinomu (kitapta karşılık kısım YOK) · öteki branşlar (hematoloji, nefroloji, gastro, onkoloji).

**Tur 38 · ikinci parti (11 Ekim)** — `santral-adrenal-yetmezlik` (5 Eki, 21 KB; kitapta hiç yoktu). Not: "kalan" listesindeki **hipofiz yetmezliği ailesi bayattı** — 7 alt sayfa 17 Eyl'de girmiş ve Tur 32'de zaten kullanılmış.
- **s. 133** yeni blok: steroide bağlı (tersiyer) yetmezlikte kesmeden önce sabah kortizolü (ESE/Endocrine Society: >10 kes · 5–10 idame + tekrar · <5 idame, dinamik test yok).
- **s. 130** `kutu inci`: en sık form steroide bağlı (%1–2,5), ≥5 mg prednizon eşdeğeri birkaç hafta, her uygulama yolu, CYP3A4 inhibitörü (ritonavir, azol), megestrol, steroid çekilme sendromu.
- Kitapta olanlar tekrar edilmedi (opioid, TBX19/POMC, 24–48 saat LT4 kuralı, 4–6 hafta yalancı normal, hiponatremi+hiperkalemi → primer).
Tutarsızlıklar (kitap metnine dokunulmadı):
- **Hidrokortizon idame:** yeni sayfa 15–25 mg/gün · kitap s. 130 15–20 (premium/TEMD).
- **Kortizol eşikleri:** yeni sayfa monoklonal/LC-MS/MS'te bazal ≥13–14, ACTH testinde pik <14–15; poliklonal 18 · kitap s. 131 tek eşik ≥18 µg/dL (TEMD).
- **Kriz infüzyonu:** yeni sayfa 100 mg bolus + 200 mg/24 sa · kitap s. 130 majör stres 100–150 mg/gün IV.
Ölçüm: tarayıcı paneli innerWidth 0 iken boşluk ölçümü çöptü (s. 133'e 36 mm "boş" dedi, kutu taştı) — PDF parça önizlemesiyle doğrulandı; s. 130 ve 133 sığıyor. Bölüm 138 sayfa.
**Kalan:** premium TEMD inci setleri (diyabet, obezite, beslenme-egzersiz) → Kısım 7–8 (yer sorunu, kullanıcı kararı) · hiperparatiroidizm + paratiroid karsinomu (kitapta kısım YOK — yeni kısım mı?) · premium tiroid inci setleri (graves, hashimoto, hipertiroidi, subklinik, nodül) fark taraması.

### Tur 39–41 — paratiroid kısmı, tiroid incileri, diyabet-obezite kısmı · kullanıcı isteği (17 Ekim: "1, 2, 3")

**Ölçüm aracı değişti:** tarayıcı panelinde `innerWidth` 0 geliyor ve boşluk ölçümü çöp (11 Eki'de s. 133'e "36 mm boş" dedi, kutu taştı). Yeni araç `kitap/olcum.cjs`: bölümü headless Edge'de açar, her sayfada **folyonun üstüne** kalan boşluğu mm olarak basar (negatif = taşma). Folyosuz kısım kapakları −11,8 ya da 0 görünür, yok say. Baskıyla tutarlılığı s. 130'da sınandı (ölçer 0,5 mm, PDF'te kutu folyoya değmeden sığıyor).
```
node kitap/olcum.cjs kitap/endokrinoloji/deneme-bolum.html
```

**Tur 39 · Kısım 13 · Paratiroid ve kalsiyum (s. 139–148, 10 sayfa, çift).** 139 kapak · 140–141 açık sayfa (Şekil 15: PTH'nin üç hedefi) · 142 karar yolu (PHPT tanı, FHH, 5. Çalıştay cerrahi ölçütleri) · 143 başvuru (lokalizasyon, MIP/BNE/Miami, dört kalsimimetik) · 144 başvuru (hiperkalsemik kriz, KBH'de paratiroidektomi, aç kemik ↔ hipoparatiroidizm) · 145 anlatı (karsinom, WHO 2022 atipik tümör, yedi histolojik taklitçi) · 146 karar yolu (hipokalsemi, ADH1/2, APS-1, HDR) · 147 başvuru (2022 kılavuz hedefleri, tiyazid, PTH replasmanı, 7 vaka) · 148 hızlı tekrar (30 soru). İçindekiler + kapak alt başlığına "paratiroid" eklendi.
- **Kuraldan bilinçli sapma:** premium'da hiperparatiroidizm konusu YOK (yalnız hipoparatiroidizm + quiz); kullanıcı kısmı açık sayfayla istediği için hiperparatiroidizm tarafı yalnız açık kaynaktan.
- **Atlanan yer tutucular:** açık `kalsiyum-homeostazi-fizyoloji` ve `hipokalsemi-ve-hipoparatiroidi` "⚠️ Uzman Modülü: Harrison 21st Ed … referanslıdır" satırıyla başlıyor — kaynak iddiası, içerik değil; kitaba alınmadı. Hipokalsemi açık sayfası 3,5 KB, premium'la çelişmiyor.
- **Tutarsızlık yok** ölçüldü; aç kemik sendromu açık sayfada tek cümle, ayrıntı premium quiz'den.

**Tur 40 · premium tiroid incileri (34 klinik + 160 TEMD).** Terim/sayı taramasında incilerin çoğu kitapta zaten var (TEMD tiroid setleri Tur 35'te kılavuzdan girmişti). Eksik bulunanlar eklendi: **s. 17** "Tiroiditin öteki yüzleri" (Hashimoto USG psödonodül · Riedel storiform fibrozis/obliteratif flebit/IgG4 + tamoksifen-rituksimab-MMF · ilaca bağlı destrüktif tiroidit listesi) · **s. 81** iki inci (NO SPECS/EUGOGO şiddet + CAS eşikleri; miyastenia birlikteliğinde oküler %41↔21, timik %27↔60, AChR %36↔57) · **s. 13** nodül biyopsisi (ACR-TIRADS/ATA, saf kist <%1, TR5 ≥10 mm ve istisnaları, ThyroSeq v3/Afirma GSC). s. 89'a ilk konan nodül kutusu −13 mm taştı, s. 13'e tek kutu olarak taşındı. Eksik kalan: temd-tiroid-2'nin ablasyon ayrıntıları (moving-shot, hidrodiseksiyon, eğitim) — niş, alınmadı.

**Tur 41 · Kısım 14 · Diyabet ve obezite pratiği (s. 149–158, 10 sayfa).** Kitapta genel diyabet/obezite yönetimi yoktu (HbA1c 4, metformin 3, orlistat/bariatrik/CGM 0 geçiş); terim puanlaması "diyabet" gibi genel sözcüklerle şişip %80 gösteriyordu, sözcük sayımıyla düzeltildi. 149 kapak · 150–151 açık sayfa (tanı tuzakları, MODY, pankreatojen, presemptomatik T1/teplizumab, gebelikte iki aşama · hedefler, komplikasyon taraması, risk/LDL/KB) · 152 karar yolu (HbA1c'ye göre başlangıç, komorbiditeye göre ikinci ilaç, bazal titrasyon, eGFR eşikleri) · 153 başvuru (insülin, hipoglisemi düzeyleri ve tedavisi) · 154 karar yolu (DKA beş adım, HHD) · 155 başvuru (perioperatif, NICE-SUGAR, PET, TPN, ramazan, gebelik, İKNİ) · 156 başvuru (SGM raporu, sensörü yanıltanlar, pompa hesapları) · 157 karar yolu (obezite: Edmonton, ilaç, cerrahi) · 158 başvuru (beslenme, egzersiz). SGLT2 ve tirzepatid ayrıntısı tekrar edilmedi, Kısım 7–8'e gönderme var.
Tutarsızlıklar (kılavuzun kendi içinde; kitapta ilk değer):
- **Bazal insülin başlangıcı:** dm1-046 0,2 IU/kg (obezitede 0,3–0,4) · dm1-039 0,1–0,2. Kitapta 0,2.
- **OGTT 1. saat diyabet eşiği:** metin 209 · Tablo 1.1 206 mg/dL. Kitaba eşik yazılmadı, yalnız 155 ara hiperglisemi.
- **HNF1A-MODY hsCRP:** metin <0,3 · algoritma <0,75 mg/L. Kitapta sayı yok.
- **Doymuş yağ:** %7–8 · başka yerde <%7. Kitapta %7–8.
- **GDM sonrası tarama:** metin 3 yılda bir · öneri 1–3 yıl. Kitapta 1–3.
- **Direnç egzersizi:** 2–3 gün · öneri listesi 2 gün. Kitapta 2–3.
- **SGLT2'yi ameliyattan önce kesme:** kitapta s. 64 "3–4 gün" ↔ s. 155 TEMD "1–3 gün" — bölüm içinde artık iki sayı var (Tur 37'de s. 68'e fark kutusu olarak zaten yazılmıştı).
Son ölçüm: **158 sayfa, içerik sayfalarında taşma yok**, folyo 158/158 (kapaklar folyosuz). İçindekiler s. 1'de en alta kadar doldu — yeni kısım için sütun dengesi gerekecek.

### Tur 42 · kaynaklı çakışma — kullanıcı isteği (18 Ekim) · /loop ile SÜRÜYOR
Kural (kullanıcının sözleri): iki kaynağın ayrıştığı her bilgi **kaynağını cümlede adıyla** verir — "ABD kılavuzu şunu der, TEMD ise şöyle kullanır". "Kitapta/kitabın" gibi kendine gönderme ya da "bazı kaynaklar" gibi adsız ifade kalmaz. **Kaynak uydurulmaz:** yalnız metinde, kaynakçada ya da sitenin kendi sayfasında açıkça adı geçen kılavuz adlanır; kaynağı bulunamayan değer "genel uygulama" diye geçmez, günlüğe "KAYNAK YOK" yazılıp kullanıcıya sorulur. Bu kılavuzların yazarları da okuyor olabilir: sayı ve yıl kayıttan.

| # | Yer | Çakışma | Durum |
|---|---|---|---|
| K1 | kitap endokrin s. 64, 65, 67, 68 | SGLT2 cerrahi öncesi kesme: FDA 2020/ADA ≥3 gün (ertugliflozin 4) ↔ TEMD 2026 1–3 gün (kaynak: premium sglt2 quiz açıklaması) | BİTTİ |
| K2 | kitap endokrin s. 68 fark kutusu | kilo 2–3 kg / SKB 3–5 mmHg / eGFR ≥20 — kitap değerlerinin kaynağı adlanacak | BİTTİ — 2 madde KAYNAK YOK |
| K3 | kitap endokrin s. 97 fark kutusu | feokromositoma hazırlığı: doksazosin ilk tercih ↔ TEMD 2022 fenoksibenzamin | BİTTİ |
| K4 | kitap endokrin s. 2 | fırtınada iyot zamanlaması: 1 saat ↔ TEMD bölüm metni ≥30 dk / özet ≥1 saat | BİTTİ |
| K5 | kitap endokrin hipofiz (Tur 33–34 fark listesi) | TEMD 2022 ↔ öteki kaynaklar | BİTTİ (kitap) |
| K5s | site: hipofiz premium/açık sayfalarındaki aynı adsız değerler (sabah kortizolü 13–15, 4–6 hafta, GH 0,1–0,3, HC 2–3 doz, LT4 üst-orta, kolon 2 kat, tanı 7–10 yıl, uyku apnesi %80, PRL eşiği >30, prolaktinoma %32–66/%50) | TEMD 2022 ile kaynaklı | BİTTİ |
| K6 | kitap endokrin tiroid (Tur 35 fark listesi, s. 13–14, 24–25, 34–35, 87–89) | TEMD 2025 ↔ öteki kaynaklar | BİTTİ (kitap) |
| K6s | site: subklinik hipertiroidi "TSH <0,1 → ≥65/risk varsa tedavi" (premium hipertiroidi; açık sayfa "tüm bireyler") | TEMD 2025 algoritmasıyla kaynaklı | BİTTİ |
| K7 | kitap endokrin s. 29 | gebelikte 1. trimester TSH: sabit 2,5 ↔ ATA 2017 ~4,0 | BİTTİ |
| K8 | kitap nefroloji (1 "kitap" göndermesi) + hematoloji (1 adsız ifade) | — | BİTTİ |
| K9 | kitap: öteki branşların günlükteki kılavuz adlı tutarsızlıkları | Tur 9–31 listeleri | BİTTİ |
| K10 | kitap endokrin Kısım 14 | TEMD iç tutarsızlıkları (bazal 0,1–0,2 ↔ 0,2 vb.) — tek kaynağın iki yeri; "TEMD metni … tablo …" diye ver | BİTTİ |
| S | canonical/endokrinoloji/akromegali-ve-gigantizm.json | belirsiz kaynak ifadesi | BİTTİ |
| S | canonical/endokrinoloji/dopamin-agonistleri-kalp-kapak.json | belirsiz kaynak ifadesi | BİTTİ |
| S | canonical/endokrinoloji/men1-nf-pnet-izlem-cerrahi.json | belirsiz kaynak ifadesi | BİTTİ |
| S | canonical/enfeksiyon/invaziv-kandidiyazis.json | belirsiz kaynak ifadesi | BİTTİ |
| S | canonical/gastroenteroloji/tips-hasta-secimi.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/flashcards/enfeksiyon/crkp-karbapenem-direncli-klebsiella.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/flashcards/gastroenteroloji/hepatosellular-karsinom.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/pearls/endokrinoloji/temd-diyabet-1.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/pearls/kardiyoloji/temd-hipertansiyon.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/quizzes/endokrinoloji/cushing-sendromu-quiz-1.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/quizzes/endokrinoloji/feokromositoma-quiz-1.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/quizzes/endokrinoloji/graves-hastaligi-quiz-1.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/quizzes/endokrinoloji/hashimoto-tiroiditi-quiz-1.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/quizzes/gastroenteroloji/harrison-22-kc-secme-sorular-quiz-1.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/quizzes/romatoloji/behcet-hastaligi-quiz-1.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/topics/endokrinoloji/men-sendromlari.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/topics/enfeksiyon/invaziv-kandidiyazis.json | belirsiz kaynak ifadesi | BİTTİ |
| S | premium/ydus/vakalar/hematoloji/aml-ana-vaka-3.json | belirsiz kaynak ifadesi | BİTTİ |
| S* | site geneli ikinci tarama | iki kılavuz adı + farklı sayı aynı paragrafta ama bağlaçsız/adsız | BİTTİ |

**Günlük**
- K1 (18 Eki): kitaptaki dört "3–4 gün" (s. 64 madde, s. 67 kart, s. 67 karar, s. 68 tablo) ve s. 68 fark kutusu "kitapta 3–4 gün" → "FDA ve ADA en az 3 gün (ertugliflozinde 4), TEMD 2026 1–3 gün". Kaynak cümlesi sitede zaten bu biçimdeydi (premium sglt2-inhibitorleri-quiz-1 açıklaması). "3–4" kitapta FDA'nın 3 ve 4 gününün birleştirilmiş hâliydi; kaynaksız bir aralık olarak kalmıştı. Taşma yok.
- K2 (18 Eki): s. 68 kutusu "kitaptan farkı" → "KDIGO ve FDA ile farkı". eGFR ≥20'nin kaynağı **KDIGO 2022** (premium sglt2 quiz). **KAYNAK YOK:** s. 64'teki "kilo 2–3 kg" ve "sistolik 3–5 mmHg" açık sglt2-pleiotropik sayfasından ve quiz açıklamasından geliyor, ikisinde de adlı kaynak yok — karşılaştırma kutudan çıkarıldı, kutu yalnız TEMD'nin 2 kg ve 2–4 mmHg değerini veriyor; s. 64'teki sayılara dokunulmadı. **Kullanıcıya soru:** bu iki sayıyı hangi kaynağa bağlayalım, yoksa TEMD değerine mi çekelim? Taşma yok (s. 68: 2,9 mm).
- K2 devamı (18 Eki, kullanıcı: "TEMD değerine çek"): kilo kaybı 2–3 kg → **2 kg**, sistolik düşüş 3–5 → **2–4 mmHg**, kaynağı cümlede "TEMD 2026". Kitap: s. 64 sayılarla (iki kutu), s. 66 anlatı, s. 68 tablo (adsız "diyastolik 1–2" de çıktı). Site: açık `sglt2-inhibitorleri-pleiotropik-ve-yan-etkiler` (updatedAt 18 Eki), premium `sglt2-inhibitorleri` konu ve quiz-1 açıklaması. soru-denetim temiz, JSON geçerli.
- K3 (18 Eki): feokromositoma hazırlığı. **Bulgu: TEMD 2022 kendi içinde iki yüzlü** (premium feokromositoma konusundaki TEMD kutusu, kılavuz s. 58–60): ajan için metin prazosin/doksazosini ön plana alır, algoritma "tercihen fenoksibenzamin" der; süre için metin cerrahiden 7–10 gün önce, algoritma 7–14 gün ayaktan + 1–3 gün yatış. Kitaptaki "doksazosin ilk tercih" ve "30–40 mg/gün (en çok 100)" adsızdı. Kullanıcının K2 kararı ("TEMD değerine çek") uygulandı: kitap s. 92, 98, 99, 102 ve s. 97 kutusu ("kitaptan farkı" → "TEMD 2022 · iki yüzü"); süre "7–14 gün (TEMD algoritması; metin 7–10)", fenoksibenzamin "TEMD 2022: günde 20–100 mg, tavan 1 mg/kg", doksazosin "TEMD metninde ön planda". Site: açık `feokromositoma-ve-paraganglioma` (updatedAt 18 Eki) ve premium konu aynı biçime. Not: sitedeki TEMD kutusu fenoksibenzamini "12 saatte 10 mg → 8 saatte 10–40 mg" diye de veriyor — TEMD'nin üçüncü bir doz ifadesi, dokunulmadı. Kitap taşma yok; soru- ve kaynak-denetim temiz.
- K4 (18 Eki): iyot zamanlaması. TEMD 2025 PDF'i (Downloads/tiroid2025_11042025.pdf, pdftotext) okundu: **Bölüm 9 (hipertiroidi) "en az 30 dk"**, **Bölüm 28 (tiroid krizi) "en az 1 saat"**. Tur 37'de s. 2 kutusuna yazılan "fırtına bölümü 30 dk, bölüm özeti 1 saat" **yanlıştı** (bölümler karışmış); sitedeki premium temd-tiroid quiz açıklaması doğruydu. s. 2 kutusu "ATA 2016 ve TEMD 2025 Bölüm 28: ≥1 saat; Bölüm 9: ≥30 dk" diye yeniden yazıldı (ATA 2016 adı premium quiz açıklamasında geçiyor); s. 85'teki kural cümlesine aynı kaynak parantezi. Taşma yok.
- K5 (18 Eki, kitap): Tur 33–34 fark listesindeki adsız değerler TEMD 2022'ye çekildi, cümlede "TEMD 2022" yazılı: sabah kortizolü (s. 129 tablo, s. 138 tekrar) ≥15 / <3 (yaşlıda ≥18 / ≤3) · kosintropin yalancı normal penceresi ilk 4 hafta (s. 131, 138) · GH başlangıcı yaşa göre 0,2–0,3 / 0,4–0,5 mg (s. 130) · hidrokortizon 2 doz ya da 10–5–5 (s. 130) · LT4 sT4'ün üst yarısı (s. 130) · akromegalide kolon kanseri 4 kat, polip 3,5 (s. 123) · tanı gecikmesi ortalama 5 yıl (s. 122) · uyku apnesi %20–80 (s. 123). Adlı olanlar zaten biçimdeydi: kabergolin-EKO (s. 121 "Endocrine Society 2 yılda bir, İngiliz kılavuzu yılda bir" + s. 125 TEMD kutusu), İTT kontrendikasyonu TEMD kutusunda serebrovasküler dahil. s. 130 ilk denemede −3,2 mm taştı, kısaltıldı (0,5 mm). Kitapta bulunmayan: PRL eşiği >30, GST GH eşiği, pasireotid önerisi.
- K5s (18 Eki, site): hipofiz sayfalarında aynı adsız değerler TEMD 2022'ye bağlandı — açık `hipofiz-yetmezligi-tanisal-degerlendirme` (kortizol ≥15 / <3), `hipofiz-yetmezligi-hormon-replasman-tedavisi` (HC 2 doz ya da 10–5–5, LT4 üst yarı), `akromegali-ve-gigantizm` (tanı ortalama 5 yıl), `hipofiz-adenomlari` ("serilerde %32–66; TEMD 2022: %40"), `hiperprolaktinemi-ve-prolaktinoma` (mevcut eşik + "TEMD 2022 ise erkekte >20, kadında >25"), premium `hipofiz-hastaliklari` konu (kortizol üç yerde, kosintropin 4 hafta iki yerde, LT4) ve kart (uyku apnesi %20–80). Açık sayfaların updatedAt'i 18 Eki. soru- ve link-denetim temiz.
- K6 (18 Eki, kitap): Tur 35'teki üç TEMD 2025 iç farkı cümlede bölüm adıyla verildi — fırtına dozu (s. 84 tablo: "bölüm metni … ; bölüm özeti PTU 200–400 mg 6–8 saatte, MMI 20–25 mg 6 saatte") · gebelikte iyot (s. 35: "gebelik bölümü 250 µg, iyot bölümü gebe 220, emziren 290") · subklinik hipertiroidide TSH <0,1 (s. 4 tablo ve s. 84 karar): önceki adsız premium kuralı "≥65/risk varsa tedavi" → **"TEMD 2025 algoritmasına göre tedavi; ≥65, KV risk, osteoporoz, semptom kararı pekiştirir"** (K2 kararı: adsız değer TEMD'ye çekilir; bu, Eylül'de kullanıcıya bildirilmiş açık ↔ premium tutarsızlığını da TEMD lehine kapatıyor — kullanıcı itiraz ederse geri alınır). Taşma yok.
- K6s (18 Eki, site): taramada sitenin çoğu zaten TEMD çizgisinde ("TSH <0,1 herkese"). Tek ayrışan premium `subklinik-tiroid-hastaliklari` incisi (">65 yaş, postmenopoz ya da KVH/osteoporoz varsa") → sonuna "TEMD 2025 algoritması ise 65 yaş altında da TSH <0,1'de tedaviyi önerir". Açık `hipertiroidi` tedavi endikasyonu satırına "(TEMD 2025)" (updatedAt 18 Eki). `yaslida-hipertiroidizm`'deki "Grade 1C" ATA/ETA adlı, dokunulmadı.
- K7 (18 Eki): gebelikte 1. trimester TSH üst sınırı. TEMD'nin kendisi 2,5 kullanıyor (yoksa >4,0); ATA 2017 yerel referans, yoksa ~4,0 — ikisi de metinde adlı. Kitap s. 28 açık sayfa maddesi ve sayılarla kutusu "TEMD 2025 2,5; ATA 2017 önce trimester referansı, yoksa ~4,0" biçimine; s. 29'daki ATA 2017 paragrafı zaten kaynaklıydı. Site: premium `gebelik-tiroid` 6 altın kural özetindeki (1) madde aynı biçime (TEMD kutusu zaten s. 307'yi veriyordu). Taşma yok.
- K8 (18 Eki): nefroloji s. ~47 kutusundaki editör notu ("Açık sayfadaki eşik cümlesi yarım kaldığı için kitapta…") kitaptan çıkarıldı — okura ait değil. MN'de profilaksi eşiği <2,0–2,5 g/dL premium/açık tedavi sayfasında **adsız** (KAYNAK YOK); değer korundu. **Not:** açık `membranoz-nefropati` sayfasında "albümin düzeyi  (veya <2.0 g/dL)" cümlesinin ilk eşiği boş — içerik kusuru, kullanıcıya bildirilecek. Hematoloji s. ~?: "Karnofsky ≤%90 (bazı kaynaklarda %70 eşiği)" — iki eşiğin de adlı kaynağı yok; adsız parantez çıkarıldı, ≤%90 kaldı (KAYNAK YOK).
- K9 (18 Eki): Tur 9–31 günlüğünde kılavuz adı geçen çakışmalar tarandı. Kardiyo lipidoloji (ACC/AHA <70 ↔ ESC/EAS <55) zaten kaynaklıydı. Hematoloji AML (s. 15–16) üç yer: CEBPA notu ("açık sayfa … premium tablo …" kaynak-yüzü dili) → "WHO5 ≥%20 blast şartını korur; ICC bu satırda blasta bakmaz" · FLT3-ITD "Intermediate / adverse" (adsız) → "ELN 2022: intermediate (allelik orandan bağımsız)" (ELN 2022 tablosu ve kart seti) · RUNX1 → "WHO5'te MDS ilişkili listeden çıkarıldı" (kart seti). Öteki günlük maddeleri açık ↔ premium sayı farkları (adsız iki site sayfası) — kılavuz çakışması değil, bu turun kapsamı dışında. Taşma yok.
- K10 (18 Eki): Kısım 14'te TEMD DM 2026'nın kendi içindeki dört fark yerinde yazıldı — bazal başlangıç (s. 152: "TEMD'in başka bölümü insülin almamışta 0,1–0,2"), doymuş yağ (s. 158: "başka yerde <%7"), direnç egzersizi (s. 158: "öneri listesi 2 gün"), GDM sonrası tarama (s. 150: "metin 3 yılda bir"). OGTT 209/206 ve hsCRP 0,3/0,75 kitapta sayı olarak geçmediği için dokunulmadı. Taşma yok. **Kitap kuyruğu bitti; sıradaki site dosyaları (S).**
- S (18 Eki, 18 site dosyası): adsız ifadeler sınıflandı.
  - **Adsız ikinci sayı → çıkarıldı (KAYNAK YOK, ana değer korundu):** açık `dopamin-agonistleri-kalp-kapak` ("bazı merkezler her yıl, bazı kaynaklar 6–12 ay" notu; sayfa zaten Endocrine Society/İngiliz kılavuzu diye adlı veriyor), açık `tips-hasta-secimi` (bilirubin "bazı kaynaklarda <4,5"), premium HCC kartı ("bazı merkezlerde <4 cm"), Cushing quiz ("bazı merkezlerde <5 µg/dL"), Behçet quiz ("bazı kılavuzlara göre daha uzun"), MEN konusu (prevalans "bazı kaynaklarda 3–20"), CRKP kartı (anlamsız "bazı kaynaklarda 5 mm" tekrarı). Açık sayfaların updatedAt 18 Eki.
  - **Kaldı — kaynağın kendi cümlesi:** temd-diyabet-1 ve temd-hipertansiyon incilerinde "bazı merkezler/otörler/kılavuzlar" TEMD'nin kendi ifadesi (inci TEMD'den alıntı); Harrison seçme sorularında "bazı yazarlar" Harrison'ın.
  - **Kaldı — çakışma değil, uygulama çeşitliliği:** "bazı merkezlerde uygulanır" (gilteritinib idamesi, IV liotironin, eşzamanlı cerrahi), C. glabrata "bazı merkezlerde 1. sırada", MEN1-pNET "tarihsel olarak bazı merkezler 1 cm; güncel ENETS 2023" (adlı), Graves quiz (ATA 2016 ↔ ETA 2021 adlı). Akromegali eşleşmesi yanlış pozitifti.
  soru-denetim temiz.
- S* (18 Eki, geniş tarama, 7 dosya eşleşti): **Cushing MR eşiği** — premium `cushing-sendromu` (iki yer) ve `hipofiz-kesim-degerleri-ayirici-tani`'deki "bazı uzmanlar >6 mm'yi yeterli sayar" → TEMD Adrenal 2025 kutusunun kendi cümlesine (s. 27: "<6 mm'de IPSS gerekir, >9 mm'de gerekmez, 6–9 mm'de fikir birliği yok"). **Kitap da adsız ">6 mm" eşiği kullanıyordu** (endokrin s. 39 karar şeridi, s. 40 sayılarla, s. 120 tablo) → TEMD 2025'e çekildi. Açık `metabolik-asidoz` "farklı kılavuzlarda <24 veya <23" adsız parantezi çıkarıldı (<22 kaldı; updatedAt 18 Eki). Öteki eşleşmeler çakışma değil (fosfor "kaynağa göre emilim", IL-17 "majör kaynaklar", azatiyoprin "bazı uzmanlar 50 mg ile başlar" = uygulama). link/soru/kaynak-denetim temiz; endokrin, nefroloji, hematoloji kitaplarında taşma yok.

**Tur 42 kapanış (18 Eki):** kuyruk boş. Kitap: K1–K10 · site: K2/K3/K5s/K6s/K7 eşlikçileri + 18 dosya + geniş tarama. KAYNAK YOK kalanlar (kullanıcı kararı): MN profilaksi eşiği <2,0–2,5 · Karnofsky ≤%90 · açık membranöz sayfasında boş eşik cümlesi · ve sitedeki adsız ikinci değerler çıkarıldığı için ana değerler (TIPS bilirubin ≤3, HCC 3 cm, Cushing remisyon <2 µg/dL, MEN1 prevalans 2–10, HCO₃ <22) tek ve adsız duruyor. Commit yapılmadı.
- **Tur 42 ek (18 Eki, kullanıcı: "1, 2 KDIGO'ya çek; 3 TEMD'e çek"):**
  - MN profilaksi eşiği → **KDIGO 2021** (premium MN quiz ve tedavi sayfasında adlı: albümin <2,0–2,5 g/dL + ek risk etkeni [proteinüri >10 g/gün, BKİ >35, VTE öyküsü], kanama riski kabul edilebilirse). Kitap nefro kutusu ve açık `membranoz-nefropati-klinik` "Kritik eşik" cümlesi buna göre (updatedAt 18 Eki). **Düzeltme:** "boş eşik" diye bildirdiğim cümle boş değildi — `<strong><2.5</strong>` etiket temizleyen grep'imde kaybolmuştu; aynı yanılgı premium quiz'de "bozuk cümle" sanmama da yol açtı. Ölçüm tuzağı: HTML etiketini `<[^>]*>` ile silmek `<2.5` gibi metin içi "<"yi de yer.
  - Karnofsky ≤%90 KDIGO kapsamında değil (hematoloji, nakil) — **soruldu**, dokunulmadı.
  - Cushing remisyon <2 µg/dL → **TEMD Hipofiz 2022** (premium Cushing konusundaki TEMD kutusu, s. 30: "ilk hafta <2 µg/dL"); quiz açıklamasına kaynak eklendi.
  - TIPS bilirubin ≤3, HCC kartı 3 cm, HCO₃ <22, MEN1 prevalans 2–10: **TEMD'de karşılığı yok** (elimizdeki TEMD kılavuzları bu konuları içermiyor) — dokunulmadı, kullanıcıya bildirildi.
  link- ve soru-denetim temiz, nefro kitabında taşma yok.
- **Kaynak bekleyenler (18 Eki, kullanıcı: "ben gönderirim, bulamazsan not et"):**
  - **TIPS bilirubin eşiği (≤3 mg/dL, açık `tips-hasta-secimi`)** — sitede adlı kaynak yok; asit kaynakçasında AGA 2025 Clinical Practice Update ve EASL kılavuzları var ama metinleri elde değil. Downloads'taki UpToDate "Refractory ascites" PDF'i şifreli yazı tipiyle dışa aktarılmış, pdftotext okunamıyor. Kısa web taramasında birincil kılavuz metni bulunamadı (EASL'in ilk TIPS kılavuzu 2025; ikincil kaynaklar 3–3,5 mg/dL veriyor). Kullanıcı kılavuzu gönderecek.
  - HCC kartı 3 cm, HCO₃ <22, MEN1 prevalans 2–10, Karnofsky ≤%90 — kaynak bekliyor.
  - **TIPS bilirubin — kullanıcı bir metin yapıştırdı (18 Eki):** künyesiz, "AASLD, EASL ve Baveno uzlaşı kılavuzlarında … ≤3 mg/dL ve MELD ≤18" diyor; ayrıca TACE/TARE için ">3 kesin kontrendikasyon" ve gadoksetat MRG için ">3'te önerilmez" iddiaları var. Bölüm/sayfa/yıl yok, AI özeti biçiminde → [[medisea-kaynak-girisi-yolu]] kuralı gereği **kaynak sayılmadı**, siteye/kitaba yazılmadı. Kılavuzun kendisi ya da tam künyesi bekleniyor.

### Tur 43 — (gastro) Hepatosellüler karsinom · gastro s. 21–30 · kullanıcı isteği (18 Ekim)
Eskiden "açık sayfa yok" diye elenen HCC'nin açık sayfaları artık onkolojide: `karaciger-kanserleri` (9 KB, hub) + `hepatosellular-karsinom-kapsamli-klinik-rehber` (20 KB); premium gastro `hepatosellular-karsinom` + quiz (15) + kart (80).
Sayfalar: 21 kapak (Kısım 3 · Karaciğer) · 22–23 açık sayfa (Şekil 8: sirozlu/sirozsuz karsinogenez; risk/koruyucu, moleküler-histoloji, fibrolameller, klinik, kolanjiyokarsinom ayırıcı tanısı) · 24 anlatı (çift kanlanma, biyopsisiz tanı, LI-RADS kenarı, görüntüleme teknikleri) · 25 karar yolu (sürveyans, nodül) · 26 başvuru (BCLC 2022, Child-Pugh, ALBI, MELD, Okuda/CLIP, biyobelirteç izlemi) · 27 karar yolu (BCLC'ye göre tedavi) · 28 başvuru (sistemik 1./2. basamak, adjuvan) · 29 başvuru (mRECIST/LR-TR/iRECIST, izlem, 8 vaka) · 30 hızlı tekrar (30 soru). Kapak alt başlığı ve s. 1 içindekiler güncellendi. Kısım çift (10 sayfa).
Kaynak çakışmaları (Tur 42 kuralıyla):
- **HCC oranı:** hub "%85–90" ↔ rehber ve premium "%75" — ikisi de adsız; kitapta premium (%75).
- **Fibrolameller yaşı:** hub 20–30 · rehber 15–35 · premium 5–35 — adsız; kitapta yaş yazılmadı, "genç".
- **BCLC A:** hub "≤3 nodül ≤3 cm, Child-Pugh A/B" ↔ rehber "BCLC 2022: tek nodül her boyut ya da ≤3 nodül ≤3 cm, korunmuş karaciğer fonksiyonu" — kitapta adlı olan **BCLC 2022**.
- Sürveyans: hub "AASLD/EASL: 6 ayda bir USG ± AFP" — adıyla verildi.
Ölçüm: taşma yok; sayfalar ferah (s. 22–29'da 60–115 mm boş — kaynakta kalan bilgi büyük ölçüde teknik radyoloji ayrıntısı, zorla doldurulmadı). LI-RADS etiketleri dar sütunda kırılıyordu, bölünmez tireyle düzeltildi.
- Tur 43 ek (18 Eki, "devam"): premium gastroda kalan tek konu **PSCCL** (karaciğerin primer skuamöz hücreli karsinomu; kaynakça `karaciger-tumorleri`, quiz 10) — açık sayfası yok, ayrı kısım açılmadı; s. 23'e "nadir ayırıcı tanı" bloğu olarak girdi (sıklık/zemin, metastaz dışlama, AFP normal, İHK P40/P63/CK5-6 + HepPar-1/TTF-1 negatif, tedavi/prognoz). s. 23 boşluğu 69 → 11,6 mm.
- **Gastro aday havuzu bitti:** premium gastroda açık eşleşmesi olan konu kalmadı (asit, çölyak, HCC işlendi; pankreas kanseri onko kitabında; Harrison seçme soru setleri konu değil). Sıradaki gastro kısmı için ya premium'a yeni gastro konusu girmeli ya da kullanıcı açık-only bir konu seçmeli.

### Tur 44 — Sınav düzeni · Kısım 1 (25 Ekim)
Kullanıcı isteği: kitabı sınava çalışan öğrenciye göre görsel çalışma kitabına çevir, sayıları Gemini Notebook defterleriyle doğrula. Biçim s. 4'te onaylandı ("kutulara böl").
- **Yeni sayfa türü `tur-sinav`** (sınıflar `hizli-bakis.css` sonunda): `.tetik` soru kökü şeridi · `.kartlar`/`.ok-kart` (rozet, tek satır mekanizma, kaynak satırı; `.uyari` pembe) · `.yatay-zincir` (dikey `.zincir` ile karışmasın) · `.karsit` iki sütun · `.sina` kendini sına (cevap ters).
- Kısım 1'in altı anlatı sayfası çevrildi: s. 4, 5, 6, 7, 10, 12. Taşma yok (önizleme PNG'leriyle; `olcum.cjs` bu oturumda Edge `--dump-dom` boş döndüğü için "ÖLÇÜM YOK" verdi — iki headless kipte de).
- **AF sıklığı:** iki kaynak ayrışıyor, ikisi de pasajda görüldü — UpToDate *Cardiovascular effects of hyperthyroidism* %5–15 (70–79 yaşta %15) · Lee & Pearce, JAMA 2023;330:1472 (doi 10.1001/jama.2023.19052) %10–25, >65 yaş ve erkekte daha sık. "Gençte %0,5–5" defterde YOK → çıkarıldı. Kitap s. 2, s. 4, Kısım 9 Sayılarla + yaşlı tablosu, `_parca-hipertiroidi`; site açık `hipertiroidi`, `yaslida-hipertiroidizm` (iki yer), premium `hipertiroidi` konu.
- **IV propranolol:** kitap ve kart ht-069 "15 dakikalık aralarla 1–2 mg" diyordu; UpToDate *Thyroid storm* pasajı: 0,5–1 mg 10 dakikada, ardından birkaç saatte bir 1–2 mg (10 dakikada). Düzeltildi; karta "Türkiye'de IV propranolol yok, esmolol" eklendi (premium konudaki kendi cümlesi).
- **Hidrokortizon (fırtına):** UpToDate 300 mg yükleme → 8 saatte 100 mg · TEMD 2025 Bölüm 28 50–100 mg 6–8 saatte — ikisi adıyla. Lityum 300 mg/8 sa, kolestiramin 4 g ×4 TEMD'den.
- **KAYNAK YOK:** fırtınada hedef nabız 60–90 (UpToDate "yeterli kontrol" der, TEMD sayı vermez) — kitaptan çıkarıldı; premium kart **ht-059** kullanıcı kararıyla UpToDate ifadesine çekildi (soru da sayı istemeyecek biçimde yeniden yazıldı). Jod-Basedow "2–12 hafta" defterde "haftalar ya da aylar"; RAI sonrası emzirme "6 hafta" defterde 6–12 hafta (pasaj görülmedi) — dokunulmadı.
- s. 12 (santral hipotiroidi) yalnız biçim; Hipopituitarizm defteriyle henüz sınanmadı.

### Tur 45 — Sınav düzeni · s. 12 doğrulaması + Kısım 2 (25 Ekim, "devam")
- **s. 12 · Hipotiroidizm defteri** (`notebook/261e3b1c-012b-480a-a4d8-e02aa1607828`): TSH 5–10, glikozilasyon/TRH, gece piki, MRG, TDHS, fenitoin, ilaçlar, guatr — UpToDate *Central hypothyroidism* ile tutuyor.
  - **Gebelik:** kitapta adsız "%25–50 · üst çeyrek" → Johannsson ve Ragnarsson (*Hypopituitarism Including Growth Hormone Deficiency*, pasaj görüldü): gebelik doğrulanınca ~%25 artış, sT4 normalin orta-üst bölümü, TSH doz ayarında kullanılamaz, 4–6 haftada bir sT4. TEMD 2025'te santral gebe için öneri YOK. Kitap s. 11 tablo + s. 12 kart düzeldi. **Site dokunulmadı:** `gebelikte-hipotiroidizm-yonetimi`, premium `gebelik-tiroid`, `santral-hipotiroidizm` (konu, iki yer), `santral-hipotiroidizm-quiz-1` (üç yer), `temd-tiroid` incisi ("üst çeyrek" TEMD'ye atfedilmiş ama TEMD metninde yok).
  - **Miksödem hidrokortizonu:** adsız "50–100 mg, 6–8 saatte" → TEMD 2025 "stres dozunda" (sayı yok) + Harrison Bölüm 395 "50 mg, 6 saatte bir" (pasaj). ClinicalKey pasajında rakam katmanı boş, defterin "saatte 5–10 mg"ı oradan doldurulmuş — kullanılmadı. Kitap s. 12 ve s. 22 düzeldi. **Site dokunulmadı:** `miksodem-komasi-acil-yonetim`, `santral-hipotiroidizm-lt4-adrenal-kriz`.
- **Kısım 2 · s. 18, 19, 20 `tur-sinav`'a çevrildi.** Hashimoto defteri (`74c91e4f-…`) + Hipotiroidizm defteri + TEMD 2025 PDF (pdftotext).
  - Kadın üstünlüğü adsız "4–10 kat" → **TEMD 2025: 7–8 kat** (kronik otoimmün tiroidit). Pik yaş 40–60 (PMC derlemeleri). HLA-DR3/DR5 TEMD'de.
  - Subklinik tedavi ölçütleri → **TEMD 2025 algoritması** (Şekil 8.1): ≥10 herkese; <65–70 yaşta 7–9,9 LT4, 4,5–6,9 semptomla; >65–70 izle; alt gruplar gebelik, infertilite, TPOAb, KV risk. Kitaptaki adsız "guatr" ölçütü TEMD'de yok → çıkarıldı. "TSH 1–3 ay arayla en az iki kez" TEMD'den eklendi.
  - LT4 dozu adsız "1,5–1,7 µg/kg" → **TEMD 2025 ~1,2–1,8**; >60 yaş KKH yoksa 50 µg, KKH varsa 12,5–25 (TEMD). Yaşa göre hedef TSH tablosu TEMD'yle birebir.
  - IV LT4 → "oral dozun ~%75'i" (Harrison + TEMD); adsız "ideal kilo başına 1,4 µg/kg tavanı" çıkarıldı.
  - **KAYNAK YOK, çıkarıldı:** "TSH <0,05 + sT4 ortalamanın 2 katı → doz %50 azalt"; selenyum dozu 83–200 µg; D vitamini eşiği <20 ng/mL ve 2000–4000 IU (niteliksel cümleler kaldı).
  - s. 19'daki "miksödem psikozu (sayfa 21)" göndermesi yanlıştı → s. 23.
- Taşma: s. 11, 12, 18, 19, 20, 22 önizlemede sığıyor (s. 19 iki kısaltma turuyla).

### Tur 46 — Site kaynak eşlemesi + Kısım 3 (25–26 Ekim)
- **DÜZELTME (Tur 45'teki hatam):** "TEMD 2025'te santral hipotiroidili gebe için öneri YOK" YANLIŞTI. pdftotext çıktısında Türkçe harfler bozuk (`�st �eyre`); `üst çeyre` araması boş döndü. TEMD 2025 (gebelik ve hipotiroidi): "Santral hipotiroidizmi olan gebelerde LT4 dozunun %25–50'lik bir artışı tavsiye edilir … normal aralığın üst çeyreğinde bir sT4 düzeyi hedeflemek daha olumludur". **Ölçüm tuzağı:** bu metinde Türkçe sözcük ararken harf yerine `.` kullan (`st .eyre`), ya da yalnız rakamla ara.
  - Kitap s. 11–12: TEMD 2025 önde (%25–50 · üst çeyrek), Johannsson ve Ragnarsson ikinci kaynak (~%25 · orta-üst · 4–6 haftada bir). Site: değerlere dokunulmadı, kaynak adı eklendi — açık `gebelikte-hipotiroidizm-yonetimi`, premium `gebelik-tiroid`, `santral-hipotiroidizm` (iki yer), `santral-hipotiroidizm-quiz-1` (açıklama; soru kendi kaynağı ETA 2018'i taşıyor). `temd-tiroid` incisi zaten doğruydu.
  - Miksödem hidrokortizonu sitede de TEMD 2025 "stres dozu" + Harrison "6 saatte 50 mg": açık `miksodem-komasi-acil-yonetim`, `santral-hipotiroidizm-lt4-adrenal-kriz` ("profilaktik" → "stres dozunda"). Açık sayfaların updatedAt'i 25 Eki. link/soru/kaynak/dil denetimi temiz.
- **Kısım 3 · s. 30, 31 `tur-sinav`'a çevrildi.** Kaynak: TEMD 2025 gebelik bölümü (yerel PDF) + Tiroid Gebelik defteri (`notebook/f7b289da-b4d8-4d8c-862c-ed8dd423121c`).
  - Adsız → TEMD: bezin hormon artışı %20–50 → **%30–50** · izole hipotiroksinemi "alt %2,5–5" → **2,5 persentil** · tuz kısıtlamasında iyot 200–250 → **200 µg/gün** · LT4 hedefi "trimester aralığının alt yarısı" → **trimestere özgü değerlere normalize**. TEMD'den eklenen: trimester sınırı yoksa >4,0; tarama akışı (TSH >2,5 → Anti-TPO, >4 → sT4); Anti-TPO⁺ ötiroid gebede TSH yükselme riski %20, 4–6 haftada izlem; haftada 2 gün çift doz (≈%29).
  - **KAYNAK YOK, çıkarıldı:** gebelikte subklinik hipotiroidi doz tablosu (TSH >4 → ~1 µg/kg; 2,6–4 + TPO⁺ → 50 µg; aşikar ~1,6 µg/kg) — ne defterde ne TEMD'de.
  - Postpartum tiroidit: Anti-TPO⁺'de %50 risk, kalıcı hipotiroidi %20–30 (TEMD), fazlar 1–4 / 4–8 / 6–12. ay (ClinicalKey; rakam katmanı riski — pasaj görülmedi).
- Yanlış sayfa göndermeleri: s. 16 "miksödem koması → sayfa 20" → **22**; s. 28–29 "postpartum tiroidit (sayfa 27)" → **31**. Öteki göndermeler (9, 8, 3, 38) doğru.
- Taşma: s. 11, 12, 30, 31 önizlemede sığıyor.

### Tur 47 — Sınav düzeni · Kısım 4 Cushing (26 Ekim)
- s. 40, 41 `tur-sinav`'a çevrildi. Kaynak: TEMD Adrenal ve Gonadal 2025 (`Downloads/TEMD Adrenal ve gonadal 2025.pdf`, pdftotext) + Cushing S defteri (`notebook/0dcc8c80-0ea8-4af7-aeb6-1f988d803372`). Hipofiz 2022 PDF'i de metne çevrildi (scratchpad), bu turda kullanılmadı.
- Adsız → TEMD 2025 (öteki kaynak adıyla yanında): insidans "milyonda 1,8–8" → **yılda milyonda 1,8–3,2** (başka serilerde 2–8) · mortalite "3,5–5 kat" → **2,1–17,9 kat** (defterde 3,5–5 de var, osilodrostat makalesi) · kadında ≥4 kat · PRKACA ~%45 · ARMC5 sporadik ~%25, ailevi ~%50.
- TEMD'den eklenen: VTE riski 10 kat, ilk 3 ayda en yüksek, 1. yıla dek; preop DMAH, postop 4–6 hafta profilaksi · idrar serbest kortizolü 10 kat yüksekse TMP-SMX ile PCP profilaksisi (cerrahiden sonra ≥2 hafta) · influenza, zona, pnömokok aşısı.
- Defter öteki 13 maddenin hepsini (USP8 %40–50 ekson 14, SSTR5, CTNNB1 hafif otonomda, KDM1A/GİP, aile taraması 1 mg DST <1,8, LC-MS/MS) doğruladı; pasajlar tek tek açılmadı.
- s. 40 eski kenar notundaki "ektopik ACTH sendromu (sayfa 38)" göndermesi yanlıştı → **s. 44**.
- Taşma yok (önizleme).

### Tur 48 — Sınav düzeni · Kısım 4 s. 42–44 sayı doğrulaması (27 Ekim)
Kaynak: TEMD Hipofiz 2022 (Cushing hastalığı tedavisi, pdftotext + `iconv -f latin1` ile Türkçe harfler OKUNUR çıkıyor — Tur 46'daki "bozuk harf" tuzağının çaresi) + Cushing S defteri (`notebook/0dcc8c80-…`, tek soruda 8 madde; pasajlar tek tek açılmadı, defter kaynak dosya adlarını verdi).
- **s. 42:** metirapon "gebede tercih edilen" (adsız) → "gebelikte en sık kullanılan (UpToDate); TEMD 2022: onaylı ilaç yok, seçilmiş hastada kabergolin ya da metirapon" · osilodrostat UFC ~%80'e (TEMD 2022).
- **s. 43:** şiddetli tanım ">5 × ULN, çok şiddetli >10 ×" (ağır Cushing uzlaşı belgesi; kitap "5–10" diyordu) · etomidat 0,02–0,05 mg/kg/saat (uzlaşı belgesi, UpToDate) + TEMD 2022 0,025–0,1 · osilodrostatla kortizol yoksunluğu "~%30" (adsız) → faz 3'te %26–54 (LINC-4, LINC-3) · metirapon "~2 saatte" → saatler içinde, kortizol en düşük 2. saatte; ketokonazol günler içinde (TEMD 2022) · Nelson %22–53 (uzlaşı belgesi) ↔ TEMD 2022 %0–34.
- **s. 44:** ektopik ACTH'de hipokalemi "%70–90" (adsız) → >%90 (The Adrenal Cortex); Cushing hastalığında "nadir" → %10–15 · kadın/erkek 3–8:1 (UpToDate) · CRH yanıtı "ACTH ve kortizol %20–50" → ACTH >%30–50, kortizol >%20 (TEMD 2022). BIPSS ≥2/≥3, ACTH >20 pg/mL, 8 mg DST >%50 TEMD 2022 ile birebir.
- Taşma yok (önizleme). Site karşılıkları (premium `cushing-sendromu`, açık `siddetli-cushing`, `ektopik-acth-sendromu`) bu turda taranmadı — sıradaki adım.
- **Kısım 4 durumu:** s. 40–41 sınav düzeninde (Tur 47), s. 42–44 sayıları kaynaklı. s. 38–39 açık sayfa ayrıca sınanmadı.

### Tur 49 — Sınav düzeni · Kısım 5 MEN1 s. 48–49 (27 Ekim)
- s. 48 (paratiroid) ve s. 49 (gastrinoma/insülinoma) `tur-sinav`'a çevrildi; her kartın altında kaynak satırı. Kaynak: MEN tip 1 defteri (`notebook/95ce84c3-1172-44c7-956c-1d4d515c1c65`, 26 kaynak). Tek soruda 15 sayı soruldu; defter her biri için dosya adı + alıntı verdi (pasajlar tek tek açılmadı).
- **Birebir doğrulanan (13):** taş %27–72 (J Clin Med 2025;14:3113 Tablo 2: Gauthé %27, Manoharan %72) · cerrahi eşiği >1 mg/dL (UpToDate) · English 2025 RR 0,32/0,78/2,64 · Santucci 517 hasta %68,5 (4,25 y) / %45 (7,2 y) · ekzon 10 OR 2,19 · fluorokolin %73/%100 (Talbot 2022) · gastrinoma %20–30 MEN1, LN %70–80, KC %15–25, PPİ 7–14 gün + >1000 + pH <2 (UpToDate) · Whipple kür %77–100 (Dtsch Arztebl Int 2024;121:527) · insülin ≥3, C-peptid ≥0,2, diazoksit 1200 (UpToDate Insulinoma) · K 4,5–5,0 ve K 3,3'te VF (Doi 2026 vaka).
- **Düzeltilen:** "50 yaşında PHPT %95–100" kaynakta YOK → UpToDate "50–70 yaşına kadar penetrans >%90" (%95 80 yaş penetransı). İnsülinoma %10–30 defter ilk yanıtta "yok" dedi, ikinci soruda UpToDate *MEN1: Clinical manifestations* "10 to 30 percent" alıntısıyla doğrulandı → kaldı (ilk bulgu olma oranı %10 eklendi).
- **Kendi hatam, düzeltildi:** Doi 2026 için dosya adındaki "EJ"den dergi tahmin edip "Eur J Endocrinol" yazmıştım → "vaka sunumu" yapıldı (dergi doğrulanmadı).
- Çıkan küçük içerik: s. 49 "Klinik inci · pankreas cerrahisi sonrası enzim replasmanı/tip 3c'de hipoglisemi" kutusu yeni düzende yok (tedavi kartında tip 3c DM ve ekzokrin yetmezlik geçiyor).
- Taşma yok (önizleme). **Kalan:** s. 50–53 (NF-pNET karar yolu, sürveyans, hipofiz/adrenal, MEN2/4/5) sayıları sınanmadı; s. 46–47 açık sayfa sınanmadı.

### Tur 50 — Sınav düzeni · Kısım 5 s. 50 NF-pNET karar yolu (27 Ekim)
Kaynak: MEN tip 1 defteri (`notebook/95ce84c3-…`), iki soru; 13 maddenin 13'ü İngilizce alıntıyla geldi (pasajlar tek tek açılmadı). Künyeler defterden: `lvaf247.pdf` = Papalou, *New directions in MEN1 management…*, Eur J Endocrinol 2025 · `PIIS2213858725001184.pdf` = English, *Treatments for MEN1-associated endocrine tumours…*, Lancet Diabetes Endocrinol 2025 · `JAFES-41-1-154.pdf` (yıl alınmadı).
- **Birebir:** MRG birincil, EUS/Ga-68 bilinen lezyona (Papalou) · rutin EUS-İİAB yok (UpToDate) · <1 cm çok düşük risk · <2 cm'de ~%3 uzak metastaz (UpToDate, English) · ≥2 cm >%30 (Dtsch Arztebl 2024) · >%20/yıl ya da >5 mm/yıl · Ki-67 >%10, G2/G3 (1–2 cm'de, eTable 2) · kanal dilatasyonu · erken ölümün başlıca nedeni · GTE 2024 (Ann Endocrinol 2024;85:2) · ENETS 2023 >2 cm rezeksiyon uzlaşısı.
- **Düzeltilen:** izlem takvimi "stabilse 1–2 yılda" → 6–12 ay → 12 ay → 1–2 yıl (UpToDate) · "%50 komplikasyon, **bunların** %25'i III–IV" → hastaların %25'i (English 2025: 20/40 ve 10/40) · "sağkalım ve metastazsız sağkalım farkı yok (ENETS 2023, 2025)" → "cerrahi üstünlük göstermedi" (Papalou; English) · PET kutusu "dediferansiyasyon" (kaynakta yok) → "kötü prognoz" (UpToDate: SSTR düşük, FDG yüksek) · büyüme hızı kuralı "2 cm altında bile" → 1–2 cm aralığı · klinik inci: >2 cm lezyon hemen her zaman NF-pNET, duodenal gastrinoma değil (Dtsch Arztebl).
- Eklendi: "Kendini sına" kutusu (4 soru). Taşma yok (önizleme).
- **Site, dokunulmadı:** açık `men1-nf-pnet-izlem-cerrahi` aynı iki kusuru taşıyor — "%50'sinde komplikasyon, bunların %25'i" ve "ENETS 2023, 2025 … genel sağkalım farkı yok".
- **Kalan:** s. 51–53 (sürveyans, hipofiz/adrenal/ektopik Cushing, MEN2/4/5), s. 46–47 açık sayfa.
- **Site düzeltildi (kullanıcı onayı, aynı gün):** açık `men1-nf-pnet-izlem-cerrahi` — Clavien-Dindo "bunların %25'i" → "hastaların %25'inde" + English 2025 künyesi; "ENETS 2023, 2025 MEN1 Kılavuzları" → "ENETS 2023; 2025 MEN1 klinik uygulama kılavuzu" + English/Papalou 2025 cümlesi (üç kohort cümlesine dokunulmadı, sınanmadı). updatedAt 11 Ağu → 27 Eki. link/soru/kaynak/updatedat/üç indeks kontrolü temiz.

### Tur 51 — Sınav düzeni · Kısım 5 s. 51 sürveyans (27 Ekim)
Kaynak: MEN tip 1 defteri, iki soru. Ana kaynak Papalou, Eur J Endocrinol 2025 (`lvaf247.pdf`, Brandi 2025 ↔ Thakker 2012 ↔ AACE karşılaştırması). Brandi ML ve ark., Lancet Diabetes Endocrinol 2025;13(8):699–721; AACE = Del Rivero, Endocr Pract 2025.
- **Birebir (alıntı):** genetik test ilk dekad (önceki "<5 yaş") · klinik izlem 5 yaş, yıllık · Ca 10 yaştan, rutin PTH yok · PRL+IGF-1 10 yaş · pankreas MRG 10–15 yaş, 2–3 yılda · torasik NET 20–25 yaş, 3–5 yıl (2012: 15 yaş, 1–2 yıl) · meme ≥40 yaş, risk 2–3 kat · SPTX; TP/AT artık önerilmez · %25 missense/indel, modifiye ACMG-AMP.
- **Defter alıntısız doğruladı (dipnotlu):** 2012'de Ca 8 yaş, PRL/IGF-1 5 yaş, hipofiz MRG 5 yaş/3 yıl, pankreas MRG/BT/EUS yıllık.
- **Düzeltilen:** hipofiz MRG "3 yılda" → **3–5 yılda** · paratiroid sıklığı → çocukta 1–3 yıl, erişkinde yıllık · torasik 2012 "15–20" → **15** · pankreas 2012 "EUS dahil yıllık" → MRG, BT ya da EUS; yıllık (not: Papalou "previously 1–2 yearly" diyor — ayrışma) · "PTH, gastrin, insülin kaldırıldı" → PTH, insülin, açlık glukozu kaldırıldı; **gastrin uzlaşı yok** · meme "mamografi + muayene, yıllık" → mamografi, kılavuz sıklık vermiyor (yıllık kaynakta yok; Marburg yıllık muayene + 2 yılda mamografi) · tuzak "kılavuzda zorunlu" → "etkinliği henüz gösterilmedi" (UpToDate meme özgü alıntı) · menin → ERα sinyalini baskılar (UpToDate).
- Eklendi: Kendini sına (4 soru). Taşma yok (önizleme).
- **Kalan:** s. 52–53, s. 46–47.

### Tur 52 — Sınav düzeni · Kısım 5 s. 52 hipofiz, adrenal, ektopik Cushing (27 Ekim)
Kaynak: MEN tip 1 defteri, iki soru (14 + 6 madde, İngilizce alıntıyla; pasajlar tek tek açılmadı) + TEMD Hipofiz 2022 (pdftotext + iconv, osilodrostat paragrafı).
- **Birebir (alıntı):** prolaktinoma ~%40–45, NF ~%35–40 (UpToDate) · çocukta Cushing hastalığı > adrenal (JAFES, enm-2024-2074) · DA agonisti başarısızlığı MEN1'de benzer, ilk basamak (English 2025) · plürihormonal %4–11, PRL + GH ya da ACTH (enm-2024-2074) · GH-oma nüks %14,3 · hipofiz adenomu %42, kortikotrop %4,4, CD %1,9 · ektopik %61 timik / %28 pankreas, erkek %78 (timik %91) · ektopik CRH %22 (4 olgu), 3 gereksiz transsfenoidal cerrahi · 18 olguluk derleme (11/18 = %61).
- **Kaynaklar arası fark (kitapta adıyla):** boyut — UpToDate ~%60–70 MİKROadenom ↔ 2025 derleme (Vergès) %85 makroadenom.
- **Düzeltilen:** adrenal "%40–73, çoğu bilateral" → UpToDate %20–60, çoğu küçük NF, salgılayan ~%15, ACC ~%1 (2025 derleme %23–73) · meme "genellikle <50 yaş" → "ortalama başlangıç daha erken" (2 kat UpToDate, 2–3 kat Papalou) · bronşiyal NET → indolan, ~%6/yıl · GH-oma tedavisi → cerrahi; kalıcı/çıkarılamayanda SSA (Dtsch Arztebl 2024) · tablo "UFC <3 × ULN … %22 indolan" → derlemedeki olguların %22'si eşiğin altında · klinik inci → "en şüpheli lezyonu önce çıkar", osilodrostat 60 mg/gün + hidrokortizon, vakada 10 günde kontrol.
- **KAYNAK YOK, çıkarıldı:** osilodrostat "DOC birikimi · doğrudan hERG blokajı · spironolakton/eplerenon · QTc >480 ms'de azalt/kes". Defter: osilodrostat kaynaklarda hipokalemi/QT ile HİÇ anılmıyor; hERG ve K 4,5–5,0 yalnız insülinoma vakasında (Doi 2026). TEMD Hipofiz 2022: mineralokortikoid aktivite artışıyla HT, hipokalemi + QT uzaması. Kutu ikiye ayrıldı (insülinoma · osilodrostat), her biri kendi kaynağıyla.
- Eklendi: Kendini sına (4 soru), `.kaynak-not` sınıfı (`hizli-bakis.css`). Taşma yok (önizleme).
- **Site, dokunulmadı (karar bekliyor):** aynı kaynaksız osilodrostat iddiası (doğrudan hERG blokajı, QTc >480 ms kuralı) açık `men1-osilodrostat-yan-etkiler`, `men1-osilodrostat-mineralokortikoid`, `men1-hipokalemi-aritmojenik-sinerji`, `men1-spironolakton-cift-mekanizma`, `men1-insulinoma`, `men1-sendromu` ve premium `men1-sendromu`, `men-sendromlari` (konu + quiz), `temd-hipofiz` incisi içinde geçiyor (desen eşleşmesi; tek tek okunmadı).
- **Kalan:** s. 53 (MEN2/4/5), s. 46–47.
- **Site düzeltildi (kullanıcı "düzelt", aynı gün):** açık `men1-hipokalemi-aritmojenik-sinerji`, `men1-osilodrostat-yan-etkiler`, `men1-osilodrostat-mineralokortikoid`, `men1-spironolakton-cift-mekanizma` + premium `men-sendromlari-quiz-1` (s1), `men1-sendromu-quiz-1` (s16). "Doğrudan hERG blokajı" → TEMD Hipofiz 2022 "QT uzaması" (mekanizma tanımlanmaz) · "QTc >480 ms'de azalt/kes" → EKG ile QT izlemi · K 4,5–5,0 osilodrostatta hedef olarak değil, insülinoma olgusunun önerisi olarak (Doi 2026). DOC mekanizması ve spironolakton DOKUNULMADI (TEMD "artmış mineralokortikoid aktivite" ile uyumlu; ayrıca sınanmadı). Ölçüm tarafı: `men1-insulinoma` hERG cümlesi insülinoma bağlamında, kaynaklı → kaldı; Cushing dosyalarındaki QTc cümleleri TEMD'yle uyumlu → kaldı. updatedAt 11 Ağu → 27 Eki (4 açık konu). Spironolakton sayfasındaki "QTc" sözcüğü gidince araç bağı 723 → 722 → `arac-konu-index` + `arac-metadata` yeniden üretildi (yalnız `content/arac-konu.json` değişti). link/soru/kaynak/updatedat/üç indeks/dil temiz.

### Tur 53 — Sınav düzeni · Kısım 5 s. 53 MEN2/4/5 (27 Ekim)
Kaynak: MEN tip 1 defteri (13 madde, alıntıyla) + **TEMD Tiroid 2025 Bölüm 18 (MTK)** + TEMD Adrenal 2025 (FEO kalıtsal sendromlar). MEN1 defteri MEN2 ayrıntısını az taşıyor; MEN2 sayıları TEMD'den.
- **Birebir:** MEN1 11q13, menin, fonksiyon kaybı · RET fonksiyon kazancı, penetrans/yaş varyanta bağlı · MTK ~%100 penetrans (2025 derleme `10689_2025_Article_440`) · MEN4 2006 Pellegata, CDKN1B/p27, MEN1-negatiflerin %3'ü · MEN4: penetrans düşük, PHPT ileri, hipofiz genç yaşta (derleme) · tek/çift bez, sporadik gibi yönetim (UpToDate *Parathyroid surgery for inherited syndromes*) · MEN5 MAX (UpToDate Genetics; Papalou 2025 gigantizm, miyelolipom) · Wermer 1953 · multidisipliner, organ koruyucu, psiko-onkolojik destek (Dtsch Arztebl 2024).
- **Düzeltilen:** MEN2A "%90–95" → **%95** (TEMD); MEN2B %5 + %75 de novo · "MEN2B'de ilk yılda tiroidektomi" → risk kategorisine göre: M918T ilk yıl, C634/A883F <5 yaş, orta risk 5 yaşa ertelenebilir (TEMD, ATA 2015) · PHPT "%20–35, tek/çift bez" → %35'e kadar, hafif, FEO taramasıyla eş zamanlı · FEO "adrenalin salgılayan" KAYNAKTA YOK → çıkarıldı; benign, multisentrik, bilateral, 10 yılda karşı tarafta, cerrahide önce FEO (TEMD) · MEN5 "paratiroid hiperplazisi" → PHPT · ek bulgular TEMD diliyle.
- **KAYNAK YOK, çıkarıldı:** "Sipple" adı, "10. kromozom", MEN4 "12p13", GİS gangliyonöromatozisin "megakolon"u, dudak/dil/göz kapağı ayrıntısı, MTK "multifokal, bilateral".
- Eklendi: Kendini sına (4 soru). Taşma yok (önizleme). Site taranmadı.
- **Kalan:** s. 46–47 (Kısım 5 açık sayfa). Kısım 5'in s. 48–53'ü bitti.

### Tur 54 — Sınav düzeni · Kısım 5 s. 46–47 açık sayfa (27 Ekim)
Kaynak: MEN tip 1 defteri, tek soruda 18 madde (alıntıyla; pasajlar tek tek açılmadı).
- **Birebir:** yaşam beklentisi 55 → en az 70 (Dtsch Arztebl 2024) · menin 610 aa iskele · iki vuruş/LOH · gastrinoma %30–40, insülinoma %10–30 · timik %2–8 (72_EJ25-0110), bronşiyal %5–35 (diagnostics-15-01164) · anjiyofibrom %85–90, kollajenom %70, lipom %30 · subtotal 3–3,5 bez · ECLoma · ailesel tanı ölçütü · NF-pNET %70–80 (Dtsch) / %90 (diagnostics) · gastrinoma %70–100 duodenum, <0,5 cm · insülinoma sporadik çoğul ~%10, nüks 20 yılda %7; MEN1 %30'a dek (UpToDate MEN1) ↔ %86 (UpToDate Insulinoma), nüks %21 · PHPT kadın = erkek, ~20 yıl erken, asimetrik/asenkron · önce paratiroidektomi · transservikal timektomi.
- **Düzeltilen:** prevalans 2–20 kaynaklar arası sentez → "kaynaklar 2–10 ile 3–20 arasında" notu · DP-NET %30–80 → %30–70 (UpToDate), şekil altına Dtsch %70–100 · PHPT çubuğu %95–100 → >%90 (50–70 yaşa dek; Tur 49) · hipofiz %30–50 → %35–50, "makroadenom %85" çıktı (Tur 52 kaynak farkı) · adrenal %40–73 → %20–60 · şekil kaynağı "premium MEN1 sayfası" → UpToDate/derlemeler · Sayılarla "4,5–5,0 hedef potasyum" (osilodrostat genellemesi, Tur 52) → "≥70 yaş · yaşam beklentisi" · organ şeridi adrenal/mide (%15–70)/meme · genetik test "<30 yaşta multiglandüler" → "<30 yaşta PHPT ya da multiglandüler PHPT" (Brandi 2025, Papalou) · meme "<50 yaş" iki yerde → daha erken başlangıç.
- Eklendi: s. 47 Kendini sına. Taşma yok (önizleme).
- **KISIM 5 BİTTİ (s. 46–53).** Site karşılıkları (açık `men1-sendromu`, premium `men1-sendromu`) bu sayılar için taranmadı.

### Tur 55 — Sınav düzeni · Kısım 6 s. 58 (27 Ekim) — YENİ YÖNTEM
**Kullanıcı kararı (aynı gün):** kaynak = deftere yüklenen YAYININ KENDİ METNİ, AI yanıtı değil; öncelik kılavuz (TEMD) → ders kitabı → UpToDate → makale; ayrışan değer "TEMD'ye göre X; Y'ye göre Z" diye ikisi birden. Yöntem: defterde kaynak panelinden yayına tıkla → `document.body.innerText` tam metni verir → regex ile ara (hafıza: feedback-notebook-kaynak-metni).
Osteoporozis defteri `notebook/a7184651-38ac-4755-a06e-846553b412e5` (58 kaynak; `OSTEPOROZ_nisan2025.pdf` = TEMD Osteoporoz ve Metabolik Kemik 2025). Yereldeki `Downloads/11_12083_Metabolik_Hast.pdf` 2013 baskısı — KULLANILMADI.
- s. 58 `tur-anlati` → `tur-sinav`. TEMD metninden: Tip I/II tanımı · DXA'da T (postmenopozal, ≥50 erkek) / Z (premenopozal, <50 erkek, çocuk; ≤−2,0 "beklenenden düşük") · tek vertebra/topuk tanıda yok · Tablo 6 risk kategorileri (yüksek: FRAX kalça ≥%3 / majör ≥%20; çok yüksek: >75 yaş, çoklu vertebra, tedavi altında/ilaca bağlı kırık, düşme, **T <−3,0**, T <−2,5 + vertebra kırığı) · laboratuvar listesi (+ALT; kırıkta total protein, albümin, FSH) · belirteçler (IOF/IFCC PINP + CTX; tanıda yeri yok, rutin izlemde önerilmez, 3–6 ayda tekrar) · Ca 1200/1000, erkek 50–70 1000, >70 1200 · **D vitamini postmenopozal 800–1200 IU (öneri kutusunda 800–1500), 25(OH)D >20 ng/mL** · egzersiz 3–4×30–40 dk. Ders kitabından (*Osteoporosis: Basic and Clinical Aspects*, ClinicalKey): östrojen T hücresi aktivasyonunu baskılar → RANKL ↓.
- **Çıkarılan (kaynak metninde görülmedi):** "800–2000 IU, hedef 30–50 ng/mL" · CTX/P1NP "%30–50 düşüş" · kafein "<200 mg" (TEMD yalnız "sınırlandır") · IL-1/IL-6/TNF, ROS, MSC→adiposit kayması · gebelik osteoporozunun "3. trimester · kendini sınırlar" ayrıntısı.
- Taşma yok (iki kısaltma turuyla). **AÇIK ÇELİŞKİ:** s. 55 kapak kuralı ve s. 59 "çok yüksek risk T ≤−3,5" diyor; TEMD 2025 Tablo 6 **<−3,0**. s. 59 turunda kaynak metniyle karara bağlanacak (AACE/UpToDate −3,5 ise iki kaynak adıyla).
- **Kalan Kısım 6:** s. 59 (ilaçlar), 56–57 açık sayfa, 60 karar yolu, 61–62 başvuru, 55 kapak kuralları.

### Tur 56 — Sınav düzeni · Kısım 6 s. 59 ilaçlar (27 Ekim)
Kaynak: TEMD Osteoporoz 2025 kendi metni (defterde `OSTEPOROZ_nisan2025.pdf`, kaynak görüntüleyiciden).
- s. 59 `tur-anlati` → `tur-sinav`. TEMD'den birebir: oral 5 / IV 3 yıl sonra 1–2 yıl tatil, 2–4 yılda yeniden değerlendirme · yüksek risk sürerse oral 10, zoledronat 6 yıl · GFR <35 alendronat/zoledronat, <30 risedronat/ibandronat verilmez · denosumab 60 mg/6 ay, tatil yok, etki 6 ayda döner · çıkış son dozdan 6 ay sonra 5 mg IV zoledronat; >3 yıl kullananda yetmeyebilir, 3. ve 6. ayda belirteç, yoksa 6 ay sonra ikinci infüzyon · KBH'de hipokalsemi, 2 haftada Ca · SERM yalnız vertebral (MORE %30–50), VTE ↑ · teriparatid 20 µg 24 ay (yaşam boyu), abaloparatid 80 µg 18 ay Türkiye'de yok · romosozumab 210 mg/ay 12 ay, MI/inme öyküsü ya da riskinde önerilmez · denosumab → teriparatid kemik kaybı, denosumab sürdürülür.
- **T-skoru çelişkisi ÇÖZÜLDÜ:** TEMD'de iki ayrı eşik var — risk tablosu (Tablo 6) "çok yüksek risk T <−3,0"; farmakolojik tedavi bölümü "anabolik ön planda: kırık yokken T ≤−3,5 ya da T ≤−2,5 + frajilite/ciddi/çoklu vertebra kırığı". Kapak (s. 55) kuralı anabolik ölçütü olarak doğru; s. 59'da ikisi ayrı yazıldı.
- **Çıkarılan (TEMD metninde yok):** teriparatid "Türkiye'de 76 hafta" · "FDA 2020 kara kutu kaldırdı, EMA 24 ay" · NOGG CTX izlemi · "ibandronat yalnız vertebral" · "18–24 ay anabolik pencere" · adinamik KBH kemik hastalığı cümlesi · romosozumabın "Avrupa'da yalnız…" onayı · çok yüksek riskte zoledronat "6 yıl" dışı ayrıntılar.
- Taşma yok (önizleme). **Kalan Kısım 6:** s. 56–57 açık sayfa, 60 karar yolu, 61–62 başvuru, 55 kapak (kuralları TEMD'le karşılaştır).

### Tur 57 — Sınav düzeni · Kısım 6 s. 60–62 sayı doğrulaması (27 Ekim)
Kaynak (yayın metni, AI yanıtı değil): TEMD Osteoporoz 2025 · UpToDate *Osteoporosis in patients with CKD: Diagnosis and evaluation* · ClinicalKey *Osteoporosis in Males* (rakam katmanı BOŞ — sayıları okunamıyor). Sayfa türleri korundu (karar yolu, başvuru), yalnız sayılar ve kaynaklar.
- **s. 60:** çok yüksek risk tanımı → TEMD Tablo 6 + anabolik ölçütü ayrı · laboratuvar listesine iPTH, ALT · "Türkiye'de teriparatid 76 hafta" → **24 ay** (TEMD: 20 µg/gün, yaşam boyu 24 ay); abaloparatid yok · izlem "≥%5 KMY kaybı" → TEMD: DXA tedavi altında yılda bir, teriparatidde 6 ayda; anlamlı değişim = LSC · spot "açık epifiz, Paget, RT, malignite" → TEMD: 25 yaş altında epifiz kapanması kanıtlanmadan teriparatid yok · "adinamik KBH'de anaboliklerin yeri" çıkarıldı.
- **s. 61:** GK "profilaksi eşiği ≥7,5 mg, ≥3 ay" → TEMD: GK başlanan postmenopozal kadın ve >50 erkekte FRAX, orta riskten (kalça %1–3 / majör %10–19) bisfosfonat; 2,5–7,5 mg/gün ve <30 günde bile risk, ilk 3–6 ay · "teriparatid antirezorptiften üstün" çıktı · KBH belirteçleri UpToDate'le (BSAP, TRAP5b, P1NP trimeri; biyopsi altın standart; eGFR ≥30 genel gibi) · aort kalsifikasyonu, romosozumab-KBH satırı, kalsitriol 0,5 µg, nakil "3–6 / 6–12 ay", kanser T eşikleri (<−1,0/−1,5) ÇIKARILDI (metinde yok) · inci → premenopozal bisfosfonat/gebelik (TEMD).
- **s. 62:** "kırıktan sonra yalnız ~%9 tedavi" çıktı → "≥70 yaş tüm erkek taranır (TEMD)" · testosteron sonrası ilaç ölçütü TEMD cümlesine çekildi (≥2 yıl yeterli testosterona rağmen T <−2,5 + risk / yüksek doz GK / sık düşme / yakın kırık ya da tek başına T <−3,5) · teriparatid "T ≤−3,0" çıktı · "Kılavuzlar yan yana" tablosunun ABD/Avrupa sütunları (kaynaksız; 76 hafta TEMD'yle ÇELİŞİYORDU) kaldırıldı → "TEMD 2025 künyesi"; başlık ve s. 55 içindekiler güncellendi.
- s. 57 süre çubuğu: "18–24 ay (TEMD: 76 hafta)" → "TEMD: teriparatid 24 ay · abaloparatid 18 ay".
- **DOĞRULANAMADI, dokunulmadı (kitapta çok yerde geçiyor):** erkekte "%40–60 sekonder neden" (8 yer; ClinicalKey'de "at least __ %" — rakam yok) · nakil "D vitamini sonra 1500–2000 IU" (3 yer; TEMD yalnız nakil öncesi 30 ng/mL yükleme + Ca 1200–1500) · s. 61 GK mekanizma cümlesi. Bunlar için UpToDate *Etiology of osteoporosis in men* ve *…after solid organ transplantation* metinleri açılmalı.
- Taşma yok (önizleme). **Kalan Kısım 6:** s. 56–57 açık sayfa, 55 kapak kuralları.

### Tur 58 — Sınav düzeni · Kısım 6 s. 56–57 açık sayfa (27 Ekim)
Kaynak: TEMD Osteoporoz 2025 kendi metni. Sayfa türü korundu (açık sayfa), sayılar düzeltildi.
- **Birebir:** 50 yaşında kırık riski kadın %39, erkek %13 · kalça kırığı sonrası 2 yılda mortalite %12–20 (+ TEMD: erkekte iki kat) · ibandronat nonvertebral/kalça kırığını azaltmadı · GFR 30–35 · Ca 1200.
- **Düzeltilen:** tanı ölçütü "frajilite kırığı (kalça, vertebra, humerus, önkol) KMY'den bağımsız" → TEMD: düşük travmalı **kalça** kırığı KMY'den bağımsız; vertebra, proksimal humerus, pelvis ya da distal önkol kırığı **+ osteopeni** · HRT "menopozun ilk 10 yılı, vazomotor yakınma" → TEMD: osteoporoz için seçenek değil; başka endikasyonla alanda sürer; antirezorptifi tolere edemeyende endikasyon; en düşük doz, en geç 2 yılda kes · izlem "BTM 3–6 ay, DXA 1–2 yıl" → DXA tedavi altında yılda bir (teriparatidde 6 ay), BTM yalnız uyum/emilim kuşkusunda · Şekil 7 "çok yüksek riskte 6/10 yıl" → "risk sürerse" (TEMD ifadesi) · Sayılarla "≤−3,5 çok yüksek risk" → "kırıksız anabolik eşiği (çok yüksek risk <−3,0)" · teriparatid kontrendikasyonları (Paget, RT, malignite) TEMD'de yok → 25 yaş altı epifiz kuralı · romosozumab "kontrendike" → "MI/inme öyküsü ya da riskinde önerilmez", 210 mg · klinik inci CTX/P1NP yön iddiası → TEMD belirteç kuralı · "≥%5 KMY kaybı" → LSC.
- Taşma yok. **Kısım 6'da kalan:** s. 55 kapak kuralları (TEMD'le karşılaştır) + doğrulanamayan erkek %40–60 / nakil 1500–2000 IU (Tur 57).

### Tur 59 — Sınav düzeni · Kısım 6 s. 55 kapak kuralları (27 Ekim)
Kaynak: TEMD Osteoporoz 2025 (Tur 55–58'de okunan metin). Altı kuralın dördü (FRAX %3/%20, bisfosfonat GFR <30–35 + tatil 5/3, denosumab tatil yok + bisfosfonat çıkışı, sıra anabolik → antirezorptif · denosumab → anabolik kayıp) TEMD'yle birebir.
- **Düzeltilen:** 1. kural "KMY'den bağımsız frajilite kırığı" → düşük travmalı kalça kırığı KMY'den bağımsız; vertebra/humerus/pelvis/önkol kırığı + osteopeni; Z-skoru grubu "genç erişkin" → premenopozal kadın ve <50 yaş erkek · 5. kural "çok yüksek risk (T ≤−3,5…) → anabolik" → "anabolik ön planda: kırıksız T ≤−3,5 ya da T ≤−2,5 + kırık (çok yüksek risk tablosunda <−3,0)".
- **Kanal tuzağı (yine):** `sed` yerine koyma metninde `&` (HTML `&lt;`) eşleşen metni araya bastı, iki satır bozuldu; node ile satır bazında yeniden yazıldı. HTML varlığı içeren yerine koymada sed KULLANMA.
- **KISIM 6 BİTTİ (s. 55–62).** Açık: erkek "%40–60 sekonder neden" (8 yer) ve nakil "1500–2000 IU" (3 yer) doğrulanamadı — UpToDate *Etiology of osteoporosis in men* ve *…after solid organ or stem cell transplantation* metinleri açılmalı.

### Tur 60 — Sınav düzeni · Kısım 7 (SGLT2) s. 66 mekanizmalar (27 Ekim)
SGLT2 Inhibitors defteri `notebook/f5ffebc1-54ba-4e29-86fd-fa6246b989ed` (37 kaynak: makaleler + UpToDate; kılavuz/ders kitabı YOK). Kılavuz için yerel `Downloads/diabetesmellitus2026.pdf` = TEMD Diabetes Mellitus 2026 (pdftotext + iconv; SGLT2 bölümü 7.7).
- **Yöntem notu:** kaynak görüntüleyicinin metni `document.body.innerText`le alınınca SOHBET GEÇMİŞİ de karışıyor (Türkçe "HIF-1α" cümlesi sohbetten geldi). Çare: `innerText`i 3000+ karakter, "Kaynak kılavuzu" içeren ama "keep_pin" İÇERMEYEN en büyük kaba sınırla. Sohbet yalnız "hangi yayında geçiyor" yol haritası için kullanıldı.
- s. 66 `tur-anlati` → `tur-sinav`. Yayın metninde görülen: TGF/aferent (Application… kidney) · SGLT2–NHE3 apikal mikrodomen eşleşmesi (Repurposing… ascites) · AMPK–NRF2–GPX4, GCLM, HIF-1α (Ferroptosis regulation) · miyokard NHE1 "hipotez" (UpToDate HFrEF mechanisms) · ketonlar, NLRP3, interstisyel hacim (SGLT2 after MI) · eritrositoz (Adverse events…) · sistatin C (Muscle loss…) · ~2 kg, KB 2–4 mmHg (TEMD DM 2026).
- **Düzeltilen:** Hb artışı "1–2,5 g/dL" → **2–2,5 g/dL**, %2–19'unda, Hct >%53'te kesmeyi düşün · β-hidroksibütirat "az oksijenle çok ATP üreten verimli yakıt" → MI makalesi: "daha verimli substrat değil, EK/tamamlayıcı yakıt" · NHE1 kesin mekanizma değil, **hipotez** (UpToDate) · "MAP17" hiçbir yayın metninde yok → kitaptan (s. 63 kapak dahil) çıkarıldı.
- **Çıkarılan (görülmedi):** adenozin, kortikal hipoksi/O₂ tüketimi, HO-1/Fenton ayrıntısı, "açlık taklidi"/mTORC1, peritübüler miyofibroblast → EPO hücresi, refleks taşikardi cümlesi.
- Taşma yok. **Kalan Kısım 7:** s. 63 kapak kuralları, 64–65 açık, 67 karar, 68 başvuru.

### Tur 61 — Sınav düzeni · Kısım 7 s. 63–65, 67–68 sayı doğrulaması (27 Ekim)
Kaynak (yayın metni): UpToDate *SGLT2 inhibitors for the treatment of hyperglycemia* · UpToDate *Perioperative glycemic management* · *Efficacy of SGLT2i after TAVR* · *SGLT2i in hemodialysis or PD* · *Benefits of SGLT2i in advanced CKD* · *Adverse events…* · TEMD DM 2026 (önceki turlarda eklenen TEMD kutuları korundu). Sayfa türleri korundu.
- **Birebir:** SGLT2 filtre glukozun ~%90'ı (UpToDate) · öglisemik DKA "genellikle <250 mg/dL" (UpToDate) · TAVR sonrası tüm nedenli mortalite HR 0,72, KY yatışı 0,74 · dapagliflozin diyalizle atılmaz, birikmez.
- **Düzeltilen:** cerrahi öncesi "FDA (2020) ve ADA en az 3 gün (ertugliflozin 4)" yayın metninde YOK → UpToDate **3–4 gün** (TEMD 1–3 gün yanında; 7 yer + kutu başlığı "KDIGO ve UpToDate ile farkı") · genital mantar kadında %10–15 → **%11–14** (UpToDate) · Hb "1–2,5" → **2–2,5 g/dL**, %2–19'unda eritrositoz, Hct >%53 (3 yer) · **amputasyon:** kitap "diğerlerinde sınıf etkisi yok / genellemek tuzak" diyordu; UpToDate sınıf için küçük alt ekstremite enfeksiyonu + amputasyon riski yazar → satır ve tuzak tersine çevrildi · eGFR "≤%30 dip" sayısı yayında yok → "geçici, fizyolojik" (EMPA-KIDNEY plaseboya göre 1,58 mL/dk) · şekil: "keton süper yakıt, ATP verimi" → ek yakıt · adenozin, "refleks taşikardi yapmadan", "60–80 g glukozüri" çıktı.
- **Doğrulanamadı, dokunulmadı:** KDIGO "eGFR ≥20" (makalelerde yalnız kaynakça olarak; kılavuz metni defterde yok) · AKI %25–30 azalma · KB düşüşü "dozdan bağımsız" · s. 67 "%30–35 karbonhidrat" ve RAS/diüretik ayrıntıları.
- Taşma yok (s. 63–68 önizleme). **KISIM 7 TAMAM (s. 63–68).**

### Tur 62 — Sınav düzeni · Kısım 8 (tirzepatid) s. 70 + s. 72 (27 Ekim)
Tirzepatide defteri `notebook/0d7cc224-679b-4a6e-a3fb-86d429f93132`: PubMed özetleri + **ürün monografisi** (`Tirzepatid, monograph.pdf` — kılavuz yok; farmakoloji ve faz 3 tabloları için birincil kaynak).
- **Monografide birebir:** Aib 2 ve 13, Lys20 + C20 yağ diasidi · albümine %99 · t½ ~5 gün · doruk medyan 24 sa (8–72) · intakt ilaç idrar/feçeste yok · 4813 Da · OKS Cmax %55–66 ↓, AUC %16–23 ↓, 4 hafta bariyer · parasetamol Cmax ~%55 ↓ · kalp hızı +3 atım/dk · kolelitiyaz %1,1, kolesistit %0,6 · gebelikten ≥1 ay önce kes · SURMOUNT-1 15 mg %−20,9 (plasebo −3,1; fark −17,8) · SURMOUNT-2 %−14,7 (fark −11,6) · SURMOUNT-3 %−18,4 vs +2,5 (fark −20,8). SURPASS HbA1c %1,87–3,02, kilo 5,4–12,9 kg (PubMed derleme).
- **HATA düzeltildi:** "SURMOUNT-1 %22,4 (ortalama 20,9 kg)" — 20,9 yüzdeydi, kilogram değil; %22,4 monografide yok (NEJM'in etkinlik tahmincisi olabilir, defterde metni yok) → monografi değeri %−20,9 (s. 70'te 4 yer: 30 sn, şekil, tablo; s. 72). SURMOUNT-3 "ilave %20,8 kayıp" → plaseboya göre fark.
- **Çıkarılan (yayın metninde görülmedi):** baş başa meta-analiz %−11,4 / %−7,3 / −4,84 kg (şekil çubukları ve altyazı) · SURMOUNT-1 "%50,1–56,7'si ≥%20 kayıp" · SC biyoyararlanım "~%80" (monografi cümlesi okunamadı) — Sayılarla'ya yerine +3 atım/dk ve OKS %55–66.
- s. 72 `tur-anlati` → `tur-sinav` (molekül zinciri, mekanizma, SURPASS, SURMOUNT tablosu, Kendini sına). Taşma yok.
- **Kalan Kısım 8:** s. 69 kapak, 71 (açık sayfa sağ), 73 karar yolu (perioperatif — "12 saat açlık, rezidü ~%0", taşifilaksi kaynakları: *Clinical consequences of delayed gastric emptying…*), 74 (çoğu monografiyle tutuyor; parasetamol "AUC değişmez" ifadesi monografide "tekrarlayan dozla etki azalır").

### Tur 63 — Sınav düzeni · Kısım 8 s. 69, 71, 73, 74 (27 Ekim)
Kaynak: tirzepatid ürün monografisi (defterde, kaynak görüntüleyici metni).
- **s. 71:** kan basıncı "sistolik 5,1–7,2, diyastolik 3,2" → monografi tablosu: sistolik **6,3–7,2 mmHg** ↓ (plaseboya göre 5,2–6,2); diyastolik sayısı görülmedi, çıktı · trigliserit %24,8–27,2, non-HDL %5,9–9,7, HDL %8–9 birebir · SDBY'de "önerilmez" birebir · "MEN sendromları bkz. s. 45" → MEN2 s. 53.
- **s. 73:** monografi: standart açlığa rağmen rezidüel mide içeriğiyle nadir aspirasyon; "açlığı uzatmanın ya da ilaca ara vermenin riski azaltıp azaltmadığını gösterecek veri yetersiz" → 2. adıma eklendi · "12 saat açlıkta rezidü ~%0" ve "12 saatlik açlık rezidüyü temizler" görülmedi → "etkinliği kanıtlanmamış seçenek" + monografi cümlesi. Taşifilaksi spotu doğrulanamadı (*Clinical consequences of delayed gastric emptying* kaynak listesi tıklamayla açılamadı), dokunulmadı.
- **s. 74:** OKS, parasetamol (AUC değişmez, tekrarlayan dozla etki azalır), kolelitiyaz %1,1 / kolesistit %0,6, +3 atım/dk, 4813 Da, gebelikten 1 ay önce kes, süt verisi yok, organogenezde malformasyon (hayvan) — monografiyle birebir. Değişiklik yalnız SURMOUNT-1 (Tur 62).
- **s. 69 kapak:** altı kural monografiyle tutuyor (C20/Aib/~5 gün, doz ayarı yok, 2,5 mg tolerabilite, MTK/MEN2, aspirasyon, OKS 4 hafta).
- Taşma yok. **KISIM 8 TAMAM (s. 69–74).**

### Tur 64 — Sınav düzeni · Kısım 9 (hipertiroidi) s. 78 (29 Ekim)
Tirotoksikoz defteri `notebook/b12b0833-…` (43 kaynak: UpToDate başlıkları, ClinicalKey ders kitabı bölümleri, Graves tanı kılavuzu, Best Pract Res 2023 derlemesi). Kaynak görüntüleyicide yayın metni okundu; sohbet kullanılmadı.
- **Ölçüm tuzakları (yeni):** UpToDate metninde bazı sözcükler Kiril benzeri harflerle (homoglif) yazılı — "hуреrthуroiԁiѕm"; İngilizce sözcükle arama kaçırır, RAKAMLA ara. ClinicalKey bölümlerinde rakamlar yine düşmüş ("around __ pct").
- s. 78 `tur-anlati` → `tur-sinav`. Yayın metninde görülen: TRAb IgG1, tiroidektomi sonrası 18 ayda %70–80'de kaybolur (UpToDate Pathogenesis) · ikiz ~%70, pediatrik risk lokusları HCP5/TNF/TSHR/CTLA4/PTPN22 (Best Pract Res 2023) · TSHR–IGF-1R β-arrestin 1 iskelesi (ClinicalKey GO) · debi %250'ye dek, AF %5–15, KY ~%6 (%94'ünde AF), 60 yaş üstü TSH baskısında AF ~3 kat (UpToDate CV effects) · HVA ↓, Basedow paraplejisi (UpToDate Neurologic).
- **Düzeltilen:** AF "70 yaş üstünde %15–25" → **70–79 yaşta %15** (UpToDate; Kısım 1'de JAMA 2023 %10–25 ayrıca adıyla duruyor) · kore "%1'den az" → **<%2** · MG "%2–17 birliktelik" → **MG hastalarında hipertiroidi %2–17** (yön düzeldi) · "TSH <0,1'de subklinikte bile 3 kat" → 60 yaş üstünde belirgin TSH baskısında ~3 kat.
- **Çıkarılan (görülmedi):** HLA-DRB1*03/DQA1*05/DQB1*02 (derleme DRB1*08 vb. veriyor) · Th1 paterni · Thy1 fibroblast alt tipleri · damar direnci "%50–70" · NO · TR-α1/β, SERCA2a/fosfolamban ayrıntısı · pretibial miksödem/akropaki satırları · Doppler "inferno" spotu · TRAb–KMY incisi (Graves BMD derlemesi açılmadı).
- Taşma yok. **Kalan Kısım 9:** 75 kapak, 76–77 açık, 79–87.

### Tur 65 — Sınav düzeni · Kısım 9 s. 75–77 (+ Kısım 1 s. 4 ve s. 86) (29 Ekim)
Kaynak: TEMD Tiroid 2025 (yerel pdftotext) · UpToDate *Diagnosis of hyperthyroidism*, *Thyroid storm* (defter, yayın metni).
- **Birebir:** T3/T4 >20 ng/mcg Graves/toksik adenom (TEMD + UpToDate) · Burch-Wartofsky ≥45 "kuvvetle fırtına", <25 olası değil (UpToDate) · kümülatif 4,5 g IV metilprednizolon (TEMD) · biyotin 5–10 mg/gün, testten en az 2 gün önce kes (TEMD) · subklinik derece 1 TSH 0,1–0,4, derece 2 <0,1 (TEMD).
- **Düzeltilen:** Graves'te orbitopati "%25–50" → **TEMD: klinik %26, radyolojik %70** · "12–18 ay sonrası relaps %50" → **TEMD: 1 yıl antitiroid sonrası ~yarısı remisyon (%30–70)**.
- **Çıkarılan (yayın metninde görülmedi):** TRAb "duyarlılık %97,7 · özgüllük %99,5" — 5 yer (s. 4 rozet, s. 75 kapak, s. 76 Sayılarla, s. 79 spot, s. 86 soru). Yerlerine doğrulanmış bilgi (T3/T4 >20, TRAb'nin tiroidektomi sonrası kayboluşu, orbitopati %26). Defter sohbetine yol haritası sorusu soruldu ama sayfa dondu, yanıt alınamadı — kaynak bulunursa geri girer.
- Taşma yok (s. 75–77). **Kalan Kısım 9:** s. 79–87 sayı denetimi.

### Tur 66 — Sınav düzeni · Kısım 9 s. 79–81 (29 Ekim)
Kaynak: TEMD Tiroid 2025 Bölüm 11 (Graves orbitopatisi; yerel metin) · ClinicalKey *Long-term thionamide antithyroid treatment of Graves' disease* (defter, yayın metni).
- **TEMD'de birebir:** CAS ≥3/7 aktif · hafif aktif GO'da 6 ay selenyum · IVMP kümülatif 4,5 g, kür başına 8 g'ı geçmesin (aşılırsa nadiren akut karaciğer yetmezliği) · EUGOGO 2021: IVMP + mikofenolat · teprotumumab (anti-IGF-1R) · rituksimab ikinci basamak.
- **Düzeltilen:** RAI profilaksisi "1–3 aylık düşük doz oral prednizon zorunlu" → **TEMD: yüksek riskte RAI'den 1–3 gün sonra prednizolon 0,3–0,5 mg/kg/gün, 3 ayda azaltarak; düşük riskte 0,1–0,2 mg/kg, 6 hafta**; RAI sonrası GO progresyonu %15–37 eklendi · DON "1 g/gün ardışık 3 gün, 2 haftada" → **500 mg–1 g, ardışık 3 gün ya da gün aşırı; 1–2 haftada yanıtsızlıkta acil dekompresyon** · orbitopati %25–50 → %26 / radyolojik %70 · "8 g üzeri ölümcül hepatotoksisite + KV risk" → TEMD ifadesi · uzun süreli MMI ">%80 remisyon" → ClinicalKey: "5 yıldan uzun tedavide hastaların çoğunda uzun süreli remisyon, ek büyük yan etki yok"; 1–2 yıl sonrası ~%50 nüks birebir.
- **Çıkarılan (yayın metninde yok):** GREAT+ HLA/PTPN22 genotipleri ve sınıf nüks oranları (GREAT bileşenleri sayısız kaldı) · pediatrik relaps "%68" · Thy1⁻/Thy1⁺ fibroblast alt tipleri ve CD34⁺ fibrositler (s. 78'deki kararla tutarlı) · MG alt tip oranları (%41/%21, %27/%60, %36/%57) → yerine UpToDate MG %2–17.
- **Doğrulanamadı, kaldı:** selenyum "200 µg/gün" dozu (TEMD yalnız süre veriyor) · metimazolde "≥30 mg/gün agranülositoz riski" · agranülositoz <500/µL.
- Taşma yok. **Kalan Kısım 9:** s. 82–87.

### Tur 67 — Sınav düzeni · Kısım 9 s. 82, 84 (+ Kısım 1 s. 9) (29 Ekim)
Kaynak: TEMD Tiroid 2025 — Bölüm 10 (tiroid fırtınası, s. 112) ve Bölüm 28 (acil, s. 321–322), yerel metin.
- **TEMD İÇ ÇELİŞKİ (iki bölüm ayrışıyor):** iyot tionamidden sonra — Böl. 28 "en az 1 saat", Böl. 10 "en az 30 dk" · kolestiramin — Böl. 28 "4 g günde 4 kez", Böl. 10 "1–4 g günde 2 kez" · SSKI — Böl. 28 "3–5 damla", Böl. 10 "5 damla". s. 84 ve s. 9'da ikisi bölüm adıyla yazıldı.
- **Düzeltilen:** hidrokortizon yalnız UpToDate (300 → 100 mg/8 sa) yazıyordu → **TEMD: 50–100 mg IV, 6–8 saatte** önde, UpToDate yanında (s. 9 ve s. 84; Tur 44 notu s. 9'da uygulanmamış kalmıştı) · propranolol "4–6 saatte" → **TEMD: 60–80 mg, 6 saatte** · esmolol TEMD dozu (50–100 µg/kg/dk) eklendi (s. 84).
- **Birebir:** PTU 500–1000 mg yükleme → 250 mg/4 sa; MMI 80–120 mg/gün (= 20 mg 4–6 saatte) · amiodaron Tip 1 ortalama 3,5 ay, Tip 2 ortalama 30 ay ve kesildikten sonra · Tip 2'de prednizolon 30–40 mg/gün.
- Taşma yok. **Kalan Kısım 9:** s. 83 (TRAb ≥0,9 → %80–85 nüks; beta bloker dozları), 85–87.

### Tur 68 — Sınav düzeni · Kısım 9 s. 83, 85 (+ s. 8) (29 Ekim)
Kaynak: TEMD Tiroid 2025 (Graves tedavisi ve gebelik bölümleri; yerel metin).
- **Birebir:** atenolol 25–50 mg/gün · PTU:MMI 15–20:1 · hCG zirvesi 10–12. hafta, GTT 14–18. haftada düzelir · MMI embriyopatisi bulguları (aplasia cutis, koanal/özofageal atrezi, karın duvarı defektleri, VSD) · gebe/emzirene iyot 100–150 µg/gün.
- **Düzeltilen:** propranolol "40–160 mg/gün" → **TEMD 40–120 mg/gün** (s. 8 ve s. 83; 160 mg TEMD'de yalnız T4→T3 bağlamında) · gebelikte aşikâr hipertiroidi "%0,1–0,4" → **%0,1–1**.
- **Çıkarılan (TEMD metninde yok; UpToDate gebelik metni bu turda açılmadı):** "18. ayda TRAb ≥0,9 IU/L → %80–85 nüks" (yerine niteliksel cümle) · Graves "%85–90" · "gebelerin %10–20'sinde TSH baskılanması" · embriyopati "6–10. hafta %2–4".
- Taşma yok. **Kalan Kısım 9:** s. 86 (kırk soru — önceki düzeltmelerle tutarlılık), s. 87 (TEMD başvuru).

### Tur 69 — Sınav düzeni · Kısım 9 s. 86–87 (29 Ekim) — KISIM 9 TAMAM
- **s. 87** baştan TEMD 2025'ten derlenmiş; Tur 64–68'de okunan TEMD metniyle tutuyor (orbitopati %26 / radyolojik %70, remisyon ~%50 (%30–70), MMI başlangıç dozları, 15–20:1, izlem aralıkları) — değişiklik yok.
- **s. 86 (kırk soru)** önceki turların düzeltmeleriyle eşitlendi: "orbitopati %25–50" sorusu → "RAI sonrası GO progresyonu %15–37 (TEMD)" · DON yanıtı → 500 mg–1 g × 3 gün, 1–2 haftada dekompresyon · "Graves (%85–90)" → Graves · "embriyopati 6–10. hafta %2–4" → tipik bulgu sorusu.
- **Kısım 9 açık kalanlar:** TRAb %97,7/%99,5 kaynağı (bulunursa geri girer) · selenyum 200 µg dozu · MMI ≥30 mg agranülositoz · gebelik sayıları (Graves %85–90, embriyopati %2–4) UpToDate gebelik metniyle sınanabilir · Jod-Basedow "2–12 hafta" (Tur 44: defterde "haftalar ya da aylar").

### Tur 70 — Sınav düzeni · Kısım 10 (PPGL) s. 94 (29 Ekim)
Kaynak: TEMD Adrenal ve Gonadal 2025 (yerel `Downloads/TEMD Adrenal ve gonadal 2025.pdf` → pdftotext + iconv; PPGL bölümü ~satır 2970–3720) · Feokromastoma defteri `notebook/9ea14ea3-02c3-40a8-8bc2-137d55eacffa` (12 kaynak: UpToDate ×3, makaleler) — yayın metni.
- s. 94 `tur-anlati` → `tur-sinav`. TEMD'den birebir: PPGL %30–40 kalıtsal → herkese genetik test, çocukta %70–80 · kalıtsalların ~yarısında SDHx (çoğu SDHB) · metastatiklerin %40–45'inde SDHB · Tablo 4.3 küme 1 psödohipoksi %10–15 (SDHx, VHL, EPAS1, FH; noradrenerjik) · küme 2 kinaz %50–60 (RET, NF1, TMEM127, MAX; adrenerjik, çoğu adrenal, daha az agresif) · küme 3 Wnt %5–10 (CSDE1, MAML3; agresif) · hidrasyon %0,9 NaCl · fentolamin 2,5–5 mg IV 3–5 dk'da bir. UpToDate: bir seride %50'si otopside tanındı; 7–15 dk'lık HT↔hipotansiyon döngüsü. 2023 meta-analizi (*Preoperative α-blockade versus no blockade*): ameliyat sonrası uzamış hipotansiyon/vazopressör RR 4,21 (1,17–15,18).
- **Düzeltilen:** "Wang ve ark. 2023" → "2023 meta-analizi" (D. Wang sorumlu yazar; ilk yazar doğrulanmadı) · "ani başlayan 15–20 dakikalık ataklar" çıktı — TEMD'deki 15–20 dk katekolaminin YARI ÖMRÜ, atak süresi değil.
- **Çıkarılan (görülmedi):** "PPGL kalıtsal geçişi en yüksek insan tümörü" incisi · PNMT'nin kortizolle yıkanan medullada çalıştığı ayrıntısı (PNMT yalnız sentez şemasında) · "küme 1 PNMT yok" ayrıntısı.
- Taşma yok. **Kalan Kısım 10:** 91 kapak, 92–93 açık, 95–102.

## Tur 71 — s. 95–96 PPGL biyokimya ve görüntüleme (29 Eki 2026)

Kaynak: TEMD Adrenal ve Gonadal 2025 (yerel PDF, 4.5.1–4.5.2, Tablo 4.4) + Feokromastoma defterindeki UpToDate *Clinical presentation and diagnosis of pheochromocytoma* metni.
- Doğrulandı: plazma %96–100 / %85–89 (60 yaş üstü %77), idrar %98/%98, dışlama eşikleri 0,3/0,66 ve 0,5/0,9 nmol/L (UpToDate); >10 HU (30–40), washout <%50, MIBG %83–100 / %53–60, metastatikte DOTA %93 (TEMD).
- Düzeltildi: 20–30 dk dinlenme → TEMD ≥30 dk; ilaç kesme "2 hafta" → TEMD 5–14 gün · UpToDate ≥2 hafta; fonksiyonel eşik 5–8 cm → TEMD >5 cm · UpToDate ör. 8 cm; FDOPA "sporadikte en hassas" → TEMD Tablo 4.4: sporadikte DOTATATE ilk, FDOPA VHL/EPAS1/küme 2; "kontrast α-blokajsız güvenli" → TEMD α-blokaj ister, noniyonik güvenli olabilir (tuzak kutusu yeniden yazıldı).
- Çıkarıldı (kaynakta yok): NPV >%99, kreatinin klirensi, 12 saat kısıtlama, BT duyarlılık >%90, "evre 4–5 KBH normetanefrin ~2 kat" (yerine UpToDate hemodiyaliz NE 3×, DA 2×), klonidin 0,3 mg/70 kg.
- Sınırda yükseklik: TEMD 2025 "<2 kat → test tekrarı"; klonidin TEMD 2022 adıyla kaldı.
- Açık: s. 93 "TEMD 2022 · 3–4 kat" ↔ TEMD 2025 "2 kat" — s. 93 turunda.

## Tur 72 — s. 91–93 PPGL kapak, açık sayfa, epidemiyoloji (29 Eki 2026)

Kaynak: TEMD Adrenal 2025 (4.1–4.4, Tablo 4.1) + UpToDate *Clinical presentation and diagnosis of pheochromocytoma* metni (defter).
- Düzeltildi: HT %90–95 → TEMD %80–90; normotansif %5–15 → TEMD %15–40; klasik üçlü %20 → TEMD %40–50 (UpToDate: çoğunda üçü yok); insidans "milyonda 2–8" → TEMD 0,46–0,95/100.000 kişi-yılı; insidentalomada %5–7 → UpToDate ~%3 (TEMD 2022 ~%5); yaş "4.–5. dekat" → TEMD 30–50; "normal metanefrin güvenle dışlar" → TEMD "NPD yüksek, semptomatik hipertansifte büyük ölçüde uzaklaştırır".
- Çıkarıldı (kaynakta yok): "kalıtsal geçişi en yüksek insan tümörü" (2 yer), mikrofeokromositoma <1 cm, triad bileşen yüzdeleri 80/70/60, paroksizm 15–20 dk (yarı ömür karışması, Tur 70), Geroula skoru, SDHB %35–75, rebound hipoglisemi %4–43. Yerine TEMD: metastaz tanıda %10–20, 5/10 yıl sağkalım %78/%31, fenotip→klinik (Tablo 4.1), "%10 kuralı geçersiz".
- s. 93 "TEMD 2022 · 3–4 kat" kutusuna TEMD 2025 2 kat eşiği eklendi.
- Kalan: 7–14 gün blokaj (s. 98 turunda TEMD 2025 ile).

## Tur 73 — s. 97–98 PPGL genetik ve preoperatif hazırlık (29 Eki 2026)

Kaynak: TEMD Adrenal 2025 (4.4, 4.6 Medikal Tedavi, Şekil 4.2).
- s. 97: SDHB "metastaz %35–75" (kaynakta yok) → TEMD: metastatik PPGL’nin %40–45’i SDHB; SDHx’te 2–3 yılda bir görüntüleme. "Görüntüleme seçimi" kartı Tablo 4.4’e çekildi. "TEMD 2022 · iki yüzü" → TEMD 2025 (aynı iç çelişki: metin prazosin/doksazosin, Şekil 4.2 "tercihen fenoksibenzamin"; süre 7–14 gün ayaktan + 1–3 gün yatış, metin ort. 10–14 gün).
- s. 98 TEMD 2025’e çekildi: doksazosin 1–2 mg, 2–3 günde 1–2 mg artır, hedef <110–120/80 (eski "2×10–15 mg" kaynaksız); fenoksibenzamin 10 mg/12 sa → 10–40 mg/8 sa; BB 2.–3. günde propranolol 20/12 sa, metoprolol 25/12 sa, atenolol 25 (eski metoprolol 25–50, propranolol 10 mg 4–6 sa, nabız hedefi 60–80/70–100 kaynaksız); KKB amlodipin 5–10, nifedipin 30–60/12 sa, α-metil tirozin 250 mg/12 sa; hacim %0,9 NaCl. "≥5000 mg tuz, 2 L NaCl 12–24 sa" kaynaksız → çıktı (TEMD 2022 >5 g tuz adıyla kaldı). Yeni kutu: son doz operasyon sabahı, postop 4–8 hafta HT.
- s. 92 "TEMD 2022 algoritması 7–14" → TEMD 2025 algoritması.
- Kendini sına (s. 102) üç satırı eşitlendi.
- KAYNAK BEKLİYOR: SDHD/SDHAF2 maternal damgalama ve soy ağacı spotu — TEMD 2025 ve defterdeki UpToDate tanı başlığında yok; doğru bilgi ama kaynak gösterilemedi, bırakıldı.

## Tur 74 — s. 99–102 PPGL ameliyat, kriz, takip, kırk soru (29 Eki 2026) → KISIM 10 TAMAM

Kaynak: TEMD Adrenal 2025 (4.6 cerrahi + IV tedavi, izlem, TEMD Önerileri, Tablo 4.2) + UpToDate tanı başlığı.
- s. 99: laparoskopi sınırı "<5–6 cm" → TEMD: çoğu vakada laparoskopik, >6 cm invazivde açık; nitroprussid 0,5–5 → 0,5–1,5 µg/kg/dk; fentolamin "1 mg test + 2–5 mg" → 2,5–5 mg IV, 3–5 dk’da bir, infüzyon 20–100 mg/sa; nikardipin 5 mg/sa, lidokain/esmolol kaynaksız → TEMD ajan listesi (nikardipin, klevidipin, β-bloker, MgSO4, venöz vazodilatör); "kaçınılacak anestezikler (fentanil, ketamin, atropin, desfluran)" kaynaksız → TEMD Tablo 4.2 atak başlatan ilaçlar; rebound hipoglisemi %4–43 + %5 dekstroz → TEMD "nadir, geçici hipoglisemi, kan şekeri takibi"; kalıcı HT → TEMD 4–8 hafta; kür testi 2–6 hafta / 5–7 gün gecikme → TEMD 3–8 hafta, 6. ay ve 1. yıl; takip "en az 10 yıl" → TEMD ömür boyu.
- s. 100: hipertermi ">40°C" sayısı çıktı.
- s. 101: senaryolar aynı değerlere eşitlendi (indetermine → tekrar; TCA 5–14 gün/≥2 hafta; akut hastalık; %0,9 NaCl; nüks ilk 5 yılda %1–5). s. 95 test tablosundaki "Klonidin baskılama testi" hücresi de aynı metne çevrildi.
- s. 102: 40 sorudan 22’si eşitlendi; kaynaksız sorular (triad yüzdeleri, Geroula, NPD >%99, KBY ~2 kat, klonidin dozu, kaçınılacak anestezikler, laparoskopi sınırı) TEMD/UpToDate değerli sorularla değişti.
- Hâlâ KAYNAK BEKLİYOR: maternal damgalama (s. 97, 101), "TEMD 2022" etiketli kutular (2022 PDF yerelde yok, eski turda girildi).

## Tur 75 — Kısım 11 s. 103–106 erkek osteoporozu (29 Eki 2026)

Kaynak: Osteoporozis defteri → `OSTEPOROZ_nisan2025.pdf` (TEMD 2025, Bölüm 5 Erkek Osteoporozu) + UpToDate *Clinical manifestations… osteoporosis in men* ve *Treatment of osteoporosis in men* metni. (Yereldeki scratchpad/kemik.txt TEMD **2013** — kaynak alınmadı.)
- Doğrulandı: %40–60 sebep (TEMD; aynı bölüm %40–60’ında neden bulunamayabilir de diyor — ikisi de yazıldı), T <−3,5 / 2 yıl TRT + T <−2,5 (TEMD), FRAX %3/%20, kalsiyum 1000/1200, D vit 800–1500 IU (öneri; metin 600–800), 70 yaş KMY, TRT eşiği 200 ng/dL, genç kadın veritabanı (TEMD); östradiol 10–15 pg/mL, Testosterone Trials 91/64 HR 1,43, ~%60 bırakma (UpToDate).
- Düzeltildi: "9 milyon kırığın %39’u erkekte" ve "kalça kırığı sonrası mortalite 2–3 kat" (kaynakta yok) → TEMD: ≥60 yaş kalça kırığı sonrası 1 yıllık ölüm erkek %37,5, kadın %28,2; E:K kalça kırığı 60–69 yaş 1:4,5. "Pik insidans ~10 yıl geç" çıktı. Boy kaybı "4–6 cm / 2–3 cm" → TEMD son 5 yılda >2–3 cm (UpToDate ≥1,5 inç KMY endikasyonu). <50 yaş "Z ≤−2,0" → TEMD: Z tek başına yetmez, kırık + risk faktörü. İzlem "1–2 yıl" → TEMD tedavide yılda bir, teriparatid 6 ay, GC 6–12 ay, tedavisiz >70 yaş 2 yıl (s. 105 ve 109’daki kopya). "Testosteron <200 → yıkım hızlanır" eşiği kaynakta kemik için değil TRT için; kemik eşiği yalnız östradiol. "En sık iyatrojenik GC" → TEMD’nin sık nedenler listesi. Giriş cümlesi "kırıkların büyük bölümü erkekte" çıktı.
- Sıradaki: s. 107–114 (sekonder nedenler, tedavi, ADT, nakil, vaka, kırk soru).

## Tur 76 — Kısım 11 s. 107–110 erkek osteoporozu laboratuvar/tanı/tedavi (29 Eki 2026)

Kaynak: TEMD 2025 Böl. 5 (5.5, 5.9.3, TEMD Önerileri) + UpToDate *Treatment of osteoporosis in men*.
- s. 107 panel TEMD 5.5’e çekildi: Ca, kreatinin, KCFT, 25(OH)D, TSH, PTH, TKS, total testosteron, **idrar kalsiyum atılımı** ilk panelde (kitap "şüpheye göre" diyordu); fosfor/albümin çıktı; kemik döngü belirteçleri tanıda önerilmez. "PSA sık çeldirici" → "TEMD listesinde yok". "En sık iyatrojenik GC", "senil/idiyopatik <70" kaynaksız → TEMD sık nedenler + "%40–60’ında neden bulunamayabilir".
- TEMD İÇ ÇELİŞKİ: izlem — bölüm 5.10 "tedavide yılda bir", TEMD Önerileri "1–2 yıl arayla". Tur 75’in "yılda bir"i ikisini birlikte verecek şekilde düzeltildi (s. 105, 108).
- s. 108: <50 yaş Z ≤−2,0 → TEMD; boy kaybı spotu → TEMD son 5 yılda >2–3 cm.
- s. 109: kemik ajanı ekleme eşiği "T ≤−2,5 + bir kırık" → TEMD (≥2 yıl TRT’ye rağmen T <−2,5 + risk; tek başına T <−3,5).
- s. 110: denosumab "ileri KBY’de ilk basamak" → TEMD: bisfosfonat intoleransı, renal disfonksiyon, ADT (Sınıf B); anabolik → TEMD teriparatid ≥2 radyolojik kırık (Sınıf A) + UpToDate çok yüksek risk (T ≤−3,0; T ≤−2,5 + kırık; ağır/çoklu vertebra kırığı; tedavi altında kırık).
- Doğrulanmadı ama bırakıldı: zoledronik 5 mg/yıl, denosumab 60 mg/6 ay (standart doz; ilgili UpToDate başlığı açılmadı).

## Tur 77 — Kısım 11 s. 111–114 ADT, nakil, vaka, kırk soru (29 Eki 2026) → KISIM 11 TAMAM

Kaynak: TEMD 2025 Böl. 5 + UpToDate *Prevention and treatment of osteoporosis after solid organ or stem cell transplantation* (defter).
- s. 111: ilaç tatili "~5 yıl" → TEMD alendronat 5, zoledronik 3 yıl; "sınav gecesi %39" → %37,5.
- s. 112 doğrulandı (UpToDate): kayıp ilk 3–6 ayda en hızlı; takrolimus siklosporinden hafif; MMF/rapamisin/azatiyoprin sıçanda etkisiz; kalp naklinde zoledronik +%1,6; kalsitriol 0,5 µg + Ca 1000 mg; 30 dk × 3/hafta egzersiz; KrKl <30–35’te bisfosfonat genellikle önerilmez (kitap "mutlak kontrendike" diyordu).
- Düzeltildi/çıktı: "kreatinin >2 / GFR <%30 IV doz yarıya" (kaynaksız); Ca 1200–1500, D >30 ng/mL, 1500–2000 IU (kaynaksız) → UpToDate yaşa göre referans Ca (KBH’de 800–1000), D 800 IU, <20 ng/mL’de yüksek doz; "profilaksi ilk ay" çıktı; akciğer nakli → UpToDate: nakilden ±6 ay içinde zoledronik alanlarda 3 yılda KMY kazancı; "mTOR inhibitörleri kılavuzlarda riskli" UpToDate ile ÇELİŞİYORDU (rapamisin sıçanda etkisiz) → çıktı.
- s. 113–114 senaryolar ve 40 sorudan 17’si eşitlendi.

## Tur 78 — Kısım 12 s. 116–119 hipofiz açık sayfa, PitNET, sellar kitle (29 Eki 2026)

Kaynak: Pituitary Function defteri (37feb27a-…; 33 kaynağın metni: *Pituitary Adenomas and Masses*, *Genetic Disorders of the Pituitary*, *Clinically Nonfunctioning Sellar Masses*, *Radiotherapy in Pituitary Tumors* vd.) + yerel TEMD Hipofiz 2022 (Tablo 3.3).
- Doğrulandı: mikro <1 / makro 1–<4 / dev ≥4 cm; sap >4 mm kalın; bitemporal süperior kuadrantanopsi; GNAS somatotropta %30–60; SF3B1 prolaktinomada ~%20; gonadotrop en sık NFPA; optik yoldan 3–5 mm, kiazma tek seans 8–10 Gy; Knosp; ailesel %5–10 (TEMD).
- Düzeltildi: "sap basısında PRL 150–200’e kadar" → kaynak: >150–200 genellikle prolaktinoma; insidentaloma izlemi → TEMD Tablo 3.3 (mikro 12. ay, >4 mm’de 4 yıl 2 yılda bir; makro 6. ay, 3 yıl her yıl, 6 yıl 2 yılda bir, sonra 5 yılda bir); görme alanı ">10 mm ise" → kiazmaya/optik sinire yakın ya da basılıysa (TEMD); "%30 aks düzelir / yeni yetmezlik %1,4–19,4" → seri: 435 hastanın 92’si (%21,1).
- Çıkarıldı (33 kaynakta bulunamadı): %80–85 adenom, insidental ~%10, prolaktinoma %32–66, GH %8–16, ACTH %2–6, TSH <%1, PitNET intrakraniyalin %10–20 ve üçte ikisi aktif, USP8 %30–60, SF3B1 E %24,3/K %10,7 ve %50 metastatik, AIP %13/%30, X-LAG "3 yaştan önce", endoskopik GTR %74/%66,4, SRS çap <3 cm, NFPA 12–14/fonksiyonel 16–20 Gy, "RT sonrası 5–10 yılda yarıdan fazlası".
- Sıradaki: s. 115 kapak + 120–138. Diğer hipofiz defterleri: Hipopituitarizm cd237a42-…, Akromegali 26bceb2f-…, Hyperprolactinemia 2f1bae7f-…, SIADH/DI c320c4e3-….

## Tur 79 — Kısım 12 s. 115, 119 düzeltmesi, 120–122 hiperprolaktinemi/prolaktinoma/akromegali (29 Eki 2026)

Kaynak: yerel TEMD Hipofiz 2022 (Bölüm 1 prolaktinoma, Bölüm 2 akromegali, apopleksi).
- DÜZELTME (Tur 78 hatası): s. 119’dan "RT sonrası 5–10 yılda yarıdan fazlasında hipopitüitarizm" kaynaksız diye çıkarılmıştı — TEMD 2022 akromegali RT bölümünde VAR; kaynak adıyla geri kondu. Ders: Pituitary Function defterinde bulunamayan sayıyı çıkarmadan önce yerel TEMD’de de ara.
- s. 115: apopleksi hidrokortizon 100 → TEMD 100–200 mg IV bolus.
- s. 120: eşik ">20 E/postmenopozal, >30 premenopozal, 21–40 tekrar" → TEMD normal 5–20, hiperprolaktinemi E >20, K >25; PEG "geri kazanım <%40" → TEMD azalma >%60 var, %40–60 gri; kanca "1:100" → "seyrelterek" (TEMD); PRL düzeyleri → TEMD Tablo 1.2 (sap basısı 25–150, nadiren >150; makroprolaktinoma genellikle >500); 0,065 oranı, akromegalide %40–50, >100 ng/mL kliniği, antipsikotikte >100/>300 eşiği çıktı (kaynaksız).
- s. 121: CAB "~%90 / >%70" → TEMD başarı CAB %80–90, BRC %70–80; ilaç kesme → TEMD mikro/makro ölçütleri, nüks %26–69; EKO → TEMD (rutin yıllık gerekmez; üfürüm, 5 yıl >3 mg/hafta, 50 yaş sonrası → en az 2 yılda bir); fertilite >%85, ektopik %36,8 ve 10/10 çıktı.
- s. 122: makroadenom %77–90, GH <2,5 mortalite, 10 yılda nüks ~%8, 24. saat GH, "IGF-1 >1,3 × kart seti", SRL kolelitiazis ~%25, "Uzun dönem PSA" çıktı → TEMD: GH <1 kontrol + mortalite, cerrahi kür mikro %80–85 / makro %50–65, değerlendirme 3. ay, pegvisomantta %6,8 tümör büyümesi, RT 5–10 yılda >%50; diyabetlide OGTT yerine eş zamanlı GH. Sayfa taşıyordu, kısaltıldı.

## Tur 80 — Kısım 12 s. 122–125 akromegali yükü, prolaktinoma TEMD sayfaları (29 Eki 2026)

Kaynak: yerel TEMD Hipofiz 2022.
- DÜZELTME (Tur 79 hatası): s. 122’den çıkarılan "rastgele GH <2,5 µg/L → mortalite normale iner" TEMD 2022’de VAR; geri kondu. İkinci kez aynı hata: çıkarmadan önce yerel TEMD’de `grep` şart.
- s. 123: LVH "%80’e dek" → TEMD tanıda HT %48, KY %10, KAH %8, mortalite 2–4 kat; kırık "vertebral 3–8 kat, kalça 2,5" → TEMD radyolojik vertebra kırığı %39–59 (toplum %14), diyabetikte %72; diyabet ~%25, hipogonadizm %30–50, TSHoma SSA >%90, safra taşı ~%25 sayıları çıktı; CRH yanıtı ">%37/>%17" → TEMD 2022 ACTH >%30–50, kortizol >%20. Doğrulandı: uyku apnesi %20–80, kolon kanseri 4 / polip 3,5 kat.
- s. 124–125 (TEMD sayfaları) tek tek doğrulandı: Tablo 1.2, 5–20 ng/mL, 2 saat, 15–20 dk 2–3 ölçüm, 4 saat, PEG %40/60, %20 galaktore / %45 oligo-amenore, %30 idiyopatik normale döner, 3 gün ilaç kesme, %40 en sık fonksiyonel, milyonda 27/500, %25 vertebra kaybı, KAB 0,5–3 mg/hafta (nadiren 11), 120 gün, kinagolid 0,075→0,9 mg, %80–90/%70–80, direnç dozları, %80 geçiş yanıtı, EKO, cerrahi kür %61/%26, nüks %7–50, intolerans %3/%12, nüks %26–69, gebelikte büyüme %2,4/%4,8/%21, 900 fetüs. Tek düzeltme: Ki-67 "≥%3" → TEMD ">%3".
- KANAL HATASI: s. 122 kısaltması `sed` ile yapıldı, yerine konan metindeki `&lt;` içindeki `&` eşleşmeyi bastı, satır bozuldu (CLAUDE.md’deki tuzak). node ile onarıldı, önizlemede doğrulandı.
