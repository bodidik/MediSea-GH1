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

### Hiçbir yerden çağrılmayan bileşenler — ölçülmüş tam liste

66 bileşen dosyası tarandı, **20'si hiçbir yerden çağrılmıyor** (~72 KB).
Dinamik yükleme (`dynamic(() => import(...))`) tek yerde kullanılıyor ve
o bileşen bu listede değil, yani yanlış pozitif riski yok:

| Dosya | Boyut |
|---|---|
| `app/(ydus)/[lang]/premium/ydus/_endokrinoloji/hipofiz/akromegali/tedavi/akromegali-tedavi.tsx` | 12.9 KB |
| `components/AdminBar.tsx` | 7.2 KB |
| `app/components/PremiumQuizHistory.tsx` | 6.6 KB |
| `app/components/GuidelinesFilters.tsx` | 4.7 KB |
| `app/tools/components/AdBanner.tsx` | 4.2 KB |
| `components/ChildLinks.tsx` | 3.9 KB |
| `app/components/StrategyMap.tsx` | 3.7 KB |
| `app/components/SectionsFilters.tsx` | 3.6 KB |
| `app/components/SectionDetailFilters.tsx` | 3.1 KB |
| `components/UpgradeCTA.tsx` | 2.9 KB |
| `components/TableOfContents.tsx` | 2.6 KB |
| `app/components/StudyQuickActions.tsx` | 2.6 KB |
| `app/components/SectionsTable.tsx` | 2.4 KB |
| `app/components/HeaderClient.tsx` | 2.0 KB |
| `app/components/QuestionRun.tsx` | 1.4 KB |
| `app/components/LangSwitch.tsx` | 1.4 KB |
| `components/SecurePlayer.tsx` | 1.4 KB |
| `app/components/NavCard.tsx` | 1.3 KB |
| `app/components/PremiumQuizToday.tsx` | 1.0 KB |
| `components/topics/RelatedAside.tsx` | 0.9 KB |

Bir kısmı isminden belli ki ileriye dönük bırakılmış (`UpgradeCTA`,
`SecurePlayer`, `LangSwitch`, `AdBanner`) — ödeme hattı, video koruma,
çoklu dil ve reklam kararları verilince kullanılabilirler. Silme kararı
bu yüzden sende.

**Ölçümün sınırı:** tarama `export default function/class` kalıbını
arıyor; ok fonksiyonuyla dışa aktarılan bir bileşen varsa listede
görünmez. Yani liste eksik olabilir, ama içindekiler doğrulandı.

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

**2) Ebeveyn adı sapmış — 1 konu. ÇÖZÜLDÜ, sende iş yok.**

```
endokrinoloji/akromegali-ve-gigantizm
    parent: "Ön-hipofiz-hastaliklari-giris"
    gerçek dosya: "on-hipofiz-hastaliklari-giris"
```

Fark yalnızca büyük harf ve `Ö`. İçerik dosyasını düzeltmek yerine okuma
adımı onarıyor (`lib/slug-eslestir.ts`) — bu projede aynı yaklaşım
listelenmemiş premium konular için de kullanılıyor. Akromegali artık
ebeveyninin sayfasında alt başlık olarak görünüyor, "Diğer Konular"
kovasından çıktı (endokrinolojide 9 → 8).

Onarım gerçek eksikleri **gizlemiyor**: var olmayan bir ebeveyn ham hâliyle
kalıyor, kovaya düşüyor ve denetimde görünmeye devam ediyor. İstersen içerik
dosyasını yine de düzeltebilirsin; kod tarafı buna bağlı değil.

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

## 12. Feokromositoma konusu dolduruldu ama hâlâ gizli

`web/content/canonical/endokrinoloji/feokromositoma-ve-paraganglioma.json`
verdiğin akademik rehberle dolduruldu (8 bölüm, genetik küme tablosu,
preoperatif hazırlık akış şeması). İçeriğe dokunmadım, yalnızca HTML
kalıbına çevirdim.

**`hidden: true` olarak bıraktım** — hem bu konu hem ebeveyni
(`adrenal-medulla-hastaliklari`) gizli, yani bu dal senin bilinçli bir
kararınla henüz yayına kapalı görünüyor. Hazırsa açman tek satır:

```json
"hidden": false
```

hem bu dosyada hem `adrenal-medulla-hastaliklari.json`'da. Açarsan branş
sayfasında görünür olur ve site haritasına girer.

---

## 13. Kısaltma açılımı sözlüğü — genişletmen gereken tek yer

Konu sayfalarında kısaltmaları ilk kullanımda açılımıyla verme mekanizması
kuruldu (`web/app/lib/kisaltma.ts`), hem açık konu sayfası hem premium
konu gövdesi için. İçerik dosyalarına dokunulmadı; sözlük render tarafında.

**28 girdiyle başladı ve bilerek eksik.** Yalnızca açılımı tartışmasız
olanlar kondu (BT, KBH, TSH, PTH, GFR, SGLT2…). Bilerek dışarıda
bıraktıklarım — açılımı belirsiz olsaydı yanlış öğretirdi:

- bağlama göre değişenler: `CD`, `PD`, `CR`, `OS`, `AI`
- kurum adları: `KDIGO`, `ECOG`
- ilaç/gen adları: `PCSK9`, `DDAVP`, `JAK2`

Genişletmek için `kisaltma.ts` içindeki `KISALTMALAR` nesnesine satır
eklemen yeterli, başka hiçbir yer değişmiyor:

```ts
XYZ: "açılımı",
```

**Kapsam bilerek dar:** quiz, flashcard ve vaka dosyalarına hiç
uygulanmıyor — onlar ölçme içeriği, kısaltmayı açmak sınav sorusunun
cevabını peşinen verir. Tablolara da uygulanmıyor, dar hücrede taşma
üretiyor.

---

## 14. Küçük not: premium hesap

Veritabanında tek kullanıcı var (`denav38@gmail.com`) ve inşaat için
premium yapıldı. Geri almak istersen:

```bash
node web/scripts/plan-ver.cjs denav38@gmail.com free
```

Plan oturum açarken JWT'ye yazılıyor; değiştirdikten sonra çıkış/giriş
gerekiyor.

---

## 15. Hiçbir kodun okumadığı 12 premium soru

`content/premium/ydus/questions/` altında **12 dosya** var (11'i MEN1
soruları, 1'i nefroloji) ve depoda bu dizini okuyan tek bir satır yok.
Yazılmış, ~29 KB emek harcanmış premium içerik arayüzden ulaşılamıyor.

Bu, listedeki öteki yetim dosyalardan FARKLI bir durum: onlarda konu
dosyası eksik, burada dizinin kendisi okunmuyor. Yani konu dosyası yazmak
çözmez.

Sebep şema ayrışması:

| | `questions/` (okunmayan) | `quizzes/` (okunan) |
|---|---|---|
| Yapı | dosya başına TEK soru | tek dosyada dizi |
| Alanlar | `question`, `options`, `answer`, `explanation` | `metin`, `secenekler`, `dogru`, `aciklama_kisa` |
| Ek alanlar | `accessLevel`, `difficulty`, `status`, `tags` | `zorluk`, `etiketler`, `kaynak` |

Üç seçenek var, üçü de senin kararın:

1. **Dönüştür** — 12 soruyu `quizzes/<branş>/men1-quiz-1.json` biçimine
   taşı. Kazanç: 12 soru kullanılabilir hâle gelir. Alan eşlemesi
   mekanik ama `secenekAciklamalari` gibi karşılığı olmayan alanlar
   boş kalır.
2. **Sil** — içerik başka yerde tekrarlanıyorsa.
3. **Bırak** — ileride bu şemayı okuyacak bir yüzey planlıyorsan.

Denetim artık bunu raporluyor:

```bash
node web/scripts/yetim-denetim.cjs
```

Not: ilk ölçümde `cases/` dizini de yetim sanılmıştı; oysa soru çözüm
kokpiti onu okuyor. Kodda `"questions"` bir ALAN adı olarak da geçtiği
için grep yanıltıyor — denetimdeki okunan-dizin listesi bu yüzden elle
tutuluyor ve yeni dizin eklerken güncellenmeli.

---

## 16. Paylaşım bağlantısı değerleri taşımıyor (özellik kararı)

Araç sayfalarındaki paylaş düğmesi bir dönem hesaplanan değerleri adrese
yazıyordu (`?scr=2.5&age=70&sex=female`). **Ölçüldü: 111 araçta bu düğme
var ve parametreleri geri okuyan araç sıfır** — ne sayfa, ne düzen, ne
metadata, ne paylaşım kartı.

Sonuç yalnızca çalışmayan bir özellik değil, yanıltıcıydı. Canlıda
ölçülen hâli:

```
/tools/egfr?scr=2.5&age=70&sex=female
  → sayfa varsayılan 1.0 / 45 / erkek ile açılıyor
  → 94.6 (G1 — Normal) gösteriyor
  → oysa paylaşılan değerler ≈21, yani G4
```

Meslektaşına "hastamın eGFR'si" diye bu bağlantıyı gönderen biri, karşı
tarafa hastanın durumunun **tersini** göstermiş oluyordu. Bağlantı
değerleri taşıdığı için güvenilir görünüyordu.

Şimdilik bağlantı **değer taşımıyor** ve düğme metni de buna göre
düzeltildi ("BULGULARI PAYLAŞ" → "ARACI PAYLAŞ"; kopyalandı bildirimi
artık "Girdiğin değerler bağlantıyla taşınmaz" diyor).

**Karar senin:** değerlerin gerçekten taşınmasını istiyor musun?

- İstiyorsan: her aracın kendi durumunu adresten okuması gerekiyor
  (`useState` başlangıç değerini sorgu dizesinden almak). 111 araç, her
  birinin durumu farklı — mekanik ama uzun bir iş. `ToolShare`'in `params`
  imzası bu yüzden BIRAKILDI, çağrı yerleri hâlâ değerleri geçiriyor.
- İstemiyorsan: `params` prop'u ve 111 çağrı yerindeki `params={...}`
  temizlenebilir.

Klinik değerlerin adres çubuğuna yazılması ayrıca gizlilik açısından da
düşünülmeli: adresler tarayıcı geçmişine, sunucu günlüklerine ve
paylaşıldığı yere (WhatsApp, e-posta) düz metin olarak giriyor.

---

## 17. Vaka motorunda bitiş ekranı yok (tasarım kararı)

Üç premium motorun çalışma akışı geçici bir dev rotasıyla uçtan uca
ölçüldü. İkisi tam, birinde bir eksik var.

| motor | akış | bitiş ekranı | ilerleme kaydı |
|---|---|---|---|
| QuizEngine | ✓ | ✓ "%70 · 7 doğru · 3 yanlış" + yanlışları tekrar çöz | ✓ |
| FlashcardPlayer | ✓ | — (sayaç sürekli görünüyor) | ✓ işaretler korunuyor |
| **VakaEngine** | ✓ | **YOK** | yok |

Vakada son adım cevaplandıktan sonra kullanıcı yalnızca o adımın
açıklamasını ve "← Konuya dön" bağlantısını görüyor. Kaç adımı doğru
bildiğini söyleyen bir kapanış yok.

Quiz motorunda bu ekran var ve iyi çalışıyor; vakada olmaması bir
tutarsızlık. Ama yeni bir ekran eklemek tasarım kararı olduğu için
yapılmadı — senin çağrın:

1. **Quiz'deki gibi bir kapanış ekle** — "2 adımda 1 doğru" + yanlış
   adımları tekrar gözden geçirme bağlantısı.
2. **Olduğu gibi bırak** — vakalar kısa (11 dosyada toplam 35 adım,
   ortalama ~3) ve amaç puanlamak değil klinik akıl yürütmeyi göstermek
   olabilir.

İlerleme kaydı da yok: kullanıcı vakanın ortasında ayrılırsa yerini
kaybediyor. Kısa vakalarda savunulabilir, ama kapanış ekranı eklenirse
bununla birlikte düşünülmeli.

Not: vaka motorunun geri bildirimi quiz'den DAHA iyi — kullanıcının yanlış
seçimini ✗, doğru cevabı ✓ ile birlikte işaretliyor. Quiz yalnızca doğruyu
işaretliyor.

---

## 18. Yetim 13 klinik inci — denetim artık görüyor

`content/premium/ydus/pearls/` altındaki **iki dosyanın ikisi de yetim**:
konu dosyaları yok, yani 13 incinin tamamına arayüzden ulaşılamıyor.

```
pearls/hematoloji/aml.json           → topics/hematoloji/aml.json YOK          (10 inci)
pearls/nefroloji/lupus-nefriti.json  → topics/nefroloji/lupus-nefriti.json YOK ( 3 inci)
```

Bu, listedeki 15. maddedeki (`questions/`) durumdan FARKLI: orada dizini
hiçbir kod okumuyordu, burada kod okuyor ama konu dosyası olmadığı için
sayfaya giden bağlantı hiç kurulmuyor. Çare de farklı — konu dosyasını
yazmak yeterli.

Not: `hematoloji/aml` zaten listede yetim olarak duruyordu (quiz ve kart
dosyaları da öksüz). Yani o konu için **quiz + kart + inci** üçü birden
yazılmış ama konu dosyası hiç açılmamış.

Denetim bunu bir süre GÖRMÜYORDU: `pearls` türü listede yoktu, yalnızca
quizzes/flashcards/vakalar denetleniyordu. Eklendi:

```bash
node web/scripts/yetim-denetim.cjs
```
