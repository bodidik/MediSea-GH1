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
`log` bir dönem tipte yoktu, yedek de senkron da çalışma günlüğünü düşürüyordu.
Yeni anahtar eklerken `Backup` · `readAll` · `parseBackup` · `applyImport`
birleştirme dalı · `write` **beşini birden** güncelle.

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
  indir) sunar.
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
node scripts/baslik-index.cjs    # yeni konu eklendiğinde (paylaşım kartı başlığı)
node scripts/ilgili-index.cjs    # yeni konu eklendiğinde (İlgili Konular bağları)
node scripts/plan-ver.cjs --liste  # kullanıcı planlarını görmek/değiştirmek için
```

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

### Sınav takvimi

`content/sinav-takvimi.json` boş gelir ve boşken geri sayım hiç basılmaz.
Tarih uydurulmaz: yanlış tarihe göre program yapan aday gerçekten zarar
görür. ÖSYM takvimi açıklanınca dosyaya yazmak yeterli; geçmiş tarihler
kendiliğinden elenir, en yakın gelecek sınav seçilir.

---

## Sayılar, denetimler ve kendini onaran okumalar

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

### İçerik denetimleri

Bu hata sınıfları **kodda değil veride** durur; `lint`, `typecheck` ve
`build` üçü de göremez. İkisi de CI adımı:

```bash
node scripts/link-denetim.cjs    # içerikteki kırık iç bağlantılar (yönlendirmeleri bilir)
node scripts/soru-denetim.cjs    # quiz/kart yapısı: doğru cevap geçerli mi, şık var mı
node scripts/yetim-denetim.cjs   # konu dosyası olmayan quiz/kart/vaka (CI kapısı DEĞİL)
```

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
  arasındaydı (eşik 4.5). Bir basamak koyulaştırıldı. Koyulaştırmadan önce
  bu renklerin koyu zeminde kullanılmadığı ölçüldü; kullanılsaydı müdahale
  geri teperdi.

Yeni yüzey eklerken: dokunma hedefi en az 24px (tercihen 44), ikincil
metin `slate-600`'den açık olmasın, tıklanabilir görünen her şey gerçekten
tıklanabilir olsun (sahte `cursor-pointer` taşıyan iki ikon kaldırıldı).

### Route grubu dışındaki sayfalar AppShell almaz

`app/tools/*` ve `app/kayseritip/*` `(site)` grubunun DIŞINDA. AppShell'in
verdiği hiçbir şeyi almıyorlar: üst menü, alt bilgi, `<main id="icerik">` ve
atlama bağlantısı. Ölçüldü — 115 araç sayfasında `main`/`nav`/`header`/
`footer` sayısı **sıfırdı**.

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

### Mobil ölçümü TEK genişlikte yapma

Bu oturumdaki taşma ölçümlerinin hepsi 375px'te yapıldı ve "mobil taşma yok"
diye raporlandı. 375 tek başına yeterli değil: 320px hâlâ yaygın (iPhone SE
ve benzerleri) ve dar ekranda sıkışan bir düzen orada kırılır.

Ölçüldü — 12 açık sayfa ve premium gövde 320px'te de temiz: sayfa
`scrollWidth` 320, gövde düzeyinde taşma yok. Tablolar 4 kolonda 454-459px
genişliğe çıkıyor ama 288px'lik kutularında **kayıyor, kırpılmıyor**
(`overflowX: auto` + kolon başına en az 110px).

Yeni bir yüzey ölçerken **320 ve 375** ikisine birden bak. Ölçütler:
`documentElement.scrollWidth` viewport'a eşit olmalı; taşan bir öge varsa
kaydırılabilir bir atası olmalı.

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

### Tarayıcıda kontrast ölçen betiğin üç tuzağı

Üçü de gerçekten yanılttı; ikisi kusur uydurdu, biri gerçek kusuru gizledi.

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

Genel kural: bir tarama "0 kusur" dediğinde **kasten bozuk bir kayıt
ekleyip yakalandığını gör.** Kusur bulamayan tarama, düzeltilmiş bir
yüzeyden ayırt edilemez.
