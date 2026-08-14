# Sende kalanlar

Otonom çalışma sırasında bulunan ama **senin kararını ya da bilgini
gerektirdiği için dokunmadığım** işler. Hepsi bu belgenin yazıldığı gün
yeniden doğrulandı.

Kod tarafındaki kusurlar zaten kapatıldı; buradakiler içerik, hukuk ve
ürün kararları.

---

## 1. İki konu başlığı yanlış (öncelikli)

Dosya adı ile içindeki başlık farklı konuları anlatıyor:

| Dosya | İçindeki başlık |
|---|---|
| `web/content/canonical/hematoloji/akut-lenfoblastik-losemi-all.json` | "Miyelodisplastik Sendromlar (MDS)" |
| `web/content/canonical/endokrinoloji/hiperkalsemi-ve-hiperparatiroidi.json` | "Asit-Baz Denge Bozuklukları" |

**Neden önemli:** başlık üç yere birden gidiyor — sayfa `<title>`'ı, arama
sonucundaki satır ve paylaşım kartı. ALL bağlantısına tıklayan okuyucu MDS
başlıklı bir sayfa görüyor. Tıbbi bir kaynakta bu, güveni doğrudan yaralar.

Metnin kendisi hangi konuya aitse ya başlığı ya dosya adını ona göre
düzeltmek gerekiyor — hangisinin doğru olduğunu içeriği bilen sen
söyleyebilirsin.

---

## 2. Beş premium konuda ilan edilen sayılar dosyalarla tutmuyor

`istatistikler` alanı gerçek dosyalarla uyuşmuyor:

| Konu | İlan | Gerçek |
|---|---|---|
| `endokrinoloji/graves-hastaligi` | 10 soru | quiz dosyası **yok** |
| `hematoloji/kml` | 12 kart | kart dosyası **yok** |
| `hematoloji/aml-ana` | 24 soru | 9 |
| `endokrinoloji/hashimoto-tiroiditi` | 7 soru | 10 |
| `gogus-hastaliklari/hkp` | 10 soru | 11 |

**Arayüz artık bu ilana bakmıyor** — sayılar dosyalardan sayılıyor ve
bağlantı yalnızca dosya gerçekten varsa kuruluyor, yani kimse boş bir
quize düşmüyor. Ama içerik verisi hâlâ yanlış duruyor.

İlk ikisi için karar senin: ya eksik quiz/kart dosyalarını ekle, ya da
`istatistikler` içindeki sayıyı sıfırla.

---

## 3. Sınav tarihi girilmedi

`web/content/sinav-takvimi.json` boş. Geri sayım ve sınava çakılı çalışma
planı hazır ama tarih olmadan **hiçbir şey göstermiyorlar** — yanlış tarihe
göre program yapan aday gerçekten zarar göreceği için tarih uydurulmadı.

ÖSYM takvimi açıklanınca tek satır yeterli:

```json
{ "sinavlar": [{ "ad": "YDUS 2027 · Dahiliye", "tarih": "2027-04-11" }] }
```

Geçmiş tarihler kendiliğinden elenir, en yakın gelecek sınav seçilir.
Premium panoda bu eksikliği hatırlatan bir not var; **yalnızca sana**
görünüyor.

---

## 4. Hukuk ve kurumsal sayfalar yok

`/privacy`, `/terms`, `/about`, `/contact` — dördü de 404. Alt bilgideki
bağlantıları kaldırdım, çünkü var olmayan bir hukuk metnine bağlantı
vermek, bağlantı vermemekten kötü.

**Ödeme almadan önce yazılmaları gerekiyor** (KVKK aydınlatma
yükümlülüğü). Aynı sebeple `/uyelik` sayfasına ön kayıt formu koymadım:
aydınlatma metni yayımlanmadan e-posta toplamak kişisel veri işlemek olur.

`about` sayfası ayrıca arama motoru açısından değerli: tıbbi içerikte
"bunu kim yazıyor" sorusunun cevabı sıralamaya giriyor.

---

## 5. Eski premium sayfaları (5 klasör) ulaşılamaz durumda

`web/app/(ydus)/[lang]/premium/ydus/_endokrinoloji`, `_hematoloji`,
`_romatoloji`, `_gastroenteroloji`, `_nefroloji` — altı çizgi önekli
klasörleri Next rotaya hiç almıyor. İçlerinde 190 KB'ın üzerinde elle
yazılmış sayfa var (akromegali 37 KB, riedel tiroiditi 19 KB…).

**Silmedim.** Konular açık kütüphanede farklı slug'larla mevcut (akromegali
→ `akromegali-ve-gigantizm`, DKA → `diyabetik-ketoasidoz-ve-hhs`), yani
içerik kayıp değil; bu sayfalar JSON sistemine geçilmeden önceki eski
sürümler. Ama metinleri kütüphanedekinden zengin olabilir — hangisinin
daha iyi olduğu senin kararın.

**Uyarı:** klasör adındaki alt çizgiyi kaldırmak bunları yayına almaz,
aksine bozar. `endokrinoloji` adında sabit bir klasör, çalışan
`[branch]` dinamik rotasını gölgeler. Yayına almak istersen ayrı bir yol
(`/arsiv/...` gibi) gerekiyor; söyle, yaparım.

---

## 6. Üç yetim içerik dosyası — 159 kayıt kimseye görünmüyor

Quiz/kart dosyası var ama ait olduğu **konu dosyası yok**. Konu dosyası
olmadan bu içeriğe arayüzden ulaşmanın hiçbir yolu yok:

| Dosya | Beklenen konu | İçindeki |
|---|---|---|
| `quizzes/hematoloji/aml-quiz-1.json` | `topics/hematoloji/aml.json` | 10 soru |
| `flashcards/endokrinoloji/akromegali.json` | `topics/endokrinoloji/akromegali.json` | 79 kart |
| `flashcards/nefroloji/hiperf-kbh.json` | `topics/nefroloji/hiperf-kbh.json` | 70 kart |

**Neden fark ettim:** satış sayfasının üst yazısı "362 soru" derken panonun
kendisi "352" diyordu — aynı sayfada iki yüzey aynı sayıyı farklı söylüyordu.
Farkın tamamı bu yetim dosyalardı. Sayaç artık yalnızca ulaşılabilir içeriği
sayıyor, yani **sayılar düzeldi**; ama içeriğin kendisi hâlâ orada duruyor
ve görünmüyor.

İlk ikisi dikkat çekici: `aml-quiz-1` muhtemelen `aml-ana`'nın eski
sürümü (aynı branşta `aml-ana-quiz-1.json` da var). `akromegali` ise 79
kartlık bitmiş bir set — açık kütüphanede `akromegali-ve-gigantizm` diye bir
konu var, premium tarafta karşılığı yok.

Karar senin: ya konu dosyalarını yaz (içerik zaten hazır, tek eksik konu
kabuğu), ya da dosyaları kaldır. Listeyi her zaman şuradan alabilirsin:

```bash
node web/scripts/yetim-denetim.cjs
```

---

## 7. Arama sonucundaki başlıklar — iki karar

411 konu sayfasının Google'da nasıl göründüğünü ölçtüm. Açıklamalar iyi
durumda (boş olan yok, 11 sayfanın taslak uyarısını açıklama diye
göstermesi düzeltildi). Başlıklarda ise senin kararını gerektiren iki şey
var — başlık konunun kimliği olduğu için dokunmadım.

**a) 14 başlıkta "Ch NN:" kitap bölüm numarası var.**

Arama sonucunda şöyle görünüyorlar:

```
Ch 84: Meme Kanseri-PH · MediSea
Ch 328: Nütrisyonel Destek Tedavisi · MediSea
```

Numara Harrison bölüm sırası ve içeri aktarımdan kalmış görünüyor; tıbbi
bir anlam taşımıyor ama arama sonucundaki ilk izlenimi belirliyor. Sekizi
ayrıca `-PH` ekiyle bitiyor — ne anlama geldiğini bilmediğim için ona hiç
dokunmadım.

Tam liste: `klinik-nutrisyon` altında 5, `onkoloji` altında 9 konu.
Başlıklardan bu öneki kaldırmamı istersen söyle; başlık 6'dan fazla yüzeyde
okunduğu için (sayfa, paylaşım kartı, ilgili konular, kütüphane, arama,
çalışma alanı) hepsini birlikte güncellemek gerekiyor — yarısını
düzeltmek tutarsızlık üretir.

**b) 169 başlık arama sonucunda kesiliyor.**

Google başlığı ~60 karakterde kesiyor; site şablonu " · MediSea" olarak 10
karakter ekliyor. 411 başlığın 169'u bu sınırı aşıyor, yani okuyucu
başlığın sonunu göremiyor. En uzunu 97 karakter:

```
Ektopik ACTH Sendromu: Etiyopatogenez, Hücresel Tanı Kriterleri ve …
```

Bu, içeriğin kendi başlığı olduğu için tamamen senin alanın. Kısaltmak
istersen ölçütü basitçe şöyle koyabilirsin: iki nokta üst üsteden sonraki
kısım genellikle alt başlık; onu içerik gövdesine taşımak başlığı 60'ın
altına indiriyor.

---

## 8. Express arka ucu canlıda yok — 16 uç dürüstçe reddediyor

`server/` (Express + MongoDB) hiç dağıtılmamış. Vercel'de yalnızca `web/`
çalışıyor, dolayısıyla arka uca bağlı her uç boşa çıkıyor.

Bir dönem bu uçlar **uydurma veri ve sahte başarı** dönüyordu: olmayan
sınav geçmişi, olmayan günlük program, "sonuçlarınız kaydedildi" mesajları.
Hepsi temizlendi; artık dürüstçe `503 { ok:false, reason:"backend-unavailable" }`
diyorlar.

**Bu maddenin ilk hâli fazla genişti — düzeltildi.** Uçların hangi arayüz
tarafından çağrıldığı tek tek ölçülünce tablo çok küçüldü:

| Uç | Arayüzde çağıran | Durum |
|---|---|---|
| `/api/ai/ask` | premium konu sayfası, "Bu konuya soru sor" | **gerçekten kırık** |
| `/api/review/seed` | `AddToSRButton` (yönetici paneli + ölü bileşen) | yönetici işi |
| `/api/topics/search` | yalnızca yönetici içerik paneli | yönetici işi |
| `/api/premium/quiz/history` | `PremiumQuizHistory` — **hiçbir yere monte değil** | ölü kod |
| `/api/premium/daily-program` | `PremiumDailyProgram` — **hiçbir yere monte değil** | ölü kod |
| `/api/user/*`, `/api/protected/*`, `/api/review/*` (diğer) | çağıran yok | ölü kod |

**Site içi arama ÇALIŞIYOR** — ilk yazdığımda kapalı sanmıştım. Başlıktaki
arama kutusu `/api/topics/search`'ü değil, dosya sistemini okuyan bir sunucu
eylemini (`searchAction` → `searchContent`) kullanıyor. Canlıda "anemi"
araması gerçek sonuç döndürüyor.

Yani kullanıcının karşılaştığı **tek kırık özellik, premium konu
sayfasındaki AI soru kutusu.** Hata metni düzeltildi (eskiden müşteriye
"Backend çalışıyor mu?" diye soruyordu), ama kutu hâlâ çalışır görünüyor.

Karar senin, üç seçenek:
1. `server/` bir yere dağıtılıp `BACKEND_URL` verilir → kutu çalışır.
2. Kutu premium konu sayfasından kaldırılır → kimse boşa denemez.
3. Kutu kalır ama "yakında" olarak işaretlenir.

Ayrıca **ölü kod** olarak duran bileşenler ve uçlar var (yukarıdaki tabloda
"ölü kod" satırları). Bunları silmek istersen söyle; kendi başıma
silmedim, ileride kullanılmak üzere bırakılmış olabilirler.

---

## 9. Ödeme hattı henüz yok — karşılıksız iki vaat kaldırıldı

Projede **hiçbir ödeme sağlayıcısı entegrasyonu yok** (web ve server'da
arandı: iyzico, stripe, paddle, paytr, checkout — sıfır sonuç). Çalışan bir
plan yükseltme akışı da yok.

Buna rağmen iki yüzey ödeme vaat ediyordu; ikisi de kaldırıldı:

- **Kayıt sayfası** tam dönüşüm anında "1 ay ücretsiz, sonrasında düşük
  aylık ücret" diyordu. Ne bir fiyat belirlenmişti, ne de tahsil edecek bir
  akış vardı; üstelik `/uyelik` sayfası hiçbir aylık ücretten söz etmiyor,
  yani iki yüzey birbiriyle de çelişiyordu. Yerine hesabın BUGÜN gerçekten
  sağladığı şey yazıldı: vurgu ve notların cihazlar arasında taşınması.
- **Profil sayfasındaki "Yükselt" düğmesi** `/api/plan/upgrade` ucuna POST
  atıyordu; o uç yok, canlıda 404. Kullanıcı düğmeye basıp "Yükseltme
  işlemi başarısız oldu" görüyordu. Kart kaldırılmadı ama artık olmayan bir
  işlemi tetiklemiyor, `/uyelik` sayfasına götürüyor.

**Fiyat ve koşul UYDURULMADI** — ikisi de senin kararın. Konuştuğumuz model
(kişisel katman ödeme hattı, YDUS mevsimlik yüksek bilet) henüz koda
girmedi.

Ödeme almaya karar verdiğinde 4. maddedeki hukuk metinleri (KVKK aydınlatma,
mesafeli satış, iade) ondan ÖNCE hazır olmalı.

---

## 10. Kütüphanenin %11'i hiyerarşiden düşmüş — 46 konu

Bir konu `meta.parent` ile üst başlığa bağlanıyor. Ebeveyn bulunamazsa konu
ne ana listeye giriyor ne de ebeveyninin sayfasından bağlantı alıyor. Branş
sayfası bunu onarıyor ("Diğer Konular" altında listeliyor), yani **hiçbir
şey kaybolmuyor** — ama düzen bozuluyor. En çarpıcısı gastroenteroloji:
34 konunun yalnızca **2'si** ana başlık, **13'ü** bu kovada.

Denetimi istediğin zaman çalıştırabilirsin:

```bash
node web/scripts/asili-denetim.cjs
```

46 konu üç sınıfa ayrılıyor ve **üçünün çaresi farklı**:

**1) Ebeveyn var ama gizli — 18 konu.** Üst başlık dosyası yazılmış ama
`meta.hidden` taşıyor. `hidden` kalkarsa 18 konu tek hamlede hiyerarşiye
döner:

| Gizli üst başlık | Altına dönecek konu |
|---|---|
| `gastroenteroloji/ozofagus-hastaliklari` | 7 |
| `endokrinoloji/reproduktif-endokrinoloji-ana` | 5 |
| `gastroenteroloji/viral-hepatitler` | 3 |
| `endokrinoloji/kalsiyum-metabolizmasi-ana` | 2 |
| `gastroenteroloji/pankreas-hastaliklari` | 1 |

Bunları bilerek mi gizledin (içerik hazır değil diye), yoksa unutuldu mu —
bilmiyorum, o yüzden dokunmadım. Hazırsalar en ucuz kazanç burada.

**2) Ebeveyn adı sapmış — 1 konu.** Dosya var, referans tutmuyor:

```
endokrinoloji/akromegali-ve-gigantizm
    parent: "Ön-hipofiz-hastaliklari-giris"
    gerçek dosya: "on-hipofiz-hastaliklari-giris"
```

Büyük harf ve `Ö` farkı. Tek karakterlik bir düzeltme.

**3) Üst başlık hiç yazılmamış — 27 konu.** Bunlar için önce o başlığı
yazman gerekiyor; hangi konunun nereye gireceği tıbbi bir sınıflandırma
kararı, bu yüzden ben karar vermedim:

| Yazılmamış üst başlık | Bekleyen konu |
|---|---|
| `kardiyoloji/kardiyoloji-genel` | 6 |
| `hematoloji/benign-hematoloji` | 5 |
| `klinik-nutrisyon/nutrisyon-hastaliklari` | 5 |
| `kardiyoloji/farmakoloji-statin-miyopatisi-sams` | 3 |
| `hematoloji/anemiler-genel-bakis` | 2 |
| …ve 6 başlık daha, 1'er konu | 6 |

Dikkat: `kardiyoloji-genel` altında bekleyenler arasında **Akut Koroner
Sendromlar** var — kütüphanenin en temel başlıklarından biri, şu an
"Diğer Konular" kovasında.

---

## 11. Küçük not: premium hesap

Veritabanında tek kullanıcı var (`denav38@gmail.com`) ve inşaat için
premium yapıldı. Geri almak istersen:

```bash
node web/scripts/plan-ver.cjs denav38@gmail.com free
```

Plan oturum açarken JWT'ye yazılıyor; değiştirdikten sonra çıkış/giriş
gerekiyor.
