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
node scripts/ic-bilesen-denetim.cjs  # render İÇİNDE tanımlı etkileşimli bileşen (CI KAPISI)
node scripts/ic-bilesen-denetim.cjs --negatif
node scripts/saydamlik-denetim.cjs   # metin ögesinde opacity-* (CI kapısı DEĞİL)
node scripts/saydamlik-denetim.cjs --negatif
node scripts/renk-cifti-denetim.cjs  # ölçülmüş kara listeden renk çifti (CI kapısı DEĞİL)
node scripts/renk-cifti-denetim.cjs --negatif
node scripts/yetim-denetim.cjs   # konu dosyası olmayan quiz/kart/vaka (CI kapısı DEĞİL)
node scripts/asili-denetim.cjs   # ebeveyni bulunamayan konular (CI kapısı DEĞİL)
node scripts/esik-etiket-denetim.cjs   # etiket kendi eşiğiyle çelişiyor mu (CI kapısı DEĞİL)
node scripts/olu-denetim.cjs   # ekranda duran ama hiçbir şeyi değiştirmeyen kontrol (CI kapısı DEĞİL)
node scripts/olu-denetim.cjs --negatif
node scripts/bolme-denetim.cjs   # kullanıcı sayısına bölerken payda 0 olabilir mi (CI kapısı DEĞİL)
node scripts/bolme-denetim.cjs --kontrol
node scripts/payda-denetim.cjs   # ilan edilen tavan, şıklardan hesaplanana eşit mi (CI kapısı DEĞİL)
node scripts/payda-denetim.cjs --kontrol
node scripts/bant-denetim.cjs   # cetveldeki sınır, koddaki merdivene uyuyor mu (CI kapısı DEĞİL)
node scripts/bant-denetim.cjs --kontrol
node scripts/karar-denetim.cjs   # renk, kararı veren alandan mı geliyor (CI kapısı DEĞİL)
node scripts/karar-denetim.cjs --kontrol
node scripts/kapi-kapsam-denetim.cjs   # hesaptaki her değer kapıdan geçiyor mu (CI kapısı DEĞİL)
node scripts/kapi-kapsam-denetim.cjs --kontrol
node scripts/yuvarlama-denetim.cjs   # yuvarlanmış değer ikinci hesaba giriyor mu (CI kapısı DEĞİL)
node scripts/yuvarlama-denetim.cjs --kontrol
node scripts/eksik-alan-denetim.cjs   # tablo alanı çoğunlukta dolu, birkaçında boş mu (CI kapısı DEĞİL)
node scripts/eksik-alan-denetim.cjs --kontrol
node scripts/yorum-korlugu-denetim.cjs   # denetimler YORUMU kusur sanıyor mu (meta denetim)
node scripts/esik-etiket-denetim.cjs --negatif
```

`arayuz-denetim` bu üçlüden farklı bir yeri tarıyor: içeriği değil ARAYÜZ
KAYNAĞINI. Aradığı beş sınıf da geçerli TypeScript ve geçerli JSX, yani üç
kapıdan da geçiyor; kusur yalnızca ekranda görünüyor. Kendini sınayabiliyor
(`--negatif`) ve o da ayrı bir CI adımı — yakalamayı bırakan bir denetim
sessizce yeşil kalmasın. Raporunda ölçülen etiket sayısı da var, çünkü
"0 kusur" ile "0 öge" ekranda aynı görünür.

`saydamlik-denetim` ve `renk-cifti-denetim` KONTRAST tarafını tarıyor ve
ikisi de rapor, kapı değil — saydamlık da renk seçimi de kimi yerde meşru bir
tasarım aracı.

- **`saydamlik-denetim`**: metin ögesinde `opacity-40..80`. Sebebi şu:
  CSS `opacity` rengi soldurur ama `getComputedStyle(el).color` değerine
  YANSIMAZ, yani saydam yazı bütün kontrast ölçümlerinde olduğundan koyu
  görünür. Bedeli ölçüldü — 92 araçta klinik uyarı 3.46, 28 araçta sonuç
  açıklaması 3.59, sınav geri sayımı amber evresinde 4.34.
  Çare saydamlığı artırmak DEĞİL, ölçülebilir hâle getirmek:
  `opacity-60` yerine `text-white/80`. Renk alfası `color` içinde rgba olarak
  görünür.
- **`renk-cifti-denetim`**: saydamlık taşımayan kontrast kusurları. Kara
  liste TAHMİN DEĞİL — gerçek bir sayfada, uygulamanın kendi CSS'i altında
  126 renk çifti çizilip ÖLÇÜLDÜ (`globals.css` ezmeleri dahil). Sınıf adından
  hesaplanamaz, çünkü `.text-slate-300` gibi tonlar eziliyor.

Renk çifti taramasının **üç yanlış pozitif kaynağı** var ve üçü de yaşandı:
`hover:bg-blue-500` TABAN renk değil (varyantlı sınıfın tamamı atılmalı —
yalnızca öneki silmek `bg-blue-500`i bırakıyor ve 27 adayın çoğu bu yüzden
sahteydi); Tailwind kullanılmayan sınıfı üretmiyor, o çiftlerde zemin hiç
uygulanmıyor ve beyaz beyazda 1.00 çıkıyor; zemin gerçekte bir ATAdan
geliyor olabilir. Bu yüzden ölçüt ADAY üretir, kararı tarayıcı ölçümü verir.

**İki denetimin negatif kontrol dosyası `zz-` ile başlıyor, `_` ile DEĞİL.**
`saydamlik-denetim`de test dosyası `__…` adıyla yazılmıştı ve betiğin kendi
"`_` klasörlerini ele" süzgeci onu da eledi: denetim çalışıyordu ama kendi
testini göremiyordu ve "körleşmiş" raporu verdi.

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

### Ölçüm aracının `app/` altına dosya yazması dev sunucusunu ÖLDÜRÜR

Denetim betiklerinin `--negatif` kipi tohum dosyasını bir dönem `app/` altına
yazıp siliyordu. Çalışan `next dev` o dosyayı derlemeye alıyor; silinince
postcss'in bağımlılık listesi bayat kalıyor ve **sitenin tamamı 500 veriyor**
(ana sayfa dahil, tek bir rota değil).

Kusur şöyle göründü: geçici bir tanı rotası 500 döndü ve ilk yorum "render
edilen bileşen bozuk" oldu. Hata metni okununca sebep başkaydı —
`Module build failed (postcss-loader) ENOENT: app/zz-…tsx`. **Hata mesajını
okumadan bileşeni suçlama.**

Çare: tohum dosyası `fs.mkdtempSync(os.tmpdir())` ile geçici dizine yazılır ve
tarama kapsamına yalnızca `--negatif` kipinde eklenir. Kapsam eklemesi
unutulursa denetim sessizce "körleşmiş" der — o yüzden taşıdıktan sonra
negatif kontrolü yeniden çalıştır.

**Bozulan sunucuyu kurtarmanın çalışan tek yolu `globals.css`in İÇERİĞİNİ
değiştirmek.** Denenip işe yaramayanlar: `tailwind.config.js`/`postcss.config.js`
zaman damgası, `.next/cache` silme, dosyayı geri koyma (hata modül derleme
önbelleğinde donmuş oluyor). Düşen modül CSS olduğu için onun içeriği
değişince sıfırdan derleniyor; tetikleyici sonra geri alınır.

### Kapı arkasındaki sayfayı ölçmenin ikinci basamağı: `fetch` koşumu

Geçici dev rotası tek başına yetmeyebilir. Yönetim sayfaları `/admin/:path*`
middleware eşlemesiyle kapalı — rota `/admin` dışına konunca kapı aşılıyor,
ama sayfa bu kez VERİ bekliyor ve ölçülmek istenen dal hiç çizilmiyor
(`/api/topics/search` 503, `/api/topics` 405).

Çözüm, bileşen kurulmadan ÖNCE `window.fetch`i sarmalayan küçük bir istemci
koşumu: yalnızca ilgili uçlara kanıtlanmış biçimde veri döndürür, ötekileri
gerçek `fetch`e devreder ve `useEffect` dönüşünde eski hâline bırakır.
Bileşenin kendisine, stillerine ve render mantığına DOKUNULMAZ — ölçülen şey
gerçek arayüz.

Bununla ölçüldü: üç yönetim sayfası, 26 öge, 14'ü saydamlık taşıyor, **0
kontrast kusuru**. Saydamlık denetiminin yönetici satırları kusur değil aday;
orada taban renk devralınıyor ve neredeyse siyah, 0.7 saydamlıkta bile beyaz
üstünde ~6.6 çıkıyor. Araç tarafında kusurlu olmasının sebebi taban rengin
`text-blue-900` olmasıydı.

Koşumla ölçerken negatif kontrolü AYNI SAYFAYA koy: kasten kusurlu bir öge
eklenip yakalandığı görülmeli (ölçüldü, 3.46 yakalandı).

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

### İKİ GERÇEKLİK henüz AYRIŞMADAN tekleştirildi — asit-baz kompanzasyon sabitleri

Bu depodaki en tekrar eden kusur sınıfı "aynı değer iki yerde ayrı tutuluyor"
(premium modül ilanı · eşik–etiket çifti · payda–tavan · spot-urine'de rengin
karardan bağımsız hesaplanması). Hepsinde çare aynıydı: **tek kaynağa bağla.**

`abg`de aynı şekil ÜÇ katmanlıydı ve henüz ayrışmamıştı:

| katman | nerede |
|---|---|
| aritmetik | `const b = 0.7 * hco3 + 21` |
| formül dizesi | HEMEN ALTINDA: `"PaCO₂ = 0.7 × HCO₃⁻ + 21 ± 5"` |
| referans cetveli | `abg/page.tsx`te elle yazılmış altı satır |

Üçü de elle güncellenmek zorundaydı. **Ölçüldüğünde üçü de uyuşuyordu** —
yani bu bir kusur düzeltmesi DEĞİL, ayrışma imkânının kaldırılması. Sayılar
`KOMPANZASYON_SABIT` altında toplandı; cetvel (`KOMPANZASYON_CETVELI`) artık
o sabitlerden TÜRÜYOR ve sayfa onu içe aktarıyor.

**Davranış değişmediği ÖLÇÜLDÜ ve negatif kontrol iki yöntemli:**

- **Ekran:** referans cetvelinin altı satırı, değişiklikten önce alınan
  yakalamayla **birebir aynı** (dize karşılaştırması, fark 0).
- **Motor:** saf modül olduğu için `node --experimental-strip-types` ile
  doğrudan sürüldü; altı dalın altısı da elle hesapla birebir — asimetrik
  bantlar dahil (metabolik alkaloz ±5, kronik solunum asidozu ±3).

| dal | motor | elle |
|---|---|---|
| metabolik asidoz (Winter) | 21–25 | 1.5×10+8 = 23 ± 2 |
| metabolik alkaloz | 42.6–52.6 | 0.7×38+21 = 47.6 ± 5 |
| solunum asidozu akut ×1 | 24–28 | 24 + (20/10)×1 ± 2 |
| solunum asidozu kronik ×3.5 | 28–34 | 24 + (20/10)×3.5 ± 3 |
| solunum alkalozu akut ×2 | 19.6–23.6 | 24 − (12/10)×2 ± 2 |
| solunum alkalozu kronik ×5 | 16–20 | 24 − (12/10)×5 ± 2 |

**Tekleştirmenin GERÇEKTEN olduğu ayrıca sayıldı** — "davranış aynı" tek
başına yeterli kanıt değil, çünkü hiçbir şey yapmamak da aynı sonucu verir:
sayfada elle yazılmış kompanzasyon formülü **0**, motorda her sabit **tek
satırda**. Bir tekleştirmeyi doğrularken çıktının aynı kaldığını değil,
KOPYANIN kaybolduğunu ölç.

### Çevirim katsayıları ve `abg` ekran–motor uyumu ölçüldü — temiz

`unit-converter`ın 20 analitinin 20'si molekül ağırlığından türetilenle
birebir: kreatinin 88.4 = 10000/113.12 · bilirubin 17.104 = 10000/584.66 ·
ürik asit 59.48 = 10000/168.11 · amonyak 0.5872 = 10/17.031 · demir
0.179 = 10/55.845 · kolesterol 1/38.67 · trigliserid 1/88.57 · HbA1c
NGSP↔IFCC ana denklemi. Gidiş-dönüş yapısal olarak tutarlı, çünkü her
analit tek bir `k`dan hem `ileri` hem `geri` üretiyor.


### KARDEŞ ARAÇLA KARŞILAŞTIR — `gnri` cinsiyet dalını atlıyordu

Bu turun kusurunu bulan şey ne bir denetim betiği ne de kaynak okumaktı:
**aynı işi yapan öteki aracı açmak.**

GNRI ideal ağırlığı Lorentz formülünden alır ve bölen cinsiyete bağlıdır
(erkek `/4`, kadın `/2.5`). `gnri` koşulsuz `/4` yazıyordu ve araçta
**cinsiyet alanı hiç yoktu** — yani varsayım ekranda görünmüyordu bile.
Araç formülü ekrana basıyor, yani aritmetiği dürüst yazıyor ama bunun
erkek varyantı olduğunu söylemiyordu.

Ölçüldü (165 cm · 55 kg · albumin 3.6 g/dL):

| varyant | ideal ağırlık | GNRI | bant |
|---|---|---|---|
| erkek (koddaki) | 61.3 kg | **91.0** | ORTA RİSK |
| kadın (doğrusu) | 59.0 kg | **92.5** | DÜŞÜK RİSK |

Eşik 92; tek bir eksik alan bandı kaydırıyordu. Üstelik GNRI **geriyatrik**
bir indeks ve o yaş grubunda kadınlar çoğunlukta — sapma hedef nüfusun
büyük kısmını vuruyordu.

**Ayırt edici soru şuydu: "aynı hesabı yapan başka araç var mı?"** `bmi` de
ideal ağırlık hesaplıyor (Devine ve Hamwi, ikisi de cinsiyete bağlı) ve
onda seçici VAR. Yani depo kalıbı zaten biliyordu; `gnri` istisnaydı.
İki aracı yan yana koymak, hangisinin eksik olduğunu dış bir kaynağa hiç
bakmadan söyledi.

Bu, belgedeki "yeni bir kusur bulunca serideki komşu araçlara bak: çözüm
çoktan yazılmış olabilir" kuralının TERSİ yönü: komşuda çözüm varsa,
komşuda OLUP burada olmayan şey de bir kusur adayıdır.

Çare seçiciyi eklemek ve **varsayımı görünür kılmak**: ekrandaki formül
satırı artık varyantı adıyla yazıyor ("Lorentz, kadın: … /2,5"). Denetim
`bmi` ile birebir aynı (sr-only radyo + saran etikette `focus-within`
halkası + grup adı), yani klavye kuralı da korunuyor.

Negatif kontrol: **erkek yolu düzeltme öncesiyle aynı sayıyı veriyor**
(91.0). Bir dal eklerken var olan dalın değişmediğini ölçmek şart.

### DAL VAR AMA YARIM — `bmi` Hamwi'de tabanı dallandırıp katsayıyı unutmuştu

`gnri` turunda açılan "cinsiyet dalı" sınıfı taranınca ikinci ve daha sinsi
bir biçimi çıktı. `gnri`de dal HİÇ YOKTU; `bmi`de dal VARDI ama yarımdı:

```
Devine (1974)  erkek 50 · kadın 45.5   + İKİSİNDE DE inç başına 2.3     ✓ doğru
Hamwi  (1964)  erkek 48 · kadın 45.5   + 2.7 * ((h - 152.4) / 2.54)     ✗ katsayı tek
```

Yayımlanmış Hamwi erkekte 106 lb + 6 lb/inç (≈48 + 2.7), kadında 100 lb +
5 lb/inç (≈45.5 + **2.2**). Kod tabanı dallandırmış, artışı dallandırmamıştı —
yani yazan kişi formülün cinsiyete bağlı olduğunu BİLİYORDU, yarısını atlamıştı.

**Kusuru ekranın kendi içindeki çelişki gösterdi, dış bir kaynak değil:**

| girdi (kilo 70) | Devine | Hamwi — ekranda | Hamwi — doğrusu |
|---|---|---|---|
| erkek 170 cm | 65.9 | 66.7 | 66.7 ✓ |
| kadın 170 cm | 61.4 | **64.2** | **60.7** |
| kadın 180 cm | 70.5 | **74.8** | **69.4** |

Erkekte Hamwi, Devine'in 0.8 kg ÜSTÜNDE; kadında 2.8 kg üstünde çıkıyordu —
oysa doğrusu 0.7 kg ALTINDA. **İki formülün birbirine göre sırası cinsiyete
göre ters dönemez.** Yayımlanmış katsayıyı hiç bilmeyen biri bile bu
tutarsızlığı görebilirdi.

Sapma boyla büyüyor (170 cm'de 3.5 kg, 180 cm'de 5.4 kg) ve aracın kendi
uyarısı ideal ağırlığın "ilaç dozlaması ve solunum parametreleri" için
kullanıldığını söylüyor — ARDS'de 6 mL/kg ideal ağırlıkla soluk hacmi
hesaplayan biri için 5 kg, soluk başına ~30 mL demek.

**Negatif kontrol iki ayaklı ve ikincisi sınır değerinde:**

| ölçüt | sonuç |
|---|---|
| erkek 170 (dokunulmayan dal) | Devine 65.9 · Hamwi 66.7 — düzeltme öncesiyle birebir |
| kadın tam **152.4 cm** (5 feet) | ikisi de 45.5 — inç terimi SIFIR |

İkincisi ayırt edici: tam 152.4 cm'de artış terimi düşüyor, geriye yalnızca
taban kalıyor. Böylece "tabanı bozdum mu" ile "katsayıyı düzelttim mi"
soruları AYRI AYRI cevaplanıyor. Bir formülün iki parçası varsa, birini
sıfırlayan girdi ötekini yalıtır.

Devine dört ölçümde de değişmedi; oradaki `(h - (sex === "m" ? 152.4 : 152.4))`
no-op üçlüsü de sadeleştirildi (Devine ikisinde de 5 feet tabanını kullanır).

**Sınıfın kalanı tarandı ve temiz.** Cinsiyet alanı olan 9 araç: `bmi` ·
`bmr` · `chads-vasc` · `egfr` · `findrisc` · `glasgow-blatchford` · `gnri` ·
`lawton-iadl` · `psi-port`. `bmr`in Mifflin-St Jeor dalı doğru (erkek +5,
kadın −161). Ters yönde 11 aday (cinsiyete bağlı kavram geçip alanı olmayan)
elle bakıldı: FLIPI Hb<12, IPSS-R, Khorana Hb<10, HScore, Ranson hematokrit —
hepsi yayımlanmış hâlinde SABİT eşik, yani kusur değil. Metabolik sendrom
aracı (bel çevresi ve HDL eşikleri cinsiyete bağlıdır) depoda YOK.


### Paylaşılan `calc-utils` kütüphanesi ölçüldü — dokuz formül temiz

Araçların bir kısmı hesabı `app/tools/lib/calc-utils.tsx`e devrediyor.
Oradaki bir kusur birden çok aracı birden vururdu, o yüzden ayrıca sürüldü:
eGFR CKD-EPI 2021, düzeltilmiş kalsiyum, anyon açığı, albumin düzeltmeli
anyon açığı, Katz sodyum, HbA1c→eAG, Mosteller BSA, DAS28-ESR ve DAS28-CRP —
**dokuzu da yayımlanmış hâliyle birebir.**

Dört dışa aktarım ÖLÜ: `mmolToMgdl`, `calculateSofaScore`, `checkPercCriteria`,
`calculateWellsDvt` — sıfır içe aktaran. (`calculateSofaScore`ın kendi yorumu
zaten "placeholder" diyor.) Ölü kod, kullanıcıya ulaşan bir kusur değil.

**Ekranda formül basan 19 araç sayıldı** ve ekrandaki metin kodun yaptığıyla
karşılaştırıldı. Sürülenler ve elle hesapla tutanlar:

| araç | girdi | ekranda | elle |
|---|---|---|---|
| `calvert` | AUC 5 · GFR 150 | **750** + "GFR 150 → 125 ile sınırlandırıldı" | 5×(125+25) |
| `calvert` | AUC 5 · GFR 100 | **625**, bildirim YOK | 5×(100+25) |
| `bsa` | 170 cm · 70 kg | 1.82 | √(11900/3600) |
| `ktv` | 60/20 · 240 dk · 2 L · 70 kg | spKt/V 1.28 · eKt/V 1.12 · URR %67 | Daugirdas II |
| `osmolal-gap` | 300 · 140 · 90 · 14 | 10.0 | 300 − (280+5+5) |
| `pni` | alb 3.0 · lenfosit 1200 | 36.0 | 10×3 + 0.005×1200 |

`ktv` ayrıca bir birim tuzağını doğru çözüyor: alan **dakika** istiyor ama
Daugirdas II **saat** ile türetilmiş. Çevrim yapılmasaydı `R − 0.008×240`
eksiye düşer ve `ln` tanımsız olurdu — yani ekrandaki 1.28, çevrimin
yapıldığının kanıtı.

`das28`in belgede kayıtlı "boş formda 0 basıp **Remisyon** diyordu" kusuru
da bu turda kontrol edildi: kapanmış, artık `–` ve "Değerleri girin" basıyor.


### Ondalık katsayı taşıyan araçların hepsi sürüldü — sınıf temiz

Ölçek hatası sınıfının kalan yüzeyi: yayımlanmış bir regresyon/denklemi
aktaran araçlar. Ölçüt basit — kaynakta ondalık katsayıyla çarpım ara
(`0.957 * x`), Tailwind opaklıklarını (`bg-x/10`) ele. **Onbir araç** çıktı
ve hepsi tek tek yayımlanmış formülle karşılaştırıldı:

`asdas` (CRP ve ESR varyantları) · `bmr` (Mifflin-St Jeor) · `charlson`
(10 yıllık sağkalım üsteli) · `gnri` · `hba1c-eag` · `ktv` · `meld-na`
(düzeltildi) · `pni` (Onodera) · `rts` (RTS + TRISS lojistiği) · `sodium`
(düzeltildi) · `unit-converter` (HbA1c NGSP↔IFCC ana denklemi).

**İKİ KEZ "kusur buldum" sandım, ikisinde de BENİM BEKLENTİM yanlıştı.**
`rts`teki `0.7705` bir RTS katsayısı değil, TRISS lojistiğinin `b1`i ve
dosyada öyle etiketli; `asdas`ın ESR satırındaki `0.069`/`0.079` da
yayımlanmış ASDAS-ESR katsayıları (ben yuvarlanmış varyantı hatırlıyordum).
Belgedeki kural bu turda iki kez işledi: **beklenti tutmadığında önce
beklentiyi sına, kodu değil.**

### GÖSTERİM yuvarlanır, HESAP yuvarlanmaz

`sedasyon-infuzyon`da pompa hızı ekrana 1 basamağa yuvarlanarak basılıyordu —
doğru. Ama **torba ömrü o yuvarlanmış hızdan** hesaplanıyor ve yuvarlama
ikinci bir değere taşınıyordu.

Ölçüldü (midazolam 1.5 mg/saat · torba 1000 mg / 100 mL):

| | ham | ekranda |
|---|---|---|
| pompa hızı | 0.15 mL/saat | 0.2 (doğru yuvarlama) |
| torba ömrü | 100 / 0.15 = **666.7 saat** | **500 saat** (100 / 0.2) |

%25 hata, ve **hız küçüldükçe büyüyor**: 1 mL/saat altında tek basamak kaba
kalıyor (0.15 → 0.2 tek başına %33). Düşük hızlar bu araçta olağan —
deksmedetomidin ve derişik torbalar oradan çalışıyor.

Çare tek satır: ham hız ayrı tutulur, gösterim onu yuvarlar, ikinci hesap
HAM değeri kullanır.

**Negatif kontrol, yuvarlamanın ISIRMADIĞI durumları da ölçmeli** — yoksa
"düzelttim" derken başka bir şeyi bozmuş olabilirsin. Ölçüldü: midazolam
5 mg/saat → 5 mL/saat · 20 saat (değişmedi), propofol 70 kg × 1.5 mg/kg/saat
→ 10.5 mL/saat · 105 mg/saat · 9.5 saat (kiloya göre yol sağlam).

`scripts/yuvarlama-denetim.cjs` sınıfı tarıyor: 131 araç, 85 yuvarlanmış
değer, **13 aday**. İkisi karara bağlandı (`sedasyon` düzeltildi,
`potasyum-replasman` ölçüldü ve basamağı yeterince ince: 55 mEq için
1375/5.5 = 250 tam çıkıyor), kalanı sonraki turda kapatıldı.

#### Kalan adaylar karara bağlandı — sınıfın tek gerçek kusuru `sedasyon`du

**Ayırt edici kural: basamak, DEĞERİN BÜYÜKLÜĞÜNE göre.** Taşma tek başına
kusur değil; belirleyici olan yuvarlama basamağının değere oranı.

| araç | yuvarlama | değer | hata |
|---|---|---|---|
| `sedasyon-infuzyon` | 0.15 → 0.2 | **1'in altında** | **%33 → KUSUR** |
| `kalsiyum-infuzyon` | 43.75 → 44 | ~44 | %0.5 → değil |

Yani şüphe, yuvarlanan değerin basamağa yakın ya da ondan küçük
olabildiği yerlerde. Bu kaynaktan hesaplanamaz — ölçüt aday üretir.

`kalsiyum-infuzyon` ÖLÇÜLDÜ (62.5 kg × 0.7 = 43.75 → 44 mg/sa, hız 43 mL/sa;
tam değerle 42.8). Fark %0.5 ve üstelik **tutarlı**: araç 44 mg/sa vermeni
söylüyor, pompa da onu vermeli.

**Bazı yerlerde taşma GEREKLİ.** `tromboliz-doz`da bolus ve kalan, ekranda
yazan toplamdan türetilmezse parçalar bütünü tutmaz (9 + 81 = 90). Aynı
şekilde `bikarbonat-infuzyon` ve `magnezyum-infuzyon`da hastaya verilen şey
yuvarlanmış dozdur; ampul sayısı ondan türemeli. Taşmayı toptan "kusur"
saymak bu üçünü bozardı.

Kalanlar basamak yeterince ince olduğu için temiz: `fosfat-replasman` ~%0.1,
`bmr` <%0.06, `potasyum-replasman` tam çıkıyor.

**`fomepizol` bir dönem listedeydi ve SAHTEYDİ:** eşleşme JSDoc satırının
`*` önekinden geliyordu — ölçüt onu çarpma sandı. Yorumlar artık eleniyor;
bu depoda yorumlar kusurları ANLATTIĞI için ölçütün kendi belgesini
yakalaması da olasıydı.


### Birim TABANI ilaç bazında değişiyor — vazoaktif ve sedasyon doğru ayırıyor

Bu serideki en pahalı hata biçimi birim tabanını karıştırmak olurdu:
nitrogliserin mcg/**dakika** (kilodan bağımsız), noradrenalin
mcg/**kg**/dakika, remifentanil mcg/kg/**dakika**, midazolam mg/**saat**.
Karıştırılırsa hata 60 kat ya da 70 kat olur.

Ölçüldü ve ikisi de doğru ayırıyor:

| araç | senaryo | ekranda | elle |
|---|---|---|---|
| `vazoaktif` | noradrenalin 70 kg · 0.1 mcg/kg/dk · 4 mg/250 mL | 26.3 mL/sa | 26.25 |
| `vazoaktif` | nitrogliserin 20 mcg/dk · 50 mg/250 mL | 6 mL/sa | 6 |
| `vazoaktif` | aynı nitrogliserin, **kilo 70 → 140** | **6 (değişmedi)** | kilodan bağımsız |
| `sedasyon` | propofol 70 kg · 1.5 mg/kg/sa | 10.5 mL/sa | 10.5 |
| `sedasyon` | midazolam 5 mg/sa | 5 mL/sa | 5 |

Üçüncü satır ayırt edici olan: kiloyu iki katına çıkarıp hızın DEĞİŞMEDİĞİNİ
görmek, "birim etiketinde mcg/dk yazıyor" demekten farklı bir kanıt.

**Ölçüm tuzağı — `closest('label')` erişilebilir adı EKSİK raporlar.**
Vazoaktif alanlarının adsız olduğu sanıldı; gerçekte adlar `label[for]` ile
bağlı ("Hasta ağırlığı", "Doz", "İlaç miktarı", "Toplam hacim"). Belgedeki
"kaynakta `htmlFor` aramak yanıltır" uyarısının ayna hâli: saran etiket
aramak da tek başına yanıltıyor. Adı HESAPLAT — aria-label → aria-labelledby
→ label[for] → saran label sırasıyla.

### Yorum körlüğü ÜÇ KEZ tekrarladı — artık meta denetimi var

Bu depoda yorumlar geçmiş kusurları BİREBİR alıntılıyor. Kaynak tarayan bir
ölçüt yorumları elemezse iki yönde birden bozuluyor ve üçü de yaşandı:

| denetim | ne oldu |
|---|---|
| `yuvarlama-denetim` | JSDoc satırının `*` önekini ÇARPMA sandı, `fomepizol`u kusurlu gösterdi |
| `eksik-alan-denetim` | nesne içindeki yorum anahtarı virgülden ayırdı, EKLENMİŞ alanı "eksik" raporladı |
| `olu-denetim` | yalnızca yorumda geçen `useState` satırını ölü durum saydı |

Üçüncüsü tek tek fark edilmedi, **bir meta denetimle ölçüldü**:
`scripts/yorum-korlugu-denetim.cjs` hedef şekilleri SADECE yorum içinde
taşıyan bir tohum kurup 13 denetimi o ağaca yönlendiriyor. Tohumu bildiren
denetim kördür. `olu-denetim` düzeltilmeden önce bu testte DÜŞÜYORDU —
yani test sentetik değil, gerçek bir kusur yakalamış hâli.

Çare her seferinde aynı: yorumları SİLME, **boşlukla doldur** — satır
numaraları korunsun, rapor doğru satırı göstersin.

**İkinci bulgu: `ic-bilesen-denetim` yönlendirilemiyordu.** Bu bir CI KAPISI
ve kök alamadığı için ne tarihsel sürümle ne tohumla sınanabiliyordu; meta
test onu "sınanamadı" diye atlamak zorunda kaldı. Belgede aynı eksik
`arayuz-denetim` için zaten kayıtlıydı ("kör olduğu için değil, SINANAMADIĞI
için fark edememek daha kötü"). `--kok` eklendi.

**Üçüncü bulgu — meta testin KENDİ tohumu eksikti.** Denetimler aynı ağaç
düzenini beklemiyor:

```
araç şekli : <kök>/<araç>/page.tsx      payda · bant · karar · yuvarlama…
depo şekli : <kök>/app/**.tsx           arayuz · saydamlik · renk-cifti…
```

Tek şekil yazıldığında `arayuz-denetim` tohumda SIFIR öge ölçtü ve "temiz"
göründü. Kusur denetimde değil tohumdaydı — ama **"0 kusur" ile "0 ölçüm"
ayrımı testin içine konmasa fark edilmezdi.** Meta test artık her denetimin
raporundaki sayıya bakıyor; sıfırsa "temiz" demiyor, "SINANAMADI" diyor.

**Bayatlama koruması:** `scripts/` altında listede olmayan bir
`*-denetim.cjs` varsa uyarıyor. İlk çalıştırmada sekiz denetimi işaretledi;
üçü gerçekten eksikti ve listeye alındı, beşi içerik (JSON) taradığı için
gerekçesiyle kapsam dışına yazıldı.

### Eksik alan ölçütü betiğe alındı — ve ilk çalıştırmada KENDİ yorumuma takıldı

"Bir tablo alanı kayıtların çoğunda doluysa, boş kalanları say" ölçütü
`scripts/eksik-alan-denetim.cjs` olarak yazıldı: 131 araç, 105 kayıt dizisi.

**İlk çalıştırma `status-epileptikus`ta `tavanMg`i "eksik" gösterdi — oysa
bir tur önce eklenmişti.** Sebep ölçütün körlüğüydü: alanın hemen üstüne
konan `/* … */` bloğu anahtarı önceki virgülden ayırıyor ve `,\s*anahtar:`
deseni tutmuyor. Yani denetim, kusuru ANLATAN yorumu okuyup kusur sanıyordu.

Yuvarlama denetiminde de aynı tuzağa düşülmüştü (JSDoc `*` öneki çarpma
sanılmıştı). **Bu depoda yorumlar kusurları anlatıyor; kaynak tarayan her
ölçüt yorumları ELEMEK zorunda.** Elendikten sonra iki kayıt da listeden
düştü — düzeltmenin doğrulaması da bu oldu.

**Kalan iki aday KOD KUSURU DEĞİL, içerik eksiği.** Render tarafı ikisinde
de doğru (`{end.uyari && …}`, `{ilac.not && …}`) — alan yoksa hiçbir şey
basılmıyor, boş kap ya da bozuk düzen yok:

| araç | alan | eksik olan |
|---|---|---|
| `magnezyum-infuzyon` | `uyari` (3/4) | "astım" endikasyonu |
| `vazoaktif-infuzyon` | `not` (5/8) | adrenalin · dopamin · dobutamin |

İkincisi dikkat çekici: noradrenalin kartı **"Tercihen santral yoldan.
Ekstravazasyon doku nekrozu yapar."** diyor; aynı tehlike adrenalin ve
dopamin için de geçerli ama o kartlar sessiz. Kullanıcı noradrenalinden
adrenaline geçtiğinde uyarıyı kaybediyor.

Metni YAZMADIM: klinik uyarı içeriktir ve içerik kullanıcının sorumluluğu.
Ölçüldü, yerleri ve gerekçesi yazıldı, bekleyen içerik işi olarak duruyor.

### Denetimlerin `app/tools` kapsamı ÖLÇÜLDÜ — dışarısı temiz, kapsam da doğru

Altı denetim (`bant` · `karar` · `kapı-kapsam` · `yuvarlama` · `eksik-alan` ·
`payda`) varsayılan olarak yalnızca `app/tools`u ve TEK DÜZEY tarıyor.
Premium ve açık site kodu bu ölçütlerle hiç görülmemişti — bu bir kapsam
boşluğu mu, yoksa doğru bir sınır mı?

**Betikleri düzenlemeden ölçmenin ucuz yolu: DÜZ AYNA.** `app/tools` dışındaki
her `.tsx`, tmpdir'de `<ayna>/<düz-ad>/page.tsx` olarak kopyalanır ve mevcut
denetimler oraya yönlendirilir. Kod değişmeden kapsam sınanmış olur.
(Ayna `app/` altına YAZILMAZ — orada dosya oluşturup silmek çalışan dev
sunucusunu öldürüyor, belgede kayıtlı.)

**İlk ayna EKSİKTİ ve ölçüm bunu gösterdi.** Yalnızca `page.tsx` kopyalandı;
denetimler "0 kapılı ifade" dedi, oysa grep 12 dosya saymıştı. Sebep:
premium/site mantığı `page.tsx`te değil BİLEŞENLERDE (`QuizEngine.tsx` gibi).
Ayna bütün `.tsx`leri taşıyınca 39 sayfa 125 dosyaya çıktı.

125 dosyada bulunan **tek aday ölü kod**: `PremiumQuizHistory.tsx` — sıfır
içe aktaran. Kalıbı da zaten zararsız (yüzdeler tek tek yuvarlanıp
ortalanıyor; yüzde ortalamasında olağan gösterim).

**İki denetim zaten yapısal olarak araca özgü:** `kapi-kapsam` girdisini
`parseLocaleNumber` değişkenlerinden alıyor, `payda` "/ N puan" ilanından —
ikisi de yalnızca hesaplayıcılarda bulunuyor. Onların `app/tools` sınırı
eksiklik değil TANIM.

Sonuç: kapsam bilerek dar tutulabilir. Bu denetimlerin aradığı sınıflar
(bant merdiveni, karar rengi, yuvarlama taşması, eksik tablo alanı) klinik
HESAP şekilleri; premium ve site sayfaları sunum yapıyor. Dışarısı ölçüldü,
temiz çıktı ve yeniden ölçmeye gerek yok — o taraf değişmedikçe.

### En çok kullanılan dört formül aracı sürüldü — hepsi temiz

İnfüzyon serisi kapandıktan sonra aynı yöntem (sür → elde yeniden hesapla)
günlük kullanımı en yoğun formül araçlarına uygulandı:

| araç | girdi | ekranda | elle |
|---|---|---|---|
| `corrected-calcium` | Ca 7.0 · alb 2.0 | 8.6 | 7.0 + 0.8×(4−2) |
| `corrected-sodium` | Na 130 · glukoz 600 | 138 | 130 + 1.6×5 (Katz) |
| `anion-gap` | Na 140 · Cl 100 · HCO₃ 24 · alb 2.0 | 21 | 16 + 2.5×(4−2) |
| `egfr` | erkek 60y · Scr 1.0 | 86.2 | CKD-EPI 2021 |
| `egfr` | **kadın** 60y · Scr 1.0 | 64.5 | κ 0.7 · α −0.241 · ×1.012 |

`egfr`in kadın dalı özellikle ölçüldü: 2021 formülünde κ, α ve 1.012
çarpanının üçü birden değişiyor, yani aktarma hatasının en olası yeri orası.
İkisi de doğru çıktı.

`corrected-sodium` ayrıca **ilan–hesap uyumu** açısından örnek: ekranda
"Katz Formülü" ve `Na + 1.6 × ((Glukoz − 100) / 100)` yazıyor, hesap birebir
onu yapıyor, gösterilen fark (+8) da tutuyor.

Beş değerin hepsi ayrıca **Node ile bağımsız olarak** hesaplandı; iki yöntem
birebir uyuştu.

**ERİŞİLEBİLİR AD ARAMASI ÜÇÜNCÜ KEZ YANILTTI — ve bu kez ters yönde.**
Belgede iki kayıt vardı: kaynakta `htmlFor` aramak yanıltır (saran etiketi
göremez) ve `closest('label')` yanıltır (`label[for]`u göremez). Bu turda
üçüncüsü yaşandı: `anion-gap`in dört alanı "AD YOK" raporlandı, oysa adlar
SARAN etiketteydi — kısayol ölçütüm o mekanizmayı atlamıştı.

Kural artık istisnasız: adı **tam zincirle HESAPLAT** —
`aria-label` → `aria-labelledby` → `label[for]` → saran `<label>`.
Tek mekanizmaya bakan her ölçüm bir yönde ya da öbüründe yanılıyor.

### ACİL / İNFÜZYON SERİSİ KAPANDI — 18 aracın 18'i bağımsız hesapla sürüldü

Sürmekte olan iş tamamlandı. Her araç tarayıcıda gerçek girdiyle sürüldü ve
her sayı ELDE yeniden hesaplanıp karşılaştırıldı. Kaynak okumak sayılmadı;
"ben yazdım" hiç sayılmadı.

| araç | doğrulanan |
|---|---|
| `heparin-nomogram` | AKS tavanları 4000 Ü / 1000 Ü/sa, kırpma bildirimli |
| `nac-infuzyon` | üç torba + 110 kg dozlama tavanı |
| `fosfat-replasman` | 44.8 mmol · 65.7 mEq · 6.6 saat |
| `potasyum-replasman` | periferik 1500/6/250 · santral 600/3/200 |
| `fomepizol` | 15/10/15 mg/kg |
| `dka-infuzyon` | 15–20 mL/kg · 0.1 Ü/kg (bolussuz varyant dahil) |
| `tromboliz-doz` | 90 mg tavanı, bolus+kalan toplamı tutuyor |
| `vazoaktif-infuzyon` | mcg/kg/dk ve mcg/dk ayrımı; kilo iki katına çıkınca nitrogliserin DEĞİŞMİYOR |
| `sedasyon-infuzyon` | yedi ilacın birim tabanı — **kusur bulundu ve düzeltildi** (torba ömrü yuvarlanmış hızdan) |
| `bikarbonat-infuzyon` | 175 mEq · yarım 88 · ampul 17.5 · izotonik 1167 mL |
| `magnezyum-infuzyon` | 2 g → 16.2 mEq · 300 mL/sa; 4 g → 32.5 mEq · 42 mL/sa |
| `kalsiyum-infuzyon` | 43.75 → 44 mg/sa · 43 mL/sa (yuvarlama %0.5, tutarlı) |
| `digoksin-toksisitesi` | üç kip: düzey, alınan miktar, ampirik (akut/kronik canlı) |
| `status-epileptikus` | yedi ajan — **kusur bulundu ve düzeltildi** (fenitoin/fosfenitoin tavanı boştu) |
| `antikoagulan-geri-dondurme` | protamin zaman oranları, PCC sınırları, iki tavan |
| `hiperkalemi-tedavi` | EKG ve anürik denetimleri kararı gerçekten değiştiriyor |
| `lipid-emulsiyon` | 105 mL · 17.5 mL/dk = 1050 mL/sa · 840 mL tavan · 42 dk |
| `naloksan-infuzyon` | 2/3 oranı; 250 mL/sa makullük tavanı hızı bastırıyor, saatlik dozu bırakıyor |

**Seride iki kusur çıktı, ikisi de aritmetikti** — biri yuvarlamanın ikinci
hesaba taşması, biri eksik doz tavanı. Hiçbiri lint/typecheck/build ile
görülemezdi; ikisi de yalnızca **ekrandaki sayıyı elle hesaplananla
karşılaştırınca** ortaya çıktı.

**Yöntemin özeti:** aracı sür, her sayıyı elde yeniden hesapla, sonra
tavanın ISIRDIĞI ve ISIRMADIĞI iki girdiyle birden ölç. İkinci ölçüm
olmadan "düzeltme özelliği öldürdü mü" sorusu cevapsız kalıyor.

### Kendi yazdığın aracı da BAĞIMSIZ hesapla — "ben yazdım" doğrulama değil

Seride yeniden hesapla sürmediğim dört araç kalmıştı ve dördü de bu oturumda
benim yazdıklarımdı. İkisi sürüldü, kusur çıkmadı — ama ölçüm yapılmadan
"temiz" denemezdi.

**`antikoagulan-geri-dondurme` — beş ajan, hepsi elle hesapla birebir:**

| ajan | girdi | ekranda | elle |
|---|---|---|---|
| protamin | 3000 Ü · <30 dk | 30 mg | 1 mg/100 Ü |
| protamin | 3000 Ü · 30–60 dk | 15 mg | 0.5 mg/100 Ü |
| protamin | 3000 Ü · 60–120 dk | 11.3 mg | 0.375 mg/100 Ü = 11.25 |
| protamin | 8000 Ü · <30 dk | **50 mg** | ham 80 → tavan 50, bildirimli |
| 4F-PCC | 70 kg · INR 3 / 4 / 6 / 6.1 | 1750 / 2450 / 2450 / 3500 Ü | 25 / 35 / 35 / 50 Ü/kg |
| 4F-PCC | 120 kg · INR 7 | **5000 Ü** | ham 6000 → tavan 5000 |
| K vitamini · idarucizumab | — | 10 mg · 5 g | sabit doz |

PCC satırı ayrıca **düzeltilmiş bir kusurun tarihsel kontrolü**: eşik dizisi
yerine açık koşul konduktan sonra INR 3 artık 25 Ü/kg alıyor ve iki sınırın
ikisinde de (tam 4 ve tam 6) değer doğru tarafa düşüyor. Sınır değerini
**altı, tam kendisi, üstü** diye üç noktadan ölçmek bu turda yine işledi.

**`hiperkalemi-tedavi` — iki denetim de ÖLÜ DEĞİL, ikisi de kararı değiştiriyor:**

| denetim | kapalı | açık |
|---|---|---|
| EKG değişikliği | "Potasyum 6.5 — **AĞIR**" | "**HAYATİ TEHDİT EDEN** — EKG aciliyeti K değerinden bağımsız belirler" |
| Anürik / diyaliz | "Furosemid 40 mg IV — idrar çıkışı olan hastada" | "Potasyum bağlayıcı (oral)" |

İkincisi klinik olarak da doğru ayrım: anürik hastada kıvrım diüretiği
işe yaramaz. K merdiveni de canlı (5.2 NORMAL SINIRDA · 5.5 HAFİF · 6.5 AĞIR).

**Kalan iki araç (`lipid-emulsiyon`, `naloksan-infuzyon`) bu turda
sürülmedi ve "temiz" DENMİYOR.**

### Tavan alanı VAR ama iki kayıtta BOŞ — aracın kendi içinde tutarsızlık

Yeniden hesapla süpürmesi `status-epileptikus`ta gerçek bir eksik buldu.
Araç yedi ajanın **beşine** doz tavanı koyuyor (`tavanMg`) ve tavan
uyguladığında bunu SÖYLÜYOR — "150 kg × 60 = 9000 mg çıkıyor; tavan 4500 mg
olduğu için doz oraya indirildi". Dosyanın kendi başlığı da bunu bir tasarım
kararı olarak yazıyor.

Alan boş kalan iki ajan, tam da tavanı standart olan ikisiydi:

| ajan | 150 kg'da ekranda | olması gereken |
|---|---|---|
| fenitoin | **3000 mg** | 1500 mg |
| fosfenitoin | **3000 mg FE** | 1500 mg FE |

Sayı dışarıdan gelmedi: dozların zaten aktarıldığı aynı kaynak (AES 2016)
fenitoin ve fosfenitoin için doz başına 1500 mg / 1500 mg FE veriyor —
levetirasetam 4500 ve valproat 3000 de oradan gelmişti. Yani düzeltme yeni
bir klinik iddia değil, **aracın kendi ölçüsüne hizalanma.**

**Ölçüt: bir tablo alanı KAYITLARIN ÇOĞUNDA doluysa, boş kalanları say.**
`tavanMg` 7 kaydın 5'inde doluydu; eksik ikisi göz taramasıyla değil bu
oranla bulundu.

Doğrulama, tavanın ISIRDIĞI ve ISIRMADIĞI iki kiloyla birden yapıldı:

| ölçüt | 150 kg | 70 kg (negatif kontrol) |
|---|---|---|
| fenitoin dozu | 1500 mg · 30 dk (1500/50) | 1400 mg · 28 dk — değişmedi |
| fosfenitoin | 1500 mg FE · 150 mg FE/dk | 1400 mg FE · 140 mg FE/dk |
| "tavan uygulandı" bildirimi | 6 ajanda çıkıyor | **yalnızca 2** (lorazepam, midazolam) |

Son satır ayırt edici olan: 70 kg'da fenitoin 1400 < 1500 olduğu için
bildirim ÇIKMAMALI ve çıkmıyor. Bildirimin varlığını değil, **doğru kartta
olup olmadığını** ölç.

**Ölçüm tuzağı — "kiloya göre" metni bildirim sanıldı.** Kırpma bildirimini
gövde metninde aramak yanılttı: lakosamid açıklaması da "kiloya göre DEĞİL
sabit dozlanır" diyor ve her kiloda görünüyor. Bildirimler `role="status"`
taşıyor; ölçüm oradan yapılınca sayı ve içerik netleşti.

**Digoksin de üç kipiyle sürüldü, temiz:** düzey (4 ng/mL · 70 kg → 2.80 →
3 flakon), alınan miktar (5 mg → (5×0.8)/0.5 = 8 flakon), ampirik (akut
10–20, kronik 3–6 — aç/kapa çıktıyı gerçekten değiştiriyor). Ayrıca sabit
kalan "20 flakon" kartı kusur değil: "Kardiyak arrest — durum ne olursa
olsun" diyor, yani bilerek değişmiyor.

### İnfüzyon serisi BAĞIMSIZ YENİDEN HESAPLA sürüldü — yedi araç, kusur yok

Kaynak taramaları sınıf sınıf ilerliyor; ama son turlarda bulunan gerçek
kusurların hepsi (meld-na · rapid3 · scorad · sodium) aynı yöntemle çıktı:
**aracı sür, sonucu ELDE yeniden hesapla, iki sayıyı karşılaştır.** Bu tur o
yöntem infüzyon serisine sürüldü.

| araç | girdi | ekranda | elle hesap |
|---|---|---|---|
| `heparin-nomogram` | AKS · 100 kg | yükleme **4000 Ü** · idame **1000 Ü/sa** | 60×100=6000 ve 12×100=1200 → tavanlar uygulandı |
| `nac-infuzyon` | 70 kg | 10500 · 3500 · 7000 mg | 150/50/100 × 70 · hızlar 200 · 125 · 62.5 mL/sa |
| `nac-infuzyon` | 150 kg | yükleme **16500 mg** | 150×**110** (dozlama kilosu tavanı) |
| `fosfat-replasman` | ağır · KPhos · periferik · 70 kg | 44.8 mmol · 65.7 mEq · 6.6 saat | 70×0.64; 44.8/3 mL × 4.4 mEq; /10 mEq/sa |
| `potasyum-replasman` | 60 mEq periferik | 1500 mL · 6 saat · 250 mL/sa | 60/40 L; 60/10 sa |
| `potasyum-replasman` | 60 mEq santral | 600 mL · 3 saat · 200 mL/sa | 60/100 L; 60/20 sa |
| `fomepizol` | 80 kg | 1200 · 800 · 1200 mg | 15/10/15 mg/kg |
| `dka-infuzyon` | 70 kg | 1050–1400 mL · 7 Ü · 7 Ü/sa | 15–20 mL/kg; 0.1 Ü/kg |

`heparin-nomogram` ayrıca örnek davranıyor: tavanı uygulamakla kalmıyor,
**neyin kırpıldığını söylüyor** ("kiloya göre 6000 Ü çıkıyordu; nomogram
tavanı olan 4000 Ü uygulandı"). Sessizce kırpmak, kullanıcının kendi
hesabıyla ekranı karşılaştırdığında güvensizlik üretir.

**BEKLENTİ TUTMADIĞINDA ÖNCE BEKLENTİYİ SINA — bu turda yine işledi.**
`dka-infuzyon` ilk saat sıvısını 15–20 mL/kg veriyor, benim beklentim
10–20'ydi. Sabitlere bakıldı: `ILK_SAAT_ML_KG = { alt: 15, ust: 20 }` ve araç
bolussuz insülin varyantını da (0.14 Ü/kg/sa) taşıyor. Gevşek olan benim
beklentimdi.

**`potasyum-replasman`da yol seçimi ÖLÜ DENETİM DEĞİL:** periferik→santral
geçişi üç sayıyı birden değiştiriyor (1500→600 mL, 6→3 saat, 250→200 mL/sa).
Bir kontrolün çıktıyı gerçekten değiştirdiğini görmek, onu ekrana koymuş
olmaktan ayrı bir ölçüm.

### Ölçüm tuzağı: `<script>` etiketleri de "ekrandaki metin"e karışıyor

Sayfadaki bütün ögelerden metin toplayan bir ölçüm, React'in akış çalışma
zamanı kodunu da topluyor. `fosfat-replasman` ölçümünde sonuç sayılarının
arasında **`$RC("B:0","S:0")`** çıktı ve bir an sayfaya sızmış bir hesap
tablosu formülü sanıldı; gerçekte `$RB=[];$RV=function(a){...}` ile başlayan
bir `<script>` düğümüydü.

Belgede zaten yazılı olan "`body.textContent` JSON-LD içeriyor" tuzağının
aynısı, farklı yükle. Ölçümden `script` ve `style` alt ağaçlarını çıkar —
yalnızca `textContent` okurken değil, **öge öge gezerken de**
(`e.closest('script')` ile ele).

### Kapı BAZI değerleri sınıyor, hepsini değil — boş kalan alan sessizce 0

Kalıp: `const x = <kapı> ? <ifade> : null`. İfadede geçen bir değer kapıda
YOKSA, o alan boş bırakıldığında `parseLocaleNumber("")` 0 döndürür ve hesap
sessizce eksik veriyle yapılır. Üç kapı da göremez.

`spot-urine`da ölçüldü — idrar osmolal açığı:

```
const uOsmCalc = una2N > 0 && uk2N > 0        // ÜRE kapıda YOK
  ? 2*(una2N+uk2N) + uureabN/2.8 + uglucN/18 : null;
```

İdrar üresi tipik 100–500 mg/dL ve hesaplanan osmolaliteye 36–180 mOsm/kg
katıyor. Boş bırakılınca hesaplanan osmolalite o kadar düşük, **açık o kadar
yüksek** çıkıyor. Aynı hastada (Na 40 · K 30 · Cl 80 · ölçülen osm 350):

| idrar üresi | açık | yorum |
|---|---|---|
| **boş** | 210 | "artmış NH₄⁺ atılımı" — uygun asidoz yanıtı |
| 400 mg/dL | 67 | "NH₄⁺ atılımı yetersiz" — distal RTA |

Eşik 150; yani **tek bir boş alan klinik yorumu tam tersine çeviriyordu.**

**AYRIM DEĞERE DEĞİL, ALANIN SIFIR OLABİLİRLİĞİNE BAKAR.** Aynı ifadedeki
idrar glukozu boş bırakılabilir — idrarda glukoz bulunmaması normaldir ve
alanın kendi örneği zaten "ör. 0". Üre için 0 fizyolojik olarak imkânsız.
Kapı bu yüzden ham dizeye bakıyor (`uureab.trim() !== ""`), sayıya değil.

**Hesaplanamıyorsa SEBEBİNİ söyle.** Sessizce boş bırakmak, kullanıcının
değeri girdiğini sanmasına yol açar; açık yerine ne eksik olduğunu anlatan
bir uyarı çıkıyor.

`scripts/kapi-kapsam-denetim.cjs` sınıfı tarıyor: 131 araç, 112 kapılı
ifade, **4 aday**.

**ÖLÇÜT BİR KEZ DARALTILDI: kapı DOLAYLI olabiliyor.** İlk sürüm adları
harfi harfine karşılaştırıyor ve **34 aday** veriyordu; çoğu sahteydi, çünkü
kapı adlandırılmış bir bool:

```
const heparinTamam = sayiGirildiMi(heparin) && heparinNum > 0;
const protaminHam  = heparinTamam ? heparinNum * 1 : null;   // sahte aday
```

`heparinTamam` metinde `heparinNum` içermez ama ONU sınar. Kapıdaki her
tanımlayıcının tanımı bir düzey açılınca 34 → 4 oldu.

**Kalan dördün ÜÇÜ de ölçümle temiz çıktı — ve sebebi ölçütün sınırını
gösteriyor: koruma çoğu zaman İFADEDE değil GÖSTERİMDE.** `bmi` ağırlık
boşken "–" basıyor, `kdigo-aki` güncel kreatinin boşken "–", `sodium`daki
blok zaten `naN > 0` koşulunun içinde. Denetimin değeri kusur listesi vermek
değil, elle bakılacak dört satırı 112 ifadeden ayırmak.

### "Okunmayan alan" YANLIŞ ölçüttü — kusur, alanın TEK YERDE atlanmasıydı

`spot-urine` kusurunu genelleştirmek için önce şu ölçüt yazıldı: **dönüş
nesnesinde hiç okunmayan alan.** Tarihsel kontrolde DÜŞTÜ ve sebebi
öğreticiydi: `ok` aslında okunuyordu — paylaşılan `ResultRow` bileşeni altı
satırı ondan boyuyor. Kusur "alan hiç okunmuyor" değil, **"her yerde
okunuyor ama TEK bir kart atlayıp kararı yeniden hesaplıyor"**dı.

Doğru ölçüt iki koşulun KESİŞİMİ ve `scripts/karar-denetim.cjs` bunu tarıyor:

1. dosyada bir KARAR ALANI döndürülüyor (`ok:` gibi),
2. bir `className` ifadesi kararı HAM SAYI karşılaştırmasından üretiyor.

İkincisi tek başına meşru — karar alanı yoksa atlanacak bir şey de yok.
Şüphe, aynı dosyada iki gerçekliğin bir arada olmasından doğuyor.

Doğrulama: negatif + iki pozitif kontrol, ve **gerçek kusurla tarihsel
kontrol** — düzeltme öncesi `spot-urine`da tam olarak kusurlu üç satırı
(328/330/332) yakalıyor, güncel depoda 0 veriyor.

### Aynı sınıfın TERSİ: hesaplanmış sunum kararı ekrana hiç ulaşmıyor

`spot-urine`da ekran kararı YENİDEN hesaplıyordu. `esas`ta ise kararı HİÇ
kullanmıyordu: `colorForScore` bir `bar` rengi üretiyor ve o alan hiçbir
yerde okunmuyordu.

Ölçüldü — semptom şiddeti 0, 1 ve 9 için kaydırıcının dolu kısmı **aynı
lacivert** (`rgb(26,26,107)`), oysa yanındaki sayı ve tik etiketi şiddete
göre yeşil/kırmızı oluyordu. Üç görsel kanalın ikisi şiddeti kodluyor,
üçüncüsü kodlamıyordu — üstelik o kanalın rengini üreten kod dosyada zaten
duruyordu.

Kaydırıcı dolgusu satır içi degrade olduğu için sınıf değil hex gerekiyordu;
`bar` → `cizgi` yapıldı ve tek kaynak oldu. Ölçüldü: 2 → yeşil, 5 → amber,
9 → kırmızı, ve **negatif kontrol olarak çubuk ile sayının rengi her satırda
aynı aileyi gösteriyor** (üç kanal birbirini doğruluyor).

`asdas` de aynı sınıfta ve DÜZELTİLMEDİ: bant nesnesi `sub` (aralık etiketi),
`bg` ve `border` döndürüyor, üçü de okunmuyor — kart yalnızca `color` ve
`label` kullanıyor. Kusur değil eksik affordans; kardeş araçlar (`rapid3`,
`scorad`) bant cetvelini ve renkli kartı gösteriyor. Ölçüldü, not edildi,
değiştirilmedi.

### Rengi metinden BAĞIMSIZ hesaplamak — sayı "iyi", yorumu "kötü" diyordu

`spot-urine`daki TTKG kartı üç kusuru birden taşıyordu ve kökü tek: yorum
fonksiyonu bir `ok` alanı DÖNDÜRÜYOR ama **hiç kullanılmıyordu**; renkler
ondan bağımsız, `ttkg >= 5 && pkN > 5` ile hesaplanıyordu.

Üç durum ölçüldü, İKİSİ yanlış boyanıyordu:

| hasta | TTKG | yorum | büyük sayının rengi |
|---|---|---|---|
| hipokalemik K 3.0 | 8.0 | renal K kaybı — **anormal** | **mavi (güven verici)** ✗ |
| normokalemik K 4.0 | 6.0 | yoruma girmiyor | zemin ve metin **alarm kırmızısı** ✗ |
| hiperkalemik K 6.0 | 1.0 | hipoaldosteronizm — anormal | kırmızı ✓ (rastlantıyla) |

Birincisi tehlikeli yön: gözün ilk gittiği büyük sayı güven verici renkte,
hemen altındaki cümle "renal K kaybı" diyor. İkincisi ise **her normokalemik
hastaya** kırmızı kart gösteriyordu — alarm yorgunluğu üreten sahte uyarı.

Üçüncü çelişki etiketlerdeydi: hipokalemide TTKG 5 için ekran "TTKG **< 3**"
basıyordu, yani gösterdiği sayıyla çelişiyordu.

**Çare rengi TEK KAYNAĞA bağlamak.** `ok` üç durumlu yapıldı
(`false` anormal · `true` beklenen yanıt · `null` yorum yok) ve zemin, sayı,
metin üçü de ondan besleniyor. Artık sayı ile yorum ayrışamaz.

**Bir gösterim değeri, onu anlatan metinden AYRI hesaplanıyorsa ikisi
er geç ayrışır.** Aynı kalıbın başka biçimleri belgede kayıtlı: ilan edilen
sayı ile dosyadaki gerçek (premium modüller), eşik dizisi ile etiket
(`antikoagulan-geri-dondurme`), payda ile ulaşılabilir tavan (`rapid3`).

`scripts/bant-denetim.cjs` bu sınıfın ölçülebilir yarısını tarıyor: ekranda
basılan sınır ile koddaki merdivenin KAPSAYICILIĞI çelişiyor mu
(`kod <= 3` ↔ `cetvel < 3`). Tam o değerde bant ayrışır.

**Ölçüt İKİ KEZ daraltıldı, ikisi de sahte bulgu üretiyordu:**

- **"Cetvelde olup merdivende olmayan sayı"** ölçütü 28 aracın 23'ünü
  işaretledi; fazla çıkanların hepsi ölçeğin UÇ DEĞERLERİYDİ (braden 6–23,
  dlqi 30, heart 0–10). Cetvelde uç göstermek doğru.
- **Varlık kodları.** JSX metninde düz `<` yazılamaz, cetveller `&lt;`
  kullanıyor; çözülmeden ölçüt aradığı biçimi göremiyordu.

**Tohum GERÇEK ŞEKLİ taşımalı — bu tur bir kez daha yaşandı.** İlk tohum
cetveli fonksiyon gövdesine koymuştu; metin çıkarıcının `{…}` süzgeci
gövdenin tamamını yutuyor ve negatif kontrol "ölçüt kör" diyordu. Kusur
ölçütte değil TOHUMDAYDI; gerçek araçlarda cetvel modül düzeyinde bir satır
dizisinde duruyor.

**En güçlü doğrulama sentetik tohum değil, GERÇEK KUSURUN önce/sonra
çiftiydi:** düzeltme öncesi `spot-urine` yakalanıyor, sonrası yakalanmıyor.

### Payda denetimi KAYNAKTAN yapıldı — 11 araç doğrulandı, sınıf KAPANMADI

Geçen turda 34 aracın 3'ünün ölçüldüğü ortaya çıkmıştı. Kalanı tarayıcı
sürücüsüyle taramak reddedilmişti; bu tur **kaynaktan** ölçüldü — azami puan
şıkların statik özelliği, tarayıcı gerekmiyor.

`scripts/payda-denetim.cjs` üç kova raporluyor ve **ayrıştıramadığı araç
için sayı UYDURMUYOR**:

| kova | sayı | anlamı |
|---|---|---|
| ilan = hesap | **11** | güçlü kanıt temiz |
| sapan | 1 | `findrisc`, verdikti betikte (alternatif gruplar fazla sayılıyor) |
| ayrıştırılamadı | 23 | sonraki turda **hepsi elle karara bağlandı** — aşağıda |

Doğrulanan 11: `4t-hit` 8/8 · `abcd2` 7/7 · `act` 25/25 · `bode` 10/10 ·
`braden` 23/23 · `child-pugh` 15/15 · `flipi` 5/5 · `heart` 10/10 ·
`isth-dic` 8/8 · `lawton-iadl` 8/8 · `nihss` 42/42 (15 grup).

**İKİ BAĞIMSIZ YÖNTEM UYUŞTU.** `braden` (23) ve `4t-hit` (8) geçen tur
tarayıcıda ELLE sürülmüştü; kaynak taraması aynı sayıları üretti. Bir
ölçütün ilk kez güvenilir sayıldığı an bu olmalı.

**TARİHSEL KONTROL DÜŞTÜ — ve sonuç betiğin başına yazıldı.** Düzeltme
öncesi `rapid3` ve `scorad` sürüldüğünde denetim ikisini de
"ayrıştırılamadı" diyor: yani **doğduğu iki kusuru yakalayamazdı.**

Sebep yapısal, ölçüt kusuru değil: ölçüt her grubun KENDİ şık dizisi
olduğunu varsayıyor. O iki araçta tek dizi (`FUNC_OPTS`, yoğunluk şıkları)
N madde boyunca yeniden kullanılıyor; grup sayısı dizide değil madde
listesinde duruyor.

Denetim yine de tutuldu, çünkü **yanlış "temiz" üretmiyor** — bilmediğini
ayrı kovaya koyuyor. Ama raporu "sınıf kapandı" diye okunamaz.

**Ölçüt bu turda ÜÇ KEZ düzeltildi ve üçü de sahte bulgu üretiyordu:**

- **En dıştaki diziyi grup saymak.** `const ITEMS = [{…, options:[…]}, …]`
  yapısında tek grup görülüyor; `braden` 6 grup yerine 1, tavanı 23 yerine
  **4** çıkıyordu. Grup, şıkları DOĞRUDAN taşıyan dizidir.
- **Anahtar adına bağlanmak.** `braden` yalnızca `options:` yerine `opts:`
  yazdığı için ayrıştırma dışında kalmıştı. (Aynı hata kapsam sayımında da
  oldu: `{ label: …, pts: N }` biçiminde `pts` ilk anahtar olmadığı için
  "8 araç pts kullanıyor" denmişti; gerçek sayı **44**.)
- **Bool bileşenleri saymamak.** `abcd2` skoru `(age?1:0)+(bp?1:0)+cln+dur+
  (dm?1:0)`; ölçüt yalnızca iki şık dizisini görüp 4 diyordu, ilan 7.

Üçü de "sapan" olarak raporlanıyordu, yani ölçüt düzeltilmeseydi üç sahte
kusur kovalanacaktı. **Bir tarama ilk çalıştırmada aday üretiyorsa, önce
ölçütü sına.**

#### Kalan 23 araç ELLE karara bağlandı — payda sınıfı KAPANDI

Denetimin ayrıştıramadığı 23 araç kaynak okunarak tek tek doğrulandı;
**hiçbirinde uyuşmazlık yok.** Verdiktler `payda-denetim.cjs` başında da
duruyor, o kova bir daha bekleyen iş sanılmasın.

| şekil | araçlar |
|---|---|
| N madde × şık tavanı | `cat-copd` 8×5=40 · `ciwa-ar` 7×9+4=67 · `dlqi` 10×3=30 · `gds-15` 15 · `mrss` 17×3=51 · `tnss` 4×3=12 · `uas7` 7×6=42 · `esas` 9×10=90 |
| bileşen toplamı | `conut` 6+3+2=11 · `glasgow-blatchford` 6+6+3+1+1+2+2+2=23 · `frail` 5 · `ipi` 5 · `timi-ua` 7 · `fibromiyalji` WPI 19 · `karnofsky` 100 · `gcs` 15 |
| alt sayaç (toplam payda değil) | `ranson` — "/5" ve "/6" ayrı sayaçlar, diziler 5 ve 6 öge |
| payda ilanı SAHTE (formül parçası) | `basdai` `(S5+S6)/2` · `gnri` `(Boy−150)/4` · `haq-di` · `spot-urine` `UÜre/2.8` |

Böylece payda ilan eden **35 aracın 35'i** karara bağlandı: 11'i denetimle,
23'ü elle, 1'i (`findrisc`) elle + verdikt. Yeni kusur çıkmadı — bu seride
bulunan iki kusur (`rapid3`, `scorad`) sınıfın tamamıymış.

**ÖLÇÜT BU TURDA DA BİR SAHTE ADAY ÜRETTİ ve şekli öğretici:** `ranson`
dizilerini 6 ve 7 öge saydım, etiketler "/5" ve "/6" diyordu ve bir an
"hepsi işaretlenirse 6/5 yazacak" sanıldı. Sayım TİP ANOTASYONU satırındaki
`{ key: CriterionKey; label: string }[]` ifadesini de öge saymıştı.
**Bir diziyi `grep -c` ile saymak, tip anotasyonu aynı anahtarı taşıyorsa
bir fazla sayar** — diziyi aç ve öğelerini gör.


### Genel bir "aracı uçlara sür" tarayıcısı YAZILDI ve REDDEDİLDİ

Payda ilan eden 34 aracı süpürmek için tek bir sürücü denendi. Çalışmadı ve
**kullanılmadan atıldı** — çünkü "0 kusur" ile "0 ölçüm"ü ayırt edemiyordu.

İki ayrı körlük ölçüldü:

- **Düğmenin başındaki sayıyı puan sanmak.** Etiket de sayıyla başlıyorsa
  yanlış okur: `4t-hit`te `"1" + "5–10. günle uyumlu…"` birleşip **15**
  olarak ayrıştırıldı ve grup tavanları `[2,1,15,2,1,2,1,0]` çıktı.
- **Ölçüm penceresi.** Aynı sürücü `4t-hit` için `0` bildirdi; o araç ELLE
  sürüldüğünde **8 / 8** basıyor. Yani sürücünün raporu kusur uydururdu.

Üçüncü sınır: araçlar tek bir denetim türü kullanmıyor. `findrisc`te
`aria-pressed` düğme SIFIR — 23 radyo var, üstelik `name` ve sayısal
`value` taşımıyorlar. Tek sürücüyle 34 aracı sürmek mümkün değil.

**Pozitif kontrol olmasaydı bu sürücünün raporu yayımlanırdı.** Bilinen
cevaplı iki araçla sınandı: `braden` geçti (6→23), `4t-hit` DÜŞTÜ. Yeni bir
sürücü yazan, önce cevabını bildiği bir araçta sınasın.

**Elle doğrulanan üç araç temiz:**

| araç | ulaşılabilir | ilan | not |
|---|---|---|---|
| `braden` | 6–23 | 6–23 | 6 grup, tavanlar [4,4,4,4,4,3] |
| `4t-hit` | 0–8 | / 8 puan | 4 grup × 3 şık |
| `findrisc` | 0–26 | / 26 | 4+3+4+2+1+2+5+5, bantlar yayımlanmış |

### Yayımlanmış formülde ÖLÇEK ÇARPANI düşer ve hiçbir kapı görmez

`meld-na`daki eksik `× 10` tek seferlik bir kaza değilmiş. Aynı sınıf iki
araçta daha bulundu; üçünde de kusur **normalizasyon adımının atlanması**.
Kod geçerli, tipler doğru, derleme temiz — sayı yanlış.

**Bu sınıfı bulmanın ucuz yolu: aracın KENDİ İLAN ETTİĞİ aralığı, ulaşılabilir
uçlarla karşılaştır.** Ekranda payda yazıyorsa (`/ 30`, `/ ~103`) ya da
başlıkta aralık geçiyorsa, en yüksek seçimlerle sürülüp o sayıya gerçekten
çıkılıp çıkılmadığına bakılır. Depoda aralık ilan eden **üç araç** vardı ve
**ikisi kusurluydu**:

| araç | ilan | ulaşılabilir | sebep |
|---|---|---|---|
| `rapid3` | 0–30 | **0–50** | işlev toplamı (0–30) 3'e BÖLÜNMÜYORDU |
| `scorad` | 0–103 | **0–85** | subjektif bileşen (0–20) 10'a BÖLÜNÜYORDU |
| `das28` | — | — | temiz (iki formül de doğru, eşikler yayımlanmış) |

> **KAPSAM DÜZELTMESİ — o "üç araç" YANLIŞTI.** Ölçüt yalnızca `(0–N)` ve
> `N puan arası` biçimlerini arıyordu. Payda ilanının en yaygın biçimi
> `/ N puan` ise hiç görülmüyordu: yeniden sayıldı, **34 araç** paydasını
> ilan ediyor. Yani "sınıf kapandı" derken 34'ün 3'ü ölçülmüştü.
>
> Bulunan iki kusur gerçek ve düzeltmeleri geçerli; yanlış olan KAPSAM
> iddiasıydı. Kalan 31 araç ölçülmedi ve "temiz" DENMİYOR.

**İki kusur ters yönde ve ikisi de tehlikeli.**

`rapid3` skoru ŞİŞİRİYORDU: on maddenin hepsine "çok güçlük" (2 puan),
ağrı 0, global 0 verilen hastada ekran **"20 / 30 · YÜKSEK AKTİVİTE —
tedavi değişikliği değerlendir"** diyordu; doğrusu 20/3 = **6.7 · ORTA**.
Bir bant yukarı.

`scorad` skoru BASTIRIYORDU: kaşıntı ve uyku kaybı 0'dan 10'a çıkarıldığında
skor yalnızca **47 → 49** oynuyordu; doğrusu **47 → 67**, yani ORTA'dan
AĞIR'a geçiş. Hastanın kendi bildirdiği yarı neredeyse hiç sayılmıyordu ve
sistemik/biyolojik tedavi değerlendirmesine geçilmiyordu.

**Üçünde de YORUM kusuru gizleyen taraftaydı.** `rapid3`in üst yorumu "3
etkinlik sorusu" diyordu (madde sayısı 10) ve normalizasyondan söz edip onu
yapmıyordu; `scorad`ın üst yorumu formülü doğrudan yanlış yazıyordu
(`+ C/10`). Yorum kodun ne YAPMASI gerektiğini değil, ne YAPTIĞINI
anlatmalı — yanlış yorum, okuyanı ölçmekten alıkoyuyor.

**Ekran ikisinde de kendisiyle çelişiyordu**: `rapid3` "20 / 30" basarken
tavanı 50, `scorad` "/ ~103" basarken tavanı 85'ti. GKS'deki "297 / 15"
şeklinin aynısı — payda ile ulaşılabilir tavanı karşılaştırmak, dış bir
kaynağa hiç bakmadan karar verdiriyor.

**Negatif kontrol: uçlar VE komşu bileşenler.** Bir ölçek düzeltmesi
yalnızca "artık doğru sayıyı basıyor mu" ile sınanmaz; öteki bileşenlerin
hâlâ skora girdiği de ölçülmeli.

| ölçüt | rapid3 | scorad |
|---|---|---|
| tavan ilan edilen sayıya eşit mi | 30 / 30 | 103 / ~103 |
| taban | 0 · REMİSYON | 0 · HAFİF |
| öteki bileşenler hâlâ etkili mi | ağrı 10 → 10, +global 7 → 17 | alan ve yoğunluk uçlarda çalışıyor |

### Bir kusur İKİNCİSİNİ GİZLEYEBİLİR — ölçek hatası tavan hatasını örtüyordu

`meld-na` aracında iki kusur üst üste binmişti ve ikincisi ancak birincisi
düzeltilince görünür oldu.

**1. Karaciğer teriminde `× 10` yoktu.** UNOS formülü parantezin tamamını
10 ile çarpar; katsayılar doğruydu ama çarpan düşmüştü:

```
meld   = 0.957·ln(Cr) + 0.378·ln(bili) + 1.12·ln(INR) + 0.643   // × 10 YOK
meldNa = meld + 1.59 · (135 − Na)                                // TAM ölçek
```

İki terim farklı ölçekteydi: onda birlik bir MELD'e tam ölçekli bir sodyum
düzeltmesi ekleniyordu, yani skoru sodyum tek başına yönetiyordu. Üstelik
kıskaç 2016 varyantından (125–137) alınmış ama referans 2008'in `135 − Na`
ifadesi olduğu için terim EKSİYE düşebiliyordu.

Bedeli ölçüldü:

| girdi | ekranda | doğrusu |
|---|---|---|
| Cr 1 · bili 1 · INR 1 · Na 137 | **−3** | 6 |
| Cr 4 · bili 2 · INR 1.5 · Na 135 | **3** | 28 |

**Eksi bir MELD mümkün değildir** (aralık 6–40) — dış bir kaynağa bakmadan,
yalnızca ekrana bakarak verilebilecek bir karar.

**2. Kreatinin tavanı KAPATILABİLİRDİ ve varsayılan KAPALIYDI.** UNOS
tanımında Cr 4.0'da kırpılır ve bunun kapatılabilir hâli yoktur; araçta ise
"Kreatinin tavanı: 4.0 mg/dL" diye varsayılan olarak İŞARETSİZ bir onay
kutusuydu. Cr 8 girilince skor 34 çıkıyordu, doğrusu 28 — nakil önceliğinin
konuşulduğu bir skorda 6 puan.

**İkinci kusur birinci yüzünden GÖRÜNMÜYORDU.** Eski ÷10 ölçeğinde Cr 4
(2.686) ile Cr 8 (3.349) **ikisi de 3'e yuvarlanıyordu**; tavanı sınayan
ölçüm "aynı sayı çıktı, demek ki kırpıyor" diyordu. Ölçek düzelince
28 ve 34 ayrıştı ve tavanın hiç uygulanmadığı ortaya çıktı.

Ders: **bir düzeltmeden sonra AYNI aracı yeniden tara.** Ölçek, yuvarlama
ve kıskaç hataları birbirinin belirtisini yutuyor; ilk kusur giderilmeden
alınan "temiz" sonuçlar yeniden ölçülmeli.

**Kapatılabilir bir kutu yalnızca yanlış skor üretebiliyorsa, kutu olmamalı.**
Tavan koşulsuz uygulanıyor; kutu yerine ne olduğunu SÖYLEYEN bir satır var
("girilen 8.0, formülde 4.0 kullanıldı"). Bu, kutudan daha bilgilendirici:
kullanıcı kırpmanın olduğunu ve neyin kırpıldığını görüyor.

**Negatif kontrol beş ayaklıydı** — düzeltme özelliği öldürmemeli:

| ölçüt | sonuç |
|---|---|
| sodyum hâlâ etkili mi (Na 125) | 32 (135'te 28) |
| kreatinin tavanı çalışıyor mu (Cr 8) | 28, Cr 4 ile aynı |
| diyaliz kutusu Cr'yi 4 yapıyor mu | Cr 1 + diyaliz → 28 (Cr 4 ile aynı) |
| boş form | **–**, belgede kayıtlı "17" gerilemesi geri gelmemiş |
| bilgi satırı yalnızca kırpıldığında mı çıkıyor | Cr 8'de çıkıyor, Cr 2'de çıkmıyor |

**Beklenen değerler tarayıcıdan BAĞIMSIZ olarak da hesaplandı** (Node ile,
aynı formül elle yazılıp): 6 · 28 · 28 · 32. İki yöntem birebir tuttu.

### `Math.abs` anlamsız bir eksiyi MAKUL BİR TALİMATA çevirir

Bir hesabın sonucu eksi çıkıyorsa bu çoğu zaman "yön yanlış" demektir:
istenen düzeltme ile seçilen aracın etkisi ters. `Math.abs` o işareti
silince geriye tamamen makul görünen bir sayı kalıyor — ve o sayı klinik
bir TALİMAT olarak basılıyor.

`sodium` aracında iki dal birden ölçüldü, ikisi de yanlış yönde sayı
basıyordu:

| girdi | ekranda | gerçekte |
|---|---|---|
| Na **130**, hedef 140 | "Serbest Su Açığı **2.8 L** · 115 mL/saat" | açık değil, su **FAZLASI** var (−2.8 L) |
| Na **120** → 130, sıvı **D5W** | "Gerekli Hacim **3.3 L** · 110 mL/saat" | D5W sodyumu **düşürür**, hedef yükseltmek |

İkincisi daha tehlikeli: sodyumu 120 olan hastaya, sodyumu yükseltmek için,
litre başına −3.04 mEq/L etki eden bir sıvıdan 3.3 litre verme talimatı.

**Ekran İKİSİNDE DE kendisiyle çelişiyordu** ve çelişkiyi kimse söylemiyordu:
aynı panelde "Hedef Delta **+10** mEq/L" ile "1 L sıvı → **−3.04** mEq/L"
yan yana duruyordu. Eşik–etiket sınıfının aritmetik tarafındaki hâli.

**Çare işareti göstermek DEĞİL, sayıyı hiç basmamak.** Eksi bir hacim
gösterseydin kullanıcı yine bir sayı okurdu. Yön uyuşmuyorsa hacim ve hız
hesaplanmaz; yerine ne olduğunu ve ne yapılacağını söyleyen bir kart çıkar.
Aynı çözüm serinin başka bir aracında zaten vardı — `bikarbonat-infuzyon`
`hedefDusuk` ile tam bunu yapıyor. **Yeni bir kusur bulunca serideki komşu
araçlara bak: çözüm çoktan yazılmış olabilir.**

Koruma İKİ katmanlı konuldu: gösterim yön bayrağına bağlandı VE `Math.abs`
hesaptan kaldırıldı. Yalnızca gösterimi kapatmak, ileride bir gerileme
kusuru sessizce diriltebilirdi.

**Kapsam ölçüldü ve dar: 131 aracın yalnızca `sodium`'unda `Math.abs` var.**
Çıkarmayla açık hesaplayan tek öteki araç `bikarbonat-infuzyon` ve onun
kapısı zaten vardı; `potasyum-replasman`, `fosfat-replasman`,
`kalsiyum-infuzyon`, `magnezyum-infuzyon` hedef kavramı taşımıyor (doz
tabanlı), yani yön sorunu oluşamıyor.

**Negatif kontrol iki senaryoda birden yapıldı ve şart:** düzeltme,
MEŞRU vakayı bastırmamalı.

| senaryo | sonuç |
|---|---|
| Na 160 → hedef 140 (gerçek hipernatremi) | açık **5.5 L**, hız 115 mL/saat, süre 48 saat |
| Na 120 → 130, **%3 NaCl** (doğru sıvı) | hacim **1.0 L**, hız 34 mL/saat |

Aritmetiği de ayrıca doğrulandı: 38.5 × (160/140 − 1) = 5.5 ve 10 / 9.94 =
1.0. Bir kapı koyduktan sonra "hâlâ çalışıyor mu" sorusunun cevabı
"panel çıkıyor" değil, **"basılan sayı doğru mu"** olmalı.

### Girdi kanalı BİR TANE DEĞİL — adres parametresi de bir kanal

Yukarıdaki makullük kapıları klavye girdisini karşılıyor. Ama 11 araç
durumunu **adres parametresinden** de tohumluyor (`s?.get("e")`), yani ikinci
bir girdi kanalı var ve o kanal ayrı ölçülmedikçe görünmüyor.

Ölçüldü — on bir aracın **onu temiz**, sebepleri farklı:

| kalıp | araç | neden temiz |
|---|---|---|
| bool (`=== "1"`, `readBool`) | chads-vasc · curb65 · has-bled · perc · qsofa · timi-ua | `"1"` dışındaki her şey `false` |
| serbest sayısal | sofa · news2 · meld-na | değer klavyeyle AYNI duruma düşüyor, makullük kapısı orada — çöp parametrede `–` basıyor |
| aralık dışı seçim | ecog | `?ecog=9` hiçbir şık seçmiyor, etiket basılmıyor |

**Kusurlu olan tek araç, hiç klavye girdisi OLMAYANIYDI.** `gcs` değerleri
düğmeyle alıyor; serbest girdi olmadığı için ona hiç kapı konmamıştı ve
`Number(s?.get("e")) || 4` her sayıyı kabul ediyordu:

```
/tools/gcs?e=99&v=99&m=99  ->  297 · "E99 + V99 + M99 / 15" · Hafif
/tools/gcs?e=-99&v=1&m=1   ->  -97 · "Ağır (Entübasyon Eşiği ≤8)"
```

İkincisi tehlikeli yön: uydurma bir adres, tavanı 15 olan bir skorda en ağır
etiketi ve entübasyon eşiğini basıyordu. Üstelik ekran kendisiyle çelişiyordu
(`297 / 15`) — eşik–etiket sınıfının aynı şekli.

Ders: **serbest girdinin YOKLUĞU aracı güvenli GÖSTERİR, güvenli YAPMAZ.**
Düğmeyle çalışan bir araç "zaten geçersiz değer giremezsin" diye taranmadan
geçiliyor; adres o varsayımı deliyor.

Çare aralığı elle yazmak DEĞİL, geçerli kümeyi **düğmeleri çizen aynı
diziden** almak (`secenekler.some(o => o.value === n)`) — yoksa şıklar
değiştiğinde sınır listesi sessizce çelişir.

Negatif kontrol şart: geçerli parametre hâlâ geri yüklenmeli. Ölçüldü —
`?e=2&v=3&m=4` → 9 · "Orta" · üç düğme basılı; düzeltme özelliği öldürmedi.

`ToolShare` bugün sorguyu siliyor (`url.search = ""`), yani paylaşılan
bağlantı değer taşımıyor. Ama oradaki yorum bir dönem "parametreleri geri
okuyan araç SIFIR" diyordu ve bu YANLIŞTI — 11 araç okuyor. Yorum düzeltildi:
parametre yazmak yeniden açılırsa sonuç tutarsız olur (11 araçta değerler
geri gelir, ~100 araçta adres değer taşıdığı hâlde varsayılan gösterilir).


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

**BU SINIFIN ARTIK CI KAPISI VAR: `ic-bilesen-denetim.cjs`.** Elle 19 araçta
düzeltmek yetmedi — yeni yazılan bir araçta (status-epileptikus) aynı kusur
tekrar üretildi, üstelik sınıfı süpüren kişi tarafından. Denetim `app` ve
`components` altındaki bütün tsx'leri tarıyor, dört kontrolü birden arıyor
(`<input>`, `<select>`, `<textarea>`, `<button>`) ve bulursa CI düşüyor.

Ölçütün geçmişteki kusuru dosyanın içine yazıldı: ilk süpürme yalnızca
`<input>` arıyordu ve `<select>`/`<button>` taşıyan beş bileşen KENDİ ölçütü
tarafından elendi.

Denetim GEÇMİŞTEKİ GERÇEK KUSURLARLA sınandı — negatif kontrolün en güçlü
biçimi bu: düzeltme öncesi sürümler git'ten alınıp `app/` altına konuldu ve
üçü de yakalandı (`osmolal-gap` Input, `berlin-ards` BoolBtn, `abg` Input).
Dosyalar silinince tarama sıfıra döndü.

Bir tuzak: `abg` ilk denemede yakalanmadı, çünkü seçtiğim commit onun ZATEN
düzeltilmiş hâliydi. Tarihsel bir sürümle sınama yaparken commit'in gerçekten
düzeltmeden ÖNCE olduğunu doğrula.

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

### Dakika/saat birim tuzağı: 8 araç tarandı, sınıf temiz

`lipid-emulsiyon`daki 60 katlık birim tuzağı sweeplendi: dakika başına hız
basan 8 araç var, beşi saatlik karşılığı da veriyor. Kalan üçü ölçüldü ve
üçü de kusur DEĞİL:

| araç | neden kusur değil |
|---|---|
| `egfr` | `mL/dk` bir ÖLÇÜM birimi (mL/min/1.73m²), pompa hızı değil |
| `sofa` | `µg/kg/dk` bir GİRDİ etiketi — çalışan pompadan okunan doz |
| `status-epileptikus` | hem hız sınırını hem hastaya özgü EN KISA SÜREYİ veriyor (1400 mg → 28 dk) |

Üçüncüsü aslında en iyi çözüm: süre vermek birim dönüşümü gerektirmiyor.

### `` boşluksuz birleşen metinde ÇALIŞMAZ

React'te komşu ögelerin metni boşluksuz birleşiyor: ekranda "En az süre  28 dk"
görünen şey `textContent`te **"En az süre28 dk"** oluyor. `28` deseni
tutmuyor, çünkü '2'den önceki karakter harf.

Ölçüldü: `status-epileptikus` "28 dk"yı basıyordu ama tarama "hiç geçmiyor"
dedi ve bir an araç kusurlu sanıldı. Metin ararken ya `` kullanma, ya da
`textContent` yerine öge öge oku.

### Girdi SIRASINI varsayma, ETİKETİNİ oku

`news2` varsayılanlarında 120 ve 80 görünce "nabız 120, tansiyon 80" diye
okundu ve skorun 0 olması aritmetik hata sanıldı. Etiketler okununca tersi
çıktı: **120 sistolik KB, 80 nabız** — ikisi de normal ve skor 0 doğru.

Negatif kontrol aynı ölçümde: KB 40 yapılınca toplam 3'e çıkıyor, yani skor
canlı. Bir sayının hangi alana ait olduğunu sıradan çıkarmak, bu depoda
üçüncü kez yanlış sonuç verdi.

### Makullük tavanı ARACA ÖZGÜDÜR — genel bir sayı yanlış olur

`naloksan-infuzyon`a "250 mL/saat üstünü basma" koruması konuldu, çünkü orada
o hızın üstü torba içeriğinin yanlış girildiğini gösteriyor. `lipid-emulsiyon`
ise 70 kg için **1050 mL/saat** basıyor ve bu DOĞRU: LAST idamesi
0.25 mL/kg/dk, yani saatte 15 mL/kg.

Aynı korumayı ortak bir yardımcıya taşımak cazip ama yanlış olurdu — lipid
aracında meşru bir hızı bastırırdı. Makullük sınırı klinik bağlamdan gelir,
birimden değil.

### Paydaya 0 yazmak: 131 araç · 18 bölme noktası tarandı, sınıf temiz

`sayiGirildiMi` HAM DİZEYE bakıyor, yani kullanıcı bir paydaya `"0"` yazarsa
kapı GEÇİYOR ve bölme korumasız kalıyor — sonuç `Infinity`. Boş alan zaten
`parseLocaleNumber("")` ile 0 dönüyor ama orada kapı tutuyor; asıl açık
kullanıcının bilerek 0 yazması.

Ölçüldü: kullanıcı sayısına bölen 18 nokta var (kalsiyum · magnezyum ·
naloksan · sedasyon · vazoaktif · heparin infüzyonları) ve **altısında da
kapı `> 0` istiyor**, yani sınıf temiz.

**Ama bu "0" ilk turda GÜVENİLMEZDİ ve iki ayrı sebepten:**

- **Dosya düzeyinde eleme.** İlk ölçüt "bu dosyada `x > 0` geçiyor mu" diye
  bakıyordu; belgede zaten yazılı olan tuzak (aynı dosyadaki İKİNCİ bölme
  gizlenir). Eleme bölme NOKTASI düzeyine indirildi — kapı, bölmeyi açan
  ifadede aranıyor.
- **`</p>` kapanış etiketi bölme sanıldı.** `cdai`, `dapsa`, `sdai`, `ktv`,
  `ogtt` araçlarında `parseLocaleNumber` değişkeninin adı tek harfli
  (`p`, `t`, `h1`) ve ölçüt 17 sahte bulgu verdi. Bölme işaretinin önündeki
  karakter `<` olamaz.

İkisi de yalnızca POZİTİF kontrolle görünür; negatif kontrol ikisini de
geçerdi. Ölçüt tohumlu iki yönlü kontrolle sınandı, o yüzden sıfır sonuç
artık bir bulgu.

### Heredoc BACKSLASH SİLİYOR — regex taşıyan betiği Write ile yaz

Bu ortamda `cat > x.cjs <<'EOF'` (tırnaklı sınırlayıcıyla bile) kaçış
karakterlerini düşürüyor. Sonuç sessiz: `'/\\s*'` yazılan dize dosyaya
`'/\s*'` olarak iniyor, JS onu `'/s*'` diye okuyor ve **regex artık
bambaşka bir şey arıyor.**

Ölçüldü: bölme denetiminin negatif kontrolü bu yüzden düştü ve bir an
"ölçüt kör" sanıldı — kusur ölçütte değil, betiği YAZAN kanaldaydı.
Aynı kanal daha önce de birkaç kez sonuç bozdu.

Kural: içinde `\s`, `\b`, `\w`, `\d` geçen bir betiği heredoc ile yazma.
Write/Edit kullan, ya da kaçış istemeyen karşılıklarını yaz
(`[ ]*`, `[A-Za-z0-9_]`). Yazdıktan sonra `grep -n RegExp` ile dosyaya
gerçekten ne indiğini GÖR — bu, kusuru yakalayan tek adım oldu.

### Varsayılan değerden klinik etiket: 27 araç tarandı, sınıf temiz

`naloksan-infuzyon`da varsayılan değerin fiziksel olarak saçma bir sayı
üretmesi (500 mL/saat) yeni bir sınıf açtı: **boş olmayan varsayılanı olan
araçlar açılır açılmaz bir sonuç basıyor.** Kaynakta sayıldı — 27 araçta
sayısal varsayılan var. Hepsi ölçüldü.

> **KAPSAM DÜZELTMESİ — o "27" EKSİKTİ.** Ölçüt `useState("400")` biçimini
> arıyordu; `useState<string>(s?.get("pf") || "400")` (URL parametresi yedekli)
> biçimini HİÇ görmüyordu. Üç araç bu yüzden hiç ölçülmemişti: `sofa`,
> `news2`, `meld-na` — üstelik ilk ikisi belgede "boş formda maksimum skor"
> kusuru kayıtlı olanlar. Sonradan ölçüldü, üçü de temiz: SOFA 0, NEWS2 0
> (risk "Düşük", doğru), MELD-Na 1; hiçbiri yanlış bir iddia basmıyor.
> **O "1" ARTIK 6.** Aracın formülü sonradan düzeltildi (`× 10` eksikti);
> varsayılanlarla (Cr 1 · bili 1 · INR 1 · Na 135) skor MELD tabanı olan 6
> çıkıyor. Sayı değişti ama karar aynı: ekrandaki değerlerle tutarlı,
> uydurma bir iddia değil.
> Düzeltilmiş ölçütün pozitif kontrolü: `sofa` yakalanmalı.

**Hiçbiri dokunulmamış varsayılandan klinik SINIFLAMA basmıyor.** İki aday
çıktı, ikisi de yanlış pozitifti:

- `kdigo-aki` — evre göstergesi varsayılanla **"–"**; eşleşen "normal"
  seçili idrar çıkışı seçeneğinin etiketiydi, hasta sınıflaması değil.
- `magnezyum-infuzyon` — "normal" endikasyon cümlesinde geçiyor
  (*"düzey normal olsa bile ver"*).

İnfüzyon araçlarının varsayılan HIZI da ayrıca arandı: dokuzunda da
dokunulmamış hâlde hiç mL/saat basılmıyor (kilo/doz alanı boş, dürüst uyarı
çıkıyor). Pozitif kontrol: bolus girilince ölçüt "50 mL/saat"i buluyor — yani
boşluk gerçek, ölçüt kör değil.

### Ölçüm tarafında iki tuzak — ikisi de sahte bulgu üretti

- **Türkçe kelime sınırı.** `ağır` deseni **AĞIR**LIK içinde, `orta` deseni
  "**Orta** Aktif"te eşleşti; iki sahte bulgunun ikisi de buydu. JS'in ``'si
  ASCII'ye göre çalışıyor. Sınır elle kuruldu: eşleşmenin önündeki ve
  ardındaki karakter HARF olmamalı.
- **`body.textContent` JSON-LD içeriyor.** Sayfa gövdesinden metin okurken
  `<script type="application/ld+json">` blokları da geliyor ve ölçüm alakasız
  bir yere bakıyor. Panel metnini okurken `script`/`style` alt ağaçları
  klonda silinmeli.

### Denetimlerin doğrulama durumu — tablo, yeniden türetilmesin diye

Altı denetimin üçünde bu oturumda kör/bozuk ölçüt bulundu. Durum tek yerde:

| denetim | negatif | pozitif | tarihsel | yönlendirilebilir |
|---|---|---|---|---|
| `saydamlik-denetim` | 4 biçim | ✓ | 4 dosya | `cd` |
| `renk-cifti-denetim` | 3 biçim | ✓ 4 temiz | 10 kusur | `cd` |
| `ic-bilesen-denetim` | ✓ | ✓ 3 temiz | **7 kusur** | `cd` |
| `esik-etiket-denetim` | ✓ | ✓ (tohumda) | **YOK** | `cd` |
| `olu-denetim` | ✓ | ✓ | nrs-2002 | `--kok` |
| `bolme-denetim` | ✓ | ✓ 4 temiz | YOK — sınıfın kusuru hiç oluşmamış | `--kok` |
| `payda-denetim` | ✓ | ✓ 2 biçim | **DÜŞTÜ — kapsam sınırı yazılı** | konumsal arg |
| `bant-denetim` | ✓ | ✓ 2 biçim | ✓ **gerçek kusurla** (spot-urine önce/sonra) | konumsal arg |
| `karar-denetim` | ✓ | ✓ 2 biçim | ✓ **gerçek kusurla** (spot-urine, 3 satır) | konumsal arg |
| `kapi-kapsam-denetim` | ✓ | ✓ 2 biçim | ✓ **gerçek kusurla** (spot-urine uOsmCalc) | konumsal arg |
| `yuvarlama-denetim` | ✓ | ✓ 2 biçim | ✓ **gerçek kusurla** (sedasyon-infuzyon:224) | konumsal arg |
| `eksik-alan-denetim` | ✓ | ✓ 2 biçim | ✓ **gerçek kusurla** (status-epileptikus tavanMg) | konumsal arg |
| `yorum-korlugu-denetim` | — | — | ✓ **gerçek kusurla** (olu-denetim düzeltmeden önce düşüyordu) | 13 denetimi sürer |
| `arayuz-denetim` | 5 sınıf | ✓ sayıyla | 129 satır | `--kok` |

**`esik-etiket-denetim`in tarihsel vakası YOK ve olamaz:** doğduğu kusur
(`{ esik: 2, etiket: "INR < 4" }`) geliştirme sırasında, aracın İLK
commit'inden önce düzeltildi. Depoda o hâli hiç bulunmuyor — doğrulandı.
Tek dayanağı tohumlu kontrol; tohum kusurun birebir şeklini taşıyor.

**Altı denetimin altısında da pozitif kontrol var artık.** Eklerken ikisi
ilk çalıştırmada düştü ve ikisi de GERÇEK kusur gösterdi — ölçütte değil,
kontrolün kendisinde:

- **Tohumdaki yorum, ölçütün aradığı izi taşıyordu.** `arayuz-denetim`in
  mojibake ölçütünü anlatan yorum satırı `Ã/Ä/Å` karakterlerini birebir
  içeriyordu ve denetim yorumları da bilerek tarıyor. Ölçütü anlatan metin,
  ölçütün kendisini tetikliyordu.
- **Beklenen sayı ELLE yazılmıştı.** Kusurlu bölümün ürettiği bulgu sayısı
  "3" varsayıldı, gerçek sayı 4'tü ve pozitif kontrol kendi aritmetiği
  yüzünden düştü. Sayı artık sınıf listesinden türetiliyor; yeni sınıf
  eklenince kendiliğinden güncelleniyor.

İkisi de "pozitif kontrol işe yarıyor mu" sorusunun cevabı: ilk
çalıştırmasında iki kusur buldu.

**Pozitif kontrol, negatiften daha az açık ama aynı ölçüde gerekli.** Bu
oturumda ölçüt iki kez FAZLA GENİŞ çıktı (renk çiftinde satır düzeyi
eşleştirme 8 sahte bulgu, eşik-etikette geniş ölçüt 279 aday). Negatif
kontrol ikisini de görmez; yalnızca pozitif kontrol görür.

**Kapı ÖLÜ KOD yüzünden düşebilir.** Genişletilen renk çifti denetimi
`AdBanner`da gerçek bir kusurlu çift buldu (3.19) ve `--kapi` düştü. O dosya
sıfır içe aktaranı olan ölü kod, yani kullanıcı görmüyor. Çift yine de
düzeltildi — kapının anlamlı kalması için, kullanıcıya ulaşan bir düzeltme
olarak DEĞİL. Ayrımı raporda koru.

### `arayuz-denetim` SINANAMIYORDU — kör olduğu için değil, ölçülemediği için

Denetimlerin gerçek geçmiş kusurlarla sınanması sırasında bu betik direndi:
`--kok` yokmuş, kökleri yalnızca `__dirname/..` üzerinden çözüyormuş. Yani
başka bir ağaca yönlendirilemiyor; git'ten alınan düzeltme öncesi sürümlerle
sınamak İMKÂNSIZDI.

Daha kötüsü, sınadığımı sandığım çalıştırma sessizce **gerçek depoyu**
tarıyordu: geçici dizine altı dosya konup çalıştırıldığında rapor "529 tsx"
diyordu. Sayıyı okumasam "tarihsel kontrol geçti" diye yazacaktım.

**Kör bir denetimi kör olduğu için değil, SINANAMADIĞI için fark edememek
daha kötü.** `--kok` eklendi; artık öteki denetimler gibi yönlendirilebiliyor.

Tarihsel kontrol sonra kesin geçti: `5bd197f~1` sürümlerinde **129 bozuk
satır** buluyor — belgede kayıtlı sayıyla birebir aynı.

### Aynı betikte iki kusur daha: tohum `app/` altına yazıyordu

- **Tohum `app/components/` altına yazılıyordu.** Belgede yazılı ve bir turu
  bütünüyle harcayan tuzak: çalışan `next dev` dosyayı derlemeye alıyor,
  silinince SİTENİN TAMAMI 500 veriyor. Öteki üç denetim `os.tmpdir()`e
  taşınmıştı; bu unutulmuş. Taşındı, `app/` altına hiçbir şey yazılmıyor.
- **`bozuk-kodlama` sınıfının negatif kontrolü YOKTU.** Tohum dört sınıfı
  sınıyordu; en çok bulgu üreten sınıf (6 dosyada 129 satır) listede değildi.
  Eklendi — beş sınıfın beşi de yakalanıyor.

**Denetim yazarken sorulacak üçüncü soru:** "kusur buluyor mu" ve "yanlış
pozitif üretiyor mu" yetmiyor; **"başka bir ağaca yönlendirilebiliyor mu"**
da sorulmalı. Yönlendirilemeyen bir denetim tarihsel olarak sınanamaz, yani
körleştiğinde kimse fark etmez.

### Düzeltilen denetimin üçüncü bulgusu: veriyi SİLEN kipin etiketi 3.67'ydi

Geçen turda ulaşılabilir ama ölçülmemiş bırakılan üç aday ölçüldü.

**`StudyBackup` "Üzerine yaz" — 3.67, gerçek kusur.** Beyaz yazı rose-500
üstünde. Bu, yedekten yüklemede **veriyi silen** kipin etiketi; okunaklı
olmaması diğerlerinden daha çok önemli. rose-700'e alındı → **6.29**
(yerinde ölçüldü).

Dalı çizdirmek iki basamak istedi ve ikisi de belgede zaten yazılı:

- **Dosya girdisi ZATEN DOM'da**, `sr-only` ve etikete sarılı. "Yedekten
  yükle"ye tıklamaya gerek yok; tıklamak durumu bozup girdiyi kaybettirdi.
- **Tohum GERÇEK şemayla kurulmalı.** İlk denemede `{v, ts, marks…}` verildi
  ve `parseBackup` reddetti; kuru prova hiç çizilmedi. Doğru şema
  `{app:"medisea", v, at, marks, notes, review, index, log, kartlar}`.

Ölçüm bitince **"Vazgeç"** ile çıkıldı; `medisea:*` sayımı 0 — depoya hiçbir
şey yazılmadı.

**`NotePanel` silgi düğmesi — aynı çift, YERİNDE ölçülemedi.** Kalem kipinin
arkasında ve o kipe geçilemedi. Düzeltme, aynı çiftin `StudyBackup`ta yerinde
doğrulanmış değerine dayanıyor (3.67 → 6.29). Raporda böyle yazıyor.

**Kalan üç aday SONRADAN karara bağlandı — sınıf kapalı.** `AdBanner`,
`SimulatorEngine`, `TopicSidebar` ulaşılmaz. Dikkat: `SimulatorEngine`
*içe aktarılmış* görünüyor (3 sayfa), ama üçü de alt çizgili klasörde
(`_endokrinoloji`, `_gastroenteroloji`, `_nefroloji`) ve rotaya alınmıyor —
ölçüt "içe aktarılmış mı" DEĞİL, "rotadan ulaşılabiliyor mu".

Premium `liderlik` satırı (`text-amber-500` üzerine `bg-amber-500/10`)
**ÖLÇÜLDÜ: 7.14, yani yanlış pozitif.** Denetimin `-50` açık zemin varsayımı
orada geçmiyor; yüzey koyu ve gerçek bileşke zemin `rgb(38,37,39)`. Aynı
sayfaya konan, zemine uyarlanmış tohum 1.72 ile yakalandı — yani "temiz"
sonucu kör bir ölçütten gelmiyor. Verdiktler denetimin başına yazıldı.

### `renk-cifti-denetim` TAMAMEN KÖRDÜ — bu oturumdaki ~71 kusurun hiçbirini görmemişti

Denetimlerin tohumlu negatif kontrolü geçmesi, gerçek kusuru yakaladıkları
anlamına GELMİYOR. Ölçüldü: `renk-cifti-denetim` bu oturumda düzeltilen
kontrast kusurlarının **hiçbirini** hiç yakalamamıştı.

Tarihsel kontrol şöyle yapıldı: `b02c978~1`den altı araç alındı, beşinde
kara listedeki kusurlu çift (`bg-amber-600 text-white` gibi) gözle
görülüyordu — denetim **"0 eşleşme"** dedi.

**Sebep: aynı satırda `className=` şartı.** Gerçek kodda kusurlu çift
`className` ile aynı satırda DEĞİL:

```
badge: "bg-amber-600 text-white"     // palet nesnesi
? 'bg-emerald-600 text-white'         // üçlü işleç dalı
className={`...                       // çok satırlı şablon
  bg-slate-400 text-white`}
```

`saydamlik-denetim`de iki tur önce kapatılan körlüğün BİREBİR aynısı. Şart
kaldırıldı; artık sinyal çiftin kendisi.

**Ama satır düzeyi eşleştirme de fazla kaba çıktı.** Bir satır birden çok
BAĞIMSIZ sınıf dizesi taşıyabiliyor:

```
badge: "bg-blue-900 text-white",  ...  dot: "bg-blue-400"
```

Denetim `dot`un zeminini `badge`in yazısıyla eşleştirip `blue-400 = 2.54`
diye sahte bulgu üretti — oysa nokta hiç metin taşımıyor. **Sekiz sahte
bulgunun kaynağı buydu.** Eşleştirme AYNI DİZE düzeyine indirildi; Tailwind
sınıfları zaten orada gruplanıyor.

**Tohumun kendisi de yanlıştı.** Dize düzeyine geçince negatif kontrol düştü:
eski tohum zemini ve yazıyı AYRI ögelere koyuyordu (ebeveyn/çocuk), oysa
denetimin belgelenmiş kapsamı "aynı ögede". Satır düzeyi eşleştirme onu
kabaca kabul ediyordu. Kusur denetimde değil TOHUMDAYDI — tohum artık üç
gerçek biçimi (palet nesnesi · üçlü işleç · className) taşıyor.

Doğrulama: tarihsel kontrol **10 gerçek kusur** yakalıyor, negatif kontrol
geçiyor, güncel depoda 8 aday kaldı.

### Denetim düzeltildiği anda iki gerçek kusur buldu

| yer | ölçülen | çare |
|---|---|---|
| `fibromiyalji` seçili "Orta" | **2.80** (beyaz / orange-500) | orange-700 → 5.18 |
| `ToolShare` "kopyalandı" | 3.77 (beyaz / emerald-600) | emerald-700 |

`fibromiyalji` tarayıcıda dört seçili dalın dördü de çizdirilerek ölçüldü.
`ToolShare`in "kopyalandı" dalı **yerinde ölçülemedi** — pano yazma bu
ortamda çalışmadığı için dal hiç çizilmiyor. Düzeltme, çiftin daha önce
tarayıcıda ölçülmüş değerine (3.77) dayanıyor; raporda öyle yazıyor.

**Kalan 6 adayın hepsi karara bağlandı.** Üçü ulaşılmaz (`AdBanner`,
`SimulatorEngine`, `TopicSidebar`), üçü ölçüldü: `NotePanel` ve `StudyBackup`
düzeltildi (3.67 → 6.29), premium `liderlik` **7.14 ile yanlış pozitif**.
Verdiktler `renk-cifti-denetim.cjs` başında duruyor — yeniden kovalanmasın.

### Türkçe büyük harf katlama, ölçüm tarafında da vurdu

`/paylaş/i` deseni "ARACI PAYLAŞ" düğmesini BULAMADI: JS'in `i` bayrağı
`Ş`↔`ş` katlamasını ASCII dışı harflerde yapmıyor. Sonra `toLocaleLowerCase("tr")`
kullanıldı ama arama dizesi `paylas` yazılmıştı — `ş` `s`'ye çevrilmediği için
yine tutmadı. İki denemede de "düğme yok" sanıldı; düğme oradaydı.

Ölçümde Türkçe metin ararken ya `textContent.includes("PAYLAŞ")` gibi birebir
eşleştir, ya iki tarafı da aynı kurala indir — yarım indirgeme en kötüsü.

### Ölü denetim taraması BETİĞE alındı — ölçüt kaydedilmediği için yeniden yazıldı ve BOZUK çıktı

"Ekranda duran ama hiçbir şeyi değiştirmeyen kontrol" ölçütü daha önce bir kez
sürülmüş (124 araç · 387 durum) ama **betiğe alınmamıştı**. Bu tur yeniden
yazmak gerekti ve ilk hâli sessizce bozuktu: `setX(...)` çağrıları elenmiyordu,
`onClick={() => setOlu(!olu)}` değişkenin kendisini içerdiği için her durum
"kullanılıyor" görünüyordu ve tarama **hiçbir şey bulmuyordu** — üstelik
"0 aday" temiz gibi okunuyordu.

**Tarihsel kontrol düştüğünde önce ÖLÇÜTÜ sına, commit seçimini değil.**
İlk tepkim "yanlış commit seçtim" oldu; sentetik tohum ölçütün bozuk olduğunu
gösterdi. Düzeltilince `nrs-2002`nin düzeltme öncesi iki sürümü de 1 aday
verdi — o araçta aşama 1 soruları skora hiç girmiyordu.

Betiğin İKİ yönlü kontrolü var ve ikisi de şart: tohumdaki `olu` yakalanmalı,
`canli` (skora giren durum) YAKALANMAMALI. Ölçüt bir kez ters yönde bozulduğu
için tek yönlü kontrol yetmiyor.

**Kapsam araçların dışına genişletildi** — eski sürüm yalnızca `app/tools`
tarıyordu. Şimdi `app` + `components`: **400 tsx · 651 durum · 4 aday.**

Dört adayın dördü de karara bağlandı, **gerçek kusur yok**:

| aday | verdikt |
|---|---|
| `unit-converter` `ters` | MEŞRU — çevirme çift yönlü, takas hem `order`ı hem gerçek konumu değiştiriyor |
| `ReadingHint` `cikis` | MEŞRU — "Anladım" sonrası öge DOM'dan gerçekten çıkıyor |
| `LangSwitch` `lang` | ölü kod — sıfır içe aktaran |
| `TableOfContents` `activeId` | ölü kod — sıfır içe aktaran |

`ReadingHint` özellikle ölçüldü çünkü `cikis` yalnızca `opacity-0` sınıfı
veriyor: eğer bileşen sökülmeseydi "görünmez ama odaklanılabilir" tuzağı
olurdu. Ölçüm `contains: false` dedi — sökülüyor.

**Ölçüm izini temizle: "Anladım" tıklaması `medisea:hint:reading:v1` yazıyor.**
Bu, kullanıcının dev origin'inde ipucunun KALICI olarak kapanması demek.
Ölçümden sonra silindi; `medisea:*` sayımı 0.

### Saydamlık raporundaki 8 "genel" adayın 8'i de karara bağlandı — kusur yok

Genişletilmiş denetim araç tarafında 0, genel tarafta 8 aday bırakmıştı.
Sekizi tek tek ölçüldü ve **hiçbiri kusur değil**. Verdiktler betiğin başına
yazıldı; liste yeniden kovalanmasın diye:

| aday | verdikt |
|---|---|
| `QuestionView.tsx` | ölü kod — sıfır içe aktaran |
| `BranchTemplate.tsx` | ölü kod — yalnızca `_` klasörler çağırıyor |
| `giris` · `kayit` · `AlanClient` | `disabled={yukleniyor}` — devre dışı, muaf |
| `tekrar/page.tsx` "boşluk" | ölçüldü: **4.75**, eşiği geçiyor |
| `ReadingTools.tsx` | METİN TAŞIMIYOR — 10×10 renk noktası |
| `InlineTopicEditor.tsx` | yalnızca yöneticiye render ediliyor |

**Kaynak taraması bunların hiçbirini kendi başına eleyemez.** Ulaşılabilirlik,
devre dışılık, gerçek kontrast ve "bu ögede metin var mı" sorularının cevabı
kaynakta DEĞİL. Denetimin kapı değil rapor olmasının sebebi tam olarak bu.

**Ulaşılabilirliği ÖNCE ölç.** Sekiz adayın ikisi ölü koddu; geçen tur aynı
tuzağa düşüp ölü koda düzeltme yapmıştım. Bu tur ilk adım ulaşılabilirlik
oldu ve iş listesini dörtte bir azalttı.

### Gezinme JS bağlamını SIFIRLAR — temizlik durumu `window`'da tutulamaz

Ölçüm için `localStorage`a tohum konurken önceki durum `window.__yedek`e
kaydedildi; sonra `/tekrar`a gezinildi ve temizlik çalıştırıldı — **hiçbir şey
silinmedi**, çünkü gezinme yeni bir JS bağlamı yaratıyor ve `window` üzerindeki
her şey kayboluyor.

Temizlik ya tek bir bağlamda yapılmalı ya da durum `localStorage`ın kendisinden
okunmalı (anahtar önekiyle). Bu turda ikinci yol kullanıldı.

Bu arada iki tur önceki flashcard ölçümünden kalan bir anahtar da bulundu
(`medisea:kartlar:v1:fc-endo-akromegali-001`) — yani o turda temizlik
eksik kalmış. **Ölçüm bittiğinde `medisea:*` anahtarlarını SAY, sıfır olduğunu
gör.**

### `saydamlik-denetim` genişletildi: satır içi stil ve çok satırlı className

Denetimin üç körlüğü vardı ve üçü de ölçülmüştü ama kapatılmamıştı. Kapatıldı:

| biçim | önce | şimdi |
|---|---|---|
| tek satırlık `className` | görüyordu | görüyor |
| ÇOK SATIRLI `className` | **görmüyordu** | 8 satırlık geri pencere |
| satır içi `style={{ opacity: 0.45 }}` | **görmüyordu** | görüyor |
| satır içi ÜÇLÜ İŞLEÇ `opacity: a ? 1 : 0.45` | **görmüyordu** | görüyor |

**En güçlü kanıt tarihsel kontrol oldu.** Düzeltme ÖNCESİ dört dosya git'ten
alınıp denetime sürüldü: `QuizEngine`, `VakaEngine`, `YdusCockpit`,
`KategorilerClient`. İlk denemede **üçü yakalandı, biri kaçtı** — ve kaçan
tam olarak üçlü işleçli olandı (`opacity: konu.hazir ? 1 : 0.45`), yani
ölçüt kusurun gerçek biçimini bilmiyordu. Genişletildi, dördü de yakalandı.

**Negatif kontrol tohumu dört biçimi birden taşıyor** ve biri eksik kalırsa
kontrol düşüyor — nitekim bir denemede tohum satırı eklenmemiş ama kontrolü
eklenmişti; kontrol doğru davranıp düştü.

**POZİTİF KONTROL de eklendi ve gerekliydi:** `opacity: 1`, `opacity: 0.95`
ve `disabled:opacity-50` taşıyan temiz bir tohum SIFIR bulgu vermeli. Ölçüt
fazla genişse bunu yakalar.

**Yorum satırları ayrı bir sorun çıkardı.** Bu depoda yorumlar saydamlık
kusurlarını ANLATIYOR ve gövde satırları düz metinle başlıyor
(`opacity-60 onu 2.15-3.77 kontrasta düşürüyordu.`). Satır başındaki `//`
ve `*` işaretine bakmak yetmedi; blok yorum durumu satır satır izleniyor.
Ölçüm kendi belgesini kusur sayarsa rapor okunmaz hâle gelir.

### Genişletilen denetim hemen işini yaptı: premium konu sayfası

Yeni ölçüt, hiç ölçülmemiş bir yüzeyde aday üretti: premium konu sayfasındaki
**Modüller** listesi (`opacity: aktif ? 1 : 0.55`). Ölçüldü — 175 öge,
**9 kusur**: modül adları 3.44, "Yakında" rozetleri 2.24.

Satırın bilgi taşıyan iki parçası da okunmaz oluyordu. "Etkin değil" işareti
zaten üç kanalda var (soluk zemin, "Yakında" rozeti, `pointerEvents: none`).
Saydamlık kaldırıldı → 9 → 0.

**Kapıyı ölçüm için geçici olarak açmak gerekti** (konu sayfası `AccessGate`
arkasında ve serbest erişimli konu yok). Kapı açıldı, ölçüldü, GERİ KONDU —
ve geri konduğu ayrıca doğrulandı: sayfa yeniden "Erişim Kısıtlı" basıyor.
Kendi temizliğini de negatif kontrolle sına.

**Devre dışı denetim eşikten muaf, ikinci kez:** aynı sayfada "Sor" düğmesi
boş girdide 2.05 çıkıyor; `disabled` olduğu ölçüldü. Kokpitteki "Kararı
Onayla" ile aynı durum. Tarayıcı ölçümüne `el.closest('button').disabled`
kontrolü koymak bu sahte bulguyu eliyor.

### Kokpit ve branş sayfası: aynı sınıf, üçüncü ve dördüncü kez

Premium ölçümünün ikinci turunda kalan iki motor (FlashcardPlayer, YdusCockpit)
ve branş sayfaları sürüldü. Flashcard iki yüzünde de temiz. Ötekiler değil:

| yer | ölçülen | sebep |
|---|---|---|
| kokpit — çeldirici şık metni | **1.48** | `text-slate-600 opacity-50 grayscale` |
| kokpit — seçilen yanlış şıkkın harfi | 3.34 | kapsayıcıda `opacity-70` |
| kokpit — "Sonraki aşamaya geçebilirsiniz" | 2.36 | `text-slate-600` koyu zeminde |
| branş — hazır olmayan konu adı | 1.89 | satır içi `opacity: 0.45` |
| branş — YAKINDA rozeti | 1.85 | aynı |

**Taban renk de yetersizdi, yalnızca saydamlık değil.** Koyu zeminde
(`rgb(9,15,33)`) ölçüldü: `text-slate-600` saydamlık OLMADAN da **2.52**;
`text-slate-400` 7.46. Saydamlığı kaldırmak tek başına yetmezdi.

**"CEVAPLANMIŞ DURUM" SANDIĞIM ÖLÇÜM YANLIŞ DURUMDAYDI.** İlk turda kokpit
"cevaplı: 0 kusur" çıktı; onay tıklaması işlememişti. Sıralama doğrulanınca
(şık seç → Onayla → `sonucGorunuyor` kontrol et) 7 kusur göründü. **Bir durumu
ölçtüğünü sanmak için o durumun GERÇEKTEN oluştuğunu ayrıca doğrula.**

**Devre dışı denetim eşikten muaf.** Kokpitin boş hâlinde "Kararı Onayla"
1.71 çıkıyor; ölçüldü — `disabled: true`, opaklık 0.3. Şık seçilince
`disabled: false` ve opaklık 1. Kusur değil. (Belgede yazılı donmuş-geçiş
şüphesi de böylece kapandı: geçişler önceden kapatılınca değer doğru okunuyor.)

### İKİ YÖNTEM ÇELİŞİRSE ATA SAYDAMLIĞINA BAK

Kokpitteki "A" rozeti için tarama 3.34, doğrudan ölçüm 5.17 dedi. Doğrudan
ölçüm ata zincirindeki `opacity`yi hesaba katmıyordu; buton `opacity: 0.7`
taşıyordu. **Tarama haklıydı.** Bir ögenin kendi rengi ve zemini doğru
görünüyorsa ama tarama düşük diyorsa, önce etkin alfayı ölç.

### Ölü koda düzeltme yaptım — BAĞLI olduğunu doğrulamadan

Branş sayfasındaki kusuru `BranchTemplate.tsx`te düzelttim. O bileşen yalnızca
`_endokrinoloji`, `_hematoloji` gibi **alt çizgili klasörlerden** çağrılıyor,
yani rotaya alınmıyor ve kullanıcıya ulaşmıyor. Gerçek bileşen
`[branch]/KategorilerClient.tsx` ve satır içi stil kullanıyor.

Belgede zaten yazılı olan kural ("bir bileşeni düzeltmeden önce BAĞLI
olduğunu doğrula") bu turda kuralın yazarı tarafından çiğnendi. Ayırt eden
şey ölçüm oldu: düzeltmeden sonra sayfa **hâlâ 1.89** gösteriyordu.
Düzeltmeyi doğrulamadan commit etseydim ölü kod değişmiş, kusur durmuş olurdu.

### `saydamlik-denetim` çok satırlı `className`i göremiyor

Ölçüt satır bazlı ve aynı satırda `className` arıyor. Çok satırlı şablon
dizelerinde `className={` ile `opacity-40` farklı satırlarda kalıyor ve bulgu
düşüyor. Kapsam ölçüldü: bu şekilde görünmeyen **3 satır** var — biri yorum
metni (yanlış pozitif), ikisi gerçek kusurdu (`BranchTemplate`, `YdusCockpit`).

Denetimin göremediği üçüncü biçim bu; öteki ikisi kapsayıcıya konan saydamlık
(kapatıldı) ve **satır içi stil** (kapatılamaz — className taramıyor).

### Premium motorlar ölçüldü: cevaptan SONRA çeldiriciler 2.67–3.05'e düşüyordu

Premium yüzeylerin kontrastı bir dönem ölçülmüştü ama saydamlığı göremeyen
ölçütle. Olgun ölçüt (alfa bindirmesi, ata opacity çarpımı, degrade, mutlak
konum, geçişler kapalı, sayfa başına negatif kontrol) ilk kez sürüldü.

**Kapı içerik düzeyinde, rota düzeyinde DEĞİL.** `/tr/premium/ydus/*` sayfaları
200 dönüyor ve pano, liderlik, profil tam render ediliyor; motorlar ise
`AccessGate` ile korunuyor ve doğru parametreyle bile **"Erişim Kısıtlı"**
basıyor. Parametresiz istekte üçü de hata kartı gösteriyor — yani motor değil
hata kartı ölçülmüş oluyor. Geçici bir rota motorları gerçek içerikle
render etti (bitince silindi, kalıntı 0).

Bulgu — hepsi CEVAP VERİLDİKTEN SONRA görünüyor:

| yüzey | öge | ölçülen |
|---|---|---|
| QuizEngine | şık metni | **3.05** |
| QuizEngine | harf rozeti | 2.02 |
| VakaEngine | şık metni | 2.67 |
| VakaEngine | harf rozeti | 1.86 |

Sebep: dokunulmayan şıklara **satır içi** `opacity: 0.5` / `0.45` konuyordu.
Renkler zaten iyiydi (metin 14.24) — kusuru kapsayıcı saydamlığı üretiyordu.

**`saydamlik-denetim.cjs` bunu GÖREMEZ**: className değil satır içi stil.
Satır içi stil kullanan yüzeylerde renk ve saydamlık elle ölçülmeli.

Karar tarafı da önemli: bu bir ÖĞRENME yüzeyi ve cevaptan sonra çeldiricileri
okumak işin ta kendisi. Ayrım zaten başka kanallarda var (doğru şık yeşil,
seçilen yanlış kırmızı, ikisinde de ✓/✗ rozeti); saydamlık ayırt ediciliğe
hiçbir şey eklemiyordu. Kaldırıldıktan sonra ölçüldü: **3 ayrı zemin/çerçeve
çifti + 2 rozet duruyor**, yani tasarım düzleşmedi.

### "Gizle, altına bak" kuralının EKSİK yarısı: ögenin KENDİ zemini

Mutlak konumlu ögede gerçek zemini bulmak için ögeyi gizleyip altına bakmak
doğru — ama **ögenin kendi opak zemini varsa altına BAKILMAZ.** Ölçüldü:
profil sayfasındaki `LEVEL 1` rozeti `bg-yellow-500` taşıyor ve koyu bir
kartın üstünde duruyor; altına bakan ölçüm rozetin kendi sarısını atlayıp
koyu kartı zemin sandı ve **9.31 olan kontrastı 1.00** gösterdi.

**1.00 değeri neredeyse her zaman ölçüm artefaktıdır** — aynı rengin kendisiyle
karşılaştırılması. Gördüğünde ikinci yöntemle sına.

### Negatif kontrol tohumu ZEMİNE UYARLANMALI

Sabit renkli bir tohum (`#a8c4e0`) açık yüzeyde kusur sayılıyor ama KOYU
yüzeyde geçiyor. Premium taramasında bu oldu: yedi sayfanın yedisinde de
negatif kontrol ateşlemedi (`0/7`) ve "0 kusur" sonucu ölçütün kör olmasından
mı geldiği anlaşılamadı.

Çare: tohumu gerçek bir metin ögesinin yanına koy ve rengini **o ögenin
zeminine yakın** seç (`v + (v < 128 ? +26 : -26)`). Uyarlandıktan sonra 7/7.

### Sürücü ONAY KUTUSUNU tanımıyordu — 24 araç ölçüm dışı kalmıştı

Sonuç durumu taraması ilk turda 128 aracın 104'ünü sürebildi; 24'ü "sürülemedi"
diye raporlandı. Sebep ölçüldü: o araçlar `sr-only` ile gizlenmiş
**onay kutusu** kullanıyor (Wells, PERC, PADUA, HAS-BLED, CHA2DS2-VASc,
qSOFA, Ranson, Rockall…) ve sürücü yalnızca metin alanı, `<select>` ve
`aria-pressed` düğmesi tanıyordu.

Sürücüye onay kutusu, radyo ve **kaydırıcı** (`input[type=range]`) eklendi.
Sonuç: 24'ün 22'si sürüldü ve **12 yeni kusur** çıktı — hepsi yalnızca
işaretlenmiş durumda görünen renkler:

| araç | ölçülen | sebep |
|---|---|---|
| `perc` | 2.45 (9 yazı) | `text-rose-400` üzerine `bg-rose-50` |
| `perc` | 3.67 | `text-rose-500` üzerine beyaz panel |
| `wells-dvt` | 3.67 | `text-rose-500` üzerine beyaz |
| `rockall` | 4.27 | `text-rose-200` üzerine koyu bileşke |

**Sürücünün "son seçeneği tıkla" kestirmesi bir aracı ÇIKMAZA sokabiliyor.**
`gout-acr` bir giriş ölçütüyle kapılı: sürücü "Hayır"a bastığı için hiçbir
şey açılmıyordu ve araç "sürülemedi" görünüyordu. "Evet" tıklanınca gövde
17745 → 19048 karaktere çıktı. Yedek kural: sürüş metni HİÇ değiştirmediyse
ilk seçeneği dene.

**Sabit sürüş değeri mevcut değere eşit olabiliyor.** `hba1c-eag`'de sürücü
`7` yazıyordu ve alanda zaten o vardı; metin değişmediği için "sürülemedi"
sanıldı. `8.5` ile eAG 197 mg/dL çıktı. İkinci yedek: değer değiştirmeyi
farklı bir sayıyla tekrar dene.

İki yedekle birlikte **128 aracın 128'i sürülebiliyor** ve tarama 0 kusur,
negatif kontrol 128/128 veriyor.

**Ayırt edici METİN UZUNLUĞU değil METNİN KENDİSİ olmalı.** İlk sürümde
"araç cevap verdi mi" ölçütü `textContent.length` karşılaştırıyordu; iki
farklı sonuç aynı uzunlukta olabiliyor ve araç sürülmemiş sayılıyordu.

### "127 araç temiz" YALNIZCA BOŞ FORM İÇİNDİ — sonuç durumunda 71 kusur vardı

Kütle taraması her aracı **varsayılan durumda** ölçüyordu. Ama araçların
tamamı sonucu ancak girdi verilince çiziyor; yani kullanıcının asıl okuduğu
panel — skor bandı, seçili şık, sonuç çipi — hiç ölçülmemişti. "0 kusur"
raporu doğruydu ama kapsamı sanıldığından çok dardı.

Aracı SÜREN bir tarama yazıldı: her metin alanına makul bir sayı, her
`<select>`e son seçenek, her `aria-pressed` grubunda bir tıklama. Sonuç:

  128 araç · negatif kontrol 128/128 · **71 kusur, 16 araçta**

Hepsi seçili/sonuç durumunda ortaya çıkan çiftlerdi. Ölçülen değerler
(uygulamanın kendi CSS'i altında, sınıf adından hesaplanmadı):

| çift | kontrast |
|---|---|
| `bg-amber-500` + `text-white` | **2.15** |
| `bg-slate-400` + `text-white` | 2.56 |
| `bg-amber-600` + `text-white` | 3.19 |
| `bg-orange-600` + `text-white` | 3.56 |
| `bg-emerald-600` + `text-white` | 3.77 |
| `text-sky-600` / beyaz | 4.10 |

Geçen `-700` karşılıkları: emerald 5.48 · amber 5.02 · sky 5.93 · rose 6.29.

**Sürücünün kendi kapsam sınırı var ve raporda YAZILI:** 128 aracın 104'ü
sürülebildi, 24'ü sürülemedi (farklı denetim yapıları). Onların sonuç
panelleri hâlâ ölçülmemiş durumda — "temiz" DENMİYOR.

**Grupta TEK seçenek tıklamak yetmiyor.** Bir seçim grubunun her şıkkı
farklı bir renk üretiyorsa, tek tıklama yalnızca birini çizer. `ciwa-ar`'da
dört ayrı seçili renk var; sürücü sonuncuyu tıkladığı için `bg-sky-600` hiç
görünmedi. Her şıkkı sırayla deneyen ikinci bir tur iki kusur daha buldu
(`bg-sky-600` çip 4.10, `bg-orange-500` şık 2.80).

**O turda ölçüm de bir kez yanıldı:** seçenek düğmesi olmayan bir araçta
(`ktv`) döngü hiç çalışmadı ve `olculen: 0` ile "temiz" göründü. Tur sayısı
`Math.max(1, …)` yapılınca gerçekten ölçüldü. Yine aynı kural: **0 kusur ile
0 öge ekranda aynı görünür.**

**Var olmayan bir Tailwind sınıfı ÖNCEDEN ölçülemez.** `bg-orange-700`
denendiğinde zemin `rgb(0,0,0)` ve kontrast 21 çıktı — Tailwind kullanılmayan
sınıfı üretmiyor. Sınıfı kaynağa yazıp yeniden derledikten sonra ölçmek
gerekiyor; ölçüm sırası "uygula → derle → ölç" olmalı.

**Aday üretmek ile karar vermek yine ayrıldı:** `text-amber-500` kaynakta 245
kez geçiyor ama tarama yalnızca BİRİNDE kusur buldu — ötekiler koyu zeminde.
Toptan değiştirmek gerileme üretirdi; yalnızca ölçülen nokta düzeltildi.

### Açık site 65 sayfada tarandı — 5 kusur, ikisi ayrı sınıf

Aynı olgun ölçüt açık tarafa sürüldü: ana sayfa, `/topics`, 13 branş,
30 konu örneği, `/uyelik`, `/calisma-alanim`, `/tekrar`, `/giris`,
`/kayit`, `/profile`, `/guidelines`. **65 sayfa · 5440 öge · negatif
kontrol 65/65 · 5 kusur.**

Kusurlar iki ayrı sınıftan geldi ve çareleri de farklı:

**1. Yarı saydam koyu kart, AÇIK sayfada orta griye biniyor.**
`RequirePlan` kartı `bg-slate-800/50` taşıyordu; `/profile` zemini beyaz
olduğu için bileşke `rgb(143,148,157)` çıkıyor ve üstündeki `text-slate-200`
**2.48**'de kalıyordu. Zemini sayfaya bağlı olan bir kart, kontrastı da
sayfaya bağlı yapar. Çare: zemini OPAK yap (`bg-slate-800`) ve yüzeyi
`koyu-yuzey` ile beyan et.

**2. `koyu-yuzey` belgede yazdığı yerde YOKTU.** Belge profilin bu sınıfı
taşıdığını söylüyordu; ölçüldü, sayfada hiç `koyu-yuzey` yoktu ve
`UpgradeCard`'ın koyu degrade şeridinde `text-slate-400` **2.36**'daydı —
genel koyulaştırmanın açık zemin varsaydığı klasik geri tepme. İki bileşen
de artık sınıfı beyan ediyor; ön koşul (ağaçta açık kart yok) tahmin
edilmedi, SAYILDI: ikisinde de sıfır.

**Belgede "şu sayfa şu sınıfı taşıyor" yazması, taşıdığı anlamına gelmez.**
Bileşen taşınmış, yeniden yazılmış ya da hiç eklenmemiş olabilir; sınıfın
varlığını sayfada ölç.

### İçerikteki vurgu renkleri: ölçülen üç ton eşiğin altındaydı

Konu metinlerinde klinik vurgu için renk kullanılıyor ve Tailwind'in `-600`
kademesi her tonda geçmiyor. Uygulamanın kendi CSS'i altında tek tek ölçüldü:

| ton | beyazda | durum |
|---|---|---|
| `text-amber-600` | 3.19 | düşüyor |
| `text-green-600` | 3.30 | düşüyor |
| `text-emerald-600` | 3.77 | düşüyor |
| `text-rose-600` | 4.70 | beyazda GEÇİYOR |
| `text-red-600` | 4.83 | geçiyor |
| `text-blue-600` | 5.17 | geçiyor |

**Rose yine de listede ve sebebi ölçüm kapsamıyla ilgili:** beyaz zeminde
geçiyor ama içeriğin kendi renkli kutusunun içinde **4.41** ölçüldü. Bir
tonu "beyazda geçiyor" diye temiz saymak, içeriğin tonlu kutular kullandığı
bir depoda yetmiyor.

Çare `metin.tsx` ve `kisaltma.ts` ile aynı karar: **içerik dosyasına
dokunulmaz, dönüşüm render tarafında.** Kural `[data-readable]` ile
sınırlı, yani arayüzdeki aynı sınıflar etkilenmiyor.

Doğrulaması üç negatif kontrolle yapıldı: (1) okuma alanı İÇİNDE dört ton
gerçekten değişti, (2) DIŞINDA değişmedi, (3) hedeflenmeyen `red`/`blue`
iki tarafta da birebir aynı kaldı. Koyu kart muafiyeti de sınandı —
`.bg-slate-900` içinde özgün ton geri geliyor.

**`revert-layer` bu depoda KULLANILAMAZ.** Muafiyeti onunla yazmak ilk
akla gelen yol ama Tailwind burada cascade layer kullanmıyor; bildirim
tarayıcı varsayılanına düşer ve yazıyı siyaha çevirir. Özgün değer açıkça
yazılır (dosyadaki slate kuralı da bunu yapıyor).

### 127 aracın tamamı olgun ölçütle tarandı — sınıf kapalı

Kontrast taraması bir dönem kör ölçütlerle yapılmıştı (saydamlık, degrade,
yalnızca yaprak öge). Olgun ölçüt üretim derlemesi üzerinde bütün araçlara
sürüldü: **127 sayfa · 5655 öge · negatif kontrol 127/127.**

Ölçüt: alfa bindirmesi, degrade zemin, ATA ZİNCİRİNDEKİ opacity çarpımı,
boyuta göre eşik (24px / 18.66px kalın için 3.0), geçişler etkileşimden önce
kapatılı, `aria-hidden` / `sr-only` / SVG / yalnızca-emoji elenmiş, her
sayfaya kasten kusurlu bir öge konup yakalandığı görülmüş.

Sonuç 5 bulgu: 1'i yanlış pozitif, 4'ü gerçek ve düzeltildi.

**Kütle taraması ÜRETİM DERLEMESİNDE yapılır.** `next dev` her rotayı ilk
ziyarette derliyor; iframe taraması zaman aşımına uğruyor. `NEXT_DIST_DIR=
.next-verify npm run build` + `next start -p 3100` ile çalışan dev sunucusuna
dokunmadan taranabiliyor — ve ölçülen şey dağıtılacak çıktının kendisi.

### Mutlak konumlu ögenin zemini: ögeyi GİZLE, altına bak

Belge bir dönem "`position: absolute` ögeleri ATLA, kusur uydururlar"
diyordu. Atlamak kusuru GİZLER; ölçülebilir bir yolu var:

```js
const e0 = el.style.visibility; el.style.visibility = 'hidden';
const alt = d.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
el.style.visibility = e0;            // altındaki gerçek boyalı öge
```

Birim çeviricide sürüldü: ata zinciri **1.42** diyor (belgedeki kayıtlı
değer), gerçek zemin bir KARDEŞ `<input class="bg-blue-900">` ve doğru
kontrast **7.29**. Aynı sayı iki ayrı oturumda çıktığı için yanlış pozitifin
kaynağı da kesinleşti.

### `location.pathname` gövde DOLMADAN doğru değeri verir

İframe taramasında "doğru sayfadayım" kontrolü olarak yol karşılaştırmak
yetmiyor: gezinme commit olur olmaz `pathname` güncelleniyor, gövde henüz
boş olabiliyor. Ölçüt İÇERİĞE bağlanmalı — `<h1>` var mı, metni bekleneni
tutuyor mu.

**Ama aynı sayının çıkması tek başına kusur kanıtı DEĞİL.** Üç farklı araç
sayfası da "34 öge" dedi ve bu ölçüm hatası sanıldı; sıkı yöntemle (1100 ms
+ `<h1>` kontrolü) yeniden ölçülünce **on iki sayfanın on ikisinde de sayı
birebir aynı çıktı** — yani ilk tarama doğruydu ve 34'ler gerçek bir
rastlantıydı (süzgeçler her sayfadan farklı sayıda öge eliyor, sonuç aynı
sayıya iniyor). Şüpheyi ikinci yöntemle çözmenin karşılığı bu: bazen ölçüm
haklı çıkar.

### Saydamlık KAPSAYICIYA konunca kaynak taraması onu göremez

`saydamlik-denetim` bir dönem aynı satırda `text-*` sınıfı arıyordu ve
"metin ögesinde saydamlık yok" diyordu. Yanlıştı: saydamlık kapsayıcıya
konduğunda renk ATADAN devralınıyor, o satırda `text-*` bulunmuyor ve bulgu
sessizce düşüyordu.

Körlük, denetimin temiz dediği bir dosyada gözle `opacity-60` görülünce
ortaya çıktı. **Bir denetim "temiz" diyorsa, temiz olduğunu iddia ettiği
dosyada ölçütünü elle bir kez sına.**

Bedeli ölçüldü (tarayıcıda, geçişler kapatılarak):

| yer | kontrast | taban |
|---|---|---|
| 34 araçta boş durum kartı | **1.93** | 7.58 |
| `/tools` kategori sayaçları (18) | 2.82 | 7.24 |
| `/tools` ve `glim` klinik uyarısı | 3.40 | 9.90 |

En ağırı boş durum kartı, çünkü o kart aracı açan HERKESİN gördüğü ilk ekran
ve içindeki tek yazı "ne yapmalısın"ı anlatıyor. Sayfadaki en okunması
gereken cümle, en okunmaz şeydi.

**Çare saydamlığı azaltmak değil, işareti BAŞKA KANALA taşımak.** Kesikli
çerçeve, çip zemini, yazı ağırlığı — hepsi "ikincil" der ve kontrasta hiç
dokunmaz. Renk alfası (`text-white/80`) ölçülebilir olduğu için kabul,
ama gereksizse hiç kullanma.

Ölçüt artık statik `opacity-40..80`u her yerde aday sayıyor; koşullu olanlar
(`className={pasif ? "opacity-50" : ""}`) durum kaynaklı sayılıp eleniyor —
beşi tek tek doğrulandı, hepsi gerçekten `disabled` alanları soluklaştırıyor.

**Eleme ölçütü ilk denemede tutmadı:** `${…}` arandı, oysa bunlar template
literal DEĞİL JSX ifadesi. Hiçbiri elenmedi ve bir an "koşullular da kusur"
sanıldı. Ters üçlü (`? "" : "opacity-60"`) ayrıca kaçıyordu.

**"Uygulanmıyor" durumunu soluklaştırmadan önce NEYİN soluklaştığına bak.**
İki yerde soluklaşan şey tam da bilgi taşıyan parçaydı: `nrs-2002`'de "önce
aşama 1'i tamamlayın" cümlesi, `dka-infuzyon`'da insülin DOZU.

### Etiket ile eşik AYRI alanlarda durursa çelişir ve çelişki SESSİZDİR

Sınıflama basamağını "eşiğin altındaysa" biçiminde bir sayı dizisiyle yazmak
kolay ama iki ayrı gerçeklik üretiyor: bir yanda karşılaştırılan SAYI, öte
yanda kullanıcıya gösterilen ETİKET. İkisi ayrışınca hiçbir kapı görmez —
kod geçerli, tipler doğru, derleme temiz.

Ölçüldü (`antikoagulan-geri-dondurme`, gönderilmeden önce):

```
{ esik: 2, uKg: 25, etiket: "INR < 4" }     // eşik 4 olmalıydı
```

INR 3 olan hasta 25 yerine **35 Ü/kg PCC** alıyordu — %40 fazla, yani
gereksiz tromboz riski. Ekran da kendisiyle çelişiyordu: girdisi 3 iken
"INR 4-6" yazıyordu.

**Çare eşiği düzeltmek DEĞİL, eşik dizisini kaldırmak.** Basamak sınırı açık
koşulla yazılınca (`uygun: (i) => i < 4`) çelişecek ikinci bir gerçeklik
kalmıyor. Bu aynı zamanda sınır değerini de düzeltti: INR tam 6 eski
kurguda ">6" bandına düşüyordu.

**Sınır değerlerini ölç: eşiğin altı, tam kendisi, tam üstü.** Kusur ortada
bir değerle (INR 3 ve 5 aynı dozu veriyordu) göründü; yalnızca tipik bir
vaka denenseydi görünmezdi.

`esik-etiket-denetim.cjs` bu şeklin geri gelmesini engelliyor. **Ölçütü
daraltmak zorunda kaldım ve o da ayrı bir ders:** "sınır iddia eden her dize"
ölçütü 816 etiketin 279'unu işaretledi — SVG yol verisi (`M19 9l-7 7-7-7`),
HTML parçası, regex karakter sınıfı, Tailwind şablon dizesi, salt gösterim
amaçlı referans aralıkları. **279 aday gözden geçirilemez; o denetim karar
değil gürültü üretiyordu.** Ölçüt kusurun gerçek şekline (aynı nesnede sayısal
eşik + sınır iddia eden etiket) indirilince taranan alan 4'e düştü.

Negatif kontrolüne **pozitif kontrol de gömülü**: tohumda biri bozuk biri
doğru iki kayıt var; denetim doğru kaydı da işaretlerse ölçüt fazla geniş
demektir ve kontrol düşer.

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

### Düzeltmeler CANLIDA doğrulandı — 23 Ağustos 2026

Bu oturumda sekiz civarı gerçek klinik kusur düzeltildi. Hiç sorulmamış soru
şuydu: **kullanıcıya ulaştı mı?** Dağıtım kırıksa düzeltmelerin hiçbiri
kimseye ulaşmamış olurdu. Üç ayrı commit'ten üç düzeltme canlıda ölçüldü:

| araç | canlıda ölçülen | düzeltme öncesi |
|---|---|---|
| `meld-na` | varsayılan **6** · Cr4·b2·INR1.5 → **28** · kutu sayısı 1 | 1 ve 3, iki onay kutusu |
| `status-epileptikus` | 150 kg → fenitoin **1500 mg**, fosfenitoin **1500 mg FE**, "tavan uygulandı" bildirimli | 3000 / 3000 |
| `spot-urine` | üre boşken osmolal açık **basılmıyor**, uyarı çıkıyor | açık 210, yorum tersine dönüyordu |

`status-epileptikus` bilerek seçildi: en SON kod commit'i oydu, yani canlıysa
öncekiler de canlı. Yine de tek commit'e dayanmamak için iki ayrı düzeltme
daha ölçüldü.

**Sayılar da güncel** — dört araç eklendikten (127 → 131) sonra üç yüzey
birbirini tutuyor:

| yüzey | araç | konu | branş |
|---|---|---|---|
| ana sayfa | 131 | 410 | 13 |
| `/tools` | "131 araç listeleniyor" · 134 bağlantı · 18 `h2` | — | — |
| `/uyelik` | — | 410 | 13 |

"Sayı yazma, saydır" mimarisi araç eklendikten sonra da tutuyor; elle
güncellenen tek bir sayı yok.

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

### Araç kabuğu tutarlılığı: üç parça, 131 araçta ölçüldü

Her araç sayfası aynı kabuğu taşımalı. Üç parça ayrı ayrı sayıldı ve üçünde de
boşluk çıktı — hiçbiri kod hatası değil, hiçbirini üç kapı göremez:

| parça | önce | eksik olan |
|---|---|---|
| `ToolShare` paylaş düğmesi | 129/131 | `infusion` · `steroid-dose` |
| klinik uyarı satırı | 130/131 | `nrs-2002` |
| `☀️` süsleme glifinde `aria-hidden` | 15/124 | **109 araç** |

İlk ikisi unutulmuş tek tek; üçüncüsü sistematik. `☀️` her araçta `<h1>`in
hemen önünde duruyor, yani anlamı başlık taşıyor ve glif ekran okuyucuda saf
gürültü: 109 araç sayfasında başlıktan önce "güneş emojisi" okunuyordu.

**Süpürme yalnızca KATI ŞEKLE uygulandı:** glif span'ının ardından gelen ilk
boş olmayan satır `<h1` ile başlıyorsa süslemedir. 109 adayın 109'u bu şekle
uydu, başka biçim SIFIR çıktı — yani insan kararı gerektiren hiçbir glif
kümede yoktu. Kalıp zaten depoda vardı (son turlarda yazılan araçlarda
`aria-hidden` konmuş); süpürme yeni bir karar almıyor, eskiyi hizalıyor.

**Kalan glif de SONRAKİ TURDA süpürüldü.** Araç ikonu rozeti (`🧪` `💉`
`🦋` `🍏`) 131 aracın 131'inde **birebir aynı sınıf dizesini** taşıyor ve
hiçbirinde `aria-hidden` yoktu. İki koşul birden ölçüldükten sonra kapatıldı:
rozetin içeriği etiketler soyulunca YALNIZCA glif kalıyor mu, ve hemen
ardından adı taşıyan `<h1>` geliyor mu. 131/131 ikisini de sağladı,
kapsam dışı SIFIR.

**Ölçüt büyük/küçük harfe duyarlıydı ve bir kusur UYDURDU.** İlk tarama
`egfr`i "klinik uyarısı yok" diye işaretledi; uyarı oradaydı ve "**K**linik
kararlarda" diye başlıyordu. Türkçe metinde desen yazarken `-i` bayrağını
unutmak, belgedeki "desen tahmin etme, gerçek dizeyi oku" kuralının ucuz hâli.

**Negatif kontrol toplu süpürmede ŞART ve şekli belli:** gizledikten sonra
başlığın ve uyarı metninin erişilebilirlik ağacında HÂLÂ olduğunu ölç.
Ölçüldü — dört araçta da `aria-hidden` alt ağaçları silindikten sonra hem
`<h1>` metni hem uyarı cümlesi duruyor, yani gizleme yanlış ögeye konmadı.

Süpürme bitince ölçüt **elemesiz** bir kez daha çalıştırıldı: 124/124.

### Toplu süpürmede ölçüt İKİ ŞEKLİ birden karşılamalı

Araç ikonu rozeti süpürülürken ölçüt önce **98/131** dedi ve 33 araç
"kapsam dışı, insan kararı" diye raporlandı. Sebep kusur değil ölçüttü:
rozetin iki yazım şekli var —

```
<div className="w-14 h-14 …">🧪</div>            98 araç: glif doğrudan
<div className="w-14 h-14 …"><span>💉</span></div> 33 araç: iç span
```

İkinci şekilde ham içerik `"<span aria-hidden=…"` diye okunuyor ve
"yalnızca glif" sınamasından düşüyor. Etiketler soyulup GERİYE KALAN METNE
bakılınca 131/131 oldu.

**33 aracı "insan kararı" diye bırakmak, ölçütün kendi körlüğünü kusur gibi
raporlamak olurdu.** Kapsam dışı bir liste çıktığında ilk soru "bunlar
gerçekten farklı mı" değil, **"ölçütüm bu şekli tanıyor mu"** olmalı.

**Güvenli süsleme aday ölçütü İKİ koşullu ve ikisi de şart:**

1. Öge etiketler soyulunca YALNIZCA glif bırakıyor (metin taşımıyor).
2. Anlamı yanındaki öge taşıyor — burada hemen ardından gelen `<h1>`.

Biri tutmuyorsa glif TEK anlam taşıyıcı olabilir ve gizlemek bilgi kaybıdır.

**Ayrıca içerikleri EKRANA BASIP gözle doğrula.** 131 rozetin ayrık
içerikleri listelendi: 25 farklı glif, metin sıfır. Regex'in "yalnızca
glif" kararını bağımsız bir yöntemle sınamanın en ucuz yolu bu.

**Süpürmenin negatif kontrolü ÜÇ ayaklı:**

| ne ölçülür | neden |
|---|---|
| erişilebilirlik ağacında glif kaldı mı | süpürme işini yaptı mı |
| `<h1>` metni ağaçta HÂLÂ var mı | gizleme yanlış ögeye kondu mu |
| rozet ekranda HÂLÂ çiziliyor mu | `aria-hidden` yerine görsel gizleme yapılmadı mı |

Üçüncüsü kolay atlanır: `aria-hidden` görünümü değiştirmez, ama yanlışlıkla
`hidden` yazılsaydı ikon kaybolurdu ve ilk iki ölçüm bunu göremezdi.
Ölçüldü — beş araçta ağaçta 0 glif, başlıklar yerinde, rozet görünür.

**Araç DIŞINDA 56 öge (28 dosya) gizlenmemiş durumda ve SÜPÜRÜLMEDİ.**
Boyutlandırıldı: **48'i güvenli aday** (yanında zaten metin var), **8'i tek
başına** duruyor ve insan kararı ister (`🚧` `📊` `✅` `🏆` `💎` `📝` `↗`).
Bu bir KARAR değil, sonraki turun iş listesi.

En yoğunları kokpit (7), premium profil (5), `SimulatorEngine` (4). Bunlar
tek bir şekle uymuyor; durum rozetinde ya da boş durum ikonunda glif TEK
gösterge olabilir. Araç hub'ı ayrıca ölçüldü ve temiz: iki ikon basım
yerinin ikisinde de `aria-hidden` var, adı `<h2>` taşıyor.

### Tek bir iframe'i birden çok adres için yeniden kullanma

`f.src = yol` atayıp beklemek yetmiyor: eski belge yüklenme boyunca yerinde
kalıyor ve "yüklendi mi" ölçütü (`h1` var mı, öge sayısı > 50) ESKİ sayfa
tarafından anında karşılanıyor. Sonuç: döngüdeki her adres bir öncekinin
sayfasını ölçüyor.

Ölçüldü — dört farklı araç sayfası için de aynı `h1` döndü
(`eGFR (CKD-EPI 2021)`). İşaret, belgede zaten yazılı olanın aynısı:
**beklenen fark çıkmıyorsa ölçüme güvenme.**

Çare iki katmanlı: her ölçüme TAZE bir iframe kur ve bekleme koşuluna
`d.location.pathname === yol` kimlik kontrolünü ekle. Yalnızca içerik
kontrolü (h1 var mı) yetmez; yalnızca pathname de yetmez (gövde dolmadan
güncelleniyor) — ikisi birden gerekiyor.

### Süsleme emojisi: 416 öge ölçüldü — 109'u sonradan süpürüldü

> **GÜNCELLEME.** Aşağıdaki karar (toplu süpürme yapma) hâlâ geçerli, ama
> ölçüt daraltılabilen bir alt küme için sürüldü: araç sayfalarındaki `☀️`
> glifi `<h1>`in HEMEN önünde duruyor, yani şekli tartışmasız süsleme.
> 109 araçta kapatıldı; ayrıntısı bir üstteki bölümde. Kalan kümede karar
> hâlâ insanın: araç ikonu rozeti, durum rozetleri, boş durum ikonları.

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

### Başlık araması sürüldü — üç kusur, üçü de klavye/okuyucu tarafında

Arama kutusu HER sayfada duruyor ama hiç uçtan uca sürülmemişti. Sürüldü;
işlevsel taraf sağlam çıktı, erişilebilirlik tarafında üç kusur bulundu.

**Sağlam çıkanlar:**

| ölçüt | sonuç |
|---|---|
| kutunun adı | "Sitede ara" (`aria-label`) |
| sonuç geliyor mu | evet, ~1.2 s'de (300 ms geciktirme + sunucu eylemi) |
| Türkçe normalizasyon | "göğüs" ve "gogus" AYNI 8 sonucu veriyor |
| Tab sırası | kutu → temizle → ilk sonuç (bitişik, doğru) |
| hata dalı | bayat sonuç göstermiyor, dürüst metin basıyor |

**Kusur 1 — ESC açılır pencereyi kapatmıyordu.** Ölçüldü:
`defaultPrevented false`, pencere açık kalıyordu. Tek kapatma yolu DIŞARI
TIKLAMAKTI, yani fare kullanamayan biri pencereyi hiç kapatamıyordu.
Belgedeki "panel açan her yüzey ESC ile kapanmalı" kuralı, arama açılır
penceresine hiç uygulanmamıştı.

**Kusur 2 — hiç canlı bölge yoktu.** `role=status` / `aria-live` sayısı **0**.
Sonuçlar sessizce beliriyordu: ekran okuyucuyla gezen kullanıcı kutuya
yazıyor, hiçbir şey duyulmuyordu. Bölge artık KOŞULSUZ render ediliyor —
belgedeki kural gereği `status`, `alert`ten farklı olarak içerik değişmeden
ÖNCE DOM'da bulunmak zorunda; sonradan eklenirse ilk mesaj kaçar.

**Kusur 3 — temizleme düğmesi adsızdı ve hedefi küçüktü.** Adı TAM ZİNCİRLE
hesaplatıldı (aria-label → aria-labelledby → label[for] → saran label →
içerik) ve sonuç **"AD YOK"**: düğme yalnızca SVG taşıyor. Üstelik dokunma
hedefi **20×20**, belgedeki 24px alt sınırın altında.

**Doğrulama — üç düzeltme ve DÖRT negatif kontrol:**

| ölçüt | sonuç |
|---|---|
| canlı bölge YAZMADAN ÖNCE DOM'da mı | evet (1) |
| duyuru metni | "10 sonuç bulundu." — gerçek sonuç sayısıyla tutuyor |
| ESC pencereyi kapatıyor mu | açık → kapalı, `defaultPrevented true` |
| düğme: ad · SVG · boyut | "Aramayı temizle" · `aria-hidden` · **24×24** |
| **negatif 1** — ESC sorguyu siliyor mu | HAYIR, "diyabet" duruyor |
| **negatif 2** — temizleme hâlâ çalışıyor mu | evet, değer boşaldı |
| **negatif 3** — pencere KAPALIYKEN ESC yutuluyor mu | HAYIR (`false`) |
| **negatif 4** — eşik altı tek harfte ESC | HAYIR (`false`), duyuru da sessiz |

Son iki satır belgedeki "koruma kısayolu öldürmüş de olabilir" kuralının
karşılığı: `onKeyDown` yalnızca `isOpen` iken `preventDefault` çağırıyor,
yani Escape başka amaçlar için serbest kalıyor.

**Ölçüm tuzağı — ilk koşum "arama çalışmıyor" dedi ve YANLIŞTI.** Sonuçları
`a[href^="/topics/"]` diye aradım; saydığım 40 bağlantı sayfanın kendi
gezinme bağlantılarıydı ve açılır pencereyi hiç görmedim. Doğru ölçüm
kutunun SARMALAYICISINDAN metin okumak oldu — orada sonuçlar 1.2 s'de
duruyordu. Bir yüzeyin "çalışmadığı" sonucuna varmadan önce, ölçütün o
yüzeyin GERÇEK şeklini tanıdığını doğrula.


### Mobil menü de ESC ile kapanmıyordu — ve ESC'nin KATMANLANMASI ölçüldü

Arama penceresindeki ESC boşluğu kapatıldıktan sonra aynı ölçüt mobil menüye
uygulandı. Aynı boşluk oradaydı.

**Önce sağlam olanlar ölçüldü** (geçmiş bir kusur düzeltilmiş):

| ölçüt | sonuç |
|---|---|
| düğmenin adı | "Menü" |
| `aria-expanded` | açılınca false → true |
| dokunma hedefi | **44×44** (tercih edilen boyut) |
| açılıyor mu | görünür bağlantı 2 → 14 |
| düğmeyle kapanıyor mu | evet, 14 → 2 |

**Kusur: ESC hiç işlenmiyordu** — `defaultPrevented false`, menü açık
kalıyordu. Kapanışta odak da açan düğmeye dönmüyordu.

**KAPSAM ÖLÇÜLDÜ, VARSAYILMADI.** Panel kuralı üç şey ister (odak panele
girsin · ESC kapatsın · rol+ad). Ama bu menü MODAL DEĞİL ve ölçüm bunu
gösterdi: panel 210px yüksekliğinde ve sayfayı ÖRTMÜYOR
(`yükseklik > innerHeight × 0.7` yanlış), Tab sırası da doğal — düğme
indeks 4, ilk menü bağlantısı indeks 5, yani bitişik. Bu yüzden odak TUZAĞI,
`aria-modal` ve açılışta odak taşıma YAPILMADI; gereksiz olurdu. Eklenen
şey ESC + kapanışta odağın düğmeye dönmesi + `aria-controls`/panel `id`.

Kural: panel kuralını uygularken önce **panelin modal olup olmadığını ölç.**
Örten bir çekmece ile satır içi bir açılır menü aynı şeyi gerektirmiyor.

**ESC'NİN KATMANLANMASI — bu turun asıl ölçümü.** Artık İKİ yüzey ESC
kullanıyor (arama penceresi ve menü). Menü işleyicisi bilerek
`e.defaultPrevented` kontrol ediyor: zaten karşılanmış bir ESC ikinci kez
tüketilmiyor. Ölçüldü (1280px — ikisi de görünür):

| adım | arama | menü |
|---|---|---|
| başlangıç | açık | açık |
| **1. ESC** | **kapandı** | açık KALDI |
| **2. ESC** | — | **kapandı** |

Yani ESC her seferinde TEK yüzey kapatıyor. Bu kontrol olmasaydı tek tuşla
ikisi birden kapanır ve kullanıcı menüyü kaybederdi. **Aynı tuşu ikinci bir
yüzeye bağlarken bu ölçümü yap** — tek yüzeyle sınamak yeterli değil.

**Negatif kontroller:**

| ölçüt | sonuç |
|---|---|
| menü KAPALIYKEN ESC yutuluyor mu | HAYIR (`false`) |
| düğme hâlâ açıyor mu | evet |
| kapanışta odak nereye gitti | açan düğmeye ("Menü") |

**Betik yazarken iki kez aynı aileye takıldım.** Geçen tur JSDoc içindeki
`**5 lb**/inç` dizisi `*/` üretip blok yorumu erken kapatmıştı; bu tur
yorum metnindeki ters tırnak, betiğin şablon dizesini erken kapattı.
İkisi de aynı ders: **yorum metnini bir sarmalayıcı dize içinden yazarken,
metnin sarmalayıcının sonlandırıcısını içermediğini kontrol et.** Çare
basit — yorum metnini ayrı bir dosyaya yaz, betik onu okusun.


### Oturum yüzeyi sürüldü — biri gerçek kusur, kalanı sağlam

Kullanıcının bildirdiği çıkış kusuru, hiç sürülmemiş bir yüzeyde çıkmıştı.
O yüzden bütün oturum akışı ölçüldü. Giriş doğrudan MongoDB'ye gidiyor
(`auth.ts` → `User.findOne`), Express arka ucuna DEĞİL — yani başarısız
giriş yolu güvenle sürülebiliyor (okuma, yazma yok).

**`/giris` sağlam.** Ölçüldü:

| ölçüt | sonuç |
|---|---|
| alan adları | "E-posta", "Şifre" — ikisi de bağlı |
| yanlış giriş | `role="alert"` · "E-posta veya şifre hatalı." |
| `aria-invalid` | iki alanda da var |
| sistem içi ad sızıyor mu | hayır; "kullanıcı yok" ile "parola yanlış" AYIRT EDİLMİYOR (doğru) |
| yükleme durumu | 0 ms'de `disabled` + "Giriş yapılıyor…" + opaklık 0.7 |
| çift gönderim | engelleniyor, sonrasında sıfırlanıyor |

**Ölçüm tuzağı — ilk koşumda 5 saniye sürdü ve yavaşlık sanıldı.** İkinci
koşumda 250 ms. Fark MongoDB'nin SOĞUK bağlantısı; kod kusuru değil. Ama
soğuk bağlantı gerçek kullanıcının günün ilk girişinde olağan, yani yükleme
durumunun varlığı tam da orada önemli — ve ölçüldü, ekrana ulaşıyor.

**`/kayit`ta GERÇEK KUSUR: otomatik girişin sonucu atılıyordu.**

```js
await signIn('credentials', { … });   // dönen değer ATILIYOR
router.push('/');
```

Kayıt BAŞARILI olup otomatik giriş başarısız olursa kullanıcı ana sayfaya
OTURUMSUZ düşüyordu — az önce formu doldurmuşken. Asıl zarar ikinci adımda:
kaydın olmadığını sanıp yeniden deniyor ve bu kez **"Bu e-posta adresi zaten
kayıtlı."** ile karşılaşıyor. Çıkmaz sokak, üstelik hesabı gerçekten var.

Bu, belgedeki *"uydurulmuş bir başarı, çağıranın üstüne kod yazdığı yanlış
bir varsayım üretir"* kuralının ARAYÜZ tarafındaki hâli.

**DOĞRULAMA — veritabanına yazmadan dalı çizdirmenin yolu.** Gerçek kayıt
yazma demek. Bunun yerine belgede kayıtlı `fetch` koşumu kullanıldı: iframe
içinde yalnızca `/api/auth/register` sahte 201 döndürüyor, `signIn` GERÇEK
uca gidip kullanıcı olmadığı için gerçekten başarısız oluyor. Yani senaryo
(kayıt oldu + giriş olmadı) yazma olmadan kuruldu.

| ölçüt | sonuç |
|---|---|
| kayıt ucu koşumla çağrıldı | evet — veritabanına hiç gidilmedi |
| `signIn` gerçek uca gitti ve düştü | evet |
| kullanıcı `/`'a oturumsuz düşüyor mu | **hayır**, `/kayit`ta kalıyor |
| mesaj | "Hesabın oluşturuldu ama otomatik giriş yapılamadı…" |
| çıkış yolu | "Giriş yap" → `/giris` |
| düğme yeniden etkin mi | evet, kilitli kalmıyor |

**Negatif kontrol ayrı ölçümde:** kaydın KENDİSİ başarısız olduğunda (kısa
parola) çıkan mesaj "Şifre en az 6 karakter olmalıdır." — yani yeni dal
yersiz ateşlemiyor. O ölçüm de yazma yapmıyor: uzunluk denetimi uç noktada
veritabanı erişiminden ÖNCE.

**Kayıt ucunun hata metinleri temiz** (sistem içi ad, yığın izi, tablo adı
yok): "Tüm alanlar zorunludur." · "Şifre en az 6 karakter olmalıdır." ·
"Bu e-posta adresi zaten kayıtlı." · "Sunucu hatası."

**Başarı sonrası yönlendirme `signOut` kusurundan ETKİLENMİYOR.** İki sayfa
da `router.push('/')` kullanıyor — Next istemci yönlendiricisi origin'i
tarayıcıdan alıyor, NextAuth'un çıkardığı tabana bakmıyor. Yani `0.0.0.0`
kusuru gerçekten `signOut`'a özgüydü.

**DEĞİŞTİRİLMEYEN, NOT EDİLEN:** `?gerekli=` bir SEBEP bayrağı
(`premium` / `kayseritip`), hedef taşımıyor. Korumalı bir sayfadan `/giris`e
yönlendirilen kullanıcı, giriş yaptıktan sonra gitmek istediği yere değil
`/`'a düşüyor — yönlendiren üç yer de (`middleware.ts`, `kayseritip/layout`,
`AccessGate`) istenen yolu BİLİYOR ve atıyor. Bu bir dönüşüm sürtünmesi ama
ölçülmüş bir kusur değil; üstelik hedefi geri okumak açık yönlendirme
(open redirect) doğrulaması gerektirir. Ürün kararı olarak bırakıldı.


### `-H 0.0.0.0` NextAuth'un TABAN ADRESİNE sızıyor — çıkış 0.0.0.0'a gidiyordu

Kullanıcı bildirdi: üyelikten çıkınca tarayıcı **"Bu siteye ulaşılamıyor ·
ERR_ADDRESS_INVALID"** veriyor ve adres çubuğunda `http://0.0.0.0:3000/`
yazıyor.

Sebep: `package.json` dev/start betikleri `next dev -H 0.0.0.0` ile bağlanıyor.
NextAuth taban adresini oradan çıkarıyor ve `signOut({ callbackUrl: "/" })`
göreli adresi o tabana göre çözüyor. **`0.0.0.0` bir DİNLEME adresi** ("tüm
arayüzler"), gidilecek bir adres değil.

| ölçüm | değer |
|---|---|
| yerelde `/api/auth/providers` | `http://0.0.0.0:3000/api/auth/…` |
| tarayıcının bulunduğu yer | `http://localhost:3000` |
| **CANLIDA** aynı uç | `https://medi-sea-gh-1.vercel.app/…` — DOĞRU |

Yani kusur yalnızca geliştirme ortamında; kullanıcılara ulaşmıyordu. Giriş de
çalışıyordu, çünkü `signIn` çağrıları `redirect: false` kullanıyor ve tabana
hiç dokunmuyor — bildirimdeki "sadece çıkışta oluyor" gözlemi bununla birebir
uyuşuyor.

**ÖLÇÜM YÖNTEMİ — oturum açmadan hedefi okumanın yolu.** Çıkış ucu normalde
302 veriyor ve tarayıcı 0.0.0.0'a gidemediği için `fetch` "Failed to fetch"
ile düşüyor; gövde okunamıyor. Auth.js v5 istemcisinin kullandığı
`X-Auth-Return-Redirect: 1` başlığı gönderilirse uç **302 yerine JSON**
döndürüyor ve NextAuth'un hesapladığı hedef doğrudan okunabiliyor.

**İLK ÇÖZÜM FİKRİ YANLIŞTI ve bunu ancak KÜTÜPHANENİN KAYNAĞI gösterdi.**
`callbackUrl` olarak tam adres vermek (`window.location.origin + "/"`) de
kurtarmıyor. `@auth/core`'un varsayılan `redirect` geri çağrısı
(`node_modules/@auth/core/lib/init.js`) mutlak adresi TABANLA karşılaştırıyor
ve origin tutmazsa TABANA düşüyor:

```js
if (url.startsWith("/"))                  return `${baseUrl}${url}`;
else if (new URL(url).origin === baseUrl) return url;
return baseUrl;                           // ← 0.0.0.0'a döner
```

Ölçüldü — iki girdi de aynı kapıya çıkıyor:

| gönderilen `callbackUrl` | NextAuth'un döndürdüğü hedef |
|---|---|
| `/` (eski kod) | `http://0.0.0.0:3000/` |
| `http://localhost:3000/` (ilk fikir) | `http://0.0.0.0:3000` — reddedildi |

**Genel kural: bir kütüphane senin yerine hedef HESAPLIYOR ve o hesap
yanlışsa, ona daha iyi bir GİRDİ vermeye çalışma — hesabı elinden al.**
Çare `redirect: false` ile oturumu kapatıp yönlendirmeyi tarayıcıya bırakmak;
göreli `/` adresini tarayıcı BULUNULAN sayfaya göre çözer. Bu, üç durumda
birden doğru olan tek yol: localhost, LAN IP'si (telefondan bakarken) ve
üretim alan adı.

Denenmeyen iki yol ve gerekçeleri: `NEXTAUTH_URL`i sabitlemek LAN erişimini
bozar (telefondan açılan sayfa localhost'a yönlenir), `-H 0.0.0.0`ı kaldırmak
telefondan denemeyi tümden kapatır — tablet/telefon bu projede gerçek bir
kullanım yüzeyi.

**Doğrulamanın SINIRI raporda yazılı.** Gerçek çıkış akışı uçtan uca
sürülemedi: oturum açmak yerel Express arka ucunu gerektiriyor ve o çalışmıyor,
üretim veritabanına da yazılmıyor. Ölçülen şey belirleyici parça olan HEDEF
HESABI — eskisi `0.0.0.0`, yenisi `http://localhost:3000/` (`/tools/bmi`den
`location.href = "/"` çağrısıyla ölçüldü). Yeni bir çıkış düğmesi eklerken
`signOut`u doğrudan çağırma, `SiteHeader`daki `cikisYap`ı kullan.


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
