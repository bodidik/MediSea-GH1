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

### ⚠ CI ÜÇ ADIM DEĞİL — bu satır bir kez yanlış yazıldı ve 1,5 gün kırmızıya mal oldu

Bu bölüm bir dönem *"CI sırayla `npm ci → lint → typecheck → build` çalıştırır"*
diyordu. YANLIŞTI. `.github/workflows/ci.yml` **on beş adım** çalıştırıyor ve
`build` EN SONDA:

```
npm ci → lint → typecheck
  → link-denetim → soru-denetim
  → arac-metadata --kontrol → baslik-index --kontrol → ilgili-index --kontrol
  → arayuz-denetim (+ --negatif)
  → ic-bilesen-denetim (+ --negatif)
  → saydamlik-denetim --kapi (+ --negatif)
  → renk-cifti-denetim --kapi (+ --negatif)
  → build
```

Bedeli ölçüldü: `ilgili-index --kontrol` düştüğü için **97 koşum boyunca
(1,5 gün) CI kırmızıydı** ve build CI'da hiç çalışmadı — ama her turda
"dört kapı geçti" raporlanıyordu, çünkü yerelde yalnızca üç adım
sürülüyordu. **Kapı senin çalıştırdığın komut değil, CI'ın çalıştırdığı
komuttur.**

Yerelde HEPSİNİ sürmenin yolu (`npm ci` BİLEREK yok — çalışan ortamı bozar):

```bash
cd web
for k in link-denetim.cjs soru-denetim.cjs          "arac-metadata.cjs --kontrol" "baslik-index.cjs --kontrol"          "ilgili-index.cjs --kontrol"          arayuz-denetim.cjs "arayuz-denetim.cjs --negatif"          ic-bilesen-denetim.cjs "ic-bilesen-denetim.cjs --negatif"          "saydamlik-denetim.cjs --kapi" "saydamlik-denetim.cjs --negatif"          "renk-cifti-denetim.cjs --kapi" "renk-cifti-denetim.cjs --negatif"; do
  node scripts/$k >/dev/null 2>&1 && echo "OK    $k" || echo "DUSTU $k"
done
npm run lint && npm run typecheck
NEXT_DIST_DIR=.next-verify npm run build
```

CI ilk hatada durduğu için **bir adımı düzeltmek arkasındakini açığa
çıkarabilir**; yukarıdaki döngü durmadan hepsini sürüyor, yani tabloyu tek
seferde veriyor. Gönderdikten sonra `gh run list --limit 3` ile sonucu
GÖR — yeşil olduğunu varsayma.

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

## Ölçüm arşivi — `CLAUDE-arsiv.md`

Kapanmış kusur sınıflarının ayrıntılı ölçüm kayıtları (573 bölüm, 1.5 MB)
`CLAUDE-arsiv.md`ye taşındı ve **otomatik yüklenmiyor.** Bu dosya yalnızca
işletim kurallarını ve güncel durumu taşıyor.

Arşivi ne zaman aç: bir denetimin verdiktini sorgularken, kapanmış bir sınıfın
neden kapandığını doğrularken, bir ölçüm tuzağının ayrıntısı gerektiğinde.

```bash
grep -n "terim" CLAUDE-arsiv.md
grep -n '^### ' CLAUDE-arsiv.md
```

**Yeni kayıt yazma kuralı:** bundan sonra buraya YALNIZCA özet gir (ölçüm
tablosu + verdikt, en fazla 15 satır). Uzun anlatı commit mesajına ve
gerekiyorsa arşive yazılır. Bu dosya 60 KB'ın üstüne çıkarsa yeniden ayır.

---

## Sayı yazma, SAYDIR

Elle yazılan sayı içerik büyürken sessizce yalana dönüyor (ana sayfa "6+ araç"
derken 114 araç vardı; "456+ konu" derken 45'i gizliydi). Kural: bir yüzeye
sayı koyarken veriyi şu kaynaklardan al —

| ihtiyaç | kaynak |
|---|---|
| branş/konu/araç/premium toplamı | `lib/icerik-sayaci.ts` → `icerikSayilari()` |
| branş başına açık konu | `app/lib/topic-counts.ts` → `getTopicCounts()` |
| araç sayısı | `app/lib/topic-counts.ts` → `getToolCount()` |
| premium konunun soru/kart/inci/vaka sayısı | `lib/premium-envanter.ts` → `envanterAl()` |
| konu başlığı (görsel rotalarında) | `content/baslik-index.json` |
| branş → araç eşlemesi | `content/brans-arac.json` (üretilmiş) |

**`app/` dizininden çalışma zamanında dosya OKUMA.** Sunucusuz ortamda kaynak
`app/` yok; araç sayısı bir dönem `app/tools` sayılarak bulunuyordu ve istek
anında çalışan sayfalarda **sıfır** çıkıyordu. Sayımlar `content/`ten yapılır.

**Bu belgedeki sayılar ÖLÇÜM ANINA aittir** — güncel değeri betikten al.

---

## Denetim betikleri

### CI kapısı (düşerse iş düşer)

```
link-denetim · soru-denetim
arac-metadata --kontrol · baslik-index --kontrol · ilgili-index --kontrol
arayuz-denetim (+ --negatif) · ic-bilesen-denetim (+ --negatif)
saydamlik-denetim --kapi (+ --negatif) · renk-cifti-denetim --kapi (+ --negatif)
yorum-korlugu-denetim   (meta test: 15 denetimi tohumlu agacta surer)
```

### Rapor (kapı DEĞİL — karar insanın)

```
konu · yetim · asili · ebeveyn · kopya-bolum · benzer-govde · ilan-render
bolme · bant · karar · kapi-kapsam · cop-kapi · esik-etiket · eksik-alan
payda · yuvarlama · olu · sizinti · liste-adaylari
```

Yerelde hepsini sürmenin yolu `## Komutlar ve doğrulama` bölümünde. **Kapı
senin çalıştırdığın komut değil, CI'ın çalıştırdığı komuttur** — bir tur
yalnızca lint/typecheck/build sürüldüğü için CI 97 koşum kırmızı kaldı.

### Denetim yazarken sorulacak DÖRT soru

1. kusur buluyor mu (negatif kontrol — tohumla),
2. yanlış pozitif üretiyor mu (pozitif kontrol — temiz tohum işaretlenmemeli),
3. **başka bir ağaca yönlendirilebiliyor mu** (`--kok`) — yönlendirilemeyen
   denetim tarihsel olarak sınanamaz, körleştiğinde kimse fark etmez,
4. ölçütün göremediği **ayna hâli** var mı (ör. "çöp geçiyor" kaynaktan
   görülür, "meşru sıfır engelleniyor" görülmez — o ancak aracı sürerek).

**En güçlü doğrulama sentetik tohum değil, GERÇEK KUSURUN önce/sonra
çiftidir** (`git show <commit>~1:<dosya>` ile).

### Kaynak tarayan her ölçüt YORUMLARI elemek zorunda

Bu depoda yorumlar kusurları **birebir alıntılıyor**; elemeyen ölçüt kendi
belgesini kusur sanıyor. Yorumları **silme, boşlukla doldur** — satır
numaraları korunsun. `yorum-korlugu-denetim` bunu nöbetliyor.

Ayıklayıcı yazarken: çift eğiğin **önündeki karaktere bak** — iki nokta,
tırnak ya da ters bölü varsa o bir yorum değil, URL'dir. Naif desen
`http` ile başlayan satırların geri kalanını siliyor ve iki checked-in
denetim bu yüzden sessizce kördü.

---

## Kendini onaran okumalar

İçerik listeleri zamanla gerçeklikten kopuyor; bu üç yerde liste elle
düzeltilmiyor, okuma adımı onarıyor:

- **açık branş sayfası** — ebeveyni bulunamayan konular "Diğer Konular" altında,
- **premium branş + pano** — `lib/premium-brans.ts` → `listelenmeyenKategori()`,
- **premium konu sayfası** — sayılar ilana değil DOSYAYA bakar, bağlantı ancak
  dosya gerçekten varsa kurulur.

**İLAN YETMEZ, dosyayı sor.** Aynı kalıp: quiz künyesi, modül kartları,
`hazir` bayrağı. Bir ölçüm yaparken de bunu bil — içerikten hesaplanan bir
taban, onarımın eklediği kaydı bilemez.

---

## Erişilebilirlik tabanları (`app/globals.css` sonu)

- **Okuma alanı yazı boyutu tabanı** — `[data-readable]` içinde metin 14px
  (telefonda 15px) altına inemez. Liste iki kuralda (masaüstü/mobil) ve
  **ikisi ayrışırsa** ondalıklı varyantlar telefonda daha büyük basılır.
- **İkincil metin renkleri** — `text-slate-300/400/500` bir basamak
  koyulaştırılıyor; kural **AÇIK zemin varsayıyor.**
- **Koyu kart muafiyeti** — muaf tutulan zemin sınıflarının listesi ELLE ve
  içeriğin paletine göre bayatlıyor (bir dönem 19 sınıf listede yoktu, dört
  konuda kontrast 2.60). İçerikte `bg-<aile>-(700|800|900|950)` sayıp listeyle
  karşılaştır.
- **`koyu-yuzey`** — baştan sona koyu yüzeyler bu sınıfı kök ögeye koyar ve
  tonlar özgün değerine döner. **İçinde açık kart taşıyan koyu yerleşim bu
  sınıfı ALMAZ** (premium panosu; verilseydi 21 yazı 2.56'ya düşerdi).
- **`dark:` varyantları etkisiz olmalı** (`darkMode: "class"`, kimse `.dark`
  koymuyor) — içerikteki 397 `dark:` sınıfı aksi hâlde OS koyu kipinde
  devreye girip kontrastı 1.37'ye düşürüyordu.
- **`.prose`a düz `color` yazma** — `@tailwind utilities`ten sonra geldiği
  için `text-slate-300`ü eziyor ve `prose-invert` kurtarmıyor.
- **`scroll-padding-top: 96px`** `html`de tek kaynak; per-öge `scroll-margin`
  KULLANMA (ikisi toplanır).
- **`prefers-reduced-motion`** evrensel seçiciyle kapsanıyor.
- **Baskı** — `@media print` gezinmeyi gizler, `nav:not([data-baskida-goster])`
  ile İçindekiler muaf, `mark.ms-hl` `print-color-adjust: exact`.

Yeni yüzey: dokunma hedefi ≥24px (tercihen 44), ikincil metin `slate-600`'den
açık olmasın, tıklanabilir görünen her şey gerçekten tıklanabilir olsun.

---

## Tekrar eden ölçüm tuzakları

Aşağıdakilerin hepsi bu depoda **en az iki kez** yanlış sonuç üretti.
Ayrıntısı arşivde; burada tanıma imzası var.

### Ortam (tarayıcı paneli)

| tuzak | imza / çare |
|---|---|
| `document.hasFocus()` **false** | `:focus` hiçbir ögeye uymuyor — odak boyaması gösterilemez |
| `visibilityState: hidden` | **geçiş, animasyon, `scroll` olayı, `IntersectionObserver`, `rAF`, smooth kaydırma** hiç çalışmıyor; `paint` kaydı 0 → **CLS/LCP ölçülemez** |
| geçiş/animasyon donmuş değer | ölçümden ÖNCE `transition:none` **ve** `animation:none`, sonra reflow |
| `resize_window` `resize` olayı atmıyor | olayı **elle** gönder; `dvh` için sayfayı **yeniden yükle** |
| `innerWidth: 0` | **makul görünen çöp geometri** üretir — her geometri betiğinin başına `if (!innerWidth) throw` |
| iki sekme, iki kaydırma çubuğu | `clientWidth` 1265 ↔ 1280 → canlı↔yerel karşılaştırması 15px kayar; **nötr belgeyle kalibre et** |
| `scrollHeight` yüksekliğe de bağlı | görünüme kilitli `main` varsa iki boyutu birden sabitle |
| sekme öykünürken iframe içinde ölçme | çöp geometri |
| pano yazma / `<style>` enjeksiyonu | pano çalışmıyor; `<style>` **artık çalışıyor** (eski kayıt çürütüldü) |
| kapalı `<details>` içinde görünürlük | `getBoundingClientRect` son kutuyu döndürür — `el.checkVisibility()` |

### Ölçüt (tarama / desen)

| tuzak | çare |
|---|---|
| **Türkçe alt dize** — `ağır` → "AĞIRLIK", `orta` → "Orta Aktif", `üre` → "süre" | kelime sınırını **elle** kur; JS sınır işareti ASCII'ye göre çalışıyor |
| **Türkçe katlama** — `i` ↔ `İ`, `ş` ↔ `Ş`; `toUpperCase("Remisyon")` → `REMISYON` | iki tarafı da aynı kurala indir, ya da birebir eşleştir |
| **Türkçe ek zorunlu tutmak** | ek almamış biçimler sistematik eksik sayılır |
| **React `<!-- -->` ayracı** | statik metin + ara değer aynı desende aranamaz |
| **React metin birleşmesi** | `"ACushing"`, `"413–15"`, `"Göster boşluk"` — düğme puanını `textContent`ten okuma |
| **`innerText` `uppercase` uygular** | metin ararken `textContent` |
| **`<script>` RSC yükü taşıyor** | "sunucu HTML'inde yok" ≠ "sayfada yok"; not-found metni HER konu sayfasının yükünde |
| **`textContent` JSON-LD içeriyor** | `script`/`style`/`noscript` alt ağaçlarını ele |
| **çapa benzersiz olmalı** | "Sonucu gör" ↔ şık açıklamasındaki "sonucu"; `head -1`; ilk JSON-LD bloğu |
| **pencere darlığı** | sabit 58/180/700 karakterlik pencereler sahte "AYRIŞTIRILAMADI" ve sahte TEMİZ üretti |
| **kırpılmış değeri ölçüme geri verme** | `slice(0,50)`, `head -c 600`, HTML dilimi |
| **tip anotasyonu diziye karışır** | eşittir işaretinden SONRAKİ ilk köşeli parantezden başla |
| **`grep -c` satır sayar** | küçültülmüş HTML'de 32 eşleşme "1" |
| **`-L` yönlendirmeyi izler** | ölü slug'lar sağlam görünür — bağlantı taramasında HAM durum |
| **glob köşeli parantezi karakter sınıfı sanar** | `os.walk`; adres deseninde `(site)` parantezini de kabul et |
| **`0 kusur` ile `0 ölçüm` aynı görünür** | her tarama **ölçtüğü öge sayısını** da bassın |

### Yöntem

| kural | neden |
|---|---|
| **Ölçütü yeniden yazma — uygulamanın kendisini SÜR** | ebeveyn çözümü, `isoTarih`, `kisaltmaAc`, TOC eşiği: dördünde de kendi kopyam farklı cevap verdi |
| **Beklenti tutmadığında önce beklentiyi sına** | `rts` katsayısı, `asdas`, `dka` 15–20, Hamwi tabanı |
| **Erişilebilir adı TAM ZİNCİRLE hesaplat** | `htmlFor` · `closest('label')` · saran etiket · `read_page` ağacı — dördü de tek başına yanılttı; `title` ve **placeholder** ad SAYILMAZ |
| **Ardışık ölçüm bayat sonuç verir** | her senaryoyu yalıt; tıklamadan sonra aynı karede DOM okuma; biriken dinleyici; **zaman aşımına uğrayan çağrı da yan etki bırakır** |
| **Seçili düğmeye ikinci kez basmak seçimi KALDIRIR** | sürücü "zaten seçiliyse tıklama" yapmalı |
| **Koşullu dalı çizdirmeden ölçme** | hata kartı, boş durum, sonuç ekranı, katlanmış akordeon, kapı arkası |
| **Örneklem: hangi sayfa · hangi genişlik · hangi mekanizma** | üçü de ayrı ayrı kapsam iddiasıdır |
| **Kapsamı SAY, tahmin etme** | 11→15, 27→+17, 2→22, 8→21: hep ölçütün tanıdığı biçim kadar |
| **Kopyayı SAY** | "son kopya" üç tur üst üste yanlış çıktı |
| **Bir sayıyı ölçtükten sonra SEBEBİNİ de ölç** | doğru sayının yanına yanlış sebep yazıldı (4 kez) |
| **Toplu yerleştirmeyi kapılarla doğrulama** | kapılar sözdizimini sınıyor, YERLEŞİMİ değil — bağımsız bir denetim şart |

### Kanal (dosya yazma)

- **Kaçış taşıyan betiği kabuk kanalıyla YAZMA** — heredoc, `node -e`,
  `python -c` hepsi ters bölüyü düşürüyor (bu depoda **9 kez**). Write kullan
  ya da kaçış istemeyen karşılığını seç. **Simetrik bozulma testten geçer** —
  üretilen anahtarın DEĞERİNİ bastır.
- **Kabuk heredoc'u, içinde heredoc sözdizimi geçen METNİ de yazamıyor**
  (bu bölümü yazarken yine oldu) — markdown parçasını Write ile yaz.
- **Python heredoc bu ortamda ASILIYOR** (5+ kez, yedek olarak yazıldığında bile).
- **Yorum metnine desen yazma** — blok yorum ve şablon dizesi erken kapanıyor;
  Tailwind JIT yorumdaki sınıf adını da üretiyor.
- **Satır sonu**: yamadan **ve her git işleminden** sonra CR ile LF'i AYRI say
  (`git diff --stat` göstermiyor). Bozan kanallar: yama betiği, `sed -i`,
  `git stash pop`. Depoda üç biçim birden var.
- **NUL bayt** dosyayı git'te ikili yapar — `git show --stat` `Bin 0 -> N`.
- **Boru hattında `$?`** son komutun kodudur; kapıyı **tek başına** çalıştır.
- **`&&` kısa devre** temizlik adımını da atlar — `rm -f log` düşen bir
  `cd`nin arkasındaysa bir önceki koşumun günlüğü okunur.
- **`/tmp` ve `/c/...` node'da çözülmüyor** (Windows yolu kullan).
- **`.next` ve `.claude/worktrees`** depo geneli grep'i kirletir.
- **`pkill -f "next start"` süreci öldürmüyor** — PID'i `netstat -ano` ile bul,
  `taskkill //PID … //F`. Ölçtüğün sunucunun düzeltmeyi TAŞIDIĞINI doğrula
  (CSS parmak izi ya da sunulan HTML'de dize ara).

---

## Tekrar eden KUSUR sınıfları

Yeni bir yüzeye dokunurken bunları sor. Hepsi bu depoda ölçüldü.

| sınıf | ölçütü |
|---|---|
| **İki gerçeklik** | aynı değer/karar iki yerde tutuluyorsa er geç ayrışır — tek kaynağa bağla, "çıktı aynı kaldı" değil **KOPYANIN kaybolduğunu** ölç |
| **İlan mı gerçek mi** | bayrak/etiket/yorum bir şey iddia ediyor, kod onu yapmıyor (`haq-di` · `murray` · `apache2` · `anaphylaxis` · `canadian-ct` · `rts` · sodyum ODS tavanı) |
| **Ölü alan** | tanımlı ama hiç okunmayan alan yanıltıcıdır — yanlış alanı düzelten hiçbir etki görmez (`gluco` · `istatistikler` · `weight`) |
| **Alan okunuyor ama YANLIŞ İŞ için** | `max: 28` yalnızca ekrana basılıyor, kapı uygulamıyor |
| **Çöp girdiden klinik etiket** | `parseLocaleNumber` her şeyi 0'a çevirir; **"0" NaN'dan tehlikeli**. Meşru sıfırı ayırmak için HAM DİZEYE bak (`sayiGirildiMi`) |
| **Üst sınır yok** | saçma girdi TALİMAT üretiyor mu? Üretmiyorsa sınır kozmetik |
| **"Değerlendiremedim" ile "olumsuz" karışıyor** | `null`/`NaN`/`Infinity` hepsi "değer yok" — `!== null` yalnızca birini yakalar |
| **Sessiz boşluk** | hesaplanamıyorsa SEBEBİNİ ve hangi ALANI söyle (`role="alert"`) |
| **Seçim PUANLA saklanıyor** | aynı puanlı iki şık tek düğme olur — **kimlikle** sakla (6 örnek) |
| **Ekranda duran ama hiçbir şeyi değiştirmeyen kontrol** | kontrolü değiştir, çıktının GERÇEKTEN değiştiğini gör |
| **Aynı ad, farklı hedef** | aynı listede iki bağlantı/grup/landmark özdeş adlı mı |
| **`flex-1` çöküyor** | `shrink-0` kardeşler kabı yiyor, esnek sütun 0'a iner ve `truncate` %100 gizler |
| **`truncate`/`line-clamp` bir GENİŞLİK varsayımıdır** | en dar kutuda kaç piksel gerekiyor — ölç |
| **Kaydırma kabı ipuçsuz** | `overflow-x:auto` bir kapasite, affordans değil (odak · ad · **görünür ipucu**) |
| **Sonuç foldun altında** | doğru olması yetmiyor, girdinin yanında görünür olmalı |
| **Zamana bağlı değeri saklama** | `now`un fonksiyonu olan sayı saklandığı anda donuyor (streak, due, `mtime`) |
| **Yorum/etiket bayat** | ŞİMDİKİ ZAMANLI iddia sayıdan arındırılmalı; geçmiş zamanlı ölçüm kaydına dokunulmaz |

---

## Güncel durum (5 Eylül 2026 ölçümü)

| büyüklük | değer |
|---|---|
| branş · açık konu | 13 · **423** |
| klinik araç | **136** |
| premium başlık · soru · kart · vaka | 44 · **454** · 1492 · 11 |
| CI | **20 adım**, son koşumlar yeşil |
| duyurusu olan araç | **105 / 136** |

**Dört yüzey birbirini tutuyor** (ana sayfa · `/topics` · `/tools` ·
`/uyelik`) ve elle güncellenen tek sayı yok.

---

## Kullanıcı kararı bekleyen açık maddeler

Hepsi ölçüldü, kapsamı yazıldı, **bilerek değiştirilmedi.**

| madde | durum |
|---|---|
| **Türkçe binlik ayırıcı** — `5.000 Ü` → 500 kat düşük protamin dozu | 3 vaka belirsiz DEĞİL (düzeltilebilir), 4.'sü (`1.200`) gerçek belirsizlik; `parseLocaleNumber` 42 aracın ortak sözleşmesi |
| **`asdas` eksi sabit** | ESR varyantı eksi skor üretiyor, iki varyantın bandı 3 vakada ayrışıyor; sabitin kaynağı depoda yazılı değil |
| **`essdai` kutanöz 3. düzey yok** | tavan 120 ↔ yayımlanmış 123; klinik tanım yazmak içerik kararı |
| **`gh-test` BMI eşikleri** | dizi "yaş" diye adlandırılmış, değerler BMI'ye ait; sabit 3 μg/L kullanılıyor |
| **`fibromiyalji` üçüncü tanı dalı** | ACR 2016'da YOK; WPI 0 + SS 11 tanı alıyor |
| **`gout-acr` atak ekseni** | özellik sayısı ↔ atak sayısı; tavan 24 ↔ 23 |
| **`lawton-iadl` erkek varyantı** | 1969 puanlaması erkekte 5 madde; araç herkese 8 |
| **kilo makullük sınırı** | 18 araç iki kovada (1–400 ↔ 20–300) — çocuk kapsamı kararı |
| **içerik kazaları** | `hiperkalsemi-ve-hiperparatiroidi.json` baştan sona asit-baz, `akut-lenfoblastik-losemi-all.json` MDS; `behcet-vaskuler-tutulum` %31 kopya bölüm |
| **premium `istatistikler` alanı** | ölü ve 5 dosyada çoktan sapmış |
| **`seeds.ts`** | committe bozuk (bütün iki nokta, eğik ve tırnaklar silinmiş); onarmak veritabanına YAZAN betiği diriltmek olur |
| **`server/`** | tsconfig yok, eslint yalnız `.js` — hiçbir kapı görmüyor |
| **güvenlik başlıkları** | CSP/XFO/nosniff yok; XFO eklemek deponun kendi iframe ölçüm yöntemini kırar |
| **parola kurtarma** | akış YOK (yanlış vaat de yok) |
| **`/tools` hub tekrarı** | 18 kategori çipi + 18 akordeon başlığı (mobilde çipler kaldırıldı, masaüstünde duruyor) |
| **masaüstü satır uzunluğu** | okuma alanı 1280px'te 99 karakter (rahat aralık 45–75) |

---

## Kapsam boşlukları — "temiz" DENMİYOR

| eksen | ölçülmeyen |
|---|---|
| sonuç duyurusu | 136 aracın 31'inde yok; 27'si sayı basıyor (doğru), 4'ü kayıtlı tasarım kararı |
| grup semantiği | 35 araçta `role="group"` yok (adları sayfa içinde benzersiz) |
| `h2` yapısı | 120 araçta yalnızca kardeş bloğundan geliyor |
| süsleme glifi | araç dışında 14 öge insan kararı bekliyor |
| `truncate` | premium 4 kullanım ölçülmedi |
| vaka adımı vurgulanabilirliği | önkoşul kararlı kimlik; bugünkü `adim-1` KONUMSAL |
| `study-backup` | 14 korumasız `localStorage` çağrısı (kullanıcı eylemi) |
| birim ilanı | **KAPANDI** — aşağıya bak |

---

## Birim ilanı — ÖLÇÜLDÜ, sınıf kapalı (5 Eylül 2026)

Sayısal girdisi olan **60 araç / 172 girdi** tarandı (kaynaktaki 104
`inputMode` yazımı döngüde 172 girdiye açılıyor — kapsamı SAY).

| ölçüt | önce | sonra |
|---|---|---|
| birim erişilebilir ADDA | 109 | 110 |
| birim `aria-describedby` ile duyuruluyor | 40 | **44** |
| **görünür ama duyurulmuyor** (kusur) | **4** | **0** |
| birimsiz (pH · FiO₂ · NRS · eklem sayısı · INR · GKS · VAS) | 18 | 18 — meşru |

Düzeltilen dördü: `fomepizol` · `nac-infuzyon` (kg span'inde `id` yoktu),
`unit-converter` ×2 (**birim analite göre değişiyor**, etiket sabit "Geleneksel
birim" diyordu — kreatinin mg/dL↔µmol/L canlıda doğrulandı), `acth-stim` ×3
(μg/dL grup başlığındaydı, girdilere bağlı değildi).

**Ölçüt üç kez yanlış pozitif verdi, üçü de kayıtlı tuzak:** `\b%\b` (yüzde
sözcük karakteri değil) · `Ağırlıkkg`/`Boycm`/`UltrafiltrasyonLitre` (React
metin birleşmesi) · `\bÜ\b` ve çıplak `dk` (**JS `\b` ASCII'ye göre çalışıyor**,
`Ü` sınırı delmiyor). Beklenti tutmayınca önce ölçüt sınandı — yoksa dört
sağlam araç "kusurlu" diye değiştirilecekti.

Kalan: kapsam **açık taraftaki 60 araç**; premium yüzeylerde sayısal girdi
taranmadı.
