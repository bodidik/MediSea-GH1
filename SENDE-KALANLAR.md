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

## 6. Küçük not: premium hesap

Veritabanında tek kullanıcı var (`denav38@gmail.com`) ve inşaat için
premium yapıldı. Geri almak istersen:

```bash
node web/scripts/plan-ver.cjs denav38@gmail.com free
```

Plan oturum açarken JWT'ye yazılıyor; değiştirdikten sonra çıkış/giriş
gerekiyor.
