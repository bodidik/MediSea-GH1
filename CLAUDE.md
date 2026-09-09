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
diyordu. YANLIŞTI. `.github/workflows/ci.yml`in Web işi bugün **yirmi bir adım**
çalıştırıyor: üçü kurulum (checkout · setup-node · npm ci), **on sekizi kapı**.
Sıra şu ve `build` EN SONDA:

```
npm ci → lint → typecheck
  → link-denetim → soru-denetim
  → arac-metadata --kontrol → baslik-index --kontrol → ilgili-index --kontrol
  → arac-konu-index --kontrol
  → arayuz-denetim (+ --negatif)
  → ic-bilesen-denetim (+ --negatif)
  → saydamlik-denetim --kapi (+ --negatif)
  → renk-cifti-denetim --kapi (+ --negatif)
  → yorum-korlugu-denetim
  → build
```

**BU SAYIYI OKUMA, SAYDIR** — liste bir kez 15 yazıyordu, gerçek 17'ydi;
sonra `arac-konu-index` eklendi ve fark CI'ı kırmızıya düşürdü:

```bash
grep -c '^        - name:' .github/workflows/ci.yml   # Web + Server işleri
sed -n '/name: Web/,/name: Server/p' .github/workflows/ci.yml | grep '- name:'
```

Bedeli ölçüldü: `ilgili-index --kontrol` düştüğü için **97 koşum boyunca
(1,5 gün) CI kırmızıydı** ve build CI'da hiç çalışmadı — ama her turda
"dört kapı geçti" raporlanıyordu, çünkü yerelde yalnızca üç adım
sürülüyordu. **Kapı senin çalıştırdığın komut değil, CI'ın çalıştırdığı
komuttur.**

Yerelde HEPSİNİ sürmenin yolu (`npm ci` BİLEREK yok — çalışan ortamı bozar):

```bash
cd web
for k in link-denetim.cjs soru-denetim.cjs          "arac-metadata.cjs --kontrol" "baslik-index.cjs --kontrol"          "ilgili-index.cjs --kontrol" "arac-konu-index.cjs --kontrol"          arayuz-denetim.cjs "arayuz-denetim.cjs --negatif"          ic-bilesen-denetim.cjs "ic-bilesen-denetim.cjs --negatif"          "saydamlik-denetim.cjs --kapi" "saydamlik-denetim.cjs --negatif"          "renk-cifti-denetim.cjs --kapi" "renk-cifti-denetim.cjs --negatif"          yorum-korlugu-denetim.cjs; do
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
(`pearl:<id>`), soru çözüm açıklaması (`soru:<set>:<id>`), vaka adımı
(`vaka:adim-<n>:klinik` ve `vaka:adim-<n>:aciklama`).

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
node scripts/arac-konu-index.cjs # yeni konu VEYA araç eklendiğinde (araç↔konu bağları)
                                 # sonra arac-metadata.cjs — araç layout'u bu indeksi basıyor
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
arac-konu-index --kontrol
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

## Güncel durum (6 Eylül 2026 ölçümü)

Sayılar **canlı yüzeylerden** okundu (uygulamanın kendi sayacı sürüldü),
belgeden kopyalanmadı.

| büyüklük | değer | önceki (5 Eyl) |
|---|---|---|
| branş · açık konu | 13 · **430** | 423 |
| klinik araç | **136** | 136 |
| premium başlık · soru | **51** · **568** | 44 · 454 |
| premium kart · vaka · inci | 1492 · 11 · **13** | 1492 · 11 · (yok) |
| araç ↔ konu bağı | **112 çift** · 95 konu · 31 araç | (yok) |
| CI | Web işi **21 adım** (18 kapı), son koşumlar yeşil | 21 / 18 |
| duyurusu olan araç | `SonucDuyuru` **108 / 136**; herhangi bir canlı bölge **128 / 136** (9 Eyl) | 105 |

`arac-konu-index` 476 konu dosyası sayıyor, yüzeyler 430 diyor — fark
**gizli konular**; sayaç onları bilerek elemiyor. İki sayı çelişmiyor.

**Dört yüzey birbirini tutuyor** (ana sayfa · `/topics` · `/tools` ·
`/uyelik`) ve elle güncellenen tek sayı yok.

---

## Kullanıcı kararı bekleyen açık maddeler

Hepsi ölçüldü, kapsamı yazıldı, **bilerek değiştirilmedi.**

| madde | durum |
|---|---|
| **Türkçe binlik ayırıcı** | **KAPANDI** (9 Eyl) — düzeltilebilir üçü ayrıştırıcıda çözülmüş, gerçek belirsizlik artık SESSİZ DEĞİL: 9 araçta uyarı çıkıyor. Aşağıya bak |
| **`asdas` eksi sabit** | ESR varyantı eksi skor üretiyor, iki varyantın bandı 3 vakada ayrışıyor; sabitin kaynağı depoda yazılı değil |
| **`essdai` kutanöz 3. düzey yok** | tavan 120 ↔ yayımlanmış 123; klinik tanım yazmak içerik kararı |
| **`gh-test` BMI eşikleri** | **KAPANDI** — 8 Eyl'de `7f352969` ile: `BMI_OPTS` seçicisi eklendi, eşik ona bağlandı (`BMI<25` 11,5 · `25–30` 8 · `>30` 4). Satır bayattı |
| **`fibromiyalji` üçüncü tanı dalı** | ACR 2016'da YOK; WPI 0 + SS 11 tanı alıyor |
| **`gout-acr` atak ekseni** | özellik sayısı ↔ atak sayısı; tavan 24 ↔ 23 |
| **`lawton-iadl` erkek varyantı** | 1969 puanlaması erkekte 5 madde; araç herkese 8 |
| **kilo makullük sınırı** | **KAPANDI** (9 Eyl) — kullanıcı kararı: hepsi **20–300**. 20 araç tek kaynakta (`KILO_ALT`/`KILO_UST`), arayüzdeki aralık metinleri de oradan türüyor. Aşağıya bak |
| **içerik kazaları** | **KAPSAM ÇIKARILDI** (9 Eyl) — üç değil **DÖRT** kaza; 4. (artık `.txt`) SİLİNDİ, kalan üçü yazım kararı. Aşağıya bak |
| **premium `istatistikler` alanı** | **TİPTEN ÇIKARILDI** (9 Eyl) — ölü; sapma 5 değil **7** ölçüldü. İçerik dosyalarına dokunulmadı, aşağıya bak |
| **`seeds.ts`** | **KAPANDI** (9 Eyl) — kullanıcı kararıyla silindi; ölü `.ts` maddesine bak |
| **`server/` kapı kapsamı** | **KAPANDI** (9 Eyl) — satır yanlıştı: CI zaten `lint` + `test` sürüyor (eslint temiz · **85 test**). Kapının görmediği 4 ölü `.ts` silindi, `server/`de artık `.ts` YOK |
| **güvenlik başlıkları** | **KISMEN KAPANDI** (9 Eyl) — dört güvenli başlık kondu, `X-Powered-By` kaldırıldı. CSP ve XFO bilerek DIŞARIDA, aşağıya bak |
| **parola kurtarma** | akış YOK (yanlış vaat de yok) |
| **`/tools` hub tekrarı** | **KAPANDI** (9 Eyl) — kullanıcı kararı: çip eşiği `md:` → `lg:`. 768px'te sayfa **12498 → 1978px**, çip duvarı yerine 18 kategorilik katlanmış dizin. Aşağıya bak |
| **masaüstü satır uzunluğu** | **KAPANDI** (6 Eylül 2026) — 99 → **70 karakter**, aşağıya bak |

---

## Kapsam boşlukları — "temiz" DENMİYOR

| eksen | ölçülmeyen |
|---|---|
| sonuç duyurusu | **KAPANDI** (9 Eyl) — `SonucDuyuru` bağlı olmayan 28 aracın 20'sinde kendi canlı bölgesi var, kalan 8'i SAYI basıyor (kayıtlı karar). Bant basıp hiçbir şey duyurmayan 3 araç bulundu ve bağlandı; aşağıya bak |
| grup semantiği | 35 araçta `role="group"` yok (adları sayfa içinde benzersiz) |
| `h2` yapısı | **ÖLÇÜLDÜ, temiz** — 136 araç / 435 başlık, dört ölçütte de 0; aşağıya bak |
| süsleme glifi | araç dışında 14 öge insan kararı bekliyor |
| `truncate` | **ÖLÇÜLDÜ** — aşağıya bak |
| vaka adımı vurgulanabilirliği | **KAPANDI** (9 Eyl) — kimlik adım verisinden (`adim.adim`), aşağıya bak |
| `study-backup` | 14 korumasız `localStorage` çağrısı — **ölçüldü, bilerek bırakıldı** (kullanıcı eylemiyle çalışıyor, depo engelli uyarısı zaten üstünde; gerekçe arşivde) |
| birim ilanı | **KAPANDI** — aşağıya bak |

---

## Kapanan sınıflar — ayrıntısı arşivde

Ölçüm tabloları `CLAUDE-arsiv.md`de ("CLAUDE.md'den taşınanlar" başlığı
altında). Buradaki tek satır **verdikt**; sayı ya da yöntem gerekiyorsa
arşivi aç.

| sınıf | verdikt |
|---|---|
| **birim ilanı** (5 Eyl) | 60 araç / 172 girdi; görünür ama duyurulmayan **4 → 0**. Ölçüt üç kez yanlış pozitif verdi (`\b%\b` · React metin birleşmesi · ASCII `\b` ile `Ü`/`dk`). |
| **`truncate` premiumda** (5 Eyl) | 3 kullanım; pano kartında 320px'te kaybolan soru sayısı düzeltildi, liderlikte kimlik kaybı YOK. Kırpma bir GENİŞLİK varsayımıdır — eşiği `measureText` ile hesapla. |
| **AI taslak uyarısı** (6 Eyl) | 73 sayfada cümle yarımdı (*"⚠️ Uyarı: MediSea"*); kısa metinle tamamlandı, kesik **73 → 0**. Yazarın 4 dosyası iki ayrı biçimde duruyor — birleştirme metin kararı. |
| **inci erişilebilirliği** (6 Eyl) | `pearls` **0 dosya / 0 inci → 2 / 13**, yetim 0. İki ad sapması düzeltildi. Kapı arkasını ölçemediğin yerde MEKANİZMAYI ölç (`envanterAl`). |
| **araç başlık hiyerarşisi** (6 Eyl) | 136 araç / 435 başlık; `h1` yok · çift `h1` · seviye atlama · boş başlık — dördü de **0**. Beş tohumla negatif kontrol geçti. |

---

## `benzer-govde`: aynı konu iki kez yayında — KARAR BEKLİYOR

`hematoloji/demir-eksikligi-anemisi` ↔ `hematoloji/demir-eksikligi`: başlık
**birebir aynı** ("Demir Eksikliği Anemisi (DEA)"), 6 bölüm de aynı, fark
tamamen kozmetik (`MCV < 80` ↔ `MCV <80`, bir noktalama). İkisi de yayında,
ikisi de aynı ebeveynin (`mikrositer-anemiler`) altında ve **`order` ikisinde
de 30** — yani ebeveyn sayfası aynı başlıklı iki çocuk listeliyor.
Hangisinin kalacağı ve yönlendirme içerik kararı.

---

**İnci ekseni KAPANDI (6 Eylül 2026).** İkinci yetim de yerine kondu:
`pearls/nefroloji/lupus-nefriti.json` → `pearls/romatoloji/sle.json`
(dosyanın kendi kimliği `pearl-sle-nefrit-001`, hedef konu `romatoloji/sle`
var, çarpışma yok). `romatoloji/sle` inci **0 → 3**.
Denetim: `pearls — erişilebilir 2 dosya / 13 inci · yetim 0`
(oturum başında **0 dosya / 0 inci**).

---

## Kalan yetimler AD sorunu DEĞİL, ŞEMA sorunu (6 Eylül 2026)

"Yeniden adlandır, biter" sanılıyordu. Ölçüldü — üç ayrı şema var ve
motorlar yalnızca birini okuyor:

| dosya | şema | neden yetmez |
|---|---|---|
| `quizzes/hematoloji/aml-quiz-1` (10 soru) | `questions` · `text` · `options[]` · `correctAnswer` · `explanation` (HTML) | motor `sorular` · `metin` · `secenekler{}` · `dogru` okuyor. **Bu tam olarak motoru genişletince HTTP 500 veren dosya** (gerekçe `premium-envanter.ts`te) |
| `questions/` 12 dosya | `question` · `options` · `answer` · `explanation` — **üçüncü şema**, her dosya TEK soru | motor tek dosyada `sorular[]` istiyor |
| `flashcards/nefroloji/hiperf-kbh` (70 kart) | doğru şema | hedef `kbh-hiperfosfatemi` VAR ve **69 ön yüzün yalnızca 14'ü ortak** — ayrı iki set |
| `flashcards/endokrinoloji/akromegali` (79 kart) | doğru şema | hiçbir slug altında `akromegali` konusu YOK |

Üç ek kısıt ölçüldü: (1) envanter yalnızca `<konu>-quiz-1` okuyor, **ikinci
quiz seti diye bir şey yok** — 10+9 soru tek dosyada birleşmeli; (2)
`aciklama_detay` `kalinIsle` ile **metin** basılıyor, HTML yığını olduğu gibi
konursa etiketler ekranda görünür; (3) şık açıklamaları yetim şemada yapısal
değil, tek HTML dizesine gömülü — `secenekAciklamalari`ye ayırmak metni
bölmek demek. Motor üç alanı da `&&` ile koruyor, yani çökme yok.

Ayrıca: yetim quiz'e bağlantı VAR ama **ölü kodda** —
`_hematoloji/aml/page.tsx` (alt çizgili klasör Next.js'te rota değil).

**Karar içerik sahibinin:** birleştirme sırası, hangi setin kalacağı ve
şık açıklamalarının bölünmesi tıbbi metin işi.

---

---

## Araç ↔ konu bağları — huninin iki yönü (6 Eylül 2026)

Amaç: aracı arama motorundan bulan kişi açık konulara, konuyu okuyan kişi
hesaplayıcıya ulaşsın. Önce ölçüldü — **bugün iki yön de yoktu**: araç
sayfası yalnızca BRANŞ sayfasına bağlanıyordu (`/topics/kardiyoloji`),
konu sayfası hiç araç önermiyordu.

Bağ elle yazılmaz: `scripts/arac-konu-index.cjs` konu metninde aracın adını
arar. `--kontrol` ve `--kok` var, **CI'a kapı olarak eklendi** (dördüncü
elle üretilen indeks).

| ölçüt | değer |
|---|---|
| bağ · araç önerilen konu · konusu olan araç | **105 · 88 · 29** (6 Eyl 2026) |
| araç sayfasında | "Bu aracın geçtiği konular" (`arac-metadata.cjs` basıyor, 136 layout) |
| konu sayfasında | "İlgili Hesaplayıcılar" |

**Ölçüt DÖRT kez yanlış pozitif verdi:**

| tuzak | örnek | çare |
|---|---|---|
| Türkçe kelime çakışması | `ESAS` aracı **"esas"** kelimesiyle 10 sahte konuda | kısa BÜYÜK harf takma ad küçük/büyük **duyarlı** aranır |
| parantez içi kısaltma | `(PPI)` proton pompa inhibitörü, `(DVT)` hastalığın kendisi | parantezin **içi** takma ad sayılmaz, yalnızca önü |
| üç harfli kısaltma | `CAT` → kansere bağlı tromboz | 4 harften kısa büyük-harf takma ad elenir |
| **bileşik özel ad** | `AF-TIMI 48` · `FINE-HEART` · `EGFR-mutant` · `m7-FLIPI` | tire ile alfanümerik komşuya bağlı geçiş sayılmaz (`serbestGecisVarMi`) |

**Nadirlik ayraç DEĞİL — denendi, çürütüldü.** `Anafilaksi` 9 konuda ve
DOĞRU, `PPI` 10 konuda ve YANLIŞ. Ayraç sıklık değil, takma adın KAYNAĞI.
(`ilgili-index` nadirlikle çalışıyor; aynı ilke buraya taşınmıyor.)

**Dördüncü tuzak neden ilk üçüne takılmadı (6 Eylül 2026):** TIMI · HEART ·
FLIPI · eGFR **dörder harf**, üç harf eleyicisi tutmuyor. Eşiği dörde
çıkarmak SOFA · PERC · FOUR · RASS · GNRI · ESAS gibi meşru araçları da
elerdi — yapılmadı. En ağırı `eGFR`: takma ad tamamı büyük harf olmadığı
için küçük/büyük **duyarsız** aranıyor, o yüzden onkogen `EGFR` ile eşleşti
ve bir akciğer kanseri özetine böbrek hesaplayıcısı bağlandı. Çare dar:
aynı takma ad metinde başka yerde SERBEST geçiyorsa bağ yine kurulur.

Ölçüm: gerçek ağaçta bağ **109 → 105** (tam da o dördü); `chase-less-skoru`
iki doğru bağını koruyor, `heart` 0'a düştü çünkü tek bağı zaten sahteydi.

**TOHUM TUZAĞI — üç negatif kontrol de yanlışlıkla DÜŞTÜ.** Tohum konularını
`"Bileşik TIMI"` diye adlandırmıştım; `govde` başlığı da içerdiği için
serbest geçiş **başlıktan sızıyordu**. Kusur kodda değil tohumdaydı.
**Tohumun kendi adı ölçülen dizeyi TAŞIMAMALI** — bu, `study-backup`
ölçümündeki uydurma `sure` alanıyla aynı sınıf.

Doğrulama üretim derlemesinin HTML'inden yapıldı — dev sunucusu başka bir
oturuma aitti. Pozitif: `/tools/chads-vasc`te blok ve
`/topics/hematoloji/antikoagulasyon-stratejileri` bağı var; konu sayfasında
`chads-vasc` + `khorana`. **Negatif: eşleşmesi olmayan `bmi` ve `addison`
sayfalarında blok hiç çizilmiyor.**

Kapsam sınırı: bileşik adlı araçlar eşleşmiyor (`BMI & İdeal Vücut Ağırlığı`
gibi) — kesinliği geri vermemek için genişletilmedi.

**Yeni kapı ilk koşumunda iş gördü:** içerik dalından gelen
`hematoloji/inme-sonrasi-gizli-af` konusu indeksi bayatlatmıştı, `--kontrol`
düştü ve hangi konunun eksik olduğunu yazdı.

---

## Okuma satırı 70 karakterde sabitlendi (6 Eylül 2026)

Üç adımda, her adım ölçülerek. Kullanıcı "%80 görünüm" istedi; birebir
uygulanamadı — 16px'in %80'i 12.8px ve okuma alanının **14px tabanının**
altında kalıyor.

| adım | 1280px | 1440px |
|---|---|---|
| başlangıç (16px · 12'de 8) | 93 karakter | — |
| gövde 14px (`min-width:641px`) | 107 | 105 |
| sütun 12'de 7 | 91 | 105 |
| **üst genişlik `sm:max-w-[35rem]`** | **70** | **70** |

1920/1440/1280/768'de birebir 70; 640'ta 65 (16px); telefonda üst sınır
ısırmıyor (40 karakter, 16px — mobil hiç değişmedi).

**`ch` İKİ AYRI ŞEKİLDE YANILTTI — bu yüzden kullanılmadı:**

1. `ch` "0" karakterinin genişliği; Türkçe düz metnin ortalama karakteri
   ondan DAR. Ölçüldü (14px): 1ch = 8.8px, ortalama karakter = 6.6px →
   `70ch` **93 karakter** veriyordu.
2. `ch` YAZI BOYUTUNA bağlı. Kısıt karttan sütuna taşınınca `ch` sütunun
   16px'iyle hesaplandı (kartın 14px'iyle değil), satır 69 → 79 çıktı.

Değer bu yüzden sabit: 70 × 6.6 = 462px metin + 96px dolgu ≈ **35rem**.
`box-sizing: border-box` dolguyu da kapsıyor.

**Üst genişlik KARTTA DEĞİL SÜTUNDA:** yalnızca okuma kartına verilince
kart, aynı sütundaki kardeşlerinden ("Alt Başlıklar", "Bu Sayfada") dar
kalıyor ve kenarlar hizalanmıyordu.

**Kırılma `sm:` (640px) — yazı kuralıyla AYNI nokta.** Bir tur `lg:`
denendi: 768px tablette yazı zaten 14px'e inmişti ama üst genişlik devrede
değildi, satır **94 karakter** çıkıyordu (küçük yazı + uzun satır). İkisi
ayrışırsa kusur geri gelir.

---

## Kendi eklediğim blokları sınamak — biri düştü (6 Eylül 2026)

"Yeni yüzey" kuralı kendi işime de uygulandı. İki blok: konu sayfasındaki
"İlgili Hesaplayıcılar", araç sayfasındaki "Bu aracın geçtiği konular".

| ölçüt | konu bloğu | araç bloğu |
|---|---|---|
| dokunma hedefi | **30px → 42px** (kardeşler 43/40) | 42–62px |
| kontrast | 10.35 | 7.58 |
| başlık · hiyerarşi | `h2` | `h2` · tek `h1`, atlama yok |
| aynı ad / farklı hedef | yok | yok |

**İLK ÖLÇÜM BAŞTAN SONA ÇÖPTÜ — `innerWidth: 0`.** Bütün genişlikler 0
çıktı, bağlantılar "tıklanamaz" göründü. Beni yanlış sonuçtan kurtaran şey
kusurun TEKİLLİĞİNİ sınamak oldu: **kardeş bloklar da 0 çıkıyordu**, yani
sorun bloğumda değil ölçümdeydi. Betiğe `if (!innerWidth) throw` kondu.

Yan bulgu, benim değil: mevcut "İleri Okuma" bloğunda bir bağlantı 30px —
asgariyi (24) geçtiği için dokunulmadı.

---

## `egfr` sayfasındaki sekiz konunun sekizi de endokrinolojiydi (6 Eylül 2026)

Bağlar tek sayfada ölçülmüştü; bütün indeks tarandı. İlk iki eksen temiz:
ölü bağlantı 0/31 araç ve 0/95 konu; aynı ad/farklı hedef yok — üstelik
**hiçbir konu gövdesi `/tools/` bağlantısı içermiyor**, yani bu blok
konudan hesaplayıcıya giden TEK yol.

Üçüncü eksende kusur vardı: `egfr` 28 konuda geçiyor, altı branşa yayılmış
(nefroloji 10 · endokrinoloji 8 · kardiyoloji 5 · journal-club 2 ·
onkoloji 2 · klinik-nutrisyon 1). Eşleşen takma ad hepsinde aynı (`eGFR`)
olduğu için sıralama eşitti ve eşitliği **alfabetik yol sırası** bozuyordu:
gösterilen 8 konunun hepsi endokrinolojiydi, en ilgili branş nefroloji
hiç görünmüyordu.

Çare: araç tarafındaki kırpma branşlar arasında **sırayla** (round-robin).
Rastgelelik YOK — `--kontrol` kararlı kalmalı. Sonuç `{nefroloji 2,
endokrinoloji 2, kardiyoloji 1, journal-club 1, onkoloji 1,
klinik-nutrisyon 1}`; konu tarafı değişmedi (112 çift / 95 konu).

**Kusur olmayan sınır:** 112 çiftin 89'u geri bağlanıyor, 23'ü tek yönlü —
doğrudan araç başına 8'lik kapaktan. Ters yönde tek yönlü çift 0.

---

## Huninin ÜÇÜNCÜ yüzeyi: site içi arama (6 Eylül 2026)

Konu ↔ araç bağlıydı ama arama kutusu bu bağı kullanmıyordu.

| sorgu | önce | sonra |
|---|---|---|
| atriyal fibrilasyon | 4 sonuç · **araç 0** | 7 · **3** (`chads-vasc`, `khorana`, `nihss`) |
| kalp yetmezliği | 6 · **0** | 8 · **2** (`child-pugh`, `egfr`) |
| **addison** (negatif) | 5 · 0 | **5 · 0** — bağlı aracı yok, uydurulmadı |

Sebep: AF'nin hesaplayıcısı CHA₂DS₂-VASc ama aracın adı da açıklaması da
("AF'de inme riski") hastalığın TAM ADINI taşımıyor. Çare eşanlamlı listesi
DEĞİL — bağ zaten türetilmiş (`arac-konu.json`); sorgu bir konuyu tutuyorsa
o konunun araçları da sonuca giriyor, listenin en sonunda (dolaylı eşleşme).

**ÖLÇÜM YÖNTEMİ ÜÇ KEZ YANILTTI, üçü de kayıtlı tuzak:** `.value` setter +
`input` olayıyla programatik sürüş İKİ FARKLI yanlış cevap üretti (önce
bayat sonuçlar, sonra 0) — panel odak istiyor; sabit bekleme bayat DOM
okuttu ("atriyal fibrilasyon" sorgusuna malnütrisyon sonuçları döndü);
`innerWidth: 0` bir tur tıklamayı reddettirdi. İlk 8 sorguluk tablo atıldı.
**Uygulamayı kullanıcının yaptığı gibi sür: tıkla, seç, yaz.**

---

## Okuma satırı — ALTI yüzeyin altısı da ölçüldü (6–7 Eylül 2026)

Rahat aralık 45–75. Yüzeyler tek tek ölçüldü; **tek yüzeyde alınan sonuç
kardeşine taşınmıyor** — bu oturumda üç kez böyle yanıldım.

| yüzey | önce | sonra | kaldıraç |
|---|---|---|---|
| açık konu | 93 → 107 | **70** | 14px · sütun 12'de 7 · `sm:max-w-[35rem]` |
| premium konu — düz metin | 145 | **67** | paragrafa `29rem` |
| premium konu — bilgi kutusu | 136 | 65–74 | KUTUYA `31rem` |
| inciler | 119–121 | **71** | `max-w-none` → `sm:max-w-[31rem]` |
| soru çözüm | 104 | **72** | okuma kabına `32rem` |
| vaka çözüm | 99–109 | **73** | üç metin KUTUSUNA `32rem` |
| hızlı tekrar kartı | 77 | **77 — DEĞİŞTİRİLMEDİ** | aşağıya bak |
| premium tablolar | 966px | **966px — dokunulmadı** | — |

**Kart neden değiştirilmedi:** 3282 kart yüzü ölçüldü — ortalama 67
karakter, medyan 71, en uzun 167. %58'i TEK satır, %42'si iki satıra
taşıyor, yalnızca **8'i** üç satıra çıkıyor. Buradaki 77, öteki
yüzeylerdeki 100–145 karakterlik SÜREKLİ metinle aynı kusur değil;
daraltmak iki satırlık kartların bir kısmını üçe çıkarırdı. Ölçüldü,
gerekçesi yazıldı, bırakıldı.

**Altı farklı değer, hepsi ölçümden** — her yüzeyde dolgu ve yazı farklı.
`ch` hiçbirinde kullanılmadı (iki kez yanılttı; `prose`un `65ch`i de bu
yüzden açılmadı). Kırılma hepsinde `sm:` — 14px kuralıyla aynı nokta;
`lg:` denendi ve 768px'te satır 94 çıktı.

**Sınır KABA mı KUTUYA mı?** Aynı kapta kontrol (şık düğmesi) ya da tablo
varsa kaba verilmez: premium konuda 200 tablo, vaka ve quizde şık
düğmeleri var. Oralarda sınır metin kutusuna verilir.

**İki kendi kusurum:** (1) 14px kuralım katmansızdı ve incilerin
`text-[15px]`ini eziyordu → `@layer base`; ancak kardeş yüzey ölçülünce
görüldü. (2) Geçici ölçüm rotasını silmek `.next/types` artığı bırakıyor
ve `typecheck` düşüyor; silmeyi derleme sürerken yapınca derleme de düştü.

**Kapı arkasını ölçmenin yolu:** geçici ölçüm rotası (`app/olcum-gecici`),
bitince rota + `.next` artıkları silinir. **Kapıyı dizeyle arama** — bu
kapı "Erişim Kısıtlı" diyor; ayırt edici işaret beklenen içeriğin
yokluğuydu (`data-readable` 0).

**Sürüş yöntemi yüzeye göre değişiyor:** arama kutusunda programatik
sürüş iki farklı yanlış cevap verdi, gerçek tuş vuruşu gerekti; quiz ve
vaka düğmelerinde tersi — sentetik fare tıklaması cevap üretmedi,
`.click()` üretti. Tek bir doğru yöntem yok, ikisini de dene.

Ayrıntılı tablolar ve ölçüm yöntemi arşivde.

---

## Bant basıp duyurmayan üç araç (9 Eylül 2026)

`SonucDuyuru` 105 araca bağlıydı; belge kalan 31'i "sayı basıyor, doğru"
diye kaydetmişti. **Sayıldı, doğru değildi:** 31'in 20'sinde zaten kendi
canlı bölgesi vardı (infüzyon aileleri), kalan 11'in **üçü kategorik BANT
basıyordu** ve hiçbir şey duyurmuyordu — `asdas` · `ogtt` · `rockall`.
Sekizi (`bsa` `digoksin-toksisitesi` `infusion` `meld-na` `nutrition-needs`
`sofa` `spot-urine` `steroid-dose`) gerçekten sayı basıyor; kayıtlı karar
onlarda geçerli.

Duyuru metni panelin OKUDUĞU fonksiyondan geliyor, kopyalanmıyor: `ogtt`in
üç yorumu (`dmYorum` · `gdmYorum` · `acroYorum`) modül düzeyine alındı.
`asdas` iki varyantı da duyuruyor — belgede kayıtlı ayrışma aksi hâlde
ekran okuyucudan gizlenirdi.

| senaryo | duyuru | panel |
|---|---|---|
| rockall boş → tüm şıklar en yüksek | DÜŞÜK → **ÇOK YÜKSEK** | aynı |
| asdas boş (negatif kontrol) | **""**, şerit yok | panel "Eksik veri" |
| asdas ayrışan (2,1,2,1 · CRP 2 · ESR 20) | CRP İNAKTİF · **ESR ORTA** | aynı |
| ogtt dm boş / 210-260 / 95-120 | "" / DİYABET MELLİTUS / NORMAL | aynı |
| ogtt gdm ayrışan (93·170·150·130) | IADPSG tanı · **CC yok** | aynı |
| ogtt akro nadir **0** (meşru sıfır) | "süpresyon yeterli" | aynı |
| ogtt akro "abc" (çöp) | **""** | panel çizilmiyor |

Ölçüm ortamında `innerWidth: 0` olduğu için ŞERİDİN görünürlüğü hakkında
iddia yok — ölçülen yalnızca duyuru metni ile panel metninin aynı olması.

---

## Vaka adımı vurgulanabilir oldu (9 Eylül 2026)

Açık maddede "önkoşul kararlı kimlik" yazıyordu. Kimlik adayları **sayıldı**
(11 dosya · 35 adım):

| aday | durum | karar |
|---|---|---|
| `veri.id` | 1 dosyada YOK, 8'inde dosya adıyla ayrışıyor | kullanılmadı — vaka kimliği zaten SORGUDA (`sayfaKimligi` anahtara katıyor) |
| `adim.baslik` | **35 adımın 17'sinde BOŞ** | kimlik olamaz |
| `adim.adim` | 35/35 var, dosya içinde tekrarsız | **seçildi** |

İki konteyner: `vaka:adim-<n>:klinik` ve `vaka:adim-<n>:aciklama`. Açıklama
sınırı DIŞ kutuya değil İÇ kutuya verildi — dış kutunun başlığı kullanıcının
CEVABINA göre değişiyor ("Doğru!" ↔ "Yanlış — Doğru cevap: C"), ofsetler aynı
adımda iki farklı değer alırdı.

Canlıda sürüldü (kapı arkası olduğu için geçici ölçüm rotası `(ydus)` grubuna
kondu — grup dışına konulunca `ReadingTools` HİÇ monte olmuyor ve ölçüm
sessizce boş çıkıyor; rota ve `.next` artıkları silindi):

| ölçüt | sonuç |
|---|---|
| adım 1'de gerçek vurgu (araç çubuğu, "Sarı") | kayıt `k: "vaka:adim-1:klinik"`, `<mark>` boyandı |
| adım 2'ye geç | kayıt **1 (silinmedi)**, boyalı **0** — belgedeki kural aynen |
| sayfayı yenile (adım 1) | **yeniden boyandı** |
| **negatif kontrol — konumsal kimlikle (`k:"0"`, konteyner kimliksiz)** | adım 2'ye geçince kayıt **1 → 0**, depo anahtarı **silindi** |

Negatif kontrolün ilk denemesi YANILTTI: kaydın `k`'sini "0" yapmak yetmiyor,
çünkü konteyner hâlâ kimlikli olduğundan eşleşme "konteyner yok" dalına
düşüyor ve kural silmiyor. Eski davranışı görmek için **konteynerin
özniteliğini de değersiz bırakmak** gerekti.

**Yan bulgu, ölçümden çıktı:** ilerleme çubuğu koşulsuz `— {adim.baslik}`
basıyordu; 17 adımda başlık boş olduğu için "Adım 1 / 5 — " diye sarkan bir
ayraç görünüyordu. Koşullu yapıldı (ölçüldü: `men1-sendromu-vaka-1` artık
"Adım 1 / 5").

---

## `server/`in dört `.ts` dosyası: kapı görmüyor çünkü hepsi ÖLÜ (9 Eylül 2026)

Açık madde *"tsconfig yok, eslint yalnız `.js` — hiçbir kapı görmüyor"*
diyordu. **Yarısı yanlıştı.** CI'ın Server işi `npm run lint` ve `npm test`
sürüyor; yerelde ölçüldü: eslint temiz, **85 test geçiyor**. Kapının
görmediği yüzey 129 kaynak dosyanın **4'ü** — ve dördü de erişilemez:

| dosya | satır | durum |
|---|---|---|
| `routes/index.ts` | 3 | `router` ne tanımlı ne içe aktarılmış, `export` yok — modül değil, PARÇA. Hiçbir yerden içe aktarılmıyor |
| `routes/userstats.routes.ts` | 6 | yalnızca yukarıdaki parçadan çağrılıyor |
| `controllers/userstats.controller.ts` | 12 | uzantısız `../models/UserStat` içe aktarıyor — ESM'de zaten çözülmez |
| `scripts/seeds.ts` | 26 | committe bozuk; ayrıca `../src/models/…` istiyor, **`server/src` diye bir dizin yok** |

`server.js` 15 rota bağlıyor, `/userstats` bunların arasında **değil**.
Yani `routes/index.ts` çalışan bir rotayı İLAN ediyor ama bağlamıyor —
belgedeki "ilan mı gerçek mi" sınıfı. Node `type: "module"` altında `.ts`
zaten yüklenemiyor; dosyalar hiçbir koşulda çalışmıyor.

**KULLANICI KARARI: dördü de silindi.** Kapı boşluğu böylece kendiliğinden
kapandı — `server/`de artık hiç `.ts` yok, yani eslint'in `--ext` listesi
kaynağın TAMAMINI görüyor. `.ts` için ayrıştırıcı bağımlılığı eklemek
gerekmedi.

Silmeden önce dördü de okundu ve hiçbir yerden içe aktarılmadıkları
`--include=*.js,*.mjs,*.cjs,*.json` taramasıyla doğrulandı (Dockerfile ve
`package.json` betikleri dahil: sıfır referans). Silme sonrası ölçüm:
eslint temiz · **85 test geçiyor** · `node --check server.js` temiz.
Geri gerekirse git geçmişinde duruyor.

Kapatılmayan yarısı: `/userstats` ucu bugün de YOK ve olmadığı bir daha
İLAN edilmiyor. Gerekiyorsa yeni bir uç olarak yazılır.

---

## Ölü `istatistikler` alanı tipten çıkarıldı (9 Eylül 2026)

Alan iki tipte duruyordu ve **hiçbir yerde okunmuyordu** — sayılar
`envanterAl`den geliyor (`.istatistikler` için depo geneli tarama: 0 okuma).
Tipte durması onu "güvenilebilir alan" gibi gösteriyordu; çıkarılınca ona
uzanan her deneme derleme hatası oluyor.

Sapma **uygulamanın kendi `envanterAl`i sürülerek** ölçüldü (geçici rota,
ölçütü yeniden yazmadan). Belgede 5 yazıyordu, gerçek **7**:

| dosya | ilan ≠ gerçek |
|---|---|
| endokrinoloji/graves-hastaligi | soru 10 ≠ **0** |
| endokrinoloji/hashimoto-tiroiditi | soru 7 ≠ 10 |
| gogus-hastaliklari/hkp | soru 10 ≠ 11 |
| hematoloji/aml-ana | soru 24 ≠ **9** · inci 7 ≠ 10 |
| hematoloji/kml | flashcard 12 ≠ **0** · inci 5 ≠ **0** |
| kardiyoloji/hfpef-ileri-degerlendirme | soru 10 ≠ 11 |
| romatoloji/sle | inci 0 ≠ **3** |

51 konu dosyasının **51'i** de bu alanı ilan ediyor. İçerik dosyalarına
DOKUNULMADI: içerik girişi ayrı worktree'de sürüyor, 51 JSON'u buradan
düzenlemek o dalla çakışırdı. Alan okunmadığı için veride kalması zararsız.

`.next/types` artığı yine ısırdı: geçici rota silindikten sonra `tsc`
olmayan modülü arıyor — rotayla birlikte `.next/types/...` karşılığını da
sil.

---

## Belirsiz binlik artık sessiz değil (9 Eylül 2026)

Ayrıştırıcının durumu ölçüldü (uygulamanın kendi `parseLocaleNumber`ı
sürüldü, kopyası yazılmadı):

| girdi | okunan | not |
|---|---|---|
| `5.000` · `10.000` | 5000 · 10000 | B2 dalı — belirsizlik yok |
| `3 000` · `1 200` | 3000 · 1200 | B dalı — boşluk yalnızca grup olabilir |
| `1.200` · `2.500` | **1,2 · 2,5** | GERÇEK belirsizlik, bilerek tahmin edilmiyor |

Yani "düzeltilebilir üç vaka" çoktan kapanmış, belge bayattı. Kalan kusur
tahminde değil **sessizlikte**: bin kat sapabilen bir okuma kullanıcıya
söylenmeden doz hesabına giriyordu.

`binlikBelirsizMi` + `BinlikUyari` eklendi. Ayrıştırıcının davranışı
DEĞİŞMEDİ — 42 aracın sözleşmesi aynen duruyor; uyarı yalnızca okunan
değeri söylüyor ve belirsizliği gidermenin yolunu veriyor
(`1200` ya da `1 200`; ondalık için `1,2`).

**Kapsam ölçütü:** meşru değeri 999'u AŞABİLEN alanlar — makullük kapısı
1000+ kabul eden **9 araç** tarandı ve bağlandı. 0–10 NRS gibi alanlarda
`1.200` zaten makullük kapısına takılıyor, uyarı gürültü olurdu.

Canlı ölçüm (`antikoagulan-geri-dondurme`, heparin alanı):

| girdi | uyarı |
|---|---|
| `1.200` · `2.500` | **çıkıyor**, okunan değeri doğru yazıyor (1,2 · 2,5) |
| boş · `1200` · `1 200` · `5.000` | **çıkmıyor** (dört negatif kontrol) |

Dört ayrı yerleşim şekli canlıda ayrı ayrı sürüldü — `antikoagulan`
(koyu sonuç kartı), `heparin-nomogram`, `infusion` (iki hesaplayıcılı
sayfa, doğru olanına bağlı), `khorana` (`SonucDuyuru` kardeşi).
**`khorana`da duyuru DÜŞÜK → ORTA olarak çalışmayı sürdürüyor**, yani
`SonucDuyuru`nun kardeş sözleşmesi kırılmadı (uyarı ondan ÖNCE duruyor).

Toplu yerleştirme kapılarla doğrulanmaz — bağımsız yerleşim denetimi
sürüldü: 9 aracın 9'unda tek kullanım, tek import, yorumda değil, ve
`ham:` verilen 15 alanın 15'i o dosyada tanımlı `useState`. Kusur 0.

---

## Güvenlik başlıkları: güvenli dördü kondu, CSP/XFO dışarıda (9 Eylül 2026)

Önce ölçüldü — `curl -sI` yanıtta yalnız `Vary`, `Cache-Control` ve
`X-Powered-By: Next.js` gösteriyordu; güvenlik başlığı **sıfır**.

Eklenenler (`next.config.js` → `headers()`), hepsi davranışı değiştirmeyen
cinsten:

| başlık | değer |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` (premium `?id=`/`?branch=` sorguları dışarı sızmasın) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` (yerelde http olduğu için yok sayılır) |

`poweredByHeader: false` de kondu — çerçeveyi ilan etmenin bedava bilgi
olmasından başka bir işlevi yoktu.

Permissions-Policy'nin hiçbir şeyi kırmadığı ÖLÇÜLDÜ, varsayılmadı: depo
genelinde `getUserMedia` · `geolocation` · `payment` çağrısı **0**.

**BİLEREK EKLENMEYENLER:** `X-Frame-Options` / CSP `frame-ancestors` —
bu depo ölçümlerini iframe içinde yapıyor, çerçevelemeyi yasaklamak kendi
doğrulama yöntemini kırardı; ve CSP `script-src` — Next satır içi
önyükleme betiği basıyor, nonce'suz politika ya `unsafe-inline` ile
anlamsız olur ya da sayfayı sessizce kırar.

Ölçüm (dev sunucusu yeniden başlatıldı — `next.config.js` sıcak
yüklenmiyor):

| ölçüt | sonuç |
|---|---|
| dört başlık · dört yüzey (`/tools/bmi` · `/topics/...` · `/tr/premium/ydus` · `/sitemap.xml`) | **16/16 var** |
| `X-Powered-By` | **gitti** |
| negatif kontrol — `X-Frame-Options` / CSP | **0** (iframe ölçümü korunuyor) |
| yönlendirme gerilemesi (blok redirects'in üstüne taşındı) | 4 yönlendirmenin 4'ü **308** ve doğru hedefe |

Not: bu ölçüm dev sunucusundadır. `headers()` yapılandırması üretimde de
aynı yoldan uygulanır ama **canlıda doğrulanmadı** — Vercel'in kendi
eklediği başlıklarla birleşimi ayrı bir ölçümdür.

---

## Kilo sınırı: 20 aracın hepsi 20–300, tek kaynaktan (9 Eylül 2026)

**KAPSAM ÜÇ KEZ BÜYÜDÜ — her turda ölçüt genişledi, tahmin değil.**

| tur | sayı | neyi kaçırmıştım |
|---|---|---|
| belge | 18 araç · 2 kova | — |
| 1. tarama | 15 araç · 3 kova | yalnız `kiloNum >= N` biçimi |
| 2. tarama | 19 araç · 3 kova | `makul(x, A, B)` biçimi (bmi · bmr · gnri · sodium) |
| 3. tarama | **20 araç · 4 kova** | değişkeni `postWt` olan (`ktv`) ve **YEREL SABİT KOPYASI** taşıyan ikisi (`digoksin-toksisitesi` 20–300 · `lipid-emulsiyon` **10–300**) |

Dördüncü kovayı `lipid-emulsiyon` açıyordu: kendi `KILO_ALT = 10` sabitini
tutuyordu — yani kopya yalnız değerde değil, DEĞİŞKEN ADINDA bile aynıydı.
"Kapsamı SAY, tahmin etme" kuralının bu depodaki kaçıncı doğrulaması
olduğunu artık saymıyorum.

**Kullanıcı kararı: hepsi `20–300`.** Gerekçe uydurulmadı, projenin kendi
tanımından geliyor — MediSea "dahiliye asistanları ve uzmanları" için ve
dahiliye erişkin hekimliğidir. Geniş aralık dokuz araçta 3 kg'lık bir
yenidoğana SESSİZCE erişkin dozu üretiyordu; bu araçların hiçbirinde
pediatrik dozlama yok. Alt sınır 20 kaseksik erişkini (25–30 kg) elemiyor.

Tek kaynak `KILO_ALT`/`KILO_UST` + `kiloMakulMu`. **Arayüzdeki aralık
metinleri de aynı sabitlerden türüyor** (8 yerde elle yazılıydı) — ilan ile
gerçek artık birlikte hareket ediyor. Dört bayat yorum da sayıdan
arındırıldı.

Yan düzeltme: eski kapıların çoğu `trim() !== ""` kullanıyordu, çöp girdiyi
geçiriyor ve yalnızca `parseLocaleNumber`ın 0 döndürmesi sayesinde aralığa
takılıyordu — koruma TESADÜFİYDİ.

Canlı ölçüm:

| araç | ölçüm |
|---|---|
| `nac-infuzyon` (eskiden 1–400) | 3 ✗ · 19 ✗ · **20 ✓** · **300 ✓** · 301 ✗ · 400 ✗; ekrandaki metin de "20–300 kg" yazıyor |
| `lipid-emulsiyon` (eskiden 10–300) | 10 ✗ · 19 ✗ · **20 ✓** (30 mL bolus · 240 mL tavan) · **300 ✓** · 301 ✗ |
| `tromboliz-doz` (zaten 20–300) | 19 ✗ · **20 ✓** · **300 ✓** · 301 ✗ — değişmedi |

Ölü değişken taraması: geçişten sonra kullanılmayan `kiloNum`/`weightNum` **0**.
Kapsam denetimi: kilo sınırı taşıyan 20 aracın **20'si** tek kaynakta; kalan
dört "elle" işareti yanlış pozitif (`essdai` kilo KAYBI etiketi, `glim`
fenotip bayrağı, `bmi`/`gnri`de `kiloOk` kullanımı).

---

## İçerik kazaları — kapsam (9 Eylül 2026)

477 dosya tarandı. **İçerik DEĞİŞTİRİLMEDİ** — bu bölüm yalnızca kapsam.

### Ölçütün kendisi bir kez yanılttı

Başlık/slug uyuşmazlığı arayan ilk tarama **28 dosya** işaretledi; okununca
26'sı YANLIŞ POZİTİF çıktı — eşanlamlı ya da açılımlı başlıklar
(`multiple-myelom` → "Multipl Miyelom", `buyuk-damar-vaskulitleri` → "Dev
Hücreli Arterit ve Takayasu"). Gerçek kaza **2**.

İkinci tarama "53 dosyanın gövdesi BOŞ" dedi. Yanlıştı: bölüm metni **iki
şemada** duruyor — `html` (423 dosya · 2332 bölüm) ve `text` (53 dosya ·
120 bölüm). Ölçüt yalnızca `html` okuyordu. İki şemayla yeniden ölçüldü:
**boş gövde 0**. Sayfa da ikisini birden okuyor (`s.text || s.html`), yani
kusur yok — ama bu, belgedeki "0 kusur ile 0 ölçüm aynı görünür" tuzağının
bu depodaki bir kez daha doğrulanmasıydı.

### Dört kaza

**1. `endokrinoloji/hiperkalsemi-ve-hiperparatiroidi.json` — baştan sona asit-baz**

Başlık "Asit-Baz Denge Bozuklukları", 5 bölümün 5'i asit-baz, gövdede
`hiperkalsemi`/`hiperparatiroidi` **hiç geçmiyor**. Etiketler de içeriği
izliyor (`Nefroloji · Asit-Baz Dengesi · Kan Gazı`), yani kaza türetilmiş
indekse de bulaşmış: `ilgili-index`te **5 konuya bağlı, 5 konu da buna
işaret ediyor**. `nefroloji/asit-baz-denge-bozukluklari.json` ile
**başlığı birebir aynı** (gövdeler farklı: 9141 ↔ 5969 karakter, 5 bölümün
3'ü ortak başlıklı) — yani daha DOLU asit-baz yazısı yanlış adreste duruyor.
**Canlıda ölçüldü:** `/topics/endokrinoloji` branş sayfası bunu 2. sırada
"Asit-Baz Denge Bozuklukları" diye listeliyor.

**2. `hematoloji/akut-lenfoblastik-losemi-all.json` — MDS, üstelik ikizi var**

Başlık "Miyelodisplastik Sendromlar (MDS)";
`hematoloji/miyelodisplastik-sendrom-mds.json` ile neredeyse aynı
(3942 ↔ 3954 karakter). ALL'in kendi doğru dosyası **zaten var**
(`hematoloji/all.json`, "Akut Lenfoblastik Lösemi (ALL)", ebeveyn
`losemiler`). İkisi de `hematolojik-maligniteler` çocuğu (order 14 ve 41).
**Canlıda ölçüldü:** ebeveyn sayfası **aynı başlıklı İKİ bağlantı**
gösteriyor, biri `/akut-lenfoblastik-losemi-all` adresine gidiyor —
"aynı ad, farklı hedef" sınıfı.

**3. `romatoloji/behcet-vaskuler-tutulum.json` — %33 kopya bölüm**

`kopya-bolum-denetim` doğruluyor: bölüm 0↔2 ve 1↔3 **başlık VE gövde**
olarak birebir aynı. 6282 karakterin 2100'ü kopya (**%33**; belgede %31
yazıyordu).

**4. `content/canonical/hematoloji/title Foliküler Lenfoma (FL) Patoge.txt`
— SİLİNDİ (9 Eyl, kullanıcı kararı)**

Uzantısı `.json` değil, açılış `{`i yok, kapanışı da bozuk. Dosya adı
içeriğin ilk satırından türemiş. İçeriği silmeden ÖNCE okundu: 10 Mar
tarihli, tek bölümlük bir TASLAK; aynı yazı 11 Mar'da `FL-t1(4-18).json`
olarak 4 bölümle düzgünce yayımlanmış — **kayıp içerik yok**, git
geçmişinde de duruyor.

Silme sonrası ölçüldü: ağaç **477 → 476** dosya, ayrıştırılamayan **0**,
dört üretilmiş indeksin dördü de `--kontrol`den geçiyor (yani artık dosya
hiçbirinde YOKTU — siteye görünmezliği doğrulandı). Negatif kontrol:
`/topics/hematoloji/FL-t1(4-18)` canlıda duruyor, dört bölümü de yerinde
(2125 karakter) — yayımlanan yazıya değil taslağa dokunuldu.

### Etki yarıçapı

| eksen | 1 (hiperkalsemi) | 2 (ALL) |
|---|---|---|
| yayında mı | evet | evet |
| site haritasında | evet (3 kazanın 3'ü de 585 adresin içinde) | evet |
| gövdeden gelen bağlantı | yok | yok |
| `ilgili-index` | 5 çıkan · **5 gelen** | 2 çıkan · 0 gelen |
| `arac-konu` | var | var |
| ebeveyn listesinde | branş sayfasında 2. sırada | **aynı başlıklı ikinci kayıt** |

### Karar sende

Kalan üçü içerik/adres kararı: 1 ve 2 için ya dosya doğru adrese taşınır
(yönlendirme borcu doğar) ya da içerik gerçekten o adresin vaat ettiği
konuyla değiştirilir; 3 için hangi kopyanın kalacağı. Bunlara dokunulmadı.
4. madde kullanıcı kararıyla silindi.

---

## `esik-etiket` denetimi gürültü üretiyordu: 15 bulgunun 15'i yanlış (9 Eylül 2026)

Rapor denetimlerini sürerken çıktı. Denetim gerçek bir kusurdan doğmuştu
(`{ esik: 2, uKg: 25, etiket: "INR < 4" }` — INR 3 olan hastaya %40 fazla
PCC) ama eşik alanı listesine **`puan` ve `skor` da girmişti.**

Bedeli: `{ label: "61–74 yaş", puan: 2 }` gibi ayrık şık kayıtlarında
etiketteki 61/74 ile PUANDAKİ 2 karşılaştırılıyor ve elbette tutmuyordu.
**15 bulgunun 15'i bu şekildendi** — yani denetim karar değil gürültü
üretiyordu ve raporu okuyan kişi gerçek bir kusuru bu yığının içinde
kaçırırdı.

Puan bir SINIR değil, seçeneğin katkısı. Ayrık şık listesinde ölçüt zaten
uygulanamaz: sınırı kullanıcı okuyup şıkkı kendisi seçiyor. Denetimin
doğduğu kusur kodun sayıyı KARŞILAŞTIRDIĞI alanlarda yaşıyor.

| ölçüt | önce | sonra |
|---|---|---|
| ölçülen sınır-iddialı etiket | 21 | **6** |
| bulgu | **15** (15'i yanlış pozitif) | **0** |
| negatif kontrol (gerçek `INR < 4` kusuru) | yakalıyor | **yakalıyor** |
| pozitif kontrol (doğru `INR 4-6` kaydı) | işaretlemiyor | işaretlemiyor |
| **yeni pozitif kontrol** (`{ label: "61–74 yaş", puan: 2 }`) | — | **işaretlemiyor** |
| `--kok` ile boş ağaç | — | 0 dosya · 0 etiket (yönlendirilebilir) |
| `yorum-korlugu` meta testi | 15/15 | **15/15** |

**Sıfır burada körlük DEĞİL:** denetim hâlâ 6 sınır-iddialı etiket ÖLÇÜYOR
ve tohumlanmış gerçek kusuru yakalıyor. Belgedeki "0 kusur ile 0 ölçüm aynı
görünür" tuzağının ayırt edici kontrolü budur.

Yanlış pozitif üreten bir denetim, hiç denetim olmamasından beter: raporu
okumayı bırakırsın. Yeni pozitif kontrol tam da bu şeklin geri sızmasını
nöbetliyor.

---

## Etiket dengesi: 4 bozuk bölümün YALNIZCA BİRİNİN görünür bedeli var (9 Eylül 2026)

`konu-denetim` iki bozuk bölüm bildiriyor ve kendi çıktısında *"görünür
bedeli AYRICA ölçülmeli"* diyor. O adım atıldı.

**Kapsam denetimin bildirdiğinden geniş:** açık konu + premium'un tamamı
tarandı (**611 dosya · 2462 HTML alanı**) ve **4** dengesizlik bulundu —
`konu-denetim` yalnızca satır içi vurgu etiketlerine baktığı için `li` ve
`p` dengesizliklerini görmüyor. Premium tarafı temiz.

Ölçütü yazarken kendi tuzağıma düştüm: kendi kendini kapatan etiket sayacı
`<br/>`yi `<b>` sanıyordu ve *"b açılış **-1**"* gibi eksili sayılar
üretiyordu (65 sahte bulgu). Negatif sayı, ölçütün bozuk olduğunun kendi
imzasıydı.

| dosya · bölüm | dengesizlik | GÖRÜNÜR BEDEL (canlıda ölçüldü) |
|---|---|---|
| `endokrinoloji/gebelik-transient-tirotoksikoz` [0] | çift `<li>` (3↔2) | **VAR** — boş ama GÖRÜNÜR madde imi, 24.75px, üç maddenin 2.'si |
| `hematoloji/miyeloproliferatif` [0] | `strong` 1↔0 | yok — tarayıcı `</p>`de kapatıyor, vurgu tam olarak istenen metinde |
| `hematoloji/esansiyel-trombositoz` [4] | `p` 2↔1 | yok — `<ul>`, HTML5 kuralıyla `<p>`yi zaten kapatıyor (14 paragraf, 0 boş) |
| `endokrinoloji/men1-gastrinoma-zes` [3] | fazladan `</em>` | yok — başıboş kapanış yok sayılıyor, italik tam 13 karakter |

**Düzeltilen tek yer** çift `<li>` (yapısal, tıbbi metne dokunulmadı):
madde 5 → 4, boş im **gitti**, kalan dört metnin uzunlukları birebir aynı
(352 · 531 · 156 · 445) — yani içerik kaybı yok. Kalan üçü ölçüldü,
bedeli olmadığı için **bilerek bırakıldı**; düzeltmek kozmetik olurdu ve
içerik dosyasına gereksiz dokunuş demekti.

Ders: "etiket dengesi bozuk" bir kusur DEĞİL, kusur ADAYIDIR. Tarayıcının
kurtarma kuralları çoğunu görünmez kılıyor; hangisinin gerçek olduğunu
ancak sayfayı çizdirip DOM'u okumak söylüyor.

---

## Bugün eklediğim `BinlikUyari` yüzeyi sınandı (9 Eylül 2026)

"Yeni yüzey" kuralı kendi işime uygulandı — 9 araca bağlanan uyarı kutusu
ölçüldü (`antikoagulan-geri-dondurme`, `1.200` girdisiyle):

| ölçüt | 1280px | 375px |
|---|---|---|
| kontrast | başlık **6.84** · gövde **8.75** | — |
| yazı boyu | 11 / 12 / 13px (araç yüzeyinin kendi ölçeği) | aynı |
| kutu | 768px | 343px, x=16 — belge taşması **yok**, kendi taşması **yok** |
| başlık hiyerarşisi | kutunun içinde başlık **0**; sayfada h1 **1**, h2 **2** (değişmedi) | aynı |
| canlı bölge çakışması | tek `role="alert"`; `khorana`da `SonucDuyuru` DÜŞÜK → ORTA çalışmayı sürdürüyor | — |

**`innerWidth: 0` yine ısırdı ve guard yakaladı.** Betiğin başındaki
`if (!innerWidth) throw` ilk denemede attı; panel gizliyken geometri
ölçülemiyor. Çare `resize_window` ile açık bir görünüm boyutu vermek —
ölçüm bitince `preset: "desktop"` ile geri alınır. Guard olmasaydı bütün
genişlikler 0 çıkacak ve "kutu taşmıyor" diye YANLIŞ bir temiz rapor
yazacaktım.

14px tabanı burada UYGULANMAZ: o kural `[data-readable]` okuma alanları
için: araç yüzeyi baştan beri 10–13px etiket ölçeğinde çalışıyor ve uyarı
onunla aynı ölçekte.

---

## `/tools` hub tekrarı — ölçüm (9 Eylül 2026)

Kod DEĞİŞTİRİLMEDİ; bu bölüm kararı beslemek için.

**Tekrar gerçek:** masaüstünde 19 çip (18 kategori + "Tümü 136") ve 18
akordeon başlığı var; çip metinlerinin **18'i 18'i** akordeon başlığıyla
BİREBİR aynı (`🧪Nefroloji9` ↔ `🧪Nefroloji9›`).

**Ama işlevleri farklı ve çip'inki benzersiz:**

| affordans | ne yapıyor |
|---|---|
| çip | SÜZÜYOR — `?kategori=x`, öteki kategorileri kaldırıyor |
| akordeon başlığı | KATLIYOR — yalnızca o kategoriyi kapatıyor |

Süzgecin değeri ölçüldü: `/tools` **11686px** → `/tools?kategori=nefroloji`
**2282px** (%80 kısalma), 18 akordeon → 1, `aria-current` doğru çipte.
Masaüstünde akordeonların **18'i de açık** (katlama etkisi `innerWidth < 768`
ile sınırlı — kod iddiası canlıda doğrulandı), yani orada kompakt bir dizin
yok ve çip tek gezinme kısayolu.

**Bedel genişliğe göre değişiyor — burası kararın ekseni:**

| genişlik | çip satırı | ilk araç kartı | ekranda araç var mı |
|---|---|---|---|
| 768px | **290px** (5 satır) | **y=889** | **HAYIR** — 900px'lik ekranın tamamı krom |
| 1024px | 205px | y=728 | evet, dar |
| 1280px | 162px | y=665 | evet |

**Klavye bedeli genişlikten bağımsız:** ilk hesaplayıcı bağlantısı
**25. odak durağı** (183 durağın içinde); önünde 19 çip duruyor. Ekran
okuyucu da aynı 18 adı arka arkaya iki kez okuyor.

**Karar seçenekleri** (hiçbiri uygulanmadı):
1. Çipleri `lg:` (1024px) üstüne almak — 768px'teki 290px'lik kromu
   kaldırır, mobildeki karar zaten aynı gerekçeyle verilmişti.
2. Çip satırını katlanabilir yapmak (varsayılan kapalı, "Kategoriler" düğmesi).
3. Olduğu gibi bırakmak — tekrar görünür ama süzgeç gerçekten benzersiz.

Ölçüm tuzağı: `innerWidth: 0` bu turda da ısırdı, betiğin başındaki guard
yakaladı. Panel gizliyken `resize_window` ile açık bir boyut vermek gerekiyor;
bitince `preset: "desktop"` ile geri alındı.

---

## `/tools` çip eşiği `lg:`e taşındı (9 Eylül 2026)

Kullanıcı kararı: ölçümdeki 1. seçenek. Çip satırı 768px'te 290px yer
kaplıyor ve ilk araç kartını y=889'a itiyordu — 900px'lik bir ekranın
TAMAMI krom.

**Tek satırlık bir taşıma DEĞİLDİ; üç yer birden.** Yalnızca çipi taşımak
768–1024 bandında NE çip NE katlanmış dizin bırakırdı: 12498px'lik sayfa,
hiçbir kısayol yok. Üçü de artık tek sabite (`CIP_ESIGI = 1024`) bağlı:

| yer | eskiden | şimdi |
|---|---|---|
| çip satırı | `md:flex` | `lg:flex` |
| süzgeç şeridi (aktif kategoriyi gösterip kaldıran) | `md:hidden` | `lg:hidden` |
| akordeon katlaması | `innerWidth < 768` | `< CIP_ESIGI` |

Ölçüm — kazanç 768'de, gerileme hiçbir genişlikte yok:

| genişlik | önce | sonra |
|---|---|---|
| **768** | çip 290px · ilk araç y=889 · belge **12498px** · akordeon 18 açık | çip **yok** · 18 başlıklı katlanmış dizin (8'i ilk ekranda) · belge **1978px** |
| 1024 | çip 205px · y=728 | çip yok · katlanmış dizin |
| **1280** | çip 162px · 19 çip · y=665 · odak durağı 25 · belge 11686px | **birebir aynı** (gerileme yok) |
| 375 | çip yok · 18 kapalı · 3061px | **birebir aynı** |

**Süzgeç yolu 768'de kırılmadı** — ölçüldü: `?kategori=nefroloji` ile
şerit "Nefroloji" yazıyor, "Tümü 136" çıkış düğmesi görünür (35px),
akordeon zorla açık, 9 araç, belge 2279px.

**Ölçüm tuzağı:** katlanmış `<details>` içindeki bağlantıya
`getBoundingClientRect` sorunca 768'de "ilk araç y=551" çıktı — kapalı
kabın SON kutusu döndü, belgede kayıtlı tuzak. Doğru ölçüt görünür
öge sayısıydı (`checkVisibility`), o da 0 dedi: kategoriler kapalı,
tasarımın istediği bu.
