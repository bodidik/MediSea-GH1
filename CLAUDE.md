# MediSea — proje notları

Dahiliye asistanları ve uzmanları için tıp eğitim platformu. İki paket:

| Dizin | Ne | Çalıştırma |
|---|---|---|
| `web/` | Next.js 15 (App Router) — site, premium YDUS, klinik hesaplayıcılar | `npm run dev` (port 3000) |
| `server/` | Express + MongoDB — arka uç API | `npm start` (port 4000) |

İçerik dosya sisteminde durur, veritabanında değil:
`web/content/canonical/<branş>/<konu>.json` (açık site) ve
`web/content/premium/ydus/{topics,quizzes,flashcards,pearls}/<branş>/…` (premium).

---

## Komutlar ve doğrulama

```bash
cd web
npm run dev        # geliştirme
npm run lint       # CI 2. kapı
npm run typecheck  # CI 3. kapı
npm run build      # CI 4. kapı
```

CI (`.github/workflows/ci.yml`) her push ve PR'da sırayla
`npm ci → lint → typecheck → build` çalıştırır. Dördü de geçmeden birleştirme yapma.

**Canlı `next dev` varken derleme doğrulaması:**

```bash
NEXT_DIST_DIR=.next-verify npm run build
```

`next build` normalde `next dev` ile aynı `.next` dizinini ezip geliştirme
sunucusunu bozar. `next.config.js` bunun için env ile ayarlanabilir bir
`distDir` tutar. İşin bitince `.next-verify`'ı sil.

### ⚠ `npm ci` çalışan geliştirme ortamında kullanma

`npm ci`, **`--dry-run` verilse bile** `node_modules` dizinini siler. Bir kez
"zararsız bir kontrol" diye çalıştırıldı ve kurulumu 161 pakete budadı,
`node_modules/.bin` boşaldı, `lint`/`typecheck` "kod hatası" gibi görünen
şekilde düştü. Kilit dosyasının `package.json` ile uyumunu sınamak
istiyorsan manifest karşılaştırmasıyla yap; onarım gerekirse
`npm install` kullan (`npm ci` dev sunucusu dosyaları tuttuğu için
Windows'ta EPERM verir).

---

## Bilinmesi gereken yapılandırma tuzakları

Bunların hepsi gerçekten yaşandı; tekrar etmesin diye yazıldı.

**`web/tsconfig.json` Expo'yu miras almamalı.** Bir dönem
`"extends": "expo/tsconfig.base"` vardı. Web tarafı Next.js, Expo değil.
Üstelik bu bağ proje içinde çözülmüyor, Node yukarı yürüyüp
`C:\Users\<kullanıcı>\node_modules\expo\` paketini buluyordu. Expo tabanı
`customConditions: ["react-native"]` enjekte ediyor, buradaki
`moduleResolution` ile çakışıyor ve **`tsc` yapılandırma hatasında durup
hiçbir dosyayı denetlemiyordu.** Tip denetiminin gerçekten çalıştığından
şüphelenirsen kasten hatalı bir dosya koyup yakalandığını doğrula.

**`.eslintrc.js` silinmemeli.** Yoksa `next lint` etkileşimli soru sorar ve
CI'da adım düşer. İçinde `react/no-unescaped-entities` kapalıdır: uygulama
metni Türkçe, kesme işareti her yerde geçiyor. Kuralın yakaladığı gerçek
tehlike olan kaçırılmış `<` ve `>` karakterlerini TypeScript zaten sözdizimi
hatası olarak verir.

**`web/next.config.js`** üç iş yapar: `output: 'standalone'` (Dockerfile'ın
runner aşaması `.next/standalone` bekler), `outputFileTracingRoot: __dirname`
(Next, birden fazla lockfile görünce çalışma alanı kökünü **projenin dışına**
seçiyordu) ve yukarıdaki `distDir` kaçışı.

**Dockerfile'ın builder aşamasında `NODE_ENV=production` ayarlama.** npm o
zaman devDependencies'i atlar; `typescript`, `tailwindcss`, `postcss`,
`autoprefixer` devDependency ve `next build` onlarsız çalışmaz.

---

## Çalışma araçları (vurgulama · not · tekrar)

Kullanıcının kendi işaretlemelerinden beslenen çalışma döngüsü:
**oku → vurgula → tekrar et → kaynağa dön.** Tamamı tarayıcıda
(`localStorage`) durur, sunucu gerektirmez.

### Bir sayfayı vurgulanabilir yapmak

İçeriği saran elemana `data-readable` ekle. Aynı sayfada birden fazla
bağımsız bölüm varsa **her birine kimlik ver**:

```tsx
<div data-readable>…</div>                    {/* tek bölüm */}
<div data-readable={`soru:${soru.id}`}>…</div> {/* içerik değişen sayfa */}
```

Kimlik şart, çünkü soru çözüm gibi sayfalarda **yol değişmeden içerik
değişir**; sıra numarası orada yanlış içeriğe yapışır. Değersiz yazılan
`data-readable` DOM'a `"true"` olarak basılır ve kimlik SAYILMAZ (bkz.
`keyOf`) — aksi halde iki değersiz konteyner çakışırdı.

Şu an bağlı yüzeyler: konu detayı, premium YDUS konu sayfası, inciler
(`pearl:<id>`), soru çözüm açıklaması (`soru:<id>`).

### Dosyalar

| Dosya | Sorumluluk |
|---|---|
| `app/lib/reading-marks.ts` | Vurgu konumlandırma (konteyner kimliği + karakter ofseti), `<mark>` boyama/sökme |
| `app/lib/study-index.ts` | Not ve vurguları tek listede toplama, başlık dizini |
| `app/lib/review-deck.ts` | Kart üretimi, SM-2 benzeri takvim, çalışma günlüğü |
| `app/lib/study-backup.ts` | Kayıpsız JSON yedek: dışa aktar / kuru prova / birleştir |
| `app/components/ReadingTools.tsx` | Seçim araç çubuğu + vurgu paneli |
| `app/components/NotePanel.tsx` | Kenar not defteri (yazı + kalemle çizim) |
| `app/components/StrokePreview.tsx` | Vuruşları SVG'ye basar (önizleme ve tekrar kartı aynı veriden) |

Sayfalar: `/calisma-alanim` (toplu görünüm, kapsama, yedekleme),
`/tekrar` (tekrar oturumu).

### Depo anahtarları

```
medisea:marks:v2:<yol>    vurgular            medisea:review:v1   tekrar takvimi
medisea:notes:v1:<yol>    not + çizim         medisea:log:v1      günlük çalışma
medisea:index:v1          yol → başlık        medisea:hint:…      tanıtım kartı
```

Sürüm eki şema değişince artar. `study-backup.ts` hepsini tek dosyada taşır;
Markdown dışa aktarımı **kayıplıdır** (çizim ve takvim gitmez).

`Backup` tipine yeni bir depo anahtarı eklemeyi unutmak sessiz veri kaybıdır:
`log` bir dönem tipte yoktu, `medisea:kartlar:v1:*` (flashcard "biliyorum"
işaretleri) de öyleydi — yedek de senkron da onları düşürüyordu.

Yeni anahtar eklerken **ALTI yeri birden** güncelle: `Backup` tipi ·
`readAll` · `parseBackup` (eski yedeklerde alan YOKTUR, boş nesneye düşmeli;
yoksa eski bir yedeği geri yüklemek içe aktarmayı tümden düşürür) ·
`applyImport` birleştirme dalı · `applyImport` **"üzerine yaz" silme listesi**
(`VERİ_ONEKI`) · `write`.

Altıncısı en kolay kaçandır ve sessizdir: silme listesine girmeyen anahtar,
"üzerine yaz" kipinde silinmez, üstüne yenisi yazılır — yani kip adının
söylediği şeyi yapmaz, eski kayıtlar hayalet gibi kalır.

**Birleştirme kuralı alanın anlamına göre seçilir.** Notlarda "yeni olan
kazanır" doğru, kart işaretlerinde YANLIŞ: "biliyorum" tek yönlü bir bilgi,
iki cihazda farklı kartlar işaretlenmişse ikisi de doğrudur. Orada birleşim
(`new Set`) gerekiyor; "yeni kazanır" deseydik telefonda işaretlenenler
tabletten gelen yedekle silinirdi.

Doğrulaması tarayıcıda ve gerçek dosya girdisiyle yapılır: `DataTransfer`
ile `File` kurup `input[type=file]`'a atamak React'in `onChange`'ini
tetikliyor, yani içe aktarma yolu uçtan uca sınanabiliyor. Sınanacak dört
durum: dışa aktarımda sayı, birleşimde çiftlenmeme, **alanı olmayan eski
yedek**, "üzerine yaz"da eski anahtarların gerçekten silinmesi.

**DÖRDÜ DE CANLIDA ÖLÇÜLDÜ — sınıf kapalı.** Altı depo anahtarı tohumlanıp
gerçek arayüzle sınandı:

| durum | sonuç |
|---|---|
| dışa aktarım | altı alan da var, sayılar tutuyor (1 yolda 2 vurgu, 1 not, 1 tekrar, 1 gün, 1 kart seti) |
| eski yedek (`kartlar` alanı YOK) | ayrıştırıldı, plan gösterildi, beş alan geri yüklendi — düşmedi |
| "üzerine yaz" | yedekte OLMAYAN üç anahtar (iki yol + bir `kartlar` seti) gerçekten SİLİNDİ |
| aynı yedeği iki kez birleştir | vurgu 2 → 2, çiftlenme yok; günlük `kart: max(5,5)=5`, şişme yok |

Dışa aktarımı okumanın yolu: indirmeyi yakalayamazsın ama
`URL.createObjectURL`'ü sarmalayıp Blob'u alabilirsin.

**İki ölçüm tuzağı — ikisine de düşüldü:**

- **İçe aktarma İKİ adımlı.** Dosyayı `input`'a atmak yalnızca KURU PROVA
  başlatıyor; depo değişmiyor. "Onayla ve birleştir" / "Onayla ve üzerine
  yaz" düğmesine basılmadan ölçmek "hiçbir şey olmadı" sonucu verir ve
  içe aktarma bozuk sanılır.
- **Tohumu GERÇEK şemayla kur.** Günlüğe uydurma bir `sure` alanı konuldu;
  birleştirme onu (doğru biçimde) attı ve `DayLog = {kart, dogru}`
  şemasına normalleştirdi. Bir an "veri kaybı" sanıldı — kusur kodda
  değil tohumdaydı.

### Depoya yazan etki, yükleme bitmeden yazarsa veriyi SİLER

Kalıp şu: bir etki depodan okuyup duruma koyuyor, ikinci bir etki durumu
depoya yazıyor. Kurulum anında durum HENÜZ BOŞ olduğu için ikinci etki
depodakinin üstüne boş değeri yazıyor. StrictMode etkileri iki kez
çalıştırdığından zarar kalıcı oluyor: ilk turda boş yazılıyor, ikinci
turda okuma o boşluğu geri okuyor.

Ölçüldü — `UserProvider` bunu yapıyordu ve **premium ilerlemenin tamamı
her sayfa açılışında siliniyordu**: depoya `{xp:12500, modül:2, rozet:1}`
konup sayfa yenilenince ilk örnekte `xp=0` çıkıyor ve öyle kalıyordu.

**`useRef` bayrağı YETMEZ — denendi, ölçüldü, depo yine sıfırlandı.**
Bayrağı okuma etkisinin İÇİNDE `true` yaparsan, aynı commit'te hemen
ardından çalışan kaydetme etkisi bayrağı `true` görür ama durum hâlâ
boştur. Bayrak `useState` olmalı: o zaman kaydetme etkisi ancak yüklenen
değerlerin uygulandığı commit'te çalışır.

Bu sınıf tarandı; korumanın üç geçerli biçimi var ve hepsi kullanımda:

| Yer | Koruma |
|---|---|
| `UserContext` | `hazir` **durumu** (ref yetmedi) |
| `QuizEngine` | değer üzerinden: indeks 0 ve sonuç yoksa yazma |
| `NotePanel` | `dirty` bayrağı — kullanıcı düzenlemediyse yazma |
| `ReadingHint` | yalnızca kapatma anında yazıyor |
| `study-sync` | `doPush` `reconciled` olmadan göndermiyor |
| `FlashcardPlayer` | `useRef` — ölçüldü, işaretler korunuyor |

FlashcardPlayer'ın ref'le sorun çıkarmaması, ref'in genel olarak güvenli
olduğu anlamına GELMEZ; `UserContext`'te aynı şekil ölçülebilir veri kaybı
verdi. Yeni bir yüzeyde durum bayrağını tercih et.

**Bozuk kayıtta "hiç yazma" da çözüm değil:** o zaman bozuk kaydı olan
kullanıcı bir daha hiçbir ilerlemesini kaydedemez. `JSON.parse` korumasız
olduğu için tek bozuk karakter etkiyi düşürüyor, ardından boş durum
kalıcılaşıyordu. Doğrusu ham dizeyi yedek anahtara taşıyıp (örn.
`ydus_premium_user_bozuk`) normale devam etmek.

Doğrulaması ölçümle yapılır ve **iki negatif kontrol şart**: (1) kaydetme
hâlâ çalışıyor mu — kayda fazladan bir alan koy, yeniden yazılınca
silinmeli; (2) bileşen gerçekten kuruldu mu — kurulmayan bir bileşen
hiçbir şey yazmaz ve ölçüm yanlışlıkla "temiz" der.

**CANLIDA ÖLÇÜLDÜ — sınıf kapalı.** Depoya `{xp:12500, modül:2, rozet:1}`
konup premium panosu yeniden yüklendi:

| ölçüt | sonuç |
|---|---|
| değer hayatta kaldı mı | **evet**, 12500 |
| negatif kontrol 1 — kaydetme çalışıyor mu | kayda konan fazladan alan **silindi** (yani yazma oldu) |
| negatif kontrol 2 — bileşen kuruldu mu | ekranda "Puanınız 12500" **görünüyor** |

Bozuk kayıt yolu da ölçüldü: `{"xp":12500,"completedModules":[bozuk`
tohumlandı → sayfa ayakta kaldı, ham dize `ydus_premium_user_bozuk`
anahtarına taşındı, ana kayıt geçerli boş duruma döndü ve kaydetme devam
etti. Belgede yazan davranışın birebir aynısı.

**`medisea:review:v1`in boşalmasına ALDANMA.** `/tekrar` sayfasını
ziyaret edince tohumlanan takvim `{}` oluyor — ilk bakışta veri kaybı
gibi. Değil: `pruneStates()` karşılığı olan vurgusu bulunmayan yetim kartı
temizliyor. Ayırt edici ölçüm şu: **aynı tohumla başka bir sayfaya git.**
Ölçüldü — `/topics/endokrinoloji`de takvim 71 baytıyla duruyor, yani
silinme yalnızca `/tekrar`da ve kasıtlı. `medisea:log:v1` ve
`medisea:index:v1` her iki durumda da korunuyor.

### Kolay bozulan kararlar

- **Kalem ve avuç.** Bir kez `pointerType === "pen"` görüldüyse parmak artık
  çizmez, sayfayı kaydırır (`touch-action` `pan-y`'ye geçer). Kalemin silgi
  ucu (`buttons & 32`) otomatik silgiye alır.
- **Çizim PNG değil vuruş dizisi.** Genişliğe göre normalize saklanır; 64px
  önizleme ile 520px tekrar kartı aynı veriden çıkar.
- **Tazeleme kipi takvimi DEĞİŞTİRMEZ.** "Baştan sona çalış" ile verilen
  notlar ne aralıkları ne çalışma günlüğünü etkiler — sınav gecesi atılan bir
  tur, aylardır oturmuş programı sıfırlamamalı.
- **Konteyneri kaybolan vurgu SİLİNMEZ**, sadece boyanmaz (başka soru
  gösteriliyordur). Silme yalnızca konteyner VAR ama metin tutmuyorsa olur.
- **Kaydetme hatası yutulmaz.** Depo dolduğunda "Kaydedildi" yazmak
  kaydetmemekten beterdir; arayüz uyarır ve kurtarma yolu (kopyala / PNG
  indir) sunar. **ÖLÇÜLDÜ — sınıf kapalı** (bir dönem "doğrulanamadı" diye
  açık bırakılmıştı):

  | ölçüt | sonuç |
  |---|---|
  | %75 eşiği | 3.82 MB tohumlandı (oran 0.76) → uyarı çıktı, çubuk kırmızıya döndü |
  | uyarı metni kontrastı | 4.70 · kullanım yazısı 4.76 (ikisi de eşiğin üstünde) |
  | yazma başarısız olunca | `role="alert"` beliriyor: *"Tarayıcı depolaması dolu olduğu için bu not kaydedilemedi. Sekmeyi kapatırsan kaybolur."* + "Yazıyı kopyala" / "Yer aç" |
  | sayfa ayakta mı, metin duruyor mu | ikisi de evet |

  **Kotayı GERÇEKTEN doldurmaya çalışma — bu ortamda mümkün değil.** 15.27 MB
  yazıldı ve `setItem` hâlâ başarılı döndü; tarayıcı panelinin kotası 5 MB
  varsayımının çok üstünde. Hata dalını sürmenin çalışan yolu
  `Storage.prototype.setItem`'ı yalnızca ilgili anahtar öneki için fırlatacak
  şekilde sarmalamak, ölçüm bitince geri almak. Bu, kodun hata dalını sınar —
  "depo gerçekten doldu" demek DEĞİLDİR ve raporda öyle yazılmalı.
- **Uzlaşmadan push YOK.** Sunucudan bir kez okumadan hiçbir push gitmez.
  `beforeunload` her gezinmede push tetikliyor; deposu boş bir cihaz aksi
  halde pull yetişmeden sunucudaki yedeğin üzerine boş yük yazıyordu.
- **Günlük birleştirmede TOPLAMA yok, büyük olan kazanır.** Senkron her oturum
  açılışında aynı yedeği birleştirir; toplasaydık sayaçlar her girişte şişerdi.
- **Yeniden boyama tetiği yoklamalı.** `MutationObserver` hızlı yoldur ama
  zamanlaması kaçabiliyor; 600 ms'lik bir yoklama garantidir (imza aynıysa
  hiçbir iş yapmaz).

---

## Arama görünürlüğü ve paylaşım

Açık taraf huninin ağzı: içerik ücretsiz, arama motoru ve paylaşım oradan
geliyor. Bunu taşıyan parçalar:

| Dosya | Ne yapar |
|---|---|
| `lib/site.ts` | Sitenin kendi adresi — canonical, site haritası, paylaşım etiketleri |
| `app/sitemap.ts` | Haritayı **dosya sisteminden** üretir (elle liste tutulmaz) |
| `app/robots.ts` | Premium *konu* sayfalarını taramaya kapatır, tanıtımı açık bırakır |
| `lib/jsonld.tsx` | MedicalWebPage · SoftwareApplication · BreadcrumbList şemaları |
| `app/opengraph-image.tsx` | Site geneli paylaşım kartı |

`NEXT_PUBLIC_SITE_URL` tanımlı değilse `VERCEL_PROJECT_PRODUCTION_URL`'e
düşülür. Bu basamak eklenmeden önce canlıdaki site haritasının tamamı
`http://localhost:3000/...` yazıyordu — yani arama motoruna gönderilen her
adres geçersizdi.

### Yeniden çalıştırılması gereken betikler

```bash
node scripts/arac-metadata.cjs   # yeni klinik araç eklendiğinde
node scripts/arac-metadata.cjs --kontrol   # yazmadan: indeks bayat mı?
node scripts/baslik-index.cjs    # yeni konu eklendiğinde (paylaşım kartı başlığı)
node scripts/ilgili-index.cjs    # yeni konu eklendiğinde (İlgili Konular bağları)
node scripts/plan-ver.cjs --liste  # kullanıcı planlarını görmek/değiştirmek için
```

**Bu betikler CI'da ÇALIŞMIYOR — elle çalıştırılıyor.** Yani biri araç ya
da konu ekleyip betiği unutursa indeks sessizce bayatlıyor. Bedeli görünür:
araç sayısı `content/arac-index.json`'dan geliyor (çalışma zamanında
`app/tools` okunamıyor, sunucusuz ortamda kaynak dizin yok), yani bayat
indeks canlıda YANLIŞ SAYI demek.

`--kontrol` bunun için var: hiçbir şey yazmadan indeksi yeniden hesaplayıp
karşılaştırır, fark varsa hangi aracın eksik/fazla/değişmiş olduğunu
yazar ve çıkış kodu 1 döner. CI adımı yapmaya hazır.

**`arac-metadata.cjs` bir kez veri SİLDİ — o yüzden artık boş sonuçta
yazmıyor.** `TOOLS_DATABASE` `page.tsx`'ten `ToolsIcerik.tsx`'e taşınınca
(sunucu kabuk + istemci içerik bölünmesi) betik eski yolu okumaya devam
etti, hiç araç bulamadı ve 114 kayıtlık indeksi `[]` ile ezdi — hatasız,
çıkış kodu 0. Ders genel: **ayrıştırmaya dayanan bir üreteç, boş sonucu
asla meşru saymamalı.** Kaynak dosyalar yerinde duruyorsa sıfır bulmak
"veri yok" değil "ayrıştırma bozuldu" demektir.

### İçerik denetimleri (CI'da da çalışıyor)

```bash
node scripts/link-denetim.cjs    # içerikteki kırık iç bağlantılar
node scripts/soru-denetim.cjs    # quiz ve kart dosyalarının yapısı
```

Bu iki hata sınıfı **kodda değil veride** durduğu için `lint`, `typecheck` ve
`build` üçünün de gözünden kaçıyor. Yeniden adlandırılan bir konu, bağlantıyı
sessizce kırar; doğru cevabı olmayan bir soru, kullanıcıya konuyu yanlış
öğretir. İkisi de CI adımı — kusur bulurlarsa iş düşer.

`link-denetim` yönlendirmeleri biliyor: `next.config.js` içindeki bir
`redirects` kaydı varsa o adres kırık sayılmaz. Düzeltmenin iki yolu var —
hedef yeniden adlandırılmışsa yönlendirme ekle, hedef gerçekten yoksa
içerikteki bağlantıyı kaldır.

`ilgili-index.cjs` akrabalığı ortak etiket SAYISINDAN değil NADİRLİĞİNDEN
çıkarır. Klinik niteleyiciler (`akut`, `acil`, `tanı`, `tedavi`…) bilerek
elenir: elenmeden önce "Akut Koroner Sendromlar" ile "Safra Kesesi
Hastalıkları" ilgili çıkıyordu, çünkü ikisi de "Acil" etiketi taşıyor.
Tek ortak etiket, o etiket gerçekten nadir değilse akrabalık saymaz.

Bu katı kural tek başına 411 konunun 100'ünü boş bırakıyordu, çünkü etiket
sözlüğü parçalı: **1232 farklı etiketin 889'u yalnızca tek bir konuda
geçiyor** ve hiçbir akrabalık kuramıyor. Çözüm kuralı gevşetmek DEĞİL —
o zaman yukarıdaki saçma eşleşmeler geri gelir. Üreteç, katı kural boş
dönerse sırayla iki yedeğe düşer:

1. **Kardeşler** — aynı ebeveynin çocukları. İçeriğin kendi hiyerarşisi,
   uydurma değil; üstelik sayfada başka hiçbir yerde bağlı değiller
   (ebeveyn ve çocuklar bağlı, kardeşler değil).
2. **Branş içi son çare** — eşiği geçemeyen ama en yüksek skorlu komşular,
   sonra branşın merkez sayfaları (kendi çocukları olan konular). Merkez
   listesi slug'dan türetilen kararlı bir kaydırmayla döndürülür; yoksa
   aynı branştaki yalıtılmış konuların hepsi birebir aynı bloğu alıyordu.

**"Çıkmaz sokak" ölçerken üç yola birden bak:** ilgili konular, çocuklar,
ebeveyn. Yalnızca ilgili listesine bakınca 100 sayfa çıkmaz görünüyordu;
gerçek sayı 9'du.

`arac-metadata.cjs`, her araç klasörüne yalnızca metadata taşıyan bir
`layout.tsx` üretir — araç sayfaları `"use client"` olduğu için metadata
dışa aktaramıyorlar. Elle yazılmış bir layout görürse üzerine yazmaz.

### Görsel rotalarının (opengraph-image) üç tuzağı

Üçü de sessizce kırıyor: hata mesajı görünmüyor, istek bağlantısı düşüyor.
Teşhis için ikinci bir `next dev` örneğini günlüğe alarak çalıştır.

- **`params` bir Promise.** Düz nesne olarak alınırsa `slug` undefined kalır,
  rota `try` bloğuna girmeden çöker.
- **`fs` çalışmaz** — ne düz ne tembel içe aktarmayla. Bu yüzden konu
  başlıkları `content/baslik-index.json` içinden okunur (statik JSON içe
  aktarımı paketlenir, her çalışma zamanında güvenlidir).
- **Satori, birden fazla çocuğu olan her `<div>`'de açık `display: flex`
  ister.** `<div>· {brans}</div>` JSX'te İKİ çocuk üretir. Metinleri tek
  şablon dizesi ver.

### Rota parametresi YÜZDE-KODLU gelir

Next 15'te dinamik segment sayfaya kodlu ulaşıyor. ASCII slug'larda fark
etmiyor ama Türkçe karakter ya da boşluk taşıyan bir slug'da
`content/canonical/<branş>/<slug>.json` araması ham dizeyle yapılınca dosya
bulunamıyor ve sayfa `notFound()`'a düşüyor.

Ölçüldü: beş konu (`men1-menin-lösemi-onkojen`, `ascit-sıvısı`,
`gebelikte-immün-ITP-yonetimi`, `FGF-23 vs PTH`,
`pankreas-kanseri-neden-ilaç-vs`) `next dev` altında 404 veriyordu. Kusur
yalnızca ASCII dışı adda görünüyor — büyük harfli ve parantezli sekiz slug
sorunsuz çalıştığı için uzun süre fark edilmedi.

**KAPSAM DÜZELTMESİ — `34622f1` commit mesajı bu konuda yanlış.** Orada
"beş konu hiç açılamıyordu, beşi de arama motoruna ilan ediliyordu"
yazıyor; doğrusu şu:

| Yüzey | Etkilendi mi | Neden |
|---|---|---|
| `next dev` konu sayfası | EVET, 404 | istek anında render, parametre kodlu |
| Canlı konu sayfası | HAYIR | `● SSG` — derleme anında üretiliyor, orada parametre HAM geliyor (607/607 sayfa hatasız üretilmiş) |
| Paylaşım kartı rotası | EVET | `ƒ` dinamik, istek anında çalışıyor; başlık dizini anahtarı tutmuyor ve kart slug'ı yazıyla basıyordu |
| Site haritası | EVET | `<loc>` içine ham boşluk basıyordu, geçersiz adres |

Yani düzeltme doğru ve gerekliydi ama **konu sayfaları canlıda hiç kırık
değildi**. Hata ölçümde değil, ölçümün kapsamının genellenmesindeydi:
`next dev` üzerinde alınan bir sonuç üretim davranışına taşındı. Statik
üretilen bir rotada dev ile canlı FARKLI kod yolları çalışır; biri için
alınan sonuç öteki için kanıt değildir.

Ayrıca: ölçüm sırasında düzeltme çoktan dağıtılmıştı, bu yüzden "canlıda
önce nasıldı" doğrudan gözlenemedi. Bir kusurun kapsamını canlıda
doğrulayacaksan **dağıtımdan ÖNCE ölç**; sonrasında elinde yalnızca
mekanizma kalır.

Çare `lib/slug.ts`: `slugCoz()` her `await params`'tan sonra, `yolKodla()`
site haritasında. `<loc>` içine ham boşluk basmak geçersiz adres üretir.

**Slug'ları yeniden adlandırmak çare DEĞİL:** adlandırma içerik kararı ve
adres değiştirmek yönlendirme borcu doğurur; kusur rotanın kendisindeydi.

Teşhis yöntemi de not: sebep tahmin edilmedi, **geçici bir tanı rotası**
(`app/tani-gecici/[a]/page.tsx`) parametreyi ham hâliyle, kod noktalarıyla
ve `existsSync` sonucuyla bastı. Bitince rota silinir — `.next/types`
altındaki artığı da silmek gerekiyor, yoksa `tsc` olmayan bir modülü arar.

### Arka plan komutunun bildirimdeki çıkış kodu SON komutundur

`npm run build > log 2>&1; echo $?; grep ...` biçiminde zincirlenen bir
komutta bildirim `grep`'in kodunu raporluyor. Bir tur "exit code 0" görülüp
derleme geçti sanıldı; günlükte `Failed to compile` yazıyordu. Kapıyı
sınayacaksan komutu **tek başına** çalıştır, çıkış kodu onun olsun.

O turdaki düşüş üstelik koddan değildi: `next/font` Google Fonts'a
ulaşamıyordu (geçici DNS kesintisi). Derleme ağ ister; kapı düştüğünde
önce `dns.lookup('fonts.gstatic.com')` ile bak, sonra kodu suçla.

**Bu tek seferlik bir aksilik değil.** Tek bir oturumda ÜÇ derleme bu
yüzden düştü (`Merriweather`, `JetBrains Mono`, `Inter` — üçü de
`app/layout.tsx`'ten). `next/font/google` yazı tiplerini DERLEME ANINDA
indiriyor; ağ yoksa ya da yavaşsa kapı kodla ilgisi olmayan bir sebeple
düşüyor ve düşüşün mesajı `layout.tsx`'i işaret ettiği için kod hatası
gibi görünüyor.

Teşhis sırası: `git diff --stat -- web/app/layout.tsx` (senin diff'inde
yoksa suçlu o değil) → `dns.lookup` → ağ dönmüşse yeniden dene. Üç turda
da yeniden deneme yetti.

Kalıcı çare `next/font/local` ile yazı tiplerini depoya almak olurdu ama
bu tipografiyi bütün siteye yayılan bir tasarım kararı; ölçülmüş bir kusur
değil, öngörülen bir risk olduğu için tek başına yapılmadı.

### Sınav takvimi

`content/sinav-takvimi.json` boş gelir ve boşken geri sayım hiç basılmaz.
Tarih uydurulmaz: yanlış tarihe göre program yapan aday gerçekten zarar
görür. ÖSYM takvimi açıklanınca dosyaya yazmak yeterli; geçmiş tarihler
kendiliğinden elenir, en yakın gelecek sınav seçilir.

---

## Sayılar, denetimler ve kendini onaran okumalar

**Bu bölümdeki sayılar ÖLÇÜM ANINA aittir.** İçerik değiştikçe kayarlar;
güncel değeri betikten al, belgeden değil:

```bash
node scripts/asili-denetim.cjs             # görünür / asılı konu
node scripts/konu-denetim.cjs    # konu künyesi: çift başlık, çift açıklama, boş gövde (CI kapısı DEĞİL)
node scripts/yetim-denetim.cjs             # yetim içerik dosyası
node scripts/arac-metadata.cjs --kontrol   # araç indeksi senkron mu
```

Örnek: "görünür 411 konu" bir dönem doğruydu; `onkoloji/bobrek-kanseri`
dosyasındaki `"hidden": "true"` DİZESİ boolean'a çevrilince o konu gizli
sayılmaya başladı ve sayı 410'a düştü. Belgedeki sayıyı ölçüt sanma —
belge NEDENİ anlatır, güncel değeri betik verir.

Bu bölüm tek bir soruyu cevaplar: **bir yüzeye sayı ya da liste koyarken
veriyi nereden alacağım?** Yanlış cevap bu projede defalarca aynı hatayı
üretti — elle yazılan sayı içerik büyürken sessizce yalana dönüşüyor
(ana sayfa "6+ araç" derken 114 araç vardı, "456+ konu" derken 45'i
gizliydi, üyelik sayfası "38 başlık" derken pano "39" diyordu).

**Kural: sayı yazma, saydır.**

### Sayıyı nereden alırsın

| İhtiyaç | Kaynak |
|---|---|
| Branş/konu/araç/premium toplamları | `lib/icerik-sayaci.ts` → `icerikSayilari()` |
| Branş başına açık konu sayısı | `app/lib/topic-counts.ts` → `getTopicCounts()` |
| Araç sayısı | `app/lib/topic-counts.ts` → `getToolCount()` |
| Bir premium konunun soru/kart/inci/vaka sayısı | `lib/premium-envanter.ts` → `envanterAl()` |
| Konu başlıkları (görsel rotalarında) | `content/baslik-index.json` |

Hepsi süreç ömrü boyunca bir kez hesaplanıp saklanır; içerik yalnızca
dağıtımda değişiyor.

**`app/` dizininden çalışma zamanında dosya OKUMA.** Sunucusuz ortamda
yalnızca derleme çıktısı bulunur, kaynak `app/` yoktur. Araç sayısı bir
dönem `app/tools` klasörü sayılarak bulunuyordu: derleme anında üretilen
sayfalarda doğru, istek anında çalışan sayfalarda **sıfır** çıkıyordu —
yani yalnızca üretimde görünen sessiz bir hata. `content/` izlenip pakete
girdiği için sayımlar oradan yapılır.

### Kendini onaran okumalar

İçerik listeleri zamanla gerçeklikten kopuyor. Bu üç yerde liste elle
düzeltilmiyor, okuma adımı onarıyor — içerik düzelince ek kendiliğinden
kayboluyor:

- **Açık branş sayfası**: ebeveyni bulunamayan konular "Diğer Konular"
  altında listelenir. (46 konu, kütüphanenin %11'i, hiçbir yerden
  görünmüyordu — aralarında "Akut Koroner Sendromlar" vardı.)
- **Premium branş sayfası ve pano**: `lib/premium-brans.ts` →
  `listelenmeyenKategori()`; branş dosyasında adı geçmeyen konu dosyaları
  görünür kılınır. (Bitmiş bir premium konu — quizi ve 87 kartıyla —
  görünmezdi.)
- **Premium konu sayfası**: içerik sayıları ilana değil dosyaya bakar ve
  bağlantı yalnızca dosya gerçekten varsa kurulur. (Bir konu "10 soru"
  deyip tıklanabiliyordu ama quiz dosyası hiç yoktu.)

**İLAN mı GERÇEK mi — premium yüzeyler tarandı, sınıf kapalı.** Kalıp şu:
içerik dosyasının varlığı yerine konu/branş dosyasındaki BAYRAĞA bakmak.
Dört yüzey ayrı ayrı ölçüldü:

| yüzey | kaynak | sonuç |
|---|---|---|
| konu sayfası — istatistikler | `envanterAl` | dürüst |
| konu sayfası — **Modüller kartları** | `veri.moduller` ilanı | **KUSURLUYDU**, 69 ilanın 6'sının hedefi yoktu |
| branş sayfası — `hazir` bayrağı | branş dosyası | dürüst (39 ilan, 39 dosya) |
| pano ve `icerikSayilari` | `envanterAl` + yetim elemesi | dürüst |

Modül kartları düzeltildi. Dikkat çekici olan şu: aynı DOSYADAKİ yorum
"artık hem sayı hem bağlantı gerçeğe bakıyor" diyordu ve yalnızca sayı
için doğruydu. **Bir kusuru düzeltirken aynı sayfadaki öteki blokların da
aynı kaynağa bağlandığını doğrula** — yorum, kapsamı olduğundan geniş
anlatabiliyor.

Listelenmeyen konu onarımı (`listelenmeyenKategori`) üç yerde de çağrılıyor
(branş sayfası, pano, sayaç) ve ölçüldü: 40 konu dosyasının listelenmeyen
1'i "Diğer Konular" altında tıklanabilir çıkıyor. Ters yönde 17 kayıt
listede olup dosyası yok, ama hepsi `hazir: false` — soluk ve tıklanamaz,
yani çıkmaz sokak değil.

### İçerik denetimleri

Bu hata sınıfları **kodda değil veride** durur; `lint`, `typecheck` ve
`build` üçü de göremez. İkisi de CI adımı:

```bash
node scripts/link-denetim.cjs    # içerikteki kırık iç bağlantılar (yönlendirmeleri bilir)
node scripts/soru-denetim.cjs    # quiz/kart yapısı: doğru cevap geçerli mi, şık var mı
node scripts/arayuz-denetim.cjs   # arayüz kaynağı: bozuk kodlama, alt, rel, form, iç içe tıklama
node scripts/arayuz-denetim.cjs --negatif   # denetim hâlâ kusur yakalıyor mu
node scripts/yetim-denetim.cjs   # konu dosyası olmayan quiz/kart/vaka (CI kapısı DEĞİL)
node scripts/asili-denetim.cjs   # ebeveyni bulunamayan konular (CI kapısı DEĞİL)
```

`arayuz-denetim` bu üçlüden farklı bir yeri tarıyor: içeriği değil ARAYÜZ
KAYNAĞINI. Aradığı beş sınıf da geçerli TypeScript ve geçerli JSX, yani üç
kapıdan da geçiyor; kusur yalnızca ekranda görünüyor. Kendini sınayabiliyor
(`--negatif`) ve o da ayrı bir CI adımı — yakalamayı bırakan bir denetim
sessizce yeşil kalmasın. Raporunda ölçülen etiket sayısı da var, çünkü
"0 kusur" ile "0 öge" ekranda aynı görünür.

`konu-denetim` konunun KENDİ KİMLİĞİNE bakıyor. Gerçek bir kusurdan doğdu:
üretim çıktısında `<title>` tekrarı arandığında iki dosyada sadece başlık
değil BÜTÜN İÇERİK yanlış çıktı — `hiperkalsemi-ve-hiperparatiroidi.json`
baştan sona asit-baz, `akut-lenfoblastik-losemi-all.json` baştan sona MDS
anlatıyor. Üç kapı da göremez, çünkü kusur kodda değil veride ve dosya
geçerli JSON.

Çift başlık her zaman kusur değil (aynı konu iki branşta durabilir), o yüzden
kapı değil rapor. Ama "iki dosya aynı başlığı taşıyor" sinyali bu depoda dört
kayıttan ikisinde gerçek bir içerik kazası çıkardı — sinyal ucuz ve verimli.

`asili-denetim`, "Diğer Konular" kovasının NEDEN dolduğunu söyler. Ölçüldü:
görünür 410 konunun **46'sı (%11)** hiyerarşiden düşüyor ve sebepleri üç
ayrı sınıfta — çareleri de farklı:

| Sınıf | Adet | Çare |
|---|---|---|
| Ebeveyn var ama `hidden` | 18 | `hidden` kaldırılırsa hiyerarşi döner |
| Ebeveyn adı sapmış (büyük harf / Türkçe karakter) | 1 | referansı düzelt |
| Üst başlık hiç yazılmamış | 27 | başlığı yaz (tıbbi sınıflandırma kararı) |

Toplamı tek sayı olarak raporlamak yanıltıcı: 18'i tek bir bayrakla
çözülüyor, 27'si içerik yazmayı gerektiriyor.

`yetim-denetim`, kendini onaran okumaların TERSİ yöndeki sorunu bulur.
Onarım "konu dosyası var ama listede adı geçmiyor" durumunu düzeltiyor;
bu denetim "içerik dosyası var ama konusu yok" durumunu buluyor — öyle bir
dosyaya arayüzden ulaşmanın hiçbir yolu yok. CI kapısı değil, çünkü yetim
dosya kod hatası değil içerik kararı.

Yetim dosyalar sayıları da bozuyordu: `icerikSayilari()` bir dönem dizindeki
her dosyayı sayıyor, pano ise yalnızca erişilebilir konuları topluyordu.
Satış sayfasının üst yazısı "362 soru" derken sayfanın kendi panosu "352"
diyordu. **Reklam edilen sayı, kullanıcının gerçekten açabildiği içerik
olmalı** — sayaç artık konu dosyası olmayan içeriği saymıyor.

Denetim yazarken **negatif kontrol yap**: kasten bozuk bir kayıt ekleyip
yakalandığını gör, sonra geri al. Kusur yakalayamayan bir denetim, yanlış
güven verir.

### Erişilebilirlik tabanları

`app/globals.css` sonunda üç kural var, üçü de ölçümle konuldu:

- **Okuma alanında yazı boyutu tabanı** — konu içeriklerinin %54'ünde
  gömülü `text-xs`/`text-[10..13px]` sınıfları var ve gövde metnini 12px'e
  düşürüyordu. `[data-readable]` içinde metin 14px'in (telefonda 15px)
  altına basılamaz. Kapsam dar: arayüzdeki küçük etiketler etkilenmez.
- **İkincil metin renkleri** — `text-slate-300/400/500` kontrastı 1.48–4.35
  arasındaydı (eşik 4.5). Bir basamak koyulaştırıldı. **Bu müdahale bir
  yerde geri TEPTİ ve o ders aşağıda.**

**`dark:` varyantları ETKİSİZ — ve öyle kalmalı.** `tailwind.config.js`
içinde `darkMode: "class"` var ama kök ögeye `.dark` koyan kimse yok; amaç
koyu tema açmak değil, varyantları susturmak. Uygulamada koyu tema hiç yok
(ölçüldü: `app/` altında `dark:` kullanan dosya sayısı sıfır), ama konu
içeriklerinin 17'si 397 `dark:` sınıfı taşıyor. Varsayılan `media` kipinde
bunlar işletim sistemi koyu kipteyse devreye giriyor ve baştan sona açık
bir arayüzün içinde koyu tablo satırları üretiyordu — yazı rengi uyum
sağlamadığı için kontrast 1.37'ye düşüyordu.

**Bu kusur yalnızca koyu kipte görünüyor.** Erişilebilirlik taraması
yaparken tarayıcıyı bir kez koyu kipe alıp tekrarla; aksi hâlde içerikteki
`dark:` sınıfları hiç ölçülmez.

**SINIF ÖLÇÜMLE KAPATILDI — yeniden aramaya gerek yok.** Tarayıcı koyu
kipe alınıp (`matchMedia('(prefers-color-scheme: dark)')` ile etkin olduğu
doğrulanarak) `dark:` sınıfı en yoğun üç konu sayfası tarandı: 209 + 137 +
124 = **470 yazı, sıfır kontrast kusuru.** Kök ögede `.dark` yok, yani
`darkMode: "class"` varyantları gerçekten susturuyor.

Kök şema beyanı da sınandı ve burada **ölçüm yöntemi bir kez yanılttı**:
`getComputedStyle(document.documentElement).colorScheme` `"normal"`
döndürüyor ve bu "beyan yok" gibi görünüyor — oysa `<meta name=
"color-scheme">` CSS ÖZELLİĞİNİ ayarlamaz, yalnızca kullanılan şemayı
belirler. Doğru sonda tarayıcının kendi çizdiği yüzeyi denemek: koyu kipte
sıfırdan bir `<select>` oluşturup zeminini okumak. Ölçüldü — beyaz zemin,
koyu yazı, yani beyan çalışıyor.

**Kontrast ölçerken iki tuzak — ikisi de yaşandı:**

- **Degradeyi göremeyen ölçüm.** Zemin yalnızca `backgroundColor` okunarak
  bulunursa `bg-gradient-to-br from-blue-950` gibi koyu bir şerit *beyaz*
  sanılır. Yukarıdaki koyulaştırma böyle konuldu: konu sayfasındaki premium
  tanıtım şeridinde yazı 5.73'ten **1.94'e düştü**, yani kural düzelttiğinin
  tersini yaptı. Zemin ararken `background-image` içindeki ilk `rgb(...)`
  de okunmalı.
- **"Koyu atanın içinde muaf tut" kuralı iç içelikte delinir.** CSS'te
  `.bg-slate-950 .text-slate-400 { … }` mantıklı görünür ama zemin ATAdan
  değil en yakın DOLU zeminden gelir. Premium panosu koyu yerleşimin içinde
  **açık kartlar** taşıyor; muafiyet onlara da uydu, tek sayfada 21 yazı
  2.56'ya düştü. Denendi, geri alındı (gerekçe `globals.css` içinde yazılı).

Doğrusu: genel koyulaştırma **açık zemin varsayar** ve kullanımların ezici
çoğunluğu öyledir. Koyu bir zemine yazı basıyorsan rengini **kendin ver** —
tanıtım şeridi `text-blue-200` ile bunu yapıyor (10.34).

`slate-300/400/500` **ezildiği için premium koyu yüzeylerde kullanılamaz.**
Gerçek kapsam ölçüldü — tek nokta değil, altı yüzey: konu sayfası tanıtım
şeridi (1 kusur), inciler (13), soru çözüm kokpiti (6), profil (12),
liderlik (14), premium giriş (9).

Çözüm iki katmanlı, çünkü iki farklı durum var:

- **Baştan sona koyu yüzeyler** kök ögelerine `koyu-yuzey` sınıfını koyar;
  o ağaçta tonlar Tailwind'in özgün değerine döner (profil · liderlik ·
  premium giriş · branş şablonu). Bu, geri alınan "koyu ata varsa muaf tut"
  kuralının aksine tahmine dayanmıyor: yüzey kendini beyan ediyor ve sınıfı
  eklerken ağaçta açık kart OLMADIĞI doğrulanıyor.
- **İçinde açık kart taşıyan koyu yerleşimler** bu sınıfı ALMAZ. Premium
  panosu böyle; sınıf verilseydi açık kartlardaki 21 yazı 2.56'ya düşerdi
  (bir kez denendi, ölçüldü, geri alındı). Oradaki tek tek ögeler kendi
  rengini verir.

**Ölçüm kapı arkasını görmüyorsa "temiz" DEMEZ.** Bu gerilemenin kapsamı
bir kez "tek nokta" diye raporlandı, çünkü ölçüm yalnızca herkese açık
premium sayfalardan yapılmıştı. İnciler ve kokpit erişim kapısının
arkasında ve ikisi de kusurluydu. Premium tarama, geçici bir dev rotasıyla
motorları doğrudan render etmeden tamamlanmış sayılmaz.

**"Yüzey tarandı" demek, o yüzeydeki her bileşen ölçüldü demek DEĞİL.**
İnciler yukarıda taranıp 13 kusuru düzeltildi — ama tarama sayfanın ana
bileşenini (`PearlsViewer`) render edip ölçmüştü. Aynı dosyadaki `HataKarti`
ise ancak parametre bozuksa çizilen AYRI bir koyu karttı ve hiç ölçülmedi;
açıklama cümlesi **2.36** kontrastta kaldı. Kusur gözle de saklandı, çünkü
kartın başlığı (17.85) ve düğmesi (5.17) okunuyordu — yalnızca ne olduğunu
anlatan cümle kayıptı.

Ölçüt: bir sayfayı tararken **hangi dalın çizildiğini** sor. Koşullu
render edilen kartlar (hata, boş durum, yükleniyor) normal akışta hiç
görünmez; onları görmek için parametreyi kasten bozmak gerekir.

### `.prose` içindeki düz `color`, Tailwind sınıflarını yener

`globals.css` bir dönem `.prose { color: var(--fg) }` yazıyordu (#111827,
neredeyse siyah). Bu bildirim `@tailwind utilities`'ten SONRA geldiği için
aynı ögedeki `text-slate-300`'ü eziyordu; `prose-invert` de kurtaramıyor,
çünkü o yalnızca `--tw-prose-*` DEĞİŞKENLERİNİ çeviriyor, düz bir `color`
bildirimini görmüyor.

Sonuç: `prose` kullanan üç koyu premium yüzeyde gövde metni koyu kartın
üstüne neredeyse siyah basılıyordu — inciler sayfasında kontrast **1.01**,
yani yazı fiilen görünmezdi. Kural artık renk vermiyor, devralıyor; `body`
zaten `color: var(--fg)` verdiği için açık yüzeylerde sonuç birebir aynı.

Tipografi kuralına renk yazacaksan önce sor: bu sınıf koyu bir yüzeyde de
kullanılıyor mu?

Yeni yüzey eklerken: dokunma hedefi en az 24px (tercihen 44), ikincil
metin `slate-600`'den açık olmasın, tıklanabilir görünen her şey gerçekten
tıklanabilir olsun (sahte `cursor-pointer` taşıyan iki ikon kaldırıldı).

### `useSearchParams()` bir sayfayı sunucuda RENDER EDİLMEZ hâle getirir

Bir istemci sayfasında `useSearchParams()` kullanmak Suspense sınırı
gerektiriyor — bu bilinen kısım. Bilinmeyen kısmı şu: Next o alt ağacı
sunucuda **hiç üretmiyor**, sunulan HTML yalnızca `fallback` oluyor.

Ölçüldü (canlı, sunucudan gelen ham HTML): `/tools` 19 KB, `<h1>` 0,
`<h2>` 0, araç bağlantısı **0**. Karşılaştırma: sunucu bileşeni olan
`/topics` 98 KB ve 26 iç bağlantı. Yani 114 aracın hub bağlantısı ilk
tarama dalgasında hiç yoktu. Çare: sorgu parametresini SUNUCUDA okuyup
prop olarak vermek (`page.tsx` sunucu kabuk + istemci içerik).

**Ama sorguyu SUNUCUDA okumanın da bedeli var:** `searchParams` okuyan bir
sunucu bileşeni rotayı dinamikleştiriyor (`ƒ`) ve CDN'de her istek `MISS`
oluyor. `/tools` bir tur bu durumda kaldı — üst üste üç istek MISS, kıyas
`/topics` PRERENDER — ve 155 KB'lık sayfa her istekte yeniden üretildi.

Şu anki çözüm ikisini birden sağlıyor: sayfa sorguyu HİÇ okumuyor (statik
prerender, sunucu HTML'i süzülmemiş tam listeyi taşıyor) ve kategori
süzgeci hidrasyondan sonra istemcide uygulanıyor. `useSearchParams()`
BİLEREK kullanılmıyor — o, ilk kusuru geri getirir. Kategori iki yoldan
geliyor ve ikisi de karşılanmalı: başka sayfadan gelindiğinde bileşen
kurulur (adres bir kez `useEffect` ile okunur), sayfadaki rozete
tıklandığında bileşen kurulu kalır ve effect tekrar çalışmaz — o yüzden
rozetler durumu kendileri günceller.

Doğrulandı (canlı): `/tools` `○` statik, üç istekte de `HIT`, aynı yanıtta
`<h1>` 1, `<h2>` 17, araç bağlantısı 117.

Bir sayfanın gerçekten sunucuda basıldığını **ham HTML'de `<h1>` ve
`<a>` sayarak** doğrula; tarayıcıdaki DOM hidrasyondan sonrasını gösterir

**Sınırı SAYFANIN TAMAMINA koymak aynı kusurun ikinci hâli.** Ölçüldü:
`/giris` bütünüyle tek bir `<Suspense fallback={null}>` içindeydi, çünkü
`?gerekli=` parametresini okuyordu. Sunucudan gelen giriş sayfası bomboştu —
form yok, alanlar yok, `<h1>` yok (kardeşi `/kayit` sunucuda 1 başlık
basıyordu, ayırt edici ölçüm bu oldu). JavaScript yavaş ya da düşmüşse
kullanıcı dönüşümün en kritik yüzeyinde beyaz sayfa görüyor.

Kural: sınır **parametreye bağlı en küçük parçayı** sarsın. `/giris`te bu
yalnızca bir uyarı kutusuydu; ayrı bileşene alındı ve sayfanın geri kalanı
sunucuda basılır oldu (h1 1, form 1, input 2).

Bunu yakalamanın ucuz yolu: her sayfanın SUNUCU HTML'inde `<h1>` say.
Sıfır çıkan sayfa ya başlıksız ya da sunucuda hiç üretilmiyor demektir.

ve bu kusuru gizler.

### `metadata` MİRAS ALINIR — `page.tsx`e bakan ölçüm yanılır

Bir turda aynı ölçütle iki kez yanlış sonuç alındı; ikisi de kusur UYDURDU.

- **Yalnızca `page.tsx`e bakmak.** `/calisma-alanim`, `/tekrar` ve
  `/guidelines` "metadata yok" çıktı; üçünün de kardeş `layout.tsx`inde
  metadata VAR (`Çalışma Alanım`, `Tekrar`, `Rehberler ve Kılavuzlar`).
  İstemci bileşenleri metadata dışa aktaramadığı için bu depoda çözüm
  zaten layout — araç sayfalarında `arac-metadata.cjs` aynı şeyi üretiyor.
- **Yalnızca KARDEŞ layout'a bakmak.** Düzeltilmiş ölçüm "28 rotada
  metadata yok" dedi. Yine yanlış: metadata her ATA layout'tan miras
  alınıyor, yani kök `app/layout.tsx` hepsini besliyor. Bu rotalar kırık
  değil; olsa olsa "kendine ait başlığı yok".

Ölçüt şu olmalı: rota kökten aşağı yürünerek ilk metadata tanımı aranır.
"Kendi metadata'sı yok" ile "metadata'sı yok" AYNI ŞEY DEĞİL ve ikincisi
bu depoda hiç görülmedi.

Bunu ararken ayrıca doğrulandı: `/kayseritip/*` sayfaları `robots.ts`te
kapalı değil ama `app/kayseritip/layout.tsx` kapı kuruyor —
`institution !== 'kayseritip'` olan herkes (tarayıcılar dahil) `/giris`e
yönlendiriliyor. Site haritasında da yoklar. Yani taranabilir görünmeleri
bir sızıntı değil.

### Route grubu dışındaki sayfalar AppShell almaz

`app/tools/*`, `app/kayseritip/*` ve ayrıca **`app/giris`, `app/kayit`,
`app/profile`** `(site)` grubunun DIŞINDA. AppShell'in
verdiği hiçbir şeyi almıyorlar: üst menü, alt bilgi, `<main id="icerik">` ve
atlama bağlantısı. Ölçüldü — 115 araç sayfasında `main`/`nav`/`header`/
`footer` sayısı **sıfırdı**.

**Kök dizindeki `giris`/`kayit`/`profile` de aynı boşluktaydı** ve ölçümde
üçünde de `main` sayısı sıfırdı; düzenleri artık `<main>` sarıyor. Üst menü
ve alt bilgi bilerek verilmiyor (odaklanmış yüzeyler), landmark ise şart.

Bu gruplara yeni sayfa eklerken landmark'ları kendin sağla. Araç tarafında
çözüm iki yerde: `app/tools/layout.tsx` `<main>` sarıyor, `ToolTopNav`
`<nav aria-label>` basıyor ve **atlama bağlantısıyla hedefini kendi içinde**
taşıyor.

Atlama bağlantısı neden düzen dosyasında DEĞİL: gezinme çubuğu sayfaların
içinde render ediliyor, bağlantı düzene konsaydı hedef gezinmenin önüne
düşer ve atlama hiçbir işe yaramazdı. Hedef `<span tabIndex={-1}>` olmalı;
odaklanabilir olmayan bir öğeye atlandığında tarayıcı görünümü kaydırır ama
**odağı taşımaz**, sonraki Tab yine gezinmenin başına döner.

Doğrularken gerçek Tab/Enter tuşuna bas — `element.focus()` bu oturumda bir
kez "odak halkası yok" diye yanlış sonuç verdirdi.

### Form alanının ADI olmak zorunda — placeholder yetmez

Ölçüldü: uygulamadaki dokuz form alanının **dokuzu da adsızdı**. Giriş ve
kayıtta `<label>`'lar görsel olarak vardı ama `htmlFor`/`id` çifti
kurulmadığı için alana bağlı değildi; arama kutularında yalnızca
`placeholder` vardı. Placeholder ad yerine geçmez — yazmaya başlayınca
kaybolur ve kimi okuyucular onu ad değil ipucu sayar.

Yeni bir alan eklerken: ya `<label htmlFor>` + `<input id>` çifti, ya
`aria-label`. Hata çıkıyorsa alana `aria-invalid`, mesaj kutusuna
`role="alert"`.

**`alert` ile `status` farkı önemli:** `alert` sonradan DOM'a eklenince
duyurulur, bu yüzden koşullu basılabilir. `status` böyle değil — bölgenin
içerik değişmeden ÖNCE DOM'da bulunması gerekiyor, yoksa ilk mesaj kaçar.

**Kaynakta `htmlFor` aramak da yanıltır — ters yönde.** Klinik araçların
çoğu `<input>`'u `<label>` ile SARIYOR; sarmalayan etiket geçerli bir ad
kaynağı, yani `htmlFor` yokluğu "adsız" demek değil. Grep bir dönem
"68 araçta bağlantılı etiket yok" dedi; tarayıcıda ad hesaplatılınca
gerçek sayı 13 araçta 21 alandı.

### Gizlenen form kontrolü `hidden` ile gizlenmez

Araçlarda onay kutusu/radyo görsel olarak sahte bir kutuyla çiziliyor,
gerçek `<input>` gizleniyor. Bu bir dönem `className="hidden"` ile
yapılıyordu — yani `display: none`. Ölçüldü: böyle bir öge odak sırasına
girmiyor, sarmalayan `<label>` de odaklanabilir değil, dolayısıyla
**29 araçtaki 36 kontrol klavyeyle hiç işletilemiyordu** (CURB-65'te 5,
CHA2DS2-VASc'ta 8, Charlson'da 19). Fareyle çalıştığı için yıllarca
görünmedi.

Doğrusu `sr-only`: görünmez ama odaklanılabilir ve Space ile işaretlenir.
Görünmeyen ögenin kendi odak halkası işe yaramadığı için halkayı
sarmalayan etiket verir — `focus-within:ring-2 focus-within:ring-blue-700
focus-within:ring-offset-2`. `globals.css` sonundaki `:has()` kuralı
yalnızca yedek.

**`opacity-0` ile `invisible` klavye açısından ZIT davranır — ve ikisi de
"görünmez" görünür.** Aynı turda iki yerde çıktılar, biri kusurdu biri
değildi:

| Gizleme | Odak sırasında | Sonuç |
|---|---|---|
| `invisible` (`visibility: hidden`) | YOK | öge erişilemez — kusur "ulaşılamıyor" |
| `hidden` (`display: none`) | YOK | öge o breakpoint'te yok — kusur DEĞİL |
| `opacity-0` | **VAR** | görünmez ama odaklanılabilir — en kötüsü |

Üçüncüsü en kötüsü, çünkü kullanıcı göremediği bir denetimin üstünde
duruyor. Ölçüldü: vurgu panelindeki kaldırma düğmesi `opacity-0
group-hover:opacity-100` taşıyordu, yani klavyeyle gezen kullanıcı
**göremediği bir SİLME düğmesine** odaklanıyordu. Çare `focus:opacity-100`.

Hover ile içerik açan bir yüzey yazarken kuralı baştan kur: `group-hover:`
yazdıysan `group-focus-within:` de yaz. Kaynakta taranabilir — görünürlüğü
açan hover varyantı taşıyıp focus karşılığı olmayan className'leri ara.

**İkonlu düğmede `title` erişilebilir ad OLMAZ.** Hesaplama sırası
içeriği `title`ın önüne koyuyor; içerik boş değilse `title` hiç devreye
girmiyor. `<button title="Kaldır">✕</button>` ögesinin adı **"✕"**dir.
`aria-label` ver; `title` fare ipucu olarak kalabilir.

### Doğrulama betiği, doğruladığı betiğin hatasını PAYLAŞMAMALI

Yukarıdaki halka sınıfları bir betikle yerleştirildi: `<input>`ten yukarı
14 satır içinde `<label>` ara. 10 dosyada mesafe 16-23 satırdı, yani
atlandılar — ve **doğrulama betiği aynı 14 satırlık pencereyi kullandığı
için "eksik yok" dedi.** Kusuru ancak bağımsız bir ölçüt yakaladı:
dosyadaki `sr-only` sayısı ile halka sınıfı sayısını karşılaştırmak.

Bir yerleştirmeyi kendi arama mantığıyla doğrulama; **sonucu say.**

### Düzeltmeyi doğrularken VARSAYILAN durumu da ölç

Bir yüzeyi düzeltip doğrulaman, doğrulamayı **düzelttiğin senaryoda**
yapmaya çekiyor. Ama kullanıcıların ezici çoğunluğu o senaryoyu hiç
görmüyor; gördükleri şey varsayılan durum — boş kutu, sıfır sonuç, seçim
yapılmamış süzgeç, ilk açılış.

Ölçüldü ve pahalıya mal oldu: arama Türkçe karakterlerde bozuktu,
`aramaEslesir` yazıldı, dört yüzeye uygulandı ve **arama yaparak**
doğrulandı — "gogus" artık "Göğüs"ü buluyor. Doğru. Ama yardımcı boş
sorguda bilerek `false` dönüyor (`String.includes("")` her zaman true
olduğu için, vurgulama yapan bir çağrı yerinde boş kutu her şeyi
işaretlerdi) ve `/tools` bunu karşılamamıştı: **arama kutusu boşken 114
aracın hepsi eleniyordu.** Sayfa aylarca değil, bir tur boyunca tamamen
boştu; statik önceden üretildiği için boş liste sunucu HTML'ine de
yazıldı, yani 117 hub bağlantısı arama motorundan da kayboldu.

İki şey bu kusuru gizledi:

- **Komşu sayı ayrı veriden besleniyordu.** Kategori rozetleri "TÜMÜ 114"
  yazmaya devam etti, çünkü sayaç `TOOLS_DATABASE`'ten geliyor, süzülmüş
  listeden değil. Sayfa dolu görünüyordu; ayıran tek işaret küçük punto
  "0 araç listeleniyor" satırıydı.
- **Sözleşme mantıklıydı.** "Eşleşme var mı?" sorusunun boş sorgu için
  doğru cevabı `false`. Kusur yardımcıda değil, sorunun süzgeçte
  **farklı** olmasındaydı: orada soru "listede kalsın mı?" ve cevap her
  zaman evet. Böyle bir yardımcı yazarken sözleşmeyi dosyanın içine
  yüksek sesle yaz; kalan üç çağrı yeri korumayı almıştı, unutulan tek
  yerin bedeli bütün sayfa oldu.

Ölçüt: bir yüzeye dokunduysan onu **girdisiz** de aç. Arama kutusu boş,
süzgeç seçilmemiş, liste henüz filtrelenmemiş hâlde ne görünüyor?

### Bu ortamda sayfaya `<style>` enjekte etmek İŞE YARAMIYOR

Bir CSS kuralının uygulanıp uygulanmadığını sınamak için
`document.head.appendChild(style)` denendi: `!important` ile bile hiçbir
hesaplanmış değer değişmedi, temiz bir sekmede de aynı. Yani enjeksiyon
bir doğrulama yöntemi değil ve "kuralım uygulanmıyor" sonucu ondan
çıkarılamaz. Okunan hesaplanmış değerler ise gerçek — kural sınarken
`el.matches(seçici)`, `getComputedStyle(el).getPropertyValue('--tw-…')`
ve stylesheet içindeki `cssText` üçlüsüne bak.

**Ekrana basmak için kırptığın değeri ölçüme GERİ VERME.** Bu oturumda iki
kez oldu: bir kez `slice(0,50)` doğru bir canonical adresi yanlış gösterdi,
bir kez `head -c 600` ile kırpılmış bir slug listesi kopyalanıp taramaya
girdi ve var olmayan bir adres ("…-psikoz", doğrusu "…-psikozu") 404
verince sayfa kusurlu sanıldı. Kırpma yalnızca GÖSTERİM içindir; ölçüme
giren değer tam hâliyle dosyadan ya da değişkenden alınmalı.

Bunu yakalayan şey taramaya konan iki koruma oldu: `d.location.pathname`
beklenen yola eşit mi ve gövdede "Sayfa bulunamadı" var mı. İkisi olmasa
tarama "12/12 temiz" derdi ve biri geçersiz ölçümdü.

Uzun değerleri kırpma: `boxShadow` bir dönem "none" sanıldı, çünkü
Tailwind halkası dizenin ilerisindeydi ve ilk 90 karakter şeffaf
yer tutuculardı.

Ölçmenin doğru yolu erişilebilir adı HESAPLATMAK: `aria-label` →
`aria-labelledby` → `label[for]` → sarmalayan `<label>`. Kaynakta `<label>`
görmek yetmez, bağlı olup olmadığını göstermez.

### API uçları arka uç yokken UYDURMA VERİ dönmemeli

Express arka ucu canlıda hiç çalışmıyor. Uçlar bunu karşılarken bir dönem
"arayüz kırılmasın" diye sahte veri üretiyordu ve `ok: true` diyordu.
Yedi uç bir turda düzeltildi (`/api/user/me` vb.), dört uç daha sonra
bulundu: `premium/quiz/history`, `premium/daily-program`,
`premium/quiz/today`, `protected/chunk`.

En zararlısı geçmiş grafiğiydi: beş günlük sahte başarı serisi dönüyordu ve
kullanıcı bunu KENDİ geçmişi sanıyordu. Sınava hazırlanan biri çalışmasını
o sayılara göre ayarlar — boş grafik göstermek çok daha az zararlı.

Kural: arka uca ulaşılamıyorsa `{ ok: false, reason: "backend-unavailable" }`
ve **503**. Çağıran bileşenler `!r.ok` dalını zaten karşılıyor; dürüst hata
görünümü arayüzü kırmıyor. `protected/token` içindeki yorum bunu en iyi
özetliyor: *uydurulmuş bir başarı, çağıranın üstüne kod yazdığı yanlış bir
varsayım üretir.*

Yeni bir uç yazarken ya da bir `catch` bloğu eklerken önce şunu sor: bu
yanıt, veriyi gerçek sanan birini yanıltır mı?

### Hesaplayıcı ÇÖP GİRDİDEN klinik etiket üretmemeli

Aynı ilkenin en pahalı hâli. `parseLocaleNumber` ayrıştıramadığı her şeyi
**0'a** çeviriyor — 42 aracın paylaştığı davranış. Sonuç sayı değil, sayının
yanındaki **sınıflama etiketi**:

```
eGFR:  kreatinin "abc" → 0   + "G5: Böbrek Yetmezliği"
ANC:   lökosit  "abc"  → 0   + "EVRE 4 — ÇOK CİDDİ · Acil izolasyon ve
                               ampirik antibiyotik"
```

**"0" NaN'dan DAHA tehlikeli.** NaN açıkça bozuk; 0 ise makul görünen
kritik bir değer ve yanına en ağır evre geliyor.

`parseLocaleNumber`'ın sözleşmesine DOKUNULMADI — 42 aracı birden
değiştirmek riskli. Bunun yerine araç, sayıyı basmadan önce girdinin
**makul** olduğunu kendisi doğruluyor (klinik sınır değil makullük sınırı:
kreatinin 0.1-30, lökosit 0.1-500, yüzde toplamı ≤100). Geçersizse sayı
yerine `–`, etiket yerine "Değerleri girin".

**Riskli olan alt küme: merdiven yönü.** Kalıbı (serbest sayısal girdi +
sınıflama merdiveni + `parseLocaleNumber`) 19 araç taşıyor ve tehlike
**DÜŞÜK = KÖTÜ** olan yerlerde: orada 0 son basamağa düşüyor.

> **DÜZELTME — bu paragraf bir dönem SOFA, NEWS2 ve Glasgow-Blatchford'u
> "yüksek = kötü, dolayısıyla güvenli" diye sayıyordu. YANLIŞTI ve ölçümle
> çürütüldü.** Bir skorun TOPLAMI yüksekken kötü olması, BİLEŞENLERİNİN de
> öyle olduğu anlamına gelmiyor: NEWS2 düşük SpO2'ye, düşük tansiyona ve
> düşük ateşe puan veriyor; SOFA düşük PaO2/FiO2, düşük trombosit, düşük
> ortalama arter basıncı ve düşük GKS'ye; Glasgow-Blatchford düşük
> hemoglobin ve düşük tansiyona. Boş bırakılan her alan 0'a çevrilip EN
> YÜKSEK puanı alıyordu:
>
> | araç | BOŞ formda ne basıyordu |
> |---|---|
> | `news2` | **15 · "YÜKSEK (Acil Müdahale)"** — eşik zaten 7 |
> | `sofa` | **15** — %80 üzeri mortaliteye karşılık gelir |
> | `glasgow-blatchford` | **9 · "Hastane Yatışı / Erken Endoskopi"** |
>
> Ölçüt "toplamın yönü" DEĞİL, **her bileşenin yönü** olmalı. Ters yön de
> kusur: `das28` boş formda 0 basıp **"Remisyon"** diyordu — bu kez risk
> tedaviyi gereksiz hafifletmek.

**MEŞRU SIFIRI AYIRMAK ŞART.** Kapıyı sayıya bakarak kurmak yetmiyor,
çünkü bazı alanlarda 0 gerçek bir ölçüm: SOFA'da idrar 0 mL anüridir ve en
ağır dalı hak eder; DAS28'te eklem sayısı 0 remisyonun tanımıdır; vazopressör
dozu 0, ilaç almayan hastadır. `parseLocaleNumber("")` de 0 döndürdüğü için
bu alanlar **ham dizenin boş olup olmadığına** göre denetlenmeli.

**SINIF ÖLÇÜMLE KAPATILDI** — yedi araç tek tek, gerçek girdiyle:

| araç | durum |
|---|---|
| egfr, anc | KUSURLUYDU → düzeltildi |
| bmi, gnri, pni, conut, homa-ir | zaten korumalı (`–` gösteriyor) |

Kalan 12 araçta merdiven en hafif koşulla başlıyor (`if (score <= X)
return REMİSYON/NORMAL/İNAKTİF`), yani 0 ilk dala düşüyor.

Doğrulamanın en önemli adımı **negatif kontrol**: gerçekten ağır bir vaka
hâlâ ağır etiketi almalı. ANC'de lökosit 0.5 / %10 nötrofil → ANC 50 +
"EVRE 4" + acil uyarısı çıkıyor. Bu ölçülmeden düzeltme "alarmı susturmuş"
olabilir.

**Etiket ararken DESEN TAHMİN ETME.** ANC bir tur "temiz" raporlandı,
çünkü süzgeç `nötropeni|NORMAL|risk|ağır|hafif|orta` arıyordu ve
"EVRE 4 — ÇOK CİDDİ" hiçbirine uymuyordu. Kaynaktaki gerçek etiket
dizesini oku, sonra ölç.

### Sunum bileşenini render'ın İÇİNDE tanımlamak odağı ÖLDÜRÜR

Sayfa bileşeninin içinde tanımlanan bir bileşen (`const Input = (…) => …`)
her render'da **yeni bir bileşen kimliği** alır. React eskisini söküp yenisini
takar; `<input>` DOM'dan çıktığı için odak `<body>`ye düşer ve kullanıcı **her
tuş vuruşundan sonra** kutuya yeniden tıklamak zorunda kalır.

Kullanıcı bunu iki kez bildirdi ("170 yazmak için kutuya üç kez tıklamak
gerekiyor"). Fareyle kullanan biri fark etmiyor, çünkü zaten tıklıyor.

Ölçmenin doğru sinyali odak DEĞİL, **ögenin DOM'da kalıp kalmadığı**:

```js
el.focus(); setter.call(el, "1");
el.dispatchEvent(new Event("input", { bubbles: true }));
// bozuk: document.body.contains(el) === false, activeElement === BODY
```

`document.hasFocus()` bu ortamda false döndüğü için odak tabanlı ölçüm tek
başına güvenilmez; `contains` her koşulda çalışır.

Süpürme 13 araçta 15 bileşen buldu (`abg`, `osmolal-gap`, `ktv`, `ranson`…).
Çare bileşeni **modül düzeyine** taşımak.

**Kapanış tespiti için ayrı tarayıcı YAZMA — `tsc` bedava ve kesin.** Taşınan
bileşen dış kapsamdaki bir değişkene bakıyorsa tip denetimi "Cannot find name"
ile düşer. 13 taşımanın 12'si temiz geçti, `refeeding-risk` düştü ve gerçekten
`toggle`a kapanıyordu. Kapanış tarayıcısı yazmaya kalkıldığında iki tur
yanlış sonuç verdi (bir kez parametre listesinin sonunda durup "hiçbir şey
yok" dedi, bir kez tip anotasyonundaki `=>` işaretine takıldı) — üstelik ilk
raporu "hepsi güvenli" idi ve yanlıştı.

Doğrulaması **önce/sonra çifti** olmalı: `osmolal-gap` aynı ölçümle
düzeltmeden önce `contains: false`, sonra `true` verdi. Aynı araç, aynı
yöntem, aynı oturum — tarama "0 aday" dediğinde bu çift olmadan "0 kusur" ile
"0 öge" ayırt edilemez.

### Saf mantığı modüle ayır — tarayıcısız sürülebilir hâle gelir

`node --experimental-strip-types` bu depoda çalışıyor (Node 22). Bir hesap
mantığı sayfanın içinde durduğu sürece yalnızca tarayıcıda sınanabiliyor;
ayrı bir `.ts` modülüne alındığında onlarca vaka saniyeler içinde sürülüyor.

Asit-baz motorunda ölçüldü: mantık sayfanın içindeyken **üç kusur** uzun süre
görülmedi (pH normalken mikst bozukluğu gizlemek, yüksek anyon açığını yok
saymak, delta oranı eksi çıkınca ters sonuç vermek). Modüle alınıp 15 vakalık
tablo yazılınca üçü de ilk turda göründü.

İki nokta:

- **Modül saf olmalı** — `import` etmediği sürece Next/React kurulumuna
  ihtiyaç duymaz. Tip anotasyonu ve `as const` silinebilir, `enum` ve
  `namespace` DEĞİL.
- **Beklenti tutmadığında önce beklentiyi sına.** Bir vaka düştüğünde
  motorun haklı olduğu çıktı: Winter 21–25 diyorken PaCO₂ 26 gerçekten
  aralık dışıydı. Kusur kodda değil, benim seçtiğim sayılardaydı — ama
  o düşüş gerçek bir tasarım sorusunu açtı (1 birimlik sapmayı kesin bir
  ikinci tanı gibi sunmak) ve "sınırda" ayrımı oradan doğdu.

### Ekranda duran ama hiçbir şeyi değiştirmeyen denetim

Asit-baz motorunun ilk yazımında pH-normal dalı, kullanıcının akut/kronik
seçimini **yok sayıp** "kronik" varsayıyordu. Düğme görünüyor, basılıyor,
hiçbir sayı değişmiyordu.

Bu, "ilan mı gerçek mi" sınıfının denetim tarafındaki hâli: bir kontrolü
ekrana koymak, onu bağladığın anlamına gelmiyor. Ölçütü şöyle kur — **kontrolü
değiştir ve çıktının GERÇEKTEN değiştiğini gör.** Aynı sayılarla (7.36 · 60 ·
33) "kronik" tam kompanze basit bozukluk, "akut" mikst bozukluk veriyor;
testte bu iki satır yan yana duruyor.

Bir seçim çıktıyı belirliyorsa bunu ekranda da söyle: hangi seçimin sonucu
değiştirdiğini bilmeyen kullanıcı, varsayılanla gelen cevabı kesin sanır.

**Bu sınıfın TARAMA ÖLÇÜTÜ var ve ucuz:** bir `useState` değişkeni yalnızca
`className`, `aria-pressed`, `aria-current` ya da `aria-selected` içinde
geçiyorsa, o kontrol kendi vurgusundan başka hiçbir şeyi değiştirmiyordur.
Nitelik değerlerini süslü parantez dengesiyle metinden çıkar, sonra değişken
adı hâlâ geçiyor mu diye bak.

124 araç · 387 durum tarandı, 2 aday çıktı: biri gerçek (`nrs-2002`, aşağıda),
biri yanlış pozitif (`unit-converter`'ın takas düğmesi — etkisi zaten
görünümün kendisi). Yanlış pozitif beklenen bir şey: yalnızca görünümü yöneten
durum meşrudur (sekme, aç/kapa, sıralama). Ölçüt ADAY üretir, karar değil.

`nrs-2002` bu sınıfın en pahalı hâliydi, çünkü ölü denetim aynı zamanda bir
KAPIYDI. NRS-2002 iki aşamalıdır ve aşama 1 bir süzgeçtir: dört sorunun
dördüne de "hayır" denen hastada ana tarama YAPILMAZ. Araçta o dört soru
skora hiç girmiyordu — yani araç, klinik algoritmanın yarısını atlıyordu.

**Ölü denetimin yanında çoğu zaman ikinci bir kusur durur: BOŞ FORMDAN
KLİNİK ETİKET.** Aynı araçta hiç dokunulmamış sayfa "SKOR 0 · RİSK DÜŞÜK"
basıyordu. İkisi aynı kökten geliyor — kontrolün cevaplanıp cevaplanmadığı
hiç sorulmuyor.

**`<select>`te `value` yoksa "dokunulmadı" ile ilk seçenek AYNI şeydir.**
Eski kodda seçim kutularının `value`su yoktu ve ilk seçenek "Normal (0 Puan)"
görünüyordu; kullanıcı hiçbir şey seçmeden araç "normal" cevabını almış
sayıyordu. Boş bir `<option value="">` şart, ve seçim `null` iken sınıflama
basılmamalı.

### Şişen vurgu etiketi — dengesi bozuk olmayan sürümü

Kapanmamış etiket sınıfını `konu-denetim` yakalıyor. Ama **aynı görünür sonuç
denge bozulmadan da oluşur**: yazar `<strong>`'u koca bir paragrafın tamamına
sararsa etiket düzgün kapanır, denetim temiz der, ekranda yarım sayfa kalın
basılır. Vurgunun işi bir şeyi öne çıkarmak; her şey kalınsa hiçbir şey kalın
değildir.

Ölçüt: her `strong/em/b/i/h1-h6` etiketinin sardığı düz metnin uzunluğu.
Sağlam bir sayfada en uzun satır içi etiket onlarca karakterdir. 456 dosyadaki
10134 etiket tarandı — eşiği (250) aşan tek etiket var ve o bilinçli bir
italik uyarı notu. Sınıf temiz.

**Bu ölçüm KAYNAKTA yapılabilir ve tarayıcı gerektirmez** — ki 410 konu
sayfasını yerel dev sunucuda gezmenin tuzağı belgede zaten yazılı. Kaynak
düzeyindeki sayı DOM'la doğrulandı: `ektopik-acth-sendromu`da kaynakta
ölçülen en uzun etiket 1740, tarayıcıda ölçülen de 1740; onarımdan sonra
ikisi de 76.

Negatif kontrolü git'ten al: ölçütü düzeltme ÖNCESİ sürüme uygula ve kusuru
gerçekten bulduğunu gör. "0 kusur" ile "0 öge" ayrımı için taramanın ölçtüğü
öge sayısını da bastır.


### Seçim durumunu PUANLA saklama — aynı puanlı şıklar tek düğme olur

Hesaplayıcıların ortak kalıbı: `useState<number|null>` ve
`aria-pressed={secim === opt.pts}`. Şıkların puanları benzersizken
çalışıyor, aynı puanı taşıyan iki şık olduğu anda bozuluyor — ikisi de
aynı değere eşit olduğu için **birlikte** yanıp birlikte sönüyorlar.

Çoklu seçimde bu bir SKOR kusuruna dönüşüyor. Ölçüldü (`gout-acr`,
"Atak Karakteristikleri", üç bulgunun üçü de +1): birinciyi seçince dizi
`[1]`, ikinciye basınca `prev.includes(1)` doğru olduğu için ilkini
KALDIRIYOR. Yani üçünden yalnızca biri işaretlenebiliyordu ve ACR/EULAR
ölçütünde 0-3 puan vermesi gereken alan 0 ya da 1'de kalıyordu — 8 puanlık
sınıflama eşiğini doğrudan etkiliyor.

Tek seçimde skor doğru çıkıyor ama arayüz yalan söylüyor: `apache2`
kronik sağlıkta iki ayrı klinik kategori de 2 puan, ikisi birden
vurgulanıyordu. Skoru doğru olduğu için ölçüm "temiz" der; kusuru gören
şey `aria-pressed` eklemek oldu.

Çare: seçimi **kimlikle** sakla — şık nesnesi (`{pts,label}`) ya da şık
sırası. `key={opt.pts}` de aynı sebeple çakışır, o da kimliğe çevrilmeli.

Tarama ölçütü iki koşulu birden ister: dosyada puanla karşılaştırma
(`=== opt.pts`, `includes(opt.pts)`) VE aynı dizi içinde tekrar eden
puan. Tek başına ilki 114 aracın çoğunu işaretler, ikincisi zararsız
dizileri de getirir. 114 araç tarandı; ikisini birden taşıyan yalnızca
`apache2` ve `gout-acr` çıktı (`ipss-r` geniş taramada yanlış
pozitifti — puanları benzersiz).

Doğrularken negatif kontrol şart: **tek seçimli gruplar hâlâ dışlayıcı
mı** ve **eksi puanlı şık** doğru hesaplanıyor mu? İndekse geçiş
`vals[0] ?? 0` gibi ifadeleri sessizce bozabilir — 0 indeksi geçerli bir
seçimdir, `??` ona düşmez ama `||` düşerdi.


### `<button …>` etiketini regex'le almak SIFIR sonuç verir

`/<button[sS]*?>/` etiketi `=>` okundaki `>` işaretinde kapatıyor —
`onClick={() => setX()}` taşıyan her düğme yarıda kesiliyor ve içindeki
`className`/`aria-*` hiç görünmüyor. Bu tarama iki kez üst üste **sıfır
aday** döndürdü ve ilk bakışta "kusur yok" gibi okundu; gerçekte 61 düğme
kusurluydu.

Doğrusu süslü parantez derinliği izleyip `>` işaretini yalnızca derinlik
0'da ve önündeki karakter `=` DEĞİLKEN kapanış saymak. Genel ders şu:
**sıfır sonuç bir bulgu değil, ölçütün sınanması gereken bir durumdur.**
CLAUDE.md'deki "boş sonucu meşru sayma" kuralının tarama tarafındaki hâli.

Toplu bir `aria-*` yerleştirmesini doğrulamanın iki ucuz yolu var, ikisi
de bu turda gerçek koruma sağladı:

- **Koşul gerçekten seçim koşulu mu?** `className`'deki ilk üçlü alınıyor
  ama bu bir biçim üçlüsü de olabilir. Koşuldaki tanımlayıcılardan birinin
  `onClick` içinde de geçmesini ara. Sekiz araç işaret aldı; sekizi de
  yerel takma ad kullanıyordu (`const active = sel[item.id] === opt.pts`)
  ve doğruydu — yani denetim yanlış pozitif verdi ama hiçbirini kaçırmadı.
- **`tsc` bedava bir kapı.** `aria-pressed` boolean istiyor; sayısal ya da
  truthy bir koşula bağlanan her düğme tip denetiminde düşer.

Tarayıcı doğrulaması kalıp başına bir kez yeter (tek seçim · çoklu seçim ·
varsayılanı olan mod düğmesi), ama **ölçüme "başlangıçta hiçbiri basılı
değil" kontrolünü koy**: hepsi sabit `true` basan bozuk bir yerleştirme,
yalnızca tıklama sonrası bakan bir ölçümde temiz görünür.


### Toplu süpürmede DOSYA düzeyinde eleme, aynı dosyadaki boşluğu gizler

"Bu dosyada zaten `aria-pressed` var, atla" biçimindeki eleme hızlıdır ve
yanlıştır: bir dosyada bir grup düzeltilmiş, ötekiler açık olabilir.
Ölçüldü — `gout-acr` alan şıklarını almıştı, giriş ölçütü düğmeleri (iki
ayrı grup) süpürmenin dışında kaldı. Eleme **öge düzeyinde** yapılmalı:
her düğmeye tek tek bak, dosyaya değil.

Bu, belgedeki "bir kusuru düzeltirken aynı sayfadaki öteki blokların da
aynı kaynağa bağlandığını doğrula" kuralının tarama tarafındaki hâli.
Süpürme bittikten sonra ölçütü **elemesiz** bir kez daha çalıştır; kalan
sayı sıfır değilse boşluk oradadır.

İkinci ders: `className`'deki ilk üçlüyü seçim koşulu saymak araçlarda
çalışıyor ama genel ağaçta üç kez YANLIŞ çıktı — kaydet düğmesinin
`status === 'saving'` biçimi, zaten `disabled` olan bir düğmenin
görünürlük koşulu ve yalnızca RENK veren bir onay düğmesi. Kestirme,
aday üretmek için iyi; uygulamadan önce elle gözden geçir.

Üçüncüsü: geçiş (`aria-pressed`) ile gezinme (`aria-current`) ayrı.
`LangSwitch` düğmeleri `router.push` ile gidiyor — orada "basılı" değil
"şu an bulunulan" doğru olanı.

### Bozuk kodlama (mojibake) kaynakta sessizce duruyor

Metin UTF-8 yazılıp CP1252 diye okunduğunda `ş` → `ÅŸ`, `ü` → `Ã¼` olur ve
öyle KAYDEDİLİR. Derleme geçer, lint geçer, tip denetimi geçer — kusur
yalnızca ekranda görünür. Ölçüldü: 1108 dosyanın 6'sında 129 satır;
üç yönetim sayfası başlıklarını, tablo sütunlarını ve düğmelerini bozuk
basıyordu.

Taraması ucuz: satırda `Ã`, `Ä` ya da `Å` geçiyor mu. Türkçe metinde bu üç
karakter tek başına neredeyse hiç kullanılmaz, yani yanlış pozitif düşük.

**Onarımı dosya bütününde YAPMA.** Önce hiçbir satırda doğru Türkçe ile
bozuk metnin bir arada olmadığını ölç; aynı satırda ikisi varsa toptan
çevirme doğru karakterleri bozar. Dönüşüm CP1252 ters haritasıyla yapılır
(0x80-0x9F aralığı Latin-1'den FARKLI — `â€™` dizisi tam olarak bunun
işareti) ve çevrilemeyen bir karakter görülürse o satıra dokunulmaz.

Bu turda yan bulgu: `app/lib/i18n.ts`'in ilk satırı dosyanın kendi mutlak
yolunu taşıyan kazara yapışmış bir dizeydi ve BOM ile birlikte
`"use client"` yönergesinin ÖNÜNDE duruyordu. Bir dosyanın ilk baytlarına
bakmak (BOM `ef bb bf`) beklenmedik şeyler gösteriyor.

Doğrulaması: yüzey kapının arkasındaysa tarayıcı yönlendirir; o zaman ölçüm
**derleme çıktısında** yapılır — üretilen HTML doğru metni içeriyor mu ve
çıktının tamamında bozuk dizelerden biri kalmış mı. Aynı taramayla
geliştirici yolunun paketlere sızıp sızmadığına da bakılabilir.

### Canlı davranış taraması — 20 Ağustos 2026, dokuz ölçüt temiz

Kaynak taramasının göremediği şeyler canlıda ölçüldü. Hepsi TEMİZ çıktı;
yeniden taramaya gerek yok, ilgili kod değişmedikçe:

| ölçüt | sonuç |
|---|---|
| ana sayfa + `/topics` iç bağlantıları | 60 bağlantı, kırık yok, konsol temiz |
| `sitemap.xml` biçimi | 542 adres, boşluk/localhost yok, çift kayıt yok |
| site haritası adresleri açılıyor mu | eşit aralıklı 80 örnek, hepsi 200 |
| harita bileşimi | 424 konu + 115 araç + kök + `/tr` + `/uyelik`; hub'daki 114 aracın 114'ü de haritada |
| sayı tutarlılığı (4 yüzey) | 410 konu · 114 araç · 13 branş her yerde aynı; branş kırılımlarının toplamı da 410 |
| `/tools` kategori süzgeci — üç yol | adresle geliş 6, rozete tıklama 117→9, süzülmüşken başka rozet →6 |
| `/tools` varsayılan durum | "Tümü" 117'ye dönüyor; **boş arama kutusunda 117 araç duruyor** (belgedeki gerileme tekrarlamıyor) |
| Türkçe arama | "gogus" → 9 sonuç, yani "Göğüs" bulunuyor |
| `/api/user/me` | **503** — uydurma veri yerine dürüst hata, düzeltme canlıda |

`/guidelines` site haritasında YOK ve bu doğru: sayfa dürüst bir boş durum
("henüz hazır değil" + çıkış bağlantısı). Boş bir sayfayı arama motoruna
ilan etmek zarar olurdu.

**Ölçüm tuzağı — yuvarlanmış değer kusur kanıtı değil.** `/api/auth/providers`
gövdesi `Math.round(232/1024)` ile "0 KB" göründü ve bir an "sağlayıcı yok,
giriş kurulamıyor" sanıldı. Gövde okununca credentials sağlayıcısı oradaydı.
Bu, belgedeki "ekrana basmak için kırptığın değeri ölçüme geri verme"
kuralının sayı tarafındaki hâli.

### Bir bileşeni düzeltmeden önce BAĞLI olduğunu doğrula

Kaynakta bir kusur bulmak, o kusurun kullanıcıya ulaştığını göstermez.
Ölçüldü: `app/` altında dışa aktarılıp hiçbir yerden içe aktarılmayan
**yirmi bileşen** var (1711 satır) ve iki arayüz düzeltmesi tam da onlara
yapıldı — `LangSwitch` ile `SectionDetailFilters`. Kod doğru, kapılar geçti,
kullanıcıya ulaşan hiçbir şey değişmedi.

**Ama "içe aktarılmış mı" YANLIŞ SORU.** Doğrusu **"gerçek bir rotadan
ulaşılabiliyor mu"**: alt çizgili klasördeki bir sayfa rotaya alınmıyor,
dolayısıyla ONUN içe aktardığı her şey de kullanıcıya ulaşmıyor. Ölçüldü —
`PremiumVideoRecommendations` "içe aktarılmış" görünüyordu ama onu yalnızca
`_hematoloji` ve `_romatoloji` sayfaları çağırıyor.

Doğru ölçüm geçişli: rota dosyalarından (alt çizgili klasörde OLMAYAN
`page`/`layout`/`route`…) başla, içe aktarma zincirini izle, kalanı ulaşılmaz
say. Bu ölçütle 483 kaynak dosyanın 76'sı (8160 satır) ulaşılmıyor; 46'sı
alt çizgili klasörlerde, 30'u (2556 satır) dışarıda. Sığ sayım 20 dosya
demişti. `next/dynamic` bu depoda HİÇ kullanılmıyor, yani "çalışma zamanında
yükleniyordur" ihtimali yok.

**Takma ad çözerken `tsconfig.json`'daki `paths` eşlemesini GERÇEKTEN oku.**
`@/components/*` burada İKİ hedefe birden eşleniyor (`app/components/*` ve
`components/*`). Yalnızca `@/*` kuralını uygulayan bir çözücü bu içe
aktarımları göremiyor ve `AddToSRButton` gibi canlı dosyaları ölü sayıyor.
Ölçüme olumlu kontrol koy: bilinen canlı bir dosya listede ÇIKMAMALI.

**Ad araması tek başına yanıltır — üç yanlış pozitif ölçüldü:**

- ad yalnızca bir YORUM içinde geçiyordu
  (`// … QuestionView … çatışmaması için`, `{/* CanonicalViewer simülasyonu */}`)
- `Lock` bizim `components/Lock.tsx` değil, `lucide-react` ikonuydu

Doğrusu içe aktarma satırını aramak, sonra bulduğunu yorum olup olmadığına
bakarak sınamak. İki yöntem farklı sonuç verirse dar olanı değil, DOĞRUyu ara.

Ölü bileşenlerin bir kısmı artık değil **bağlanmamış özellik**: üçünün
canlıda çalışan API ucu var (`daily-program`, `quiz/history`, `quiz/today`)
ve o uçlar "uydurma veri dönme" düzeltmesinden geçmiş. Silmek mi bağlamak mı
sorusu ürün kararı — SENDE-KALANLAR 27. madde.

### Süsleme emojisi: 416 öge ölçüldü, TOPLU süpürme yapılmadı

Kural yazılı: bilgi taşımayan glif `aria-hidden="true"` almalı — hem ekran
okuyucudaki gürültüyü kaldırır hem kontrast kapsamından düşer. Uygulaması
şimdiye kadar tek tek yapıldı (bölüm başlığındaki `#`, kart okları).

Kapsam ölçüldü: 401 tsx dosyasında metni YALNIZCA emojiden ibaret 431 öge
var, **416'sında `aria-hidden` yok**. En yoğun yerler kokpit (7), premium
ölü sayfalar, klinik araçlar.

**Toplu süpürme BİLEREK yapılmadı.** Sebep, bu depoda üç kez ölçülmüş olan
kestirme riski: "metni emoji olan her öge süslemedir" varsayımı yanlış
olabilir — emojinin TEK anlam taşıyıcı olduğu yerler (durum rozeti, boş
durum ikonu) gizlenirse bilgi kaybolur. 416 yerin hepsini tek tek
doğrulayamadan uygulamak, "aday üretmek" ile "karar vermek" arasındaki
sınırı geçmek olurdu.

Yapılacaksa ölçütü daralt: yanında ZATEN metin olan glifler güvenli
adaydır (`<span>🏆</span><span>Puan</span>` gibi), tek başına duranlar
insan kararı ister.

### Duyarlı gizlenen ögeler dar ölçümde GÖRÜNMEZ

En sinsi kapsam boşluğu bu. `hidden md:block` ve `hidden lg:flex` taşıyan
ögeler telefon genişliğinde **hiç render edilmiyor** — yani 375px'te yapılan
bir dokunma hedefi taraması onları göremez ve "kusur yok" der.

Ölçüldü: başlıktaki 10 branş bağlantısı 1280px'te 19.5px, "Giriş" bağlantısı
768px'te 20px yüksekliğindeydi (AA eşiği 24). Bu oturumun bütün önceki
dokunma hedefi denetimleri bunları kaçırmıştı, çünkü hepsi 320/375'te
yapılmıştı. "Giriş" üstelik bir dönüşüm kontrolü.

**AYNI TUZAK TERS YÖNDE DE VURUYOR — kusur UYDURUR.** Yukarıdaki hâli
"göremezsin"; öteki hâli "gizlenmiş olduğu için kusur sanırsın". Ölçüldü:
odaklanılabilir-ama-görünmez taraması 1280px'te üç sayfada 17/9/10 kusur
raporladı; hepsi sahteydi, çünkü kapsayıcı `hidden 2xl:flex` taşıyor ve
1536px altında `display: none` — o ögeler zaten odak sırasında değil.

Ölçüt: bir öge "görünmez" çıktığında önce **hangi genişlikte çizildiğini**
bul ve ölçümü ORADA tekrarla. `display: none` bir kusur değil, o
breakpoint'te ögenin var olmadığının kendisidir. Gerçek kusur ancak
ögenin çizildiği genişlikte görünür — bu turda 1600px'te bakılınca menü
kapsayıcısı `flex` oldu ve asıl sorun (klavyeyle hiç açılmaması) o zaman
ortaya çıktı.

**Dokunma hedefi tararken `sr-only` ögeleri ELE.** İki taramada birden
sahte kusur ürettiler: gizlenmiş `<input>`'lar (onay kutusu/radyo) ve
atlama bağlantısı 1×1 ölçülüyor. İkisi de tasarım gereği: girdinin gerçek
hedefi onu SARAN `<label>`, atlama bağlantısı ise odakta açılıyor
(`.focus\:not-sr-only:focus { position: static; width: auto; … }`).
Ölçüt: `input[type=checkbox|radio]` için `el.closest('label')`'ı ölç;
`sr-only` sınıfı taşıyan bağlantıları hiç sayma. Doğrulaması `element
.focus()` ile YAPILMAZ — stil sayfasındaki kuralı `cssText` ile ara.

**Sebebi iframe DEĞİL, bütün panel.** Bu bir dönem "arka plandaki
iframe'de `:focus` boyanmıyor" diye yazılmıştı; ölçüldü, ÖN PLANDAKİ
sekmede de aynı: `document.hasFocus()` **false** dönüyor, çünkü tarayıcı
panelinin işletim sistemi odağı yok. Öge `document.activeElement` olsa
bile `el.matches(':focus')` false, dolayısıyla `:focus` altındaki hiçbir
hesaplanmış değer değişmiyor. Iframe'den çıkmak çare değil.

Odak halkası eklediysen zincirin ÖLÇÜLEBİLİR halkalarını kapat: (1) sınıf
gerçekten ögenin `className`'inde mi, (2) Tailwind kuralı üretmiş mi
(`.focus\:ring-2:focus` diye stil sayfasında ara), (3) halka rengi
değişkeni çözülüyor mu. Boyanmayı gösteremezsin; raporda da gösterdiğini
söyleme.

**GEÇİŞLİ (`transition-*`) BİR ÖZELLİĞİN HESAPLANMIŞ DEĞERİ BU ORTAMDA
GÜVENİLMEZ.** Tarayıcı paneli gizliyken (`document.visibilityState === "hidden"`)
CSS geçişleri İLERLEMİYOR; hesaplanan değer geçişin BAŞLANGIÇ noktasında takılı
kalıyor.

Ölçüldü ve az kalsın olmayan bir kusur "düzeltilecekti": soru çözüm kokpitindeki
"Kararı Onayla" düğmesi `disabled:opacity-30 … transition-all` taşıyor. Şık
seçildikten sonra `disabled === false`, `matches(':disabled') === false`, satır
içi stil YOK, stil sayfasında 0.3 veren kural YOK — ama `getComputedStyle`
hâlâ `0.3` diyordu, yani kontrast 1.71 hesaplanıyordu.

Ayırt eden ölçüm iki adım:

1. **Aynı sınıf listesiyle taze bir öge oluştur ve onu oku.** Kopya `1`
   veriyorsa fark sınıfta değil, ögenin DURUMUNDADIR.
2. **Geçişi kapat ve yeniden oku**: `el.style.transition = 'none'`, reflow
   zorla (`el.offsetHeight`), sonra oku. `1` çıkıyorsa takılı geçiştir,
   üründe kusur yoktur.

Bu, belgede zaten yazılı olan `document.hasFocus() === false` tuzağının geçiş
tarafındaki hâli: panelin işletim sistemi odağı yok, üstelik sayfa gizli
sayıldığı için animasyon/geçiş zamanlayıcıları da çalışmıyor.

**DURUM DEĞİŞİKLİĞİ ÖLÇERKEN GEÇİŞLERİ ETKİLEŞİMDEN ÖNCE KAPAT.** Tek bir
ögede `transition:none` yapmak yetmiyor: bir yüzeyde tıklamadan sonra ölçüm
yapıyorsan, geçişi OLAN ögeler eski değerinde donuyor, geçişi OLMAYANLAR anında
değişiyor ve ortaya gerçekte hiç oluşmayan KARMA bir durum çıkıyor.

Ölçüldü (`wells-pe`, ölçüt satırı seçildikten sonra): etiketin zemini
`transition-all` yüzünden slate-50'de donmuş, başlık `transition-colors`
yüzünden blue-900/80'de donmuş, ama geçişi olmayan alt yazılar anında
blue-200'e geçmiş. Sonuç: açık zemin üzerinde açık mavi yazı, kontrast 1.36 —
ve başlık için 1.00, yani "seçilen ölçütün başlığı görünmez oluyor" gibi
görünen bir bulgu. İkisi de SAHTEYDİ; kaynakta seçili hâl `text-white` veriyor.

Doğru yöntem, etkileşimden ÖNCE bütün ağaçta geçişi kapatmak:

```js
for (const el of d.querySelectorAll('*')) { el.style.transition = 'none'; el.style.animation = 'none'; }
d.body.offsetHeight;                       // reflow zorla
// ... simdi tikla ve olc; yeni oge eklendiyse kapatmayi TEKRARLA
```

Aynı sayfada aynı ölçüm, geçişler önceden kapatılınca 13 kusurdan 4'e düştü
ve kalanlar bambaşka bir sınıftı. Geçiş açıkken alınan durum ölçümü
kullanılamaz.

### Genel koyulaştırma kuralı KOYU yüzeyde tersini yapıyor — çare `koyu-yuzey`

`globals.css` içindeki `.text-slate-300 { color: rgb(100 116 139) }` kuralı
AÇIK zemin varsayıyor (gerekçesi orada yazılı). Koyu bir yüzeyde aynı kural
yazıyı zemine yaklaştırıyor.

Soru çözüm kokpitinde ölçüldü: şık harf rozetleri (`text-slate-500`, 10px)
neredeyse siyah zeminde **2.60**, "Karar Analizi" başlığı (`opacity-60`) 3.75.
Belge kokpitin altı kontrast kusurunun düzeltildiğini yazıyor ama o tarama
opacity'yi göremeyen ölçütle yapılmıştı ve bu ikisi kaçmıştı.

**Sınıf adı üzerinden tahmin etme.** `text-slate-500` yerine `text-slate-300`
yazmak işe yaramadı: ezme kuralı yüzünden o da `rgb(100 116 139)` olarak
basıldı ve 4.15'te kaldı (hâlâ eşiğin altı). Ekranda gerçekte hangi rengin
basıldığını ÖLÇ.

Doğru çare, yüzeyin kendini beyan etmesi: kök ögeye `koyu-yuzey` sınıfı.
Kokpit ölçütü karşılıyor — ağacında `bg-white`/`slate-50`/`slate-100`
kullanımı SIFIR (ölçüldü). Sınıf eklendikten sonra özgün tonlar geri
konabildi ve boş durumdaki 5 kusurun 5'i de kapandı.

Yeni bir koyu premium yüzey eklerken sıra şu: (1) ağaçta açık kart var mı
diye SAY, (2) yoksa `koyu-yuzey` ver, (3) varsa sınıfı VERME ve renkleri
öge öge kendin belirle.


Ölçüldü: 8 araçta 21 "kusur"un 18'i bu iki sınıftandı.

**Dört genişlikte ölç: 320 · 375 · 768 · 1280.** Her breakpoint farklı bir
öge kümesi açıyor; birinde temiz çıkması ötekiler için bir şey söylemez.

### Mobil ölçümü TEK genişlikte yapma

Bu oturumdaki taşma ölçümlerinin hepsi 375px'te yapıldı ve "mobil taşma yok"
diye raporlandı. 375 tek başına yeterli değil: 320px hâlâ yaygın (iPhone SE
ve benzerleri) ve dar ekranda sıkışan bir düzen orada kırılır.

Ölçüldü — 12 açık sayfa ve premium gövde 320px'te de temiz: sayfa
`scrollWidth` 320, gövde düzeyinde taşma yok. Tablolar 4 kolonda 454-459px
genişliğe çıkıyor ama 288px'lik kutularında **kayıyor, kırpılmıyor**
(`overflowX: auto` + kolon başına en az 110px).

Yeni bir yüzey ölçerken **320 ve 375** ikisine birden bak.

**O "temiz" sonuç EKSİKTİ — sonradan her sayfada 6.86px kayma bulundu.**
Yukarıdaki ölçüm sayfa gövdesine bakıyordu; kusur ise BAŞLIK çubuğundaydı
ve AppShell'den geldiği için siteye yayılmıştı. Sağ grup (`Giriş`/`Üye Ol`
+ menü düğmesi) `shrink-0` taşıyor, yani hiç daralmıyor ve 305px'lik
belgede sağ kenarı 312'ye çıkıyordu. Taban boşluklar kısılarak düzeltildi
(`sm:` ve üstü değişmedi).

**SINIF ÖLÇÜMLE KAPATILDI.** Düzeltmeden sonra 320px'te bütün düzen
aileleri tarandı — AppShell (`/`, `/topics`, konu, `/uyelik`,
`/calisma-alanim`, `/tekrar`), araç düzeni (`app/tools/*`), premium
düzeni (`(ydus)`), ve grup dışı `giris`/`kayit`/`profile`. Onu yerelde,
altısı canlıda: **hepsinde kayma 0.** Yeni bir DÜZEN eklenmedikçe bu
ölçütü yeniden taramaya gerek yok.

Ölçüm üç filtreyi birden istiyor, yoksa sahte kusur üretir: `sr-only`
ögeler, **kırpan atası olanlar** (`overflow-x-auto` şeridin içindeki
bağlantılar taşıyor görünür) ve `position: absolute` süslemeler. Üçü de
bir turda ayrı ayrı yanılttı.

**İKİ ölçüt birden gerekiyor; hangisinin tek başına yeteceği sayfaya göre
değişiyor.** Premium branş sayfasında kaydırma denemesi SAHTE TEMİZ verdi:
negatif kontrolde 900px'lik bir öge eklendiğinde bile belge yatay kaymadı,
çünkü bir ata kırpıyor. Oradaki gerçek kusur (kart kutusu 283px, içeriği
299px) yalnızca öge başına `scrollWidth` ile göründü. Tersi de doğru —
aşağıdaki tuzak `scrollWidth`in tek başına sahte kusur ürettiğini anlatıyor.

**Taşma ölçütü `scrollWidth` DEĞİL, gerçek kaydırma denemesi olmalı.**
`resize_window` ile mobil öykünmesi açılan sekmede `window.innerWidth` 400
dönerken `documentElement.clientWidth` 375 kalıyor; `scrollWidth >
clientWidth` ölçütü orada 25px'lik SAHTE taşma üretiyor. Doğrusu:
`scrollTo(9999,0)` çağırıp `scrollX > 0` mı diye bakmak.

**Taşan şey ögenin KUTUSU olmayabilir, İÇERİĞİ olabilir.** Konu başlığı
36px ve tıbbi terimler uzun; H1'in kutusu 296px (sınır içinde) ama
`scrollWidth` 353'tü — metin kutudan taşıyor ve belgeyi kaydırıyordu.
137 konunun 26'sı bu yüzden kayıyordu ve kutu tarayan ölçüm hiçbirini
görmedi. Ölçüte `scrollWidth > clientWidth` (öge başına) da ekle; kaynağı
bulmanın en hızlı yolu sayfayı sağa kaydırıp `elementFromPoint` ile en sağ
uçta ne boyandığına bakmak. Çare `break-words` (başlıklarda `hyphens-auto`
ile birlikte).

Taşan ögeyi ararken üç eleme gerekiyor: `position: fixed` ögeler,
**kırpan atası olanlar** (`getBoundingClientRect` kırpılmış ögenin de TAM
geometrisini döndürür — footer'ın `overflow-hidden` içindeki `w-96`
süslemesi bu yüzden "taşıyor" görünür) ve sözde-ögeler
(`querySelectorAll` onları hiç görmez; bir sayfada 41px'lik gerçek kayma
bu yüzden kaynaksız kaldı).

### Hata ve boş durumların metni de üründür

Bu oturumda aynı kusur sınıfı iki ayrı yüzeyde çıktı ve ikisi de ücretli
taraftaydı:

- Premium konu sayfasındaki AI kutusu kullanıcıya **"Backend çalışıyor mu?"**
  diye soruyordu.
- İnciler sayfası hata kartında **dosya yolunu** gösteriyordu
  (`hematoloji/aml.json`), bozuk bağlantıya düşen kullanıcıyı
  **"🏴‍☠️ Güvenlik İhlali"** ile karşılıyordu ve hiçbir hata durumunda
  **geri dönüş bağlantısı yoktu**.

Yeni bir hata/boş durum yazarken üç ölçüt:

1. **Sistem iç adı geçmesin.** Backend, API, JSON yolu, hata kodu, tablo adı
   kullanıcının işi değil — teknik ayrıntı `console.error`'a gider.
2. **Kullanıcıyı suçlama.** Yanlış kopyalanmış bir adres güvenlik ihlali
   değildir.
3. **Çıkış yolu ver.** Her hata kartında geri dönülecek bir bağlantı olsun;
   yoksa kullanıcı çıkmazda kalır.

Marka sesine dokunma: "Radar", ⚓, "Sakin Deniz" gibi denizci metaforlar
MediSea temasının parçası. Düzeltilecek şey ton değil, ölçülebilir kusur
(sızıntı, suçlama, çıkmaz).

### Vurgu ayıklama kuralının İKİ dalı da sürüldü

Kural yazılıydı: konteyneri kaybolan vurgu SİLİNMEZ, yalnızca boyanmaz;
silme yalnızca konteyner VAR ama metin tutmuyorsa olur. İkisi de ölçüldü.

| durum | beklenen | ölçülen |
|---|---|---|
| konteyner yok (`c: "soru:olmayan-…"`) | kalır | **kaldı** |
| ofset çözülüyor, metin tutuyor | kalır, boyanır | **kaldı, boyandı** |
| ofset çözülüyor, metin TUTMUYOR | silinir | **silindi** |

Negatif kontrol ölçümün içinde: son iki satır AYNI ofseti taşıyor, biri
kaldı biri silindi — yani ayıklama seçici, toptan silme değil.

Kaynak da aynısını söylüyor (`ReadingTools.tsx`): konteyner yoksa
`alive.push(m)`; `if (!range || range.toString() !== m.t) continue;` ile
düşer; `if (alive.length !== saved.length) saveMarks(...)` ile süzülen
liste yazılır.

**ÜÇ ÖLÇÜM TUZAĞI — üçüne de düşüldü:**

- **Tohumlanan vurgu boyanmaz, çünkü ofsetler BAŞKA koordinat sisteminde.**
  `kap.textContent` üzerinden hesaplanan ofset, boyayıcının kullandığı
  sayımla aynı değil. Ölçüldü: arayüzle yapılan bir seçim metin düğümünde
  5–45 iken depoya 45–85 yazılıyor. Tohumla sınama yapacaksan vurguyu
  ARAYÜZLE oluştur, sonra alanlarını değiştir.
- **`localStorage.removeItem` bileşen kuruluyken KALICI DEĞİL.** Bileşen
  bellekteki listeyi geri yazıyor; silme ancak sayfa yenilendikten (ya da
  başka sayfaya geçildikten) sonra kesinleşiyor.
- **DOM'u elle değiştirmek içerik değişikliğini taklit etmiyor.** Metin
  düğümünü değiştirmek çoğu zaman `<mark>`ın KENDİ içeriğini değiştiriyor.
  Silme dalını tetiklemenin sadık yolu: gerçek bir vurgunun yalnızca `t`
  alanını bozmak — ofset çözülür, metin tutmaz, kural işler.

### Tazeleme kipinin yalıtımı ölçüldü — takvime dokunmuyor

"Baştan sona çalış" kipinin takvimi ve günlüğü DEĞİŞTİRMEMESİ bir kural
olarak yazılıydı ama hiç sürülmemişti. Sürüldü.

Oturmuş bir program tohumlandı (üç kart: 30/60/15 gün aralık, ease
2.8/3.0/2.6, streak 4/6/3) ve tazeleme kipinde üçü de cevaplandı:

| ölçüt | sonuç |
|---|---|
| `medisea:review:v1` | **bayt bayt aynı** — due, ease, interval, seen, streak hiçbiri oynamadı |
| `medisea:log:v1` | değişmedi, yeni gün eklenmedi |

**NEGATİF KONTROL şart, çünkü derecelendirme her yerde etkisiz olsaydı bu
test de geçerdi.** Bir kartın vadesi geçmişe çekilip NORMAL kipte aynı
derece verildi:

| | önce | sonra |
|---|---|---|
| interval | 30 | **84** |
| streak | 4 | **5** |
| ease | 2.8 | 2.8 (Bildim'de değişmez) |
| günlük | 2 gün | **3 gün** — yenisi eklendi, eskiler korundu |

SM-2 matematiği de doğrulanabilir: 30 × 2.8 = 84, tam.

İki ölçüm birlikte kuralın gerçek olduğunu gösteriyor: tazeleme kipi ölü
bir kod yolu değil, bilerek yalıtılmış bir kip.

### Klavye kısayolları ölçüldü — altı satırın altısı da doğru

Belgedeki üç satırlık `defaultPrevented` tablosu genişletilerek `/tekrar`
üzerinde sürüldü. Koruma hem düğmeyi kurtarıyor hem kısayolu öldürmüyor:

| hedef | tuş | `defaultPrevented` | anlamı |
|---|---|---|---|
| BODY, kart gizli | Space | **true** | kısayol çalışıyor (kartı çeviriyor) |
| BODY, kart açık | rakam | **true** | kısayol çalışıyor (derecelendiriyor) |
| BUTTON odakta | Space | **false** | düğme yutulmuyor |
| BUTTON odakta | Enter | **false** | düğme yutulmuyor |
| BUTTON odakta | rakam | **true** | rakam yine çalışıyor — bilinçli tasarım |
| yazı alanı | rakam | **false** | yazmak yutulmuyor |

Beşinci satır koddaki yorumun iddiası ("rakam kısayolları düğme
çalıştırmadığı için korumaya takılmıyor") ve ölçümle doğrulandı: düğme
odaktayken `4` tuşu kartı Kolay olarak derecelendirdi (`interval: 3,
ease: 2.65` — takvim ölçümüyle birebir).

**ÖLÇÜM TUZAĞI — rakam kısayolu KART AÇILMADAN çalışmaz.** İşleyici
`if (!revealed) return` ile erken dönüyor. Kart gizliyken gönderilen rakam
`defaultPrevented: false` veriyor ve bu "koruma kısayolu öldürmüş" gibi
görünüyor. Görünmüyor: ölçüm yanlış durumda yapılmış oluyor. Rakamı
sınamadan önce kartı GÖSTER.

### Not defteri ölçüldü — üç panel kuralının üçü de tutuyor

Belgede panel/çekmece açan yüzeyler için üç kural yazılı. Üçü de sürülerek
doğrulandı:

| kural | ölçüm |
|---|---|
| açılışta odak panele girsin | odak `ASIDE [Not defteri]` — panelin KENDİSİNE gidiyor, ilk denetime değil |
| ESC kapatsın | kapanıyor ve odak açan düğmeye (`Not defterini aç`) dönüyor |
| `role="dialog"` + `aria-label` | ikisi de var; `aria-modal` YOK — karartma yapmadığı için doğru karar |

**ESC veri kaybettirmiyor** — belgenin özellikle ölçülmesini istediği şey:
panele 59 karakter yazıldı, ESC'ye basıldı, depoda kayıt duruyor; panel
yeniden açıldığında metin birebir geri geliyor.

Çalışma Alanım entegrasyonu da çalışıyor: kart branşı, tarihi, konu
başlığını, "✎ 59 karakter not" özetini, Aç/Sil düğmelerini ve kaynağa
dönen bağlantıyı taşıyor. Not gövdesi kartta gösterilmiyor (uzun not
listeyi şişirirdi), "Aç" ile okunuyor.

**TÜRKÇE BÜYÜK HARF, `innerText` tuzağının ikinci katmanı.** `innerText`
CSS `text-transform`u uygular — bu zaten yazılıydı. Yeni olan şu: Türkçede
`i` büyük harfe `İ` olarak çevriliyor ve JavaScript'in VARSAYILAN büyük/
küçük harf katlaması `i` ile `İ`yi eş saymıyor. Yani `/Akut Miyeloid
Lösemi/i` deseni, ekranda `AKUT MİYELOİD LÖSEMİ` yazan bir başlığı
BULAMIYOR. Ölçümde "başlık görünmüyor" sanıldı; başlık oradaydı.

Çare: karşılaştırmadan önce iki tarafı da `toLocaleLowerCase("tr")` ile
indirgemek (ve `ı`→`i` eşlemek), ya da `textContent` kullanmak.

### Çalışma döngüsü uçtan uca sürüldü — dördü de çalışıyor

Belgedeki döngü **oku → vurgula → tekrar et → kaynağa dön**. Parçaları ayrı
ayrı ölçülmüştü ama zincir hiç baştan sona sürülmemişti. Sürüldü:

| adım | ölçüm |
|---|---|
| vurgula | seçim araç çubuğunu açıyor, sekiz düğmenin sekizi de etiketli |
| kaydet | `medisea:marks:v2:<yol>` yazılıyor: ofset 45–85 (seçilen 40 karakter), stil `y`, metin; başlık dizini de güncelleniyor |
| yeniden boya | sayfa yenilendikten sonra `<mark>` geri geliyor ve metni kayıttakiyle BİREBİR aynı |
| tekrar | `/tekrar`ta boşluklu kart oluyor, "Göster" ile vurgulanan metin çıkıyor, dört derecelendirme düğmesi çalışıyor |
| kaynağa dön | kartın içinde `/topics/<branş>/<konu>` bağlantısı var, konu başlığıyla etiketli |

**Ölçüm tuzağı — degrade yine yanılttı.** Vurgunun `backgroundColor`ı
`rgba(0,0,0,0)` çıkıyor ve ilk bakışta "vurgu görünmüyor" sanılıyor.
Gerçekte boyama `background-image: linear-gradient(transparent 55%,
rgba(250,204,21,0.55) 55%)` ile yapılıyor — fosforlu kalem etkisi, yalnızca
alt %45 sarı. Kontrast bölümündeki "degradeyi göremeyen ölçüm" uyarısı
burada da geçerli: `mark` ögesini `backgroundColor` ile yoklama.

Seçimi programla kurmanın yolu: `document.createRange()` + `setStart/setEnd`
bir METİN düğümünde, sonra `getSelection().addRange()` ve
`selectionchange` olayını elle tetikle.

### Flashcard oynatıcısı ölçüldü — sınıf temiz

Kapının arkasında olduğu için geçici bir tanı rotasıyla (`force-dynamic`,
gerçek kart dosyasından 4 kart) sürüldü.

| ölçüt | sonuç |
|---|---|
| işaretleme kalıcı mı | evet, `medisea:kartlar:v1:<setId>` yazılıyor |
| sayaç | 1 → 2 → 3, yüzde %25 · %50 · %75 (n/4 ile birebir) |

**Asıl sınama, belgede geçen "%240" kusuru:** setten ÇIKARILMIŞ kart
kimlikleri depoda kalırsa yüzde 100'ü aşıyordu. 3 meşru işaretin yanına
6 hayalet kimlik tohumlandı — koruma olmasa ekran %225 derdi.

Ölçüldü: ekran **%75** gösterdi VE depo temizlendi (9 kimlik → 3, hayalet
kimlik 0). Yani düzeltme yalnızca gösterimi kırpmıyor, süzülen listeyi
geri yazıyor. Negatif kontrol aynı ölçümün içinde: meşru 3 işaret hayatta
kaldı, yani koruma hepsini silmiyor.

Bu kusur bozuk veriyle DEĞİL, normal içerik düzenlemesiyle oluşuyor —
setten bir kart çıkarmak yetiyor.

### Tekrar takvimi ölçüldü — sınıf temiz

`/tekrar` motorunun kart üretimi ve kontrastı ayrı ayrı ölçülmüştü ama
ZAMANLAMA hiç sürülmemişti. Üç vurgu gerçek konu metninden kesilip
tohumlandı, sayfa açıldı ve üç kart üç ayrı dereceyle cevaplandı. Takvim
matematiği düğmelerin vaadiyle BİREBİR tutuyor:

| derece | aralık | ölçülen vade farkı | ease | streak |
|---|---|---|---|---|
| Bildim | 1 gün | tam 86.400.000 ms | 2.5 (değişmedi) | 1 |
| Kolay | 3 gün | tam 259.200.000 ms | 2.5 → 2.65 | 1 |
| Bilemedim | — | tam 600.000 ms (10 dk) | 2.5 → 2.30 | 0 |

Günlük de doğru: `kart` 1→2→3 sayarken `dogru` 1→2→2'de kaldı, yani
başarısız kart doğru sayılmıyor.

**Ölçüm tuzağı:** düğmeye tıklayıp AYNI karede DOM okumak eski durumu
verir — React henüz yeniden çizmemiş oluyor. Her tıklamadan sonra ~600 ms
beklemek gerekiyor. İlk denemede "tıklama işe yaramadı" sanıldı.

Tohum bitince `medisea:*` anahtarlarının hepsi silinmeli; ölçüm verisi
kullanıcının deposunda kalmamalı.

### QuizEngine çalışma akışı ölçüldü — sınıf temiz

Motorların hata kartları, kontrastı ve klavye erişimi ayrı ayrı ölçülmüştü
ama ASIL İŞİ hiç sınanmamıştı. Geçici bir dev rotasıyla (kapıyı atlayıp
`QuizEngine`'i gerçek quiz dosyasıyla render eden bir sayfa) uçtan uca
sürüldü: 10 soru, 7'si bilerek doğru 3'ü bilerek yanlış cevaplandı.

| ölçüt | sonuç |
|---|---|
| puanlama | kayıt verilen cevaplarla BİREBİR: 7 true / 3 false |
| ilerleme kaydı | yazılıyor, `{i, s:{s1..s10}}` biçiminde |
| sonuç ekranı | "%70 · 10 soruda 7 doğru · 3 yanlış" — doğru |
| kurtarma yolu | yanlış soruları tekrar çözme + baştan çözme sunuluyor |

**Üç ölçüm tuzağı — üçüne de düşüldü:**

- **İlerleme anahtarı dosya adından DEĞİL** quizin kendi `id` alanından
  türüyor: `quiz-progress-quiz-endo-cushing-001`. Dosya adıyla arayan ilk
  ölçüm `null` gördü ve "ilerleme kaydedilmiyor" sanıldı.
- **Cevap verdikten sonra şıklar `disabled` DEĞİL** ama motor mantıksal
  olarak koruyor — başka şıkka tıklamak kaydı değiştirmiyor. `disabled`
  yokluğuna bakıp kusur raporlama; davranışı ölç.

  Aynı koruma **VakaEngine'de de var** — ayrıca ölçüldü: yanlış cevaptan
  sonra başka şıkka tıklamak kaydı değiştirmiyor, ekran aynı kalıyor
  (`✗` seçilende, `✓` doğruda). İki motor bu konuda tutarlı.
- **Son sorunun düğmesi "Sonuç*u* gör".** `/Sonuç/` deseni tutmuyor
  (ç ≠ c). Yine desen tahmini yerine ekrandaki gerçek metni oku.

Geçici rota silinirken `.next/types` altındaki artık da silinmeli; yoksa
`tsc` olmayan bir modülü aramaya devam eder.

### Yetki kontrolü tek yerde: `lib/yonetici.ts`

`session?.user?.email === process.env.ADMIN_EMAIL` karşılaştırması beş ayrı
uçta elle tekrarlanıyordu. Tekrarlanan bir güvenlik kontrolü bir yerde
unutulduğunda sessizce açık bırakır — nitekim `/api/topics` ve
`/api/topics/[slug]` PUT uçlarında unutulmuştu. İkisi de
`content/canonical/<branş>/<konu>.json` dosyasına DOĞRUDAN yazıyor ve
yetkisiz bir istek gerçek bir konuyu gerçekten değiştirebiliyordu.

Yazma yapan yeni bir uç eklerken `yoneticiMi()` kullan. Yardımcı,
`ADMIN_EMAIL` tanımlı değilse herkesi reddeder: yapılandırma eksikliği
kapıyı açmamalı.

**Güvenlik kontrolü eklerken önce KAYNAKTA olduğunu doğrula.** Bu değişiklik
betikle yapıldığında `import` satırı girdi ama gövdedeki çağrı eşleşmedi ve
sessizce atlandı; kusur ancak negatif kontrolde ortaya çıktı — ve o kontrol
gerçek bir içerik dosyasını değiştirdi (`git checkout` ile geri alındı).
Sıra şu olmalı: düzenle → `grep` ile çağrının yerinde olduğunu gör →
derlemenin yenilendiğinden emin ol → sonra dene.

### `/api/_*` uçları ULAŞILAMAZ

Next'te alt çizgiyle başlayan klasörler rotaya alınmıyor; `app/api/_admin`,
`app/api/_content`, `app/api/_plan`, `app/api/_progress`, `app/api/_questions`
altındaki 14 route dosyası canlıda **404**. Kaynağa bakınca
"`/api/_plan/set` yetkisiz plan değiştiriyor" sanılıyor — öyle bir uç yok.
Yetki denetimi yaparken kaynağa değil DAVRANIŞA bak.

**Aynı kural SAYFALARDA da geçerli ve orada daha pahalı.** `app/(ydus)/…/
premium/ydus/` altında beş klasör alt çizgiyle başlıyor (`_endokrinoloji`,
`_gastroenteroloji`, `_hematoloji`, `_nefroloji`, `_romatoloji`) ve
içlerindeki **28 sayfa (4550 satır) canlıda yok.** Bilerek kapatılmışlar
(`0dd58a5`, elle yazılan sayfalardan dinamik şablona geçiş) ama göç yarım
kalmış: 16 yaprak konu sayfasının yalnızca 5'i JSON'a taşınmış.

Bunun ölçüme etkisi şu: "bu konunun içeriği yok" sonucu YANLIŞ olabilir —
içerik ölü bir sayfada duruyordur. Yetim bir içerik dosyası görünce
`_<branş>/` altına da bak. Akromegali tam olarak böyleydi: 79 yetim kart
"konu yazılmalı" gibi görünüyordu, oysa 546 satırlık konu metni ölü
sayfada hazırdı.

Ölü sayfaları silmek de çare değil — göç edilmemiş klinik metnin tek
kopyası orada.

### `:lang` kalıbı `api`yi de yakalar

`next.config.js`'teki dil yönlendirmesi `/:lang(...)/premium/:yol*`
biçiminde. Eleme listesine `api` konmazsa `/api/premium/...` istekleri de
`/tr/premium/...` HTML sayfalarına 308'lenir — yani API çağrıları sessizce
sayfa döndürür. Bir kez oldu ve erişim kapısının arkasındaki panoda olduğu
için birkaç tur fark edilmedi.

### Konsol hatası ararken ölçüm yönteminin kendisi hata üretir

İki tuzak, ikisine de düşüldü:

- **Dinleyiciyi yükleme SONRASI takmak.** `window.addEventListener('error')`
  sayfa yüklendikten sonra takılırsa açılıştaki hatalar zaten kaçmıştır;
  "0 hata" sonucu yanıltıcıdır.
- **Hızlı iframe gezinmesi hayalet hata üretir.** Ölçüm için `iframe.src`'yi
  arka arkaya değiştirmek uçuştaki istekleri iptal ediyor
  (`net::ERR_ABORTED`) ve NextAuth bunu `AuthError: Failed to fetch` diye
  konsola yazıyor. Canlıda gerçek bir kusur sanıldı; **temiz bir sekmede
  tek bir gerçek gezinmeyle** sınandığında hiç hata çıkmadı.

Doğrusu: `tabs_create` ile yeni sekme aç, `navigate` ile git,
`read_console_messages` ile oku. Aynı sekmede biriken geçmiş de yanıltır.

### Dağıtımın indiğini İSTEMCİ tarafı bir işaretle yoklama

`curl | grep` ile "yeni kod indi mi" diye bakarken, aranan şey istemci
bileşeninde basılıyorsa sunucu HTML'inde HİÇ görünmez ve yoklama sonsuza
kadar "inmedi" der. Bu oturumda üç kez oldu: not tutamağının `aria-label`'ı,
`role="status"` bölgeleri, tekrar sayfasının Tailwind sınıfları. Her seferinde
kod çoktan inmişti.

Yoklamayı **sunucuda basılan** bir işaretle yap — aynı commit'teki bir
metadata değeri, bir sunucu bileşeni sınıfı, `sitemap.xml` içeriği gibi.
İşaret bulunamıyorsa doğrudan tarayıcıyla bak; zaten canlı doğrulamanın
kuralı bu.

En güvenilir işaret **CSS paketi**: `/_next/static/css/<hash>.css` parmak
izli, sunucudan geliyor ve stil değiştiyse kesin değişiyor. Sayfanın kendisi
ISR ile önbellekteyken bile paket yeni olur.

**`grep -c` EŞLEŞMEYİ DEĞİL SATIRI SAYAR.** Üretim HTML'i küçültülmüş, yani
32 eşleşme tek satırda duruyor ve `grep -c` "1" der. Bu, dağıtım inmediği
izlenimi verdi. Sayı istiyorsan `grep -o … | wc -l` kullan; varlık/yokluk
yetiyorsa `-c` yeterli ama sayıya güvenme.

### Global klavye kısayolları odaktaki ögeyi yutmamalı

`window` üzerinde keydown dinleyip `preventDefault()` çağıran her kısayol,
hedefi kontrol etmezse odaktaki düğmenin çalışmasını iptal eder. Flashcard
oynatıcısı bir dönem Space **ve Enter**'da bunu yapıyordu: dört düğme de
Tab'lanabiliyor ama tetiklenemiyordu — ücretli yüzeyde tam klavye kilidi.

Ortak koruma: `app/lib/klavye.ts` → `kisayolSusmali(e)`. Bilerek dar:
yazı alanlarında her kısayol susar, Space/Enter yalnızca hedef düğme ya da
bağlantıysa susar, rakam kısayolları (tekrar sayfasındaki 1-4) bir düğmeyi
çalıştırmadığı için susmaz.

**Bunu ölçerken tarayıcı otomasyonunun iki kısıtı var** ve ikisi de yanlış
sonuç ürettirdi:

- `computer key "space"` olayı `key: ""` olarak gidiyor — Space tuşu hiç
  iletilmiyor. ArrowRight/Enter/Escape doğru gidiyor.
- Enter, odaktaki düğmede **click üretmiyor**. Uygulamadan bağımsız, DOM'a
  elle eklenen sade bir düğmede de üretmedi. Yani "Enter'a bastım hiçbir
  şey olmadı" tek başına kusur kanıtı DEĞİL.

Doğru sinyal `e.defaultPrevented`: ayrı bir dinleyici takıp
`setTimeout(...,0)` ile kısayoldan SONRA oku. Beklenen tablo:

```
hedef BUTTON, koruma yok  -> defaultPrevented true   (bozuk)
hedef BUTTON, koruma var  -> defaultPrevented false  (doğru)
hedef BODY,   koruma var  -> defaultPrevented true   (kısayol hâlâ çalışıyor)
```

Üçüncü satır olmadan düzeltme doğrulanmış sayılmaz — koruma kısayolu tümden
öldürmüş de olabilir.

### Erişilebilir ad: ölçülen beş kusur biçimi

`title` bir dönem "ad var" sanılıyordu. Değil — hesaplama sırası içeriği
`title`ın ÖNÜNE koyuyor ve içerik boş değilse `title` hiç devreye girmiyor.
Beş ayrı biçimde ölçüldü:

| biçim | örnek | adı neydi |
|---|---|---|
| glif içerik + `title` | `<button title="Kaldır">✕</button>` | **"✕"** |
| emoji + sayaç | vurgu paneli düğmesi | **"🖍1"** |
| aynı `title`, çok düğme | dört renk düğmesi | dördü de **"Renk"** |
| tek harf içerik | panel genişliği S · M · L | **"S"** |
| glif HARFİN YERİNE geçiyor | quiz/vaka şıkları, cevaptan sonra | harf addan DÜŞÜYOR |

Sonuncusu en sinsisi: geri bildirim "Doğru cevap D." diyor ama D düğmesi
artık harfini duyurmuyor, çünkü daire `✓` ile değişmiş. Görsel kullanıcı
için sorun yok, okuyan için bağ kopuyor.

**Çare iki türlü, hangisi mümkünse:**
- Glif AYRI bir ögedeyse `aria-hidden="true"` yeter (kokpit böyle).
- Glif içeriği DOĞRUDAN değiştiriyorsa `aria-label` ile adı baştan kur
  (quiz ve vaka böyle) — harfi koru, durumu YAZIYLA ekle:
  `"D: … — doğru cevap"`, `"A: … — senin seçimin, yanlış"`. Dokunulmayan
  şıkka ek koyma, gürültü olur.

**Örneklem TEMSİLİ mi — önce SAY, sonra seç.** Araç sayfalarında ad
taraması üç araçla başladı, üçünde de yalnızca iki düğme çıktı ("Geri",
"ARACI PAYLAŞ") ve "bütün araçlar aynı kabuğu kullanıyor, biri hepsidir"
sonucuna varılacaktı. Kaynakta sayınca tersi göründü: **114 aracın 61'inin
kendi düğmesi var**, `sodium`da 5, `apache2`de 88. Örneklem tesadüfen
düğmesiz üçünü seçmişti.

Düğmesi en çok olan dört araç ölçüldü — 134 düğme, **sıfır sorunlu ad**.
Şıklar görünür metin taşıyor (skor değeri, vücut bölgesi, evet/hayır), yani
sınıf araç sayfalarında yok. Ama bu sonuç, örneklem doğru seçildiği için
güvenilir; ilk üçle kalınsaydı aynı sonuç YANLIŞ gerekçeye dayanacaktı.

**Kaynakta ad aramak GÜVENİLMEZ.** Bir tarama `<button>` içeriğini
düzleştirip 22 aday buldu; çoğu sahteydi, çünkü `{...}` JSX ifadeleri
silinince etiketi değişkenden gelen düğmeler "içeriği boş" görünüyor.
Tarayıcıda hesaplatmak tek güvenilir yol.

**`textContent` `aria-hidden`'ı DİKKATE ALMAZ.** `aria-hidden` eklendikten
sonra `textContent` hâlâ glifi gösteriyor ve "düzeltme çalışmadı" sanılıyor.
Doğru ölçüm: ögeyi klonla, `[aria-hidden="true"]` alt ağaçlarını çıkar,
sonra metni oku.

**Koşullu denetimler ilk taramada GÖRÜNMEZ.** Seçim çubuğunun dokuzuncu
düğmesi (vurgu kaldır) yalnızca VAR OLAN bir vurguya tıklanınca çıkıyor;
taze seçimde yok. O durumu kurmak için `mark.click()` yetmedi,
`pointerdown → mousedown → pointerup → mouseup → click` dizisi gerekti.

### Bir ögeyi SİLEN her denetim odağı bir yere BIRAKMALI

Üç ayrı yüzeyde aynı kusur ölçüldü: silinen düğme DOM'dan kalkınca odak
`<body>`ye düşüyor ve klavyeyle gezen kullanıcı yerini tamamen kaybediyor.

| yüzey | eylem | yeni hedef |
|---|---|---|
| Çalışma Alanım | kayıt sil | kalan ilk "Sil" düğmesi; kayıt bitmişse listenin sarmalayıcısı |
| Vurgu paneli | vurgu kaldır | kalan ilk kaldırma düğmesi |
| Yedekten yükle | üzerine yaz | `role="status"` durum mesajının kendisi |

**`requestAnimationFrame` ile odaklama ÇALIŞMIYOR — ölçüldü.** Kare
React'in commit'inden önce gelebiliyor; o anda eski düğme hâlâ DOM'da,
yenisi henüz yok. Doğrusu bir bayrağı DURUMA koyup listeyi besleyen
duruma bağlı bir etkide odaklamak.

**Ref'i listeye koyma, HER İKİ DALDA duran sarmalayıcıya koy.** Son kayıt
silindiğinde liste tümden kalkıp boş durum geliyor ve liste ref'i `null`
oluyor — ölçüldü, odak yine `<body>`ye düştü.

**Bileşenin tamamı unmount oluyorsa yapılacak bir şey yok.** Vurgu
panelinde son vurgu kaldırıldığında `ReadingTools` tümden kalkıyor, panel
açma düğmesi bile kalmıyor. Sayfadaki başka bir ögeye atlamak bir TASARIM
kararı; bileşenin yetkisi dışında ve öyle bırakıldı.

**Aynı listede tekrarlanan denetimin ADI ayırt edici olmalı.** Üç kayıtta
üç düğmenin de adı "Sil"di; düğmeler arasında gezen kullanıcı hangisini
sildiğini bilemiyordu. `title` ad OLMAZ (içerik doluyken hesaba girmiyor).
Çare `aria-label` içine ögenin kimliğini koymak: "Akut Miyeloid Lösemi
(AML) sayfasındaki her şeyi sil", "Vurguyu kaldır: <ilk 40 karakter>".

### Panel/çekmece açan her yüzey üç şeyi sağlamak zorunda

Not defteri bir dönem üçünü de sağlamıyordu; ekranı kaplayan bir çekmece
olduğu hâlde klavyeyle pratikte kullanılamıyordu.

- **Açılışta odak panele girmeli**, kapanışta açan düğmeye dönmeli. Odak
  `<body>`'de kalırsa kullanıcı panele ulaşmak için sayfayı en baştan
  Tab'lamak zorunda. Odağı ilk denetime değil panelin KENDİSİNE ver
  (`tabIndex={-1}`) — ekran okuyucu önce adı ve rolü duyurur.
- **ESC kapatmalı.** Fare kullanamayan biri için tek çıkış yolu.
- **`role="dialog"` + `aria-label`.** `aria-modal` yalnızca sayfanın geri
  kalanı gerçekten erişilemezse verilir; not defteri masaüstünde karartma
  yapmadığı için vermiyor.

ESC eklerken **veri kaybettirmediğini ölç**: panele yazıp ESC'ye bas, sonra
yeniden aç. Kaybettiren bir ESC, hiç olmamasından kötüdür.

Vurgu çubuğu (`ReadingTools`) bu işin doğru yapılmış örneği:
`role="toolbar"`, `aria-label`, sekiz düğmenin hepsi 32×32 ve etiketli.

**Sayfa kök ögesi `<main>` OLMAMALI.** AppShell ve `(ydus)/layout.tsx` zaten
basıyor; sayfa da basınca belgede iki `main` landmark'ı oluşuyor (geçersiz,
ekran okuyucu hangisinin ana içerik olduğunu bilemiyor). Ana sayfa ve premium
pano bir dönem böyleydi.

**Satır içi stil bu tabanların HİÇBİRİNE uymaz.** Yukarıdaki üç kural
`globals.css` içinde ve Tailwind sınıflarına bakıyor; premium motorlar
(`QuizEngine`, `VakaEngine`, `FlashcardPlayer`) ise renk ve boyutu
`style={{ ... }}` ile veriyor. Satır içi stil zaten stil sayfasını yener,
yani kural oraya hiç ulaşmıyor. Sonuç bir dönem şuydu: **ücretli yüzey,
ücretsiz yüzeyden okunaksızdı** — şıklar 13px, kısa açıklamalar 11.5px,
sayaç ve ipuçları 1.7–3.6 kontrastta.

Satır içi stil kullanan bir yüzeye dokunuyorsan boyutu ve rengi kendin
sağlamak zorundasın:

- okunan metin (soru kökü, şık, açıklama, klinik bilgi) **15px**,
  ikincil açıklama **14px**; rozet/sayaç/düğme yazısı serbest
- ikincil metin rengi açık zeminde `#4a6a8a` (beyazda 5.65), gri
  kademe gerekiyorsa `#5a6a8a`, koyu kademe `#4a5a7a`
- yeşil vurgu `#2a7a4a`, koyu yeşil `#1a6640`

Denetimi otomatik yapmak istersen ölçüt basit: kaynakta
`color: '#...'` değerlerini komşu `background` ile eşleştirip kontrast
hesapla. Ama pencereyi **±2 satırda** tut — daha genişi stil nesnesi
sınırını aşıp yakındaki başlık rengini "zemin" sanıyor ve koyu zeminde
duran beyaz yazıları kusur gibi gösteriyor.

### İçerikteki `**kalın**` işaretini render eden tek yer: `app/lib/metin.tsx`

Motorlar ve blok işleyicileri içerik dizgesini doğrudan JSX'e basıyordu;
içerik yazarı `**en kritik**` yazınca kullanıcı ekranda yıldızları görüyordu.
Kusur **beş yüzeyde birden** vardı ve tek bir motora bakan ölçüm kapsamı çok
küçük gösteriyordu: premium konu sayfası (39 dosyanın 36'sında **257 alan**),
inciler (13 alan), kokpit, vaka ve quiz motorları.

İçerik dosyasına DOKUNULMAZ — dönüşüm render tarafında yapılır. Üç dışa
aktarım var, seçim çağrı yerinin şekline göre:

| Ne basıyorsun | Kullan |
|---|---|
| JSX düğümü (olağan durum) | `kalinIsle` → `<strong>` + `Fragment` döndürür |
| `dangerouslySetInnerHTML` (yalnızca inciler) | `kalinHtml` → dizge döndürür |
| Dizge bekleyen alan (kırpılan önizleme, `aria-label`) | `duzMetin` → işareti söker |

`kalinIsle` bilerek React düğümü döndürüyor, HTML dizgesi değil: girdi içerik
dosyasından geliyor ve HTML'e çevirmek kaçırma (escape) sorumluluğunu her
çağrı yerine dağıtırdı. Gerçek içerikle ölçüldü — `**Çapı <2 cm olan…**`
çıktıda `&lt;2` oluyor, etiket açmıyor.

`kalinHtml` yalnızca zaten ham HTML basan çağrı yerleri için ve yakaladığı
metinde `<` `>` kabul etmiyor (işaret bir etiketi ikiye bölmesin). Yeni bir
yüzey yazarken bunu değil `kalinIsle`'yi kullan. Not: inciler alanı ham HTML
basıyor ama **13 incinin hiçbirinde etiket yok** — orada `dangerouslySetInnerHTML`
bugün karşılıksız duruyor.

Kapsam bilerek dar: yalnızca `**` çifti, tek satır içinde. `*`, `_`, `#`
dönüştürülmüyor — klinik metinde `Na*` gibi kullanımlar biçim değil. Kapanmayan
işaret, `****` ve satır atlayan çift olduğu gibi kalır.

**Sonucu doğrudan bir FLEX/GRID kapsayıcının çocuğu olarak basma.** Tek metin
düğümü tek anonim flex ögesiyken, bölünen metin BİRDEN ÇOK öge olur;
kapsayıcının `gap` değeri kelimelerin arasına girer ve dar ekranda satır kelime
yerine bloklar hâlinde sarar. Kokpitin soru başlığında ölçüldü: üç öge,
aralarında 8'er px. Kapsayıcı flex ise sonucu bir `<span>` içine al. Taraması
tek satır: her `<strong>`'un ebeveyninin `display`'ine bak, `flex`/`grid`
görürsen kusur.

### Başlık düzeyleri render tarafında oturtulur — `app/lib/baslik.ts`

Konu sayfası bölüm başlıklarını `<h2>` basıyor ama içerik HTML'i neredeyse
tamamen `<h4>` kullanıyor (410 görünür konuda 1771 `h4`, 1 `h3`, 33 `h5`).
Araya h3 girmediği için **240 konuda (görünürlerin %59'u) 907 düzey
atlaması** vardı; ekran okuyucuda başlık düzeyiyle gezinen kullanıcı için
belge taslağı kırılıyordu.

Çare `metin.tsx` ve `kisaltma.ts` ile aynı karar: **içerik dosyasına
dokunulmaz, dönüşüm render tarafında.**

Kural sabit eşleme DEĞİL. Önce `h4→h3, h5→h4` denendi: 907 atlamayı 16'ya
düşürdü ama sıfırlamadı, çünkü bazı bölümler h3 ile h5'i birlikte
kullanıyor, bazıları yalnızca h5 taşıyor. Doğrusu bölüm İÇİNDE kullanılan
seviyeleri artan sırada 3, 4, 5… diye yeniden numaralamak — bölümün kendi
iç hiyerarşisi korunuyor, taslak da bozulmuyor. Bu kuralla atlama SIFIR.

Kapsam yalnızca AÇIK taraf: premium konu dosyalarında HTML başlığı hiç yok
ve premium konu sayfası `dangerouslySetInnerHTML` kullanmıyor (ölçüldü).

### Kısaltmalar ilk kullanımda açılır — sözlük ELLE seçilir

`app/lib/kisaltma.ts`. İçerik dosyasına dokunulmaz; dönüşüm render
tarafında, `metin.tsx` ile aynı karar.

**Otomatik açılım denenmemeli.** Ölçüldü: 456 konuda ham tarama 2298
"kısaltma gibi görünen" dizi buluyor — ürün adı (`YDUS`, 171 konu), Roma
rakamı (`II`, `III`), büyük harfle yazılmış Türkçe kelimeler (`VEYA`) ve
desenin kestiği gen adları (`TP53` → `TP5`). Sözlükte olmayan hiçbir şey
açılmaz; "bilinen" kısaltmalar (EKG, LDL-c) listeye hiç girmez, ayrı bir
atlama listesi gerekmez.

Sözlüğe girdi eklerken ölçüt: **açılımı tartışmasız mı?** Bağlama göre
değişenler (`CD`, `PD`, `CR`, `OS`), kurum adları (`KDIGO`, `ECOG`) ve
ilaç/gen adları (`PCSK9`, `DDAVP`, `JAK2`) dışarıda — yanlış açılım
kullanıcıya konuyu yanlış öğretir ve bu bir içerik kararıdır.

Üç şey kolay kaçar:

- **İlk kullanım SAYFA başına.** Küme özetten başlayıp bölümlere taşınır;
  özet sayfada bölümlerin üstünde basılıyor. Küme yalnız bölümlerde
  kurulduğunda açılım gövdenin ortasında kalıyordu (ölçüldü).
- **Etiketlerin içine girilmez.** İçerik `dangerouslySetInnerHTML` ile
  basıldığı için `<a href="...BT...">` ya da `title="BT"` içinde yapılan
  değişiklik biçimi bozar. Metin `<...>` parçalarına bölünüp yalnızca
  etiket dışı kısımlar işlenir.
- **Uzun anahtar önce denenir.** `SGLT2` varken `SGLT` eşleşirse açılım
  yanlış olur. Ayrıca kelime sınırı `\b` ile kurulamaz — JS'in `\b`'si
  ASCII'ye göre çalışır ve `GİS` gibi anahtarlarda yanlış eşleşir.

Başlık (`title`) bilerek dışarıda: yeniden yazmak künyeyi, sekme adını ve
paylaşım kartını da değiştirirdi.

**ÖLÇME yüzeylerine uygulanmaz.** Ölçüldü: quiz (952 geçiş), flashcard
(255) ve vaka (111) dosyalarında bol kısaltma var ama üçü de sınav
içeriği — vaka adımlarının alanları `soru`, `secenekler`, `dogru`,
`aciklama_*`. "SIADH'de ne beklenir?" sorusundaki kısaltmayı açmak
cevabın parçasını peşinen verir; YDUS sorusu kısaltmayı bilerek çıplak
kullanır. Kapsam bu yüzden yalnızca okuma yüzeyleri: açık konu sayfası ve
premium konu gövdesi.

Tablolar da dışarıda — hücreler dar ve tablolar 320px'te kolon başına en
az 110px ile ancak sığıyor; bir kısaltmayı üç katına çıkarmak taşma üretir.

İnciler yüzeyi kapsam dışı bırakıldı: toplam 4 geçiş var, yani kazanç yok.

### Tarayıcıda kontrast ölçen betiğin sekiz tuzağı

Sekizi de gerçekten yanılttı; beşi kusur uydurdu, üçü gerçek kusuru gizledi.

- **SAYDAM ZEMİN — metnin alfasını çözmek YETMEZ.** İlk maddedeki alfa
  bindirmesini yalnızca YAZI rengine uygulamak, zemin de saydamsa yeni bir
  hata üretiyor: zincirde `alpha > 0` olan ilk zemin opak sanılıyor.

  Ölçüldü (canlı ana sayfa): rozet metni `rgba(255,255,255,0.6)`, kendi
  zemini `rgba(255,255,255,0.1)`, onun altındaki gerçek opak zemin ise
  `rgb(23,37,84)`. Saydam zemin opak beyaz sayılınca beyaz yazı beyaz
  zeminde çıkıyor ve kontrast **1.00** hesaplanıyor — altı sahte kusur.
  Doğru hesapla gerçek değer ~5.0, yani sorun yok.

  Doğrusu: yukarı yürürken saydam zeminleri BİRİKTİR, ilk opak zeminde dur
  ve katmanları alttan üste doğru bindir. Sonra yazıyı bu bileşke zemine
  bindir.

  **Ters yönde de vurur:** açık saydam bir katman koyu zeminin üstündeyse,
  koyu yazılarda kontrast olduğundan YÜKSEK hesaplanır ve gerçek kusur
  gizlenir. Bu yüzden düzeltmeden sonra daha önce "temiz" denen yüzeyler
  yeniden ölçülmeli — ölçüldü, bu depoda gizlenmiş kusur çıkmadı.

- **Düz 4.5 eşiği BÜYÜK METİNDE kusur uydurur.** WCAG eşiği metin boyutuna
  göre değişiyor: ≥24px (ya da ≥18.66px + kalın) için 3.0, ötekiler için
  4.5. Sabit 4.5 kullanan bir tarama künyedeki 30px'lik "Medi"yi 4.0 ile
  "kusurlu" gösteriyordu — oysa o boyutta eşik 3.0 ve yazı geçiyor.
  Ölçüt `fontSize` ve `fontWeight` okumadan doğru olamaz.

  Aynı yerde bir kusur da ATLANMIŞTI: `<h2>` içindeki 24px'lik süsleme
  "#" işareti 1.42'ydi ve büyük-metin eşiğiyle bile kalıyordu. Yani
  eşiği düzeltmek kusuru gizlemedi, yalnızca uydurmayı eledi.

  Süsleme gliflerinde çare RENK DEĞİL `aria-hidden="true"`: işaret bilgi
  taşımıyorsa erişilebilirlik ağacından çıkarılmalı — hem kontrast
  kapsamından düşer hem de ekran okuyucudaki gürültü kalkar (her bölüm
  başlığının önünde "kare", her bağlantının önünde "sağ ok" okunuyordu).
  Gizledikten sonra **erişilebilir adı HESAPLAYARAK** doğrula: gizleme
  yanlış ögeye konursa bağlantı adsız kalır.

- **SAYDAM METİN — en pahalısı, en sinsisi.** `getComputedStyle(el).color`
  değerinden ilk üç sayıyı okuyup rengi opak saymak, Tailwind'in
  `text-blue-900/40` gibi sınıflarını **tamamen görünmez kılar**: DOM'a
  `rgba(30, 58, 138, 0.4)` olarak gelir, alfa atılınca kontrast 10.36
  hesaplanır, gerçekte 2.16'dır. Bu körlük yüzünden araç sayfalarındaki
  200'ü aşkın yazı — her form alanının ÜSTÜNDEKİ etiket dahil — bir tur
  boyunca "temiz" göründü.
  Doğrusu: alfayı ayrıştır ve zemine bindir:
  `etkin = renk*alfa + zemin*(1-alfa)`.

- **Yalnızca yaprak ögeye bakmak kusur GİZLER.** `e.children.length === 0`
  ile süzersen `<button>Zor<span>2 · kısa</span></button>` gibi düğmelerde
  ana etiket hiç ölçülmez, çünkü düğmenin bir çocuğu var. Tekrar
  sayfasında dört derecelendirme düğmesinin üçü bu yüzden "temiz"
  görünüyordu; gerçekte beyaz yazı amber-500'de **2.15** kontrasttaydı.
  Doğrusu: her ögenin KENDİ doğrudan metin düğümlerini (`nodeType === 3`)
  birleştirip onu ölç.
- **Degrade zemin kusur UYDURUR.** `bg-gradient-*` sınıfları
  `background-image` yazar, `backgroundColor` şeffaf kalır. Zemin ararken
  yukarı yürüyen betik degradeyi atlayıp sayfanın beyazını zemin sanıyor;
  koyu degrade üzerindeki beyaz yazı 1.05 kontrast gibi görünüyor.
- **Emoji kusur UYDURUR.** Emoji kendi renginde çizilir, `color` ona
  uygulanmaz. Metni yalnızca emojiden ibaret olan ögeleri ölçme.
- **SVG metni kusur UYDURUR.** `<text>` rengini `fill` ile alır; `color`
  ölçmek alakasız bir değer verir ve zemini de kardeş `<rect>`'tir.
  Wells grafiğindeki bant etiketleri bu yüzden kusurlu göründü.
  `el.namespaceURI` SVG ise atla.
- **Mutlak konumlu öge kusur UYDURUR.** `position: absolute` bir yazı
  görsel olarak KARDEŞİNİN üstünde durur; ata zincirini yürüyen zemin
  arayıcı onun altındaki koyu kutuyu göremez ve sayfanın beyazını zemin
  sanar. Birim çevirici bu yüzden 1.42 gösteriyordu, gerçekte 7.29'du.

**Çok sayfalı taramayı YEREL dev sunucuda yapma.** Next dev her rotayı ilk
ziyarette derliyor; 114 araç sayfası için tarama 13. sayfada saatlerce
takıldı. Aynı tarama CANLIDA birkaç dakikada bitti, çünkü orada bütün
rotalar önceden derlenmiş. Yerel ölçüm tek sayfa ya da yeni değiştirilmiş
birkaç sayfa için doğru araç; kütle taraması canlıda (ya da `npm start`
ile üretim derlemesinde) yapılır — yalnız o zaman ölçtüğün şeyin son
dağıtım olduğunu unutma.

**`innerText` CSS `text-transform` UYGULAR — `textContent` uygulamaz.**
Bu depo `uppercase` sınıfını bolca kullanıyor, yani metin varlığı sınayan
her ölçüm etkileniyor. Ölçüldü: hata sınırının başlığı kaynakta
"Bu sayfa açılamadı", `textContent` aynısını veriyor ama `innerText`
**"BU SAYFA AÇILAMADI"** döndürüyor — arama `false` çıkıyor ve sınır
çalışmıyor sanılıyor. Metin ararken `textContent` kullan, ya da iki tarafı
da aynı kurala indir.

**Hata sınırları `curl` ile GÖRÜNMEZ.** `error.tsx` ve `global-error.tsx`
istemci bileşeni; sunucu 500 verirken yalnızca kabuk gönderiyor. Ham
HTML'de sınırın metni YOK, tarayıcıda VAR. Bir hata ekranını doğrulayacaksan
tarayıcıyla bak — ve **dev kipinde değil**: `next dev` kendi hata katmanını
basıp sınırı tümden gizliyor. Ölçüm üretim derlemesiyle yapılır (geçici
rota `force-dynamic` olmalı, yoksa prerender derlemeyi düşürür).

**Ekran dışı iframe'de `innerText` içeriğin ÇOĞUNU düşürür.** Ölçüldü
(`left:-9999px` konumlu çerçevede, kardiyoloji branş sayfası):
`body.innerText` 1201 karakter, `body.textContent` 94478. `innerText`
yalnızca tarayıcının boyanmış saydığı metni verir. Bu yüzden "Diğer
Konular bölümü yok" diye yanlış bir sonuç alındı — bölüm oradaydı.

Metin varlığı sınarken `textContent` kullan ya da doğrudan DOM'u sorgula
(`querySelectorAll('h2')`). Geometri ölçümleri (`getBoundingClientRect`,
`scrollWidth`) bu sorundan ETKİLENMEZ; yalnızca metin okumaları etkilenir.

Sayfayı iframe'e yükleyip ölçerken **doğru sayfada olduğunu da doğrula**:
`d.location.pathname` beklenen yola eşit mi, gövdede "Sayfa bulunamadı"
var mı. Bir tur, var olmayan araç adlarıyla (elle yazılmış liste) 404
sayfasını ölçtü ve ölçüm sonuçları bir öncekinden devraldığı için
tekrar eden sahte kusurlar üretti. Araç listesini dosya sisteminden al.

Genel kural: bir tarama "0 kusur" dediğinde **kasten bozuk bir kayıt
ekleyip yakalandığını gör.** Kusur bulamayan tarama, düzeltilmiş bir
yüzeyden ayırt edilemez.

**Her taramaya ÖLÇÜLEN SAYIYI da bastır — "0 kusur" ile "0 öge" aynı
görünür.** Yerel dev sunucuda bir rota ilk ziyaretinde derleniyor ve
iframe zaman aşımına uğrayıp BOŞ kalabiliyor. O zaman tarama hiçbir öge
görmüyor ve raporu `kusurSayisi: 0` oluyor — yani sayfa taranmış ve temiz
çıkmış gibi.

Bir turda iki sayfada birden oldu (`/uyelik` ve `/tr/premium/ydus/liderlik`
"temiz" göründü, oysa hiç yüklenmemişlerdi) ve yalnızca ölçülen denetim
sayısı raporlandığı için fark edildi: `denetim: 0`. İkinci koruma
`d.location.pathname` — boş iframe'de `"blank"` dönüyor.

Yani her tarama üç şeyi birden raporlamalı: kusur sayısı, **ölçülen öge
sayısı** ve gerçekten hangi yolda olunduğu.

### Ardışık ölçüm BAYAT sonuç verir — her senaryoyu izole et

Aynı sayfada birden çok senaryoyu arka arkaya çalıştırıp her birinden
sonra ekranı okumak, bir öncekinin metnini okumaya yol açıyor. Bu oturumda
**üç kez** yanlış sonuç ürettirdi:

- Üç bozuk yedek dosyası arka arkaya verildi; üçü de aynı hata mesajını
  gösterdi ve "mesajlar ayırt edilmiyor" sanıldı. Tek tek denenince her
  birinin DOĞRU ve FARKLI mesaj verdiği görüldü.
- İki ok tuşu arka arkaya tetiklendi; "sol ok çalışmıyor" sanıldı. İzole
  ölçümde çalıştığı çıktı (aradaki `setTimeout`'lar yarışıyordu).
- Kategori sayıları toplu döngüde ölçülürken panel zaman aşımına uğradı.

Şüphe işareti: **beklenen fark çıkmıyorsa** ölçüme güvenme. İki farklı
girdinin aynı sonucu vermesi çoğu zaman uygulamanın değil, ölçümün
raporudur. Her senaryo için sayfayı yeniden yükle.

### Bozuk veri tohumlamak gerçek kusur buluyor

Düzgün veriyle test etmek yetmiyor. Bu oturumda kasten bozuk kayıt
tohumlamak ÜÇ kusur buldu ve üçü de yedekten geri yükleme yoluyla gerçek
kullanıcıya ulaşabilirdi:

| Bulunan | Etki |
|---|---|
| `usable()` içinde korumasız `m.t.trim()` | TEK bozuk vurgu bütün tekrar sayfasını düşürüyordu |
| `strokes` alanında dize | "10 çizgi" uydurma sayısı (dizenin karakter sayısı) |
| Flashcard kimlikleri süzülmüyor | Setten kart çıkınca sayaç "%240" gösterebiliyor |

Sonuncusu bozuk veriyle bile ilgili değildi — **normal içerik
düzenlemesiyle** oluşuyordu, ama bozuk veri ararken ortaya çıktı.

Test şekli: gerçek alan adlarını kasten yanlış yaz, `null`/sayı/dize koy,
diziye dize ver. Sonra iki şeyi birden ölç — sayfa ayakta mı VE sağlam
kayıtlar hâlâ çalışıyor mu. İkincisi olmadan düzeltme "hepsini eledi" de
olabilir.

**Ama kalıbı görmek yetmez, her yüzeyi ayrı ölç.** Aynı oturumda "burada
da aynı kusur olmalı" sezgisi üç kez yanlış çıktı: QuizEngine sayımları
mevcut soru listesinden yapıyor, tekrar istatistikleri mevcut kartlardan
hesaplanıyor, yetim tekrar durumlarını `pruneStates()` zaten temizliyor
(ölçüldü). Neredeyse gereksiz bir düzeltme yapılacaktı.

**`.claude/worktrees/` grep sonuçlarını ŞİŞİRİR.** Paralel oturumlar depo
kopyalarını orada tutuyor, yani `grep -rn` deponun kökünden çalıştırıldığında
aynı satır 2-3 kez sayılıyor. Ölçüldü: `/api/user/me` için 12 eşleşme çıktı,
dosyalara bakınca 4'ü gerçek 8'i worktree kopyasıydı. Sayıya dayanan bir
ölçüm yapıyorsan yolu daralt (`web/app`, `web/lib`) ya da
`grep -v ".claude/worktrees"` ekle.

### Paralel oturumlarda commit'ler karışır — mesaj içeriği anlatmayabilir

Aynı depoda birden fazla oturum çalışıyor: bir kısmı `.claude/worktrees/`
altındaki ayrı bir worktree'de, bir kısmı ana çalışma kopyasında.
**Ayrı worktree bunu tek başına ÖNLEMİYOR** — belirleyici olan `git commit`
komutunun hangi dizinde çalıştırıldığı, çünkü her worktree'nin sahnesi
kendine ait.

Ölçülen kusur tam olarak şu oldu: iş bir worktree'de sahnelenmişken commit
**ana çalışma kopyasında** çalıştırıldı; oradaki ilgisiz bekleyen dosya işin
mesajıyla kaydedildi, sahnelenmiş asıl iş ise commit edilmeden kaldı (sonra
`ca2bbf1` olarak ayrıca kaydedildi). Ortaya çıkan commit'in mesajı kendi
içeriğini anlatmıyor:

`521ae13 "Premium yüzeylerde markdown kalın işareti düz metin basılıyordu"`
aslında yalnızca premium YDUS **paylaşım kartını** (`opengraph-image.tsx`,
76 satır) içeriyor; markdown işiyle ilgisi yok. Commit gönderildiği için
geçmiş yeniden yazılmadı — düzeltme bu notla yapılıyor.

Bu depoda commit mesajları belge yerine geçtiği için yanlış etiketlenmiş
bir commit gerçek bir kayıp. Korunma yolu:

- **Commit'i işin BULUNDUĞU ağaçta çalıştır.** Değişiklikler bir worktree'de
  duruyorsa commit de orada atılmalı; başka bir dizinde çalıştırılan `git
  commit` o dizinin sahnesini kaydeder, seninkini değil.
- Sahneleme ile commit'i **tek komutta** yap: `git add <yol> && git commit`
  yerine `git commit <yol> -m …` (yalnızca verilen yolu kaydeder, sahnede
  ne olduğuna bakmaz).
- Commit'ten sonra `git show --stat HEAD` ile içeriğin beklediğinle
  aynı olduğunu gör; bu turda kusuru yakalayan tam olarak bu oldu.
- Paralel bir iş çalışırken onun dokunacağı dosyalara (iş tanımında
  yazılı) el sürme; bu ayrı ve zaten uygulanan bir kural.

### Başlık ögesi kullanmak SERİF ve 24px üst boşluk getirir

`globals.css` başında `h1,h2,h3` için `font-family: var(--font-serif)`,
`margin-top: 1.5rem`, `margin-bottom: 1rem` tanımlı. Tailwind'in
`text-sm`/`font-semibold` sınıfları bunları **EZMİYOR** — boyut ve ağırlık
Tailwind'den, yazı tipi ve boşluk globals'tan geliyor.

Sonuç ölçüldü (canlı, 7 sayfa): **65 başlık** Merriweather ile ve 24px üst
boşlukla basılıyor, oysa kendi sınıfları `text-xs`, `text-[9px]`,
`text-[10.5px]` diyor — bunlar arayüz etiketi, okuma başlığı değil.
`/tools`'ta 18 başlığın 17'si, ana sayfada 17'nin 16'sı böyle. Konu
detayında 8'in yalnızca 1'i — yani İÇERİK başlıkları bilerek serif,
arayüz etiketleri değil.

Bir arayüz etiketini `<h2>` yaparken (anlam için doğru olan budur)
görünümü korumak istiyorsan `font-sans mt-0` ekle. Premium panosundaki
iki bölüm başlığı bunu yapıyor; eklemeden önce ölçüldüğünde etiketler
serif'e ve 24px boşluğa kaymıştı.

Genel kuralı değiştirmek 65 başlığın görünümünü aynı anda değiştirir —
bu bir tasarım kararı, ölçümle tek başına verilmemeli.
