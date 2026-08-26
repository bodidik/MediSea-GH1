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

### Oturumun düzeltmeleri CANLIDA doğrulandı — hepsi kullanıcıya ulaşmış

Bu oturumda çok sayıda düzeltme gönderildi. Hiç sorulmamış soru yine aynıydı:
**kullanıcıya ulaştı mı?** Tarayıcıyla canlıda ölçüldü (curl değil).

**Premium giriş sayfası** — kullanıcının kendi bildirdiği yüzey:

| ölçüt | önce | canlıda |
|---|---|---|
| görünür bağlantı | **0** | **10** |
| `/uyelik` bağlantısı | 0 | 8 |
| birincil eylem | yok | var — **"Neler dahil?"** |
| başlıkta siteye dönüş | yok | var |
| tekrarlanan kilit cümlesi | 7 | **0** |
| özdeş "Özel İçerik" başlığı | 7 | **0** |
| kilitli kart, ayırt edilebilir adla | 0 | **7** |

**Rozet dürüstlüğü** — `/tr/premium/ydus`, oturum YOK: rozet **"Free"**
(önce "Premium" diyordu, yani sahip olunmayan erişimi vaat ediyordu).

**Klinik araçlar:**

| araç | canlıda | önce |
|---|---|---|
| `bmi` Hamwi, kadın 170 cm | **60.7 kg** | 64.2 kg |
| `bmi` Devine, kadın 170 cm | 61.4 kg (değişmedi) | 61.4 kg |
| `gnri` | cinsiyet seçici + "Lorentz, erkek: … /4" satırı | seçici YOKTU |

`bmi`de sıra da düzeldi: kadında artık Hamwi < Devine (önce tersiydi).

**Başlık araması:**

| ölçüt | canlıda |
|---|---|
| canlı bölge yazmadan ÖNCE DOM'da | evet (1) |
| duyuru | "10 sonuç bulundu." |
| ESC pencereyi kapatıyor | `defaultPrevented true`, kapandı |
| sorgu korunuyor | "diyabet" — veri kaybı yok |
| temizleme düğmesi adı | "Aramayı temizle" |

**Mobil menü (375px):** ESC kapatıyor (`aria-expanded` true→false, görünür
bağlantı 14→2), **odak açan düğmeye dönüyor**, `aria-controls="ana-menu"`,
ve negatif kontrol geçiyor — menü kapalıyken ESC yutulmuyor.

**Sayılar hâlâ tutuyor:** `/tools` "131 araç listeleniyor" · 134 araç
bağlantısı · 18 `h2`. "Sayı yazma, saydır" mimarisi bozulmamış.

Kapsam notu: `kayit` sayfasındaki otomatik giriş düzeltmesi canlıda
SÜRÜLMEDİ — dalı çizdirmek gerçek bir kayıt (veritabanına yazma) gerektirir.
Yerelde `fetch` koşumuyla ölçülmüştü; canlı doğrulaması yapılmadı ve
"doğrulandı" DENMİYOR.

**İKİNCİ TUR — sonraki commit'ler de canlıda ölçüldü.** Yukarıdaki tablo bir
dönem `"Planları gör" birincil eylemi` diyordu ve etiket sonradan
`"Neler dahil?"` olarak değiştirildiği için **belge canlıyı yanlış
anlatıyordu**. Satır düzeltildi.

Bu, avlanan sınıfın belge tarafındaki hâli: bir düzeltmeyi belgeye yazdıktan
sonra AYNI yüzeyi tekrar değiştirirsen, belge sessizce bayatlıyor. Ölçüt
basit — canlıyı ölçerken belgedeki iddiayı da yanına koy ve ikisinin aynı
şeyi söylediğini gör.

İkinci turda canlıda yeniden ölçülenler (hepsi tutuyor): premium giriş 10
görünür bağlantı · etiket "Neler dahil?" · eski "Planları gör" metni **yok** ·
tekrarlanan kilit cümlesi 0 · özdeş "Özel İçerik" 0 · rozet "Free"; YDUS
panosu rozeti "Free" (kontrast 11.87); arama canlı bölgesi yazmadan önce
DOM'da, ESC kapatıyor ve sorgu korunuyor, temizleme düğmesi 24×24 ve adlı;
mobil menü ESC ile kapanıyor, odak düğmeye dönüyor, `aria-controls` yerinde,
menü kapalıyken ESC yutulmuyor.


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


### 26 dosya kendi yolunu YANLIŞ yazıyordu — 24'ü "canlı görünen" ölü rota

Yorumdaki atıfın gerçek olup olmadığı ölçütü (bkz. `plan.guard.js` turu)
genelleştirildi. Önce geniş tarama: 7373 yorum satırı, 158 benzersiz dosya
atfı. Sonra daha keskin bir ölçüt — **dosyanın İLK satırında kendi yolunu
yazan 101 dosya** var ve 26'sında yazılan yol gerçeği tutmuyordu.

**24'ü tek bir kalıp: alt çizgi.** Bu dosyalar bilerek rotadan çıkarılmış
(`admin` → `_admin`, `content` → `_content`, `plan` → `_plan`,
`endokrinoloji` → `_endokrinoloji`) ama başlıkları hâlâ ESKİ, CANLI GÖRÜNEN
yolu yazıyordu.

**Bu kozmetik değil.** Belge tam bu yüzden yapılmış bir yanlış okumayı
kaydediyor: *"Kaynağa bakınca `/api/_plan/set` yetkisiz plan değiştiriyor
sanılıyor — öyle bir uç yok."* Bayat başlık o yanlış okumanın MEKANİZMASI:
dosyayı açan kişi başlıkta `/api/admin/...` görüp ucun canlı olduğunu sanıyor.

Başlıklar gerçek yolu yazıyor; alt çizgili olanlar ayrıca **"ROTAYA
ALINMIYOR"** notu taşıyor. Doğrulama: sapan 26 → **0**, 101 dosyanın 101'i
tutuyor. Değişim yalnızca yorum satırında — 26 dosyanın her birinde TAM BİR
satır (`git diff --numstat` ile doğrulandı).

**ÖLÇÜT İLK ÇALIŞTIRMADA SAHTE ADAY ÜRETTİ.** 45 aday çıktı ve yarısında
"gerçek" ile "yazılan" BİREBİR AYNI görünüyordu. Sebep: Windows yollu
başlıklarda (`// C:\Users\...`) desen satır sonundaki `\r` karakterini de
yakalıyordu. Kırpılınca 26'ya düştü. "Bir tarama ilk çalıştırmada aday
üretiyorsa önce ölçütü sına" kuralının bu turdaki hâli.

**AYRI BULGU — `app/api/programs/routes.ts` adı ÇOĞUL.** Next.js rota
dosyasının `route.ts` olmasını ister; bu ad kaydedilmiyor ve içindeki `GET`
hiç çalışmıyor. Kaynakla değil DAVRANIŞLA doğrulandı:

| adres | sonuç |
|---|---|
| `/api/programs` | **404** (bu dosya) |
| `/api/programs/deneme` | 503 (`[...path]/route.ts`, dürüst hata) |
| `/_programs` | 404 (tek çağıran, o da alt çizgili) |

Ölü uç + ölü çağıran, yani kullanıcıya ulaşan kusur YOK.

**ADI BİLEREK DÜZELTİLMEDİ.** `route.ts` yapmak bugün VAR OLMAYAN bir ucu
canlıya açardı — bu bir kusur düzeltmesi değil, istenmeyen bir yüzey eklemek
olurdu. Bunun yerine dosyaya neden kaydedilmediği ve ölçülen davranış yazıldı.
**Ölü kodu "düzeltmek" bazen onu diriltmektir; ölçüt "kod doğru mu" değil,
"bu değişiklik kullanıcıya ne yapar" olmalı.**

### Oturum içi gerileme kontrolü — sekiz arayüz dosyası, denetimler temiz

Bu oturumda sekiz arayüz dosyası değişti (SiteHeader ×3, ReadingTools,
RequirePlan, PremiumCard, PlanBadge, premium girişi, profil, YDUS panosu).
Deponun kendi denetimleri KENDİ İŞ ÜZERİNDE sürüldü:

| denetim | sonuç |
|---|---|
| `arayuz-denetim` | kusur yok |
| `ic-bilesen-denetim` (CI kapısı) | 404 tsx, 659 bileşen — temiz |
| `olu-denetim` | aynı 4 karara bağlanmış aday, yeni yok |
| `saydamlik-denetim` · `renk-cifti-denetim` | yeni aday yok |

Üç eski verdikt belgeye güvenmek yerine YENİDEN ölçüldü ve üçü de doğru
çıktı: `checkTopicAccess` gerçek oturumu/planı okuyor (dürüst); liderlik
tablosundaki sahte isimler ilan edilmiş (**ilan görünür, 16px, kontrast 7.87
ve sahte isimlerden ÖNCE** — y 203 ↔ 376); `SimulatorEngine` hâlâ yalnızca
alt çizgili klasörlerden çağrılıyor (dosya `soru-cozum/` altında DURUYOR ama
`soru-cozum/page.tsx` onu içe aktarmıyor).

Sahte veri sınıfı da tarandı: `MOCK_`/`DEMO_` taşıyan tek dosya liderlik ve
orada iki ayrı ilan cümlesi var. Sınıf tek örnekli ve dürüst.


### SABİT PLAN SINIFI KAPANDI — ve tersi daha ağırdı: ücretsiz kullanıcıya "Premium"

`/tr/premium` ve `/profile`ta bulunan "plan sabit yazılı" kusuru ölçüt hâline
getirilip süpürüldü. Sınıfın **ters yönü** YDUS panosunda çıktı ve daha ağırdı.

`YdusDashboardClient` şunu yazıyordu:

```js
// Bu rota zaten premium erişim gerektirdiğinden (bkz. plan.guard.js) rozet sabit gösterilir
const plan = "premium" as const;
```

**Gerekçenin İKİ İDDİASI DA YANLIŞTI ve ikisi de ölçüldü:**

| iddia | gerçek |
|---|---|
| `plan.guard.js` var | dosya YOK (depoda arandı) |
| rota premium erişim gerektiriyor | `middleware.ts` yalnızca `/kayseritip/*`, `/admin/*`, `/api/kayseritip/*` eşliyor |

Sonuç ölçüldü: **hiç giriş yapmamış bir ziyaretçi** `/tr/premium/ydus`ta
kendi hesabında **"Premium" rozeti** görüyordu (sayfa 200, erişim kısıtı yok,
16 görünür bağlantı).

**Bu yön daha ağır.** Geçen turki kusur premium üyeye "Free" diyordu — eksik
gösteriyordu. Bu, sahip OLUNMAYAN bir erişimi VAAT ediyor. Depodaki
*"uydurulmuş bir başarı, çağıranın üstüne kod yazdığı yanlış bir varsayım
üretir"* kuralının rozet tarafı.

**GENEL DERS: bir sabitin yanındaki GEREKÇEYİ de doğrula.** Yorum bir kapıya
atıf yapıyordu ve o kapı hiç var olmamıştı. Yorum, sabitin kendisinden daha
inandırıcı göründüğü için kimse sabiti sorgulamamıştı.

**Ölçüt betiğe alınmadı ama TARANDI:** yorumlarda `bkz. <dosya>` biçiminde
atıf yapılan yedi dosyadan altısı var, tek eksik `plan.guard.js` idi. Yani
sınıf tek örnekli ve kapandı. Bu tarama ucuz ve tekrarlanabilir:

```
grep -rhoE "(bkz\.|see) [A-Za-z0-9_./-]+\.(js|ts|tsx|cjs|json)" --include=*.tsx --include=*.ts
```

**Sınıfın tamamı karara bağlandı:**

| yer | durum |
|---|---|
| `/tr/premium` | sabit `"free"` → oturumdan (önceki tur) |
| `/profile` | sabit `"free"` → oturumdan (önceki tur) |
| `/tr/premium/ydus` | sabit `"premium"` → oturumdan (bu tur) |
| `PremiumDailyProgram` | sabit `"free"` ama ÖLÜ KOD (sıfır içe aktaran) ve "kilitli" dalında bağlamsal olarak doğru |
| `SinavTakvimiUyarisi` · `SyncDurumu` · `YoneticiDuzenleyici` | yalnızca `status` alıyor — meşru, kullanıcı verisi gerekmiyor |

**Doğrulama, iki yönlü:**

| oturum | rozet önce | rozet sonra |
|---|---|---|
| yok (anonim) | **Premium** | **Free** (kontrast 11.87) |
| premium | Premium | **Premium** (değişmedi) |

Premium yönü geçici dev rotasıyla ölçüldü. **Rota kurarken bir tuzak çıktı:**
`YdusDashboardClient` yalnızca `SessionProvider` değil `UserProvider` da
istiyor (`useUser` çağırıyor) — eksikken sayfa 500 verdi. Bir bileşeni kendi
yerleşiminin DIŞINDA render edeceksen, ihtiyaç duyduğu bütün sağlayıcıları
say; 500'ün sebebi bileşen değil eksik bağlamdır.

Rota silindi: `/zz-olcum-ydus` 404, ana sayfa ve iki premium sayfası 200,
derleme hatası izi yok.


### Konsol ve ağ taraması — hata yok, ama her sayfa oturumu İKİ KEZ soruyor

Çalışma zamanı hataları sistematik hiç taranmamıştı. Belgedeki doğru yöntemle
(taze sekme, gerçek gezinme, `read_console_messages`) üç yüzey tarandı:
konu sayfası · araç sayfası · premium pano. **Konsol hatası: 0. Başarısız
istek: 0** (ağ günlüğündeki 40 isteğin 40'ı da 200).

**Yan düzeltme — kendi iddiamı çürüttüm.** Güvenlik başlıkları turunda "CSP
yazarken dikkat: `next/font` Google'dan çekiyor" demiştim. Ağ günlüğü aksini
gösteriyor: yazı tipleri `/_next/static/media/*.woff2` yani KENDİ
origin'imizden geliyor. Google Fonts yalnızca DERLEME anında iniyor. Bir CSP
yazılacaksa font için üçüncü taraf izni GEREKMİYOR.

**Ölçülen tek aykırılık: `/api/auth/session` her sayfa yüklemesinde İKİ KEZ
çağrılıyor.**

| ölçüt | değer |
|---|---|
| istek sayısı | 2 (her sayfada — araç sayfasında da, premium panoda da) |
| süreler | 279 ms · 1694 ms |
| 1. istek biter | 1142 ms |
| 2. istek başlar | **1143 ms** |

Aradaki 1 ms belirleyici: bu **paralel bir çift değil, ARDIŞIK** bir zincir —
birincisi biter bitmez ikincisi tetikleniyor.

**Uygulama kodunda sebep YOK:** tek `SessionProvider` var (`app/providers.tsx`),
kök düzende bir kez kuruluyor, iç içe değil; `useStudySync` yalnızca `status`
okuyor, kendi isteği yok. Yani ikinci çağrı NextAuth'un kendi
`SessionProvider` davranışından geliyor.

**KUSUR DEĞİL, MALİYET:** ikisi de aynı cevabı döndürüyor, doğruluk sorunu
yok. Bedeli her görüntülemede iki sunucusuz çağrı ve oturuma bağlı arayüzün
~1.7 s gecikmesi. `refetchOnWindowFocus`/`refetchInterval` kısmak çağrıyı
yarıya indirir ama başka yerde giriş yapan kullanıcının bunu geç görmesi
pahasına — ödünleşme, tek başına yapılmadı.

**ÖLÇÜM TUZAĞI, yine aynı aile:** ilk okuma "4 çağrı" dedi ve bir an iki kat
kötü sanıldı. Ağ günlüğü aynı sekmedeki İKİ gezinmeyi birden kapsıyordu
(listede hem `tools/egfr` hem `premium/ydus` parçaları vardı). Taze sekmede
tek gezinmeyle ölçülünce sayı 2 çıktı. Belgedeki "aynı sekmede biriken geçmiş
yanıltır" kuralı — bu kez ağ günlüğünde.


### İki kayıtlı sınıf 15 yüzeyde birden kapatıldı — sunucu render'ı ve landmark

Belgede iki sınıf ayrı ayrı düzeltilmiş ama hiç TOPLU doğrulanmamıştı:
Suspense sınırının sunucu HTML'ini boşaltması, ve çift `<main>` landmark'ı.
Aynı ölçütle 15 ana yüzey birden tarandı.

**1) Sunucu render'ı — zayıf sayfa SIFIR.** Ölçüt belgede yazılı: sunucu
HTML'inde `<h1>` ve bağlantı say. (JSON-LD dışındaki `<script>`ler elendi;
RSC yükü "sunucuda basılmış" SAYILMAZ.)

| yüzey | h1 | bağlantı | gövde |
|---|---|---|---|
| `/tools` | 1 | **161** | 11724 krk |
| `/topics/endokrinoloji/addison` | 1 | 46 | 8264 krk |
| `/topics` · `/` · branş | 1 | 49–66 | 2130–2761 krk |
| `/giris` · `/kayit` · `/profile` | 1 | 8–9 | 661–735 krk |
| `/uyelik` · `/guidelines` · `/calisma-alanim` · `/tekrar` · premium ×2 | 1 | 14–39 | 1292–2692 krk |

**On beşinin on beşi de** tam bir `<h1>` ve gerçek gövde taşıyor. İki kayıtlı
gerileme ayakta: `/tools` sunucuda 161 bağlantı basıyor (bir dönem arama
kutusu boşken 114 aracın hepsi eleniyordu) ve `/giris` boş değil (bir dönem
sayfanın tamamı tek bir Suspense içindeydi).

**2) Landmark — çift ya da eksik SIFIR.**

| ölçüt | sonuç |
|---|---|
| çift `<main>` | **0** |
| `<main>` olmayan | **0** |
| çift `<h1>` | **0** |

`(site)` grubu DIŞINDAKİ sayfalar (`/tools`, `/giris`, `/kayit`, `/profile`,
premium ×2) header ve footer ALMIYOR — belgede bilinçli karar olarak yazılı
(odaklanmış yüzeyler) — ama hepsinde `<main>` var. Yani "kök dizindeki
giris/kayit/profile de aynı boşluktaydı" düzeltmesi de ayakta.

**Kalan tek boşluk, geçen turda ölçülüp yazılan konu-404'ü:** orada sunucu
gövdesi 38 bayt ve `<h1>` 0. Sebebi `dynamicParams` ödünleşmesi, karar
bekliyor.


### ⚠ TÜRKÇE BİNLİK AYIRICI SESSİZCE YANLIŞ DOZ ÜRETİYOR — karar bekliyor

**Bu, ölçülmüş ve kullanıcıya ulaşan bir kusur. Hiçbir yerde kayıtlı değil.**

Türkçede **nokta binlik, virgül ondalık** ayırıcıdır. `parseLocaleNumber`
ise yalnızca virgülü ondalık sayıyor:

```js
const normalized = String(input).replace(",", ".").trim();
const n = parseFloat(normalized);
```

`parseFloat("1.200")` → **1.2** · `parseFloat("1 200")` → **1**
(ayrıca `replace(",", ".")` yalnızca İLK virgülü değiştiriyor).

**Canlıda ölçüldü — en ağır vaka:**

| araç | girilen | ekranda |
|---|---|---|
| `antikoagulan-geri-dondurme` | `5000` Ü heparin | **50 mg protamin** ✓ |
| aynı araç | `5.000` Ü heparin | **0.1 mg protamin** ✗ |

**500 kat düşük doz** — aktif kanamada verilen bir geri döndürme ajanında,
hiçbir uyarı olmadan, kendinden emin bir sayıyla. `pni`de de ölçüldü:
lenfosit `1200` → PNI 36.0, `1.200` → **30.0**.

**KAPSAM:** dört haneli örnek değer taşıyan, yani kullanıcının binlik
ayırıcı yazmasının OLASI olduğu beş araç var — ikisi infüzyon:
`antikoagulan-geri-dondurme` (ör. 5000) · `conut` (1800) ·
`kalsiyum-infuzyon` (1000) · `pni` (1500) · `sedasyon-infuzyon` (1000).

**DEĞİŞTİRİLMEDİ — sebebi ve analizi:** `parseLocaleNumber` 42 klinik
hesaplayıcının paylaştığı sözleşme; belgede zaten "42 aracı birden
değiştirmek riskli" diye kayıtlı. Ama vakalar EŞİT DEĞİL ve ayrım karar için
gerekli:

| girdi | durum | bugün | doğrusu |
|---|---|---|---|
| `1 200` (boşluk gruplama) | **BELİRSİZ DEĞİL** — hiçbir dil boşluğu ondalık saymaz | 1 | 1200 |
| `1.200,5` (nokta grup + virgül ondalık) | **BELİRSİZ DEĞİL** — Türkçe | 1.2 | 1200.5 |
| `1.2345` (4+ hane) | **BELİRSİZ DEĞİL** — hiçbir dil 4'lü grup kullanmaz | 1.2345 | 1.2345 ✓ |
| `1.200` (nokta + tam 3 hane, başka işaret yok) | **GERÇEKTEN BELİRSİZ** — TR'de 1200, EN'de 1.2 | 1.2 | ? |

İlk üçü düzeltilebilir ve yeni bir yanlış sayı sınıfı ÜRETMEZ. Dördüncüsü
bir güvenlik kararı: sessizce tahmin etmek mi, yoksa sayıyı hiç basmamak mı?
İkincisi de bedava değil — belgede "0 NaN'dan DAHA tehlikeli" diye kayıtlı,
yani 0'a düşürmek başka bir kusur sınıfı açabilir ve araç araç doğrulama
ister.

**Bu yüzden tek turda tek başına değiştirilmedi.** Ölçüm, kapsam ve vaka
ayrımı burada; kararı içerik/güvenlik sahibi versin.


### Güvenlik başlıkları ve çerez bayrakları ölçüldü — ikisi yerinde, beşi yok

Hiç bakılmamış bir yüzey. Oturum tutan bir sağlık uygulamasında ölçülebilir.

**Yerinde olan ikisi, en çok önem taşıyanlar:**

| ölçüt | sonuç |
|---|---|
| oturum çerezi JS'ten okunabiliyor mu | **HAYIR** — `document.cookie`da `authjs`/`next-auth` yok, yani `httpOnly` ayakta |
| HSTS | **var** — `max-age=63072000; includeSubDomains; preload` |

**Yok olanlar:** `content-security-policy` · `x-frame-options` ·
`x-content-type-options` · `referrer-policy` · `permissions-policy`.
`next.config.js`te `headers()` bloğu hiç yok.

**HİÇBİRİ ÖLÇÜLMÜŞ BİR KUSUR DEĞİL** — kırılan bir şey yok. Bu bir güvenlik
duruşu kararı ve tek başına alınmadı. Gerekçeler:

- **`x-frame-options` / `frame-ancestors`** somut tehdidi olan tek başlık:
  giriş formu ve hesap eylemleri taşıyan bir site iframe'e gömülebiliyor
  (clickjacking). **Kanıtı bu oturumun kendisi:** bütün ölçümler siteyi
  iframe'e alarak yapıldı ve hiçbiri engellenmedi.
  **AMA ÖDÜNLEŞME BURADA:** bu başlık eklenirse deponun KENDİ ölçüm yöntemi
  kırılır — belgedeki taramaların çoğu iframe'e dayanıyor. Ekleneceğinde
  ölçüm yolu da birlikte düşünülmeli (aynı origin için `SAMEORIGIN` yeterli
  olabilir).
- **`content-security-policy`** en değerlisi ama körlemesine eklenirse
  uygulamayı kırar: premium motorlar satır içi stil kullanıyor, `next/font`
  Google'dan çekiyor, JSON-LD satır içi script. Ölçülmeden yazılmamalı.
- **`x-content-type-options: nosniff`** ucuz ve standart; risk düşük.
- **`referrer-policy`**: pratik etkisi DÜŞÜK çıktı. Kaynakta üçüncü taraf
  adres taraması yapıldı ve **canlı tek gömme** KayseriTıp slayt
  görüntüleyicisi (`view.officeapps.live.com`), o da kurum kapısı arkasında.
  `via.placeholder.com` alt çizgili klasörde (ölü), `youtu.be` yönetim
  sayfasında. Üstelik modern tarayıcı varsayılanı
  (`strict-origin-when-cross-origin`) bu vakayı zaten karşılıyor.

Yani sıralama net: önce çerçeveleme kararı (ölçüm yöntemiyle birlikte),
sonra `nosniff`, en sonda ölçülerek yazılmış bir CSP.


### Önbellek davranışı ölçüldü — takılı MISS yok, tek istisna doğru sebeple

Belge bir kez `/tools`un her istekte MISS kaldığını ve 155 kB'lık sayfanın
her seferinde yeniden üretildiğini kaydediyor. Sınıf hiç toplu ölçülmemişti.
Sekiz temsili rota, üçer istekle:

| rota | tur | süre (ms) |
|---|---|---|
| `/` · `/topics` · `/tools` · branş · konu · araç · `/uyelik` · premium pano | **PRERENDER → HIT → HIT** | 431–1157 → ~100–265 |

**Sekizinin sekizi de sağlıklı; `/tools` artık en hızlılardan** (450 → 112 →
108). Kayıtlı kusur kapalı.

Dinamik (`ƒ`) rotalar ayrıca ölçüldü:

| rota | tur | değerlendirme |
|---|---|---|
| paylaşım kartı | MISS → **HIT → HIT** | ilk üretimden sonra önbellekte |
| site haritası | PRERENDER → HIT → HIT | statik |
| `/api/user/me` | MISS → MISS → MISS | **doğru** — API yanıtı önbelleğe alınmamalı |
| premium konu sayfası | **MISS → MISS → MISS** | 3065 → 472 → 367 ms |

**Premium konu sayfasının hep MISS olması KUSUR DEĞİL ve sebebi kayda değer:**
sayfa `checkTopicAccess()` üzerinden `auth()` çağırıyor, yani OTURUM ÇEREZİNİ
okuyor. Çerez okuyan bir yanıt kenarda paylaşılamaz.

**TUZAĞIN ADI KONUYOR:** biri ileride "bu sayfa hep MISS, önbelleğe alalım"
diye bir `revalidate`/`s-maxage` eklerse, bir kullanıcının erişim durumu
başka bir kullanıcıya servis edilir — premium içerik ücretsiz hesaba, ya da
tersi. **Hep MISS olan her rota bir performans kusuru değildir; önce yanıtın
KULLANICIYA ÖZEL olup olmadığına bak.**

Sıcak süre 367–472 ms; kapı arkasındaki bir sayfa için kabul edilebilir.


### Yönlendirmeler canlıda sürüldü — dört kayıtlı kusurun dördü de kapalı

`next.config.js` içindeki `redirects()` hiç ölçülmemişti. Yapılandırmanın
kendi yorumları iki geçmiş kusuru anlatıyor (`(?!tr$)` yüzünden sonsuz döngü,
`api`nin dil sanılması) ve bir de iki yeniden adlandırma taşıyor. Dördü de
canlıda sürüldü.

| istenen | indiği | durum |
|---|---|---|
| `/en/premium/ydus` | `/tr/premium/ydus` | 200 — dil normalleşiyor |
| `/de/premium/ydus/liderlik` | `/tr/premium/ydus/liderlik` | 200 — **alt yol korunuyor** |
| `/topics/hematoloji/hodgkin-lenfoma` | `…/hodgkin` | 200 — yeniden adlandırma |
| `/tools/heart-score` | `/tools/heart` | 200 — yeniden adlandırma |

**İki NEGATİF kontrol, ikisi de kayıtlı kusurun tam vakası:**

| ölçüt | sonuç |
|---|---|
| `/tr/premium/…` kendine yönleniyor mu | **HAYIR** — yerinde kalıyor, sonsuz döngü yok |
| `/api/premium/…` HTML'e 308'leniyor mu | **HAYIR** — yerinde kalıyor, `503 application/json` |

İkincisi ayrıca dürüst hata kuralının da doğrulaması: uç, arka uca
ulaşamadığında uydurma veri değil `503` dönüyor.

**Dilsiz `/premium/ydus` 404 ve bu TASARIM GEREĞİ** — kural bir dil segmenti
şart koşuyor (`/:lang(...)/premium/:yol*`), `robots.txt` de `/premium`i
yasaklıyor. Belgede `ads.ts` içindeki `/premium` bağlantısı zaten "ölü kodda
kırık" diye kayıtlı. Kusur değil.

`heart-score → heart` yönlendirmesinin gerekçesi yapılandırmada yazılı ve
kayda değer: aynı skor İKİ ayrı araç olarak duruyordu ve `heart-score`
dokunulmamış formda "0 · Düşük Risk" yani bir TABURCU kararı basıyordu.
Kapılı olan tutulmuş, öteki yönlendirilmiş — adres kırılmadan.


### 404 yüzeyi ölçüldü — soft 404 yok, ama konu 404'ü sunucuda BOŞ gidiyor

Dışarıdan gelen kırık bağlantıların, yazım hatalarının, eski yer imlerinin
hepsi buraya düşüyor ve bu yüzey hiç ölçülmemişti.

**Sağlam çıkanlar:** dört 404 yolunun dördü de doğru HTTP **404** ve
**`noindex`** dönüyor — soft 404 (200 ile hata içeriği) YOK. Konu 404'ü
hidrasyondan sonra tam çiziliyor: `h1` 1, `main` 1 (çift landmark yok),
**38 görünür bağlantı**, dürüst metin ("Bu konu kütüphanede yok"), sistem
içi ad sızmıyor.

**Ama iki sınıf arasında gerçek bir fark var:**

| yol | sunucu HTML'i |
|---|---|
| `/rastgele` · `/tools/olmayan-arac` | **h1 1**, gövde 7877 bayt — tam basılıyor |
| `/topics/…` 404'leri | **h1 0**, gövde **38 bayt** |

Canlıda taze bir slug'la (`x-vercel-cache: MISS`) dönen yanıtın `<body>`
içeriği tam olarak şu:

```html
<div hidden=""><!--$--><!--/$--></div>
```

Not-found metni yalnızca `<script>` içindeki RSC yükünde. Yerelde de aynı.

**`not-found.tsx`in kendi yorumu bunun çözüldüğünü iddia ediyordu**
("bölüm düzeyinde bir not-found … sunucuda üretiliyor"). Dosya BAŞLIĞI ve
METNİ gerçekten düzeltti — `<title>` "Konu bulunamadı" olduğu için segmentin
seçildiği kesin — ama GÖVDENİN sunucuda basılmasını sağlamadı. Yorum ölçülen
gerçekle değiştirildi.

**Sebep bir ÖDÜNLEŞME, o yüzden dokunulmadı:** iki rota da
`generateStaticParams` taşıyor ama `dynamicParams` VARSAYILANDA (`true`) ve
bu bilerek seçilmiş — sonradan eklenen konu yeniden derleme olmadan çalışsın
diye. Listede olmayan slug istek anında render ediliyor, `notFound()` o
akışın içinden fırlatılıyor ve gövde RSC yüküyle taşınıyor.
`dynamicParams = false` boş gövdeyi kapatırdı ama o davranışı kırardı.

Bedeli DAR ve raporda öyle yazıyor: sayfa `noindex` olduğu için arama motoru
etkilenmiyor; etkilenen, JavaScript'i yavaş ya da kapalı olan kullanıcı.

**İKİ ÖLÇÜM TUZAĞINA DÜŞÜLDÜ, ikisi de belgede zaten yazılı:**

- **Dev kipinde hata ekranı ölçüldü.** İlk yerel ölçüm Next'in kendi hata
  katmanını gösterdi (`NEXT_HTTP_ERROR_FALLBACK` şablonu, Windows yollu
  yığın izi). Kural belgede kayıtlı: hata ekranını dev kipinde ölçme.
- **İlk canlı ölçüm `x-vercel-cache: HIT` idi.** Eski bir dağıtımdan gelmiş
  olabilirdi; rastgele taze slug'larla `MISS` alınıp sonuç doğrulandı.


### Satış sayfasındaki HER SAYI bağımsız olarak doğrulandı

"Sayı yazma, saydır" mimarisi belgede yazılı ama sayıların DOĞRU olduğu hiç
uçtan uca sınanmamıştı. `/uyelik` sayfasının ilan ettiği altı sayının altısı
da dosya sisteminden bağımsız olarak ölçüldü ve **altısı da tuttu**:

| ilan | ölçülen | nasıl |
|---|---|---|
| 13 branş · 410 konu | ✓ | dosya sistemi + site haritası (559 adres) |
| 41 başlık | ✓ | premium `topics/` altında 41 dosya |
| **378 soru** | ✓ | 388 toplam − 10 yetim |
| **1492 kart** | ✓ | 1641 toplam − 149 yetim |
| 11 vaka | ✓ | `vakalar/` altında 11 dosya |

İki çıkarma ayrıca anlamlı: sayaç yetim içeriği SAYMIYOR. Belgede kayıtlı
kusur tam bunun tersiydi — satış sayfası "362 soru" derken pano "352"
diyordu. Bugün iki bağımsız yol aynı sayıya varıyor.

### Ücretli içeriğin kalite taraması TAMAMLANDI — dört türün dördü de sağlam

İskelet konu ölçütü bütün içerik türlerine sürüldü:

| tür | adet | ortanca gövde | en kısa | iskelet |
|---|---|---|---|---|
| premium konu | 41 | 7020 krk | 524 (soru derlemesi) | **0** |
| soru açıklaması | 388 | 1051 krk | 267 | **0** |
| flashcard | 1641 | 163 krk | 74 | **0** |
| vaka adımı | 35 | 2883 krk | 2169 | **0** |

Kıyas: AÇIK taraftaki 410 konunun ortancası 3016 ve 10'u iskelet. Yani
ücretli içerik hem daha uzun hem boşluksuz.

**`cases/` ile `vakalar/` AYRI iki özellik, kopya değil** — ölçüldü:
`cases/` yalnızca soru çözüm kokpitinden (`soru-cozum/page.tsx`),
`vakalar/` yalnızca vaka çözmeden (`vaka-coz/page.tsx`) okunuyor. Şemaları
da farklı (`stages` ↔ `adimlar`). `cases/` bugün tek dosya taşıyor.


### Arama görünürlüğü uçtan uca ölçüldü — robots · canonical · JSON-LD · harita

Belge açık tarafı "huninin ağzı" diye tanımlıyor ama bu yüzeyin parçaları hiç
birlikte ölçülmemişti. Ölçüldü, hepsi temiz.

| ölçüt | sonuç |
|---|---|
| `robots.txt` | mutlak site haritası adresi · `Disallow: /admin, /api, /*/premium/ydus/, /premium` |
| canonical | dört sayfa tipinde de MUTLAK ve üretim alan adında (`localhost` felaketi kapalı) |
| JSON-LD | geçerli JSON · ana sayfa `Organization+WebSite`, araç `+SoftwareApplication+BreadcrumbList`, konu `+MedicalWebPage+BreadcrumbList` |
| harita ↔ robots ÇELİŞKİSİ | **0** — 559 adresin hiçbiri yasaklı kalıba düşmüyor |

**Haritada olmayan altı sayfanın altısı da KARAR, unutma değil** — ve karar
üretecin kendi içinde yazılı:

```
// Bilerek DIŞARIDA: /giris ve /kayit (içerik değil, arama değeri yok),
// /calisma-alanim ve /tekrar (kişisel araçlar; tarayıcıya boş görünürler),
// /guidelines (henüz yer tutucu — aşağıda dizine kapatıldı).
```

**O yorumun tek SINANABİLİR iddiası doğrulandı ve fazlası çıktı.** İddia
"/guidelines dizine kapatıldı"ydı; ölçüm dördünü birden gösterdi:

| sayfa | robots meta |
|---|---|
| `/guidelines` · `/tekrar` · `/calisma-alanim` · `/giris` | **`noindex, follow`** |
| `/topics/endokrinoloji/addison` (kıyas) | `index, follow` |

Yani harita dışında bırakma ile `noindex` **aynı şeyi söylüyor**. Bu, bu
depoda avlanan "iki gerçeklik ayrışır" sınıfının TERSİ: iki mekanizma da aynı
niyeti taşıyor ve ikisi de ölçüldü.

Üreteçte ayrıca kayıtlı bir geçmiş ayrışma var ve bugün kapalı: `/tr/premium/
ydus` tanıtım sayfası `robots.ts`te taramaya AÇIK bırakılmışken haritada
YOKTU — "iki dosya aynı niyeti taşıyıp farklı davranıyordu". Artık haritada.

**Not:** `/tekrar` ve `/calisma-alanim` gövdeleri 720–723 karakter, yani
tarayıcıya gerçekten boş görünüyorlar (veri kullanıcının deposunda).
Gerekçe ölçümle de doğru.


### Paylaşım kartları canlıda ölçüldü — üç kırılma biçiminin üçü de kapalı

Belgede paylaşım kartlarının üç sessiz kırılma biçimi kayıtlı (`params` bir
Promise, `fs` çalışmıyor, Satori açık `flex` istiyor) ve kart bozulduğunda hata
GÖRÜNMÜYOR. Hiç ölçülmemişti; ölçüldü.

| kart | sonuç |
|---|---|
| site geneli `/opengraph-image` | 200 · image/png · 125 kB |
| branş kartı | 200 · image/png · 117 kB |
| konu kartı | 200 · image/png · 127 kB |

**BAŞLIK DİZİNİ TAM VE TAZE.** Kart başlığı `content/baslik-index.json`'dan
geliyor; anahtar tutmazsa kart slug'ı yazıyla basıyor (belgede kayıtlı kusur).

| ölçüt | sonuç |
|---|---|
| dizin kaydı | 410 — görünür konu sayısıyla birebir |
| dizinde olmayan görünür konu | **0** |
| dizinde olan gizli konu | **0** |
| dizinde olup dosyası olmayan | **0** |

Eksik görünen 46 kaydın 46'sı GİZLİ konu, yani beklenen davranış.

**Bayat mı diye üreteç çalıştırıldı: `baslik-index.cjs` birebir aynı içeriği
yazdı (git farkı yok).** Betik CI'da çalışmıyor ama bugün taze.

**Belgede adı geçen beş zor slug'ın hepsi dizinde** ve ikisi uçtan uca
sürüldü — sayfa 200, `og:title` GERÇEK başlık (slug değil), kart 200 PNG:

| slug | og:title |
|---|---|
| `nefroloji/FGF-23 vs PTH` (BOŞLUK taşıyor) | "FGF-23 ve PTH Arasındaki Moleküler Çapraz Konuşma" |
| `gastroenteroloji/ascit-sıvısı` (Türkçe karakter) | "Sirotik Asit Patofizyolojisi…" |

**ÖLÇÜM TUZAĞI — kart adresini TAHMİN ETME.** İlk koşum `/…/opengraph-image`
adresini denedi ve **404** aldı; bir an "konu kartları kırık" sanıldı. Next
metadata rotalarına HASH ekliyor: gerçek adres
`/…/opengraph-image-8mlh9?f77e9a1e81bc4ad2`. Doğru yol sayfanın kendi
`<meta property="og:image">` etiketini okumak — ilan edilen adresi çek,
uydurma.

Bu, belgedeki "desen tahmin etme, gerçek dizeyi oku" kuralının adres
tarafındaki hâli.


### Premium branş listeleri ölçüldü — ve "kusur" baştan sona ÖLÇÜM ARTEFAKTIYDI

Branş listeleri ile gerçek konu dosyaları karşılaştırıldı. Belgede kayıtlı
tasarım aynen ayakta, sayılar yalnızca büyümüş:

| ölçüt | değer |
|---|---|
| branş dosyası | 9 |
| konu dosyası | 41 (belgede 40 yazıyordu) |
| listede ilan | 57, `hazir:true` olan 40 |
| listede VAR, dosya YOK | **17 — ve 17'sinin de `hazir:false`** |
| dosya VAR, listede YOK | 1 (`gogus-hastaliklari/akciger-kanseri`) |

17'sinin `hazir:false` olması kritik: soluk ve tıklanamaz basılıyorlar, yani
çıkmaz sokak değiller. Tek listelenmeyen dosya ise `listelenmeyenKategori()`
ile "Diğer Konular" altında görünür kılınıyor.

**ÜÇ ADIMDA YANLIŞ "KUSUR" ÜRETTİM — üçü de ölçüm tarafındaydı:**

1. **Canlı DOM'da bağlantı saydım: 1 çıktı, `akciger-kanseri` yok.** Kusur
   sandım.
2. **Yerelde aynı ölçüm "var" dedi.** "Yerelde çalışıyor, canlıda çalışmıyor"
   diye belgedeki *sunucusuz dosya okuma* sınıfına yazacaktım.
3. **Sunucu HTML'inde arattım — yine yok.** Çünkü aramadan önce `<script>`
   bloklarını SİLİYORDUM.

Gerçek şu: `akciger-kanseri` canlıda **RSC yükünün içinde** duruyor
(`"hazir":true`, rozetler `["YENİ","SINAV SPOTU"]`) ve bölüm **katlanmış bir
akordeon** olarak basılıyor — başlıkta "1 / 1 konu ▾" yazıyor. Bağlantı ancak
açılınca DOM'a giriyor. Tıklandı: bağlantı **1 → 2**, href doğru, başlık
doğru.

**İKİ KURAL:**

- **`<script>` blokları RSC YÜKÜNÜ taşıyor.** Belgede "JSON-LD gürültüsünü
  ele" diye kayıtlı olan strip, aynı hamlede sunucudan gelen veri yükünü de
  siliyor. "Sunucu HTML'inde yok" demek, "sayfada yok" demek DEĞİL. Sunucuda
  basılıp basılmadığını ölçerken `<script>`i eleme; JSON-LD'yi ayıklamak
  istiyorsan yalnızca `type="application/ld+json"` olanları at.
- **Katlanmış akordeonun ögeleri açılana kadar DOM'da yok.** Bağlantı saymak
  sıfır verir. Bu, belgedeki "koşullu render edilen kartlar normal akışta
  görünmez" kuralının kardeşi: **saymadan önce aç.**

Yerel–canlı farkı da bir yanılgıydı: yerelde `body.textContent` okunuyordu ve
o, katlanmış bölümün metnini de kapsıyordu. **İki ortamı karşılaştırırken
AYNI ölçütü kullan** — farklı ölçüt, olmayan bir fark üretir.


### Soru AÇIKLAMALARI ölçüldü — sınav içeriğinin öğretme değeri sağlam

`soru-denetim` yapıyı denetliyor (doğru cevap geçerli mi, en az iki şık var mı,
mükerrer kimlik). Denetlemediği şey açıklamanın GÖVDESİ — oysa sınav
hazırlığında öğrenme değeri tam olarak orada.

Ölçüldü: **388 soru, ortanca açıklama 1051 karakter**, %5'lik dilim 591, en
kısası **267**. Boş ya da göstermelik açıklama **sıfır**. Ücretli içeriğin bu
tarafı düzgün yazılmış.

`soru-denetim`e açıklama uzunluğu denetimi EKLENMEDİ: sınıf bu depoda hiç
oluşmamış ve belgedeki kural açık — öngörülen risk için denetim yazmak, ölçülen
kusur için yazmakla aynı şey değil.

**İKİ ŞEMA BİR ARADA ve tek dosyayla sınırlı.** Soru nesnelerinde iki ayrı alan
kümesi görüldü:

```
Türkçe    : metin · secenekler · dogru · aciklama_kisa · aciklama_detay
İngilizce : text  · options    · correctAnswer · explanation
```

İngilizce şemayı kullanan tek dosya `hematoloji/aml-quiz-1.json` — ve o zaten
`yetim-denetim`in YETİM olarak işaretlediği dosya (konu `aml-ana`, dosya
`aml-quiz-1`), SENDE-KALANLAR 6'da kayıtlı. Yani şema sapması kullanıcıya
ulaşmıyor.

**İki bağımsız ölçüm birbirini doğruladı:** toplam 388 soru = 378 erişilebilir
+ 10 yetim, ve yetim olan tam da İngilizce şemalı dosya. Sayılar başka bir
yoldan da tutuyor: `/uyelik` sayfası 378 soru ilan ediyor.

**ÖLÇÜT ÜÇÜNCÜ KEZ ŞEMAYA TAKILDI.** İlk koşumda `s.aciklama` arandı ve
**388 sorunun 388'i "0 karakter"** çıktı — bir an "hiçbir soruda açıklama yok"
sanıldı. Gerçek alanlar `aciklama_kisa` ve `aciklama_detay`.

Bu oturumda aynı hata üç kez tekrarladı: premium konu gövdesi (`text` ↔ `html`),
konu bölümü (aynısı), şimdi soru açıklaması. **Kural: bir alanın adını
varsayma — önce nesnenin anahtarlarını BASTIR, sonra ölç.** Ölçüm betiğine
`Object.keys` toplayan bir satır koymak bu üç turu da kurtarırdı.


### Premium içerik ölçüldü — iskelet konu YOK, ama modül ilanları bayat

İskelet konu ölçütü satılan tarafa uygulandı. **Premium içerik açık taraftan
belirgin biçimde daha sağlam:**

| | açık taraf | premium |
|---|---|---|
| konu sayısı | 410 | 41 |
| ortanca gövde | 3016 krk | **7020 krk** |
| %5'lik dilim | 405 | **4653** |
| iskelet yaprak | 10 | **0** |

En kısa premium konu (`harrison-22-secme-sorular`, 524 krk) kusur DEĞİL:
`quiz: true` ve 25 soru ilan ediyor, yani değeri gövdesinde değil quizinde.
İkinci en kısa (`kml`, 1953 krk) dokuz içerik bloğu taşıyor.

**MODÜL İLANI — belgede kayıtlı düzeltme AYAKTA, veri ise bayat.**

Doküman "69 ilanın 6'sının hedefi yoktu" kusurunu ve çaresini kaydediyor.
Bugün ölçüldü: **70 ilan, 4'ünün hedefi yok.**

| ilan | durum |
|---|---|
| `endokrinoloji/graves-hastaligi` quiz | hiçbir adla quiz dosyası YOK |
| `hematoloji/kml` flashcard | YOK |
| `hematoloji/kml` inciler | YOK |
| `hematoloji/aml-ana` inciler | dosya `pearls/hematoloji/aml.json` — ad sapması, SENDE-KALANLAR 18'de kayıtlı |

**Ama hiçbiri kullanıcıya ulaşmıyor.** Konu sayfası bayrağa değil DOSYAYA
bakıyor ve satırın kendi yorumu bunu söylüyor:

```
// İlan YETMEZ: hedef içerik gerçekten var mı?
const aktif = ilan && (MODUL_VAR[key] ?? false);
```

`MODUL_VAR` dosya tabanlı envanterden (`envanterAl`) geliyor. Yani düzeltme
render katmanında ve ayakta; VERİDEKİ bayrak bayat kalabiliyor.

**TUZAK, adı konuyor:** biri ileride "zaten `moduller` bayrağı var, envanteri
okumaya gerek yok" diye sadeleştirirse **dört ölü kart** birden görünür hâle
gelir. Bayrak bir NİYET beyanı, envanter GERÇEK.

`video` ayrıca KOŞULSUZ kapalı (`video: false`) — video rotası yok
(SENDE-KALANLAR 24) ve dosyalar dursa bile kart etkinleşmiyor. Savunma
doğru kurulmuş.

**Ölçüt bir kez sahte aday üretti:** dosya eşleştirmem `<id>*` arıyordu, oysa
video dosyaları `<kısa-id>-videos.json` biçiminde (`aml-videos.json`,
konu `aml-ana`). `aml-ana` video "hedefi yok" göründü; gerçekte dosya var.
Adlandırma sözleşmesi dizinden dizine değişiyor — eşleştirme ölçütü bunu
bilmeden sayı üretmemeli.


### 410 konu sayfasının HEPSİ tarandı — 10 iskelet konu çıktı

Örneklemle değil, tamamıyla ölçüldü (canlıda, sitemap'ten alınan 410 adres):
**hepsi 200, hepsinde tam bir `<h1>`.** Yani hiçbir konu sayfası kırık değil.

Ama gövde uzunluğu ölçülünce beş sayfa aykırı çıktı; içerik bölgesi
(`[data-readable]`) ayrı ölçülünce sebep netleşti:

| konu | okunabilir içerik | bölüm |
|---|---|---|
| `hematoloji/talasemiler-ana` | **40 krk** | 1 |
| `hematoloji/yapim-azligi-anemiler` | 70 | 1 |
| `hematoloji/hematopoez` | 87 | 1 |
| `hematoloji/hemofili-a` | 94 | 1 |
| `endokrinoloji/addison` (sağlıklı kıyas) | **5025** | 7 |

"Talasemiler" sayfasının okunabilir içeriğinin TAMAMI şu cümle:
*"Hemoglobin elektroforezi ile tanı konur."*

**DENETİMDE BOŞLUK VARDI.** `konu-denetim` "hiç bölümü olmayan konu" sayıyordu;
tek bölümü olan ama gövdesi 29 karakter olan bir konu oradan TEMİZ geçiyordu.
Denetim artık gövde uzunluğunu da ölçüyor.

**Eşik VERİDEN seçildi, uydurulmadı:** 410 görünür konunun ortanca gövdesi
**3016** karakter, %5'lik dilim **405**. 300 karakter bu dilimin de altında,
yani yalnızca tartışmasız aykırıları işaretliyor.

**HUB İLE YAPRAK AYRILDI** — "sınıfın adı arızanın şekli değildir" dersinin
uygulaması. Çocuğu olan konu bir gezinme sayfasıdır, kısa olması BEKLENİR:

| kova | adet | anlamı |
|---|---|---|
| iskelet YAPRAK | **10** | gerçek içerik boşluğu (9'u hematoloji, 1'i onkoloji) |
| kısa HUB | 7 | beklenen — ayrı listeleniyor, toplama girmiyor |

**ÖLÇÜT İKİ KEZ DÜZELTİLDİ ve ikisi de öğretici:**

- **Gövde İKİ ayrı anahtarda:** `text` ve `html`. İlk denemede yalnızca `html`
  arandı ve `addison` **0 karakter** çıktı — oysa canlıda 5025 basıyor. Bir
  şemanın tek biçimli olduğunu varsayma; anahtarları SAY.
- **Çocuk sayarken ebeveyn referansı normalleştirilmeli** (`Ön-hipofiz` ↔
  `on-hipofiz`). Uygulamada `slug-eslestir.ts` bunu zaten yapıyor; ölçüm de
  yapmazsa sapan referanslı konu "çocuğu yok" sanılır.

**İki yöntem uyuştu:** betiğin çıktısı, ayrıca yazılan bağımsız bir ölçümle
birebir aynı (10 yaprak, 7 hub, aynı uzunluklar).

CI kapısı DEĞİL: içerik yazmak kullanıcının işi, bu liste yalnızca nerede
eksik olduğunu ölçüyor. Sınıf `SENDE-KALANLAR`da kayıtlı DEĞİLDİ.


### Derleme UYARI veriyor ve turlardır okunmamış — ölçüldü, zararsız

Turlardır derleme kapısı `✓ Compiled successfully` satırına bakılarak
geçiliyordu. Günlüğün başında başka bir satır duruyor:

```
⚠ Compiled with warnings in 1087ms
```

Bu, `link-denetim` bulgusunun aynısı: **rapor bir şey söylüyor, kimse
gövdesini okumuyor.** Okundu — iki uyarı bloğu var ve ikisi de aynı kaynaktan:

```
./node_modules/jose/dist/webapi/lib/deflate.js
A Node.js API is used (CompressionStream) which is not supported in the Edge Runtime.
  ← @auth/core/jwt.js ← @auth/core/lib/init.js
```

Üçüncü taraf: `jose`, NextAuth'un bağımlılığı. `middleware.ts` Edge
Runtime'da çalıştığı için uyarı oradan geliyor.

**ZARARSIZ OLDUĞU VARSAYILMADI, DAVRANIŞLA ÖLÇÜLDÜ.** `CompressionStream`
yalnızca SIKIŞTIRILMIŞ JWE için gerekiyor ve NextAuth onu kullanmıyor; yol
hiç çalışmıyor. Middleware'in eşlediği üç desenin üçü de canlıda sürüldü:

| yol | indiği yer |
|---|---|
| `/kayseritip` · `/kayseritip/slaytlar` | `/giris?gerekli=kayseritip` |
| `/api/kayseritip/deneme` | `/giris?gerekli=kayseritip` |
| `/admin/content/topics` | `/giris` |
| **negatif kontrol** — `/topics` | yönlendirilmiyor |

Yani kapı çalışıyor, uyarı gerçek bir kırılmaya karşılık gelmiyor. Yine de
günlükte durmaya devam ediyor; bağımlılık güncellenince kaybolabilir.

**Kayda değer ayrım:** `/admin/*` `/giris`e SEBEP PARAMETRESİZ gidiyor,
`/kayseritip/*` ise `?gerekli=kayseritip` ile. Yani yönetim alanına giden
ziyaretçi neden yönlendirildiğini görmüyor. Bu bir tutarsızlık gibi duruyor
ama bilinçli de olabilir: `/admin` diye bir alanın VARLIĞINI ve yetki
gerektirdiğini söylemek gereksiz bilgi verir. Ölçüldü, not edildi,
DEĞİŞTİRİLMEDİ.

### Paket boyutları ölçüldü — aykırı rota yok

Hiç bakılmamış bir ölçüt: ilk yük (First Load JS). Telefon verisiyle çalışan
bir asistan için gerçek bir maliyet.

215 rota tarandı. Paylaşılan taban **102 kB**; en ağır rota
`/calisma-alanim` **123 kB**, yani tabanın yalnızca 21 kB üstünde. Aralık
103–123 kB arasında sıkışık — **aykırı rota yok**.

| rota | ilk yük |
|---|---|
| `/calisma-alanim` | 123 kB |
| `/[lang]/premium` | 121 kB |
| `/[lang]/premium/ydus/profil` | 119 kB |
| `/profile` | 118 kB |
| `/tools/abg` | 117 kB |

Kıyas için Next.js'in kendi yönergesi 130 kB üstünü incelemeye değer sayar;
en ağır rota bunun altında. Bu taraf bugün bir iş listesi üretmiyor.


### Laboratuvar girdilerinde BİRİM ilanı — dokuz araç ölçüldü, temiz

Taranmamış bir güvenlik sınıfı: birimi ekranda yazmayan laboratuvar alanı.
Kreatinin mg/dL mi µmol/L mi — karıştırılırsa sapma **88 kat**. Aynı belirsizlik
glukoz (×18), kalsiyum (×4), bilirubin (×17) için de var; `unit-converter`
zaten bu yüzden duruyor.

Ölçüm tarayıcıda, ad HESAPLATILARAK yapıldı (kaynak grep'lenmedi — belgedeki
kural). Dokuz araç, 21 sayısal alan:

| araç | alan | birimsiz |
|---|---|---|
| `egfr` · `kdigo-aki` · `meld-na` | kreatinin, bilirubin, sodyum | 0 |
| `homa-ir` · `ogtt` | glukoz, insülin | 0 |
| `corrected-calcium` · `anion-gap` · `conut` · `glasgow-blatchford` | kalsiyum, albümin, BUN | 0 |

`meld-na`daki **INR** birimsiz ama bu doğru: INR bir orandır, birimi yoktur.
Ölçüte "oransal" muafiyeti konuldu, yoksa gerçek olmayan bir kusur sayardı.

**ÖLÇÜT İKİ KEZ ÇÖPE ÇIKTI ve ikisi de belgede kayıtlı tuzakların tekrarı:**

- **Kaynakta `label: "…"` aramak.** O kalıp bu depoda puanlama ŞIKLARINDA da
  kullanılıyor; tarama "Yok", "DÜŞÜK RİSK", "REMİSYON" gibi sonuç etiketlerini
  girdi adı sandı ve 25 araçlık sahte liste üretti. Ad kaynaktan okunmaz,
  tarayıcıda hesaplatılır.
- **Türkçe kelime sınırı, üçüncü kez.** `üre` deseni **"süre"** içinde
  eşleşiyor; "üre alan araçlar" listesi bu yüzden neredeyse bütün infüzyon
  araçlarını kapsadı. `bun` da başka kelimelerin içinden geliyordu.

Kapsam notu: dokuz araç, belirsiz birimli analiti olan en yüksek riskli
kümeden seçildi. 131 aracın tamamı taranmadı; "hepsi temiz" DENMİYOR.


### "Kod bunu zaten onarıyor" iddiası CANLIDA sınandı — doğru çıktı

`asili-denetim` ebeveyn adı sapmış tek kaydı raporlarken **"KOD BUNLARI ZATEN
ONARIYOR, elle düzeltme gerekmez"** diyor. Belgedeki kural gereği bu iddiaya
güvenilmedi, ölçüldü — ve doğru çıktı.

Vaka: `endokrinoloji/akromegali-ve-gigantizm` dosyasının ebeveyni
`"Ön-hipofiz-hastaliklari-giris"` yazılmış; gerçek dosya
`on-hipofiz-hastaliklari-giris`. Fark hem büyük harf hem Türkçe aksan.

Canlıda ölçüldü: konu ebeveyn sayfasında **görünüyor** ve `ebeveyniCoz`
(`lib/slug-eslestir.ts`) bütün konuların ebeveynine uygulanıyor — kodun kendi
yorumu zaten akromegaliyi örnek veriyor.

**ÖLÇÜM İKİ KEZ YANLIŞ YERE BAKTI ve ikisi de öğretici:**

- **Branş sayfasında arandı, orada yok.** Branş sayfası yalnızca ÜST DÜZEY
  konuları listeliyor (endokrinolojide 18 bağlantı) artı yetimler için
  "Diğer Konular". Akromegalinin ebeveyni çözüldüğü için yetim değil, yani
  orada bulunmaması DOĞRU. Hiyerarşi ebeveynin kendi sayfasında açılıyor.
- **"Alt Başlıklar"da beklendi, "İleri Okuma"da bulundu** ve bir an kusur
  sanıldı. Üç bölümün anlamı farklı:

| bölüm | ne listeler |
|---|---|
| Alt Başlıklar | kendi çocuğu OLAN çocuklar (hub) |
| İleri Okuma | kılcal çocuklar — kendi çocuğu olmayan yapraklar |
| İlgili Konular | etiket akrabalığı, branş sınırı gözetmeden |

Sayıldı: `hiperprolaktinemi-ve-prolaktinoma` **3 çocuk** taşıyor (hub →
Alt Başlıklar), `akromegali-ve-gigantizm` **0** (yaprak → İleri Okuma).
Yani yerleşim tasarım gereği; sapma değil.

**Ders: bir yüzeyde "yanlış yerde" görünen şeyi kusur ilan etmeden önce, o
bölümlerin NE LİSTELEDİĞİNİ kaynaktan oku.** Bölüm adı ("Alt Başlıklar")
kapsamı anlatmıyordu; kod anlatıyordu.

`asili-denetim`in kalan 45 kaydı içerik kararı: 18'i `hidden` bayrağı,
27'si hiç yazılmamış üst başlık (tıbbi sınıflandırma). İkisi de kullanıcının
sorumluluğunda.


### AYNI SINIF, İKİ AYRI ARIZA — bedelini arızanın şekli belirliyor

`konu-denetim` "etiket dengesi bozuk bölüm (görünür bedeli AYRICA ölçülmeli):
3" diyordu, yani kendi açık sorusunu taşıyordu. Bu tur kapatıldı — ve
kapatırken az kalsın belgede ÇÜRÜTÜLMÜŞ bir iddia tekrar edilecekti.

Betikte kayıtlı çürütme şuydu: bir dönem "bugün görünür bedeli yok" yazıyordu,
YANLIŞTI — `ektopik-acth-sendromu.json`da kapanmamış etiketler yüzünden tek
bir `<strong>` **1740 karakteri** sarıyordu. Aynı iddiayı yapmak üzereyken
notu okumak durdurdu.

**Ama iki arıza aynı şey değil:**

| arıza | mekanizma | bedel |
|---|---|---|
| kapanmamış AÇILIŞ (`<strong>` açık kalıyor) | sonraki gövdeyi YUTAR | 1740 karakter, gerçek hasar |
| fazladan KAPANIŞ (`</em>` karşılıksız) | ayrıştırıcı ATAR | yok |
| bozuk YUVALAMA (`</em>` açıkken `strong`) | ayrıştırıcı kendi düzeltir | yok |

Bugünkü üç kayıt ikinci ve üçüncü şekilde. Üç sayfa da canlı render edilip
betiğin KENDİ tarif ettiği yöntemle ölçüldü:

| sayfa | en uzun `em` | en uzun `strong` | eşik (250) aşan |
|---|---|---|---|
| `men1-gastrinoma-zes` | 13 | 52 | 0 |
| `anemiler` | 118 | 89 | 0 |
| `miyeloproliferatif` | 42 | 40 | 0 (1 iç içe vurgu, zararsız) |

**Sonuç: bu üç kaydın görünür bedeli sıfır** ve içerik dosyalarına dokunmayı
gerektirmiyor. **Genelleme YAPILMADI** — kapanmamış açılış hâlâ hasar
veriyor, liste o yüzden basılmaya devam ediyor.

**Aktarılabilir kural: bir sınıfı "zararsız" ilan etmeden önce, elindeki
kaydın o sınıfın HANGİ arızası olduğunu ayır.** "Etiket dengesi bozuk" tek
bir etiket altında üç farklı mekanizma topluyordu ve yalnızca biri zarar
veriyor. Sınıfın adı, arızanın şekli değildir.

**Yan bulgu — denetimin bildirdiği 4 çift başlığın dördü de SENDE-KALANLAR'da
kayıtlı**, yani kullanıcının takip ettiği iş; dokunulmadı. İkisi belgede
kayıtlı gerçek içerik kazaları ve hâlâ duruyorlar: `hiperkalsemi-ve-
hiperparatiroidi.json` beş bölümüyle baştan sona asit-baz, `akut-lenfoblastik-
losemi-all.json` baştan sona MDS anlatıyor. Bir denetim raporundaki kaydın
"açık" görünmesi, senin işin olduğu anlamına gelmiyor — önce takip
listesinde mi diye bak.


### Raporun KUYRUĞU "temiz" derken gövdesi 27 kusur sayıyordu

Elle çalıştırılan denetimler sağlık kontrolü olarak sürüldü. `link-denetim`in
son satırı **"kırık bağlantı yok."** diyor; bu oturumda ona bakılıp "temiz"
sonucuna varıldı. Başa dönülünce özet satırları başka şey söylüyordu:

```
kendi alanında duran adres: 9 (8'i kırık)
kaynakta düz yazılmış adres: 123 (19'u kırık)
```

**27 kırık adres varken rapor kuyrukta "kırık yok" basıyordu.** Sebep: o satır
yalnızca CI KAPISI olan sınıf için yazılmıştı ve uyarı sınıfındaki kırıkları
saymıyordu. Raporu `tail` ile okumak olağan olduğu için yanıltıcıydı.

Deponun kendi kuralının yeni bir yüzü: *"0 kusur ile 0 öge ekranda aynı
görünür"* — bir tarama neyi ölçtüğünü ve **neyi KAPI SAYMADIĞINI** aynı yerde
söylemeli. Kapanış satırı artık şunu diyor:

> CI kapısı: kırık bağlantı yok — ama UYARI sınıfında 27 kırık adres var.

CI davranışı DEĞİŞMEDİ: çıkış kodu 0, sayılar birebir aynı. Değişen yalnızca
kapanış satırı.

**27 UYARININ 27'Sİ DE ÖLÜ KODDA** — ölçüldü ve betiğin başına yazıldı,
yeniden kovalanmasın diye. Ulaşılabilirlik "içe aktarılmış mı" ile DEĞİL,
"rotadan ulaşılıyor mu" ile ölçüldü:

| kaynak | kırık | neden ulaşılmıyor |
|---|---|---|
| `app/config/nav.ts` | 12 (`/sections/*`) | sıfır içe aktaran |
| `HeaderClient.tsx` | 1 | sıfır içe aktaran |
| `app/tools/data/ads.ts` | 3 | yalnızca `AdBanner` çağırıyor, o da ölü |
| `app/admin/**` | 2 (`/admin`) | rotada ama `app/admin/page.tsx` YOK; middleware `/giris`e yönlendiriyor |
| premium video/vaka JSON | 8 | yalnızca `_hematoloji`, `_romatoloji` okuyor |

**Davranışla doğrulandı, kaynakla değil:** `/sections/nefroloji` 404,
`/tr/premium/video/izle` 404, `/admin` → `/giris`.

**`grep` ile ulaşılabilirlik ölçerken bir tuzak daha:** `nav` adını aramak
30 dosya döndürdü — çünkü HTML `<nav>` etiketi her yerde geçiyor. İçe aktarma
satırını aramak (`from ".../config/nav"`) gerçek sayıyı verdi: **sıfır**.
Belgedeki "ad araması tek başına yanıltır" kuralının bu turdaki hâli.

**Not edilen borç:** `nav.ts` on iki bağlantısını `/sections/<branş>` diye
yazıyor, oysa sitenin gerçek yolu `/topics/<branş>`. Dosya canlıya bağlanırsa
on iki kırık bağlantı BİRDEN açılır — bağlamadan önce yollar düzeltilmeli.

Video rotasına DOKUNULMADI: SENDE-KALANLAR 24'te duran bir ürün kararı.


### İLANI SEN YAZDIYSAN DA ÖLÇ — eklediğim düğme hedefte karşılıksız kaldı

Premium giriş sayfasına dönüşüm eylemi eklendikten sonra oradan `/uyelik`e
sekiz yeni bağlantı açıldı. Sonraki tur o bağlantıların VARIŞ NOKTASI ölçüldü
— kendi değişikliğinin sonucunu doğrulamak da işin parçası.

`/uyelik` sayfasının ilk başlığı: **"Premium henüz satışta değil"**. Sayfa
fiyatın neden olmadığını açıkça söylüyor:

> Sınav materyali hâlâ yazılıyor ve hazır olmadan para almak istemiyoruz.
> Bu sayfada bu yüzden fiyat göremezsin — satış açıldığında burada olacak.

Oysa eklenen birincil eylem **"Planları gör"** diyordu ve yedi kilitli kart
da "üyelikle açılır — planları gör" vaat ediyordu. Yani bir FİYAT LİSTESİ
vaat ediliyor, hedef onu karşılamıyordu.

**Bu, bu depoda tur tur avlanan "ilan ile gerçek ayrışıyor" sınıfının ta
kendisi — ve bu kez ilanı BEN yazmıştım.** Sınıfı kovalarken kendi
etiketinde üretmek en kolay hata; çünkü kendi eklediğin metni "zaten doğru"
sayıp ölçmüyorsun.

Çare, etiketi sayfanın BUGÜN anlattığı şeye bağlamak: `/uyelik` ücretsiz ve
premium ayrımını, kapsam sayılarını (41 başlık · 378 soru · 1492 kart)
anlatıyor. **"Neler dahil?"** bunu birebir karşılıyor ve satış açıldığında da
yanlışlaşmıyor — yani ileride ikinci bir ayrışma üretmiyor. Şeridin gövde
metni de hizalandı ("Premium henüz satışta değil — … satış açıldığında burada
duyurulur").

| ölçüt | sonuç |
|---|---|
| görünür bağlantı | 10 → 10 (gerileme yok) |
| fiyat vaat eden etiket | **0** (Planları gör / fiyat / satın al) |
| iki sayfa aynı şeyi söylüyor mu | evet, ikisinde de "henüz satışta değil" |
| kilitli kart adları | `<konu>: üyelikle açılır — neler dahil?` (ayırt edilebilirlik korundu) |

**Ölçüt: bir CTA eklerken hedefi aç ve oku.** Etiketin vaat ettiği şey
hedefte var mı? Bu depoda ilan–gerçek ayrışması defalarca kusur üretti;
yeni yazılan ilan da aynı ölçüte tabidir.

**Yan not — derleme süresi tek başına kanıt değil.** Bu turda derleme
8.3 saniyede bitti (öncekiler 47–89 s) ve bir an "gerçekten derledi mi"
şüphesi doğdu. İkinci yöntem: günlükte `Generating static pages (623/623)`
ve rota tablosu var mı diye bak. Vardı — hızın sebebi sıcak önbellekti.


### Premium giriş sayfası: plan SABİT yazılıydı, sayfa da çıkmazdı

Kullanıcı bildirdi (premium girişi geliştirilmeli). `/tr/premium` ölçüldü ve
iki ağır kusur çıktı — biri gözle hiç görünmüyordu.

**1. Plan sabit yazılıydı; ödeme yapan üye premium göremiyordu.**

```
const plan: PlanType = "free";   // useSession var ama yalnızca status alınıyor
```

`auth.config.ts` planı token'a ve oturuma YAZIYOR, yani değer orada duruyordu
ama okunmuyordu. Premium üye de bu sayfada "Free" rozeti ve yedi kilitli kart
görüyordu. **Aynı sabit `/profile`ta da vardı** (`useState<PlanType>("free")`).

Okuma tek yere alındı: `app/lib/plan.ts`. İki yerde ayrı yazılsaydı yine
ayrışırdı. Tanınmayan plan değeri en dar role düşüyor — bilinmeyen bir plana
yüksek rozet vermek, olmayan bir erişimi VAAT ETMEK olurdu.

**2. Sayfanın TAMAMINDA sıfır bağlantı, sıfır düğme.** `(ydus)` grubu
AppShell almadığı için header/nav landmark'ı da yok. Yedi kilitli kart aynı
cümleyi yedi kez tekrarlıyor, hiçbiri tıklanabilir değil ve üyelik almanın
yolu hiçbir yerde yazmıyordu. Tek çıkış tarayıcının geri tuşuydu.

| ölçüt | önce | sonra |
|---|---|---|
| görünür bağlantı | **0** | **10** |
| tekrarlanan kilit cümlesi | 7 | 0 |
| özdeş `<h3>` "Özel İçerik" | 7 | 0 |
| kilitli kart | ölü bilgi kutusu | `/uyelik` bağlantısı, ayırt edilebilir adla |
| birincil eylem | yok | "Planları gör" (211×44) |
| çıkış yolu | yok | başlıkta siteye dönüş + "Ücretsiz kütüphane" |

Kilitli kartın adı konusuyla birlikte veriliyor ("Aralıklı Tekrar Radarı:
üyelikle açılır — planları gör"); yedi kart aksi hâlde ekran okuyucuda
birbirinin aynı okunurdu.

**Rozet sözlüğü ŞEMAYLA HİZALANDI.** `lib/models/User.ts` şeması
`free | member | premium` üretiyor; rozet listesi ise `free | premium | pro`
idi. İki yönde birden ayrışıyordu: `member` planlı kullanıcının rozeti YOKTU
(ve "Free" görünüyordu), `pro` ise veritabanının hiç ürettiği bir değer
değildi. Ölçüt: **rozet listesi şemayı kapsamalı.**

**Modül SAYISI bilerek yazılmadı** ("yedi modül" denmiyor) — kart eklenince
metin bayatlardı. Belgedeki "sayı yazma, saydır" kuralının metin tarafı.

**BELİRLEYİCİ NEGATİF KONTROL — geçici dev rotası, veritabanına YAZMADAN.**
Gerçek bir premium hesapla giriş yapmak yazma gerektirirdi. Bunun yerine
`SessionProvider`a sahte premium oturum verilip sayfa render edildi:

| ölçüt | ücretsiz | premium |
|---|---|---|
| kilit şeridi | var | **YOK** |
| kilitli kart | 7 | **0** |
| `/uyelik` bağlantısı | 9 | **0** (ödeme yapmışa satış gösterilmiyor) |
| modül içerikleri | gizli | **üçü de görünüyor** |

Rota silindi; `/zz-olcum-premium` 404, ana sayfa ve `/tr/premium` 200,
derleme hatası izi yok (geçici rota silmenin dev sunucusunu öldürme riski
belgede kayıtlı — bu turda oluşmadı, ayrıca doğrulandı).

**KOŞUM DENENDİ VE TUTMADI — sebebi belgede zaten yazılı.** Önce `window.fetch`
sarmalanıp `/api/auth/session` sahte premium döndürülmek istendi. İşe
yaramadı: iframe `about:blank`ten `/tr/premium`e GEZİNİNCE JS bağlamı
sıfırlanıyor ve `window` üzerindeki sarmalayıcı kayboluyor. Oturum gibi
SAYFA KURULURKEN okunan bir şeyi koşumla değiştirmek istiyorsan gezinme
sonrası enjeksiyon çalışmaz; geçici rota gerekiyor.

**KENDİ EKLEDİĞİM KUSURU ÖLÇÜM YAKALADI.** Geri bağlantısına önce
`hidden sm:inline-block` verilmişti. Ücretsiz kullanıcıda kilit şeridi çıkış
veriyor, ama PREMIUM kullanıcıda şerit de yok — o kombinasyonda sayfa mobilde
YİNE sıfır bağlantıya düşerdi. Yani düzelttiğim kusuru, düzeltirken bir alt
kümede geri getirmiştim. Ders: bir çıkış yolu eklerken **onu gizleyen her
koşulu** ve o koşulun ötekilerle KESİŞİMİNİ ölç.

Ölçüldü — 320 / 375 / 1280 üçünde de geri bağlantısı görünür (adı
`aria-label` ile korunuyor, dar ekranda yalnızca ok çiziliyor), yatay taşma
yok, 10 görünür bağlantı. Kontrast 34 ögede ölçüldü (degrade zemin
`background-image`den okunarak) — **kusur 0**.


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

### Binlik ayırıcı: AYRIŞTIRICIYI düzeltmek YETMEDİ, kapı da aynı ölçüde bakmalıydı

`parseLocaleNumber` yalnızca virgülü ondalık sayıyordu. Türkçede nokta BİNLİK
ayırıcıdır ve `parseFloat` gerisini yanlış okuyordu. Canlıda ölçülen en ağır
vaka `antikoagulan-geri-dondurme`:

```
5000  Ü heparin  ->  50 mg protamin     doğru
5.000 Ü heparin  ->  0.1 mg protamin    500 KAT DÜŞÜK
```

Aktif kanamada verilen bir geri döndürme ajanında, uyarı olmadan.

**VAKALAR EŞİT DEĞİL — yalnızca BELİRSİZ OLMAYANLAR düzeltildi.** Bu bir
tasarım kararı, kapsam kısıtı değil:

| girdi | okuma | karar |
|---|---|---|
| `1 200` | hiçbir dil boşluğu ondalık saymaz | **1200** — düzeltildi |
| `1.200,5` | Türkçede tek okuma var | **1200.5** — düzeltildi |
| `1.2345` | 3'ten fazla hane, grup olamaz | 1.2345 — zaten doğruydu |
| `1.200` | TR'de 1200, EN'de 1.2 | **DOKUNULMADI** — sessiz tahmin yeni bir yanlış sayı sınıfı açardı |

**ASIL DERS İKİNCİ ADIMDA:** düzeltme yalnızca `parseLocaleNumber`a konunca
ölçüm `antikoagulan-geri-dondurme`de **hiçbir sonuç basılmadığını** gösterdi.
Sebep, deponun tekrar eden "iki gerçeklik" sınıfıydı — aynı değer İKİ ayrı
ölçütle yargılanıyordu:

```
parseLocaleNumber("3 000")  ->  3000     (düzeltildi)
sayiGirildiMi("3 000")      ->  false    (ham dizeye KENDİ katı regex'i)
```

Sonuç, tek uygulamada aynı girdi için iki davranış: kapısı olmayan `pni`
36.0 hesaplıyor, kapısı olan `antikoagulan` "değer girin" diyor. Çare
normalizasyonu `sayiNormalize`a alıp ikisini de oradan beslemek.

**Ayrıştırıcıyı gevşetirken kapıyı da AYNI ölçüde gevşetmezsen, düzeltme
kullanıcıya HİÇ ulaşmaz** — üstelik sessizce, çünkü boş sonuç kusur gibi
görünmüyor. Ölçüt: bir girdi yardımcısını değiştirdiğinde, o girdinin
geçtiği KAPILARI da say (`sayiGirildiMi` 10 araçta).

**Doğrulama üç katmanlı ve üçü de gerekliydi:**

- **27 vakalık matris, İKİ fonksiyon birden** — sayı ve kapı ayrı ayrı.
  Kapıyı ölçmeseydim ayrışma hiç görünmezdi.
- **Eski sürüm YAN YANA sürüldü** (`git show HEAD:… > eski.ts`) ve sapan
  vakalar listelendi: tam olarak onaylanan 5 vaka sapıyor, kalan 22'si iki
  fonksiyonda da birebir aynı. "Davranış değişmedi" iddiası böyle ölçülür —
  beklenen sonucu yazmak yetmez, ESKİSİYLE farkı bastır.
- **Tarayıcıda iki araç** (`pni` 36.0 · `antikoagulan` 30 mg), her biri
  belirsiz vaka ve çöp girdi negatif kontrolüyle.

**`node --experimental-strip-types` `.tsx` SÜREMİYOR** (`ERR_UNKNOWN_FILE_EXTENSION`).
Çare dosyayı `.ts` uzantısıyla **birebir kopyalamak** — yeniden yazılmış bir
kopyayı değil gerçek kaynağın baytlarını sürmüş olursun. Dosyada JSX varsa
bu yol kapalıdır.

**Görünmez NBSP dize eşleştirmesini kırar.** Eski karakter sınıfı `[.\s ]`
görünüşlüydü ama içinde gerçek bir U+00A0 taşıyordu; Edit'in `old_string`i
hiç tutmadı ve hata "başka yerde" gibi göründü. İki ders: (1) eşleşmeyen bir
düzenlemede baytlara bak (`od -c | grep '302 240'`), (2) satır aralığıyla
çalışan bir yama betiği görünmez karakterden etkilenmez. Sınıf sadeleştirildi
çünkü JS'de `\s` zaten U+00A0'yı kapsıyor — ve bu iddia matrise NBSP'li bir
vaka konarak ölçüldü, varsayılmadı.

### "BOŞ MU" DENETİMİ ÇÖPÜ ELEMEZ — meşru sıfırı korumaya çalışan kapıların ortak kusuru

Belgede zaten yazılı iki kural var ve ikisi de doğru:

1. Çöp girdiden klinik etiket üretme (`parseLocaleNumber` her şeyi 0'a çevirir).
2. Meşru sıfırı ayır — SOFA'da idrar 0 anüridir, DAS28'te eklem 0 remisyondur.

İkisini birden sağlamanın yolu olarak dört araçta aynı kalıp yazılmış:
**"alan BOŞ değilse geçerlidir"**. Kalıp 1. kuralı DELİYOR ve bu ölçüldü:

| araç | çöp girdi | ekranda |
|---|---|---|
| `sofa` | idrar `"abc"` | RENAL **+3** · toplam **3** — hasta ANÜRİK ilan ediliyor |
| `das28` | hassas eklem `"abc"` | **2.38 · "Remisyon"** — tedaviyi hafifleten yön |
| `spot-urine` | idrar üresi `"abc"` | osmolal açık **210** · "artmış NH₄⁺" — **doğrusunun TERSİ** (67 · "yetersiz") |
| `anc` | segment `%0` + band `%0` | **hesaplamıyordu** — ters yön: MEŞRU agranülositozu reddediyordu |

Sebep tek: `"abc"` boş DEĞİLDİR, `parseLocaleNumber` onu 0'a çevirir ve alt
sınır 0'a izin verdiği için kapı geçirir. Yani kapı, elemek için konduğu şeyi
geçiriyor — üstelik her seferinde kendi yorumunda "meşru sıfırı koruyorum"
diye yazarken.

**Doğru ölçüt ÜÇ DURUMLU ve `sayiGirildiMi` tam bunu veriyor:**

```
""     -> false   girilmemiş
"abc"  -> false   sayı değil
"0"    -> true    girilmiş ve sıfır  ← korunması gereken durum
```

`ham.trim() !== ""` yalnızca ilkini ayırıyor; ikincisini üçüncüsüyle
karıştırıyor. Dördüncü araç (`anc`) aynı sorunun ayna hâliydi: orada kapı
`yuzdeToplam > 0` diyerek çöpü eliyordu ama agranülositozu da eliyordu.

**Tarama ölçütü ve SINIRI.** `parseLocaleNumber` kullanan 59 aracın 21'inde
"boş mu" denetimi var, ama çoğu güvenli: alt sınır `>= 1` ya da `> 0` ise çöpün
ürettiği 0 zaten aralıktan düşüyor. Şüpheli alt küme **alt sınırı 0'a izin
verenler**. Kalan beş aday tek tek karara bağlandı:

| aday | verdikt |
|---|---|
| `sofa` · `das28` · `spot-urine` | KUSURLU → `sayiGirildiMi` |
| `fosfat-replasman` | temiz — sınırlar 20 ve >0 |
| `unit-converter` | temiz — 21 analitin hepsinde alt sınır ≥ 0.1 |
| `abg` | temiz — ayrı `SINIRLAR` makullük kapısı çöpü yakalıyor |

`unit-converter` ve `abg` KAYNAKTAN sayılarak değil TARAYICIDA sürülerek
kapatıldı: alt sınırları çeken regex `0.1`in başındaki sıfırı yakalayıp sahte
aday üretti. Davranışa bakmak, sınır tablosunu ayrıştırmaya çalışmaktan hem
ucuz hem kesin.

### Rozet de bir İDDİA — SOFA'da toplam "–" derken organ rozeti "+3" diyordu

Aynı turda ikinci bir ayrışma çıktı: idrar alanı BOŞKEN toplam SOFA `–`
basıyor ama yanındaki "3. RENAL **+3**" rozeti duruyordu. Araç aynı ekranda
hem "hesaplayamam" hem "renal skor 3" diyordu.

Çare rozetleri küresel `makul`e bağlamak DEĞİL — o zaman PaO₂/FiO₂ alanına
düşen bir yazım hatası, geçerli kreatinin ve idrardan hesaplanan RENAL
rozetini de silerdi. Geçerlilik **organ başına** tutuluyor (`gecerli.resp`,
`gecerli.ren`…) ve her rozet kendi alanlarına bakıyor.

Yalıtım ölçüldü: PF'ye `"abc"` yazıldığında SOLUNUM `–` oluyor, RENAL `+0`
kalıyor, toplam `–`. Kardiyovasküler dalda doz alanı yalnızca bir vazopressör
seçiliyse hesaba giriyor, o yüzden geçerliliği de yalnızca o dalda aranıyor.

**Genel kural: ekranda duran her sayı bir iddiadır ve kapının varlığından
haberdar olmalı.** Toplamı kapılayıp parçaları kapılamamak, kullanıcıya
kendisiyle çelişen bir ekran gösteriyor.

### Ölçüm penceresini DAR tutmak sahte "AYRIŞTIRILAMADI" üretir

Bu turda üç kez oldu ve üçünde de bir an aracın bozulduğu sanıldı. Sonuç
bölgesini `(.{0,58}?)` gibi sabit bir pencereyle yakalayan ölçüt, etiket +
açıklama 69 karakter olunca eşleşmiyor ve rapor "AYRIŞTIRILAMADI" diyor.

Belgedeki "desen tahmin etme, gerçek dizeyi oku" kuralının pencere tarafı:
önce ham metni bastır, uzunluğu GÖR, sonra deseni yaz. `.*?` ile sınırsız
tembel eşleşme kullanmak sabit bir tavan yazmaktan daha güvenli.

Aynı turda ölçüt bir kez de yanlış yeri yakaladı: `spot-urine`da "Osmolal"
araması sonuç kartını değil SEKME ETİKETİNİ buldu (`indexOf` ilk eşleşmeyi
verir). Sayfada aynı kelime birden çok yerde geçiyorsa çapayı benzersiz bir
dizeye at — burada `"İdrar Osmolal Gap (UOG ≈ 2×[NH₄⁺])"` oldu.

### Meta testin ölçüm kontrolü ZAYIFTI — üç denetim "sınandı" görünüp hiç sınanmıyordu

`cop-kapi-denetim` yazılıp `yorum-korlugu-denetim`in listesine eklendi. Meta
test "temiz" dedi. **Sahteydi** — ve bunu fark ettiren şey, tuzağın kendisinin
belgede kayıtlı olması oldu.

Meta testin ölçüm kontrolü şuydu: *çıktıda herhangi bir sayı > 0 ise denetim
tohumu ölçmüştür.* Yeni denetim yalnızca `parseLocaleNumber` içeren dosyaları
açıyor; tohumda o çağrı YOKTU, yani dosya hiç okunmadı. Ama rapor
`taranan tsx: 2` bastığı için ölçüt tatmin oldu.

Yani **"0 kusur ile 0 ölçüm aynı görünür" tuzağı, tam da onu yakalamak için
yazılmış testin İÇİNDE tekrarladı.**

**Doğru ölçüt KARŞILAŞTIRMALI: aynı denetimi BOŞ bir ağaçta da sür.** İki
rapor birebir aynıysa tohum ölçülmemiştir. Bu ölçüt denetimin hangi sayıyı
bastığını bilmek zorunda değil, yani ileride eklenecek denetimlerde de çalışır.

**Yeni ölçüt ilk çalıştırmada ÜÇ denetimi düşürdü** ve sebep beklenenden
ağırdı: `esik-etiket-denetim`, `renk-cifti-denetim` ve `saydamlik-denetim`
**`--kok` bayrağını hiç desteklemiyordu.** Bayrağı sessizce yok sayıp her
seferinde GERÇEK DEPOYU tarıyorlardı; tohumda `zz-yorum` bulunmadığı için de
"temiz" çıkıyorlardı.

| denetim | boş ağaca yönlendirildiğinde (önce) |
|---|---|
| `esik-etiket` | "461 dosya" — gerçek depo |
| `renk-cifti` | "404 tsx" — gerçek depo |
| `saydamlik` | "404 tsx" — gerçek depo |
| `arayuz` (kıyas) | "0 tsx" — doğru |

Belgedeki tablo bu üçünü "`cd` ile yönlendirilebilir" diye kaydediyordu ve bu
DOĞRUYDU (kökleri `['app','components']`, cwd'ye göre çözülüyor) — ama meta
test onlara `--kok` veriyordu. İki farklı yönlendirme mekanizması, deponun
kendi "iki gerçeklik" sınıfının denetim tarafındaki hâli.

Üçüne de `--kok` eklendi. Doğrulama iki yönlü: boş ağaçta artık **0** ölçüyorlar,
bayrak verilmediğinde sayılar birebir eskisi (461 · 404 · 404), ve üçünün de
kendi `--negatif` kontrolü geçiyor.

**Tohumun kendisi de eksikti** ve iki yerde:

- `parseLocaleNumber` hiç geçmiyordu → yeni denetim dosyayı açmıyordu.
  Tohuma kapısız, bölmesiz bir `const SAYI = parseLocaleNumber("1")` konuldu
  (başka hiçbir denetime aday üretmiyor).
- `renk-cifti` ve `saydamlik`in aradığı şekiller yorumda YOKTU, yani o iki
  denetim ölçülüyor ama körlükleri sınanmıyordu. Eklendi:
  `opacity-60 text-slate-500` ve `bg-amber-500 text-white`.

**Eklenen şekillerin GERÇEK olduğu ayrıca kanıtlandı** — bir tohum şeklinin
yakalanmaması, ölçütün temiz olmasından değil şeklin yanlış yazılmasından da
olabilir. Aynı iki şekil KOD olarak ayrı bir tohuma konuldu: `saydamlik` 1
bulgu, `renk-cifti` `beyaz/amber-500 = 2.15` bastı. Yani kodda yakalanıyor,
yorumda yakalanmıyor — iki yönlü kanıt.

### `cop-kapi-denetim` — dört kontrolü de olan yeni denetim

Sınıf tek turda dört gerçek kusur verdiği için kalıcı denetim yazıldı.

| kontrol | sonuç |
|---|---|
| negatif (kusurlu tohum) | yakalanıyor (2 kapı) |
| pozitif (temiz tohum: alt sınır > 0 · `sayiGirildiMi`) | işaretlenmiyor |
| tarihsel (düzeltme öncesi, `3896b6d`) | **üç gerçek kusur**: das28:40 · sofa:55 · spot-urine:195 |
| yönlendirilebilir | `--kok` |

**`anc` tarihsel kontrolde YAKALANMIYOR ve bu eksik değil, TANIM.** Onun kusuru
sınıfın ayna hâliydi: kapı `yuzdeToplam > 0` diyerek çöpü doğru eliyor ama
meşru sıfırı (agranülositoz) da eliyordu. "Çöp geçiyor" yönü kaynaktan
görülebilir; "meşru sıfır engelleniyor" yönü GÖRÜLEMEZ, çünkü hangi alanda
0'ın fizyolojik olduğu klinik bilgi. O yön ancak aracı sürerek bulunur —
alana "0" yazıp sonuç basılıyor mu diye bakarak.

Bir denetim yazarken sorulacak DÖRDÜNCÜ soru da buradan çıktı: kusur buluyor
mu · yanlış pozitif üretiyor mu · yönlendirilebiliyor mu · **ve ölçütün
göremediği ayna hâli var mı?**

### Ekrana basılan FORMÜL, kaynak tarayan ölçütte kod sanıldı

Rapor denetimleri topluca sürüldü ve `bolme-denetim` bir aday verdi:
`ktv:103`. Belge bu sınıfı "temiz" diye kaydediyordu, yani ya belge bayattı
ya ölçüt. Bakıldı — ölçüttü, ve aday SAHTEYDİ:

```
<p className="… font-mono">eKt/V = spKt/V − (0.6×spKt/V / t) + 0.03</p>
```

Satır kod değil, aracın EKRANA BASTIĞI formül. Denetim `</p>` kapanış
etiketini zaten eliyordu (belgede kayıtlı, 17 sahte bulgu üretmişti) ama
metnin İÇİNDEKİ bölmeyi elemiyordu.

Bu sınıf bu depoda beklenen bir şey: **araçlar aritmetiğini dürüst olsun diye
ekrana yazıyor**, yani formül metni her yerde. Kaynak tarayan bir ölçüt için
yorumlar kadar tehlikeli bir gürültü kaynağı.

**Çare DAR tutuldu ve dar tutulma sebebi ölçüldü.** Genel bir `>…<` süzgeci
yazmak kolay ama `if (x > 0 && y / z < 5)` gibi GERÇEK kodu da yutar ve
kusuru gizler — yani ölçütü gevşetmek burada körleştiriyor. Süzgeç yalnızca
bir AÇILIŞ ETİKETİNİN hemen ardından gelen, süslü parantez taşımayan metni
boşaltıyor.

**Doğrulama iki yönlü ve dokuz tohumlu** (hepsi denetimin `--kontrol` kipine
gömüldü, bir daha elde kurulmasın):

| tohum | beklenen | sonuç |
|---|---|---|
| korumasız bölme | yakalanmalı | ✓ |
| **JSX İFADESİ içinde korumasız bölme** `{500 / kilo}` | yakalanmalı | ✓ |
| **karşılaştırma arasında korumasız bölme** `y / z < 5` | yakalanmalı | ✓ |
| JSX metni (ktv formülü) | işaretlenmemeli | ✓ |
| yorumda geçen bölme | işaretlenmemeli | ✓ |
| dört eski temiz biçim | işaretlenmemeli | ✓ |

İkinci ve üçüncü satır ayırt edici olan: metni ve yorumu eleyen süzgeç gerçek
kodu da yerse denetim körleşir ve kimse fark etmez. **Bir süzgeç eklerken
elediği şeyin AYNA kontrolünü de koy** — "şunu artık görmüyor" ile "şunu da
görmüyor" arasındaki fark yalnızca böyle ölçülüyor.

Sonuç: 18 → 17 bölme noktası, aday 0. Ölçülen sayı da düştüğü için "aday
kayboldu" ile "tarama körleşti" ayrımı raporun kendisinden okunabiliyor.

**Sınıfın kapsamı ölçüldü, varsayılmadı.** Aynı formül metnini taşıyan tohum
operatör tarayan öteki dört denetime de sürüldü — `yuvarlama`, `kapi-kapsam`,
`karar`, `bant`: **dördü de 0 aday**. Körlük yalnızca `bolme`ye özgüymüş,
çünkü formül metninde geçen tek operatör bölme işareti.

### AYNA SINIF SÜRÜLDÜ — `asdas` skorlanamayan tek hastayı REMİSYONDAKİ hasta yapıyordu

Geçen turda "kaynaktan bulunamaz" diye not edilen sınıf (meşru sıfırı ELEYEN
kapı) kaynaktan ADAY üretilerek, kararı ALAN ETİKETİNE bakarak sürüldü.

Ölçüt: `xNum > 0` / `>= 1` biçiminde kapı + alanın ekrandaki etiketi. 59 araçta
177 eşleşme çıktı ama ölçüt gürültülü — puanlama merdivenlerini de kapı sanıyor
(`urineNum >= 500` gibi). Etiketler okununca fizyolojik olarak 0 alabilen
alanlar ayrıldı: ASDAS'ta NRS/CRP/ESR, GH supresyonunda nadir GH, deksametazon
sonrası kortizol, idrar proteini.

**`asdas` KUSURLUYDU ve uç vaka değil.** Kapı beş alanın beşini birden `> 0`
istiyordu; beşi de meşru sıfır alabiliyor ve formüller sıfırı zaten doğru
işliyor (`ln(0+1) = 0`, `√0 = 0`):

| girdi | ekranda (önce) |
|---|---|
| sabah tutukluluğu 0 (çok yaygın) | **"Eksik veri"** |
| periferik eklem 0 (saf aksiyel tutulum) | **"Eksik veri"** |
| CRP 0 · ESR 0 (0–2 mm/sa NORMALDİR) | **"Eksik veri"** |
| hepsi 0 — tam remisyon | **"Eksik veri"** |

Yani araç, cetvelinde "İNAKTİF HASTALIK" bandı taşıyor ama o bandı üretecek
girdiyi reddediyordu: **skorlanamayan tek hasta, iyi olan hastaydı.**

Çare `sayiGirildiMi` + makullük sınırı (NRS 0–10 · CRP 0–500 · ESR 0–200).
Negatif kontrol: dokunulmayan vaka birebir aynı (2.53 / 2.42), düzelen vakalar
elle hesapla tutuyor (0.121×5 + 0.110×5 + 0.073×3 + 0.579×ln6 = 2.41).

### Düzeltme İKİNCİ bir şeyi açığa çıkardı — `- 0.211` sabiti (KARAR BEKLİYOR)

Belgede kayıtlı kural: *"bir kusur ikincisini gizleyebilir; bir düzeltmeden
sonra AYNI aracı yeniden tara."* Tam remisyon vakası ilk kez ulaşılabilir olunca:

```
bütün alanlar 0  ->  ASDAS-CRP 0.00   ·   ASDAS-ESR -0.21
```

ASDAS eksi olamaz ve CRP sürümünde karşılık gelen bir sabit YOK.

**Asıl kanıt iç çelişki:** araç iki varyanta da AYNI eşikleri uyguluyor
(1.3 / 2.1 / 3.5), yani ikisi aynı ölçekte olmak zorunda. Dört vaka ölçüldü,
**üçünde bant ayrışıyor**:

| girdi [pain,dur,pat,bk,CRP,ESR] | ASDAS-CRP | ASDAS-ESR |
|---|---|---|
| [3,3,3,3,5,10] | 2.12 YÜKSEK | 1.76 ORTA |
| [3,3,4,3,5,12] | 2.23 YÜKSEK | 1.91 ORTA |
| [4,3,4,3,5,12] | 2.35 YÜKSEK | 2.03 ORTA |

Sabit kaldırılsaydı son iki satırda ikisi de YÜKSEK olurdu (2.12 · 2.24).
Ayrıca 0.211'lik kayma, ASAS'ın tedavi hedefi olan "inaktif hastalık"
sınırını (1.3) fiilen **1.51**'e taşıyor.

**DEĞİŞTİRİLMEDİ.** Bu, yayımlanmış bir formülün terimini KALDIRMAK olurdu ve
sabitin kaynağı depoda hiçbir yerde yazılı değil (yorum yok, ekranda formül
basılmıyor, tek commit'i toplu bir taşıma). Belgedeki iki kural burada ters
yönde çekiyor: eksi skor tartışmasız yanlış, ama "beklenti tutmadığında önce
beklentiyi sına" da geçerli — ve bu araçta beklentim bir kez zaten yanlış
çıkmıştı (`0.069`/`0.079` yayımlanmış katsayılar sanılmıştı). Ölçüm, kapsam
ve gerekçe kaynağa yazıldı; klinik kaynak kararı kullanıcınındır.

**Aday üreten ölçütün SINIRI da not:** puanlama merdiveni ile geçerlilik
kapısı aynı sözdizimini taşıyor (`x >= N`), o yüzden 177 adayın çoğu sahte.
Betiğe alınmadı — bu sınıfta ölçüt aday bile üretemiyor, kararı alanın klinik
anlamı veriyor.

### Ayna sınıfın kalan üç adayı sürüldü — üçü de kusurluydu, biri BAŞKA bir kusur açtı

`asdas` turundan kalan üç aday (`gh-test`, `dst`, `spot-urine` protein) ölçüldü.
**Üçü de kusurluydu ve hepsinde elenen şey testin NORMAL sonucuydu:**

| araç | meşru sıfır | ne anlama geliyor | önce |
|---|---|---|---|
| `gh-test` stimülasyon | pik GH 0 | GH yanıtı hiç yok — testin en ağır bulgusu | sonuç yok |
| `gh-test` süpresyon | nadir GH 0 | tam baskılanma — akromegali dışlanır | sonuç yok |
| `dst` (üç protokol) | kortizol 0 | tam baskılanma — Cushing dışlanır | sonuç yok |
| `spot-urine` | idrar proteini 0 | proteinüri YOK — "Normal proteinüri" bandının tanımı | sonuç yok |
| `spot-urine` | idrar albümini 0 | albüminüri yok — "Normal (A1)" | sonuç yok |

`gh-test`in yorumu bu sınıfın en açık ifadesiydi: *"`!peakN` boşu ve sıfırı
DOĞRU eliyor"*. Düzeltilmesi gereken varsayım tam olarak buydu — negatifi
elemek doğru, sıfırı elemek değil.

**PAY ile PAYDA ayrı denetlenir.** `spot-urine`da protein/albümin PAY ve meşru
sıfır alabiliyor; kreatinin PAYDA ve 0 olamaz (`Infinity` üretirdi). İkisini
tek kapıya bağlamak, pay tarafındaki meşru sıfırı da eliyordu.

### `dst` HDDST'de MERDİVEN YÖNÜ TERSTİ — ekran kendisiyle çelişiyordu

Meşru sıfır düzeltmesi HDDST kipini sürmeyi gerektirdi ve orada çok daha ağır
iki kusur çıktı. Belgedeki *"bir kusur ikincisini gizleyebilir"* kuralının bu
turdaki hâli — hem de art arda ikinci kez.

`suppressed = effectiveVal < proto.cutoff` iki protokolde doğru: orada ölçülen
şey KORTİZOL ve düşük kortizol = baskılanma. HDDST'de ölçülen şey kortizol
değil **YÜZDE SÜPRESYON** ve yön tersine dönüyor: yüksek yüzde = baskılanma.
Tek karşılaştırma üç protokole birden uygulanınca HDDST'nin HER sonucu ters
çıkıyordu:

| bazal / son | araç hesaplıyor | araç yazıyor |
|---|---|---|
| 28 / 5 | **%82.1** | "✗ SÜPRESİYON YETERSİZ · **< %50** — Ektopik ACTH" |
| 28 / 20 | **%28.6** | "✓ SÜPRESİYON YETERLİ · **≥ %50** — Hipofiz kaynağı" |

**Ekran AYNI KARTTA hem "%82.1" hem "< %50" yazıyordu** — dış bir kaynağa hiç
bakmadan, yalnızca kendi çıktısına bakarak verilebilecek bir karar. GKS'deki
"297 / 15" ve MELD'deki eksi skorla aynı şekil.

Bedeli klinik olarak ağır: bu test Cushing HASTALIĞI (hipofiz cerrahisi) ile
EKTOPİK ACTH (çoğunlukla akciğer tümörü) arasında karar veriyor ve araç her
vakada tersini söylüyordu.

**İkinci kusur — TABAN DEĞERSİZ HÜKÜM.** Bazal kortizol girilmediğinde
`effectiveVal` ham kortizol olarak kalıyor ama yine %50 eşiğiyle
karşılaştırılıyordu: "son kortizol 5" girildiğinde araç "≥ %50 süpresyon —
Hipofiz kaynağı" diyordu. Yüzde olmayan bir sayıyı yüzde sanmak. HDDST artık
bazal değer geçerli değilse hiç sonuç basmıyor.

**Doğrulama 11 vakalı ve sınır değeri dahil:** %0 → ektopik, **tam %50 →
hipofiz** (`>=`), %82 → hipofiz, %100 → hipofiz; taban yoksa sonuç yok; çöp
reddediliyor; tarama kipinde dokunulmayan değerler birebir aynı.

**Ders: bir eşiği birden çok protokole/kipe paylaştırıyorsan, KARŞILAŞTIRMANIN
YÖNÜNÜ de kipe bağla.** Ölçülen büyüklük değiştiğinde (kortizol → yüzde) eşik
sayısı taşınabilir ama yön taşınamaz.

### `dst` kusuru bir ÖLÇÜT doğurdu: aynı dizide FARKLI BİRİM + TEK yön

HDDST'de yönün ters olmasının kaynaktan görülebilir bir imzası var: kip
dizisindeki nesneler **farklı birim** ilan ediyor ama eşik karşılaştırması
tek. `dst`de iki protokol `"μg/dL"`, biri `"% süpresyon"` diyordu.

Ölçüt tarihsel kontrolle sınandı ve birebir çalışıyor:

| ağaç | sonuç |
|---|---|
| düzeltme ÖNCESİ `dst` (`3805707`) | birimler `"μg/dL"` · `"% süpresyon"`, yön `<` — **TEK YÖN: ŞÜPHELİ** |
| güncel depo | aynı araç, yön `>=` ve `<` — işaretlenmiyor |

**BETİĞE ALINMADI ve sebebi kapsam dürüstlüğü:** ölçüt yalnızca `cutoff`/`esik`
alanı taşıyan araçları görebiliyor ve depoda bunlardan **5 tane** var
(`acth-stim`, `dst`, `fosfat-replasman`, `gh-test`, `homa-ir`). 131 aracın
5'ini tarayan bir denetimi "sınıf kapalı" gibi raporlamak, belgede tekrar
tekrar avlanan yanlış güven biçiminin ta kendisi olurdu. Ölçüt burada yazılı;
yeni bir çok-kipli araç eklenirse elle sürülebilir:

```
aynı nesne dizisinde eşik alanı VAR + birim alanı VAR + birimler FARKLI
  ve eşiği kullanan karşılaştırmada TEK yön varsa  ->  aday
```

### `acth-stim` — kardeş araç kuralı yine işledi

`gh-test` düzeltilirken sorulan soru ("aynı işi yapan başka araç var mı")
`acth-stim`i getirdi: aynı aileden bir endokrin stimülasyon testi. Aynı kusur
oradaydı ve kapı bu kez AÇIKÇA yazılmıştı:

```
if (!hasResult || peak === 0) return null;
```

Pik kortizol 0, ACTH'ye hiç yanıt olmaması demek — testin üretebileceği en
ağır bulgu. Ölçüldü: pik 14 için "YETERSİZ ADRENAL YANIT" basılırken bazal 2 +
pik 0 olan hastada hiçbir şey basılmıyordu.

İki yerde daha aynı şekil vardı ve ikisi de düzeltildi:

- `delta` hesabı `b > 0` istiyordu → bazali sıfır olan hastada artış farkı
  hiç gösterilmiyordu.
- Pik/Δ kartı `{peak > 0 && …}` ile kapılıydı → meşru sıfırda yorum çıkıp
  kart çıkmayacaktı (düzeltmenin kendi içinde açacağı tutarsızlık).

**`Math.max` da yalnızca GEÇERLİ girilmiş değerler üzerinden alınıyor.** Eskiden
bir alana yazılan çöp 0'a çevrilip ötekiyle yarışıyordu; artık geçersiz alan
yarışa hiç girmiyor. Ölçüldü: 30. dakikaya "abc" yazıldığında 60. dakikanın
değeri (24) pik olarak alınıyor, ikisi birden çöpse sonuç basılmıyor.

Bu araçta yön sorunu YOK: iki protokol de aynı eşiği (18 μg/dL) ve aynı birimi
taşıyor, yani yukarıdaki ölçüt onu haklı olarak işaretlemiyor.

### ÜST SINIR EKSİK — çöp girdi sınıfının öteki ucu, `sodium`da ölçüldü

Belge alt sınırı ve çöp girdiyi kapatmıştı; hiç sistematik taranmayan uç
**saçma yüksek** değerdi. Girdi SAYIDIR, kapıdan geçer, ve araç fizyolojik
olarak imkânsız bir hastadan klinik TALİMAT üretir.

Ölçüt: `parseLocaleNumber` değişkeninin kapısında alt sınır VAR ama üst sınır
YOK. 59 araçta 184 değişken tarandı, **48 aday**. Riskli alt küme, çıktısı
sayı değil TALİMAT olanlar — `sodium` 28 doz/hız işaretiyle listenin başında
(infüzyon hacmi ve mL/saat basıyor).

Tarayıcıda ölçüldü (45 y · 170 cm · 70 kg · Na 120):

| girdi | ekranda |
|---|---|
| hedef Na **500** | Gerekli Hacim **39.6 L** · Δhedef +380 |
| hedef Na **9999** | **1029.5 L** |
| kilo **700 kg** | TBW 251.8 L · **214 mL/saat** |
| boy **1700 cm** | TBW 204.3 L · **174 mL/saat** |

Dikkat çekici olan: **YÖN kapısı zaten vardı** (hedef mevcuttan düşükse hacim
basılmıyor — belgede kayıtlı `Math.abs` düzeltmesi). Yani eksik olan alt sınır
ya da yön değil, yalnızca ÜST sınırdı.

Sınırlar klinik eşik DEĞİL, makullük sınırı: yaş 1–120 · boy 50–250 cm ·
kilo 1–400 kg · serum Na 90–200 · **hedef Na 100–170** (bir HEDEF sodyum
hiçbir koşulda bu aralığın dışına konmaz).

**Kapılama SOFA dersini izliyor: her değer KENDİ girdisine bağlı.** Saçma
hedefte Δ/hacim/hız düşüyor ama hedefe bağlı OLMAYAN iki değer (TBW ve litre
başına Na değişimi) ekranda duruyor. Paneli toptan gizlemek, hesaplanabilir
olanı da saklardı.

Doğrulama 9 + 5 vaka, sınır değerleri dahil: olağan vaka birebir aynı
(Δ+10 · 1.0 L · 35 mL/saat), hedef tam **170 geçiyor**, **171 düşüyor**,
çöp Na reddediliyor, hipernatremi kipinde saçma hedef (5 ve 999) ve saçma
mevcut Na panel bastırmıyor, yön kapısı korunuyor.

**ÖLÇÜTÜN BİR KAÇAĞI VAR ve yazılı:** `naN` aslında kapısızdı ama tarama onu
işaretlemedi, çünkü dosyada `naN < hyperTargetN` karşılaştırması geçiyor ve
ölçüt onu "üst sınır" saydı. Yani `<` görmek, MAKULLÜK sınırı olduğu anlamına
gelmiyor — sınır sabit bir sayıyla karşılaştırılmalı. Kaçak elle bakarken
görüldü; ölçüt aday üretir, kapsam iddiası üretmez.

### "AKI KRİTERİ YOK" bir İDDİA — `kdigo-aki` onu "değerlendiremedim" ile karıştırıyordu

Üst sınır sınıfının ikinci turu. `sodium`da tehlike saçma girdinin TALİMAT
üretmesiydi; burada tehlike ters yönde ve daha sinsi: **saçma girdi GÜVEN
VEREN bir sonuç üretiyor.**

`creatinineStage` çöp girdide `if (!baseline || !current) return 0` ile sıfır
döndürüyordu ve 0 bu araçta "AKI kriteri yok" demek. Ölçüldü:

| girdi | ekranda (önce) |
|---|---|
| bazal 0.8 · güncel **"abc"** | Oran 0 · **"Evre 0 · AKI Kriteri Yok"** |
| bazal **999** · güncel 2.5 | Oran 0 · **"AKI Kriteri Yok"** |
| bazal **0.001** · güncel 2.5 | Oran 2500 · Evre 3 |
| güncel **999** | Oran 1248.75 · Evre 3 |

İlk satır en tehlikelisi: kreatinini 2.5 olan hastada güncel değere düşen bir
yazım hatası AKI'yi gizliyor ve ekran hiçbir şey söylemiyor.

**AYRIM: "AKI Kriteri Yok" bir İDDİADIR** — değerlendirdik ve bulmadık demek.
Kreatinin okunamıyorsa doğru cevap bu değil, "Değerlendirilemedi". Araç
ikisini tek bir 0 değerinde topluyordu; `crStage` artık `number | null`.

**NE KUSUR DEĞİL — ve bu ayrım ölçümün yarısı:** bazal 12 · güncel 2.5
(oran 0.21) makul bir okuma. 12 gerçekçi bir bazal kreatinin (kronik böbrek
hastası) ve oranın 1'in altında olması iyileşme demek. Yani en olası yazım
hatası olan "1.2 yerine 12" makullük sınırıyla YAKALANAMAZ ve araç orada
zaten doğru davranıyor. Bunu kusur diye raporlamak yanlış olurdu.

**KDIGO'nun "ölçütlerden yüksek olan geçerli" kuralı korundu** — kreatinin
okunamıyor olması ötekileri susturmamalı. Üç yalıtım kontrolü ölçüldü:

| durum | sonuç |
|---|---|
| çöp kreatinin + idrar Evre 2 | **Evre 2** (kreatinin "–", idrar tek başına evreliyor) |
| çöp kreatinin + RRT | **Evre 3** |
| kreatinin Evre 0 + idrar Evre 3 | **Evre 3** |

Sınır 0.1–30 mg/dL, deponun öteki araçlarıyla aynı aile (`egfr` 0.1–30,
`sofa` 0.1–25). Doğrulama 12 vaka: gerçek AKI Evre 3 kalıyor, sınır tam 0.1
geçiyor, 35 düşüyor.

### ELİNDE OLMAYAN DEĞER HAKKINDA İDDİA — `ogtt` "2.saat < 140" diyordu

Üst sınır sınıfının üçüncü turu ve yeni bir biçim: araç, HİÇ OKUMADIĞI bir
değer hakkında sayısal iddia basıyor.

`DmResult` "girilmedi" durumunu düşünmüş (`h2 === 0 ? -1` ile kategoriden
dışlıyor) ama NORMAL etiketinin ALT METNİ koşulsuzdu:

| girdi | ekranda (önce) |
|---|---|
| açlık 95 · 2. saat **"abc"** | **"NORMAL · Açlık < 100 mg/dL · 2.saat < 140 mg/dL"** |
| açlık 9999 · 2. saat 9999 | "DİYABET MELLİTUS" |

Gerçek 2. saat 210 (diyabet) olsaydı, tek yazım hatası "NORMAL" verecekti —
ve alt metin okuyucuya o değerin ölçüldüğünü söylüyordu.

`twoHour` artık `number | null`; `null` ayrı bir anlam taşıyor ve alt metin
"2. saat değeri girilmedi" diyor. **Kural: bir etiketin alt metni, YALNIZCA
gerçekten okunan değerler hakkında konuşmalı.**

Makullük sınırı da yoktu: glukoz 20–1500 mg/dL kondu (hiperozmolar tabloda
1000 aşılabiliyor; 20 altı yaşamla bağdaşmıyor).

**AYNI DOSYADA İKİNCİ KUSUR — kardeş araç kuralı yine işledi.** Akromegali
kipi `gh-test`teki meşru-sıfır kusurunun BİREBİR aynısını taşıyordu:
`nadir > 0` kapısı, glukoz sonrası tam baskılanmayı (nadir GH 0 = akromegali
dışlanır) reddediyordu. Ölçüldü: 0.2 için "GH SÜPRESİYONU YETERLİ" basılırken
0 için hiçbir şey basılmıyordu.

Bu, belgedeki *"bir kusuru düzeltirken aynı sayfadaki öteki blokların da aynı
kaynağa bağlandığını doğrula"* kuralının araç-arası hâli: `gh-test` düzeltildi
ama AYNI TESTİ ikinci kez uygulayan `ogtt`nin akromegali kipi atlanmıştı.

Doğrulama 18 vaka üç kipte: DM'de BGT/BAG ayrımı ve DM tanısı değişmedi,
sınır 1500 geçiyor 1501 düşüyor; akromegalide 0 artık "Akromegali dışlanır",
çöp/boş/500 "–"; GDM'de tanı ve çip gösterimi korunuyor (çöp alan "–").

**ÖLÇÜM TUZAĞI — sayfa yenilendikten sonraki İLK yineleme yanılttı.**
`95/140` ilk turda "SONUÇ YOK" göründü ve bir an gerileme sanıldı; yalıtılıp
tekrarlanınca "PREDİYABET · BGT" çıktı. React ilk ölçümde henüz yerleşmemişti.
Belgedeki "ardışık ölçüm bayat sonuç verir" kuralının yeniden-yükleme hâli:
**şüpheli tek satırı yalıtıp tekrarla.**

**HEREDOC ÜÇÜNCÜ KEZ İŞ BOZDU.** Bu turda `cat > dosya <<'EOF'` komutu üç
dakika takılıp hiçbir şey yazmadan düştü (belge değişmedi, commit atılmadı).
Belgede zaten kayıtlı olan "heredoc backslash siliyor" tuzağının ikinci
biçimi: bu ortamda heredoc yalnızca içeriği bozmuyor, kimi zaman hiç
tamamlanmıyor. **Çok satırlı dosya yazarken Write kullan**, `cat`/`python -`
gibi stdin bekleyen kanalları değil.

### EKSİK ALAN AÇIĞI ŞİŞİRİYORDU — `osmolal-gap` DKA hastasına toksik alkol alarmı veriyordu

Üst sınır turunun dördüncüsü ve en pahalısı. Kapı `glucN >= 0 && bunN >= 0`
diyordu; hem çöp girdi hem BOŞ alan `parseLocaleNumber` ile 0'a düşüyor ve
ikisi de bu koşulu GEÇİYOR. Bedeli tek yönlü: hesaplanan osmolalite olduğundan
düşük çıkıyor, ölçülenden çıkarıldığı için **açık şişiyor** — yani yön
TOKSİK ALKOL ALARMINA doğru.

Ölçüldü, **aynı DKA hastası** (ölçülen 320 · Na 130 · glukoz 900 · BUN 20):

| glukoz alanı | hesaplanan | açık | ekranda |
|---|---|---|---|
| **900** (doğru) | 317.1 | **2.9** | NORMAL |
| **"abc"** | 267.1 | **52.9** | **YÜKSEK — Toksik alkol** |
| **boş** | 267.1 | **52.9** | **YÜKSEK — Toksik alkol** |

Boş alanın da aynı sonucu vermesi kritik ve en olası senaryo: değeri elde
olmayan hekim alanı boş bırakıyor, araç sessizce 0 sayıyor. Formül glukozu ve
BUN'u ZORUNLU ister; opsiyonel olan yalnızca etanoldür.

Pratik sonucu hafif değil: hiperglisemik bir hastada metanol/etilen glikol
şüphesi fomepizol ve diyaliz sorgusu demek.

**Etanol OPSİYONEL kaldı ve üç durumu ayrı ayrı ölçüldü:** boş → hesaba
girmiyor (açık 50); 92 mg/dL → 92/4.6 = 20 katkı, açık 50 → 30 (elde
doğrulandı: 290+20=310, 340−310=30); **0 → meşru sıfır, ölçülmüş ve yok
demek**, açık 50 kalıyor. Çöp etanol ise sonucu bastırıyor.

Sınırlar: ölçülen osm 200–500 · Na 90–200 · glukoz **10**–1500 · BUN 1–300 ·
etanol 0–1000. Glukozun alt sınırı `ogtt`den daha geniş (10, 20 değil) ve
sebebi yazılı: bu araç zehirlenme/yoğun bakım hastasında kullanılıyor, ağır
hipoglisemi gerçek bir olasılık. **Aynı analit için farklı sınır, bağlam
farkıyla gerekçelendirilmeli** — yoksa kendisi bir tutarsızlık olur.

**EN ÖNEMLİ NEGATİF KONTROL: gerçek yüksek açık korunuyor.** 340/140/90/14 →
açık 50.0 · "YÜKSEK OSMOLAL GAP" değişmedi. Bir kapı koyduktan sonra
sorulacak soru "panel çıkıyor mu" değil, **"alarm hâlâ çalışıyor mu"**.

### `tirads` ölçüldü — TEMİZ, ve sebebi kayda değer

Aynı turda `tirads` de sürüldü (çapı kapısız görünüyordu). Kusur YOK:
çöp/boş/0 çapta karar paneli tümden kayboluyor, 0.3 cm doğru şekilde "bu
boyutta müdahale gerekmez" diyor. Saçma büyük çap (200, 9999) "İİAB önerilir"
veriyor ama eşiklerin hepsi `≥` olduğu için sonuç meşru büyük bir nodülle
AYNI — yani saçma girdi kararı zararlı yönde değiştirmiyor. Sınır koymak
kozmetik olurdu.

Ayrıca tasarım kararı olarak not: araç beş ACR kategorisinin HEPSİ seçilene
kadar toplamı ve kararı hiç basmıyor. Dördü seçiliyken yalnızca kategori
puanları görünüyor. Bu, "eksik veriyle hüküm verme" ilkesinin doğru
uygulanmış hâli.

### YÖN DENETİMİ EKSİKTİ — `ktv` post > pre girildiğinde EKSİ Kt/V basıyordu

Üst sınır turunun beşincisi. Burada eksik olan yalnızca sınır değil, girdiler
arası MANTIKSAL İLİŞKİ: diyaliz üreyi DÜŞÜRÜR, yani post-diyaliz BUN pre'den
yüksek olamaz. İki alanın yer değiştirmesi çok olası bir veri girişi hatası ve
araç onu sessizce hesaplıyordu.

Ölçüldü (pre 20 · post 60 — alanlar ters):

```
spKt/V -1.27   ·   eKt/V -1.05   ·   URR -200%   ·   "YETERSİZ DİYALİZ"
```

Eksi Kt/V ve eksi URR fiziksel olarak imkânsız. Ekran kendi saçmalığını
gösteriyordu ama yine de bir HÜKÜM basıyordu — belgedeki "eksi bir MELD
mümkün değildir" sınıfının aynısı.

**İKİNCİ KUSUR — hesaplanamayan değer "YETERSİZ" oluyordu.** Hüküm
`spOk && eOk && urrOk ? "SAĞLANDI" : "YETERSİZ DİYALİZ"` biçimindeydi; herhangi
bir indeks `null` olduğunda üçlü işleç doğrudan olumsuz dala düşüyordu.
Ölçüldü: 9999 dakika girildiğinde `R − 0.008×t` eksiye düşüyor, `ln` tanımsız
oluyor, Kt/V "—" çıkıyor ve araç yine "YETERSİZ DİYALİZ — PROTOKOL GÖZDEN
GEÇİRİLMELİ" diyordu. `kdigo-aki`deki "AKI Kriteri Yok" ile birebir aynı
sınıf: **değerlendirememek ile olumsuz değerlendirmek AYNI ŞEY DEĞİL.**

**ÜÇÜNCÜ KUSUR — "DEĞERLENDİRİLEMEDİ" dalı ÖLÜ KODDU.** Düzeltmeyi yazdıktan
sonra ölçüm onu hiç göstermedi: panel `{hasAll && spKtV !== null && (…)}` ile
sarılıydı, yani geçersiz değerlerde hiç çizilmiyordu. Kullanıcı beş alanı da
doldurup HİÇBİR ŞEY görmüyordu — sessiz boşluk.

Ölçüt "kullanıcı sonuç bekliyor mu" olarak değiştirildi: beş alan da doluysa
panel çiziliyor ve hesaplanamıyorsa NEDENİ yazıyor. İki neden ayrı ayrı
üretiliyor ve ölçümle ayırt edildi:

| girdi | ekranda |
|---|---|
| pre 20 · post 60 | "Post-diyaliz BUN, pre-diyaliz BUN'dan DÜŞÜK olmalı — İki alan yer değiştirmiş olabilir." |
| süre 9999 | "Bir değer makul aralığın dışında: BUN 2–300 · seans 30–600 dk · UF 0–10 L · ağırlık 20–300 kg." |

Boş formda panel hâlâ hiç çıkmıyor (belgedeki "girdisiz de aç" kuralı).

**URR kendi geçerliliğine bağlandı** — SOFA'daki organ başına geçerlilik
dersi: URR yalnızca pre/post'a bağlı, süre bozuksa bile gösterilebilir.
Ölçüldü: saçma sürede spKt/V "—" ama URR 67 duruyor.

Negatif kontrol iki gerçek seansla: 60/20/240/2/70 → spKt/V 1.28 · URR 67 ·
"SAĞLANDI" (değişmedi) ve 85/22/240/2.5/70 → 1.59 · 74 (elle doğrulandı:
R = 0.2588, −ln(0.2268) + 3.0941×0.035714 = 1.484 + 0.111 = 1.59).

### `homa-ir` ölçüldü — TEMİZ, verdikt yazıldı

Aynı turda `homa-ir` de sürüldü. Çöp ve boş girdide "–" basıyor, yani yanlış
güven YOK. Tek aykırılık saçma girdide (9999/9999) **246864.2** gibi bir sayı
basması; yön alarma doğru, sayı gözle tartışmasız saçma ve araç talimat
üretmiyor. Sınır eklemek kozmetik olurdu — ölçüldü, karara bağlandı,
DEĞİŞTİRİLMEDİ.

### BELGENİN "KORUMALI" DEDİĞİ ÜÇ ARAÇ SINANDI — ikisinde üst sınır eksikti

Belge `conut`, `gnri` ve `pni` için "zaten korumalı (`–` gösteriyor)" diyordu.
İddia doğrulandı ve YARIM çıktı: üçü de çöp/boş girdiyi doğru eliyor, ama
`gnri` ile `pni`de ÜST sınır yoktu.

**`gnri` — en tehlikelisi BOY alanı.** Ölçüldü (albümin 3.6 · kilo 55 ·
boy 165 → GNRI 91.0 "ORTA RİSK"):

| değişen alan | sonuç |
|---|---|
| boy **1700 cm** | GNRI **55.5 · "YÜKSEK RİSK"** ← gerçekçi görünüyor |
| albümin **99 g/dL** | GNRI 1511.6 · "RİSK YOK" |
| kilo **700 kg** | GNRI 95.3 — **kusur DEĞİL** |

Boy vakası ayırt edici: fazladan bir sıfır (170 → 1700) tipik bir yazım
hatası ve 55.5 gerçek bir ağır malnütrisyon GNRI'sinden ayırt edilemiyor.
Kullanıcı hatayı sonuçtan göremiyor.

**Kilonun zaten korumalı olması kazara:** `Math.min(weightN/ibw, 1)` oranı
1'de tavanlıyor, yani 700 kg ile 70 kg AYNI sonucu veriyor. Saçma kilo kararı
değiştirmiyor. `tirads`taki durumun aynısı — **bir tavan bazen bilmeden bir
makullük koruması işlevi görüyor.**

**`pni` — saçma albümin güven veren cevap veriyordu:** 99 g/dL → PNI 996.0 ·
"İYİ NÜTRİSYON DURUMU". Malnütrisyon taramasında yanlış "iyi durumda" cevabı
taramanın kendisini boşa çıkarır.

Sınırlar: albümin 1–7 g/dL · kilo 20–300 · boy 50–250 cm.
Doğrulama 14 vaka, sınır değerleri dahil (boy tam 250 geçiyor, 251 düşüyor;
albümin tam 7 geçiyor, 7.1 düşüyor); olağan vakalar birebir aynı.

**BEKLENTİ DÜZELTMESİ — `pni`de lenfosit sınırı.** İlk ölçümde 99999/μL
girdisinin reddedilmesi beklendi; reddedilmedi ve PNI 530.0 çıktı. Yanlış
olan BEKLENTİYDİ: lösemik lenfositozda 100.000/μL gerçek bir değer ve
aritmetik doğru. Yani 530 bir GİRDİ kusuru değil, **formülün kendi sınırı** —
PNI cerrahi/onkoloji kohortlarında doğrulanmış ve bandları 45'te tavanlanan
bir indeks, o sayımlarda uygulanabilir değil. Sınırı daraltmak gerçek bir
hastanın gerçek değerini reddetmek olurdu; gevşek bırakıldı ve gerekçesi
kaynağa yazıldı.

**`conut` TEMİZ.** Çöp/boş "–" veriyor; saçma albümin (9999) skoru
değiştirmiyor çünkü ≥3.5 zaten 0 puan — `tirads` ile aynı zararsız durum.

### AÇIK BULGU — `dst` HDDST'de EKSİ YÜZDE SÜPRESYON (karar bekliyor)

`ktv`nin açtığı "girdiler arası zorunlu sıralama" sınıfı `dst`ye sürüldü.
HDDST'de son kortizol bazalı aşarsa yüzde süpresyon EKSİ çıkıyor:

| bazal / son | ekranda |
|---|---|
| 28 / 40 | **"%-42.9"** · "✗ SÜPRESİYON YETERSİZ — Ektopik ACTH" |
| 10 / 60 | **"%-500"** · aynı |

**HÜKÜM DOĞRU** — kortizol yükselmişse süpresyon yoktur ve ektopik/adrenal
doğru cevaptır. Kusur yalnızca GÖSTERİMDE: "yüzde süpresyon" eksi olamaz;
doğru ifade "süpresyon yok" ya da "paradoksal artış".

`ktv`den farkı bu: orada hüküm imkânsız bir değerden ÜRETİLİYORDU, burada
hüküm doğru ve yalnızca sayı anlamsız. O yüzden ölçüldü, not edildi,
DEĞİŞTİRİLMEDİ — sonraki turda gösterim düzeltmesi olarak ele alınabilir.

### Açık bulgu kapatıldı: `dst`de eksi yüzde süpresyon adlandırıldı

Bir önceki turda ölçülüp "karar bekliyor" diye bırakılan bulgu kapatıldı.
HDDST'de son kortizol bazalı aşarsa ekran `%-42.9`, uçta `%-500` basıyordu.

**Kapsam DAR tutuldu ve ölçütü `ktv` ile karşılaştırma verdi:**

| araç | eksi değer neye yol açıyordu | çare |
|---|---|---|
| `ktv` | hüküm İMKÂNSIZ BİR DEĞERDEN üretiliyordu (eksi Kt/V ile "YETERSİZ DİYALİZ") | hesap durduruldu, sebep yazıldı |
| `dst` | hüküm DOĞRU (kortizol yükselmişse süpresyon yok = ektopik), yalnızca sayı okunamaz | hesap değişmedi, eksi değerin ADI konuldu |

Yani "eksi sayı ekranda" tek başına ne kusurun varlığını ne de büyüklüğünü
belirliyor; belirleyen şey **o sayının bir HÜKÜM üretip üretmediği.**

Doğrulama 5 vaka, sınır değerleri dahil: `%82.1` değişmedi, `%0` yüzde olarak
KALDI (sıfır meşru bir süpresyon yüzdesi), tam `%50` hipofiz tarafında.

### YÜZDE ALANI sınıfı tarandı — dört araç, hepsi temiz

Üst sınır turunun devamı olarak ayrı bir ölçüt denendi: **etiketi yüzde olan
alan 100'ü aşabiliyor mu?** `anc`de toplamın 100'ü aşamaması zaten
denetleniyordu; ötekiler bilinmiyordu.

Depoda `(%)` etiketli alan taşıyan **dört araç** var ve dördü de temiz:

| araç | yüzde alanı | durum |
|---|---|---|
| `anc` | segment % · band % | `yuzdeToplam <= 100` + `sayiGirildiMi` (bu oturumda düzeltildi) |
| `hba1c-eag` | HbA1c % | 2–20 sınırı |
| `news2` | SpO₂ % | **beş vitalin hepsi sınırlı** |
| `spot-urine` | FENa % · FEÜre % | ÇIKTI, girdi değil |

**`news2` tam korumalı çıktı ve ölçüldü** — belgede yalnızca "boş formda 15
basıyordu" kusuru kayıtlıydı, üst sınır tarafı hiç sınanmamıştı:

| girdi | ekranda |
|---|---|
| normal vitaller | toplam 0 · "Düşük" |
| 28 / 88 / 85 / 130 / 39 (ağır hasta) | toplam **12** · "YÜKSEK" |
| SpO₂ **150** (imkânsız yüzde) | **–** · "Vitalleri girin" |
| SpO₂ **−5** · SpO₂ **"abc"** | – · "Vitalleri girin" |
| solunum 9999 · KB 9999 · ateş 999 | – · "Vitalleri girin" |

Yani NEWS2'de hem alt hem üst sınır yerinde; sınıf o araç için kapalı.

Bu ölçütün kapsamı DAR ve bu yazılı: yalnızca etiketinde `(%)` geçen alanları
görüyor. Yüzde olduğu etiketten anlaşılmayan alanlar (örneğin bir oran ya da
kesir) bu taramaya girmiyor.

### ÜST SINIR TURU KAPANDI — `bmi` ve `bmr`, ikisi de boy/kilo alan son adaylar

Tarama listesindeki son iki araç sürüldü ve ikisi de kusurluydu.

**`bmi` — üretilen sayı BAŞKA BİR HESABIN GİRDİSİ.** Aracın kendi uyarısı
ideal ağırlığın "ilaç dozlaması ve solunum parametreleri" için kullanıldığını
söylüyor:

| girdi | ekranda (önce) |
|---|---|
| boy **1700** (fazladan sıfır) | ideal ağırlık **1451.4 kg** · Hamwi 1693.1 |
| boy **17** (eksik sıfır) | **BMI 2422.1 · "OBEZİTE SINIF …"** |

İlki, ARDS'de 6 mL/kg ile soluk hacmi hesaplayan biri için soluk başına
~8.7 LİTRE demek.

**Çöp kiloda ideal ağırlığın DURMASI korundu** — Devine ve Hamwi yalnızca boya
bağlı. SOFA'daki "her değer kendi girdisine bağlı" dersi; kilo `"abc"` iken
BMI `–` ama ideal ağırlık 65.9/66.7 basılıyor ve doğrusu bu.

**`bmr` — yaş alanı EKSİ KALORİ üretiyordu.** Mifflin–St Jeor'da yaş terimi
çıkarılıyor (`−5 × yaş`), yani büyük bir yaş sonucu eksiye götürüyor:

| girdi (175 cm · 75 kg) | ekranda (önce) |
|---|---|
| yaş **999** | **BMR −3146 kcal/gün · TDEE −4876 kcal/gün** |
| boy 1750 | BMR 11518 · TDEE 17853 |
| kilo 750 | BMR 8424 · TDEE 13057 |

Eksi kalori gereksinimi fiziksel olarak imkânsız — `ktv`deki eksi Kt/V ve
MELD'deki eksi skorla aynı sınıf, üstelik bir beslenme aracında sayı bir
plana girdi olabiliyor.

Sınırlar iki araçta da aynı aile: yaş 1–120 · boy 50–250 cm · kilo 1–400 kg.

Doğrulama 15 vaka, sınır değerleri ve elle hesap dahil:

| araç | negatif kontrol | elle |
|---|---|---|
| `bmi` | 170/70 → 24.2 NORMAL, 65.9/66.7 (değişmedi) | Devine erkek 180 cm = 50 + 2.3×(27.6/2.54) = **75.0** ✓ |
| `bmr` | 35/175/75 → 1674 / 2595 (değişmedi) | 80 y · 160 cm · 60 kg = 600+1000−400+5 = **1205**, ×1.55 = **1868** ✓ |

Sınır: `bmi`de boy 250 geçiyor 251 düşüyor; `bmr`de yaş 120 geçiyor 121 düşüyor.

**BÖYLECE ÜST SINIR SINIFININ TARAMA LİSTESİ BİTTİ.** 48 adaydan karara
bağlananlar: `sodium` · `kdigo-aki` · `ogtt` · `osmolal-gap` · `ktv` · `gnri` ·
`pni` · `bmi` · `bmr` DÜZELTİLDİ; `tirads` · `conut` · `homa-ir` · `news2` ·
`hba1c-eag` · `spot-urine` ölçüldü ve TEMİZ çıktı. Kalanlar (`sofa`, `anc`,
`das28`, `spot-urine`) bu oturumun önceki turlarında zaten kapatılmıştı.

### KENDİ İŞİMİ DENETİMLERLE SINADIM — iki denetim körleşmişti

Bu oturumda ~15 araç dosyasına kapı eklendi. Kapanış hamlesi olarak deponun
kendi rapor denetimleri kendi iş üzerinde sürüldü ve **ikisi belgedeki taban
değerlerin ÜSTÜNE çıkmıştı**:

| denetim | belgedeki taban | bu tur | sebep |
|---|---|---|---|
| `bolme-denetim` | 0 | **4** | hepsi SAHTE |
| `kapi-kapsam-denetim` | 4 | **19** | hepsi SAHTE |

Sebep aynı: eklenen kapılar **adlandırılmış bool** ve adlandırma serbest.
Denetimlerin kapı sözlüğü ise dar — biri yalnızca `…Makul`/`…Tamam` adlarını
tanıyor, öteki adları TEK DÜZEY çözüyordu:

```
const preOk    = makul(preBun, 2, 300);
const yonDogru = preOk && post < pre;
const hasAll   = yonDogru && tOk && ufOk && wtOk;
const R        = hasAll ? post / pre : null;   // korumalı ama görünmüyor
```

**Kodu denetime uydurmak (değişkenleri "…Makul" diye yeniden adlandırmak)
yanlış yön olurdu.** Denetimler düzeltildi.

**DÜZELTİRKEN BELGEDE KAYITLI TUZAĞI GERİ GETİRDİM — tohum yakaladı.**
İlk çözüm "pencerede bir kapı bool'u var mı" diye bakıyordu ve bu, AYNI
DOSYADAKİ BAŞKA bir değişkenin kapısız bölmesini de aklıyordu:

```
const kiloMakul = sayiGirildiMi(k) && kilo >= 1 && kilo <= 400;
const doz  = kiloMakul ? 500 / kilo : null;   // korumalı
const oran = 250 / hacim;                     // KORUMASIZ — gizleniyordu
```

Kapı artık DEĞİŞKENE bağlı çözülüyor: her kapı bool'u için "hangi sayıları
kapılıyor" kümesi çıkarılıyor, sabit noktaya kadar devrediliyor, ve bölme
ancak o kümede kendi paydası varsa aklanıyor. Ham dize ↔ sayı adı eşlemesi
de kuruluyor (`makul(preBun, …)` çağrısı `pre`yi kapılıyor sayılıyor).

**Aynı turda ölçütün ÜÇ ayrı sınırı yakalandı ve üçü de sessizdi:**

| sınır | bedeli |
|---|---|
| adları `\w*[Mm]akul\b` ile tanımak | başka değişkenin bölmesini akladı |
| tanım yakalamada 260 karakter tavanı | `kalsiyum-infuzyon`daki 6 satırlık `infMakul` HİÇ eşleşmedi |
| gevşek `\w*[Oo]k\b` deseni | Türkçe **"cok"** kelimesini kapı adı sandı |

Üçüncüsü kendi kontrolümü düşürdü ve düzeltmeyi o sağladı — pozitif kontrolün
neden gerektiğinin ders niteliğinde örneği.

**Doğrulama üç yönlü ve tohumlar kalıcı:** `bolme-denetim --kontrol` artık
**4 kusurlu + 7 temiz** biçim taşıyor (aynı-dosya-ikinci-bölme ve zincirli
kapı tohumları eklendi); `kapi-kapsam-denetim --kontrol` geçiyor; meta test
14 denetimin 14'ünde temiz; depoda `bolme` **0**, `kapi-kapsam` **2** ve o iki
adayın verdikti betiğin başına yazıldı:

- `spot-urine:225 uglucN` — meşru sıfır, bilerek kapı dışında.
- `sodium:442 naN` — ölçütün YAPISAL sınırı: ifade `naMakul && hiperHedefMakul`
  ile kapılı bir JSX panelinin içinde; denetim saran koşulu göremiyor.
  Ölçümle doğrulandı — Na 9999'da panel hiç çizilmiyor.

**Aktarılabilir kural: bir depoya kapı eklerken o deponun KAPI DENETİMLERİNİ
de sür.** Kapılar denetimlerin tanıdığı biçimden saparsa denetim sessizce
körleşir ve "aday" sayısı artışı kusur değil, ölçüt bayatlaması olur.

### SESSİZ BOŞLUK SINIFI KAPANDI — kapı koymanın kendi bedeli

Bu oturumda ~15 araca makullük kapısı kondu ve hepsi doğru kararlardı. Ama
kapıların ortak bir yan etkisi vardı: **saçma ya da eksik girdide sonuç
sessizce kayboluyordu.** Kullanıcı alanları doldurup hiçbir şey görmüyor ve
hangi alanın beklendiğini bilmiyordu.

Belgede kural zaten yazılıydı (`spot-urine` turundan): *"Hesaplanamıyorsa
SEBEBİNİ söyle; sessiz boşluk kullanıcıyı yanıltır."* Kapılar konurken o kural
uygulanmamıştı — yani sınıf, kendi düzeltmelerimin açtığı bir boşluktu.

Sekiz araçta kapatıldı: `osmolal-gap` · `sodium` · `bmi` · `bmr` · `gnri` ·
`pni` · `gh-test` · `acth-stim`. (`anc`, `das28`, `kdigo-aki`, `ktv`, `ogtt`,
`asdas`, `dst` zaten sebep basıyordu.)

**ÜÇ AYRI DURUM ÇIKTI ve üçü farklı çözüm istedi:**

| durum | araç | çözüm |
|---|---|---|
| varsayılanlar GEÇERLİ | `bmi` · `bmr` | ayrı kapı gerekmiyor — sebep ancak kullanıcı bir alanı bozunca çıkar |
| araç BOŞ açılıyor | `gnri` · `pni` · `osmolal-gap` · `acth-stim` | `girdiVar` kapısı; bomboş formda susulur |
| araç ÇOK KİPLİ | `sodium` · `gh-test` | sebep KİP BAŞINA; her kip yalnızca kendi alanlarını ister |

**VARSAYILANI OLAN ALAN "KULLANICI GİRDİ" SAYILMAZ.** `sodium`da `hyperTarget`
"140" ile açılıyor; `girdiVar` listesine konunca koşul HER ZAMAN doğru oldu ve
bomboş formda bile sebep basıldı. Ölçüldü ve düzeltildi.

**AÇIKLAMA DA "HER DEĞER KENDİ GİRDİSİNE BAĞLI" KURALINA UYAR.** `acth-stim`de
bazal kortizol bozuk ama pik geçerliyken yorum YİNE çıkıyor (pikten yapılıyor)
ve ayrı bir not yalnızca Δ'nın hesaplanamadığını söylüyor. Sebebi toptan basıp
geçerli yorumu gizlemek, kapının kendisini kusura çevirirdi.

Eksik alan ADIYLA ve ARALIĞIYLA yazılıyor (`"boy (50–250 cm)"`), birden çok
alan eksikse hepsi sayılıyor. `gh-test` ve `acth-stim`de metin ayrıca sıfırın
GEÇERLİ olduğunu söylüyor — o araçlarda meşru sıfır bu oturumda düzeltilen
kusurdu ve kullanıcı "0 yazamam" sanmamalı.

Doğrulama 43 vaka, sekiz araçta; her araçta hem "tam vaka → sessiz" hem
"bomboş form → sessiz" negatif kontrolüyle.

**Aktarılabilir kural: bir kapı eklerken ekranın o kapı devredeyken NE
GÖSTERDİĞİNİ de ölç.** Kapı doğru çalışsa bile, kullanıcıya "neden" demiyorsa
iş yarım kalmış olur.

### DENETİM BAŞLIĞINA YAZILAN VERDİKT DE YANLIŞ OLABİLİR — `abg` iki kusur taşıyordu

`cop-kapi-denetim` iki aday bırakmıştı ve ikisinin de verdikti betiğin başında
"TEMİZ" diye yazılıydı. Belgedeki kural gereği ikisi de YENİDEN ölçüldü —
biri gerçekten temizdi, öteki **iki ayrı kusur** taşıyordu.

Yazılı verdikt şuydu: *"abg TEMİZ — ayrı `SINIRLAR` makullük kapısı çöpü
yakalıyor."* İddia DOKUZ alanın SEKİZİ için doğruydu. `SINIRLAR.yas` `[0,120]`
olduğu için yaş alanında `parseLocaleNumber("abc") = 0` kapıyı GEÇİYORDU.

**Ders: bir verdikt "araçta ayrı bir kapı var" diye yazılırsa, o kapının
BÜTÜN alanları kapsadığı ayrıca SAYILMALI.** Verdikt, denetimin kendisi kadar
yetkili görünüyor ve kimse ikinci kez bakmıyor. (`unit-converter` verdikti bu
kez doğru çıktı: 20 analitin 20'sinde alt sınır ≥ 0.1, en düşüğü kreatinin ve
bilirubin 0.1 — çöpün ürettiği 0 hepsinde aralıktan düşüyor.)

**KUSUR 1 — çöp yaş, NORMAL bir A-a gradyanını "yüksek" yapıyordu.**
Beklenen A-a `yaş/4 + 4`; yaş 0'a düşünce 18 yerine 4 oluyor. Ölçüldü
(pH 7.40 · PaCO₂ 40 · HCO₃⁻ 24 · PaO₂ 85 · FiO₂ 0.21):

| yaş alanı | ekranda |
|---|---|
| `55` | A-a **15** · "yaşa göre beklenen aralıkta (≈18)" |
| `abc` | A-a **15** · "**↑ yaşa göre beklenenin (≈4) üstünde**" |
| boş | A-a 15 · "yaş girilmedi — beklenen değer hesaplanamıyor" |

Aynı hastada aynı sayı, tek harf yüzünden ters damga: yükselmiş A-a gradyanı
şant / V-Q uyumsuzluğu / PE düşündürür, yani yanlış pozitifin bedeli bir
tetkik zinciri. Boş alanın zaten dürüst davranması ayırt edici oldu — kusur
"hesaplanamıyor" dalında değil, çöpün sessizce 0 olmasındaydı.

**KUSUR 2 — YARDIMCI alandaki yazım hatası BİRİNCİL yorumu susturuyordu.**
`hatali` dizisi dokuz alanı birden topluyor ve yorum `hatali.length === 0`
şartına bağlıydı. Oysa yaş, PaO₂ ve FiO₂ asit-baz yorumuna HİÇ girmiyor;
Na⁺/Cl⁻/albümin yalnızca anyon açığını besliyor. Aracın kendi cümlesiyle
ölçüldü (pH 7.25 · PaCO₂ 25 · HCO₃⁻ 11 — açık metabolik asidoz):

| eklenen tek hata | sonuç |
|---|---|
| yaş 999 | **"Yorum yapılmadı"** — asidoz kayboldu |
| Na⁺ `abc` | **"Yorum yapılmadı"** |
| FiO₂ 5 | **"Yorum yapılmadı"** |

Belgedeki "her değer KENDİ girdisine bağlı" kuralının (SOFA turu) asit-baz
tarafı. Sınıfın burada yeni olan yanı: kural yalnızca SAYILARA değil
**AÇIKLAMAYA** da uygulanmalı. İki ayrı uyarı kutusu var artık —

- **çekirdek** (pH · PaCO₂ · HCO₃⁻) bozuksa: kırmızı, "Yorum yapılmadı";
- **yardımcı** bozuksa: amber, "Bu alan(lar) hesaba KATILMADI — asit-baz
  yorumu pH, PaCO₂ ve HCO₃⁻ üzerinden yapılmaya devam ediyor".

**"boş" ile "bozuk" AYRI TUTULMAK ZORUNDA.** İkisini tek `null`a indirmek
kolay ama yazım hatasını sessizce yutar: kullanıcı bir şey YAZMIŞ, araç
görmezden geliyor. `oku()` üç durum döndürüyor (`bos` · `bozuk` · `gecerli`);
boş alan sessizce atlanıyor, bozuk alan ADIYLA söyleniyor. A-a satırı da bu
ayrımı taşıyor: "yaş girilmedi" ile "yaş makul değil (0–120)" farklı cümleler.

**Negatif kontroller — yalıtımı İKİ YÖNDE birden ölç.** "Yorum artık çıkıyor"
tek başına yetmez; bozuk alanın beslediği şeyin GERÇEKTEN düştüğü de
görülmeli, yoksa kapıyı kaldırmış olursun:

| ölçüt | sonuç |
|---|---|
| Na⁺ `abc` → birincil yorum | **duruyor** ("Metabolik asidoz · HCO₃⁻ 11") |
| Na⁺ `abc` → anyon açığı | **düştü** — "Na⁺ ve Cl⁻ girilmeden hesaplanamaz" (0'dan AG uydurmuyor) |
| Na⁺ `abc` → etiket | "Yüksek anyon açıklı metabolik asidoz" → **"Metabolik asidoz"** |
| FiO₂ 5 → yorum + AG | ikisi de duruyor; **oksijenasyon düştü** (A-a "—") |
| pH `abc` (çekirdek) | yorum kartı **YOK**, kırmızı "Yorum yapılmadı" — değişmedi |
| yaş boş | "yaş girilmedi" — eski metin korundu, yeni dal yersiz ateşlemiyor |
| bomboş form | uyarı 0, yorum kartı yok |
| tam temiz vaka | Solunum asidozu + Metabolik alkaloz (sınırda) · AG 11 · A-a 5 (≈22) · P/F 333 |

Son satır elle doğrulandı: A-a = 0.21×713 − 60/0.8 − 70 = **4.73**, beklenen
70/4+4 = **21.5**, P/F = 70/0.21 = **333**.

### SINIF SÜPÜRÜLDÜ — "opsiyonel alandaki hata birincil sonucu siliyor", ikinci ve son örnek

`abg`de bulunan sınıf (yardımcı alanın birincil yorumu susturması) 131 araçta
tarandı. Ölçüt İKİ biçimi birden aradı ve ikisi de kaynaktan görülebiliyor:

```
A) alan adlarını bir diziye push edip  dizi.length === 0  ile her şeyi kapılamak
B) 3+ konjonktörlü tek bir geçerlilik değişkenini 2+ ayrı JSX bloğuna kapı yapmak
```

**Ölçüt KÖR DEĞİL — pozitif kontrol yapıldı.** (A) güncel depoda 0 aday
veriyor; düzeltme öncesi `abg` (`bc7e869`) tohumlanınca **YAKALANIYOR**
(9 push + `.length === 0`). "0 aday" ile "0 ölçüm" ayrımı böyle kapandı.

(B) sekiz aday üretti ve yedisi elle karara bağlandı — **hepsi meşru**:

| araç | neden kusur değil |
|---|---|
| `news2` · `khorana` · `glasgow-blatchford` | TOPLAM skor: beş/dört/üç alanın hepsi TEK çıktıyı besliyor, kısmi skor üretilemez |
| `meld-na` | tek sayı; `onDialysis ||` dalı zaten doğru |
| `das28` | ESR/CRP bir KİP, iki çıktı değil — sınırlar kipe göre değişiyor |
| `hba1c-eag` | tek girdi, üç blok aynı dönüşümün görünümü |
| `fibromiyalji` · `perc` | `diagnosed`/`allNegative` geçerlilik kapısı değil, TANI sonucu |

**Ayırt edici soru: bu alanlar AYRI çıktıları mı besliyor?** Toplam skorda
cevap hayır ve tek kapı doğrudur; `abg`de (asit-baz · anyon açığı ·
oksijenasyon) ve `anion-gap`te (düz AG · albümin düzeltmesi) cevap evet.

Aynı turda ölçülüp temiz çıkanlar: `spot-urine` (FENa · FEÜre · TTKG · idrar
anyon açığı · osmolal açık — her biri KENDİ kapısını taşıyor) ve `asdas`
(`crpScore`/`esrScore` ayrı kapılı, bozuk CRP ESR varyantını öldürmüyor).

#### Tek gerçek kusur: `anion-gap` — alanın etiketinde "opsiyonel" yazıyordu

Albümin alanının kendi etiketi **"Albumin (g/dL) — opsiyonel"**. Boş
bırakılması makullüğü bozmuyordu; BOZUK bırakılması bozuyordu ve tek `makul`
bayrağı bütün paneli kapatıyordu. Ölçüldü (Na 140 · Cl 100 · HCO₃⁻ 24):

| albümin alanı | ekranda (önce) |
|---|---|
| boş | AG **16** · "Yüksek Anyon Açıklı" |
| `abc` ya da `99` | AG **–** · **"Değerleri girin"** |

Düz anyon açığı yalnızca Na⁺, Cl⁻ ve HCO₃⁻ ister; üçü de geçerliyken sonucu
saklamanın gerekçesi yok. Üstelik "Değerleri girin" cümlesi YANLIŞ: kullanıcı
değerleri girmiş, araç onları okumamış. Çekirdek bozukken basılan metin de
artık hangi alanların beklendiğini söylüyor.

**Doğrulama 6 vaka, üç negatif kontrol dahil:**

| ölçüt | sonuç |
|---|---|
| alb `abc` → düz AG | **16 duruyor** + amber "Albümin hesaba KATILMADI (0,5–8 g/dL)" |
| alb `99` (sayı ama aralık dışı) | aynı — "bozuk" ikisini de kapsıyor |
| **negatif 1** — alb 2.0 geçerli | Düzeltilmiş **21** · "Düzeltmesiz AG: 16" (elle 16 + 2,5×2 = 21) |
| **negatif 2** — Na `abc` (çekirdek) | `–` · "Sodyum, klorür ve bikarbonat makul bir değer bekliyor" |
| **negatif 3** — varsayılan form | AG **12** · "Normal Aralık" (140 − 104 − 24) |
| alb boş | AG 16, uyarı YOK — yeni dal yersiz ateşlemiyor |

İkinci satır ayırt edici olan: düzeltme hâlâ çalışıyor. Bir alanı "hesaba
katma" dalına alırken, o alanın MEŞRU hâlinin işini yapmaya devam ettiğini
ayrıca ölç — yoksa kapı, özelliği öldürmüş olur.

### İKİ GERÇEKLİK AYRIŞMIŞTI — anyon açığı iki araçta iki ayrı sınır tablosuyla

Anyon açığını `anion-gap` ve `abg` birlikte hesaplıyor. Formül (`AG + 2,5 ×
(4 − albümin)`) ve yüksek eşiği (12) ikisinde de AYNIYDI — ama makullük
sınırları ayrışmıştı ve sayıldı:

| büyüklük | `abg` (`SINIRLAR`) | `anion-gap` (kendi sayfasında) |
|---|---|---|
| Na⁺ | 90–**200** | 90–**190** |
| Cl⁻ | 50–150 | 50–150 (tek uyuşan) |
| HCO₃⁻ | **1**–60 | **2**–60 |
| albümin | 0,5–**7** | 0,5–**8** |

Yani aynı albümin değeri bir araçta kabul, ötekinde ret ediliyordu. Depoda tur
tur avlanan sınıfın ta kendisi; çare de her seferinde aynı: **tek kaynağa
bağla.** `anion-gap` artık `SINIRLAR`ı ve `AG_UST`u `lib/asit-baz.ts`ten
alıyor. Ekrandaki aralık metni de sabitten türüyor, yani metin ile kapı bir
daha ayrışamaz.

**Bu bir tekleştirme, "kusur düzeltmesi" DEĞİL — ve bedeli ölçülmeli.**
`abg`deki `KOMPANZASYON_SABIT` turunda değerler zaten uyuşuyordu; burada
uyuşmuyordu, yani tekleştirme davranışı üç noktada DEĞİŞTİRİYOR ve üçü de
ölçüldü:

| girdi | eskiden | şimdi |
|---|---|---|
| albümin 7,5 | geçerli, düzeltme uygulanıyordu | **bozuk** — düzeltme düşüyor, düz AG duruyor |
| Na⁺ 195 | reddediliyordu | **geçerli** — AG 71 (195 − 100 − 24) |
| HCO₃⁻ 1,5 | reddediliyordu | geçerli |

Üçü de `anion-gap`i `abg`nin penceresine taşıyor; albümin tarafında sınır
DARALIYOR (7 g/dL üstü fizyolojik olarak gerçekçi değil), sodyum ve
bikarbonat tarafında genişliyor.

**Sınır değeri üç noktadan ölçüldü** (belgedeki kural): albümin tam **7,0**
geçiyor (düzeltilmiş AG = 16 + 2,5×(4−7) = **8,5**, bant "Normal Aralık"),
**7,1** düşüyor ve mesaj **"0,5–7"** yazıyor. Son satır aynı anda iki şeyi
birden doğruluyor: sabit ile metin aynı kaynaktan geliyor VE düşük AG eşiği
(8) hâlâ çalışıyor.

Negatif kontrol: varsayılan form 12 · "Normal Aralık" (değişmedi), albümin
2,0 ile düzeltilmiş **21** · "Düzeltmesiz AG: 16" (değişmedi).

**Düşük AG eşiği (8) yerel kaldı ve adlandırıldı** (`AG_ALT_YEREL`):
`asit-baz.ts`te karşılığı YOK, çünkü orada yalnızca yüksek AG bir bulgu
üretiyor. Karşılığı olmayan bir sabiti paylaşılan tabloya zorlamak, olmayan
bir ortaklık uydurmak olurdu.

### İki tarama gerçek kusur çıkarmadı — ama biri KÖRDÜ ve ölçüt düzeltildi

Aynı turda iki sınıf tarandı ve ikisi de temiz çıktı. Not edilmelerinin
sebebi sonuç değil, **ölçütlerin nasıl sınandığı**.

**1) "Hesaplanamadı" olumsuz hükme düşüyor mu?** (`ktv`nin "YETERSİZ DİYALİZ",
`kdigo-aki`nin "AKI Kriteri Yok" kusurlarının sınıfı.) Ölçüt: bir GEÇERLİLİK
bayrağı doğrudan iki KLİNİK etiket arasında seçim yapıyorsa aday.

İlk sürüm **0 aday** verdi ve pozitif kontrol DÜŞTÜ — düzeltme öncesi `ktv`
(`965f402`) taranınca hiçbir şey bulmuyordu. İki ayrı körlük vardı:

- **"İstem" süzgeci fazla genişti.** Tire (`—`) istem işareti sayılıyordu,
  oysa normal bir etikette de geçiyor: *"YETERSİZ DİYALİZ **—** PROTOKOL
  GÖZDEN GEÇİRİLMELİ"* bu yüzden eleniyordu. Tire yalnızca dizenin TAMAMI
  tire ise istem sayılmalı.
- **`\bOk` Türkçe/camelCase adlarda tutmuyor.** Bu depoda geçerlilik bayrağı
  SONEK oluyor: `spOk` · `preOk` · `kiloMakul` · `heparinTamam`. `\b` bir
  kelime sınırı istediği için `spOk` içindeki `Ok` hiç eşleşmiyordu.

Düzeltilince pozitif kontrol geçti (`spOk && eOk && urrOk ? "SAĞLANDI" :
"YETERSİZ DİYALİZ"` yakalanıyor) ve güncel depo **2 aday** verdi; ikisi de
elle karara bağlandı ve sahte: `ktv`nin üç sonuç kartı da `value === null`
dalını ZATEN taşıyor (hem zemin hem metin), `nrs-2002`deki dize ise
kullanıcıya görünen bir etiket değil iç durum adı (`"eksik-ana"`/`"sonuc"`).

**2) Bant merdiveninde AÇIKTA KALAN tam değer.** Ölçüt: aynı değişken aynı
sabitle hem `<` hem `>` ile karşılaştırılıyorsa, tam o değer hiçbir dala
girmiyordur. Sentetik tohumla iki yönlü sınandı (`< 4` + `> 4` yakalanıyor,
`< 4` + `>= 4` yakalanmıyor). 131 araç · **693 karşılaştırma** ölçüldü,
**3 aday** çıktı ve üçü de sahte:

| aday | neden sahte |
|---|---|
| `wells-dvt` `pts` | `pts > 0` ile `pts < 0` bant merdiveni değil — artı puanlı ölçütleri eksi puanlı olandan ayırıyor; hiçbir ölçüt 0 puan taşımıyor |
| `spot-urine` `v` | AYNI ADLI İKİ DEĞİŞKEN: biri 150 eşiğiyle, öteki TTKG fonksiyonunun parametresi (`v < 5` / `v > 7`) |
| `sodium` `litersNeeded` | yön kapısı ile gösterim kapısı, merdiven değil |

**Ölçütün sınırı yazılmalı: ad tabanlı ve KAPSAM KÖRÜ.** Farklı kapsamlardaki
aynı adlı değişkenleri tek sayıyor, bu yüzden "kapsam tarandı" iddiası
üretemez — yalnızca elle bakılacak satırı 693'ten 3'e indiriyor.

### KAPSAM DÜZELTMESİ — adres parametresi okuyan araç 11 değil **15**, ve kaçan dörtten biri KUSURLUYDU

Belgede "11 araç durumunu adres parametresinden tohumluyor" yazıyordu ve
o tur sonunda "on bir aracın onu temiz" denmişti. Sayım yeniden yapıldı:

```
grep -l "URLSearchParams(window.location.search)" app/tools/*/page.tsx   ->  15
```

Kaçan dört araç: `child-pugh` · `sledai2k` · `wells-dvt` · `wells-pe`.
Üçü temiz (`=== "1"` bool kalıbı — "1" dışındaki her şey `false`), biri
KUSURLUYDU.

**Neden kaçtılar: parametre adı SABİT DEĞİL, DİZİDEN geliyor.**

```
gcs        : Number(s?.get("e")) || 4                     ← eski tarama bunu görüyordu
child-pugh : CATEGORIES.forEach(c => … s?.get(c.key) …)   ← görmüyordu
```

Ölçüt `s?.get("<harfi harfine ad>")` arıyordu; dinamik anahtar okuyan dört
araç hiç ölçülmedi. **Bir kanalı taradığını söylerken, o kanalın DİNAMİK
biçimini de tanıdığını doğrula** — belgedeki "desen tahmin etme" kuralının
sayım tarafındaki hâli.

#### `child-pugh` — uydurma bir adres, Child C hastaya "%100 sağkalım" diyordu

Satır `Number(s?.get(c.key)) || 1` idi; HER sayıyı kabul ediyordu. Bu araçta
serbest sayısal alan yok (değerler düğmeyle seçiliyor), o yüzden "zaten
geçersiz değer giremezsin" varsayılıp hiç kapı konmamıştı — `gcs` turunda
yazılan dersin birebir tekrarı: **serbest girdinin YOKLUĞU aracı güvenli
GÖSTERİR, güvenli YAPMAZ.**

Canlıda ölçüldü:

| adres | ekranda |
|---|---|
| `?hepsi=99` | **TOPLAM 495 / 15** · Class C |
| `?bilirubin=-99` + kalanı 3 | **TOPLAM −87 / 15** · **Class A · "1 Yıllık Sağkalım ≈ %100"** |
| `?hepsi=2.5` | **TOPLAM 12.5 / 15** · Class C |

İkincisi tehlikeli yön ve gerekçesi aritmetikte duruyor: albümin 3 + INR 3 +
asit 3 + ensefalopati 3 = 12 puan, yani hasta TEK BAŞINA Class C. Tek bir
uydurma bilirubin değeri onu Class A'ya ve %100 bir yıllık sağkalıma
taşıyordu. Ekran ayrıca kendisiyle çelişiyordu — payda 15 iken 495 ve −87
basıyor; GKS'deki "297 / 15" ve MELD'deki eksi skorla aynı şekil.

**Geçerli küme ELLE YAZILMADI**, düğmeleri çizen aynı `options` dizisinden
alınıyor (`c.options.some(o => o.value === n)`) — `gcs`teki çarenin aynısı.
Şıklar değişirse sınır listesi sessizce çelişmesin diye.

**Doğrulama, üçü de aynı ölçümde:**

| ölçüt | sonuç |
|---|---|
| `?hepsi=99` | **5 / 15 · Class A** — hepsi tabana düşüyor, 5 gerçek asgari |
| `?bilirubin=-99` + dört geçerli `3` | **13 / 15 · Class C** — çöp atıldı, GEÇERLİ dördü korundu |
| **negatif kontrol** — tamamen geçerli adres | `3,2,1,2,1` → **9 / 15 · Class B**, beş düğmenin beşi de basılı |

İkinci satır tek başına iki soruyu birden cevaplıyor: çöp eleniyor mu, ve
elenirken meşru değerler de gidiyor mu? (5+3+3+3+3 değil, 1+3+3+3+3 = 13.)

**Puanlamanın kendisi ayrıca yayımlanmış hâliyle karşılaştırıldı ve temiz:**
bilirubin <2/2–3/>3 · albümin >3,5/2,8–3,5/<2,8 · INR <1,7/1,7–2,2/>2,2 ·
asit ve ensefalopati üçer basamak; sınıf sınırları A 5–6 · B 7–9 · C 10–15
(kodda `>= 10` ve `>= 7`) ve sağkalım oranları %100/%80/%45.

### "AYNI PUANLI ŞIKLAR TEK DÜĞME OLUR" SINIFI GERİ GELDİ — `pap-score`

Belgede kayıtlı sınıf: seçim durumu PUANLA saklanırsa (`value === opt.pts`),
aynı puanı taşıyan iki şık birlikte yanıp birlikte söner. O tur "114 araç
tarandı; yalnızca `apache2` ve `gout-acr`" diye kapatılmıştı. Depoda bugün
131 araç var ve ölçüt yeniden sürülünce `pap-score` çıktı.

**Kusur yayımlanmış tanımın kendisinden geliyor.** PaP'ta CPS basamakları:

```
"9–10 hafta" -> 2.5        "7–8 hafta" -> 2.5
```

İki farklı klinik seçenek, aynı puan. `RadioGroup` `value === v` ile
vurguladığı için ikisi birden seçili oluyordu.

Tarayıcıda ölçüldü — "9–10 hafta"ya tıklandığında CPS grubunda **iki radyo
birden `checked`**, ikisi de mavi. **SKOR DOĞRUYDU** (ikisi de 2.5), yani
sayıya bakan bir ölçüm "temiz" der; kusur yalnızca arayüzde ve erişilebilirlik
ağacında: kullanıcı hangi şıkkı seçtiğini göremiyor, ekran okuyucu tek grupta
iki seçili radyo bildiriyor.

Çare `apache2` ile aynı: seçimi **kimlikle** sakla. Orada `{pts,label}`
nesnesi tutulmuştu; burada indeks yetiyor. `key={v + l}` de indekse bağlandı —
çalışıyordu ama aynı kırılganlığın başka biçimi.

| ölçüt | önce | sonra |
|---|---|---|
| "9–10 hafta" seçili | CPS grubunda **2** radyo | **1** |
| "7–8 hafta" seçili | CPS grubunda **2** radyo | **1** |
| **negatif** — tavan (hepsi en ağır) | — | **17,5 · Grup C · "< %30"** |
| **negatif** — CPS 4,5 + KPS 2,5 | — | **7 · Grup B · "~%30–70"** |

Tavan satırı ayrıca payda denetimi: 8,5 + 2,5 + 1,5 + 1 + 1,5 + 2,5 = **17,5**,
yayımlanmış PaP azamisiyle birebir. Bantlar da doğru (A ≤5,5 · B ≤11 · C >11)
ve şık puanları yayımlanmış hâliyle karşılaştırıldı — CPS yedi basamak, KPS
0/2,5, anoreksi 1,5, dispne 1, lökosit 0/0,5/1,5, lenfosit 0/1/2,5.

**Ölçüt bir kez daha yanlış pozitif üretti ve şekli öğretici:** `apache2` on
bir grupta tekrar eden puan taşıyor (fizyolojik merdivenler simetrik — hem
çok yüksek hem çok düşük 4 puan) ve tarama onu işaretledi. Ama `apache2`
ARTIK kimlikle karşılaştırıyor (`sel[param.id]?.label === opt.label`). Yani
tekrar eden puanın KENDİSİ kusur değil; kusur **tekrar eden puan + puanla
karşılaştırma** ikilisi. İki koşul birden aranmalı ve ikincisi seçim
mekanizmasına bakarak doğrulanmalı.

### Kapalı bir sayımı yeniden yapmak — bu turda ikinci kez iş çıkardı

`child-pugh` turunda "11 adres okuyan araç" sayımı 15 çıkmıştı. Aynı yöntem
"sayısal varsayılanı olan 27 (+3) araç" iddiasına uygulandı:

| biçim | araç |
|---|---|
| `useState("140")` düz metin | 27 |
| `useState<string>(s?.get("pf") \|\| "400")` | 3 |
| **`useState(24)` — SAYI tipli** | **17** |

Metin tarafı tutuyor (27 + 3 = 30, belgedeki düzeltilmiş sayı doğru). Ama
**sayı tipli varsayılan hiç sayılmamıştı.** Onaltısı indeks/sekme seçicisi
(zararsız), biri (`pap-score`) yukarıdaki kusuru taşıyordu.

Bu tarama ayrıca bir soru açıyor ve cevabı KUSUR DEĞİL: `pap-score`, `ppi`,
`rockall`, `findrisc` gibi seçici tabanlı araçlar dokunulmamış formda bir
prognoz basıyor (`pap-score` "Grup A · 30 günlük sağkalım > %70",
`ppi` "≥ 6 HAFTA"). Ölçüldü — bu araçlarda her grubun varsayılan seçeneği
EKRANDA GÖRÜNÜR biçimde işaretli (radyo dolu). Yani `nrs-2002`deki
"`<select>`te `value` yoksa dokunulmadı ile ilk seçenek aynı şeydir" durumu
DEĞİL: burada seçim beyan ediliyor. Ayrım ölçülebilir ve ölçüldü —
`input:checked` sayısı grup sayısına eşit.

### `curb65` ve `bode` yayımlanmış hâliyle karşılaştırıldı — temiz

Aynı turda sürekli değişkenli iki skor daha okundu:

- **CURB-65**: konfüzyon · üre > 7 mmol/L (**> 19 mg/dL BUN** — araç İKİ
  birimi birden yazıyor, belgedeki birim ilanı kuralının örnek uygulaması) ·
  SS ≥ 30 · SKB < 90 / DKB ≤ 60 · yaş ≥ 65; bantlar 0–1 ayaktan, 2 kısa
  yatış, ≥3 yatış/YBÜ. Hepsi yayımlanmış hâliyle birebir.
- **BODE**: VKİ >21/≤21 · FEV₁ ≥65/50–64/36–49/≤35 · mMRC 0–1/2/3/4 ·
  6DYT ≥350/250–349/150–249/<150 · çeyrekler 0–2/3–4/5–6/7–10 ve dört
  yıllık sağkalım %80/%67/%57/%18. Birebir.

### KODDAKİ MERDİVEN ile YAYIMLANMIŞ TANIM — `bant-denetim`in göremediği taraf

`bant-denetim` ekranda basılan cetvel ile koddaki merdiveni karşılaştırıyor ve
27 araçta 0 çelişki buluyor. Ama cetveli EKRANDA BASMAYAN bir araçta
karşılaştırılacak ikinci gerçeklik yok — orada merdivenin doğruluğu ancak
YAYIMLANMIŞ tanımla karşılaştırılarak anlaşılır. Bu ayrı bir iş ve `grace`de
bir kusur çıkardı.

**`grace` — bant sınırı bir puan kaymıştı.** Yayımlanmış GRACE hastane içi
mortalite bantları: **DÜŞÜK ≤ 108** (<%1) · ORTA 109–140 (%1–3) · YÜKSEK > 140
(>%3). Kod `s < 108` diyordu, yani tam 108 ORTA banda düşüyordu.

Tarayıcıda ölçüldü (yaş 60–69 = 58 · nabız 70–89 = 9 · SKB 120–139 = 34 ·
kreatinin 0,80–1,19 = 7 · Killip I = 0 → tam 108):

| | ekranda |
|---|---|
| önce | "GRACE **108** · **ORTA RİSK** · %1–3 hastane içi mortalite" |
| sonra | "GRACE **108** · **DÜŞÜK RİSK** · <%1 hastane içi mortalite" |

Tek puanlık kayma ama tam sınırda ve bandın adı taburculuk/gözlem kararını
besliyor.

**Sınır BEŞ noktadan ölçüldü** ve yalnızca 108 oynadı — üst sınır dokunulmadı:

| skor | ekranda | not |
|---|---|---|
| 102 | DÜŞÜK | değişmedi |
| **108** | **DÜŞÜK** | **düzeldi** |
| 114 | ORTA | değişmedi |
| **140** | ORTA | üst sınır dahil, değişmedi |
| 143 | YÜKSEK | değişmedi |

**Puan tablosunun tamamı ayrıca yayımlanmış hâliyle karşılaştırıldı ve
temiz:** yaş 0/8/25/41/58/75/91/100 · nabız 0/3/9/15/24/38/46 · SKB
58/53/43/34/24/10/0 (ters yönlü) · kreatinin 1/4/7/10/13/21/28 · Killip
0/20/39/59 · arrest 39 · ST 28 · enzim 14.

**İLAN DÜZELTMESİ — başlık "GRACE 2.0" diyordu, uygulanan 1.0.** Toplamsal
puan sistemi (0–258 arası, yukarıdaki nomogram puanları ve ≤108/109–140/>140
bantları) GRACE **1.0**'dır. GRACE 2.0 toplamsal değildir; sürekli
değişkenlerden doğrudan mortalite yüzdesi üretir ve 0–258 arası bir toplam
yoktur. Başlık "GRACE", alt başlık "Toplamsal Puan (1.0)" oldu — araç ne
hesapladığını doğru söylüyor.

### Bu turda ölçülüp TEMİZ çıkanlar — yeniden ölçmeye gerek yok

| araç | ölçülen |
|---|---|
| `curb65` | beş ölçüt yayımlanmış hâliyle birebir; üre eşiği İKİ birimle birden yazılı (> 7 mmol/L · > 19 mg/dL BUN) — birim ilanı kuralının örnek uygulaması; bantlar 0–1 / 2 / ≥3 |
| `bode` | VKİ · FEV₁ · mMRC · 6DYT basamakları ve çeyrekler (0–2/3–4/5–6/7–10), dört yıllık sağkalım %80/%67/%57/%18 — birebir |
| `infusion` | **doğrulanmış 18'lik infüzyon serisinde YOKTU.** İki hesabı da elle sürüldü: 125 mL/sa × 20 gtt/mL ÷ 60 = **41,7 damla/dk**; 70 kg × 0,05 mg/kg/dk × 60 ÷ 1 mg/mL = **210 mL/sa**; 70 kg × 0,1 ÷ 20 mg/mL = **21**; kilo iki katına çıkınca **42** (kiloya bağımlılık kanıtı). ×60 çevrimi yerinde, beş alanın beşinde de alt VE üst sınır var, iki bölüm birbirinden bağımsız hesaplanıyor |

Ayrıca kapalı sayımlar yeniden doğrulandı: `Math.abs` yalnızca `sodium`da (1),
`calc-utils`te ölü dışa aktarım tam olarak belgedeki dört (`mmolToMgdl`,
`calculateSofaScore`, `checkPercCriteria`, `calculateWellsDvt`).

**Bir sayım tuzağı: "/dk basan araç" 13 çıktı, belgede 8 yazıyor — ve belge
DOĞRU.** Fark ölçütte: `/dk` deseni `curb65`, `qsofa`, `sofa`, `psi-port`,
`grace`, `perc`, `glasgow-blatchford` gibi araçlarda **solunum sayısı
etiketini** (`solunum/dk`) yakalıyor; bunlar hız çıktısı değil girdi etiketi.
Gerçek "dakika başına hız basan" küme belgedeki sekiz. Sayım düzeltmesi
yaparken ölçütün GENİŞLEMİŞ olabileceğini de hesaba kat — bu turda önceki iki
sayım düzeltmesi (11→15, 27→+17) gerçek boşluktu, bu üçüncüsü sahteydi.

### AYNI İNDEKS İKİ ARAÇTA — biri EKSİKTİ ve hastalık aktivitesini sistematik olarak düşük gösteriyordu

`grace` turunda açılan damar ("cetveli ekranda basmayan araçlarda merdiven hiç
denetlenmiyor") tarandı: merdiveni olan 22 aracın 14'ü ekranda cetvel de
basıyor (yani `bant-denetim` görüyor), **8'i basmıyor**. O sekiz tek tek
yayımlanmış tanımla karşılaştırıldı:

| araç | sonuç |
|---|---|
| `conut` | 0–1 / 2–4 / 5–8 / 9–12 — birebir |
| `dapsa` | ≤4 / 5–14 / 15–28 / >28 — birebir |
| `sdai` | ≤3,3 / 3,4–11 / 11,1–26 / >26 — birebir |
| `ranson` | ≥3 %15 · ≥5 %40 · ≥7 >%50 — yayımlanmış mortalite eşleşmesiyle uyumlu |
| `news2` · `gnri` | bu oturumda zaten ölçülmüştü |
| `haq-di` | bantlar (<0,5 / <1,5 / <2,5) literatürde TEK BİR standarda oturmuyor — **değiştirilmedi**, beklentiyi kaynakla sınamadan dokunmak doğru olmaz |
| `sle` | **aşağıdaki bulgu** |

#### İki araç da `<h1>SLEDAI-2K</h1>` diyordu, biri 24 tanımlayıcı biri 16

`heart-score` / `heart` kalıbının ikinci örneği. Fark tarayıcıda ölçüldü —
her iki araçta da BÜTÜN kutular işaretlenerek:

| yol | tanımlayıcı | tavan | ekranda (hepsi işaretli) |
|---|---|---|---|
| `/tools/sle` | **24** | **105** | "TOPLAM **105** · Çok Yüksek Aktivite" |
| `/tools/sledai2k` | 16 | 61 | "SKOR **61** · YÜKSEK AKTİVİTE" |

Yayımlanmış SLEDAI-2K **24 tanımlayıcı** taşır ve azami **105**'tir
(8 puanlık 8 madde + 4 puanlık 6 + 2 puanlık 7 + 1 puanlık 3 = 64+24+14+3).
`sle` bunu birebir uyguluyor; `sledai2k` 8 puanlık dört maddeyi (organik beyin
sendromu · görme bozukluğu · kraniyal sinir tutulumu · lupus baş ağrısı) ve
renal/serolojik maddelerin bir kısmını taşımıyor.

**Bedeli tek yönlü ve sistematik:** eksik sürüm hiçbir hastada 61'i aşamıyor,
yani ağır nöropsikiyatrik ya da renal lupusta aktivite olduğundan düşük
çıkıyor. Üstelik her kutusu işaretli bir hastada bile kendi en üst bandına
("Çok Yüksek") ulaşamıyor — ekran kendi cetveliyle çelişiyor.

Karar `heart-score → heart` ile aynı: **tam olan tutuldu, eksik olan
yönlendirildi** (`next.config.js`), adres kırılmıyor.

**ÜÇÜNCÜ AYRIŞMA — hub, `sle`yi BAŞKA BİR ARAÇ sanıyordu.** Araç listesi onu
*"SLE Kriterleri — Sistemik Lupus Eritematozus **sınıflama kriterleri**"* diye
tanıtıyordu; sayfanın kendisi ise SLEDAI-2K aktivite indeksi. Yani kullanıcı
sınıflama kriteri arayıp aktivite indeksine, aktivite indeksi arayıp EKSİK
sürüme düşüyordu. Kayıt sayfanın gerçeğine hizalandı.

**Tek kayıt düzeltmesi dört yüzeye birden yayıldı** — "sayı yazma, saydır"
mimarisinin çalıştığının kanıtı: `arac-metadata.cjs` yeniden çalıştırılınca
sayfanın `<title>`, açıklama, OpenGraph, `SoftwareApplication` şeması ve
kırıntı (breadcrumb) adı kendiliğinden düzeldi.

**Doğrulama:**

| ölçüt | sonuç |
|---|---|
| `/tools/sledai2k` | **`/tools/sle`ye yönleniyor**, 200, h1 "SLEDAI-2K" |
| `/tools/sle` | 200, h1 "SLEDAI-2K", tavan 105 |
| hub sayacı | 131 → **130** ("130 araç listeleniyor") |
| hub kaydı | tek SLE girdisi, "SLEDAI-2K · Lupus hastalık aktivite indeksi — 24 tanımlayıcı, 0–105" |
| eski açıklama | ekranda **yok** |
| `arac-metadata --kontrol` | senkron (130) |
| `link-denetim` | CI kapısı temiz, uyarı sınıfı belgedeki 27'de |
| derleme | 622/622 (bir sayfa eksildi, beklenen) |

**Ölçüt not: "aynı işi yapan iki araç" taraması ucuz ve iki kez iş çıkardı.**
Aday üretmenin yolu araç `<h1>`lerini saymak; aynı başlığı taşıyan iki slug
varsa ya biri eksiktir ya biri kapısızdır. Bu depoda ikisi de görüldü
(`heart-score` kapısızdı, `sledai2k` eksikti).

### CETVEL VE MERDİVEN TUTARLI OLABİLİR AMA İKİSİ DE YANLIŞ — `bant-denetim`in kör noktası

`bant-denetim` ekrandaki cetvel ile koddaki merdivenin KAPSAYICILIĞINI
karşılaştırıyor; ikisi aynı şekilde yanlışsa geçer. `grace` turunda cetvelsiz
sekiz araç yayımlanmış tanımla karşılaştırılmıştı; bu tur **cetvel basan 14
araç** da aynı ölçütten geçirildi.

| araç | merdiven | yayımlanmışla |
|---|---|---|
| `abcd2` | ≤3 / ≤5 | 0–3 düşük · 4–5 orta · 6–7 yüksek ✓ |
| `apache2` | ≤4/≤9/≤14/≤19/≤24/≤29/≤34 | beşerli mortalite basamakları ✓ |
| `asdas` | <1,3 / <2,1 / <3,5 | ✓ |
| `cdai` | ≤2,8 / ≤10 / ≤22 | ✓ |
| `ciwa-ar` | <8 / <15 | ✓ |
| `findrisc` | ≤6/≤11/≤14/≤20 | ✓ |
| `mna` | ≥12 / ≥8 | 12–14 normal · 8–11 riskli · 0–7 malnütre ✓ |
| `pap-score` · `pni` · `ppi` · `rockall` · `sdai` | — | ✓ |
| `charlson` | ≤1 / ≤2 / ≤5 | nitel bant adları literatürde tek partisyona oturmuyor; 10 yıllık sağkalım üsteli (`0.983 ** exp(0.9×skor)`) doğru — **değiştirilmedi** |
| `grace` | — | önceki turda düzeltildi |
| **`hscore`** | — | **iki kusur, aşağıda** |

#### `hscore` — ilan 337, ulaşılabilir 327: eksik olan tam bir basamaktı

Alt başlık "0–337" diyor. Şık tablolarından hesaplanan azami **327** çıktı.
Aradaki 10 puan tek bir yerden geliyordu: yayımlanmış HScore'da sitopeni
basamağı **üç değerlidir** (1 seri 0 · 2 seri 24 · **3 seri 34**); araçta
üçüncü şık yoktu ve `"≥ 2 seri"` etiketi 24 puanla pansitopeniyi de
kapsıyordu. Yani üç serisi birden düşük olan hasta **10 puan eksik** alıyordu.

Şık eklendi, etiketler ayrıştırıldı ("2 seri" / "3 seri (pansitopeni)").
Tarayıcıda ölçüldü:

| seçim | skor |
|---|---|
| hepsi en yüksek + **3 seri** | **337** — ilanla birebir |
| hepsi en yüksek + **2 seri** | **327** — fark tam 10 |

İkinci satır negatif kontrol: iki şık da çalışıyor, ayrı ayrı seçilebiliyor ve
eski tavan artık iki-serili hastanın DOĞRU değeri.

**`payda-denetim` bunu göremezdi**, çünkü tavan ilanı `/ N puan` biçiminde
değil düz metin ("0–337"). Ölçüt aday üretemediği yerde sayım elle yapılır.

#### Aynı araçta ikinci kusur: şerit kendi cetveliyle çelişiyordu

Sayfanın tepesindeki KOŞULSUZ şerit — hiçbir parametre yanıtlanmadan bile
ekranda — şunu diyordu: **"HScore ≥ 169 → HLH olasılığı %93+"**.

Aracın KENDİ olasılık cetveli ise aynı sayfada şunu diyor:

```
< 169    < %5        169–209  %14–26        210–239  %57–93        ≥ 240  > %93
```

Yani şerit, en üst bandın olasılığını 169 eşiğine atfediyordu — iki band
sapma. Karışıklığın kaynağı belli: 169'daki ~%93 bir OLASILIK değil
**DUYARLILIK** değeri (Fardet 2014'te en iyi ayrım noktası). İkisi farklı
şeyler ve aynı ekranda iki ayrı sayı olarak duruyorlardı.

Şerit artık olasılık iddiası taşımıyor; eşiğin ne olduğunu söyleyip olasılığı
TEK KAYNAĞA — cetvele — bırakıyor. Yan bulgu: sonuç rozetinde
`HLH OLASILĞI` yazıyordu (eksik İ), düzeltildi.

### "Aynı işi yapan iki araç" sınıfı ölçümle kapandı

`sledai2k` bulgusunun ardından ölçüt bütün araçlara sürüldü: **130 aracın
130'unda benzersiz `<h1>`**, yani başlık düzeyinde başka çift yok.

Başlık eşleşmesi dar olduğu için ikinci bir ölçüt de sürüldü: **şık
etiketlerinin küme benzerliği** (Jaccard). 84 aracın etiket dizisi var; en
yüksek çift **`cdai` ~ `sdai` = 0,92** ve `cdai`in 11 etiketinin 11'i de
`sdai`de geçiyor.

**Bu bir kopya DEĞİL, yayımlanmış bir aile:** CDAI = SDAI eksi CRP. Ama tam
bu yüzden eşiklerin kopyalanmış olma riski yüksekti ve kontrol edildi —
ikisi de doğru ve FARKLI:

```
CDAI  = TJC + SJC + PtGA + PhGA          ≤2,8 / ≤10 / ≤22 / >22
SDAI  = TJC + SJC + PtGA + PhGA + CRP    ≤3,3 / ≤11 / ≤26 / >26
```

Kalan 20 çift düşük benzerlikte gürültü (`findrisc`in beş etiketi "Evet/Hayır"
gibi genel dizeler olduğu için her yerle eşleşiyor).

**Ölçüt notu: yüksek benzerlik kusur DEĞİL, İNCELEME GEREKÇESİDİR.** İki araç
%92 aynı girdiyi alıyorsa ya biri ötekinin eksik kopyasıdır (`sledai2k`) ya da
meşru bir ailedir (`cdai`/`sdai`) — ayrımı yapan şey eşiklerin ve formülün
yayımlanmış hâlle karşılaştırılması.

### BİRBİRİNİ DIŞLAYAN BANTLAR AYRI ONAY KUTUSU OLURSA TAVAN AŞILIR

Yeni sınıf ve tek bir örneği çıktı. Şekil şu: aynı değişkenin bitişik bantları
(yaş ≥75 / yaş 65–74) ayrı birer onay kutusu olarak duruyorsa kullanıcı ikisini
birden işaretleyebilir ve skor, tanımlı tavanı aşar.

**`chads-vasc` — sekiz kutunun sekizi işaretlendiğinde ekran "TOPLAM 10"
basıyordu.** Yayımlanmış CHA₂DS₂-VASc azamisi **9**: yaş TEK bir basamaktır
(≥75 → 2, 65–74 → 1, <65 → 0) ve bir hasta ikisinde birden olamaz.

GKS'deki "297 / 15" ve MELD'deki eksi skorla aynı şekil — ekran, kendi
ölçeğinin dışında bir sayı gösteriyor ve bunu söyleyecek kimse yok.

Klinik etkisi dar ama gerçek: 65–74 kutusu işaretliyken doğum günü geçip ≥75
de işaretlenirse skor bir puan şişer; paylaşılan adres de şişmiş değeri taşır.

Çare `gcs` / `child-pugh` ile aynı yönde — **geçersiz BİLEŞİM en baştan
kurulamıyor**, ve koruma İKİ kanalda birden: tıklamada (yeni açılan bant
ötekini kapatır, kapatma serbest) ve ADRESTEN tohumlamada.

**Doğrulama altı vaka:**

| ölçüt | sonuç |
|---|---|
| hepsi + yaş ≥75 (65–74 hariç) | **TOPLAM 9** — yayımlanmış tavan, aşılamıyor |
| yalnızca 65–74 | 1 |
| ≥75 → sonra 65–74 tıkla | tek kutu kalıyor, 1 (son tıklanan kazanır) |
| `?age75=1&age6574=1` | yalnızca ≥75, **TOPLAM 2** |
| **negatif** — `?chf=1&age6574=1&female=1` | üç kutu geri geldi, **TOPLAM 3** |
| bant mantığı | erkek 0 / kadın 1 düşük, ≥2 OAK — dokunulmadı |

#### Sınıf tarandı: tek örnek

Ölçüt: onay kutusu tabanlı bir araçta, AYNI ÖNEKİ paylaşan ve ikisi de sayı
taşıyan iki etiket. 7 aday çıktı, altısı elle elendi:

| aday | verdikt |
|---|---|
| `chads-vasc` "Yaş ≥ 75" / "Yaş 65–74" | **KUSUR — düzeltildi** |
| `kdigo-aki` · `pap-score` · `ppi` | etiketler BANT adı, onay kutusu değil |
| `refeeding-risk` "BMI < 16" / "BMI < 18.5" | **temiz** — NICE yapısı gruplu ve kural `≥1 yüksek VEYA ≥2 orta`; iç içe ölçüt işaretlense de sonucu değiştiremez (zaten ≥1 yüksek tetiklenmiş olur) |
| `refeeding-risk` "%15" / "%10" kilo kaybı | aynı gerekçe |

`refeeding-risk` ayrımı öğretici: **iç içe ölçütler TOPLAM skorda çift sayım
üretir, GRUPLU EŞİK kuralında üretmez.** Ölçüt aday veriyor, kararı skorun
birleştirme biçimi veriyor.

### Saf onay-kutusu skorları yayımlanmış hâliyle karşılaştırıldı — kalanı temiz

Aritmetiği basit olduğu için hiç bakılmamış bir kümeydi; madde puanları ve
madde SAYISI ayrı ayrı sayıldı:

| araç | ölçülen | yayımlanmış |
|---|---|---|
| `has-bled` | 9 madde × 1 → azami **9** | ✓ |
| `wells-pe` | 3+3+1,5+1,5+1,5+1+1 → **12,5** | ✓ |
| `wells-dvt` | 9 madde × 1, alternatif tanı **−2** → −2…9 | ✓ |
| `timi-ua` | 7 ölçüt (yaş ≥65 · ≥3 KV risk · bilinen CAD ≥%50 · 7 günde ASA · 24 saatte ≥2 epizod · ST deviasyonu · pozitif belirteç) | ✓ |
| `perc` | 8 ölçüt (yaş ≥50 · nabız ≥100 · SpO₂ <%95 · tek taraflı bacak şişliği · hemoptizi · yakın cerrahi/travma · önceki DVT/PE · östrojen) | ✓ |
| `chads-vasc` | madde puanları doğruydu; kusur BİLEŞİMDEYDİ | — |

Son satır sınıfın özeti: **madde puanlarının tek tek doğru olması, toplamın
tanımlı aralıkta kalacağını GARANTİ ETMEZ.** Ulaşılabilir tavanı ayrıca ölç.

### BİRİM EKRANDA VAR AMA ERİŞİLEBİLİR ADDA YOK — 17 araç, çoğu infüzyon ailesi

Belgede açıkça bırakılmış bir kapsam boşluğu vardı: *"dokuz araç, belirsiz
birimli analiti olan en yüksek riskli kümeden seçildi; 131 aracın tamamı
taranmadı — 'hepsi temiz' DENMİYOR."* Kapatıldı ve kusur çıktı.

**Kaynak taraması iki kez yanılttı, ölçüm düzeltti.** İlk ölçüt yalnızca
`label`/`etiket` dizesine baktı: 155 etiketin 106'sını "birimsiz" gösterdi —
çünkü birim ayrı bir prop'ta (`birim="mmHg"`). Ölçüt tüm alan ögesini
okuyacak şekilde daraltıldı: 192 alan, 37 aday. O 37'nin çoğu da sahteydi
(sonuç satırları, onay kutuları, seçiciler; `(/μL)` ve `(0–28)` gibi zaten
birim/ölçek taşıyan etiketler).

Karar belgedeki kurala göre verildi: **adı TARAYICIDA HESAPLAT.**

**Ölçüm gerçek kusuru gösterdi ve şekli farklıydı.** Bu ailede alan şöyle
kuruluyor:

```tsx
<label htmlFor={id}>{etiket}</label>          {/* "PaCO₂" */}
<div className="relative">
  <input id={id} … />
  <span className="absolute right-3 …">{birim}</span>   {/* "mmHg" — label DIŞINDA */}
</div>
```

Birim `<label>`ın dışında olduğu için erişilebilir ada HİÇ girmiyor. Gören
kullanıcı kutunun sağında "mmHg" görüyor; ekran okuyucu yalnızca "PaCO₂"
duyuyor. Tarayıcıda ölçülen adlar:

| araç | erişilebilir ad (önce) |
|---|---|
| `abg` | PaCO₂ · HCO₃⁻ · Na⁺ · Cl⁻ · PaO₂ · Hasta yaşı — **altısı da birimsiz** |
| `vazoaktif-infuzyon` | Hasta ağırlığı · **Doz** · İlaç miktarı · Toplam hacim |
| `sedasyon-infuzyon` | Ağırlık · **Doz** · İlaç miktarı · Hacim |
| `heparin-nomogram` | Hasta ağırlığı · Heparin · Hacim |
| `dka-infuzyon` | Hasta ağırlığı · Serum potasyum |

**En pahalı iki hücre "Doz" olanlar.** Belgede kayıtlı: bu ailede birim
TABANI ilaç bazında değişiyor (nitrogliserin mcg/**dk**, noradrenalin
mcg/**kg**/dk, midazolam mg/**saat**) ve karıştırılırsa hata 60 ya da 70 kat.
Bu ayrımı taşıyan tek şey ekrandaki birim etiketiydi ve ekran okuyucuya hiç
ulaşmıyordu.

**Çare tasarıma dokunmuyor:** birim `<span>`ine kimlik verildi, `<input>`e
`aria-describedby` eklendi. Ad aynı kalıyor, birim AÇIKLAMA olarak
duyuruluyor — girdi son eki için standart kalıp.

```tsx
<input id={id} aria-describedby={birim ? `${id}-birim` : undefined} … />
<span id={`${id}-birim`} …>{birim}</span>
```

Ölçüldü (sonra):

| araç | ad · açıklama |
|---|---|
| `abg` | PaCO₂ · **mmHg** · HCO₃⁻ · **mEq/L** · … · Hasta yaşı · **yıl** |
| `vazoaktif-infuzyon` | Doz · **mcg/dk** |
| `sedasyon-infuzyon` | Doz · **mg/kg/saat** |
| `kalsiyum-infuzyon` | Glukonat dozu · g · Sulandırma · mL · Süre · dk |
| `status-epileptikus` | Ağırlık · kg · Lakosamid dozu (sabit) · mg |

**Negatif kontroller:**

| ölçüt | sonuç |
|---|---|
| birimsiz alan (pH) açıklama alıyor mu | **hayır** — `birim ? … : undefined` koruması çalışıyor |
| birim ekranda hâlâ görünüyor mu | **evet**, 4/4 span çizili (gizleme YAPILMADI) |
| kimlik çakışması | yok — sayfadaki dört `-birim` kimliği benzersiz |
| `arayuz-denetim` · `ic-bilesen-denetim` | ikisi de temiz |

**DÖRT ARAÇ BİLEREK DIŞARIDA ve sebebi ölçüldü:** `ktv`, `osmolal-gap`,
`sodium`, `spot-urine` alanı SARAN `<label>` kullanıyor, yani birim span'i
zaten adın içinde ("Ultrafiltrasyon**Litre**"). Onlara dokunmak gereksiz bir
ikinci duyuru üretirdi. **Aynı sınıfın iki yapısı var; hangisinde olduğunu
ölçmeden düzeltme.**

Yan bulgu: `bmr`in yaş alanı hiç birim taşımıyordu — kardeşleri "Boy (cm)" ve
"Ağırlık (kg)" derken "Yaş" diyordu. "Yaş (yıl)" oldu.

### ARAÇ KENDİ KURALINI İLAN EDİP UYGULAMIYORDU — `haq-di` yardımcı araç kuralı

Sayfanın altındaki açıklama şunu diyordu (ve DOĞRU, yayımlanmış HAQ-DI'nin
kuralı budur):

> "Yardımcı cihaz veya başka bir kişinin yardımı kullanılıyorsa ilgili soru
> skoru **en az 2** olarak değerlendirilir."

Ama araçta bunu kaydedecek **hiçbir girdi yoktu** — sekiz kategori yalnızca
0–3 güçlük düzeyiyle puanlanıyordu. Cümle *"değerlendirilir"* dediği için
kullanıcı bunu aracın yaptığını sanıyor; oysa kendi kafasında yükseltmedikçe
kural hiç işlemiyordu.

Bu, depoda tur tur avlanan **"ilan mı gerçek mi"** sınıfının en saf hâli:
metin doğru, hesap eksik. `sledai2k`de eksik olan TANIMLAYICILARdı, burada
eksik olan bir KURAL.

Çare `gnri`deki cinsiyet seçicisiyle aynı yönde — formülün ihtiyaç duyduğu
girdi EKLENDİ ve varsayım görünür kılındı: her kategoriye bir onay kutusu,
işaretlenirse `Math.max(kategoriSkoru, 2)`.

**Doğrulama beş vaka, ikisi negatif:**

| girdi | HAQ-DI | not |
|---|---|---|
| sekiz kategori "Güçlük yok", yardım yok | **0,00** · MİNİMAL | taban |
| aynı + **1** yardım | **0,25** (2/8) | o kategori 0 → 2 |
| aynı + **4** yardım | **1,00** (8/8) · ORTA | bant değişiyor |
| **negatif** — hepsi "Yapamıyor" (3) + **8** yardım | **3,00** | `Math.max(3,2)` — skor DÜŞMÜYOR |
| **negatif** — hepsi "Yapamıyor", yardım yok | **3,00** | aynı |

Dördüncü satır belirleyici: kural bir TABAN, tavan değil. `Math.min` yazılsaydı
en ağır hastanın skoru 2'ye çekilirdi ve ölçüm bunu yakalar.

Onay kutusu deponun klavye kalıbını izliyor (`sr-only` girdi + saran etikette
`focus-within` halkası), yani belgedeki "gizlenen form kontrolü `hidden` ile
gizlenmez" kuralına uygun.

### `basdai` ölçeğinin on katını basıyordu — üst sınır süpürmesinin kaçırdığı biçim

Aracın kendi şeridi *"Her soru için 0–10 NRS"* diyor. Tarayıcıda ölçüldü:
altı alana da 100 yazıldığında ekran **"BASDAI = 100.0"** basıyordu.

**Kapalı sanılan üst sınır süpürmesi bunu neden kaçırdı:** o ölçüt
*"alt sınırı var, üst sınırı YOK"* biçimini arıyordu (`x >= 1 && ...` gibi).
`basdai`nin kapısında hiç sayısal karşılaştırma yoktu — yalnızca
`sayiGirildiMi`. Yani **İKİSİ DE yoktu** ve ölçüt aday üretemedi.

Aktarılabilir kural: bir sınıfı "alt sınır var ama üst yok" diye tararken,
**hiç sınırı olmayan** kümeyi de ayrıca say. Ölçüt kusurun bir biçimine
göre yazılınca öteki biçimi görmez.

Sınır üç noktadan ölçüldü: **tam 10 geçiyor** (10,0), **10,1 düşüyor**,
altı alan 6 iken sonuç 6,0 ile değişmedi. Düşen durumda sessiz kalmıyor —
"Altı sorunun altısı da 0–10 arası bir sayı bekliyor. Sıfır geçerlidir."

**Formülün kendisi doğruydu ve ayrıca doğrulandı:** BASDAI =
(S1+S2+S3+S4+(S5+S6)/2)/5. Altı soruya da 6 verildiğinde sabah tutukluluğu
ortalaması 6,0 ve skor 6,0 — yani ne 6'ya bölme ne de S5/S6 ortalamasını
atlama hatası var (bu indekste en sık iki hata biçimi).

### "HİÇ SINIRI OLMAYAN" KÜME TARANDI — `calvert`de kemoterapi dozu on kata çıkabiliyordu

`basdai` turunda çıkan kural hemen sürüldü: *bir sınıfı "alt sınır var ama üst
yok" diye tararken, HİÇ SINIRI OLMAYAN kümeyi de ayrıca say.*

Ölçüt: serbest sayısal girdisi olan araçlarda, `parseLocaleNumber` ile okunan
her değişken için ya doğrudan bir sabit karşılaştırması ya da bir sınır
yardımcısına (`makul` · `araliktaMi` · `alanMakul` · `glukozMakul`…) argüman
olarak geçiş aranıyor. İkisi de yoksa aday.

**Ölçüt iki kez daraltıldı ve ikisi de sahte aday üretiyordu:** ilk sürüm
yalnızca doğrudan karşılaştırmayı gördüğü için `abg`, `sodium`, `anion-gap`
gibi yardımcıyla kapılanmış araçların tamamını işaretledi (26 araç). Yardımcı
çağrısı da sayılınca 17'ye düştü; kalanların çoğu da HAM DİZEYİ kapılayan
biçimdi (`alanMakul(ham, alt, ust)`), yani sayısal değişkende sınır
görünmüyor ama girdi zaten eleniyor.

Elle karara bağlanınca **tek gerçek boşluk `calvert`in AUC alanıydı.**

#### `calvert` — GFR korumalıydı, AUC değildi

Araç `dose = AUC × (GFR + 25)` hesaplıyor. GFR tarafında belgede kayıtlı bir
düzeltme var (125 kırpması, "sınırı koymamak sessiz bir aşırı doz demektir").
AUC tarafında hiçbir kapı yoktu — oysa doz DOĞRUDAN AUC ile ölçekleniyor.

Tarayıcıda ölçüldü (GFR 100):

| AUC | ekranda |
|---|---|
| 5 | 625 mg — doğru |
| **50** | **6250 mg** — tek fazladan hane, **on kat karboplatin** |
| GFR `abc` + AUC 5 | **125 mg** — sessizce YETERSİZ doz |

Alanın **kendi ipucu "Tipik: 4–6" diyor**; ekran beklediği aralığı yazıp 50'yi
sessizce kabul ediyordu. Üçüncü satır ters yönde ve daha sinsi: GFR'ye düşen
bir harf 0'a çevriliyor, doz `5 × 25 = 125 mg` oluyor ve kanser hastasına
yetersiz doz hesaplanıyor — hiçbir uyarı olmadan.

Sınırlar klinik eşik DEĞİL, makullük sınırı: yayımlanmış karboplatin
protokollerinde AUC 1,5–7 olağan, kök hücre desteğiyle 12'ye çıkabilir.
12 tavanı hiçbir gerçek protokolü reddetmiyor. GFR 1–200 ayrı bir makullük
sınırı; 125 kırpması formülün kendi kuralı ve DOKUNULMADI.

**Doğrulama altı vaka, ikisi negatif kontrol:**

| ölçüt | sonuç |
|---|---|
| AUC 5 · GFR 100 | **625 mg** — değişmedi |
| AUC 50 | **–** + "Makul bir değer bekleyen alan: hedef AUC (1–12 mg/mL·dak)" |
| GFR `abc` | **–** + alan ADIYLA söyleniyor |
| **negatif** — GFR 150 | **750 mg** + "GFR 150 → 125 ile sınırlandırıldı" — eski özellik sağlam |
| sınır — AUC tam **12** | **1500 mg** geçiyor |
| sınır — AUC **12,1** | düşüyor |

Dördüncü satır belirleyici: yeni kapı, var olan kırpma özelliğini öldürmedi.

### Aynı taramadan çıkan iki verdikt — ölçüldü, DEĞİŞTİRİLMEDİ

| araç | saçma girdi | verdikt |
|---|---|---|
| `tft` | TSH 9999 | "TSH↑ 9999 mIU/L" — desen tanıma aracı, doz üretmiyor; saçma değer yine "yüksek" sınıfına düşüyor, yani karar zararlı yönde değişmiyor |
| `hiperkalemi-tedavi` | K 9999 | en ağır banda düşüyor — yön doğru |

İkisi de `tirads` / `homa-ir` ile aynı aile: **saçma girdi kararı zararlı yönde
değiştirmiyorsa sınır koymak kozmetiktir.** Ayrım, çıktının bir SAYI mı yoksa
bir TALİMAT mı olduğunda: `calvert` mg cinsinden doz basıyor, `tft` bir örüntü
adı.

### "PUANLA SAKLANAN SEÇİM" ÜÇÜNCÜ KEZ ÇIKTI — ve taramam onu ALAN ADI yüzünden kaçırmıştı

`apache2` · `gout-acr` · `pap-score` derken dördüncüsü: `nutrition-needs`.
Şablon düğmeleri `stressFactor === lvl.kcal` ile vurgulanıyordu, yani seçimin
kimliği KCAL DEĞERİYDİ. İki şablon aynı kcal'i taşıyor:

```
"Akut Hastalık / Post-Op"      30 kcal/kg · 1,2 g/kg
"Geriatrik / Malnütrisyonlu"   30 kcal/kg · 1,2 g/kg
```

Tarayıcıda ölçüldü — "Geriatrik"e tıklandığında **iki düğme birden**
`aria-pressed="true"` oluyordu. Hesap doğru (ikisi de aynı katsayı), ama
kullanıcı hangi şablonu seçtiğini göremiyor.

**ÖLÇÜTÜM NEDEN KAÇIRDI:** `pap-score` turunda yazdığım tarama
"puanla karşılaştırma" için `=== opt.pts|value|puan` biçimlerini arıyordu.
Burada alan adı **`kcal`**. Yani ölçüt kusurun ŞEKLİNİ değil, o şeklin bir
depodaki ADLANDIRMASINI arıyordu.

Aktarılabilir kural: **bir kalıbı ararken alan ADINA bağlanma — kalıbın kendisi
"bir dizi nesnenin sayısal alanıyla karşılaştırılan durum" biçimidir**, alan
`pts`, `value`, `kcal`, `pro` ya da başka bir şey olabilir. Daha genel ölçüt:
`durum === X.<herhangiSayısalAlan>` + aynı dizide o alanın tekrar eden değeri.

Çare `pap-score` ile aynı: seçim İNDEKSLE saklanıyor.

**KENDİ DÜZELTMEM İKİNCİ BİR AYRIŞMA AÇACAKTI — ölçümden önce kapatıldı.**
Araçta şablonların yanında iki manuel sürgü var (kcal/kg ve g/kg). Seçim
indekse taşınınca sürgüyle oynayan kullanıcıda şablon HÂLÂ seçili görünecekti,
oysa değerler artık o şablonun değerleri değil. Sürgüler artık seçimi
temizliyor (`setSecilenSablon(null)`).

**Doğrulama beş vaka, üçü negatif kontrol:**

| ölçüt | sonuç |
|---|---|
| açılış | tek şablon basılı ("Normal / Stabil") |
| "Geriatrik" tıklandı | **tek** düğme basılı (önce iki) |
| "Akut" tıklandı | **tek** düğme basılı — ikisi ayrışıyor |
| **negatif** — sürgü 28'e çekildi | **hiçbir şablon basılı değil** |
| **negatif** — 70 kg · Ağır Sepsis | **2450 kcal · 105,0 g** (70×35 · 70×1,5) |
| **negatif** — 70 kg · Obezite | **1400 kcal · 140,0 g** (70×20 · 70×2,0) |

ESPEN katsayıları da yayımlanmış hâliyle karşılaştırıldı ve doğru
(25/30/35/30/20 kcal/kg · 1,0/1,2/1,5/1,2/2,0 g/kg). Obezitede protein hedefi
ideal ağırlığa göre olmalı; araç bunu ZATEN söylüyor ("obez hastada 'ideal
ağırlık' baz alınmalıdır") — ölçüldü, eksik değil.

### Örnek değer ile aracın kendi sınırı — 37 alan ölçüldü, çelişki yok

Bu oturumda ~20 araca makullük sınırı kondu. Kendi işimi sınamanın doğrudan
yolu: **`placeholder="ör. N"` değeri, o alanın kapısından geçiyor mu?**
Geçmiyorsa araç kendi örneğini reddediyor demektir.

37 örnek değer ölçüldü, **0 çelişki**. Ölçüt kör değil: tohumlanmış bir
karşıt örnek (`ör. 50` + kapı `1–12`) yakalanıyor.

### Ekranda ilan edilen aralık ile kapı — tarandı, yeni kusur yok

`calvert` ("Tipik: 4–6") ve `basdai` ("0–10 NRS") turlarının genellemesi:
alan ipucunda aralık ilan eden metinleri bulup kapıyla karşılaştır. Yedi metin
çıktı ve üçü de gerçek bir ilan değil:

- `asdas` (0–10 NRS) — bu oturumda zaten 0–10'a bağlandı
- `ogtt` ("< 100 normal · 100–125 BAG · ≥ 126 DM") — YORUM eşikleri, girdi
  aralığı değil
- `pni` ("N: 3,5–5,0 g/dL") — albüminin NORMAL referansı; kapı 1–7 ve bu
  doğru, çünkü araç anormal değerleri kabul etmek ZORUNDA

Son satır ölçütün sınırını gösteriyor: **ekranda görünen her aralık bir GİRDİ
sınırı değildir.** Normal referans aralığı, yorum eşiği ve makullük sınırı üç
ayrı şey; ölçüt üçünü de aynı biçimde yakalıyor ve ayrımı insan yapıyor.

### KENDİ İŞİMİN TUTARLILIĞINI ÖLÇTÜM — sebep kartlarının çoğu DUYURULMUYORDU

Bu oturumda ~15 araca "sessiz boşluk yerine sebep" kartı eklendi. Hepsinin
aynı biçimde davrandığı VARSAYILMIŞTI; ölçüldü, davranmıyorlardı: kartların
yalnızca beşi `role="alert"` taşıyordu, sekizi taşımıyordu.

Bedeli dar ama gerçek: ekran okuyucuyla çalışan biri geçersiz bir değer
yazdığında kart ekranda beliriyor ama HİÇBİR ŞEY duyulmuyor — yani sebep
kartının varlık sebebi (kullanıcı neyin beklendiğini bilsin) o kullanıcı için
hiç işlemiyordu.

`role="alert"` bu kartlar için doğru seçim ve gerekçesi belgede zaten yazılı:
**`alert` sonradan DOM'a eklenince duyurulur, bu yüzden KOŞULLU basılabilir;
`status` böyle değil — bölge içerik değişmeden ÖNCE DOM'da bulunmalı.** Sebep
kartları `{sebepGoster && (…)}` ile koşullu render ediliyor, yani `status`
ilk mesajı kaçırırdı.

Sekiz araç hizalandı: `acth-stim` · `basdai` · `bmi` · `bmr` · `gh-test` ·
`gnri` · `pni` · `sodium`.

**ÖLÇÜT İKİ KEZ YANILTTI ve ikisi de belgede kayıtlı tuzaklar:**

- **Yorumlar sayıldı.** İlk tarama 24 "eksik" buldu; `abg`nin "Yorum
  yapılmadı" eşleşmesi bir JSDoc satırındaydı ve gerçek render ZATEN
  `role="alert"` taşıyordu. Bu depoda yorumlar kusurları alıntılıyor —
  kaynak tarayan her ölçüt yorumları elemek zorunda.
- **En yakın `<div>` doğru div değil.** Sebep metni iç bir `<p>`nin içinde;
  `role` sarmalayıcıda olabiliyor. Ölçüt bir üst düzeye de bakacak şekilde
  genişletildi. 24 → 8.

**Doğrulama, ikisi negatif kontrol:**

| ölçüt | sonuç |
|---|---|
| `bmi` boy 1700 | `role="alert"`: "Hesaplanamıyor · Şu alan makul bir değer bekliyor: boy (50–250 cm)" |
| `basdai` altı alan 100 | `role="alert"`: "Altı sorunun altısı da 0–10 arası bir sayı bekliyor" |
| **negatif** — bomboş form (ikisinde de) | `role="alert"` sayısı **0** — yersiz duyuru yok |
| `arayuz-denetim` | kusur yok |

Aktarılabilir kural: **bir kalıbı çok sayıda dosyaya yayarken, yaydığın şeyin
HER KOPYASINI aynı ölçütle say.** "Aynı şeyi yaptım" varsayımı bu oturumda
yanlış çıktı; sekiz kopya sessizce eksikti.

### "Seçim puanla saklanıyor" sınıfı AD-BAĞIMSIZ ölçütle kapandı

`nutrition-needs` turunda çıkan ders (ölçüt alan ADINA bağlanmamalı) ölçüte
uygulandı: `aria-pressed` / `checked` içinde `durum === <nesne>.<HERHANGİ
sayısal alan>` biçimi aranıyor, sonra o alanın aynı dizide TEKRAR eden değeri.

168 dosya tarandı. Tek aday `apache2` ve **kusur değil**: on bir grupta tekrar
eden `pts` var (fizyolojik merdivenler simetrik), ama karşılaştırma
`sel[param.id]?.label === opt.label` ile ETİKET üzerinden yapılıyor; `pts` ile
karşılaştıran tek grup olan yaş (0/2/3/5/6) benzersiz.

Ölçütün kör olmadığı tohumla kanıtlandı: alan adı `kcal` olan sentetik bir
kayıt yakalanıyor — yani `nutrition-needs`i kaçıran eski ölçütün körlüğü
kapandı.

### `apache2` mortalite merdiveni ve `ToolShare` iddiası — ikisi de doğrulandı

- **`apache2`**: `<=4 %4 · <=9 %8 · <=14 %15 · <=19 %25 · <=24 %40 ·
  <=29 %55 · <=34 %73 · >34 %85` — yayımlanmış Knaus tablosuyla birebir.
- **`ToolShare`**: belge *"bugün sorguyu siliyor (`url.search = ""`)"* diyor.
  Kaynakta doğrulandı, hâlâ öyle. `params` imzada bilerek duruyor (111 çağrı
  yeri) ve dosyanın kendi yorumu bunu açıklıyor.

### İLAN EDİLİP UYGULANMAYAN KURAL, İKİNCİ KEZ — `murray` kendi tarif ettiği hastayı skorlayamıyordu

`haq-di` ile aynı sınıf. Sayfanın altındaki not doğru ve yayımlanmış Murray'in
kuralını yazıyor:

> "Murray skoru = (Xray + PaO₂/FiO₂ + PEEP + Kompliyan) / **kullanılan
> parametre sayısı**. Ventilatöre bağlı olmayan hastalarda PEEP ve kompliyan
> hesaplanamaz."

Kod ise dördünü birden zorunlu tutuyor (`answered === PARAMS.length`) ve HEP
4'e bölüyordu. Tarayıcıda ölçüldü — iki parametre yanıtlandığında ekran
**"Tüm 4 parametreyi tamamlayın"** diyor. Yani aracın KENDİ notunun tarif
ettiği hasta (ventile olmayan) hiç skorlanamıyordu, ve iki cümle aynı ekranda
birbirini çürütüyordu.

Çare `haq-di` ile aynı: ilan edilen kural uygulanıyor — kaç parametre
yanıtlandıysa ona bölünüyor. **Alt sınır 2**, çünkü ortalama en az iki bileşen
ister ve akciğer grafisi ile PaO₂/FiO₂ her hastada elde edilebilir; tek
bileşenli bir "ortalama" yayımlanmış indeksin kastettiği şey değil.

**Doğrulama, payda değişiminin GERÇEKTEN olduğunu gösteren çift dahil:**

| seçim | skor | bant |
|---|---|---|
| iki parametre **[4, 0]** | **2,00** (4/2) | AĞIR |
| dört parametre **[4, 0, 0, 0]** | **1,00** (4/4) | HAFİF-ORTA |
| tek parametre | skor yok, istem metni | — |
| **negatif** — dört parametre hepsi 2 | **2,00** — düzeltme öncesiyle birebir | AĞIR |

İkinci satır belirleyici: aynı puan toplamı (4) iki farklı paydayla iki farklı
skor veriyor. "Sonuç aynı kaldı" tek başına kanıt olmazdı — bu turda ilk ölçüm
tam da öyle çıktı (iki ve dört parametre, hepsi "2" → ikisi de 2,00) ve payda
değişiminin gerçekten olup olmadığını göstermiyordu. **Bir bölme düzeltmesini
doğrularken, payın SABİT kalıp paydanın DEĞİŞTİĞİ bir vaka seç.**

Boş durum metni de düzeltildi: "Tüm 4 parametreyi tamamlayın" → "En az iki
parametre seçin — ventilatöre bağlı olmayan hastada PEEP ve kompliyan boş
bırakılır", yani ekran artık kendi notuyla aynı şeyi söylüyor.

Bant cetveli ayrıca yayımlanmış hâliyle karşılaştırıldı: 0 hasar yok ·
0,1–1 hafif-orta · 1,1–2,5 ağır · >2,5 çok ağır — Murray'in >2,5 = ağır ARDS
kesimiyle uyumlu, ortadaki ikiye bölme sunum tercihi.

### Kendi süpürmemin HER KOPYASI sayıldı — 17/17 tam

Geçen turda çıkan kural ("bir kalıbı çok dosyaya yayarken her kopyayı aynı
ölçütle say") kendi birim düzeltmeme uygulandı. 17 aracın tamamı tarayıcıda
tek tek gezildi:

**43 sayısal alan · 42'sinde birim açıklaması · "span var ama açıklama yok"
durumu SIFIR.** Tek açıklamasız alan `abg`nin pH'ı ve o doğru — pH birimsizdir.

Bu kez boşluk çıkmadı; ama önceki turda sekiz kopya sessizce eksikti, yani
ölçüm "her seferinde bir şey bulmak" için değil, **bulmadığını da kanıtlamak**
için yapılıyor.

### Araç kabuğu yeniden sayıldı — ve ölçütüm kör çıktı

Bu oturumda ~25 araca dokunuldu; kabuk tutarlılığı yeniden sayıldı:

| parça | sonuç |
|---|---|
| `ToolShare` | **130/130** |
| `☀️` glifinde `aria-hidden` | **130/130** |
| klinik uyarı | ölçüt KÖR ÇIKTI — aşağıda |

Uyarı ölçütü önce anahtar kelime aradı (46 sahte aday), sonra "⚠️ glifinden
sonra `>metin<`" aradı (18 sahte aday). İkisi de yanlış: bu depoda ⚠️ glifi
metnin İÇİNDE duruyor (`⚠️ Formül: Na - (Cl + HCO₃)…`), yani gliften sonra
ayrı bir metin düğümü yok. Elle bakılan üç araçta (`egfr` · `anion-gap` ·
`news2`) uyarı yerinde.

Kayda değer olan: **iki farklı kör ölçüt, iki farklı sahte liste üretti** ve
ikisi de "eksik" diyordu. Bir kabuk parçasının varlığını ararken glifin
metinden AYRI mı yoksa İÇİNDE mi olduğunu önce gör.

### "SEÇİM PUANLA SAKLANIYOR" BEŞİNCİ KEZ — ve ad-bağımsız ölçütüm de kaçırdı

`apache2` · `gout-acr` · `pap-score` · `nutrition-needs` derken beşincisi:
`tirads`. Kompozisyon kategorisinde iki şık aynı puanı taşıyor ve ikisi
klinik olarak AYRI şeyler:

```
"Kistik veya neredeyse tamamen kistik"  +0
"Süngerimsi (spongiform)"               +0
```

Tarayıcıda ölçüldü — "Süngerimsi"e tıklandığında **iki düğme birden**
`aria-pressed="true"`. Toplam puan doğru (ikisi de 0), ama kullanıcı hangi
kompozisyonu seçtiğini göremiyor. Aracın kendi notu da ikisini AYRI ele
alıyor: *"Spongiform nodüller ve tamamen kistik nodüller benign kabul
edilir."*

**ÖLÇÜT ÜÇÜNCÜ KEZ DARALTILDI — ve bu kez sebep DOLAYLILIK.** Geçen turda
ad bağımlılığı kaldırılmıştı (`pts` yerine herhangi bir sayısal alan). Ama
ölçüt hâlâ karşılaştırmayı `aria-pressed={…}` süslü parantezinin İÇİNDE
arıyordu. `tirads`te karşılaştırma bir satır yukarı taşınmış:

```tsx
const isSelected = isMulti(cat) ? …includes(opt.v) : answers[cat.id] === opt.v;
…
<button aria-pressed={isSelected} …>
```

Belgede aynı ders `kapi-kapsam-denetim` için zaten kayıtlı: *"kapı DOLAYLI
olabiliyor… kapıdaki her tanımlayıcının tanımı bir düzey açılınca 34 → 4
oldu."* Şimdi aynısı vurgulama tarafında yaşandı.

**Ölçütün üç kuşağı ve her birinin kaçırdığı:**

| kuşak | ölçüt | kaçırdığı |
|---|---|---|
| 1 | `=== opt.pts\|value\|puan` | `nutrition-needs` (alan adı `kcal`) |
| 2 | `=== X.<herhangi sayısal alan>`, `aria-pressed` içinde | `tirads` (karşılaştırma değişkene taşınmış) |
| 3 | + bir düzey dolaylılık | — |

Aktarılabilir kural: **bir kalıbı ararken hem ADI hem YERİ serbest bırak.**
Karşılaştırma bir değişkende, bir yardımcı fonksiyonda ya da bir `useMemo`
içinde olabilir; kalıbın kimliği "durum bir nesnenin sayısal alanıyla
karşılaştırılıyor" olmasıdır, nerede yazıldığı değil.

**Çoklu seçim kategorisi de aynı kusuru taşıyordu:** ekojen odaklar dizisi
PUANLARI tutuyordu, yani aynı puanlı iki odak birbirini silerdi. O da indekse
çevrildi.

**Doğrulama, ikisi negatif kontrol ve elle hesaplı:**

| seçim | sonuç |
|---|---|
| "Süngerimsi" | **tek** düğme basılı (önce iki) · TR1 |
| "Kistik" | **tek** düğme basılı · TR1 |
| **negatif** — Solid+Çok hipoekoik+Dikine+Lobüle+Punktat | **13 puan · TR5** (2+3+3+2+3) |
| **negatif** — Solid+Hipoekoik+Enine+Düzgün+[Makro **ve** Punktat] | **7 puan · TR5** (2+2+0+0+**max(1,3)**) |

Son satır belirleyici: çoklu seçimde İKİ odak birden basılı ve toplam yalnızca
**3** sayıyor — yani dizi artık indeks tutuyor ama "en yüksek puan alınır"
kuralı bozulmamış.

### Ekranda ilan edilen HESAP KURALI ile kod — sınıf tarandı

`haq-di` ve `murray` aynı sınıftan çıkınca ölçüt yazıldı: ekrana basılan
metinlerde hesap kuralı bildiren kalıplar (`en az N olarak değerlendirilir` ·
`bölünür` · `kullanılan parametre` · `hesaplanamaz` · `en yüksek … alınır` ·
`ile sınırlandırılır`). 12 metin çıktı ve elle karara bağlandı:

| araç | verdikt |
|---|---|
| `haq-di` · `murray` | bu oturumda düzeltildi |
| `abg` · `anc` · `calvert` | kural UYGULANIYOR (ölçüldü) |
| `psi-port` | **iki adımlı algoritma UYGULANIYOR** — Adım 1 kodda var, düşük riskli hasta puanlanmadan Sınıf I'e gidiyor |
| `tirads` | kural uygulanıyor (kompozisyon 0 → TR1), ama seçim kusuru YUKARIDA |
| `nutrition-needs` | *"obez hastada ideal ağırlık baz alınmalıdır"* — kullanıcıya TALİMAT; araç boy bilmediği için hesaplayamaz, doğru karar |
| `cat-copd` · `essdai` · `gcs` · `status-epileptikus` | yorum/klinik notu, hesap kuralı değil |

Ölçütün değeri: 12 metni okumak ucuz, ve sınıf iki kez gerçek kusur verdi.

### "SEÇİM PUANLA SAKLANIYOR" SINIFI KAPANDI — 591 dosya, ad ve yer serbest

Ölçütün üçüncü kuşağı (alan adı serbest + karşılaştırma bir düzey dolaylı
olabilir) bütün depoya sürüldü: **591 dosya, 9 aday, gerçek kusur YOK.**

| aday | verdikt |
|---|---|
| `apache2` (8 kez) | karşılaştırma `sel[param.id]?.label === opt.label` — ETİKETLE |
| `ciwa-ar` | tekrar GRUPLAR ARASINDA; her grup KENDİ İÇİNDE benzersiz (0/1/4/7 ve 0–7), karşılaştırma da grup başına |

`ciwa-ar` ayrıca sayıldı: 5 grup × 4 şık (0,1,4,7) + 4 grup × 8 şık (0–7) +
1 grup × 5 şık (0–4) → azami **5×7 + 4×7 + 4 = 67**, yayımlanmış CIWA-Ar
azamisiyle birebir.

### Çift React anahtarı — tarandı, kusur yok, ve ölçüt yine yanlış eşleştirdi

Kardeş sınıf: aynı puan `key` olarak da kullanılıyorsa React kardeşler
arasında çift anahtar görür (yanlış düğümün yeniden kullanılması, yanlış
düğmenin basılı görünmesi). Belgede risk kayıtlıydı.

Tarama 7 aday verdi, hepsi `apache2` ve **hepsi sahte**. Gerçek kullanım:

```
satır 213  key={`${opt.pts}-${opt.label}`}   ← çakışan grup, BİLEŞİK anahtar
satır 232  key={opt.pts}                     ← yaş grubu, değerler benzersiz
satır 249  key={opt.label}                   ← kronik
```

Ölçüt `key={x.pts}`i (232) tekrar eden fizyoloji dizileriyle (213'ün verisi)
eşleştirmişti — **diziler arası yanlış eşleştirme.** Tarayıcı konsolunda da
çift anahtar uyarısı yok (`next dev`, React uyarıları açık).

Aktarılabilir kural: bir `key` ifadesini bir diziyle eşleştirirken, o
anahtarın GERÇEKTEN o diziyi render eden döngüde olduğunu doğrula; aynı
dosyada birden çok dizi ve birden çok döngü olabilir.

### AÇIK BULGU — `essdai` kutanöz alanının 3. düzeyi yok (karar bekliyor)

Ağırlıklı skorlar yayımlanmış tanımla karşılaştırıldı. 12 alanın 12'sinde
`puan = ağırlık × düzey` birebir tutuyor, bantlar da doğru (<5 aktivite yok ·
5–13 düşük · 14–27 orta · ≥28 yüksek). Ama **ulaşılabilir tavan 120**, oysa
yayımlanmış ESSDAI azamisi **123**.

Fark tek bir yerden geliyor:

| alan | ağırlık | araçtaki en yüksek düzey | yayımlanmış |
|---|---|---|---|
| Kutanöz | 3 | **2** (6 puan) | **3** (9 puan) |

Yayımlanmış ESSDAI'de kutanöz alan üç aktivite düzeyi taşır (düşük: eritema
multiforme · orta: sınırlı kutanöz vaskülit / ayak-bilek sınırlı purpura ·
**yüksek: yaygın kutanöz vaskülit, yaygın purpura ya da vaskülite bağlı
ülser**). Araçta yüksek düzey yok; en ağır kutanöz tutulum "orta" olarak
puanlanıyor ve hasta **3 puan eksik** alıyor.

Bedeli bant sınırlarına yakın vakalarda görünür: 11–13 aralığındaki bir hasta
3 puanla ORTA banda (≥14) geçerdi.

**DEĞİŞTİRİLMEDİ ve sebebi kapsam:** eksik düzeyin VARLIĞI ve AĞIRLIĞI
mekanik olarak belli, ama Türkçe klinik tanımını yazmak içerik kararı —
üstelik araçtaki mevcut 1. ve 2. düzey etiketleri de yayımlanmış
tanımlayıcılardan sapıyor (BSA yüzdesiyle yazılmışlar), yani alan zaten
yeniden ifade edilmiş. `hscore`da eksik şıkkın adı tartışmasızdı
("3 seri (pansitopeni)"); burada değil.

Ekranda tavan ilanı YOK, yani `hscore`daki gibi bir ilan–gerçek çelişkisi de
yok. Ölçüm, kapsam ve gerekçe burada; klinik ifade kararı içerik sahibinin.

### ULAŞILABİLİR TAVANI HER SKOR ARACI İÇİN HESAPLA — `payda-denetim`in göremediği yer

Son turların dört bulgusu (`hscore` 327↔337 · `sledai2k` 61↔105 ·
`chads-vasc` 10↔9 · `essdai` 120↔123) aynı yöntemden çıktı: **şık
tablolarından ulaşılabilir tavanı hesapla, yayımlanmış azamiyle karşılaştır.**

`payda-denetim` bunu yalnızca tavanını EKRANDA ilan eden araçlar için yapıyor
(35 araç). İlan etmeyenler hiç karşılaştırılmamıştı — `essdai` ve `sledai2k`
tam o boşlukta duruyordu. Bu tur 31 skor aracının tavanı hesaplandı.

**Ölçüt dört sahte aday üretti ve dördü de öğretici:**

| araç | ölçütün dediği | gerçek |
|---|---|---|
| `chads-vasc` | 10 | 9 — bu oturumda konan DIŞLAMA kuralını ölçüt bilmiyor |
| `wells-pe` | 11 | 12,5 — tam sayı regex'i 1,5'leri 1'e yuvarlıyor |
| `mrss` · `rapid3` · `uas7` · `scorad` | 3 / 3 / 3 / 100 | tek şık dizisi N madde boyunca YENİDEN KULLANILIYOR; tavan dizide değil madde listesinde |
| `psi-port` | 285 | PSI'nin sabit tavanı yok (yaş doğrudan puan) |

Yani ölçüt aday üretir, kararı yayımlanmış tanımı okumak verir.

**İki gerçek sapma çıktı.**

#### `gout-acr` — yayımlanmış ölçütte İKİ görüntüleme alanı var, araç birini seçtiriyordu

ACR/EULAR 2015'te görüntüleme **iki bağımsız alandır** ve her biri 4 puan:
ürat birikimi kanıtı (USG çift kontur VEYA DECT) ve gut ile ilişkili eklem
hasarı (radyografide erozyon). İkisi aynı hastada birlikte bulunabilir ve
ölçüt onları ayrı puanlar.

Araçta ikisi TEK dışlayıcı grupta duruyordu (`single: true`), yani her ikisi
de olan hasta **8 yerine 4** alıyordu. Ölçeğin eşiği **≥ 8** olduğu için bu,
sınıflandırmayı doğrudan çeviriyor.

Ölçüldü (giriş ölçütü Evet · MSU yapılmadı · 1. MTP +2):

| görüntüleme | toplam | karar |
|---|---|---|
| USG **ve** X-Ray | **10 / ≥8** | **"GUT ARTRİT — Kriterleri Karşılıyor"** |
| **negatif** — yalnızca USG | **6 / ≥8** | "Kriter Karşılanmadı · 2 puan daha gerekiyor" |

İkinci satır belirleyici: ayırma skorları genel olarak şişirmiyor, yalnızca
İKİSİ birden olan hastanın ikisini de saymasına izin veriyor. Düzeltme
öncesi birinci satırdaki hasta da 6 alıyor ve gut sınıflandırması ALMIYORDU.

Ayırma YAPISAL: iki bulgunun etiketleri ve puanları zaten araçtaydı, yeni bir
klinik iddia yazılmadı.

**Kalan 1 puanlık fark BİLEREK bırakıldı ve açık bulgu:** düzeltmeden sonra
tavan 24, yayımlanmış azami 23. Fark `time_course` alanından geliyor —
araç "tipik atak özelliklerinden **1 / 2 / 3** tanesi" diye puanlıyor (1/2/3),
oysa yayımlanmış ölçütte eksen farklı: iki ya da daha fazla tipik özellik
taşımak bir atağı "tipik" YAPAR, puan ise **tek tipik atak = 1, tekrarlayan
tipik ataklar = 2**. Yani araç "özellik sayısını" puanlıyor, ölçüt "atak
sayısını". Düzeltmek etiketleri yeniden yazmayı gerektiriyor — içerik kararı.

#### `apache2` — kural ETİKETTE yazıyor ama uygulanamıyor (AÇIK BULGU)

Ulaşılabilir tavan **67**, yayımlanmış APACHE II azamisi **71**. Fark tek
yerden: kreatinin akut böbrek yetmezliğinde **iki katına çıkar** (0–8), araçta
0–4'te kalıyor.

Aracın kendi etiketi kuralı SÖYLÜYOR: *"Kreatinin (Akut böbrek yetmezliği
varsa ×2)"* — ama uygulayacak bir denetim yok; şıklar 0/2/3/4 ve 8'e çıkan
bir yol bulunmuyor. `haq-di` ve `murray` ile aynı sınıf, üçüncü kez:
**metin doğru, hesap eksik.**

APACHE II mortalite bantları beşer puan adımlıyor, yani 4 puan bir bant
kaydırabilir. Ölçüldü ve not edildi; düzeltme sonraki tura.

### İLAN EDİLİP UYGULANMAYAN KURAL, ÜÇÜNCÜ KEZ — `apache2` kreatinin ikiye katlaması

`haq-di` (yardımcı araç) ve `murray` (kullanılan parametre sayısı) derken
üçüncüsü. Aracın kreatinin satırının ETİKETİ kuralı zaten söylüyordu:

> "Kreatinin (**Akut böbrek yetmezliği varsa ×2**)"

Yayımlanmış APACHE II'de bu gerçek bir kuraldır. Ama araçta uygulayacak
hiçbir denetim yoktu: şıklar 0/2/3/4 ve 8'e çıkan bir yol bulunmuyordu.
Etiket kullanıcıya "×2" diyor, kullanıcı yapamıyor.

**Kusur TAVAN HESABIYLA bulundu** — geçen turun yöntemi:

```
11 fizyolojik değişken × 4  = 44
GKS                          = 12
yaş                          =  6
kronik sağlık                =  5
                        toplam 67        ← araçta ulaşılabilen
akut böbrek yetmezliğinde kreatinin ×2 → +4
                        toplam 71        ← yayımlanmış APACHE II azamisi
```

Eksik olan tam 4 puan ve tek kaynağı bu ikiye katlama.

Çare `haq-di`/`murray` ile aynı: kuralı uygulayacak girdi eklendi. **Yeni bir
klinik iddia yazılmadı** — etiketin zaten söylediği şey yapılabilir hâle
getirildi. Varsayım da görünür: kutu işaretlenince satırda **"(4 → 8)"**
beliriyor (`gnri`de konan "varsayımı görünür kıl" kuralı).

**Doğrulama, biri negatif kontrol:**

| durum | APACHE II | not |
|---|---|---|
| kreatinin 4 puan, ABY **yok** | **40** | — |
| kreatinin 4 puan, ABY **var** | **44** | fark tam **+4**, satırda "(4 → 8)" |
| **negatif** — kreatinin **0** puan, ABY var | **36** | ABY yokken de 36 — sıfırı ikiye katlamak sıfırdır |
| **negatif** — aynı, ABY yok | **36** | değişmedi |

Üçüncü satır belirleyici: kutu koşulsuz +4 eklemiyor, kreatinin puanını
ikiye katlıyor. Satır içi "(x → y)" ipucu da yalnızca puan sıfırdan büyükken
çıkıyor.

Mortalite bantları beşer puan adımladığı için (≤4 %4 · ≤9 %8 · ≤14 %15 …)
4 puan bir bant kaydırabilir.

**Ölçüm tuzağı — "her grupta ilk şıkkı tıkla" iki kez yanlış sonuç verdi.**
Sürücü önce her grubun ilk şıkkını seçip sonra kreatinini ayrıca ayarlıyordu;
kreatinin grubunun ilk şıkkı ZATEN hedef şıktı, yani ikinci tıklama onu
KAPATIYOR ve araç "13/14 parametre" diyordu. Sonuç paneli hiç çizilmiyordu ve
bir an düzeltme bozuk sanıldı.

İkinci tuzak aynı ailede: "en yüksek puanlı şıkkı seç" sürücüsü düğme
metninin başındaki sayıyı okuyor ve bazı gruplarda yanlış şıkkı seçiyordu
(tavan 54 çıktı, beklenen 67). **Tavan iddiası bu yüzden tarayıcıyla değil
KAYNAKTAN hesaplandı** ve raporda öyle yazıyor — sürücünün yanlış seçtiği bir
ölçümü "ölçüldü" diye sunmak, belgedeki "0 kusur ile 0 ölçüm aynı görünür"
kuralının bu turdaki hâli olurdu.

Ayırt edici ölçüm zaten tavan değil, **aynı hastada kutunun açılıp
kapanması** (40 ↔ 44): payda sabit, tek değişen kural.

### "İLAN EDİLİP UYGULANMAYAN KURAL" SINIFI KAPANDI — ölçüt etiketleri de kapsayınca

Sınıf bu oturumda üç kez iş çıkardı (`haq-di` · `murray` · `apache2`). İlk
tarama yalnızca 40+ karakterlik GÖVDE metinlerine bakıyordu; `apache2`nin
kuralı ise bir ALAN ETİKETİNDEYDİ (*"Kreatinin (Akut böbrek yetmezliği varsa
×2)"*) ve o taramada hiç görünmedi.

Ölçüt genişletildi: `label` · `detail` · `note` · `etiket` · `ipucu` · `sub` ·
`title` dizeleri ve JSX düz metni, uzunluk sınırı olmadan. Kural kalıpları da
genişletildi (`×2` · `iki kat` · `yarıya` · `bölünür` · `kullanılan …
sayısı` · `ile sınırlandırılır` · `çıkarılır` · `eklenir` …).

**12 ilan çıktı ve hepsi karara bağlandı — kapanmamış kural YOK:**

| araç | ilan | durum |
|---|---|---|
| `haq-di` · `murray` · `apache2` | yardımcı araç · kullanılan parametre · ABY ×2 | bu oturumda UYGULANDI |
| `anion-gap` | "+2,5 eklenir" | uygulanıyor (ölçüldü) |
| `calvert` | "125 mL/dak ile sınırlandırılır" | uygulanıyor (ölçüldü) |
| `osmolal-gap` | "etanol … eklenir" | uygulanıyor (ölçüldü) |
| `tirads` | "en yüksek puan alınır" | uygulanıyor (çoklu seçimde max) |
| **`magnezyum-infuzyon`** | "Dozu yarıya indirir" | **uygulanıyor — bu tur ölçüldü** |
| `lipid-emulsiyon` | "idame hızı iki katına çıkarılabilir" | klinik SEÇENEK, aracın yapması gereken bir hesap değil; araç kümülatif tavanı ve tavana kalan süreyi zaten veriyor |
| `digoksin-toksisitesi` | "hipokalemi beklenir" | **sahte** — "b**eklenir**" içinde "eklenir" |
| `rass` | "u**yarıya**" | **sahte** — "uyarıya" içinde "yarıya" |

Son iki satır belgede kayıtlı Türkçe alt dize tuzağının aynısı (`ağır` →
"AĞIRLIK", `orta` → "Orta Aktif"). **Kural kalıbı ararken kelime sınırını
elle kur; JS'in `\b`'si ASCII'ye göre çalışıyor ve Türkçe eklerde yanılıyor.**

**`magnezyum-infuzyon` böbrek yetmezliği düğmesi ilk kez sürüldü:**

| durum | Torsades acil dozu |
|---|---|
| böbrek normal | **2 g · 16,2 mEq · 8,1 mmol** |
| böbrek yetmezliği | **1 g · 8,1 mEq · 4,1 mmol** — tam yarısı |

Araç ayrıca "Dozlar yarıya indirildi" diyor ve nefroloji notunu açıyor, yani
kural hem uygulanıyor hem görünür kılınıyor.

### `mascc` uçtan uca doğrulandı — tavan, eşik ve DIŞLAYICI grup

Febril nötropenide ayaktan tedavi kararını süren skor; hiç sürülmemişti.

| girdi | ekranda |
|---|---|
| hepsi "Evet" + "Semptom yok" | **26 / 26 · Düşük risk** · "≥21 · ayaktan oral antibiyotik değerlendirilebilir" |
| hipotansiyon **Hayır** (−5) + KOAH **Hayır** (−4) | **17 / 26 · Yüksek risk** · "hastane yatışı ve IV antibiyotik" |

İkinci satır elle tutuyor (26 − 9 = 17) ve eşiğin iki yanını da gösteriyor.
Yayımlanmış MASCC azamisi 26, eşik ≥21 — ikisi de birebir.

**Hastalık yükü alanı özellikle kontrol edildi:** yayımlanmış MASCC'de bu alan
İKİ DIŞLAYICI düzey taşır (semptom yok/hafif = 5, orta = 3). `chads-vasc`ta
tam bu şekil kusur üretmişti (iki yaş bandı ayrı onay kutusuydu ve ikisi
birden işaretlenebiliyordu). `mascc`te alan tek bir dışlayıcı seçici (5/3/0),
yani sorun yok.

Ayrıca aracın başındaki yorum, geçmiş bir kusuru birebir kaydediyor: puanlama
bir dönem TERSTİ ("Hipotansiyon Yok" işaretlenince puan ekleneceğine
çıkarılıyordu) ve bütün olumlu özellikleri taşıyan hasta 12 alıp "YÜKSEK
RİSK" çıkıyordu. Bugün ölçüldü — kapanmış.

### ARAÇ DIŞI SÜSLEME GLİFLERİ SÜPÜRÜLDÜ — belgenin kendi iş listesindeki madde

Belge bu maddeyi açıkça bırakmıştı: *"Araç DIŞINDA 56 öge (28 dosya)
gizlenmemiş durumda ve SÜPÜRÜLMEDİ… Yapılacaksa ölçütü daralt: yanında ZATEN
metin olan glifler güvenli adaydır, tek başına duranlar insan kararı ister."*

**Sayım önce ULAŞILABİLİRLİKLE düzeltildi.** Ham tarama 104 glif buldu; alt
çizgili (rotaya alınmayan) klasörler ve içe aktaranı olmayan bileşenler
elenince **58**'e düştü:

| elenen | sebep |
|---|---|
| `_endokrinoloji` · `_gastroenteroloji` · `_hematoloji` · `_romatoloji` … | rotaya alınmıyor |
| `SimulatorEngine` · `PremiumVideoRecommendations` | yalnızca alt çizgili klasörlerden içe aktarılıyor |
| `PremiumDailyProgram` · `StrategyMap` | sıfır içe aktaran |

Belgedeki *"ölü koda düzeltme yaptım"* hatası bu turda tekrarlanmadı: içe
aktaranlar ölçüldü, `ReadingHint` ve `NotePanel` canlı çıktı (`AppShell` ve
`(ydus)/layout`), ötekiler ölü.

**43 glif gizlendi, 14'ü BİLEREK bırakıldı.** İki koruma birden uygulandı:

1. **Etkileşimli ögenin TEK içeriği mi?** Öyleyse gizlemek onu ADSIZ bırakır —
   atlanıyor (`VakaEngine` 🔍 böyle).
2. **Yanında görünür metin var mı?** Yoksa glif tek anlam taşıyıcı olabilir —
   atlanıyor.

**ÖLÇÜT İKİNCİ ŞEKLİ TANIMIYORDU — araç süpürmesindeki 98→131 dersinin
aynısı.** İlk sürüm `>glif<` arasını en çok 12 karakter kabul ediyordu; glif
KENDİ SATIRINDA yazılmışsa araya girinti ve satır sonu giriyor ve eşleşme
düşüyor:

```tsx
<span className="w-9 h-9 …">
  ✓
</span>
```

`/uyelik`teki iki bölüm rozeti (`✓` ücretsiz, `★` premium) tam bu yüzden
kaçmıştı — ikisi de hemen ardından gelen `<h2>`nin anlamını taşıdığı
tartışmasız süslemeler. Ölçüt boşluk-dolgulu içeriği de tanıyınca üçü birden
yakalandı.

**NEGATİF KONTROL ÜÇ AYAKLI (belgedeki kural) ve üç sayfada ölçüldü:**

| sayfa | ağaçta kalan glif | beklenen metin ağaçta | ekranda çizili gizli glif |
|---|---|---|---|
| 404 | **0** | ✓ | 3 |
| `/uyelik` | 1 | ✓ | 4 |
| `/` | 1 | ✓ | **21** |

Üçüncü sütun kritik: `aria-hidden` görünümü DEĞİŞTİRMEZ; yanlışlıkla `hidden`
yazılsaydı ikonlar kaybolurdu ve ilk iki ölçüm bunu göremezdi.

Kalan tek glif iki sayfada da aynı: `SiteHeader`daki `🧪` (yanında "KLİNİK
ARAÇLAR" yazıyor). Ölçütün "komşu metin" kontrolü orada fazla katı davranıyor
— güvenli aday ama otomatik süpürmeye girmedi. **14 atlananın listesi
denetlenebilir durumda; hiçbiri kusur değil, hepsi insan kararı bekleyen
kalıntı.**

`arayuz-denetim` temiz, dört kapı geçti.

### BİR DÜZELTMEYİ YAPTIĞIN YÜZEY, O İDDİANIN GEÇTİĞİ TEK YÜZEY OLMAYABİLİR

`sledai2k` bulgusu kazara çıkmıştı: hub `sle`yi "SLE **Kriterleri** — sınıflama
kriterleri" diye tanıtıyordu, sayfa ise bir **aktivite indeksiydi**. O tek
örnekten bir ölçüt yapıldı ve 130 araca sürüldü: **kayıt adı** (`tools.ts`) ·
**hub adı** (`ToolsIcerik.tsx`) · **sayfa `<h1>`** · **layout metadata
başlığı** karşılaştırıldı.

**40 araçta ad farkı çıktı ve 39'u kusur DEĞİL.** Fark ezici çoğunlukla
kısaltma: "CURB-65" ↔ "CURB-65 Skoru", "SOFA" ↔ "SOFA Skoru", "Wells (DVT)" ↔
"Wells Skoru (DVT)". Bir başlığın katalog kaydından kısa olması olağan.

Ayırt edici soru **KATEGORİ mi değişiyor**: `sledai2k`de "sınıflama kriteri"
ile "aktivite indeksi" farklı ŞEYLERDİ; ötekilerde aynı şeyin uzun ve kısa
yazımı.

#### Tek gerçek sapma KENDİ DÜZELTMEMDİ

Önceki turda `grace` sayfasının başlığından yanlış "**2.0**" iddiası
kaldırılmıştı (uygulanan sistem toplamsal GRACE **1.0**). Ama iddia dört
yüzeyde birden geçiyordu ve yalnızca biri düzeltilmişti:

| yüzey | önce | sonra |
|---|---|---|
| sayfa `<h1>` + alt başlık | önceki turda düzeltildi | "GRACE · Toplamsal Puan (1.0)" |
| **hub kaydı** | "GRACE **2.0** Skoru" | "GRACE Skoru" |
| **layout metadata / OpenGraph** | "GRACE **2.0** Skoru — …" | "GRACE Skoru — …" |
| **`SoftwareApplication` şeması + breadcrumb** | "GRACE **2.0** Skoru" | "GRACE Skoru" |
| **`arac-index.json`** | "GRACE **2.0** Skoru" | "GRACE Skoru" |

Son üçü elle düzeltilmedi: hub kaydı değişince `arac-metadata.cjs` hepsini
yeniden üretti. "Sayı yazma, saydır" mimarisinin ad tarafındaki karşılığı —
**tek kayıt düzeltmesi beş yüzeye birden yayıldı.**

Ölçüldü: `/tools` ve `/tools/grace` sayfalarında "GRACE 2.0" dizesi artık
**yok**; sekme başlığı "GRACE Skoru — AKS/NSTEMI hastane içi mortalite".

**Aktarılabilir kural: bir ADI ya da İDDİAYI düzeltirken, o dizeyi bütün
depoda ara.** Bu depoda bir araç adı en az beş yerde geçiyor ve dördü
üretilmiş dosya. Sayfayı düzeltip katalogu unutmak, kullanıcının aramada ve
paylaşım kartında hâlâ eski iddiayı görmesi demek.

### `behcet` doğrulandı — ICBD 2014 ile birebir

Hub "Behçet — ICBD 2014" diyor; iddia ölçüldü:

| madde | puan |
|---|---|
| oral ülser · genital ülser · göz tutulumu | 2 + 2 + 2 |
| deri · nörolojik · vasküler · paterji | 1 + 1 + 1 + 1 |
| **tavan** | **10** · eşik **≥ 4** |

Yayımlanmış ICBD 2014 ile birebir. (Sayfa `<h1>`i yalnızca "Behçet Hastalığı"
diyor ve ölçüt setinin adını taşımıyor — kusur değil, ama hub'daki kimlik
sayfada görünmüyor.)

### DOĞRULAMA TURU — bu oturumun kendi işi dört ölçütten geçirildi

Kod değişikliği yok. Bu oturumda ~35 dosyaya dokunuldu, bir araç kaldırıldı ve
iki yeni denetim eklendi; hepsi ölçüldü.

**1. Sayı mimarisi araç kaldırıldıktan sonra da tutuyor.** Araç sayısı bu
oturumda 131 → 130 oldu (`sledai2k` yönlendirildi). Üç yüzey karşılaştırıldı:

| yüzey | araç | branş | konu | başlık | kart |
|---|---|---|---|---|---|
| ana sayfa | **130** | 13 | 410 | — | — |
| `/tools` | **130** (133 bağlantı = 130 + 3 gezinme) | — | — | — | — |
| `/uyelik` | — | 13 | 410 | 41 | 1492 |

Elle güncellenen tek sayı yok; "sayı yazma, saydır" mimarisi araç silmeyi
sorunsuz taşıdı.

**2. Bu oturumda EKLENEN iki denetim klavye kalıbına uyuyor.** `apache2`nin
ABY kutusu ve `haq-di`nin yardımcı araç kutusu ölçüldü:

| ölçüt | apache2 | haq-di |
|---|---|---|
| gizleme biçimi | `sr-only` (`display:none` DEĞİL) | `sr-only` |
| odak sırasında | evet | evet |
| saran etikette `focus-within:ring` | var | var |
| tıklama durumu değiştiriyor | evet | evet |
| **erişilebilir ad** | "Akut böbrek yetmezliği var — kreatinin puanı ikiye katlanır" | "Bu etkinlik için yardımcı cihaz ya da başka bir kişinin yardımı kullanılıyor" |

Son satır ayrı ölçüldü: ham `textContent` başta "✓" gösteriyor (belgedeki
"`textContent` `aria-hidden`'ı dikkate almaz" tuzağı), ama `aria-hidden` alt
ağaçları çıkarılınca ad temiz kalıyor.

**3. Değişen beş sayfa 320px'te temiz — ve ölçüt kör değil.** `apache2` ·
`haq-di` · `gout-acr` · `tirads` · `nutrition-needs`: belge kayması **0**,
taşan öge **0**. Ölçüt üç süzgeci birden taşıyor (kırpan atası olanlar,
`position:fixed`, `sr-only`).

Pozitif kontrol aynı sayfada yapıldı: 900px'lik bir tohum eklenince taşan öge
0 → **1** ve belge **595px** kayıyor; tohum kalkınca yeniden 0. Yani "0 taşma"
sonucu ölçümün körlüğünden gelmiyor.

**4. Hub açıklaması ile sayfa alt başlığı — 4 aday, dördü de SAHTE.** Ölçüt
"ortak 4+ harfli kelime yok" idi; kısaltma ile açık yazım hiç kelime
paylaşmıyor:

| araç | hub | sayfa |
|---|---|---|
| `meld-na` | "**ESKH** mortalite tahmini" | "**Son Evre Karaciğer Hastalığı** Analizi" |
| `chads-vasc` | "**AF**'de inme riski" | "**Atriyal Fibrilasyon** İnme Risk Analizi" |
| `ipi` | "agresif **NHL / DLBCL**" | "**Non-Hodgkin Lenfoma**" |
| `ogtt` | "T2DM/prediyabet, **GDM**" | "Oral Glukoz Tolerans Testi" |

Kelime örtüşmesi, kısaltmaların bol olduğu bir alanda anlam örtüşmesinin
zayıf bir vekili. `sledai2k`teki gerçek sapma KATEGORİ farkıydı ("sınıflama
kriteri" ↔ "aktivite indeksi"), kelime farkı değil.

**5. İçerik denetimleri tabanında:** `soru-denetim` yapısal kusur yok (CI
kapısı temiz); `konu` 17 · `yetim` 17 · `asili` kayıtları içerik kararı ve
kullanıcının işi — sapma yok.

### ÖLÜ ALAN, SESSİZ BİR TUZAKTIR — `steroid-dose`'da yayımlanmış büyüklük hiç okunmuyordu

Steroid eşdeğerlik tablosu her ilaç için İKİ sayı taşıyordu:

```
gluco : hidrokortizona göre bağıl glukokortikoid gücü   (yayımlanmış büyüklük)
pred  : prednizon eşdeğeri                              (gluco / 4)
```

İkisi `pred = gluco / 4` ile bağlı ve **onunda da tutuyordu** — yani bugün bir
ayrışma YOKTU. Kusur bugünün değerinde değil.

**`gluco` HİÇBİR YERDE OKUNMUYORDU**: on ilaçta tanımlı, sıfır kullanan.
Hesabın tamamı `pred` üzerinden dönüyordu.

Tehlike yarınki düzeltmede: deksametazonun gücünü güncellemek isteyen biri
doğal olarak **adlandırılmış ve anlamlı** alanı (`gluco`) değiştirir — ve
ekranda hiçbir şey değişmez. Hesap sessizce eski `pred` değerini kullanmaya
devam eder. Belgedeki `arac-metadata` dersinin aynısı: **eski yolu okumaya
devam eden bir üreteç hata vermez, sessiz kalır.**

Çare `abg`nin `KOMPANZASYON_SABIT` turuyla aynı: kopyayı kaldır, tek kaynağa
bağla. `pred` veriden tamamen çıktı; bölmede 4'ler sadeleştiği için hesap da
kısaldı:

```
dose × (from.gluco/4) ÷ (target.gluco/4)  =  dose × from.gluco / target.gluco
```

**Davranışın değişmediği ölçüldü — ve KOPYANIN GERÇEKTEN kaybolduğu ayrıca
sayıldı** (belgedeki kural: "çıktının aynı kaldığını değil, kopyanın
kaybolduğunu ölç"):

| ölçüt | sonuç |
|---|---|
| veri satırında `pred:` | **0** (önce 10) |
| `gluco` okuyan satır | **4** (önce 0 — alan ölüydü) |

**Elle hesapla üç senaryo:**

| kaynak | prednizon | hidrokortizon | metilprednizolon | deksametazon |
|---|---|---|---|---|
| prednizon 20 mg | 20 | **80** (×4) | **16** (×4/5) | **3,2** (÷6,25) |
| deksametazon 4 mg | **25** (×6,25) | **100** (×25) | **20** (×25/5) | 4 |
| metilprednizolon 40 mg | **50** (×1,25) | **200** (×5) | 40 | **8** (×5/25) |

İlk satır düzeltme öncesiyle **birebir aynı** — yani tekleştirme davranışa
dokunmadı. Ekrandaki "prednizon eşdeğeri" satırı da artık türetilen değerden
besleniyor (deks 4 → 25, metilpred 40 → 50).

**Tablonun kendisi de yayımlanmış hâliyle karşılaştırıldı ve tutarlı:**
hidrokortizon 1 · kortizon 0,8 · prednizon/prednizolon 4 · metilprednizolon/
triamsinolon 5 · deksametazon/betametazon 25 · fludrokortizon 10. Bu sistemde
5 mg prednizon = 20 mg hidrokortizon = 4 mg metilprednizolon = 0,8 mg
deksametazon; yayımlanmış tablolarda deksametazon eşdeğeri 0,75–0,8 mg
aralığında verilir, yani araç o aralığın içinde ve KENDİ İÇİNDE tutarlı.

**Aktarılabilir kural: türetilebilir bir alanı ayrıca saklama.** Değerler
bugün uyuşuyor olabilir; asıl bedel, ileride hangi alanın okunduğunu bilmeyen
birinin yanlış alanı düzeltip hiçbir etki görmemesidir. Ölü alan yalnızca
gereksiz değil, **yanıltıcıdır**.

### CETVELDEKİ "BURADASIN" İŞARETİ ÜÇ ARAÇTA HİÇ YANMIYORDU

Bant cetveli (skorun hangi aralığa düştüğünü gösteren şerit) aktif bandı
vurgulamak için kuruluyor. Üç araçta o vurgu **hiçbir zaman tutmuyordu** ve
sebep deponun en çok tekrar eden sınıfıydı: cetvel, bant etiketlerinin
**ikinci bir kopyasıydı** ve iki kopya harf düzeninde ayrışmıştı.

```
cetvel : { l: "Normal", r: "0–4" }            Başlık düzeni
bant   : { label: "NORMAL", … }               BÜYÜK harf
eşleşme: b.l === band.label.split(" ")[0]     harfe DUYARLI  ->  hiç tutmuyor
```

**Gözle görünmemesinin sebebi CSS:** iki taraf da `uppercase` sınıfı taşıyor,
yani ekranda ikisi de "NORMAL" diye basılıyor. Ekrandaki metni karşılaştıran
biri hiçbir fark göremez; ayrışma yalnızca KAYNAK dizede.

**Ölçüldü — düzeltmeden önce, üç araçta da vurgulu hücre SIFIR:**

| araç | sürülen durum | bant kartı | vurgulu cetvel hücresi |
|---|---|---|---|
| `gds-15` | 15 sorunun hepsi yanıtlı | ORTA / HAFİF DEPRESYON | **0 / 4** |
| `frail` | 0/5 ve 5/5 | SAĞLIKLI · KIRILGAN | **0 / 3** |
| `morse-fall` | 0 ve 125 puan | DÜŞÜK · YÜKSEK RİSK | **0 / 3** |

Kullanıcı skorunu görüyor, bandını görüyor, ama cetvelde "buradasın" işareti
yok — cetvelin tek işlevi buydu.

**Çare harf düzenini eşitlemek DEĞİL** (o, iki kopyayı korur ve yarın yine
ayrışır). Deponun kendi doğru kalıbı zaten dört araçta duruyor (`flipi` ·
`barthel` · `cat-copd` · `ipss-r`): tek bir `BANDS` dizisi, hem bant bulma hem
cetvel oradan besleniyor ve karşılaştırma **aynı nesne** üzerinden yapılıyor:

```
const band = BANDS.find(b => total <= b.max)
{BANDS.map(b => … b === band ? vurgulu : sönük …)}
```

Etiket dizesi değil KİMLİK karşılaştırıldığı için ayrışma imkânı kalmıyor.
Cetvelde gösterilen kısa ad (`b.label.split(" ")[0]`) artık bir GÖSTERİM
dönüşümü — eşleşme anahtarı değil. `bmi`/`abg` turlarındaki
"tekleştir, çıktının aynı kaldığını değil KOPYANIN kaybolduğunu ölç" kuralı
burada da uygulandı:

| ölçüt | önce | sonra |
|---|---|---|
| elle yazılmış cetvel listesi | 3 | **0** |
| harfe duyarlı `=== band.label` eşleşmesi | 3 | **0** |
| kimlik karşılaştırması `b === band` | 0 | **3** |
| ölü `col` alanı (hiç okunmuyordu) | 10 | **0** |

**Doğrulama sınır değerlerinden yapıldı** — belgedeki "altı, tam kendisi,
üstü" kuralı; bir cetvel düzeltmesinde asıl risk bandın bir kayması:

| araç | skor | bant | vurgulanan hücre |
|---|---|---|---|
| `frail` | **1** | PRE-KIRILGAN | "PRE-KIRILGAN 1–2 pt" |
| `frail` | **2** | PRE-KIRILGAN | "PRE-KIRILGAN 1–2 pt" |
| `frail` | **3** | KIRILGAN | "KIRILGAN 3–5 pt" |
| `gds-15` | 5 → 10 | HAFİF → ORTA | "HAFİF 5–8" → "ORTA 9–11" |
| `morse-fall` | 0 · 25 · 125 | DÜŞÜK · ORTA · YÜKSEK | üçü de kendi hücresi |

Her ölçümde vurgulu hücre **tam bir tane** — ne sıfır ne fazlası.

**Ölçüm tarafında dört tuzağa düşüldü ve dördü de belgede zaten kayıtlıydı:**

- **Desen tahmin etmek.** `frail`in düğmeleri `^(Evet|Hayır)$` değil
  **"Evet (+1)" / "Hayır (0)"**; desen tutmadığı için hiçbir şey tıklanmadı,
  bant hiç oluşmadı, cetvel hiç çizilmedi ve ölçüm "0 hücre" dedi. **"0 kusur"
  ile "0 ölçüm" yine aynı göründü.**
- **Türkçe alt dize.** `/KIRILGAN/` deseni sayfa başlığındaki
  **"KIRILGANLIK"** içinde eşleşti; üstelik başlık kaynakta "Kırılganlık"
  yazıyor ve `innerText` `uppercase` uyguladığı için büyük harfe dönüşüyor.
  İki tuzak üst üste.
- **`textContent` JSON-LD taşıyor.** Bant adını gövde metninden okurken
  `<script type="application/ld+json">` içindeki açıklama metni de geliyor.
- **Ardışık ölçüm bayatlıyor.** Tek koşumda üç bandı sırayla sürmek
  çalışmadı: React yeniden çizince eski düğme referansları ölüyor, ve zaten
  seçili bir düğmeye ikinci kez basmak seçimi KALDIRIYOR. Her bant taze
  sayfayla yalıtıldı.

**Kendi ölçütüm de yorum körlüğüne düştü.** Düzeltmeden sonra "kopya kayboldu
mu" diye sayarken `grep` 3 eşleşme buldu — üçü de kusuru ANLATAN kendi yorum
bloklarımın içindeydi. Yorumlar boşlukla doldurulunca sayı 0'a indi. Bu depoda
yorumlar kusurları birebir alıntıladığı için **kaynak tarayan her ölçüt,
kendi belgesini yakalama riski taşıyor.**

**Aktarılabilir kural: bir GÖSTERGENİN çalıştığını, göstergeyi görmekle
değil DEĞİŞTİĞİNİ görerek ölç.** Cetvel üç araçta da ekranda duruyordu, doğru
etiketleri ve doğru aralıkları yazıyordu; eksik olan tek şey hangisinin aktif
olduğuydu ve o, ancak iki farklı bant sürülüp karşılaştırılınca görünüyor.
Bu, belgedeki "ölü denetim" sınıfının gösterge tarafındaki hâli — kontrolü
ekrana koymak onu bağladığın anlamına gelmiyor.

### AYNI SINIF DÖRDÜNCÜ ARAÇTA — ve orada İKİNCİ, klinik bir kusuru gizliyordu

Cetvel vurgusu sınıfı bir ölçüte çevrildi ve depo geneline sürüldü. Ölçüt iki
kuşakta yazıldı; **birincisi fazla genişti ve sonucu okunamazdı:**

- **1. kuşak — "aynı dosyada, Türkçe katlamayla eşit ama birebir farklı iki
  dize".** 496 dosya · 3818 dize · **40 aday**. Çoğu sahte: `unit-converter`
  gibi araçlarda `{ key: "glukoz", label: "Glukoz" }` aynı satırda duruyor ve
  hiç karşılaştırılmıyor; `mrss`/`scorad`/`tnss`'te Başlık düzenindekiler ŞIK
  etiketi, BÜYÜK olanlar BANT etiketi — farklı şeyler.
- **2. kuşak — "`className` üçlüsünde DİZE karşılaştıran vurgu koşulu".**
  423 tsx · 217 görsel üçlü · **48 dize karşılaştırması**. Bu ölçüt karar
  verilebilir bir liste üretti.

**Cetveli olan 29 aracın triyajı — dört kova ve çareleri farklı:**

| kova | adet | araçlar |
|---|---|---|
| **KUSURLU** — vurgu hiç yanmıyor | **4** | `gds-15` · `frail` · `morse-fall` · **`berlin-ards`** |
| yapısı gereği güvenli | 8 | `barthel` · `cat-copd` · `flipi` · `ipss-r` · `bode` (kimlik) · `act` · `isth-dic` · `uas7` (`active` skordan satır içi) |
| çalışıyor ama İKİNCİ KOPYA taşıyor | 3 | `hscore` · `heart` · `rapid3` |
| vurgu koşulu HİÇ YOK | 14 | cetvel bir efsane, "buradasın" göstergesi değil |

Son kova kusur değil: cetvel orada referans olarak duruyor. (`asdas` için
belgede zaten "eksik affordans, kusur değil" diye kayıtlı.)

**`rapid3` bu sınıfın kanıtı gibi:** koşulu
`band.label.includes(b.l.toUpperCase().split(" ")[0]) || (b.l === "Remisyon"
&& band.label === "REMİSYON")`. İkinci dal bir YAMA — çünkü JS'te
`"Remisyon".toUpperCase()` **"REMISYON"** veriyor (i → I), bant ise "REMİSYON"
(İ). Yani birileri tam bu Türkçe katlama kusuruna çarpmış ve tek vakayı elle
kapatmış. Ölçüldü, bugün çalışıyor (0/30 → "Remisyon ≤ 3", 30/30 → "Yüksek
> 12").

#### `berlin-ards` — ölü vurgu, ikinci bir kusuru GİZLİYORDU

Cetvel vurgusu ölçülürken (bant "HAFİF ARDS" ve "AĞIR ARDS", vurgulu hücre
**0**) aracın şıkları tek tek sürüldü. O sürüş sırasında çok daha ağır bir
şey çıktı.

Şiddet üçlü bir zincirle seçiliyordu ve zincir `pf === "no_ards"` dalını
TAŞIMIYORDU:

```
pf === "mild" ? HAFİF : pf === "mod" ? ORTA : AĞIR      // no_ards da AĞIR'a düşüyor
```

Ölçüldü — üç kriter de "evet", oksijenasyon şıkkı **"> 300 mmHg — ARDS
kriterini karşılamıyor"**:

| | ekranda (önce) |
|---|---|
| bant | **AĞIR ARDS** |
| mortalite | **Hastane Mortalitesi ≈ %45** |
| PEEP | PEEP ≥ 5 cmH₂O altında değerlendirildi |

**Ekran seçilen şıkkın kendi metniyle çelişiyordu**: şık "ARDS kriterini
karşılamıyor" diyor, hüküm en ağır ARDS kategorisini ve %45 mortaliteyi
basıyor. Berlin tanımında P/F ≤ 300 (PEEP ≥ 5 altında) ZORUNLU bir kriterdir;
üstündeki değer ARDS'i dışlar, öteki üç kriter karşılansa bile.

GKS'deki "297 / 15", MELD'deki eksi skor ve `hscore`'un "169 → %93" şeridiyle
aynı sınıf: **dış bir kaynağa hiç bakmadan, yalnızca ekranın kendi içindeki
çelişkiyle görülebilen kusur.**

**Çare iki kusuru birden kapatıyor**, çünkü kökleri aynı: iki gerçeklik.
Şiddet tablosu tek bir `SIDDET` dizisine alındı — bant kartı, cetvel VE
mortalite yüzdesi (o da iki yerde ayrı duruyordu) oradan besleniyor. Zincir
yerine tablo araması geldi ve `no_ards` açıkça dışlandı:

```
const severity = !allAnswered ? null
  : (!meetsCriteria || pf === "no_ards") ? ARDS_DEGIL
  : (SIDDET.find(x => x.pf === pf) ?? ARDS_DEGIL);
```

`?? ARDS_DEGIL` yedeği bilerek: tanınmayan bir `pf` değeri artık en ağır
banda DEĞİL, en dar hükme düşüyor.

**Doğrulama, dördü negatif kontrol:**

| girdi | bant | mortalite | vurgulu hücre |
|---|---|---|---|
| P/F 201–300 | HAFİF ARDS | %27 | "Hafif · 201–300" |
| P/F 101–200 | ORTA ARDS | %32 | "Orta · 101–200" |
| P/F ≤ 100 | AĞIR ARDS | %45 | "Ağır · ≤ 100" |
| **P/F > 300** | **ARDS DEĞİL** | **—** | **0** + "Tanı kriterlerini karşılamıyor" |
| **negatif** — başlangıç > 7 gün | ARDS DEĞİL | — | 0 |
| **negatif** — tek taraflı infiltrat | ARDS DEĞİL | — | 0 |
| **negatif** — kardiyojenik ödem | ARDS DEĞİL | — | 0 |

Son üç satır şart: yeni koşul (`|| pf === "no_ards"`) EKLEME, var olan üç
dışlama yolunun yerini almıyor. İlk üç satır da negatif kontrol — mortalite
yüzdeleri düzeltme öncesiyle birebir aynı.

**Dördüncü satırdaki `0` artık DOĞRU davranış.** Aynı sayı düzeltmeden önce
"cetvel bozuk" demekti, şimdi "hasta hiçbir ARDS bandında değil" demek.
Bir göstergenin sıfır olması tek başına bir şey söylemiyor; **sıfırın hangi
sebeple sıfır olduğunu ayırt etmek ölçümün kendisi.**

#### Çalışan ama ikinci kopya taşıyan üç araç — ölçüldü, DEĞİŞTİRİLMEDİ

`hscore` (`prob.pct === b.pct`, dört yüzde dizesi iki yerde), `heart`
(eşikler `total <= 3` / `4–6` / `>= 7` hem cetvelde hem bant merdiveninde) ve
`rapid3` (yukarıdaki yama). Üçü de bugün **uyuşuyor** ve ölçümle doğrulandı;
kusur bugünün değerinde değil, ileride birinin tek kopyayı düzeltip hiçbir
etki görmemesinde. `steroid-dose`'un `gluco` alanıyla aynı gizli tuzak.

Tekleştirilmediler çünkü çalışan üç aracı aynı turda değiştirmek, ölçülmüş
bir kusuru düzeltmek değil öngörülen bir riski kapatmak olurdu; kayda geçti.

### DÜŞEN DAL SINIFI TARANDI — `berlin-ards` tek örnekmiş

`berlin-ards` kusurunun şekli ölçüte çevrildi: **bir değişkenin alabileceği
değer kümesi, onu sınayan üçlü zincirde test edilenlerden FAZLA** — sınanmayan
değer sessizce son dala düşüyor.

Ölçüt kümeyi tahmin etmiyor, KAYNAKTAN çıkarıyor: aynı dosyadaki seçenek
dizilerinde tekrar eden anahtarların (`v` · `slug` · `key` · `id` · `pf` …)
dize değerleri toplanıyor, sonra `x === "literal" ?` biçimindeki zincirlerle
karşılaştırılıyor.

130 araç · 17 üçlü zincir · **4 aday** — ve üçü tasarım gereği DOĞRU:

| araç | sınanan | son dala düşen | verdikt |
|---|---|---|---|
| **`berlin-ards`** | mild · mod · severe | **no_ards** | **KUSURDU** — düzeltildi |
| `sga` | A · B | C | doğru — SGA tam üç derece, son dal C |
| `sodium` | tbw · hypo | hyper | doğru — üç kip, son dal `hiperHedefMakul` kullanıyor |
| `digoksin-toksisitesi` | duzey · miktar | ampirik | doğru — ampirik kip sayısal girdi istemiyor, `hazir = true` |

**Ayırt edici soru: son dala düşen değer, sınananlarla AYNI anlam kümesinden
mi?** `sga`'da C bir SGA derecesi, `sodium`'da hyper bir kip. `berlin-ards`'ta
ise `no_ards` bir ŞİDDET DEĞİL — "ARDS değil" demek, ve en ağır şiddete
düşmesi hükmü tersine çeviriyordu.

Düzeltme sonrası `berlin-ards`'ta kalan tek `pf` zinciri paylaşım parametresi
(`pf === "mild" ? 1 : … : 0`) ve üç değeri de AÇIKÇA sınayıp `no_ards` için
`0` veriyor — ölçüt onu haklı olarak işaretlemiyor.

**Ölçüm tuzağı — yorum maskelemesi satır numaralarını bozdu, İKİNCİ KEZ.**
Blok yorumları `" " * len(...)` ile doldurmak satır sonlarını da boşluğa
çeviriyor; rapor dört adayın dördünde de yanlış satır gösterdi ve bir an
"düzeltilmiş dosyada kusur duruyor" sanıldı. Maske satır sonlarını KORUMALI
(`re.sub(r'[^\n]', ' ', ...)`). Belgede aynı ders `eksik-alan-denetim` için
zaten kayıtlıydı.

### BU OTURUMUN DÜZELTMELERİ CANLIDA DOĞRULANDI — 25 Ağustos 2026

Çok sayıda klinik düzeltme gönderildi ve hiç sorulmamış soru yine aynıydı:
**kullanıcıya ulaştı mı?** Tarayıcıyla canlıda ölçüldü (curl değil).

| düzeltme | canlıda ölçülen | düzeltme öncesi |
|---|---|---|
| cetvel vurgusu (`gds-15`) | skor 10 → **"ORTA 9–11" vurgulu** | vurgulu hücre **0** |
| `berlin-ards` cetveli | AĞIR ARDS → **"Ağır ≤ 100" vurgulu** | **0** |
| `berlin-ards` P/F > 300 | **ARDS DEĞİL** · mortalite **—** · "Tanı kriterlerini karşılamıyor" | **AĞIR ARDS · %45** |
| `calvert` AUC kapısı | AUC 50 → **sebep kartı, doz YOK** | 6250 mg |
| `calvert` olağan vaka | AUC 5 · GFR 100 → **625 mg** | 625 mg (değişmedi) |
| `calvert` GFR kırpması | GFR 150 → **750 mg** + "sınırlandırıldı" | aynı — özellik korundu |
| `chads-vasc` dışlaması | ≥75 seçilince 65–74 **kapanıyor**, tavan **9** | tavan **10** (ölçek 0–9) |
| `sledai2k` birleştirmesi | `/tools/sledai2k` → **`/tools/sle`**, 24 tanımlayıcı, tavan **105** | ayrı araç, 16 tanımlayıcı, tavan 61 |
| `grace` "2.0" iddiası | hub metninde **YOK** | "GRACE 2.0 Skoru" |

**Sayı mimarisi araç silindikten sonra da tutuyor** (`sledai2k` yönlendirildi,
131 → 130): canlı `/tools` **"130 araç listeleniyor"**, 133 araç bağlantısı
(130 + 3 gezinme), `<h1>` 1, `<h2>` 18. Elle güncellenen tek sayı yok.

Dokuz ölçütün dokuzu da tuttu, yani bu oturumun dağıtım zinciri sağlam —
en yeni commit bile (berlin-ards) ölçüm anında canlıdaydı.

**Negatif kontroller canlı ölçümün İÇİNDE:** `calvert`in olağan vakası ve GFR
kırpması değişmemiş, `chads-vasc`ta 65–74 tek başına hâlâ 1 puan veriyor,
`berlin-ards`ın üç ARDS bandı düzeltme öncesiyle birebir aynı mortaliteyi
basıyor. Bir düzeltmenin canlıda "çalıştığını" göstermek, ESKİ davranışın
korunduğunu göstermeden yarım kalır.

### DENETİMSİZ `<select>` SINIFI SÜPÜRÜLDÜ — tek örneği `glim`di ve klinik bir TANI basıyordu

Belge bu tuzağı tek araçta (`nrs-2002`) kaydediyordu ama hiç depo geneline
sürülmemişti: **`<select>`te `value` yoksa "dokunulmadı" ile "ilk seçenek
seçildi" AYNI şeydir.**

Ölçüt `<select>` açılış etiketini **süslü parantez dengesiyle** kesiyor —
belgede kayıtlı `=>` tuzağı yüzünden düz regex `>` işaretinde erken kapanıyor
ve `onChange={(e)=>…}` taşıyan her seçici yarıda kesiliyordu.

423 tsx · **36 `<select>`** · `value`/`defaultValue` taşımayan **5** — beşi de
tek araçta: `glim` (GLIM malnütrisyon tanı ölçütü).

**Dokunulmamış form ÖLÇÜLDÜ:**

```
GLIM TANISAL SONUÇ
Tanı Kriterleri Karşılanmadı
```

Beş açılır liste "Yok / Anlamsız", "Normal", "Normal", "Yok", "Yok" gösteriyor
— hiçbiri kullanıcının seçimi değil. Bu bir İDDİA: *değerlendirdik ve
bulmadık*. `kdigo-aki`nin "AKI Kriteri Yok" ve `das28`in boş formda
"Remisyon" kusurlarıyla aynı sınıf ve **aynı tehlikeli yön — güven veren
cevap.** Malnütrisyon taramasında yanlış "tanı yok" cevabı, taramanın kendi
amacını boşa çıkarıyor.

**Çare üç katmanlı ve GLIM'in kendi kuralına uyuyor:**

1. Seçiciler denetimli (`value={… ?? ""}`), durum `null` başlıyor, her birinin
   başında boş bir `<option value="">Seçiniz…</option>`.
2. Hüküm üç durumlu: **kondu · karşılanmadı · değerlendirilemedi**.
3. Ayrım şu — "karşılanmadı" ancak BİLİNİYORSA söylenir:

```
kesinYok = (fenotipin ÜÇÜ de yanıtlı && hiçbiri pozitif değil)
        || (etiyolojinin İKİSİ de yanıtlı && hiçbiri pozitif değil)
```

**Tanı KONDU ise öteki alanlar boş olsa bile hüküm verilebilir** — GLIM
"en az 1 fenotipik + en az 1 etiyolojik" istiyor, hepsini değil. Bunu
"tüm alanlar dolsun" diye kapatmak, aracın kendi kuralını bozardı.

Başlık işaretleri de üç durumlu oldu (`✅` / `❌` / `—`); eskiden yanıtlanmamış
grup da `❌` yani "yok" görünüyordu.

**Doğrulama beş vaka, ikisi negatif kontrol:**

| girdi | hüküm | şiddet |
|---|---|---|
| dokunulmamış form | **Değerlendirilemedi** + eksik alan listesi | — |
| fenotipin ÜÇÜ de "0" | **Tanı Kriterleri Karşılanmadı** | — |
| kilo kaybı Evre 2 + inflamasyon Var, **üç alan BOŞ** | **Malnütrisyon Tanısı Kondu** | **EVRE 2 (ŞİDDETLİ)** |
| aynı, kilo kaybı Evre 1 | Kondu | **EVRE 1 (ORTA)** |
| **negatif** — etiyoloji geri alındı | **Değerlendirilemedi** | — |

Üçüncü satır belirleyici: üç seçicinin gerçekten boş olduğu ayrıca sayıldı
(`bosSecici: 3`), yani erken hüküm ölçüldü — varsayılmadı. Beşinci satır
tersini gösteriyor: etiyolojik kriter olmadan ne tanı konabilir ne dışlanabilir.

`ToolShare` parametreleri de yanıtlanmamış alanı artık GÖNDERMİYOR — boş bir
alanı `0` diye paylaşmak, düzeltilen iddianın adres tarafındaki hâli olurdu.

**Kalan 31 `<select>` `value` taşıyor**, yani sınıf tek örnekliymiş. Ama
ölçütün sınırı yazılı: denetimli olup da durumu GERÇEK bir cevapla başlayan
bir seçici aynı sorunu taşırdı — o eksen "sayısal varsayılan" taramasında
ayrıca kapatılmıştı (30 araç, tek kusur `pap-score`).

### "DOKUNULMAMIŞ FORMDAN SINIFLAMA" NE ZAMAN KUSUR? — 12 aday, yeni kusur YOK

`glim` turundan sonra sınıf genelleştirildi: **skoru toplayıp bant basan
araçlarda "tüm maddeler yanıtlandı mı" kapısı var mı?** Eksik form yapay
düşük skor verir, o da güven veren bant demektir.

**Ölçüt bir kez fazla dar çıktı ve sonuç güvenilmezdi.** İlk sürüm
`.reduce(`/`sum`/`toplam =` VE bant anahtar kelimesi istiyordu; yalnızca
**7 araç** eşleşti ve "2 aday" dedi. Depoda ~35 skor aracı var — yani rapor
"0 kusur ile 0 ölçüm" tuzağının içindeydi. Genişletilmiş ölçüt (puanlı şık
dizisi + sınıflama etiketi) **35 araç** ölçtü: 23'ünde kapı var, **12 aday**.

**On ikisinin on ikisi de tasarım gereği doğru, ama üç ayrı gerekçeyle:**

| kova | araçlar | gerekçe |
|---|---|---|
| saf onay kutusu | `has-bled` · `padua` · `wells-dvt` · `wells-pe` | işaretsiz = ölçüt YOK; belgede zaten doğrulanmış |
| `null` başlıyor | `ecog` · `karnofsky` · `must` | yanıt gelmeden hüküm basılmıyor |
| varsayılan GÖRÜNÜR | `child-pugh` · `gcs` · `psi-port` · `kdigo-aki` | ölçüldü — aşağıda |

> **DÜZELTME.** Bu tablonun ikinci satırında bir dönem `mna` da vardı ve
> **YANLIŞTI** — tek tek ölçülmeden gruba yazılmıştı. Araç sürülünce
> dokunulmamış formda "0 · Malnütrisyon (Kötü Beslenme)" bastığı görüldü.
> Ayrıntısı ve düzeltmesi belgenin sonundaki bölümde.

#### Ayırt edici soru: varsayım EKRANDA görünüyor mu, ve hüküm NEGATİF bir iddia mı?

İki ölçüt birlikte karar veriyor; tek başına hiçbiri yetmiyor.

**1) Varsayım görünür mü?** Ölçüldü, sayıldı:

| araç | dokunulmamış hâlde | basılı düğme / görünür değer |
|---|---|---|
| `child-pugh` | TOPLAM **5/15 · Class A · %100 sağkalım** | **5 grup, 5 düğme basılı** (`< 2`, `> 3.5`, `< 1.7`, `Yok`, `Yok`) |
| `gcs` | **GKS 15 · E4 + V5 + M6 / 15 · Hafif** | **3 grup, 3 düğme basılı** |
| `psi-port` | **Sınıf II · ~%0.6 · Ayaktan tedavi** | yaş kutusunda `65`, cinsiyet seçicide `Erkek`, 18 kutu görünür biçimde işaretsiz |

Üçünde de araç hangi varsayımla konuştuğunu ekranda söylüyor. `gcs` bunu en
açık yapıyor: sonuç satırı **bileşenleri yazıyor** ("E4 + V5 + M6 / 15"), yani
skorun nereden geldiği gizli değil.

Bu, `pap-score`/`ppi`/`rockall`/`findrisc` için verilmiş verdiktin aynısı ve
`news2`/`sofa`/`meld-na` da aynı kovada (belgede kayıtlı: varsayılan normal
vitallerden "Düşük" basmak doğru).

**2) Hüküm ne tür bir iddia?** Asıl ayrım burada ve `glim` bu yüzden kusurdu:

| hüküm türü | tamlık gerekir mi | örnek |
|---|---|---|
| **NEGATİF iddia** — "yok / karşılanmadı / kriter yok" | **EVET** | `glim` "Tanı Kriterleri Karşılanmadı" · `kdigo-aki` "AKI Kriteri Yok" |
| görünür değerlerden HESAPLANAN derece | hayır | `gcs` 15 · `child-pugh` Class A · `psi-port` Sınıf II |

Negatif bir iddia "değerlendirdik ve bulmadık" demektir; onu söylemek için
gerçekten değerlendirmiş olman gerekir. Derecelendirme ise ekrandaki
değerlerin aritmetiğidir ve o değerler görünüyorsa iddia dürüsttür.

`glim`de İKİ ölçüt de düşüyordu: `<select>` kapalıyken "seçildi" ile
"dokunulmadı" ayırt edilemiyordu VE hüküm negatif bir iddiaydı.

**TUZAK — bu sınıfı "düzeltmek" araçları BOZABİLİR.** `gcs`ye
"Seçiniz…" koymak yanlış olurdu: Glasgow her hastada üç bileşenin ÜÇÜ de
gözlenerek verilir, "yanıtlanmamış göz açma" diye bir klinik durum yok.
`child-pugh`ta da beş kategori zaten normal değerleriyle başlıyor ve hepsi
basılı görünüyor. Ölçüt aday üretir; kararı **hükmün türü** verir.

`psi-port` ayrıca kendi iki adımlı algoritmasını uyguluyor (Adım 1: 50 yaş
altı, komorbiditesiz, vitalleri normal hasta puanlanmadan Sınıf I) — sayfanın
alt notu da bunu yazıyor ve kod birebir uyguluyor.

### 130 ARAÇ SAYFASI SUNUCU HTML'İNDE TARANDI — h1 · main · canonical · site haritası

Belgede ölçüt yazılıydı (*"her sayfanın SUNUCU HTML'inde `<h1>` say; sıfır
çıkan sayfa ya başlıksız ya da sunucuda hiç üretilmiyor demektir"*) ama
araçlara hiç sürülmemişti — oysa site haritasındaki adreslerin çoğu onlar ve
açık taraf huninin ağzı.

**Üç ölçüt, 130 aracın 130'unda temiz:**

| ölçüt | sonuç |
|---|---|
| HTTP durumu | 130/130 **200** |
| sunucu HTML'inde `<h1>` | 130/130 **tam bir tane** |
| sunucu HTML'inde `<main>` | 130/130 **tam bir tane** (çift landmark yok) |
| canonical kendi slug'ını gösteriyor | **130/130** |
| `localhost` canonical | **0** |
| `noindex` taşıyan araç | **0** |

En küçük gövdeler bile dolu: `gout-acr` 5817 · `pni` 6017 · `hba1c-eag` 6237
bayt — yani araç sayfaları `"use client"` olmalarına rağmen sunucuda gerçekten
basılıyor, kabuk değil.

**Site haritası ↔ hub SENKRON ve bu bir tutarlılık kanıtı:** haritada
**130 araç adresi**, hub'da **130 araç** — birebir. `sledai2k` haritada YOK
(yönlendirildi, doğru). Toplam adres 558.

Bu sayı bir dönem ayrışıyordu (belgede "115 araç" kayıtlı, hub'da 114 vardı).
`sledai2k` birleştirmesinden sonra iki taraf da kendiliğinden hizalandı —
"sayı yazma, saydır" mimarisinin araç SİLİNDİKTEN sonra da tuttuğunun ikinci
kanıtı.

**Ölçüm notu — `fetch` ile yönlendirme ölçme.** `/tools/sledai2k` bu taramada
"Failed to fetch" verdi ve bir an kırık sanıldı. Değil: çapraz kaynaklı bir
`fetch` 308 yanıtını izlerken CORS başlığı bulamıyor. Aynı adres tarayıcıyla
GEZİLDİĞİNDE doğru çalışıyor (geçen tur ölçüldü: `/tools/sle`, h1 "SLEDAI-2K",
24 tanımlayıcı, tavan 105). **Yönlendirmeyi `fetch` ile değil gezinmeyle ölç.**

**Ölçüm tuzağı — blok başına 64 `fetch` zaman aşımına uğradı.** Belgede
kayıtlı iframe sınırının `fetch` tarafındaki hâli; 33'erlik bloklar sorunsuz
geçti. Bir taramayı bölmek zorunda kaldığında her bloğun **ölçtüğü sayıyı**
ayrıca raporla — yoksa düşen blok "temiz" sanılır.

### Formül–varyant ayrışması sınıfı tarandı — tek örnekmiş, o da düzeltilmiş

`gnri`nin kusuru (ekranda basılan formül koddaki cinsiyet dalını yansıtmıyordu)
ölçüte çevrildi: **dallanması OLAN ve ekranda formül BASAN araçlarda, formül
satırı dala göre değişiyor mu?**

Dallanması ve formül satırı olan **5 araç** çıktı ve yeni kusur yok:

| araç | durum |
|---|---|
| `gnri` | formül satırı DİNAMİK — varyantı adıyla yazıyor ("Lorentz, kadın: … /2,5"); önceki turda düzeltilmiş |
| `bmr` | cinsiyete göre dallanıyor (+5 / −161) ama ekranda KATSAYI hiç basmıyor, yalnızca yöntemi adlandırıyor ("Mifflin–St Jeor") — çelişki yok |
| `antikoagulan-geri-dondurme` · `digoksin-toksisitesi` | formül satırları zaten şablon dizesi, seçilen değerlerden türüyor |
| `sodium` | eşleşen satırlar formül değil, sıvı bölmesi açıklaması |

**Ayrım: `gnri` bir KATSAYI ilan edip yanlışını basıyordu; `bmr` hiç ilan
etmiyor.** İlan edilmeyen bir şey ayrışamaz — eksik şeffaflık kusur değil.

Ölçüt iki kez çöpe çıktı: `>…<` deseni JSX metni sanıp KAYNAK KODU yakaladı
(3 sahte aday), sonra deponun formül satırlarında kullandığı `×` işaretine
bağlanınca liste karar verilebilir hâle geldi. Belgede zaten kayıtlı: bu
depoda ekrana basılan formüller kaynak tarayan ölçütler için gürültü kaynağı.

### EKRANDAKİ SAYI KENDİ BANDININ DIŞINDAYDI — gösterim yuvarlaması sınırı geçiyordu

Belgedeki `yuvarlama-denetim` "yuvarlanmış değer İKİNCİ BİR HESABA giriyor mu"
diye bakıyor. Bu ayrı bir eksen: **ekranda basılan sayı, bandın kendi ilan
ettiği aralığın dışında kalabiliyor.**

Şekil şu — bant HAM değerden, ekran YUVARLANMIŞ değerden besleniyor:

```
ham  = 44.995        bant: 44.995 < 45  ->  "HAFIF RİSK · PNI 40–44.9"
ekran = toFixed(1)   ->  "45.0"
```

Kullanıcı **"45.0"** görüyor, hemen altında **"PNI 40–44.9"** yazıyor. Üstelik
aynı sayıyı gösteren iki hasta zıt hüküm alıyor ve ekranda onları ayırt edecek
hiçbir şey yok. GKS'deki "297 / 15", MELD'deki eksi skor ve `berlin-ards`ın
"> 300 mmHg → AĞIR ARDS"ı ile aynı sınıf: **dış bir kaynağa hiç bakmadan,
yalnızca ekranın kendi içindeki çelişkiyle görülebilir.**

**İki araçta ÖLÇÜLDÜ (düzeltmeden önce):**

| araç | girdi | ham | ekranda | bant | bandın ilanı |
|---|---|---|---|---|---|
| `pni` | albümin 3,89 · lenfosit **1219** | 44,995 | **45.0** | HAFIF RİSK | **"PNI 40–44.9"** |
| `pni` | albümin 3,89 · lenfosit **1220** | 45,000 | **45.0** | İYİ NÜTRİSYON | "PNI ≥ 45" |
| `gnri` | kadın · alb 3,566 · 55 kg · 165 cm | 91,97 | **92.0** | ORTA RİSK | **"GNRI 82–91"** |

**Ulaşılabilirlik uydurma değil:** lenfosit sayısı tam sayı olarak raporlanıyor
ve albümin 2 ondalıkla; `10×3,89 + 0,005×1219 = 44,995` gerçek bir laboratuvar
kombinasyonu. Pencere `pni`de 0,05 birim genişliğinde.

**Çare YÖNÜ kardeş araçlar belirledi — klinik bir yargı vermeye gerek kalmadı.**
Depo kalıbı zaten üç araçta duruyor:

| araç | kalıp |
|---|---|
| `meld-na` | `const score = clamp(round(meldNa, 0), 6, 40)` |
| `rapid3` | `const total = parseFloat((fn + pain + global).toFixed(1))` |
| `scorad` | `Math.round(…)` |

Üçü de **BİR KEZ yuvarlayıp** hem basıyor hem bantlıyor. `pni` ile `gnri`
istisnaydı; onlar da aynı kalıba çekildi. Bu, `gnri`nin cinsiyet turunda
kaydedilen kuralın tekrarı: **komşuda çözüm varsa, komşuda OLUP burada olmayan
şey bir kusur adayıdır.**

**Ödünleşme açıkça yazılmalı:** "bir kez yuvarla" sınırdaki hastayı bir üst
banda taşıyor (44,995 → 45,0 → İYİ). Kayma 0,05 PNI birimi, yani albümindeki
0,0034 g/dL'ye karşılık geliyor — girdilerin ölçüm hassasiyetinin çok altında.
Alternatif (daha çok basamak basmak) çelişkiyi bir basamak derine iter, çözmez.

**Doğrulama — negatif kontroller belgede KAYITLI değerlerle:**

| ölçüt | sonuç |
|---|---|
| `pni` sınır (1219) | **"45.0" · İYİ NÜTRİSYON · "PNI ≥ 45"** — tutarlı |
| `pni` 1200 | "44.9" · HAFIF RİSK · "40–44.9" — tutarlı, değişmedi |
| `pni` belgedeki vaka (alb 3,0 · lenfosit 1200) | **36,0** — birebir |
| `gnri` sınır | **"92.0" · DÜŞÜK RİSK · "GNRI 92–98"** — tutarlı |
| `gnri` belgedeki kadın vakası (165/55/3,6) | **92,5 · DÜŞÜK RİSK** — birebir |
| `gnri` belgedeki erkek vakası | **91,0 · ORTA RİSK** — birebir |

**KAPSAM İDDİASI ÜRETİLMEDİ ve sebebi ölçütün sınırı.** Kaynak taraması
"ekranda basılan değer" ile "bantlanan değer"i güvenilir eşleştiremiyor: çok
satırlı `const` tanımlarını kaçırıyor (`gnri` ve `rapid3` kendi taramamda
yanlış kovaya düştü) ve ikincil gösterimleri (ara değerler) skor sanıyor.

Sonraki tur için ölçüt yazılı: **gösterim basamağı, bant eşiğinin
basamağından KABA ya da eşitse ve skor sürekli girdiden geliyorsa aday.**
2 ondalık basıp 1 ondalık eşik kullanan araçlar (`asdas` 1,3/2,1/3,5 ·
`haq-di` 0,5/1,5/2,5 · `murray` 2,5 · `ktv` 1,0/1,2) aynı şekli taşıyor ama
pencereleri on kat dar (0,005) ve **ÖLÇÜLMEDİLER — "temiz" DENMİYOR.**

### SINIF KAPANDI — açık bırakılan dört aracın ikisi kusurluydu, ikisi YAPISAL OLARAK güvenli

Geçen tur dört araç "aynı şekli taşıyor ama ÖLÇÜLMEDİ, temiz DENMİYOR" diye
bırakılmıştı. Kapatıldı — ve ayrım ölçütü **girdi kümesinin sürekli mi kesikli
mi** olduğu çıktı.

**Kesikli olan ikisi çelişki ÜRETEMEZ — akıl yürütmeyle değil SAYARAK
kanıtlandı:**

| araç | değer kümesi | ulaşılabilir değer | çelişki |
|---|---|---|---|
| `haq-di` | `toplam/8`, toplam tam sayı 0–24 | 25 | **YOK** |
| `murray` | `toplam/n`, n ∈ {2,3,4} | 25 | **YOK** |

Kümeler tek tek üretilip her değerin `toFixed(2)` gösterimi eşiklerle
karşılaştırıldı. Aynı betiğe kıyas olarak `pni`nin gerçek vakası (44,995 →
"45.0", eşik 45) verildi ve **yakalandı** — yani "çelişki YOK" sonucu kör bir
ölçütten gelmiyor.

**Sürekli olan ikisi KUSURLUYDU ve sınır girdileri hesapla bulundu:**

| araç | girdi | ham | ekranda | hüküm |
|---|---|---|---|---|
| `asdas` | dört NRS de 0 · **CRP 8,40** | 1,29737 | **"1.30"** | **İNAKTİF HASTALIK** (cetvel: "İnaktif < 1.3") |
| `ktv` | pre 50 · post 17 · 180 dk · UF 1,1 L · 70 kg | 1,19617 | **"1.20"** | **YETERSİZ DİYALİZ** (eşik ≥ 1.2) |

`ktv` bu serinin en pahalısı: ekran yeterlilik eşiğine **eşit** bir sayı
gösterirken "PROTOKOL GÖZDEN GEÇİRİLMELİ" diyordu.

#### `ktv`de iki kural ÇARPIŞIYOR ve ikisi de korunmalı

`pni`/`gnri`de çare tekti: bir kez yuvarla. `ktv`de öyle değil — `eKtV`
`spKtV`den TÜRÜYOR, yani `spKtV`yi yuvarlayıp `eKtV`ye vermek belgedeki
**"GÖSTERİM yuvarlanır, HESAP yuvarlanmaz"** kuralını çiğnerdi (`sedasyon-
infuzyon` turunda ölçülmüş, %25 hata).

Çözüm ikisini birden sağlıyor: ham değerler zincirde korunuyor, ekrana basılan
VE eşikle karşılaştırılan değerler ayrıca bir kez yuvarlanıyor
(`spGos` · `eGos` · `urrGos`). Yani:

```
eKtV  <- HAM spKtV        (hesap zinciri, yuvarlanmaz)
ekran <- spGos            (gosterim)
esik  <- spGos            (bant)      -> ekran ile esik ayrisamaz
```

**Aktarılabilir kural: "tek sayı" ile "hesap yuvarlanmaz" çelişmez — ayrım
değerin NEREYE gittiğidir.** Bir sonraki hesaba giden değer ham kalır;
kullanıcıya GÖSTERİLEN ve EŞİKLE karşılaştırılan değer aynı yuvarlanmış sayı
olmalıdır.

**Doğrulama — negatif kontroller belgede KAYITLI değerlerle:**

| ölçüt | sonuç |
|---|---|
| `ktv` sınır | spKt/V "1.20" · eKt/V "0.99" · URR 66% — hüküm hâlâ YETERSİZ ama **gerekçe artık eKt/V**; "spKt/V 1.20 < 1.2" satırı **kayboldu** |
| `ktv` belgedeki vaka 60/20/240/2/70 | **1.28 · 1.12 · 67% · SAĞLANDI** — birebir |
| `ktv` belgedeki vaka 85/22/240/2.5/70 | **1.59 · 74%** — birebir |
| `asdas` sınır | **"1.30" · ORTA AKTİVİTE** — cetvelin "Orta 1.3–2.1" satırıyla tutarlı |
| `asdas` 5/5/5/3 · CRP 5 | **2.70** — elle hesapla birebir (0,121×5 + 0,058×5 + 0,110×5 + 0,073×3 + 0,579×ln6 = 2,7014) |

`asdas`ın ESR varyantı sıfır girdide hâlâ **−0,21** basıyor — belgede kayıtlı,
kullanıcı kararı bekleyen `− 0.211` sabiti. **Dokunulmadı.**

**Böylece sınıfın dört aracı da karara bağlandı:** `pni` · `gnri` (önceki tur)
ve `asdas` · `ktv` (bu tur) düzeltildi; `haq-di` · `murray` yapısal olarak
güvenli. Sınıf KAPALI.

### DOĞRULAMA ÇABASININ KENDİ KAPSAMI ÖLÇÜLDÜ — 6 araç belgede hiç geçmiyordu

Yeni bir ölçüt üretmek yerine, yapılan işin kapsamı sayıldı: **130 aracın
kaç tanesi bu belgede adı geçiyor?**

```
toplam 130 · belgede GEÇEN 124 · HİÇ GEÇMEYEN 6
```

Altısı: `anaphylaxis` · `cam-icu` · `canadian-ct` · `endocarditis` · `mmrc` ·
`pps` — yani turlarca süren doğrulama hiç onlara uğramamış. Kapsamı ölçmek,
yeni bir ölçüt yazmaktan ucuz ve bu turda **iki gerçek kusur** çıkardı.

### HÜKÜM, YANITLANMAMIŞ GİRDİ ONU DEĞİŞTİREMEZ HALE GELDİĞİ AN VERİLİR

`glim` turunda konan "erken hüküm" kuralının genel biçimi bu. İki araç kuralı
çiğniyordu ve **ikisi de kendi ekranında yazan kuralı uygulamıyordu.**

**`anaphylaxis`** — NIAID/FAAN (Sampson 2006, aracın kendi kaynağı) anafilaksiyi
"üç kriterden HERHANGİ BİRİ" ile tanımlar. Kod ise `allAnswered` istiyordu.

| ölçüldü (önce) | ekranda |
|---|---|
| 1. kriter "Kriter Karşılandı" | **"Tüm 3 kriteri değerlendirin"** — tanı YOK, epinefrin talimatı YOK |
| üçü de yanıtlı | "ANAFİLAKSİ TANILANDIRILDI" + epinefrin |

Bedeli sayfanın kendi uyarısında yazılı: *"Epinefrin geciktirilmesi en önemli
ölüm nedenidir."*

**`canadian-ct`** — bölüm başlığı "Yüksek Risk Kriterleri (**herhangi** biri…)"
diyor, kod `totalAnswered === total` istiyordu.

| ölçüldü (önce) | ekranda |
|---|---|
| bir yüksek riskli ölçüt "Evet" (1/7) | **hiçbir hüküm YOK** |

Bu, `haq-di` · `murray` · `apache2` ile aynı sınıf: **ilan edilip
uygulanmayan kural** — üçüncü ve dördüncü örnek.

#### Kuralın kesin ifadesi

"Pozitif erken verilir, negatif tamlık ister" YETERSİZ bir ifade. `cam-icu`
gibi bir KONJONKSİYONDA negatif de erken belirlenir (F1 "hayır" ise deliryum
yok, F2/F3/F4 bakılmadan). Doğru ölçüt:

> **Kalan yanıtların hiçbiri sonucu değiştiremiyorsa hüküm o an verilir.**

Uygulaması araç başına farklı:

| araç | erken verilebilen | tamlık isteyen |
|---|---|---|
| `anaphylaxis` | herhangi bir kriter true → TANI | dışlama (üçü de false) |
| `canadian-ct` | herhangi bir yüksek risk true → **HIGH** · yüksekler bitti + orta true → **MEDIUM** | NONE (yedisi de false) |
| `glim` | ≥1 fenotipik ve ≥1 etiyolojik → TANI | "karşılanmadı" |

**Doğrulama — `canadian-ct`, dördü de ölçüldü:**

| girdi | sonuç |
|---|---|
| 1 yüksek risk "Evet" (1/7) | **BT GEREKLİ (Yüksek Risk)** — anında |
| 3 yüksek risk "Hayır" (3/7) | bekliyor · "Hüküm için **4 kriter daha**" |
| 5 yüksek risk "Hayır" (5/7) | **hâlâ bekliyor** — doğru, orta riskli bir bulgu hükmü değiştirebilir |
| +1 orta risk "Evet" (6/7) | **BT GEREKLİ (Orta Risk)** — 7.'yi beklemeden |
| **negatif** — yedisi de "Hayır" | **BT GEREKMİYOR** — dışlama korunmuş |

Üçüncü satır ayırt edici: erken hüküm kuralı "elindekiyle karar ver" DEĞİL;
yalnızca kalan yanıtlar sonucu değiştiremiyorsa geçerli.

**Doğrulama — `anaphylaxis`:**

| girdi | sonuç |
|---|---|
| yalnızca 1. kriter "Karşılandı" | **ANAFİLAKSİ TANILANDIRILDI** + epinefrin — anında |
| dokunulmamış | "Anafilaksi dışlanamadı · Yanıtlanmayan: Kriter 1 · 2 · 3" (`role="alert"`) |
| 1 ve 2 "Karşılanmadı" | eksik liste "Kriter 3"e iniyor |
| **negatif** — üçü de "Karşılanmadı" | "Mevcut bulgular anafilaksi tanı kriterlerini karşılamıyor" |

**Kalan dört araç:** `mmrc` ve `pps` `null` başlıyor, hüküm kapısı doğru.
`cam-icu` (F1 ∧ F2 ∧ (F3 ∨ F4)) ve `endocarditis` (Duke, onay kutusu) aynı
şekli KAYNAKTA taşıyor ama **tarayıcıda ölçülmediler — "temiz" DENMİYOR.**

### Erken hüküm sınıfı kapandı — `cam-icu` düzeltildi, `endocarditis` ölçüldü ve DEĞİŞTİRİLMEDİ

Geçen tur "kaynakta şekli taşıyor ama ÖLÇÜLMEDİ" diye bırakılan iki araç
tarayıcıda sürüldü.

**`cam-icu` KUSURLUYDU — ve bu, kuralın "negatif" tarafındaki örneği.**
CAM-ICU bir KONJONKSİYON: Deliryum = F1 ∧ F2 ∧ (F3 ∨ F4). Yani Özellik 1
yoksa sonuç kesindir ve enstrümanın kendi algoritması **orada durur**.

| ölçüldü (önce) | ekranda |
|---|---|
| F1 "Yok" (1/4) | **hiçbir hüküm YOK** |
| dördü de yanıtlı | "DELİRYUM NEGATİF" |

Yani araç, cevabı zaten belli olan hastada üç soru daha soruyordu.

**Bu örnek kuralın ifadesini kesinleştiriyor.** `anaphylaxis` ve
`canadian-ct`te erken verilen POZİTİF hükümdü; burada NEGATİF. Ölçüt
"pozitif erken, negatif geç" DEĞİL:

> Kalan yanıtların hiçbiri sonucu değiştiremiyorsa hüküm o an verilir.

**Doğrulama — dört yol, ikisi negatif kontrol:**

| girdi | hüküm |
|---|---|
| F1 "Yok" (1/4) | **DELİRYUM NEGATİF** — anında |
| F1 "Mevcut" (1/4) | hüküm YOK · "Özellik 2 · 3 · 4" |
| F1+F2 "Mevcut" (2/4) | hüküm YOK · "Özellik 3 · 4" |
| +F3 "Mevcut" (3/4) | **DELİRYUM POZİTİF** — F4 beklenmeden |
| **negatif** — F3 ve F4 "Yok" (4/4) | **DELİRYUM NEGATİF** — dışlama iki özelliği de istiyor |

İkinci ve üçüncü satır ayırt edici: erken hüküm "elindekiyle karar ver"
demek değil.

#### `endocarditis` — ölçüldü, kusur SAYILMADI, gerekçesi yazılı

Dokunulmamış form şunu basıyor:

```
ZAYIF BULGULAR (Rejected/Unlikely)     MAJÖR 0     MİNÖR 0
```

Şekil `glim`e benziyor (negatif iddia, dokunulmamış form) ama **girdi deyimi
farklı ve bu belirleyici:** Duke ölçütleri ONAY KUTUSU ve onay kutusu
deyiminde "yanıtlanmadı" diye bir durum YOKTUR — işaretlenmemiş kutu gerçek
bir cevaptır. Deponun kendi verdikti bu yönde: `has-bled` · `wells-dvt` ·
`wells-pe` · `padua` · `chads-vasc` hep "işaretsiz = ölçüt yok" sayılıyor.

Ayrıca ekran girdileri GÖSTERİYOR (MAJÖR 0 · MİNÖR 0), yani `child-pugh` /
`gcs` / `psi-port` kovasındaki gibi beyan edilmiş bir varsayım.

`glim`de düzeltme mümkündü çünkü `<select>`e boş bir seçenek EKLENEBİLİYORDU;
burada aynı şeyi yapmak, gerçekten sıfır ölçütü olan hastanın "Rejected"
kaydını almasını imkânsız kılardı. **Ölçüldü, not edildi, DEĞİŞTİRİLMEDİ.**

Aracın kendi uyarısı da kapsamı doğru çiziyor: *"Bu araç Duke Kriterleri baz
alınarak hazırlanmış bir eğitim şablonudur."*

**Böylece belgede hiç geçmeyen altı aracın altısı da karara bağlandı:**
`anaphylaxis` · `canadian-ct` · `cam-icu` düzeltildi; `mmrc` · `pps` `null`
başlıyor (kapı doğru); `endocarditis` ölçüldü ve gerekçeyle bırakıldı.

### Kapsam boşluğunun ARİTMETİK tarafı — dört araç yayımlanmış tanımıyla karşılaştırıldı

Geçen tur belgede hiç geçmeyen altı aracın **kapıları** ölçülmüştü; aritmetiği
hiç sürülmemişti. Bu tur o eksik kapatıldı.

**`endocarditis` (modifiye Duke) — altı sınır vakası, altısı da birebir:**

| girdi | ekranda | yayımlanmış |
|---|---|---|
| 2 majör | KESİN | Definite (2 majör) ✓ |
| 1 majör + 3 minör | KESİN | Definite ✓ |
| 5 minör | KESİN | Definite ✓ |
| 1 majör + 2 minör | OLASI | Possible (1 majör + 1 minör) ✓ |
| 3 minör | OLASI | Possible ✓ |
| 2 minör | ZAYIF (Rejected) | Rejected ✓ |

Ölçüt sayıları da doğru: **2 majör · 5 minör.**

**`mmrc`** — beş derece (0–4) ve açıklamaları yayımlanmış mMRC ile birebir
(0: yalnızca ağır egzersiz · 1: hızlı yürüme/hafif yokuş · 2: yaşıtlarından
yavaş, düz zeminde ~15 dk · 3: ~100 m sonra durma · 4: evden çıkamama).

**`pps`** — 11 seviye (100 → 0, %10 adımlarla) ve beş standart boyut
(mobilizasyon · aktivite · öz bakım · alım · bilinç). Bantlar ≥70 BAĞIMSIZ ·
≥40 BAĞIMLI · ≥10 TERMINAL · 0 EXITUS.

#### `endocarditis`te ÖLÜ ALAN — ve bu kez enstrümanda OLMAYAN bir kavramı ilan ediyordu

Ölçüt tarandığında `weight` alanı göründü (majörde 3, minörde 1) ve onu okuyan
tek yer bulundu:

```
const score = CRITERIA.reduce((sum, c) => sum + (sel[c.key] ? c.weight : 0), 0);
```

**`score` HİÇBİR YERDE okunmuyordu** — yani `weight` yalnızca ölü bir değeri
besliyordu. `steroid-dose`un `gluco` alanıyla aynı sınıf, ama burada bir
katman daha kötü: **modifiye Duke'ta ağırlıklı skor YOKTUR.** Tanı yalnızca
majör/minör SAYIMIYLA konur. Alan, enstrümanda bulunmayan bir kavramı varmış
gibi gösteriyordu — bir sonraki okuyucu "demek ki ağırlıklı bir Duke skoru
var" diye düşünebilir.

İkisi de kaldırıldı. **Doğrulama iki yönlü** (belgedeki kural: çıktının aynı
kaldığını değil, KOPYANIN kaybolduğunu ölç):

| ölçüt | önce | sonra |
|---|---|---|
| `weight` taşıyan kayıt | 7 | **0** |
| `score` hesabı | 1 | **0** |
| kaynakta kalan `weight` geçişi | 8 | **1** (yalnızca gerekçe yorumu) |
| altı sınır vakasının çıktısı | — | **altısı da birebir aynı** |

**Aktarılabilir kural, `steroid-dose` dersinin bir adım ötesi:** ölü bir alan
yalnızca yanıltıcı değil, bazen **enstrümanın kendisinde bulunmayan bir
kavramı** kaynağa yazıyor. Bir hesaplayıcıda ağırlık/katsayı alanı görürsen,
yayımlanmış tanımda o kavramın gerçekten var olup olmadığını da sor.

### `noUnusedLocals` ÜÇ ARAÇTA PAYLAŞ DÜĞMESİNİN OLMADIĞINI GÖSTERDİ — ve benim "130/130" iddiamı çürüttü

`endocarditis`in ölü `score`'u yeni bir ölçüt önerdi: **hesaplanıp hiç okunmayan
YEREL DEĞİŞKEN.** Önceki taramalar nesne ALANLARINA bakıyordu; yerel
değişkenler için deponun kendi derleyicisinde hazır bir bayrak var.

Durum ölçüldü: `tsconfig.json`da `noUnusedLocals` **tanımsız**, `strict: false`,
ve `.eslintrc.js`teki `no-unused-vars` yorum satırında — gerekçesi orada yazılı
(59 bulgu, "kapı değil ayrı bir temizlik işi"). `noUnusedLocals` ondan DAHA DAR:
yalnızca kullanılmayan yerel/ithal, tip imzası parametresi ya da `catch`
değişkeni sahte pozitifi yok.

```
npx tsc -p tsconfig.json --noEmit --noUnusedLocals   ->  48 bulgu
```

Kırılımı belirleyici: **34'ü alt çizgili (rotaya alınmayan) premium
sayfalarda kullanılmayan ikon içe aktarması** — kullanıcıya ulaşmıyor.
Geriye **14 ulaşılabilir bulgu** kaldı ve içlerinden biri gerçek bir kusurdu.

#### Üç araçta PAYLAŞ DÜĞMESİ YOKTU

`fibromiyalji` · `haq-di` · `sga` `ToolShare`'i **içe aktarıyor ama hiç
render etmiyordu.** Canlıda doğrulandı:

| araç | paylaş düğmesi (canlı) |
|---|---|
| `fibromiyalji` · `haq-di` · `sga` | **YOK** |
| `conut` · `basdai` · `gh-test` · `gout-acr` · `egfr` · `bmi` (kıyas) | var |

**Bu aynı zamanda belgedeki bir iddianın çürütülmesi.** Araç kabuğu turunda
"`ToolShare` 130/130" yazılmıştı; o ölçüm kaynakta `ToolShare` dizesini
arıyordu ve **İÇE AKTARMA satırını sayıyordu.** Deponun kendi kuralının
("ad araması tek başına yanıltır — içe aktarma satırını ara, sonra gerçekten
kullanıldığını doğrula") kabuk tarafındaki hâli; kural yazılıydı, ölçüm
uymamıştı.

Üçüne de kardeş kalıptaki yerinde (`⚠️` uyarı kutusunun üstünde, ayırıcı
çizgiyle) eklendi. `params` **bilerek geçilmedi**: imzada isteğe bağlı, sorgu
zaten `ToolShare` tarafından siliniyor, ve `Set`/`Record` durumlarını uydurma
bir biçimde serileştirmek `glim` turunda kaçınılan şeyin aynısı olurdu.

Doğrulama: üçünde de düğme çıkıyor, **klinik uyarı yerinde duruyor** (negatif
kontrol — blok kaydırılmadı), `<h1>` hâlâ 1, ve `noUnusedLocals` artık
`ToolShare` için **0** bulgu veriyor.

#### Kalan ulaşılabilir bulgular karara bağlandı

| yer | değişken | verdikt |
|---|---|---|
| `gout-acr` | `isGout` · `isExcluded` · `allDone` | **zararsız ölü kod** — MSU pozitif dalı ayrı render ediliyor (`msu === true ? … : showDomains ? …`), hüküm `domainTotal >= 8`ten doğru üretiliyor |
| `basdai` · `conut` | `answered` · `hasResult` | eski kapıların kalıntısı; davranış ölçülmüş ve doğru |
| `SiteHeader` · `topicChildren` · kayseritip rotası | `router` · `toTitle` · `plan` | ölü yerel |

**Kapı olarak AÇILMADI:** `noUnusedLocals` bugün derlemeyi 48 bulguyla
düşürürdü ve 34'ü ölü koddaki ikon içe aktarması. Ölçüt burada yazılı; bir
temizlik turunda açılabilir.

### ⚠ AÇIK SORU — `gh-test`te BMI'ye bağlı eşik ilan ediliyor, uygulanmıyor

Aynı taramada `gh-test`in `ageIdx`/`ageCutoff` değişkenleri ölü çıktı ve
bakınca daha derin bir şey göründü:

```
const AGE_OPTS = [["≤ 25 yaş", 11.5], ["26–50 yaş", 8], ["> 50 yaş", 4]]
const ageCutoff = AGE_OPTS[ageIdx][1];        // HİÇ OKUNMUYOR
const [ageIdx, setAgeIdx] = useState(1);      // setAgeIdx HİÇ ÇAĞRILMIYOR
```

**11,5 / 8 / 4 sayıları yaşa değil BMI'ye ait** — GHRH+arginin testinin
BMI'ye göre katmanlanmış klasik eşikleri. Aracın kendi protokol notu da bunu
yazıyor: *"GHRH+Arginin daha güçlü stimülandır; pik eşiği **BMI'ye göre
değişir** (cutoff ~4–11 μg/L)."*

Hesap ise arginin protokolünde sabit **3 μg/L** kullanıyor. Yani BMI < 25 olan
bir hastada pik GH 5 μg/L → araç **"YETERLİ GH YANITI — GH eksikliği
dışlanır"** diyor; BMI katmanlı eşikle (11,5) yetersiz sayılırdı. Yön güven
verici tarafta: tanı ATLANIR.

`haq-di` · `murray` · `apache2` · `anaphylaxis` · `canadian-ct` ile aynı sınıf
(**ilan edilip uygulanmayan kural**), beşinci–altıncı örnek.

**DEĞİŞTİRİLMEDİ.** `gnri`nin cinsiyet seçicisinde olduğu gibi girdi eklemek
gerekir (BMI), ama hangi eşik kümesinin hangi protokole ait olduğu klinik bir
kaynak kararı: dizi "yaş" diye ADLANDIRILMIŞ, değerler BMI'ye ait ve `arginine`
ile `GHRH+arginine` farklı testler. Ölçüm, kapsam ve gerekçe burada; kararı
içerik sahibi versin.

### Kabuk tutarlılığı bu kez RENDER'DAN sayıldı — 130/130, dördü de

Geçen turun asıl dersi ölçüm tarafındaydı: "`ToolShare` 130/130" iddiası
grep'in İÇE AKTARMA satırını saymasından geliyordu ve **yanlıştı**. Aynı hata
öteki kabuk parçalarında da olabilirdi; dördü de yeniden, bu kez sunucudan
gelen HTML üzerinden sayıldı.

| kabuk parçası | sonuç |
|---|---|
| `ARACI PAYLAŞ` düğmesi | **130/130** |
| klinik uyarı satırı | **130/130** |
| `☀️` glifinde `aria-hidden` | **130/130** |
| araç ikonu rozetinde `aria-hidden` | **130/130** |

**"0 kusur ile 0 ölçüm" ayrımı raporun içine kondu:** son blok ölçtüğü öge
sayısını da bastı (31 glif · 31 rozet), yani boş bir eşleşmeden gelen sahte
temizlik değil.

**Ölçütün kör olmadığı ÖNCE/SONRA çiftiyle kanıtlandı** — sentetik tohumla
değil, gerçek kusurla: aynı ölçüt bir tur önce `fibromiyalji` · `haq-di` ·
`sga`yı yakalamıştı, düzeltme canlıya inince üçü de listeden düştü.

**Aktarılabilir kural: bir KABUK parçasının varlığını kaynakta arama, RENDER
EDİLMİŞ çıktıda ara.** İçe aktarma, yorum ve ölü dal kaynakta aynı dizeyi
taşıyor; ekranda taşımıyor.

### Oturum içi gerileme kontrolü — 12 denetim, taban değerinde

Bu oturumda ~15 araç dosyası değişti. Deponun kendi denetimleri kendi iş
üzerinde sürüldü:

| denetim | sonuç |
|---|---|
| `ic-bilesen` (CI kapısı) | **temiz** — 402 tsx · 661 bileşen |
| `arayuz` | kusur yok |
| `bolme` | 130 araç · 18 bölme noktası · **0** |
| `bant` | 130 araç · 27'si hem cetvel hem merdiven · **0 çelişki** |
| `karar` | 0 — tarihsel kontrol (`spot-urine` 328/330/332) hâlâ yakalıyor |
| `esik-etiket` | 459 dosya · **0 çelişki** |
| `kapi-kapsam` · `cop-kapi` · `eksik-alan` · `yuvarlama` · `payda` | belgede kayıtlı verdiktler, yeni aday yok |

#### Kendi düzeltmem `olu-denetim`e YENİ bir aday soktu — ve yanlış pozitif

`olu-denetim` dört aday veriyor; üçü belgede kayıtlı (`ReadingHint cikis` ·
`unit-converter ters` meşru, `TableOfContents activeId` ölü kod). Dördüncüsü
YENİ: **`nutrition-needs → secilenSablon`** — "seçim puanla saklanıyor"
turunda indekse çevirdiğim değişken.

Kaynağa bakıldı: yalnızca `aria-pressed` ve `className` içinde geçiyor, yani
ölçütün tanımı gereği aday. Ama gerçek değerleri aynı `onClick` ayrıca
kuruyor:

```
onClick={() => { setSecilenSablon(i); setStressFactor(lvl.kcal); setProteinFactor(lvl.pro); }}
```

Yani `secilenSablon` SALT GÖRÜNÜM durumu (hangi şablonun basılı göründüğü) ve
`unit-converter`ın `ters`i ile aynı kovada — belgedeki kural: *"yalnızca
görünümü yöneten durum meşrudur."* Kontrolün çıktıyı gerçekten değiştirdiği
ayrıca ÖLÇÜLMÜŞTÜ (70 kg · Ağır Sepsis → 2450 kcal · 105,0 g; Obezite →
1400 kcal · 140,0 g).

**Not edilmesinin sebebi: aday listesi büyüdüğünde sonraki tur bunu kovalar.**
Bir denetimin aday sayısı artınca ilk soru "yeni kusur mu" değil, **"bu turda
o dosyaya ben mi dokundum"** olmalı.

### DÜZELTME — "`/tools` 133 bağlantı = 130 araç + 3 gezinme" YANLIŞTI

Belgede iki ayrı turda `/tools` için "133 araç bağlantısı (130 + 3 gezinme)"
yazılmıştı. O parantez bir ÖLÇÜM değil, benim varsayımımdı — ve yanlıştı.

Ölçüldü: fazladan üç bağlantı gezinme değil, **çapraz listelenen üç araç**:

| araç | birinci branş | ikinci branş |
|---|---|---|
| `corrected-calcium` | Nefroloji | Endokrinoloji & Metabolizma |
| `ipi` | Onkoloji | Hematoloji |
| `timi-ua` | Kardiyoloji | Acil & Kritik Bakım |

**Kusur DEĞİL — çapraz listeleme bilinçli ve kaynakta belgeli.** `ToolsIcerik`
içindeki yorum bunu birebir yazıyor:

> *"Benzersiz araç sayılır, listeleme değil: bazı araçlar birden fazla branşta
> görünüyor (ör. düzeltilmiş kalsiyum hem nefroloji hem endokrinde). Kayıtları
> toplamak '117 araç' gibi gerçekte olmayan bir sayı üretiyordu."*

Hem `toplamArac` hem canlı bölge sayacı `new Set(...)` ile benzersiz slug
sayıyor, yani sayı ile liste ayrışmıyor.

**Tasarım canlıda uçtan uca doğrulandı:**

| görünüm | kart | benzersiz | sayaç | `h2` bölüm |
|---|---|---|---|---|
| Nefroloji süzgeci | 9 | 9 | 9 | 1 |
| Endokrinoloji süzgeci | 9 | 9 | 9 | 1 |
| **Tümü** | **133** | **130** | **130** | **18** |

`corrected-calcium` her iki branş süzgecinde de çıkıyor. "Tümü" görünümündeki
133 kart 18 ETİKETLİ bölüme dağılmış durumda — kullanıcı aynı aracı iki kez
üst üste görmüyor, iki farklı branş başlığının altında görüyor.

Kategori rozetlerinin toplamı da 133 (listeleme sayısı), "Tümü" rozeti 130
(benzersiz araç). İki sayı FARKLI şeyleri sayıyor ve ikisi de doğru.

**Aktarılabilir kural — bu, iki turda İKİNCİ kez oldu:** belgeye yazdığım bir
sayının yanına koyduğum AÇIKLAMA, sayının kendisi kadar ölçülmüş değildi.
`ToolShare 130/130` grep'in içe aktarma satırını saymasından geliyordu;
`133 = 130 + 3 gezinme` de bir tahmindi. **Bir sayıyı ölçtükten sonra onun
NEDEN o sayı olduğunu da ölç** — yoksa doğru sayının yanına yanlış bir sebep
yazılıyor ve sonraki tur o sebebe güveniyor.

### Meta denetim ve gerileme kontrolü — taban değerinde

`yorum-korlugu-denetim` sürüldü: **14 denetimin 14'ü temiz**, yorum körü
denetim yok ve **bayat denetim uyarısı yok** — yani bu oturumda eklenen
`cop-kapi-denetim` listeye alınmış durumda.

### AYNI ANALİT, FARKLI SINIR — sınıf süpürüldü ve `gnri`/`pni` en ağır hastayı skorlamayı REDDEDİYORDU

`anion-gap` ↔ `abg` turunda tek bir çift için düzeltilen sınıf (**aynı
büyüklüğün makullük sınırı araçtan araca ayrışıyor**) hiç depo geneline
sürülmemişti. Sürüldü: `alanMakul(x, lo, hi)` / `araliktaMi` / `x >= lo && x <= hi`
biçimleri analit adına göre gruplandı.

**Beş analitte ayrışma çıktı:**

| analit | ayrışma | verdikt |
|---|---|---|
| **albümin** | `corrected-calcium` 0,5–8 · `gnri`/`pni` **1–7** | **KUSUR — düzeltildi** |
| kilo | 10 araç 1–400 · 8 araç 20–300 | açık madde (aşağıda) |
| sodyum | `corrected-sodium`/`meld-na` 90–190 · `osmolal-gap`/`sodium` 90–200 | gerçek hastayı reddetmiyor |
| glukoz | `corrected-sodium` 20–2000 · `osmolal-gap` 10–1500 | `osmolal-gap`in 10'u belgede gerekçeli |
| boy | `bsa` **30–260** · beşi 50–250 | **meşru** — BSA çocukta da hesaplanır, 30 cm prematüre bir yenidoğandır |

#### Albümin: indeksin TANIMLAMAK için var olduğu hasta skorlanmıyordu

Ölçüldü, iki araçta da aynı:

| girdi | önce | sonra |
|---|---|---|
| albümin **0,9** g/dL · lenfosit 800 (`pni`) | **"Hesaplanamıyor"** | **PNI 13,0 · YÜKSEK RİSK** |
| albümin **0,9** (`gnri`, 55 kg · 165 cm) | **"Hesaplanamıyor"** | **GNRI 50,8 · YÜKSEK RİSK** |

**Yön belirleyici:** GNRI ve PNI malnütrisyon indeksleri; ağır hipoalbüminemi
tam da onların yakalamak için var olduğu hasta. Araç en yüksek riskli hastayı
sessizce skorlamayı reddediyordu — `glim`/`kdigo-aki` sınıfının tersi yönde
bir hâli: yanlış cevap değil, CEVAP YOK.

Çare kanonik kaynağa bağlamak: `app/tools/lib/asit-baz.ts` → `SINIRLAR.albumin`
= **[0,5, 7]** (`as const`, o yüzden `makul(alb, ...SINIRLAR.albumin)` tip
denetiminden geçiyor). **Mesaj metni de sabitten TÜRÜYOR** — bir daha
ayrışamaz:

```
!albOk && `albümin (${SINIRLAR.albumin[0]}–${SINIRLAR.albumin[1]} g/dL)`
```

**Doğrulama — sınır üç noktadan, negatif kontroller belgede KAYITLI değerlerle:**

| ölçüt | sonuç |
|---|---|
| `pni` albümin 0,5 (tam sınır) | **9,0 · YÜKSEK RİSK** — elle 10×0,5 + 0,005×800 |
| `pni` albümin 0,4 | reddediliyor · mesaj **"albümin (0.5–7 g/dL)"** |
| `pni` belgedeki vaka 3,0/1200 | **36,0** — birebir |
| `gnri` albümin 0,5 | 44,9 · YÜKSEK RİSK |
| `gnri` belgedeki erkek 165/55/3,6 | **91,0 · ORTA RİSK** — birebir |
| `gnri` belgedeki kadın | **92,5 · DÜŞÜK RİSK**, varyant satırı "kadın" — birebir |

**Ölçüm tuzağı — kendi etiketime aldandım.** `gnri` koşumunda "kadın" diye
etiketlediğim ölçüm aslında VARSAYILAN erkek dalıydı (cinsiyet tıklaması
ölçümden SONRA geliyordu) ve 91,0 çıktı. Belgedeki kadın değeri 92,5 olduğu
için bir an gerileme sanıldı. Ayrı bir koşumda radyo gerçekten seçilip
ölçülünce 92,5 ve "Lorentz, **kadın**" satırı çıktı. **Bir varyantı ölçtüğünü
sanmak için o varyantın GERÇEKTEN seçili olduğunu ayrıca oku** — belgedeki
"cevaplanmış durum sandığım ölçüm yanlış durumdaydı" kuralının tekrarı.

#### AÇIK MADDE — kilo sınırı iki gruba ayrışmış (18 araç)

| aralık | araçlar |
|---|---|
| **1–400 kg** | `bikarbonat-infuzyon` · `bmi` · `bmr` · `bsa` · `dka-infuzyon` · `fomepizol` · `heparin-nomogram` · `nac-infuzyon` · `nutrition-needs` · `sodium` · `vazoaktif-infuzyon` |
| **20–300 kg** | `antikoagulan-geri-dondurme` · `fosfat-replasman` · `gnri` · `kalsiyum-infuzyon` · `sedasyon-infuzyon` · `status-epileptikus` · `tromboliz-doz` |

İkisi de tek başına makul, ama **aynı sınıftan araçlar iki farklı kovada**
(`kalsiyum-infuzyon` 20–300 iken `bikarbonat-infuzyon` 1–400). Ayrım klinik
bir gerekçeden değil, sınırların farklı turlarda konmuş olmasından geliyor.

**DEĞİŞTİRİLMEDİ** çünkü karar klinik kapsamla ilgili: 20 kg alt sınırı
çocuğu reddeder ve `status-epileptikus` çocukta da kullanılan bir protokol
taşıyor; 1 kg alt sınırı ise yenidoğanı kabul eder. Platform dahiliye
(erişkin) için yazılmış, yani ikisi de savunulabilir — ama **ikisinin bir
arada olması savunulamaz.** Ölçüm ve liste burada; kapsam kararı içerik
sahibinin.

### Premium motorları KISMİ TAMAMLAMA ekseninde sınandı — beş eksen, hepsi temiz

Bu oturumda araçlarda tekrar tekrar çıkan iki sınıf (**payda dürüst mü**,
**erken/eksik hüküm**) premium motorlarına hiç sürülmemişti. Belgede
`QuizEngine`in puanlaması yalnızca **tamamı cevaplanmış** hâlde ölçülmüş
("%70 · 10 soruda 7 doğru"); kısmen cevaplanmış hâl hiç sorulmamıştı.

Beş eksen kaynaktan sürüldü, hepsi temiz — **ve her birinin NEDEN temiz olduğu
yapısal**, rastlantı değil:

| eksen | bulgu |
|---|---|
| yüzdenin paydası | `cevaplanan.length` — **cevaplanmayan soru YANLIŞ sayılmıyor** |
| özet metni | "{cevaplanan} soruda {doğru} doğru · {yanlış} yanlış" — toplam değil, cevaplanan |
| soru atlanabiliyor mu | **hayır** — ilerletme düğmesi `{cevapVerildi && …}` bloğunun içinde; cevapsız dalda yalnızca "Bir seçenek işaretleyin" var |
| `VakaEngine` son adım | "Sonraki Adım" düğmeleri `!isLast` ile kapılı; `Math.min(i+1, toplam−1)` yalnızca ek koruma, **ölü kontrol değil** |
| `VakaEngine` durum sızıntısı | `sonrakiAcik` adım değişince sıfırlanıyor — `key={adimIndex}` ile yeniden mount |

**Üçüncü satır ikinci satırı gereksiz kılıyor ve bu önemli:** soru
atlanamadığı için sonuç ekranında `cevaplanan.length === sorular.length` her
zaman doğru, yani başlıktaki **"Set tamamlandı"** iddiası da dürüst. Payda
dürüst olsa bile atlama mümkün olsaydı başlık yalan söylerdi; iki koruma
birbirini tamamlıyor.

`VakaEngine` hiç PUAN tutmuyor — rehberli bir vaka yürüyüşü ve sonu
"Vaka tamamlandı!". Yanlış olabilecek bir payda yok; sınıf orada tanım gereği
oluşamıyor.

**Kayda geçirilmesinin sebebi:** bu eksenler bir daha sorulmasın. Motor kodu
değişmedikçe yeniden ölçmeye gerek yok — değişirse ölçülecek dört şey
yukarıda adıyla duruyor.

### 320px GERİLEME KONTROLÜ — bu oturumda eklenen bloklar dar ekranı bozmadı

Bu oturumda ~30 araç dosyasına dokunuldu ve çoğuna **yeni DOM** eklendi: sebep
kartları, `role="alert"` uyarı kutuları, boş `<option>`lu seçiciler, yeni onay
kutuları, paylaş düğmeleri. Dar ekran ekseni bu eklemelerden sonra hiç
ölçülmemişti.

En çok DOM ekleyen dört araç canlıda, **320px görüntü penceresiyle** ve
yalnızca varsayılan hâlde değil **yeni eklenen DALLAR çizdirilerek** ölçüldü:

| araç | durum | ölçülen öge | taşan |
|---|---|---|---|
| `glim` | dokunulmamış | 135 | **0** |
| `anaphylaxis` | dokunulmamış (sebep kartı) | 146 | **0** |
| `anaphylaxis` | **tanı dalı** | 161 | **0** |
| `canadian-ct` | bekleme mesajı | 159 | **0** |
| `canadian-ct` | **BT GEREKLİ (Yüksek Risk)** | 165 | **0** |
| `abg` | dokunulmamış | 178 | **0** |
| `abg` | yorum çizili | 206 | **0** |
| `abg` | **yardımcı alan bozuk (amber uyarı)** | 209 | **0** |

Öge sayısının durumdan duruma artması, dalın GERÇEKTEN çizildiğinin kanıtı —
belgedeki *"bir durumu ölçtüğünü sanmak için o durumun oluştuğunu ayrıca
doğrula"* kuralı.

**Yan doğrulama:** `abg`nin yardımcı-alan düzeltmesi canlıda çalışıyor —
Na⁺ alanına `abc` yazıldığında asit-baz yorumu DURUYOR ve ayrı bir
`role="alert"` kutusu "hesaba KATILMADI" diyor.

#### Ölçüm notu — iki taşma ölçütünden BİRİ bu sayfalarda KÖR

Belgede *"İKİ ölçüt birden gerekiyor; hangisinin tek başına yeteceği sayfaya
göre değişiyor"* yazılı. Bu turda taze bir örnek çıktı:

| ölçüt | 900px tohum eklendiğinde |
|---|---|
| kaydırma denemesi (`scrollTo(9999,0)` → `scrollX`) | **0** — hiç tepki vermedi |
| öge başına `scrollWidth > clientWidth` | **0 → 2**, tohum kalkınca **0** |

Yani bu araç sayfalarında kaydırma ölçütü tek başına kullanılsaydı, gerçek bir
900px'lik taşma bile "temiz" raporlanırdı. **Pozitif kontrolü her koşuma koy;
hangi ölçütün o sayfada işe yaradığını ancak o gösteriyor.**

### Erken hüküm sınıfı DEPO GENELİNE sürüldü — ve kendi düzeltmemin yarım kalan yarısını buldu

Sınıf üç araçta düzeltilmişti (`anaphylaxis` · `canadian-ct` · `cam-icu`) ama
**hiç depo geneline sürülmemişti**: ikisini "belgede hiç geçmeyen araçlar"
listesinden, birini `<select>` taramasından bulmuştum. Oysa daha önceki bir
tarama **tamlık kapısı olan 27 aracı** saymıştı ve o liste hiç incelenmedi.

**Ölçüt bir kez fazla kaba çıktı ve okunamaz bir liste verdi:** "kapısı var VE
`&&`/`some`/`every` geçiyor" ölçütü 27 aracın 20'sini işaretledi. `&&` her
dosyada geçiyor.

**Ayırt edici soru ŞU: hüküm TOPLAMDAN mı, MANTIKSAL KURALDAN mı geliyor?**

| şekil | erken hüküm | örnek |
|---|---|---|
| toplamsal skor | **imkânsız** — her madde toplama giriyor, son yanıt gelmeden toplam bilinmez | `braden` · `nihss` · `dlqi` · `cat-copd` · `mrss` · `tnss` · `bode` · `4t-hit` |
| mantıksal kural | **mümkün** | `berlin-ards` · `anaphylaxis` · `canadian-ct` · `cam-icu` |

Bu ayrım listeyi 20'den 1'e indirdi.

#### `berlin-ards` — içeriğini düzeltmiştim, KAPISINA dokunmamıştım

Önceki turda `pf === "no_ards"` dalını eklemiştim (P/F > 300 ARDS'i dışlar).
Ama kapı `allAnswered` olarak KALMIŞTI. Ölçüldü (canlıda):

| girdi | ekranda (önce) |
|---|---|
| yalnızca "> 300 mmHg" seçili (1/4) | **hiçbir hüküm YOK** |

Oysa o seçim tek başına belirleyici. Berlin tanımındaki **dört ölçüt de
zorunlu**, yani herhangi birine "hayır" demek ARDS'i tek başına dışlıyor.

**Asimetri kuralın neden basit olmadığını gösteriyor:** bir "EVET" yanıtı
hükmü ASLA belirlemiyor (dördü de gerekli), tek bir "HAYIR" ise anında
belirliyor. Araç artık ikisini de doğru yapıyor.

**Doğrulama — yedi ölçüm, dördü negatif kontrol:**

| girdi | hüküm |
|---|---|
| yalnızca "> 300 mmHg" (1/4) | **ARDS DEĞİL** — anında |
| başlangıç "Hayır" (1/4) | **ARDS DEĞİL** — anında |
| dokunulmamış | "Hüküm verilemiyor" + dört alan da listeleniyor |
| **negatif** — başlangıç "Evet" (1/4) | hüküm **YOK**, eksik: grafi · kaynak · oksijenasyon |
| **negatif** — 2/4 "Evet" | hüküm **YOK**, eksik: kaynak · oksijenasyon |
| **negatif** — üç kriter "Evet", P/F YOK (3/4) | hüküm **YOK**, eksik: oksijenasyon |
| **negatif** — 4/4 · P/F 201–300 | **HAFİF ARDS** · P/F ≤100 → **AĞIR ARDS %45** (değişmedi) |

Son dört satır belirleyici: erken hüküm kuralı ŞİDDET tarafını gevşetmedi.

**Ölçüm tuzağı — ardışık koşumda P/F seçili KALDI.** İlk negatif kontrol
koşumunda "üç kriter evet, P/F yok" diye etiketlediğim ölçüm `basili: 4`
gösterdi: önceki koşumdan "> 300 mmHg" duruyordu ve sonuç "ARDS DEĞİL" çıktı.
Taze sayfada tekrarlandı. Belgedeki "ardışık ölçüm bayat sonuç verir"
kuralının bu turdaki hâli — **etiketin doğru olduğunu, basılı düğme SAYISINI
okuyarak sına.**

### Erken hükmün ÜÇÜNCÜ şekli: KAPI + SKOR karışımı — `gout-acr` çıkmaz sokaktı

Önceki tur sınıfı iki şekle ayırmıştı (toplamsal skor → erken hüküm imkânsız;
mantıksal kural → mümkün). Üçüncü bir şekil var: **bir GİRİŞ KAPISI ile bir
SKORUN birleşimi.** Kapı düşerse skora hiç bakılmaz, yani hüküm erken belli
olur.

`gout-acr` bu şekli taşıyor ve ölçüldü (canlıda):

| girdi | ekranda (önce) |
|---|---|
| giriş ölçütü **"Hayır"** | öge sayısı **96 → 96**, gövde metni **405 → 405 karakter** — hiçbir şey |

ACR/EULAR 2015'te giriş ölçütü (periferik eklemde atak) karşılanmazsa
sınıflama **hiç uygulanamaz**. Kullanıcı "Hayır" deyip **çıkmazda kalıyordu**:
ne hüküm, ne açıklama, ne çıkış yolu.

#### DOĞRU KART ZATEN YAZILMIŞTI — kapı ulaştırmıyordu

Kaynakta tam olması gereken kart duruyor:

> **KAPSAM DIŞI** · *"Periferik eklem atağı yok — gut sınıflandırma kriterleri
> uygulanamaz"*

Ama dış kapı `entry !== null && msu !== null` istiyordu ve **MSU sorusu
`entry === true` ile kapılı**, yani `entry === false` iken `msu` asla
`null` olmaktan çıkamıyor. Kart ulaşılmaz.

`ktv`nin ölü "DEĞERLENDİRİLEMEDİ" dalıyla birebir aynı şekil: **doğru dal
yazılmış, kapı oraya ulaştırmıyor.** Bu sınıfta "kod yok" değil "kod
erişilmez" aranmalı.

Yanındaki `isExcluded` değişkeni de hem YANLIŞ hem ÖLÜ idi
(`msu === false && entry === false` — oysa `entry === false` tek başına
yeterli, ve hiç okunmuyordu). Doğru tanımıyla yazılıp kapıya bağlandı.

**Doğrulama — beş ölçüm, üçü negatif kontrol:**

| girdi | sonuç |
|---|---|
| giriş "Hayır" | **KAPSAM DIŞI** kartı · "…kriterleri uygulanamaz" (öge 111 → 114) |
| **negatif** — giriş "Evet" | MSU sorusu beliriyor (öge 192), kapsam dışı kartı YOK |
| **negatif** — MSU pozitif | **"YETERLI TANI — MSU POZİTİF"** |
| **negatif** — MSU yapılmadı + 1.MTP(+2) + tofüs(+4) + ürat ≥10(+4) = 10 | **"GUT ARTRİT — Kriterleri Karşılıyor"** |

**İKİ ÖLÇÜM TUZAĞINA YİNE DÜŞÜLDÜ ve ikisi de belgede kayıtlı:**

- **Seçili düğmeye ikinci kez basmak seçimi KALDIRIYOR.** Ardışık koşumda
  giriş zaten "Evet"ti; tekrar tıklayınca kapandı ve MSU yolu ölçülemedi.
- **Desen tahmin edildi.** MSU düğmesinin metni `Evet` değil
  **"Evet — MSU Pozitif"**; `/^Evet$/` hiç tutmadı ve bir an "MSU yolu bozuk"
  sanıldı. Düğme listesi BASILIP okununca görüldü.

Yan doğrulama: düğme listesinde iki ayrı görüntüleme grubu (**USG çift kontur**
ve **X-Ray erozyon**) yan yana duruyor — önceki turda ayrılan o iki alan
canlıda ayrı ayrı puanlanabiliyor.

### Ön koşul kapısı sınıfı süpürüldü — tek örnekmiş, ve `nrs-2002` REFERANS uygulama

`gout-acr` kusurunun şekli ("bir bölümü gizleyen ön koşul kapısı, olumsuz dalı
ulaşılmaz bırakıyor") ölçüte çevrilip depo geneline sürüldü.

**Dar ölçüt** (`{X === true && (` biçimindeki bölüm kapıları) tek eşleşme
verdi: `gout-acr` — ve o da artık olumsuz dalını taşıyor.

**Geniş ölçüt** (`{degisken && (` biçimindeki her kapı) 37 eşleşme verdi ama
neredeyse hepsi **koşullu BİLDİRİM**: `tavanUygulandi` · `aralikDisi` ·
`crKirpildi` · `sebepGoster`. Bunların olumsuz dalı OLMAMASI doğru — bir
bildirim yalnızca koşul doğruyken çizilir.

**Ayırt edici soru: kapı GİRDİ mi gizliyor, yoksa BİLDİRİM mi gösteriyor?**
Girdi gizleyen kapı aşağı akıştaki durumu erişilemez yapar (o yüzden hüküm
dalı ölür); bildirim gösteren kapı hiçbir şeyi engellemez.

#### `nrs-2002` bu sınıfın doğru yapılmış hâli — iki yönde de ölçüldü

| girdi | ekranda |
|---|---|
| dört ön tarama sorusuna da **"Hayır"** | ana tarama bölümü **gizleniyor** (öge 147 → 124) ve hüküm çıkıyor: **"Ön tarama negatif · Ana tarama gerekmiyor"** |
| tek **"Evet"** (1/4) | ana tarama bölümü **zaten açık** (öge 157, sabit) — beklemiyor |

Olumsuz dalın metni yalnızca "hüküm var" demekle kalmıyor, **gerekçeyi ve
klinik çekinceyi** de veriyor:

> *"Dört sorunun dördüne de 'Hayır' yanıtlandı. NRS-2002'de bu durumda ana
> tarama yapılmaz; hasta haftalık aralıklarla yeniden taranır. **Büyük bir
> ameliyat planlanıyorsa** koruyucu bir beslenme planı yine de değerlendirilir."*

Yani sınıf tek örnekliymiş (`gout-acr`, düzeltildi) ve deponun kendi referansı
zaten mevcuttu.

**Ölçüm notu — gövde metni ölçütü KİRLETTİ, öge sayısı kurtardı.** Hüküm
dedektörlerim (`/Ana Tarama/i`, `/haftalık/i`) sayfanın AÇIKLAMA ve ALT BİLGİ
metnine takıldı ve açılışta bile `true` döndü. Ayırt edici sinyal **öge
sayısı** oldu (147 → 124 → 157). Metin arayan bir dedektör yazarken sayfanın
kendi açıklama metninin aynı kelimeleri taşıyıp taşımadığını önce kontrol et —
bu depoda araçlar kendi kurallarını ekranda anlatıyor, yani bu tuzak yapısal.

### KAYNAK İLANI sınıfı süpürüldü — 37 araç, ve `fibromiyalji`de AÇIK BULGU

`grace` "2.0" düzeltmesi aslında bir sınıfın tek örneğiydi: **araç kaynağını
ADIYLA ilan ediyor** (yazar-yıl, kılavuz adı, formül adı) ve o ilan uygulamayla
tutmayabilir. Sınıf hiç süpürülmemişti.

Ekran metinlerinden ilan çıkarıldı: **37 araç** kaynağını adlandırıyor
(Knaus 1985 · Stiell 2001 · Fardet 2014 · Daugirdas II · Mifflin–St Jeor ·
CKD-EPI 2021 · ACR/EULAR 2015 · NIAID/FAAN 2006 · ICBD 2014 …). Çoğu belgede
zaten yayımlanmış hâliyle karşılaştırılmıştı; doğrulanmamış dördü bu turda
kontrol edildi:

| araç | ilan | sonuç |
|---|---|---|
| `spot-urine` | ACR formülü | **doğru** — `albumin × 1000 / kreatinin` (ilk çıkarımım kırpılmıştı) |
| `rass` | Sessler 2002 | **doğru** — +4…−5, tam 10 seviye |
| `act` | Nathan 2004 | **doğru** — 5 soru × 1–5, tavan 25 (payda denetiminde de kayıtlı) |
| `fibromiyalji` | ACR 2016 | **AÇIK BULGU — aşağıda** |

#### ⚠ AÇIK BULGU — `fibromiyalji`de ÜÇÜNCÜ bir tanı dalı var

ACR 2016 fibromiyalji ölçütü **iki** daldan oluşur:

```
WPI ≥ 7  ve  SSS ≥ 5        veya        WPI 4–6  ve  SSS ≥ 9
```

Araçta **üç** dal var; üçüncüsü yayımlanmış ölçütte YOK:

```
(wpiScore >= 0 && wpiScore <= 3 && ssScore >= 11)
```

**Ölçüldü (canlıda) ve tekrarlanabilir:**

| girdi | ekranda |
|---|---|
| **WPI 0/19** · SS 11/12 | **"FİBROMİYALJİ TANISI KARŞILANIYOR"** |

On dokuz bölgenin **hiçbirinde** ağrısı olmayan hasta, adı *yaygın ağrı
indeksi* olan bir ölçütle fibromiyalji tanısı alıyor. Yön **aşırı tanı**.

**İç çelişki YOK — ve ayrım tam burada.** Ekran metni de üç dalı yazıyor
("WPI ≥ 7 + SS ≥ 5, veya WPI 4–6 + SS ≥ 9, veya **WPI ≤ 3 + SS ≥ 11**"), yani
kod ile etiket birbiriyle uyumlu; uyuşmazlık DIŞ kaynakla.

| uyuşmazlık türü | örnek | benim eylemim |
|---|---|---|
| **İÇ** — etiket X diyor, kod X'i yapmıyor | `apache2` (ABY ×2) · `haq-di` (yardımcı araç) · `murray` (kullanılan parametre) | **düzelttim** — araç kendi ölçüsüne hizalandı |
| **DIŞ** — kod ve etiket uyumlu, yayımlanmış kaynakla değil | `grace` (2.0 → 1.0) · `sledai2k` (eksik sürüm) | **iddiayı** değiştirdim / yönlendirdim |
| **DIŞ + klinik eşik değişimi** | `asdas` (−0.211) · `essdai` (kutanöz düzey) · `gh-test` (BMI eşikleri) | **ölçtüm, bıraktım** |

`fibromiyalji` üçüncü satırda: dalı kaldırmak bir TANI EŞİĞİNİ değiştirmek
olur. **DEĞİŞTİRİLMEDİ.** İki dürüst çare var ve seçim içerik sahibinin:

1. Üçüncü dalı kaldır (araç ilan ettiği ACR 2016'ya hizalanır), ya da
2. Dalı koru ama "ACR 2016" ilanını nitele (yerel varyant olduğunu söyle).

**Ek bağlam — ACR 2016'nın İKİNCİ ölçütü hiç uygulanmıyor:** "beş bölgenin en
az dördünde yaygın ağrı" koşulu araçta yok. WPI 0 olan hastada o koşul zaten
tanım gereği karşılanmıyor, yani üçüncü dal iki ayrı gereksinimi birden
deliyor.

**Yöntem notu:** ilk çıkarımım `spot-urine`ın ACR formülünü eksik gösterdi
(regex 44 karakterde kesiyordu) ve bir an kusur sanıldı. Belgedeki *"ekrana
basmak için kırptığın değeri ölçüme GERİ VERME"* kuralının ilan tarafındaki
hâli — kırpılmış bir ilan, ilanın kendisi değildir.

### Konsol/hidrasyon gerileme kontrolü — koşullu render'ı en çok değişen beş araç temiz

Bu oturumda koşullu render mantığı yoğun biçimde değişti: `glim`in beş
seçicisi denetimliye çevrildi, `berlin-ards` ve `gout-acr`ın hüküm kapıları
yeniden yazıldı, üç araca erken hüküm dalı eklendi. Bu tür değişiklikler
**hidrasyon uyuşmazlığı** üretebilir ve o yalnızca KONSOLDA görünür — hiç
bakılmamıştı.

Beşi de canlıda tarandı: `glim` · `berlin-ards` · `gout-acr` · `cam-icu` ·
`abg`. **Sıfır hata, sıfır uyarı.**

**Ölçüt kör değil — pozitif kontrol konuldu.** Üç kez üst üste "log yok"
almak, okuyucunun çalışmadığı anlamına da gelebilirdi; `console.error` +
`console.warn` tohumu atıldı ve **ikisi de yakalandı**.

**Sayfa yalnızca AÇILIŞTA değil, ETKİLEŞİMLİ dallarında da sürüldü** — hata
çoğu zaman ilk render'da değil durum geçişinde çıkar:

| araç | sürülen geçişler |
|---|---|
| `cam-icu` | F1 Yok → **DELİRYUM NEGATİF** · F1 Mevcut → hüküm yok · +F2 → hüküm yok · +F3 → **POZİTİF** |
| `abg` | çekirdek dolu → yorum · Na⁺ bozuk → **amber uyarı, yorum SAĞ** · pH bozuk → **kırmızı uyarı, yorum düştü** |

İkisi de düzeltmelerin canlıda çalıştığını ayrıca doğruluyor.

**Ölçüm notu — sayfanın kendi CETVELİ dedektörü kirletti, iki turda ikinci
kez.** `abg`de "yorum var mı" ölçütüm `/Metabolik asidoz|Solunum/i` idi ve
çekirdek bozukken bile `true` döndü. Sebep kusur değil: sayfa **kompanzasyon
referans cetvelini** basıyor ve o cetvelin satırları tam da bu kelimeler
("Metabolik asidoz", "Metabolik alkaloz", "Solunum asidozu (akut)").

Ayırt edici okuma `role="alert"` kutularının METNİNİ almak oldu:

> kırmızı: *"Şu değer(ler) beklenen aralığın çok dışında: **pH**. Yorum
> yapılmadı — yazım hatası olabilir."*
> amber: *"…: **Na⁺**. Bu alan(lar) hesaba KATILMADI…"*

Her uyarı kendi alanını ADIYLA söylüyor ve ikisi aynı anda çizilebiliyor.

Bu depoda araçlar kendi kurallarını, formüllerini ve cetvellerini EKRANDA
anlatıyor; **gövde metninde anahtar kelime arayan her dedektör yapısal olarak
kirli.** Güvenilir sinyaller: `role` taşıyan kutuların metni, öge sayısı,
`aria-pressed` sayısı.

**Ölçüm notu 2 — konsol günlüğü SEKME başına, sayfa başına değil.** Tohum
mesajları gezinmelerden sonra da listede kaldı. Yani "yeni mesaj yok" doğru
okuma; sayfa başına atıf gerekiyorsa her sayfa için TAZE sekme açılmalı.

### Araçlar depoya HİÇ yazmıyor — ve çalışma yüzeyleri bozuk depoya dayanıklı

İki eksen birlikte ölçüldü; ikisi de temiz çıktı ve ikisinin de NEDENİ yapısal.

**1) Araçlar arası durum sızıntısı OLUŞAMIYOR.** `localStorage` kullanan
12 dosya var ve **araç sayfalarında SIFIR**. Yani "bir araç ötekinin
anahtarına yazar" sınıfı bu depoda tanım gereği yok.

Birden çok dosyada geçen üç anahtar ifadesi de yanlış pozitif: `INDEX_KEY` ve
`LOG_KEY` çalışma kütüphanesinin kendi paylaşılan SABİTLERİ (doğru kalıp,
çakışma değil), `k` ise iki hata sınırındaki döngü değişkeni.

**2) Bozuk depo TOHUMLANDI — iki çalışma yüzeyi de ayakta kaldı.**

Altı anahtar, beş ayrı depo ailesi, hepsi geçersiz JSON:

```
medisea:index:v1                              "{bozuk"
medisea:marks:v2:/topics/endokrinoloji/addison "[[[bozuk"
medisea:review:v1                              "not-json-at-all"
medisea:log:v1                                 "{yine-bozuk"
medisea:kartlar:v1:fc-test                     "}{"
medisea:notes:v1:/zz-tohum-bozuk               "{bozuk-json"
```

| yüzey | sonuç |
|---|---|
| `/calisma-alanim` | **normal açıldı** — 255 öge, üç düğme de yerinde (branş filtresi · yedek al · yedekten yükle), hata sınırı YOK |
| `/tekrar` | **normal açıldı** — 194 öge, başlıklar yerinde, hata sınırı YOK |

Yani belgede kayıtlı sertleştirmeler (`usable()` içindeki korumasız
`m.t.trim()`, `JSON.parse` korumaları, `pruneStates`) gerçekten iş görüyor:
**tek bir bozuk kayıt artık sayfayı düşürmüyor.**

#### Hata sınırının KURTARMA yolu incelendi — tasarımı doğru, ama ULAŞILMADI

`calisma-alanim/error.tsx` bir "bozuk veriyi temizle" düğmesi taşıyor ve
tasarımı üç doğru karar veriyor:

1. `confirm()` ile onay alıyor ve yedeği hatırlatıyor,
2. yalnızca `medisea:` önekini tarıyor,
3. **yalnızca `JSON.parse`'ı DÜŞEN kaydı siliyor** — geçerli veri korunuyor.

Ama bu turda **tetiklenemedi**: okuma yolları o kadar dayanıklı ki altı bozuk
kayıt bile hata sınırını açtırmadı. Yani kurtarma yolu bugün bir SON ÇARE ve
ölçülemedi — **"çalışıyor" DENMİYOR**, yalnızca tasarımı okundu.

Kayda değer bir gözlem: temizlik ölçütü PARSE hatasına bakıyor. Belgede kayıtlı
bozuk-veri kusurlarının bir kısmı ise **geçerli JSON, yanlış ŞEKİL** idi
(`strokes` alanında dize, kart kimliği hayaleti). Öyle bir kayıt hata sınırını
açtırırsa "temizle" düğmesi onu SİLMEZ ve döngü kırılmaz. Bugün okuma yolları
o kayıtları da yutuyor, yani sorun kuramsal — ama ölçüt burada yazılı.

**Ölçüm izi temizlendi:** başlangıçta `medisea:` anahtarı **0**'dı, ölçüm
sonunda da **0** (tüm `localStorage` boş). Tohumlanan altı anahtarın altısı da
silindi.

### "ALTI YER" değişmezi sınandı — altısı da senkron

Belgede yüksek riskli bir kural var: `study-backup.ts`e yeni bir depo anahtarı
eklerken **altı yeri birden** güncellemek gerekiyor, ve altıncısı (üzerine-yaz
silme listesi) "en kolay kaçan ve sessiz" olan. Kural yazılıydı ama bugünkü
durum hiç ÖLÇÜLMEMİŞTİ.

Altı depo ailesi var (`marks` · `notes` · `review` · `index` · `log` ·
`kartlar`) ve altı yerin **altısı da altısını taşıyor**:

| yer | durum |
|---|---|
| `Backup` tipi | 6 veri alanı (+ `app` · `v` · `at` meta) |
| `readAll` | 6 |
| `parseBackup` | 6 |
| `applyImport` birleştirme | 6 |
| **`VERİ_ONEKI` silme listesi** | 6 — `[MARK_PREFIX, NOTE_PREFIX, REVIEW_KEY, INDEX_KEY, LOG_KEY, KART_PREFIX]` |
| `write` | 6 |

Değişmez sağlam.

#### Ölçüm tuzağı — TANIMLAYICIDA Türkçe karakter, ve tam o değişmezi koruyan yerde

Taramam altı yerin BEŞİNİ buldu, altıncısını bulamadı. Sebep kusur değil,
ölçütün kendisiydi: sabitin adı **`VERİ_ONEKI`** ve içindeki **İ** Türkçe
noktalı büyük I. ASCII desenim (`VERI_ONEKI`) hiç tutmadı ve rapor "silme
listesi bulunamadı" dedi — yani **doğrulanamayan bir yer, kusurlu bir yer gibi
göründü.**

Belgede Türkçe karakter tuzağı defalarca kayıtlı ama hep **kullanıcıya görünen
METİN** için (`ağır` → "AĞIRLIK", `paylaş` → `/paylaş/i`, `Remisyon`.toUpperCase()).
Bu yeni: tuzak **KAYNAK KODUNUN kendisinde** de var.

**Kapsam ölçüldü ve DAR — sayılabilir:** dizeler, şablon dizeleri, yorumlar ve
JSX metin düğümleri boşaltıldıktan sonra, 522 dosyada Türkçe karakter taşıyan
**yalnızca 4 tanımlayıcı bildirimi** var:

| tanımlayıcı | dosya |
|---|---|
| `VERİ_ONEKI` | `app/lib/study-backup.ts` |
| `branslı` | `app/(site)/tekrar/page.tsx` |
| `görünür` | `app/components/ReadingTools.tsx` |
| `mı` | `app/kayit/page.tsx` |

Yani tehlike gerçek ama sınırlı: ASCII-only bir tarama tam olarak bu dördünü
kaçırabilir. **İronisi kayda değer — o dördünden biri, belgenin "en kolay
kaçan" dediği değişmezi koruyan sabitin ta kendisi.**

**Ölçüt de iki kez daraltıldı:** ilk sürüm 2619 "tanımlayıcı" buldu ve liste
okunamazdı — çünkü JSX METİN DÜĞÜMLERİNİ (tırnaksız Türkçe kelimeler: "için",
"göre", "yüksek") tanımlayıcı sanıyordu. Dizeleri boşaltmak yetmiyor; JSX'te
metin tırnaksız duruyor. `>…<` arası boşaltılıp yalnızca BİLDİRİM konumları
(`const`/`let`/`function` ardı) sayılınca 2619 → **4** oldu.

### Üreteç bayatlaması sınandı — üç indeks de TAZE, ve çıkmaz sokak 9'dan 2'ye inmiş

Belgede kayıtlı risk: **üreteç betikleri CI'da çalışmıyor**, yani biri araç ya
da konu ekleyip betiği unutursa indeks sessizce bayatlıyor. Bugünkü durum
ölçüldü — üçü de taze:

| üreteç | ölçüm | sonuç |
|---|---|---|
| `arac-metadata.cjs --kontrol` | yazmadan karşılaştırır | **senkron (130 araç)** |
| `baslik-index.cjs` | yeniden üretildi, `git diff` | **fark 0** (13 branş · 410 başlık) |
| `ilgili-index.cjs` | yeniden üretildi, `git diff` | **fark 0** (410 konu · 1196 bağ) |

"Yeniden üret ve farkı say" ölçütü burada güçlü: `--kontrol` kipi olmayan bir
üreteçte bile bayatlığı kanıtlayabiliyor ve hiçbir şeyi bozmuyor.

#### Çıkmaz sokak sayısı ölçüldü: **410 konunun 2'si**

`ilgili-index` raporu "ilgilisi HİÇ olmayan: 2" diyor. Belgedeki kural gereği
tek yola bakmak yetmez — **ilgili · çocuk · ebeveyn** üçü birden ölçüldü:

| konu | branşta konu | çocuk | ebeveyn | ilgili |
|---|---|---|---|---|
| `genel-dahiliye/lenfadenopati-yaklasimi` | 2 | 0 | yok | yok |
| `journal-club/journal-club` | 5 | 0 | yok | yok |

Yani ikisi de **gerçek çıkmaz**: sayfadan ileri giden hiçbir iç bağ yok, yalnızca
branş sayfasından gelinip orada kalınıyor. İkisi de branş düzeyinde giriş
konusu (biri "Journal Club Ana Sayfası"), yani şaşırtıcı değil.

**Bu sayı belgede bir dönem 9'du.** İçerik büyüdükçe ve üretecin yedekleri
(kardeş → branş içi son çare) devreye girdikçe 2'ye inmiş: bu turda 64 konu
kardeş yedeğiyle, 34 konu branş içi son çareyle kapanmış. **Kendini onaran
okuma mimarisi ölçülebilir biçimde iş görüyor.**

Kalan 2 bir KOD kusuru değil içerik kararı: ikisi de etiket taşıyor ama
branşlarında akrabalık kuracak komşu yok (`genel-dahiliye` toplam 2 konu).

**Ölçüm tuzağı — `hidden` alanı İÇ İÇE.** İlk sayımım 456 görünür konu dedi,
oysa doğru sayı 410. Sebep: ben `j.hidden`e baktım, üreteç ise
**`v?.meta?.hidden === true`**'ya bakıyor. Bir görünürlük ölçütünü yeniden
yazma — **üretecin kendi ölçütünü OKU**, yoksa 46 konuluk bir sapma sessizce
rapora giriyor.

### Branş gezinmesi uçtan uca ölçüldü — ve ilk raporum 13 SAHTE kusur üretecekti

Üç ölçüt sırayla sürüldü; üçü de temiz, ama üçüncüsü önce yanlış okundu.

**1) Bütün branşlar hub'dan bağlı.** `/topics` sayfasında **13 branşın 13'ü**
de bağlantılı — küçük olanlar dâhil (`journal-club` 5 konu, `genel-dahiliye`
2 konu). Yani hiçbir branş yalnızca aramadan ulaşılabilir değil.

**2) Branş kırılımları toplamı TAM 410** — ve bu üç bağımsız yoldan aynı:

| kaynak | sayı |
|---|---|
| dosya sistemi (`meta.hidden !== true`) | 410 |
| `ilgili-index.cjs` raporu | 410 |
| canlı `/topics` kartlarının toplamı | **410** |

Kırılım: endokrinoloji 116 · hematoloji 79 · nefroloji 47 · kardiyoloji 35 ·
enfeksiyon 35 · gastroenteroloji 34 · onkoloji 29 · romatoloji 11 ·
klinik-nütrisyon 9 · journal-club 5 · palyatif 5 · göğüs 3 · genel-dahiliye 2.

**3) Branş SAYFASI kaç konu listeliyor — burada neredeyse 13 sahte kusur
raporlanacaktı.**

İlk ölçüm sunucu HTML'indeki konu bağlantılarını kart sayısıyla karşılaştırdı
ve **13 branşın 13'ünde "sapma"** buldu (endokrinoloji 18 ≠ 116, romatoloji
1 ≠ 11). Durduran şey sayının kendisi oldu: **18**, belgede kayıtlı sayının
birebir aynısı — *"branş sayfası yalnızca ÜST DÜZEY konuları listeliyor
(endokrinolojide 18 bağlantı) artı yetimler için 'Diğer Konular'."*

Doğru ölçüt uygulanınca **13/13 TAM UYUYOR**:

| branş | üst düzey | yetim | toplam | sayfada |
|---|---|---|---|---|
| endokrinoloji | 10 | 8 | 18 | **18** |
| gastroenteroloji | 2 | 13 | 15 | **15** |
| hematoloji | 7 | 8 | 15 | **15** |
| kardiyoloji | 3 | 9 | 12 | **12** |
| nefroloji | 9 | 2 | 11 | **11** |
| klinik-nütrisyon | 1 | 5 | 6 | **6** |
| öteki 7 branş | — | 0 | = üst düzey | uyuyor |

Sapma: **0**. Toplam yetim 45 (belgede `asili-denetim` 46 diyor; içerik
değiştiği için ölçüm anına ait bir fark).

Yani sayfa sayısı ne eksik ne fazla: **üst düzey + "Diğer Konular"**. Kendini
onaran okuma tam olarak ilan edildiği gibi çalışıyor.

**AYNI HATA ÜÇÜNCÜ KEZ: sayı doğruydu, SEBEBİ uydurmuştum.** Daha önce
`/tools`ta "133 = 130 + 3 gezinme" (gerçek sebep çapraz listeleme) ve
"ToolShare 130/130" (grep içe aktarmayı sayıyordu). Şimdi "branş sayfası 116
konu listelemeli" — hiçbiri ölçülmüş değildi, üçü de varsayımdı.

**Kural sertleşiyor: bir sayıyı karşılaştırmadan önce, karşılaştırdığın iki
şeyin AYNI ŞEYİ saydığını kanıtla.** Bu depoda kart sayacı "branştaki tüm
konular"ı, sayfa bağlantısı ise "hiyerarşinin üst düzeyi + yetimler"i sayıyor;
ikisi farklı büyüklük ve ikisi de doğru.

### Satış sayfası ↔ premium panosu — belgedeki 362↔352 kusuru KAPALI kalmış

Belgede kayıtlı gerçek bir kusur var: *"Satış sayfasının üst yazısı '362 soru'
derken sayfanın kendi panosu '352' diyordu."* Düzeltilmişti ama **bugünkü
durum hiç ölçülmemişti.**

İki yüzey karşılaştırıldı ve **birebir aynı**:

| büyüklük | `/uyelik` | premium panosu |
|---|---|---|
| başlık / hazır konu | **41** | **41** (41/58) |
| soru | **378** | **378** |

Panonun üst bilgisi: *"Genel ilerleme %71 · Hazır konu **41/58** · Toplam soru
**378**"* — ve %71 = 41/58 aritmetiği de tutuyor.

**Kırılımlar da toplamı tutuyor** — panonun kendi 9 branş kartı:

| ölçüt | kırılım toplamı | üst bilgi |
|---|---|---|
| hazır konu | **41** | 41 |
| toplam konu | **58** | 58 |
| soru | **378** | 378 |

Branş başına soru: 86 · 29 · 55 · 48 · 50 · 50 · 20 · 10 · 30 = **378**.

**DÖRT bağımsız yol aynı sayıyı veriyor:** dosya sistemi (388 toplam − 10 yetim
= 378, önceki turda ölçüldü) · `/uyelik` metni · pano üst bilgisi · panonun
branş kırılımı. Araç sayısı da tutuyor: `/uyelik` "130 skor", hub 130.

**Ölçüm notu — sunucu HTML'i bu karşılaştırma için YETMEZ.** Pano çoğunlukla
istemcide çiziliyor: sunucudan gelen gövde 1453 karakter ve içinde ne 41 ne
378 var; ilk ölçümüm oradan "konu 16, soru 10" gibi MODÜL düzeyi sayılar
çıkardı ve iki yüzey uyuşmuyor gibi göründü. Sayfa istemcide okununca gerçek
üst bilgi çıktı.

Bu, belgedeki *"sunucu HTML'inde `<h1>` say"* kuralının sınırı: o ölçüt
sayfanın SUNUCUDA basılıp basılmadığını sorar, İÇERİĞİN TAMAMINI değil.
**İki yüzeyin sayısını karşılaştırırken ikisini de AYNI katmanda oku.**

### Premium branş sayfaları kendini ANA SAYFANIN KOPYASI ilan ediyordu

Panonun (`ydus/page.tsx`) metadata bloğunda uzun bir gerekçe duruyor: *"Bu
sayfanın kendi metadata'sı OLMAK ZORUNDA. Yoksa kök düzenin
`alternates: { canonical: "/" }` değerini miras alıyor ve … arama motoruna
'ben ana sayfanın kopyasıyım' diyor — canlıda tam olarak bu oluyordu."*

Kusur **panoda düzeltilmiş, kardeş rotalarda kalmıştı.** Canlıda ölçüldü:

| yol | `<title>` | canonical |
|---|---|---|
| `/tr/premium/ydus` (pano) | YDUS Hazırlık — Dahiliye · MediSea | kendi adresi ✓ |
| `…/endokrinoloji` · `…/hematoloji` … (9 branş) | **sitenin genel başlığı** | **ana sayfa** ✗ |
| `/tools/glim` (kıyas) | GLIM Kriterleri — … | kendi adresi ✓ |

İki ayrı bedel vardı:

1. **Canonical** — dokuz branş sayfası da kendini ana sayfanın kopyası ilan
   ediyordu (belgede kayıtlı sınıfın birebir tekrarı).
2. **Başlık** — her sayfanın `<h1>`i AYRI (Endokrinoloji · Tıbbi Onkoloji ·
   Göğüs Hastalıkları…) ama sekme, yer imi ve paylaşım başlığı ayırt
   edilemiyordu. Ücretli yüzeyde üç sekme açan kullanıcı üçünü de aynı
   görüyordu.

**Çare panonun kendi kalıbı** — sayfa sunucu bileşeni olduğu için layout
gerekmedi, `generateMetadata` doğrudan eklendi ve başlık/açıklama `<h1>` ile
**AYNI kaynaktan** (`veri.meta`) türüyor, yani ikinci bir gerçeklik yok.
`openGraph` bilerek TANIMLANMADI — panodaki not: burada tanımlanırsa kökteki
dosya tabanlı paylaşım görseli miras alınmayı bırakır.

**Doğrulama, biri negatif kontrol:**

| yol | başlık | canonical | og:image |
|---|---|---|---|
| `/endokrinoloji` | **Endokrinoloji — YDUS · MediSea** | kendi adresi | **var** |
| `/onkoloji` | **Tıbbi Onkoloji — YDUS · MediSea** | kendi adresi | var |
| `/gogus-hastaliklari` | **Göğüs Hastalıkları — YDUS · MediSea** | kendi adresi | var |
| `/hematoloji` · `/nefroloji` | kendi adları | kendi adresi | var |
| **negatif** — `/tr/premium/ydus` (pano) | **değişmedi** | değişmedi | var |
| olmayan branş | 404 · genel başlık | — | — |

`og:image`in durması kritik: panodaki uyarı gereği `openGraph` tanımlanmadı ve
kök görsel mirası korundu.

#### AÇIK MADDE — beş rota daha aynı durumda, ve layout ÇARESİ GÜVENLİ DEĞİL

Kırpmadan ölçüldü: `/tr/premium` · `/tr/premium/ydus/profil` ·
`…/liderlik` · `…/inciler` · premium KONU sayfaları — beşi de sitenin genel
başlığını ve `canonical: "/"`yi taşıyor.

En değerlisi **`/tr/premium`**: `robots.ts` yalnızca `/premium` ve
`/*/premium/ydus/` kalıplarını yasaklıyor, yani `/tr/premium` **taranabilir**
ve kendini ana sayfanın kopyası ilan ediyor.

**Ama kolay çare BOZAR.** Sayfa `"use client"` olduğu için metadata layout'a
konmalı; oradaki tek layout (`[lang]/premium/layout.tsx`) `ydus/` altının
TAMAMINI da sarıyor. Oraya `canonical: "/tr/premium"` koymak, kendi
canonical'ı olmayan bütün ydus alt sayfalarına o iddiayı yayardı — bir yanlış
canonical'ı başka bir yanlışla değiştirmek. **Ölçüldü, gerekçesi yazıldı,
DEĞİŞTİRİLMEDİ.**

**Ölçüm tuzağı — KENDİ KIRPMAM iki kez sahte "eksik" üretti.** `h.slice(0, 8000)`
ve `slice(0, 12000)` ile okuyunca beş rota "title yok, canonical yok" çıktı.
Sebep: bu sayfalarda `<title>` **13621.** karakterde. Dilim kaldırılınca hepsi
göründü. Belgedeki *"ekrana basmak için kırptığın değeri ölçüme GERİ VERME"*
kuralının HTML tarafı — ve bu tur onsuz beş sahte kusur raporlanacaktı.

### Premium konu sayfaları da kendi başlığını aldı — ve DÖRT KAPININ GÖREMEDİĞİ bir kusur sınıfı çıktı

Geçen turun açık maddesi kapatıldı: kalan premium rotalarının **beşi de sunucu
bileşeni sanılmıştı**, ikisi değildi.

**Düzeltilenler** (kendi `generateMetadata`/`metadata`'sı, canonical kendi
adresi, `openGraph` bilerek yok):

| rota | başlık |
|---|---|
| `[branch]/[topic]` (~41 konu) | `veri.meta.baslik` — `<h1>` ile AYNI kaynak |
| `inciler` | **İnciler — YDUS · MediSea** |
| `hizli-tekrar` | Hızlı Tekrar — YDUS |

Ölçüldü: `…/romatoloji/sle` → **"Sistemik Lupus Eritematozus (SLE) — YDUS ·
MediSea"**, `…/nefroloji/iga-nefropatisi` → **"IgA Nefropatisi — YDUS ·
MediSea"**; ikisinde de canonical kendi adresi ve **og:image duruyor**.
Negatif kontrol: pano değişmedi.

#### `metadata` bir İSTEMCİ bileşeninden dışa aktarılınca üç kapı da SUSUYOR

`profil` ve `liderlik`e de metadata eklendi ve **üç kapı da geçti** — lint
temiz, typecheck temiz, derleme temiz. Ama sayfalar açılınca:

```
/tr/premium/ydus/profil     500
/tr/premium/ydus/liderlik   500
/tr/premium/ydus/inciler    500   ← saglam olan da kardesinden SICRADI
```

Sebep: ikisi de `'use client'` ve bir istemci bileşeni `metadata` dışa
aktaramaz. **Bu, `lint`/`typecheck`/`build` üçünün de göremediği bir sınıf** —
belgedeki "kusur kodda değil veride" ailesinin çalışma zamanı akrabası. Tek
gösteren şey sayfayı AÇMAK oldu.

**Kendi kontrolüm neden kaçırdı: `head -1`.** Bu depoda dosyalar mutlak yol
yorumuyla başlıyor, `'use client'` İKİNCİ satırda:

```
// "C:\Users\...\profil\page.tsx"
'use client';
```

Bir yönerge ararken ilk satıra bakmak yetmez — **ilk birkaç satırı** tara.

Üçüncü ders: **bozuk bir rota kardeşini de düşürdü.** `inciler` doğru
yazılmıştı ama aynı ölçümde 500 verdi; sıçrama olduğu ancak bozuk ikisi geri
alındıktan sonra görüldü. Bir toplu değişiklikte 500 alırsan, önce **hangi
dosyanın** bozuk olduğunu ayrıştır — hepsini suçlama.

İkisi temiz hâline döndürüldü (kalan tek fark bir boş satırdı, o da geri alındı).

#### AÇIK MADDE — üç istemci rotası hâlâ genel başlıkta

`profil` · `liderlik` · `/tr/premium` istemci bileşeni; metadata ancak bir
`layout.tsx` ile verilebilir. Geçen turda yazılan çekince aynen geçerli:
`[lang]/premium/layout.tsx` `ydus/` altının TAMAMINI sarıyor, oraya canonical
koymak yanlış iddiayı bütün alt sayfalara yayardı. Her rotaya AYRI `layout.tsx`
açmak doğru çare ama üç yeni dosya demek — ölçüldü, gerekçesi yazıldı,
bu turda YAPILMADI.

### Premium metadata sınıfı KAPANDI — 11 rotanın 11'i, ve sıralama zorunluydu

Önceki iki turda 9 branş + konu sayfaları + `inciler`/`hizli-tekrar`
düzeltilmişti. Bu turda kalan altısı kapatıldı ve **rota sayımı önce
eksikti**: `os.walk` ile tam liste çıkarılınca üç rota daha göründü —
`quiz-coz` · `soru-cozum` · `vaka-coz`, üçü de SUNUCU bileşeni ve metadata'sız.

> **Ölçüm notu:** `glob("**/page.tsx")` bu ağaçta SIFIR sonuç verdi, çünkü yol
> `[lang]` içeriyor ve glob köşeli parantezi KARAKTER SINIFI sanıyor. Boş
> sonuç bir bulgu değil, ölçütün sınanması gereken bir durumdur.

| rota | çare | başlık |
|---|---|---|
| `quiz-coz` · `vaka-coz` · `soru-cozum` | doğrudan `metadata` | Soru Çöz · Vaka Çöz · Soru Çözüm Kokpiti |
| `profil` · `liderlik` | **ayrı `layout.tsx`** (istemci bileşeni) | Profil · Liderlik Tablosu |
| `/tr/premium` | ortak `[lang]/premium/layout.tsx` | Premium — Dahiliye YDUS |

#### Sıralama olmadan son adım YAPILAMAZDI

`/tr/premium` bir istemci bileşeni ve tek layout'u `ydus/` altının TAMAMINI
sarıyor. Önceki turda buraya canonical koymak bilerek reddedilmişti: kendi
metadata'sı olmayan her alt sayfaya yanlış iddia yayılırdı.

Bu tur önce **on ydus rotasının onuna da kendi metadata'sı verildi**; ancak
ondan sonra ortak layout güvenli hâle geldi — alt sayfalar kendi değerleriyle
EZİYOR. Doğrulandı: pano, profil, branş ve konu sayfaları kendi canonical'ını
koruyor.

#### İKİNCİ YAN ETKİ, ölçümle yakalandı: düz dize başlık ŞABLONU ÖLDÜRÜYOR

Layout'a `title: "Premium — Dahiliye YDUS"` (düz dize) konunca kökün
`template: "%s · MediSea"` kuyruğu bu ağaç için DEVRE DIŞI kaldı:

| yol | düz dize ile | şablon geri verilince |
|---|---|---|
| pano | "YDUS Hazırlık — Dahiliye" | **"YDUS Hazırlık — Dahiliye · MediSea"** |
| `/tr/premium` | "MediSea Premium · MediSea" (tekrar) | **"Premium — Dahiliye YDUS · MediSea"** |

Çare `title: { default, template }`. **Bir layout'a başlık koyarken alt
sayfaların başlığına ne olduğunu da ölç** — düz dize sessizce kuyruğu siliyor.

**Doğrulama, üçü negatif kontrol:**

| yol | başlık | canonical | og:image |
|---|---|---|---|
| `/tr/premium` | Premium — Dahiliye YDUS · MediSea | kendi | var |
| **negatif** — pano | YDUS Hazırlık — Dahiliye · MediSea | kendi | var |
| **negatif** — `/profil` | Profil — YDUS · MediSea | kendi | var |
| **negatif** — `…/romatoloji/sle` | Sistemik Lupus Eritematozus (SLE) — YDUS · MediSea | kendi | var |
| `/liderlik` · `/quiz-coz` · `/vaka-coz` | kendi adları | kendi | var |

`soru-cozum` ve `hizli-tekrar` parametresiz **404** veriyor (rota set kimliği
istiyor) — bu değişiklikten önce de öyleydi.

**Sonuç:** premium ağacındaki **11 rotanın 11'inde** kendi başlığı ve kendi
canonical'ı var; hiçbiri artık kendini ana sayfanın kopyası ilan etmiyor.

### PAYLAŞIM KARTI, SEKME BAŞLIĞINDAN AYRI BİR YÜZEY — 620 sayfa ana sayfayı ilan ediyordu

Bir önceki tur premium rotalarının `<title>` ve `canonical` değerlerini
düzeltip **"hiçbiri artık kendini ana sayfanın kopyası ilan etmiyor"** dedi.
İDDİA YANLIŞTI ve ölçümle çürütüldü: sekme başlığı düzelmişti,
**paylaşım kartı düzelmemişti.**

| yüzey | premium konu sayfasında (önce) |
|---|---|
| `<title>` | "Sistemik Lupus Eritematozus (SLE) — YDUS · MediSea" ✓ |
| `canonical` | kendi adresi ✓ |
| **`og:title`** | **"MediSea — Dahiliye için Türkçe klinik kaynak"** |
| **`og:url`** | **`/`** |

Yani öğrenci arkadaşına bağlantı attığında kart hâlâ ana sayfayı anlatıyordu.
Deponun kendi kuralı ("bir düzeltmeyi yaptığın yüzey, o iddianın geçtiği tek
yüzey olmayabilir") kuralı yazan tur tarafından çiğnendi.

#### Daha geniş bulgu: `twitter:*` SİTENİN TAMAMINDA sabit yazılıydı

Kök layout `twitter: { card, title, description }` tanımlıyordu ve **hiçbir
alt layout `twitter` tanımlamıyor** (sayıldı: 1 dosya). Miras olduğu gibi
indiği için sitenin her sayfası X'e ana sayfanın başlığını ve açıklamasını
gönderiyordu — konu sayfaları, araçlar, `/uyelik` dahil.

Ölçüldü (canlı): `og:title` "Addison Hastalığı…" iken `twitter:title`
"MediSea — Dahiliye için Türkçe klinik kaynak".

#### ÇÖZÜM ÜÇ TURDA BULUNDU — ve ilk iki turun ikisi de kusur ÜRETTİ

**1. tur — sayfa başına `openGraph` yaz.** 11 premium rotası `rotaMeta`
yardımcısına bağlandı, altı `noindex` rotaya da eklendi. Başlıklar düzeldi.
**Negatif kontrol kusuru yakaladı: 12 sayfada `og:image` KAYBOLDU** (premium
branş sayfalarının dokuzu + `/tekrar` + `/calisma-alanim` + `/guidelines`).
Kart görselsiz kalıyordu.

Yani silinen yorumun iddiası (*"openGraph tanımlanırsa dosya tabanlı görsel
mirası kesilir"*) **DOĞRUYDU**; ben onu "çürüttüm" sanmıştım. Çürütme sandığım
ölçüm `/tools/bmi`ye bakıyordu ve orada görsel korunuyor — çünkü görsel dosyası
ARA bir segmentte (`app/tools/`) ve o segment de kendi `openGraph`'ını
tanımlıyor. Tek bir örnekten kural çıkarmak, örneğin neden istisna olduğunu
sormadan yapıldığında yanlış kural üretiyor.

**2. tur — kökün `openGraph.title`'ını kaldır.** Ayırt edici ölçüm, kendi
`openGraph`'ı **HİÇ OLMAYAN** bir sayfaya bakmak oldu (`/admin/*`):

| ölçüt | sonuç |
|---|---|
| `og:title` | sayfanın KENDİ başlığı ("Yönetim · MediSea") |
| `og:description` | sayfanın KENDİ açıklaması |
| `og:image` | **yerinde** |
| `og:url` | türemiyor (yok) |

Yani Next `og:title`/`description` değerlerini `title`/`description`'dan
TÜRETİYOR. Sayfa başına yazmak hem gereksiz hem zararlı.

**3. tur — uygulanan çözüm:**

| yer | ne yapıldı |
|---|---|
| kök `openGraph` | `title`/`description`/`url` KALDIRILDI, `type`/`siteName`/`locale` kaldı |
| kök `twitter` | `title`/`description` KALDIRILDI, `card` kaldı |
| `rotaMeta` | yalnızca `title` + `description` + `canonical` üretiyor, `openGraph` ÜRETMİYOR |
| altı `noindex` rota | kendi canonical'ı + kendi açıklaması |
| `not-found.tsx` | `canonical: null` (bir 404'ün canonical'ı OLAMAZ) |

#### `noindex` + BAŞKA sayfayı gösteren canonical — ayrı bir çelişki

Kendi canonical'ı olmayan 24 rota sayıldı; altısı herkese açık
(`/giris` `/kayit` `/profile` `/tekrar` `/calisma-alanim` `/guidelines`).
Altısı da `noindex` taşıyor VE kökten `canonical: "/"` miras alıyordu.

Bu bilinen bir çelişki sinyali: **noindex, canonical hedefine taşınabilir** —
ve buradaki hedef sitenin ANA SAYFASIYDI. Aynı şekil 404'te daha geniş:
`not-found` tek bir adreste değil **her kırık adreste** çiziliyor, yani
kendini gösteren bir canonical yazılamaz; doğru olan hiç yazmamak.

#### Doğrulama — üretilmiş çıktının TAMAMI, altı ölçüt

584 HTML (admin ve kayseritip dahil) tarandı:

| ölçüt | sonuç |
|---|---|
| `og:title` ana sayfa kimliği taşıyan | **0** (önce 620'ye yakın) |
| `twitter:title` ana sayfa kimliği taşıyan | **0** |
| **`og:image` kayıp** | **0** ← 1. turdaki gerileme kapandı |
| `twitter:card` eksik | 0 |
| başlık kuyruğu (`· MediSea`) eksik | 0 |
| canonical kendi yolunu göstermeyen | 10, hepsi `/admin/*` (robots'ta yasaklı, kapı arkasında) |

**Negatif kontrol — dokunulmayan yüzeyler birebir aynı:** ana sayfa
(`index, follow`, kendi başlığı), `/tools/bmi`, `/uyelik`, `/topics`,
`/topics/…/addison` — beşinde de canonical, başlık ve görsel değişmedi.

#### Aktarılabilir üç kural

1. **Sekme başlığı ile paylaşım kartı AYRI yüzeylerdir.** Birini ölçüp
   ötekini "düzeldi" saymak bu turda bir tam tur kaybettirdi.
2. **Bir inancı tek örnekle çürütme.** `/tools/bmi` görselini koruyordu ama
   İSTİSNAYDI; kuralı bulmak için istisnanın NEDEN istisna olduğunu sormak
   gerekti.
3. **Bir alanın miras davranışını ölçmenin doğru yeri, o alanı HİÇ
   TANIMLAMAYAN sayfadır.** `/admin/*` bu turda kuralı tek başına verdi.

#### Yüzde-kodlu canonical SAPMA DEĞİL

Tarama beş konuyu "canonical sapıyor" diye işaretledi
(`men1-menin-lösemi-onkojen`, `ascit-sıvısı`, `FGF-23 vs PTH`…). Sahteydi:
`yolKodla()` adresi doğru biçimde yüzde-kodluyor, ölçüt ham dosya adıyla
karşılaştırıyordu. Karşılaştırmaya `urllib.parse.quote` konunca 5 → 0.

### CI 97 KOŞUMDUR KIRMIZI — ve ben her turda "dört kapı geçti" diyordum

Bu oturumda her tur `lint` · `typecheck` · `build` çalıştırılıp "kapılar
geçti" raporlandı. **CI'a hiç bakılmadı.** Bakıldığında:

```
son 100 koşum: 97 başarısız, 0 başarılı
en eski koşum: 24 Ağustos 05:03  ->  kapı 1,5 GÜNDÜR kırmızı
```

Sebep basit ve keskin: **CI üç adım değil, ON BEŞ adım çalıştırıyor.**
`npm ci` · lint · typecheck · `link-denetim` · `soru-denetim` · üç indeks
`--kontrol`ü · `arayuz` · `ic-bilesen` · `saydamlik` · `renk-cifti`
(negatifleriyle) · en sonda `build`. Düşen adım **`ilgili-index --kontrol`**
ve o build'den ÖNCE geliyor — yani CI'da derleme hiç çalışmamış.

Deponun kendi kuralının ("kapı arkasını görmeyen ölçüm 'temiz' DEMEZ")
kapının kendisine uygulanmış hâli: bir kapının bir bölümünü ölçüp
"kapı geçti" demek, kapıyı ölçmek DEĞİL.

**Ölçüt: kapı senin çalıştırdığın komut değil, CI'ın çalıştırdığı komuttur.**
`.github/workflows/ci.yml` içindeki adımları say; eksik çalıştırdığın her
adım, sana yeşil görünen bir kırmızıdır.

#### Kusur: üreteç PLATFORMA BAĞLI çıktı üretiyordu

Yerelde 13 denetimin 13'ü de geçiyordu; CI'da aynı commit'te
`ilgili-index --kontrol` "BAYAT — 7 konu değişmiş" diyordu. Aynı dosya, aynı
commit, farklı sonuç.

Sebep `konulariTopla()` içindeki iki `readdirSync`: sıraları **işletim
sistemine bağlı** (Windows alfabetik, Linux dizin sırası). Skor eşitliğinde
sıralama bu listeden geldiği için iki platform FARKLI indeks üretiyordu.

**Hipotez tahminle değil deneyle sınandı:** `fs.readdirSync` sarmalanıp sırası
TERSİNE çevrildi ve üreteç `--kontrol` kipinde sürüldü. Sonuç, neredeyse her
konunun listesinin değiştiğini gösterdi — yani bağımlılık marjinal değil,
yapısal.

Dört nokta belirlenimci yapıldı:

| yer | önce | sonra |
|---|---|---|
| branş dizini okuma | `readdirSync(...)` | `.sort()` |
| konu dosyası okuma | `readdirSync(...)` | `.sort()` |
| skor sıralaması (katı kural) | `b[1] - a[1]` | `… \|\| anahtar karşılaştırması` |
| skor sıralaması (son çare) | `b.s - a.s` | `… \|\| anahtar karşılaştırması` |
| anahtar sırası | `localeCompare` | kod noktası |

`localeCompare` bilerek KULLANILMADI: o çalışma zamanının yerel ayarına
bağlı ve düzeltilmek istenen sınıfın ta kendisi. Betiğin kendi yorumu bunu
anahtar sırası için zaten biliyordu (`--kontrol` anahtar sırasını yok
sayıyor) — ama DEĞER dizilerinin sırası için bilmiyordu ve kapıyı düşüren
tam olarak o oldu.

**Negatif kontrol, düzeltmenin kendisini sınayan biçimde kuruldu:** aynı ters
`readdirSync` deneyi ve ayrıca KARIŞIK (sözde rastgele) sıra denendi.

| ölçüm | sonuç |
|---|---|
| normal | senkron (408 konu, 1196 bağ) |
| **readdir TERSİNE** | **senkron** |
| **readdir KARIŞIK** | **senkron** |

**Pozitif kontrol:** bir konunun bağ listesi elle ters çevrildi (aynı küme,
farklı sıra) → denetim "değişmiş: endokrinoloji/addison" dedi. Yani sıraya
duyarlılık korunuyor, yalnızca kaynağı belirlenimci oldu.

#### Değişimin kapsamı ölçüldü — "aynı sayı" yetmez, KÜME karşılaştırıldı

Yeniden üretilen indeks 680 satır oynadı. Bunun içerik kaybı olmadığı
ayrıca kanıtlandı:

| ölçüt | sonuç |
|---|---|
| anahtar sayısı | 408 → 408, küme aynı |
| bağ **kümesi** aynı kalan konu | **400** (bunların 29'unda yalnızca sıra değişti) |
| bağ kümesi değişen | 8 — eşitlik tam `slice(0, EN_FAZLA)` kesme noktasında |
| **toplam bağ** | **1196 → 1196** |

Sekiz konuda bir bağ diğeriyle yer değiştirdi; ikisi de skor olarak EŞİT
adaydı, yani seçim eskiden dosya sistemine bırakılmıştı. Artık anahtar
sırası karar veriyor.

#### Kardeş üreteç de aynı sınıftaydı ama DÜŞEMEZDİ

`baslik-index.cjs` de sırasız `readdirSync` kullanıyor. Ölçüldü: ters
sırayla üretilen dosya **bayt bayt aynı** çıkıyor, çünkü anahtarlar
yazılmadan önce sıralanıyor ve değerler dizi değil dize. Yani o betik
readdir sırasından etkilenmiyor ve `--kontrol`ü içerik karşılaştırdığı için
CI'ı asla düşürmez.

Yine de anahtar sıralaması `localeCompare` idi — yerel ayara bağlı. Ölçüldü:
410 anahtarın **95'i** kod noktası sırasına göre yer değiştiriyor. Bugün bir
kusur üretmiyor ama `ilgili-index`e "dosya da platformdan bağımsız olmalı"
diye yazıp burada yazmamak iki dosyayı ilkede çeliştirirdi. Kod noktasına
çevrildi; içerik değişmediği ölçüldü (410 anahtar, küme aynı, **değeri
değişen 0**, yalnızca 95 konum yer değiştirdi, git farkı 12 satır).

#### GERÇEK LINUX'TA DOĞRULANDI — yerel taklidin öngördüğü çıktı

Düzeltmenin gücü yerelde ancak taklitle ölçülebiliyordu (`readdirSync`
sarmalanıp ters/karışık sıra verilerek). Gönderimden sonra CI gerçek bir
Linux'ta çalıştı:

| ölçüt | sonuç |
|---|---|
| koşum | **başarılı** — 98 koşumdur ilk yeşil |
| adım | **20/20 yeşil**, iki iş (Web + Server) |
| `ilgili-index --kontrol` | geçti — yani Linux ve Windows AYNI indeksi üretiyor |
| **Build** | **çalıştı** — düzeltmeden önce CI'da hiç sıra gelmemişti |

Son satır ayrı bir bulgu: kırmızı bir kapının arkasındaki adımlar hiç
sınanmıyor. `ilgili-index` düştüğü sürece `arayuz`, `ic-bilesen`,
`saydamlik`, `renk-cifti` ve `build` adımlarının CI'da geçtiği hiç
görülmemişti — yerelde geçiyor olmaları bir varsayımdı, artık ölçüm.

### Aynı sınıf UYGULAMADA da aranmalı — `readdirSync` sırası kullanıcıya ulaşıyor mu?

Üretecin platform bağımlılığı bulunduktan sonra doğal soru: aynı körlük
uygulamanın kendisinde de var mı? Sıralamasız `readdirSync` kullanan
**15 dosya** sayıldı ve kullanıcıya LİSTE üretenler ayrıldı.

| yüzey | sıra nereden geliyor | verdikt |
|---|---|---|
| `/topics` branş kartları | **`SPECIALTIES` dizisi** (küratörlü) | temiz — `readdirSync` yalnızca "içeriği var mı" süzgeci |
| branş sayfası konu listesi | `order` (içerikten) → `localeCompare(…, "tr")` | temiz — yerel AÇIKÇA verilmiş, çalışma zamanına bırakılmamış |
| sayaçlar (`icerik-sayaci`, `topic-counts`) | — | sıra önemsiz, toplama giriyor |

Ayırt edici nokta ikinci satırda: `localeCompare` bu depoda iki kez kusur
üretti (indeks üreteçlerinde), ama orada **yerel verilmiyordu**. Burada
`"tr"` açıkça yazılı, yani sonuç çalışma zamanının varsayılan yereline
bağlı değil. **`localeCompare` tek başına kusur değil — yerelsiz kullanımı
kusur.**

### Ana sayfa bağlantıları ölçüldü — çapa ve kategori sapması yok

Ana sayfa hiç bu gözle taranmamıştı. Sunucu HTML'inden:

| ölçüt | sonuç |
|---|---|
| `<h1>` · `<h2>` · `<h3>` | 1 · 3 · 15 |
| iç bağlantı | 31 (varlıklar hariç) |
| sayfa içi çapa (`#icerik`, `#branslar`) | **ikisinin de hedefi VAR** |
| `?kategori=` değerleri | 6 tanesi de `/tools`taki 18 gerçek kategoriden biri — **sapma 0** |

Kategori sapması olsaydı bedeli belgede kayıtlı sınıf olurdu: bağlantı
çalışır ama liste BOŞ gelir.

**Marka adına DOKUNULMADI:** ana sayfanın `<h1>`i "MediSea **Akademi**" ve
"Akademi" uygulama kaynağında yalnızca o tek satırda geçiyor (`SITE_ADI`
"MediSea"). İlk bakışta tutarsızlık gibi duruyor; kaynağa bakınca bilinçli
bir tipografik kurgu (italik/düz kırılma + sarı ikinci satır). Ad kararı
ürün tarafına ait — ölçüldü, not edildi, değiştirilmedi.

### Rapor denetimleri taban değerinde — ve iki verdikt ÖLÇÜMLE yeniden sınandı

CI'daki 13 denetimin yanında CI kapısı OLMAYAN 15 rapor denetimi de sürüldü.
Hepsi belgedeki tabanda:

| denetim | değer |
|---|---|
| `konu` | 456 dosya (410 görünür) · 17 kayıt insan kararı · 7 kısa hub |
| `yetim` | 17 (3 ad sapması · 2 konusu yok · 12 okunmayan dizin) |
| `asili` | 46 (%11.2) |
| `bolme` · `bant` · `karar` · `esik-etiket` | 0 |
| `eksik-alan` | 2 · `cop-kapi` 1 · `kapi-kapsam` 2 |
| `olu` | 5 (4'ü belgede kayıtlı + `nutrition-needs` karara bağlandı) |
| `payda` | 130 araç, 34 payda ilanı, 1 sapan (`findrisc`, verdikti yazılı) |

**Bu oturumda dört araçta yuvarlama değiştirilmişti** (`pni` · `gnri` ·
`asdas` · `ktv`); `yuvarlama-denetim` **dördünü de aday göstermiyor**, yani
"bir kez yuvarla" düzeltmesi yeni bir taşma sınıfı açmamış.

**`kapi-kapsam`ın iki adayı yeniden karara bağlandı** — çünkü belgedeki
verdiktler ESKİ satır numarasına bağlıydı (`sodium:442` → bugün `488`) ve
rapor kapı dışı değişken yerine İFADE adını yazıyor (`naN` → `adrogueHyper`).
Aynı çift olduğu doğrulandı ve verdikt ölçümle sınandı:

| girdi (45 y · 170 cm · 70 kg, hipernatremi kipi) | ekranda |
|---|---|
| Na **160** | Adrogué **−3.91** mEq/L · açık **5.7 L** · **119 mL/saat** |
| Na **9999** | panel YOK · "serum Na⁺ (90–200 mEq/L)" |
| Na **abc** | panel YOK · aynı sebep |

Üç sayı da elde yeniden hesaplandı ve birebir tuttu — Watson TBW
(erkek) = 2.447 − 0.09516×45 + 0.1074×170 + 0.3362×70 = **39.96 L**:

```
açık    = 39.96 × (160/140 − 1) = 5.71   ->  ekran 5.7
Adrogué = (0 − 160) / (39.96 + 1) = −3.91 ->  ekran −3.91   (D5W, Na 0)
hız     = 5710 mL / 48 saat = 119         ->  ekran 119
```

**Ders: bir verdikti satır numarasına bağlama.** Dosya değişince numara
kayıyor ve "aynı aday mı, yeni aday mı" sorusu cevapsız kalıyor. Verdikt
DEĞİŞKEN ve İFADE adıyla yazılmalı; bu turda ikisi de değişmiş görünüyordu
ve yalnızca ölçüm ayırt etti.

### ARAMA 130 HESAPLAYICIYI HİÇ GÖRMÜYORDU — "Wells" sıfır sonuç veriyordu

Belgede aramanın Türkçe normalizasyonu, ESC'si, canlı bölgesi ve temizleme
düğmesi ölçülmüştü. Hiç sorulmamış soru şuydu: **arama NEYİ arıyor?**

Ölçüldü (canlı):

| sorgu | sonuç |
|---|---|
| **Wells** | **0** — oysa sitede `wells-pe` ve `wells-dvt` VAR |
| eGFR | 3 konu, **0 araç** — `/tools/egfr` gelmiyor |
| kalsiyum | 2 konu, 0 araç |
| Addison | 5 konu (doğru) |

`searchContent` yalnızca `content/canonical` ağacını geziyordu. Yani sitenin
en büyük varlığı olan 130 hesaplayıcı, sitenin kendi aramasında **görünmez**.

"Wells" vakası en keskini: kullanıcı iki Wells hesaplayıcısı olan bir sitede
"Wells" yazıyor ve **"Sonuç bulunamadı"** görüyor — yani ona SAHİP OLDUĞUMUZ
şeyin olmadığı öğretiliyor. Bu, deponun `/api` turunda kayıtlı *"uydurulmuş
bir başarı yanlış varsayım üretir"* kuralının ayna hâli: uydurulmuş bir
YOKLUK da yanlış varsayım üretiyor.

**Kaynak `content/arac-index.json`** — `app/tools` klasörü çalışma zamanında
okunamıyor (sunucusuz ortamda kaynak dizin yok, bkz. `getToolCount`); statik
JSON içe aktarımı paketleniyor.

**SIRALAMA KARARI ve gerekçesi:** adı eşleşen araç konuların ÜSTÜNE, yalnızca
açıklaması eşleşen araç ALTINA konuyor. "eGFR" yazan kişi büyük olasılıkla
hesaplayıcıyı arıyor ve etiketten eşleşen üç konunun arkasında kalmamalı.
Ters yönde risk ölçüldü: hiçbir aracın ADI "Addison" gibi konu terimleri
taşımıyor, o yüzden konu aramaları öne çıkmaya devam ediyor.

| sorgu | önce | sonra |
|---|---|---|
| Wells | 0 | **2 araç** (`wells-dvt`, `wells-pe`) |
| eGFR | 3 konu | **`/tools/egfr` İLK**, sonra aynı 3 konu |
| Addison | 5 konu | **5 konu, 0 araç** — negatif kontrol, konu araması bozulmadı |

### Aynı yüzeyde iki kusur daha — biri deponun kendi kuralını çiğniyordu

**1) Sıfır sonuçta ÇIKIŞ YOLU YOKTU.** Kart şunu diyordu: *"🤔 Sonuç
bulunamadı. Farklı bir kelime deneyin."* — ölçüldü: **sıfır bağlantı**.
Belgedeki kural açık: *"Çıkış yolu ver. Her hata kartında geri dönülecek bir
bağlantı olsun; yoksa kullanıcı çıkmazda kalır."* Artık iki çıkış var
(Kütüphane · Klinik hesaplayıcılar).

**2) AÇILIR PANELİN YÜKSEKLİK SINIRI YOKTU.** `max-height: none` ve
`overflow: hidden`. Ölçüldü — "kan" sorgusu:

| ölçüt | önce | sonra |
|---|---|---|
| sonuç | 40 | 45 (araçlarla) |
| panel yüksekliği | **6874 px** | **448 px** |
| belge yüksekliği | **6934 px** | **1676 px** |
| içten kaydırılabilir | hayır | **evet** |

Yani tek bir arama, sayfayı 9,5 ekran boyuna uzatıyordu.

### Dar ekranda panel KUTU KADAR dardı — 74 px

Araç açıklamalarını ekleyince ölçülen üçüncü sorun. 320 px'te başlık satırı
şöyle bölüşülüyor:

```
logo 80px (shrink-0) + arama 74px (flex-1) + Giriş/Üye Ol 150px (shrink-0)
```

Panel `w-full` olduğu için sonuçlar da 74 px genişlikte çiziliyordu; araç
açıklaması okunmuyor, satır 136 px'e şişiyordu. Panel mobilde görünüm
penceresine sabitlendi (`fixed left-2 right-2`), `sm` ve üstünde eski
davranış (kutuya hizalı `absolute`) aynen sürüyor.

| genişlik | panel | satır | konum |
|---|---|---|---|
| 320 px | 74 → **304 px** | 136 → **96 px** | `fixed` |
| 1280 px | **215 px, kutuya hizalı** | — | `absolute` (değişmedi) |

**Kimlik/dönüşüm düğmelerine (Giriş · Üye Ol) DOKUNULMADI** — 150 px'lik
`shrink-0` sağ grup dar ekranda arama kutusunu 74 px'e sıkıştırıyor ve bu
ölçülmüş bir kusur; ama hangi kontrolün öncelikli olduğu ürün kararı.
Ölçüm burada, karar içerik/ürün sahibinin.

**Negatif kontroller:** erişilebilir ad temiz ("Wells Skoru (DVT)Derin ven
trombozu klinik olasılığı" — glif `aria-hidden`), canlı bölge sayıyı doğru
söylüyor ("2 sonuç bulundu."), ESC hâlâ kapatıyor ve **sorguyu koruyor**,
320 px'te gerçek yatay kaydırma 0.

#### Ölçüm tuzağı: ESKİ DERLEMEYİ ölçtüm ve sağlık kontrolüm bunu gizledi

Mobil düzeltmeyi yapıp yeniden derledim, sunucuyu `pkill -f "next start"` ile
öldürüp yeniden başlattım, `curl` 200 döndü ve ölçtüm — **panel hâlâ 74 px**
çıktı. Sebep düzeltmede değildi:

- `pkill -f "next start"` süreci **öldürmedi** (gerçek süreç `node …/next
  start`), eski sunucu portu tutmaya devam etti;
- yeni örnek `EADDRINUSE` ile sessizce düştü;
- `curl`ün aldığı **200 eski sunucudan** geliyordu, yani sağlık kontrolüm
  yanlış sebeple geçti.

Ayırt eden ölçüm, panelin GERÇEK `className`ini okumak oldu: eski dize
duruyordu. **Bir düzeltmeyi ölçmeden önce, ölçtüğün sürecin o düzeltmeyi
taşıdığını doğrula** — "sunucu cevap veriyor" bunu göstermez. Ucuz kanıt:
sunulan CSS paketinin parmak izini derlemedekiyle karşılaştır
(`curl … | grep -o "/_next/static/css/[a-z0-9]*\.css"`).

#### `scrollWidth` yine sahte taşma üretti — belgedeki kural işledi

320 px ölçümünde "6 taşan öge, 23 px kayma" çıktı ve bir an gerileme sanıldı.
`23 = innerWidth(343) − clientWidth(320)`, yani belgede kayıtlı öykünme
artefaktı. Gerçek kaydırma denemesi (`scrollTo(9999,0)` → `scrollX`) **0**
verdi. İki ölçütü birlikte kullanma kuralı bu turda sahte bulguyu eledi.

#### Kapsam dışı bırakılan: arama GİZLİ konuları da döndürüyor

Ölçüldü: `searchContent` `meta.hidden` süzmüyor. "İnsidentaloma" araması
gizli bir konuyu getiriyor ve o sayfa **200** dönüp düzgün çiziliyor —
yani içerik kayıp değil, yalnızca listelerden çıkarılmış. Aramada
görünmesi kayıp değil bir POLİTİKA sorusu (gizli konu hiç bulunamasın mı,
yoksa yalnızca gezinmede mi gizlensin?). Ölçüldü, not edildi,
DEĞİŞTİRİLMEDİ.

### HER ARAMA önce YANLIŞ bir "Sonuç bulunamadı" duyuruyordu

Arama gecikmesini ölçerken beklenmedik bir şey çıktı: beş sonuçlu "Addison"
sorgusu için ölçüm "Sonuç bulunamadı." okudu. `role="status"` bölgesi zaman
içinde `MutationObserver` ile örneklenince sebep göründü:

| ms | duyurulan |
|---|---|
| 0 | (boş) |
| **8** | **"Sonuç bulunamadı."** ← arama HENÜZ BAŞLAMADI |
| 340 | "Aranıyor…" |
| 679 | "5 sonuç bulundu." |

Sebep: `setLoading(true)` 300 ms'lik geciktirmenin İÇİNDE çağrılıyor. O
pencerede `query.length >= 2`, `loading` hâlâ `false` ve `results` boş olduğu
için durum ifadesi son dala düşüyordu. Ekran okuyucu kullanan biri **her
aramada** önce yanlış bir "sonuç yok" duyuyordu.

**Çare `loading`i öne almak DEĞİL** — o, geciktirmenin amacını bozar. Elde
duran sonuçların HANGİ sorguya ait olduğu tutuluyor (`sonuclarSorgu`); sorgu
değiştiği anda sonuçlar bayat sayılıyor ve durum "Aranıyor…" oluyor.

| ölçüm | sonra |
|---|---|
| 5 sonuçlu sorgu | (boş) → **"Aranıyor…" 13 ms** → "5 sonuç bulundu." 911 ms |
| **negatif** — sıfır sonuçlu sorgu | "5 sonuç bulundu." (bayat) → "Aranıyor…" 4 ms → **"Sonuç bulunamadı." 1201 ms** |

İkinci satır belirleyici: gerçek "bulunamadı" hâlâ duyuruluyor, yani düzeltme
mesajı susturmadı — yalnızca yanlış zamanda çıkmasını engelledi.

### "866 ms sunucu" ÇIKARIMIM YANLIŞTI — isteği ölçmemiştim

Aynı turda arama gecikmesi ölçüldü: uçtan uca ortalama **1166 ms**. 300 ms
geciktirmeyi çıkarıp kalanı sunucuya atfettim ve "sorgu başına ~866 ms
sunucu" diye yazmak üzereydim. **Yanlıştı.**

`performance.getEntriesByType('resource')` ile sunucu eyleminin KENDİ isteği
ölçüldü: istek yazma anından **484 ms** sonra başlıyor ve **22 ms** sürüyor.
Yani kalan sürenin ezici çoğunluğu istemci tarafında — geciktirme, React
yeniden çizimi ve **tarayıcı paneli gizliyken kısılan zamanlayıcılar**
(belgede kayıtlı tuzak).

**Kural: bir gecikmeyi parçalara ayırırken her parçayı AYRI ölç.** Toplamdan
bilinen bir parçayı çıkarıp kalanı tek bir bileşene atfetmek, ölçüm değil
varsayımdır.

### Arama indeksi süreç ömrü boyunca bir kez kuruluyor

`searchContent` HER SORGUDA `content/canonical` altındaki 456 JSON dosyasını
açıp ayrıştırıyor, üstelik her başlığı ve etiketi yeniden normalleştiriyordu.
Deponun sayaçları (`icerikSayilari`, `getToolCount`, `envanterAl`) zaten
süreç başına bir kez hesaplanıp saklanıyor — arama o kurala uymayan tek
yüzeydi. İndeks artık bir kez kuruluyor ve normalleştirme de orada yapılıyor.

**Kazanç ORTAMA GÖRE çok farklı ve ikisi de ölçüldü:**

| ortam | 1. sorgu | sonraki sorgular |
|---|---|---|
| yerel üretim derlemesi, **önbellekli** | 34 ms (indeks kurulumu dahil) | **23–27 ms** |
| **canlı** (Vercel, önbelleksiz eski kod) | **1015 ms** (soğuk lambda) | **354–374 ms** |

Yerelde dosyalar işletim sistemi önbelleğinden geldiği için kazanç ~10 ms;
sunucusuz ortamda dosya okuma çok daha pahalı ve fark oradan gelecek. Ağ
gidiş-dönüşü canlı sayılara dahil, o yüzden iki sütun birebir kıyaslanamaz —
**canlı doğrulama dağıtımdan sonra yapılacak.**

**Davranış korunuyor:** beş sorgunun sonuç sayıları önbellekten önce ve sonra
birebir aynı (5 · 5 · 24 · 19 · 2). Sonuç SIRASI da bilerek değiştirilmedi —
bölüm kaydı kendi konularının önünde, bölümler indeksteki sırayla. Önbellek
yalnızca okumayı kaldırıyor.

> **Not edilen, DEĞİŞTİRİLMEYEN:** sonuç sırası bugün dosya sistemi sırasına
> dayanıyor (alaka düzeyine değil). Bunu değiştirmek bir ürün kararı —
> alfabetik mi, alaka düzeyi mi? Ölçüldü, yazıldı, dokunulmadı.

### ARAÇ AĞACI BİR ADAYDI — 130 hesaplayıcının hub'ından kütüphaneye SIFIR yol

Başlıktaki aramaya araçları eklerken kardeş yüzeye bakıldı: `/tools` hub'ının
KENDİ arama kutusu. O sağlam çıktı — alan adlı ("Araçlarda ara"), canlı bölge
sayıyı duyuruyor, açıklamada da arıyor ("trombozu" → 1 sonuç), sıfır durumda
"Aramayı temizle" var ve boş sorguda 130 araç geri geliyor (belgede kayıtlı
gerileme tekrar etmiyor).

Ama sayfada **tek bir input** olduğu fark edildi ve asıl bulgu oradan çıktı.
`app/tools/*` `(site)` grubunun DIŞINDA, yani AppShell almıyor. Ölçüldü
(canlı, sunucu HTML'i):

| yüzey | `<header>` | genel arama | `/topics` bağı | araç-dışı TEK bağlantı |
|---|---|---|---|---|
| `/tools` (hub) | **yok** | **yok** | **0** | `/` |
| `/tools/bmi` | yok | yok | **0** | `/` |
| `/tools/egfr` | yok | yok | 2 (branş) | `/`, iki branş |

Yani 130 hesaplayıcının giriş noktasına arama motorundan düşen bir kullanıcı
için **410 konuluk kütüphaneye tek yol ana sayfadan geçiyordu.** `/tools`ta
"Addison" arayan kişi `"Addison" için sonuç yok` + "Aramayı temizle" görüyor;
oysa o içerik sitede VAR, yalnızca başka yüzeyde. Bu, aynı turda başlık
aramasında düzeltilen sınıfın ta kendisi — **arama, sahip olduğumuz şeyin
olmadığını öğretiyor.**

Branş bağları da her araçta yok: `getToolBranchSlugs` yalnızca bir branşa
eşlenmiş araçlarda bağ üretiyor, `bmi` gibi eşlenmemiş araçlarda hiç çıkmıyor.

**Üç yere bağ kondu:** hub üst gezinmesi (📚 Kütüphane), hub sıfır durumu
("Kütüphaneye bak", "Aramayı temizle"nin yanına) ve `ToolTopNav` — sonuncusu
tek bileşenden 130 araç sayfasına birden yayılıyor.

| ölçüt | önce | sonra |
|---|---|---|
| `/tools` araç-dışı bağlantı | `/` | `/`, **`/topics`** |
| `/tools/bmi` araç-dışı bağlantı | `/` | `/`, **`/topics`** |
| `/tools/egfr` | `/` + 2 branş | `/` + **`/topics`** + 2 branş |
| hub sıfır durumu | yalnızca "Aramayı temizle" | + **"Kütüphaneye bak"** |

**Negatif kontroller:** hub açılışta 130 araç listeliyor, boş sorgu 130'u geri
getiriyor (kayıtlı gerileme geri gelmedi), "wells" 2 sonuç, hub'daki 130 araç
bağı sayısı değişmedi. 320 px'te gezinme satırı `flex-wrap: wrap` ve yeni çip
ikinci satıra iniyor (24→145, pencere 320).

#### Ölçüm notu: taşma pozitif kontrolü BU SAYFADA kör

320 px doğrulamasında 900 px'lik bir tohum eklendi ve **ne kaydırma denemesi
ne de öge düzeyi `scrollWidth` onu yakaladı** — yani her iki ölçüt de bu
sayfada tohumu göremiyor. (`html`/`body`/`main` üzerinde `overflow-x: hidden`
bulunamadı, sebep açıklanamadı.) Bu yüzden doğrulama taşma taramasıyla değil
**doğrudan geometriyle** yapıldı: satırın `flexWrap` değeri ve çipin
koordinatları okundu.

Belgedeki kural ("İKİ ölçüt birden gerekiyor; hangisinin tek başına yeteceği
sayfaya göre değişir") burada bir adım öteye taşınıyor: **ikisi birden kör
olabilir.** Pozitif kontrol düştüğünde sonucu "temiz" diye raporlamak yerine
ölçütü değiştir.

#### Başlık aramasının canlı doğrulaması — ikisi indi, biri bekliyor

| düzeltme | canlıda |
|---|---|
| araçlar aramada | **"Wells" → `/tools/wells-dvt`, `/tools/wells-pe`** |
| panel yükseklik sınırı | **448 px**, belge 6934 → **1676 px** |
| sıfır sonuçta çıkış | **`/topics` ve `/tools`** |
| yanlış "bulunamadı" duyurusu | **HENÜZ İNMEDİ** (f295ef6 kuyrukta) |

**Kendi ölçütüm burada yanıldı ve düzeltildi.** Duyuru kontrolü "yanlış
'bulunamadı' `ms < 300` içinde mi" diye bakıyordu; yerelde 8 ms olan bu olay
canlıda **592 ms**'de çıktı (panel gizliyken zamanlayıcılar kısılıyor) ve
ölçüt "YOK" dedi. Dizi okununca gerçek görüldü:
`Sonuç bulunamadı. (592) → Aranıyor… (1578) → 5 sonuç bulundu. (1826)`.
**Doğru ölçüt mutlak zaman değil SIRA:** yanlış duyuru "Aranıyor…"dan ÖNCE mi
geliyor? Bir ortamda ayarlanan eşik, başka ortamda sessizce yanlış verdikt
üretiyor.

Arama sunucu eyleminin canlı süresi de kaydedildi (araçlar VAR, önbellek YOK):
ilk sorgu **996 ms**, sonrakiler 369 / 507 / 436 ms — ortanca **507 ms**.
Önbellek indiğinde bu sayı yeniden ölçülecek.

### ⚠ DÜZELTME — "önbelleğin kazancı sunucusuz ortamdan gelecek" TAHMİNİM DOĞRULANMADI

Arama indeksi önbelleğe alınırken şu yazılmıştı: *"Yerelde dosyalar işletim
sistemi önbelleğinden geldiği için kazanç ~10 ms; sunucusuz ortamda dosya
okuma çok daha pahalı ve fark oradan gelecek."* İkinci yarısı bir TAHMİNDİ ve
dağıtımdan sonra ölçüldü — **tutmadı.**

Sunucu eyleminin canlı süresi (istek süresi, `performance` kaynak zamanlaması):

| durum | ölçümler (ms) | ortanca |
|---|---|---|
| önbelleksiz | 996 · 369 · 507 · 436 | ~471 |
| **önbellekli** | 778 · 424 · 352 · 415 · 258 · 473 · 284 | **~415** |

Örneklemler ağır biçimde örtüşüyor. En düşük önbellekli değer (258 ms)
önbelleksiz hiçbir ölçümün altına inmiyor ama bu tek başına kanıt değil;
**ölçülebilir bir iyileşme YOK.** Sebep aritmetikte duruyor: aynı iş yerelde
22–34 ms sürüyor, canlıda 250–500 ms. Aradaki fark dosya okuma değil, ağ
gidiş-dönüşü ve platform ek yükü — yani kaldırdığım iş zaten toplamın küçük
bir parçasıydı.

**Değişiklik geri ALINMADI ve gerekçesi değişti:** artık bir başarım
düzeltmesi değil, deponun kendi kuralına (sayaçlar süreç başına bir kez
hesaplanır) uyum. Sorgu başına 456 dosya okumayı ve binlerce etiketi yeniden
normalleştirmeyi kaldırmak kendi başına doğru; ama **kullanıcının gördüğü
gecikmeyi ölçülebilir biçimde iyileştirmiyor ve öyle raporlanmamalı.**

Aktarılabilir kural: **bir düzeltmenin gerekçesini ölçmeden yazma.** "Şurada
daha pahalıdır, fark oradan gelir" cümlesi makul göründüğü için doğrulanmadan
belgeye girdi; ölçüm onu çürüttü. Bu depoda tahminler tekrar tekrar yanlış
çıktı (866 ms sunucu · openGraph görsel mirası · `/tools` 133 bağlantı) —
tahmin ile ölçüm aynı cümlede durmamalı.

### Bu oturumda eklenen ögelerin kontrastı ölçüldü — 0 kusur, ölçüt kör değil

Arama sonuçlarına araç satırı, sıfır duruma çıkış çipleri ve araç ağacına
kütüphane bağı eklendi. Hepsi tarayıcıda, uygulamanın kendi CSS'i altında
ölçüldü (alfa bindirmesi + degrade zemin + ata opaklığı + boyuta göre eşik):

| öge | kontrast | eşik |
|---|---|---|
| sıfır durum çipi "Kütüphane" | 8.01 | 4.5 |
| sıfır durum çipi "Klinik hesaplayıcılar" | 7.29 | 4.5 |
| araç sonucu başlığı | 14.63 | 4.5 |
| araç sonucu açıklaması | 7.58 | 4.5 |

**"0 kusur" körlükten gelmiyor — iki yönlü kontrol yapıldı:** aynı ölçüte
bilerek kusurlu bir tohum verildi (`#b8c6d9` beyaz üstünde) ve **1.73 ile
yakalandı**; temiz bir tohum (`#111827`) **17.74** ile işaretlenmedi. Yani
ölçüt ne kör ne fazla geniş.

### Yanlış duyuru düzeltmesi canlıda — ve DOĞRU ölçütle

Geçen turda kendi ölçütüm ("yanlış 'bulunamadı' `ms < 300` içinde mi") canlıda
yanlış verdikt vermişti. Ölçüt SIRAYA çevrildi ve düzeltme inince yeniden
sürüldü:

| | duyuru dizisi |
|---|---|
| önce (canlı) | **Sonuç bulunamadı. (592)** → Aranıyor… (1578) → 5 sonuç bulundu. (1826) |
| sonra (canlı) | **Aranıyor… (9)** → 5 sonuç bulundu. (1904) |

Yanlış duyuru YOK. Ölçüt artık "hangi durum önce geldi" diye soruyor, mutlak
zamana bakmıyor — çünkü tarayıcı paneli gizliyken zamanlayıcılar kısılıyor ve
aynı olay 8 ms yerine 592 ms'de görünüyor.

### ÜÇÜNCÜ BİR KAYNAK VARDI VE BAYATLAMIŞTI — `app/lib/tools.ts`

Konu tarafından araçlara yol var mı diye bakılırken bulundu. Branş sayfaları
"İlgili Hesaplayıcılar" şeridini `app/lib/tools.ts` içindeki elle tutulan
`TOOLS` + `BRANCH_TOOLS` eşlemesinden besliyor. Dosyanın kendi başlığı şunu
şart koşuyordu:

> *"slug'lar gerçek `app/tools/<slug>` klasörleriyle birebir eşleşmelidir
> (kırık link üretmemek için)"*

**Sözleşme çiğnenmişti ve bunu doğrulayan hiçbir şey yoktu.** Ölçüldü:

| ölçüt | sonuç |
|---|---|
| `TOOLS` anahtarı | 34 |
| `arac-index.json`'da OLMAYAN | **`heart-score`** |
| `app/tools/` altında KLASÖRÜ olmayan | **`heart-score`** |

`heart-score` daha önce `heart` ile birleştirilip klasörü silinmişti
(gerekçe `next.config.js`te yazılı: kapısız kopya, dokunulmamış formda
"0 · Düşük Risk" yani bir TABURCU kararı basıyordu). Eşleme eski slug'da
kaldı, yani **kardiyoloji branş sayfası ölü bir slug'a bağlanıyordu ve
yalnızca 308 yönlendirmesi sayesinde çalışıyordu** — yönlendirme kaldırılsa
kırık bağlantı olurdu.

`arac-metadata --kontrol` bunu göremezdi: o yalnızca `TOOLS_DATABASE` ile
indeksi karşılaştırıyor, `tools.ts` ÜÇÜNCÜ bir yer.

Düzeltildi ve üretilmiş çıktıda doğrulandı: kardiyoloji branş sayfası artık
`/tools/heart`e bağlanıyor, `heart-score` geçişi **0**.

#### Nöbetçi eklendi — ve İLK HÂLİ KÖRDÜ, sebebi yeni bir tuzak biçimi

`arac-metadata.cjs --kontrol` (CI kapısı) artık `tools.ts`teki her slug'ın
gerçek bir `app/tools/<slug>/page.tsx` taşıdığını da doğruluyor.

İlk yazımı "temiz" dedi — **iki pozitif kontrol de düştü.** Sebep, deponun en
çok tekrar eden tuzağının (yorum körlüğü) daha önce görülmemiş bir biçimiydi:

```
// Klinik hesaplayıcıların (app/tools/*) branşlara göre eşlemesi.
                                     ^^ SAHTE blok yorum acilisi
```

Blok yorumu ÖNCE ayıklayan bir ölçüt, bu `/*` işaretinden sonraki ilk blok
kapanışına kadar her şeyi siliyor. Ölçüldü: **5044 karakterlik dosya 358
karaktere indi**, regex 0 eşleşme buldu ve nöbetçi sessizce kör kaldı.

Çare sıra: **önce SATIR yorumu, sonra BLOK yorumu** — o zaman `(app/tools/*)`
blok ayıklama çalışmadan önce zaten boşaltılmış oluyor. Yorumlar silinmiyor,
boşlukla dolduruluyor (satır sonları korunuyor).

**Doğrulama dört ayaklı:**

| kontrol | sonuç |
|---|---|
| pozitif 1 — `TOOLS`ta ölü slug | **yakalandı** (`TOOLS -> "heart-score"`) |
| pozitif 2 — yalnızca `BRANCH_TOOLS`ta ölü slug | **yakalandı** (`BRANCH_TOOLS.romatoloji -> "olmayan-arac"`) |
| negatif — temiz depo | geçiyor |
| **çıkış kodu** | tohumluda **1**, temizde **0** — kapı gerçekten düşüyor |

Son satır ayrı ölçüldü, çünkü çıktıyı `head`e boruladığında kod `head`in
kodudur (belgede kayıtlı tuzak) ve ilk ölçüm "cikis=0" gösteriyordu.

#### Ölçülüp DEĞİŞTİRİLMEYEN iki şey

**1. Konu sayfalarında araç bağı YOK.** Branş sayfaları branşa özgü araçları
gösteriyor (nefroloji 12, kardiyoloji 11 araç bağı) ama konu detay sayfaları
tam **7** taşıyor ve yedisi de başlıktan gelen genel bağlar. Yani "Akut Böbrek
Hasarı" okuyan kişiye `egfr` ya da `kdigo-aki` gösterilmiyor. `getBranchTools`
yardımcısı hazır ve konu sayfası branşını biliyor — teknik engel yok. Ama
her konu sayfasına branşın 2–7 aracını basmak gürültü de olabilir; bu bir
tasarım kararı, ölçüldü ve bırakıldı.

**2. 130 aracın 97'si hiçbir branşa eşli değil.** `BRANCH_TOOLS` 12 branşta
toplam 33 araç sayıyor. Bu bir kusur değil — eşleme bilerek küratörlü
("öncelik sırasına göre" diyor) ve `journal-club` için bilerek boş. Ama
şeritte görünmeyen 97 araca yalnızca hub ve arama üzerinden ulaşılıyor.

### EN BÜYÜK ARAÇ KATEGORİSİ MENÜDE HİÇ YOKTU — ilan "en yüksek altı" diyordu

`app/lib/tools.ts` bayatlaması bulunduktan sonra doğal soru: depoda başka
elle tutulan liste var mı ve onlar da kaydı mı? İkisi sayıldı.

**`SPECIALTIES` temiz:** 13 branş kaydı ↔ 13 içerik dizini, **iki yönde de
sapma 0**.

**Menüdeki araç kategorileri DEĞİL.** `SiteHeader` içindeki
`ARAC_KATEGORILERI` listesinin hemen üstünde şu yazıyordu:

> *"Menüde gösterilen araç kategorileri — araç sayısı **en yüksek altı grup**."*

Ölçüldü (canlı `/tools` kategori rozetlerinden — sayıyı zaten ekrana basıyorlar):

```
infuzyon 19 · acil 15 · romatoloji 14 · nutrisyon 10 · nefroloji 9 ·
endokrinoloji 9 · onkoloji 7 · gogus-enfeksiyon 7 · kardiyoloji 5 · …
                                                    (18 kategori, 133 listeleme)
```

| | liste |
|---|---|
| menüdeki altı | acil · romatoloji · nutrisyon · nefroloji · endokrinoloji · **kardiyoloji (5)** |
| gerçek en üst altı | **infuzyon (19)** · acil · romatoloji · nutrisyon · nefroloji · endokrinoloji |

Yani **en büyük kategori — 19 infüzyon hesaplayıcısı — sitenin ana menüsünde
hiç yoktu**, yerine 5 araçlı kardiyoloji duruyordu. Bu küme klinik olarak da
ağır (doz ve hız hesapları; belgede "ACİL / İNFÜZYON SERİSİ" olarak 18 aracı
tek tek bağımsız hesapla sürülmüş).

Liste kendi ilanına hizalandı. Yorum artık ölçüm anındaki sayıları ve şunu
taşıyor: **menü başka bir ölçütle küratörlenecekse ÜSTTEKİ CÜMLE de
değişmeli** — iki gerçeklik bırakma.

**Doğrulama, üçü negatif kontrol:**

| ölçüt | sonuç |
|---|---|
| `?kategori=infuzyon` | **19 araç** · "19 araç listeleniyor." · tek `h2` |
| **negatif** — öteki beş menü bağı | beşi de 200 |
| **negatif** — `/tools` varsayılan | 130 benzersiz araç bağı (değişmedi) |
| **negatif** — menüde `kategori=kardiyoloji` | **0** (çıktı) |

İlk satır önemli: yeni bir süzgeç bağı eklerken asıl risk **boş liste açmak**
(belgede kayıtlı gerileme). Bağ eklenip sayı ölçülmeden bırakılsaydı bu
görülmezdi.

#### Ölçüm notu: ayrıştırma İKİ KEZ üst üste yanlış sonuç verdi

Kategori sayılarını `TOOLS_DATABASE`i ayrıştırarak çıkarmaya çalıştım.
İlk ölçüt yanlış alan adını aradı (`kategori:` — gerçek ad `category:`) ve
**0 eşleşme** buldu; rapor "İLAN TUTUYOR MU: HAYIR" dedi — oysa bu sonuç
ölçümün kendisinden geliyordu, veriden değil. İkinci ölçüt süslü parantez
sayarken `[` ve `{` işaretlerini karıştırdı ve **18 kategoriden yalnızca 1'ini**
gördü.

Doğru sonuç ancak ayrıştırmayı bırakıp **ekrandaki gerçek sayıları** okuyunca
çıktı: `/tools` kategori rozetleri sayıyı zaten basıyor. Bu depodaki kural
burada bir kez daha işledi — **davranışı ölç, kaynağı ayrıştırma.** Ayrıştırma
bu oturumda dört kez sahte sonuç üretti (yuvarlama denetimi, eksik alan
denetimi, `heart-score` nöbetçisi, bu tur iki kez).

### Canlı arayüzdeki bağlantılar tarandı — 184/184 açılıyor

`link-denetim` içerik JSON'larını tarıyor; **arayüz bileşenlerinin ürettiği
bağlantıları görmüyor.** O boşluk kapatıldı: yedi ana yüzeyin sunucu
HTML'inden bağlantılar toplanıp tek tek denendi.

| ölçüt | sonuç |
|---|---|
| taranan yüzey | 7 (`/`, `/topics`, `/tools`, branş, konu, `/uyelik`, premium pano) |
| benzersiz iç bağlantı | **184** |
| 200 dönmeyen | **0** |
| **pozitif kontrol** — olmayan adres | **404** (tarama kör değil) |

Alt bilgi envanteri de kayda geçti (10 bağlantı): `/`, dört branş,
`/tr/premium/ydus`, `/tools`, `/calisma-alanim`, `/tekrar`, `/uyelik`.
Belgede kayıtlı 27 kırık adresin hepsi ÖLÜ KODDA (`nav.ts`, `ads.ts`,
`HeaderClient`) ve bu taramada hiç görünmüyor — yani gerçekten ulaşılmıyorlar.

### Arama panelinin klavye erişimi — yükseklik sınırı kimseyi tuzağa düşürmüyor

Panele `max-h` + `overflow-y-auto` konduktan sonra sorulacak soru: alt
kısımdaki sonuçlara klavyeyle ulaşılıyor mu? "kan" sorgusu (45 sonuç) ile
ölçüldü:

| ölçüt | sonuç |
|---|---|
| panel içten kaydırılabilir | evet |
| `tabindex="-1"` ile engellenen sonuç | **0** |
| odak sırası | kutu → "Aramayı temizle" → **ilk sonuç** (arada tek öge) |
| son sonuca odaklanınca | panel **kendiliğinden kaydı** (scrollTop 4686) |

Son satır belirleyici: sınırlı yükseklik, görünür alanın altındaki 40+ sonucu
erişilemez YAPMIYOR — odak kabı sürüklüyor.

### `heart-score` düzeltmesi canlıda

Kardiyoloji branş sayfası artık `/tools/heart`e doğrudan bağlanıyor;
`heart-score` geçişi **0**. Yönlendirme sıçraması kalktı.

### ÜCRETLİ İÇERİK SIZMIYOR — ve bunu söyleyebilmek için önce ÖLÇÜTÜN çalıştığı kanıtlandı

Bu, ürünün en pahalı sorusu ve hiç sistematik ölçülmemişti: anonim bir
ziyaretçi premium içeriği ham HTML'den okuyabiliyor mu? Deponun kendi kuralı
gereği görünür metne bakmak YETMEZ — **`<script>` blokları RSC yükünü taşıyor**
ve içerik render edilmese bile yükte olabilir.

**Yöntem: içerik DOSYASINDAN cümle al, CANLI ham HTML'de ara.**

İlk denemede pozitif kontrolüm DÜŞTÜ ve sebebi öğreticiydi: kontrol cümlesini
etiketleri sökülmüş metinden almıştım, o da boşlukları birleştirdiği için ham
HTML'de birebir bulunmuyordu. **Kontrol, ölçülen şeyle AYNI yordamla
kurulmalı.** Düzeltilince:

| ölçüt | sonuç |
|---|---|
| **pozitif kontrol** — açık konunun içerik dosyasından 3 cümle | **3/3 ham HTML'de BULUNDU** (yöntem çalışıyor) |
| premium konu (SLE) — içerik dosyasından 3 cümle | **0/3** |
| premium branş sayfası — hematoloji gövdesinden 4 cümle | **0/4** |

Bayt karşılaştırması da aynı yönde: açık konu 86717, premium konu 28117.

**Altı ücretli yüzeyin altısı da kapılı** (anonim, canlı):

| yüzey | sonuç |
|---|---|
| premium konu · `quiz-coz` · `inciler` · `hizli-tekrar` · `vaka-coz` · `soru-cozum` | **🔒 Erişim Kısıtlı** |
| doğrudan içerik yolları (`/content/premium/…json` vb., 4 biçim) | **404** |
| premium API'ler (`quiz/today`, `daily-program`, `protected/chunk`, `user/me`) | **503 · `backend-unavailable`** |

**Premium BRANŞ sayfası bilerek açık ve sızıntı değil:** 36917 bayt ama
görünür metin yalnızca **548 karakter** — branş başlığı, tanıtım cümlesi ve
kategori adları. Konu gövdelerinden alınan dört cümlenin dördü de yok. Yani
katalog açık, içerik kapalı; satış yüzeyi olarak doğru davranış.

**Parametresiz ücretli yüzeyler dürüst hata veriyor:** `inciler` ve `quiz-coz`
"açılamadı" kartı + YDUS panosuna dönüş bağlantısı basıyor (sistem içi ad
sızmıyor, çıkmaz yok). Parametre verilince kapı devreye giriyor.

> **Ölçüm notu — parametre adını TAHMİN ETME.** `inciler?brans=…&konu=…` ile
> yapılan ilk deneme "açılamadı" döndürdü ve bir an "kapı yok" sanıldı;
> gerçek adlar `branch` ve `id` (kaynaktan okundu) ve o adlarla sayfa
> kapılı çıktı. Yanlış parametreyle alınan "kapı görünmüyor" sonucu,
> kapının yokluğu DEĞİL ölçümün yanlış kapıyı çalmasıdır.

### Kendi metadata değişikliklerim JSON-LD'yi bozmadı

Bu oturumda canonical ve başlıklar geniş biçimde değiştirildi; şema
adresleriyle çelişme riski vardı. Ölçüldü — üç sayfa tipinde de
**canonical ile şema URL'i birebir aynı**, kırıntılar tam ve doğru,
`localhost` adresi 0, ayrıştırılamayan blok 0.

Tek fark kayda geçti ve DEĞİŞTİRİLMEDİ: araç kırıntısı `[Klinik Araçlar, X]`
diye başlıyor, konu/branş kırıntısı `[MediSea, Kütüphane, …]` ile. Konu
tarafındaki kök daha önce bilinçli eklenmiş (yorumu duruyor), araç tarafı o
turun dışında kalmış. Araç sayfalarında GÖRÜNÜR kırıntı olmadığı için ortada
şema–ekran çelişkisi yok; 130 dosyalık üretilmiş diff'i kozmetik bir fark
için açmaya değmez. Ölçüldü, yazıldı, bırakıldı.

### SİTE HARİTASI HER DAĞITIMDA "152 SAYFA AZ ÖNCE DEĞİŞTİ" DİYORDU

`dateModified` şemada doğru basılıyor mu diye bakılırken çıktı. Şema temiz
(`"2026-03-14"`, geçerli ISO) ama harita aynı sinyali başka bir kaynaktan
üretiyordu. Ölçüldü (canlı `sitemap.xml`):

| ölçüt | değer |
|---|---|
| adres | 558 |
| **derleme anının damgasını taşıyan** | **152** |
| bunların dağılımı | 131 araç · 13 branş · `/` · `/topics` · `/tools` · `/uyelik` · premium tanıtım |
| araç adresleri arasında BENZERSİZ tarih | **1** |

Kod `lastModified: simdi` yazıyordu (`simdi = new Date()`), yani her dağıtım
130 hesaplayıcının ve bütün hub sayfalarının "az önce değiştiğini" bildiriyordu.

**Bu yalnızca gereksiz değil, ZARARLI.** Arama motoru `lastmod`u ancak
tutarlı ve doğrulanabilir biçimde doğruysa kullanıyor; her dağıtımda 131
adresin değiştiğini söyleyen bir harita sinyali sitenin TAMAMI için
değersizleştiriyor — yani gerçek tarihini taşıyan 406 konu adresi de zarar
görüyor.

**Aynı ilke bu depoda ZATEN yazılıydı ve harita onun dışında kalmıştı:**
`isoTarih()` ayrıştıramadığı değer için alanı hiç basmıyor — *"geçersiz bir
tarih basmaktansa sinyali vermemek doğru; uydurma bir tarih arama motoruna
yanlış tazelik bildirir."*

Alan artık yalnızca GERÇEK kaynağı olan adreslerde basılıyor:

| adres | kaynak |
|---|---|
| konu | içeriğin kendi `meta.updatedAt` değeri |
| branş | o branştaki konuların **EN YENİSİ** |
| `/topics` | bütün konuların en yenisi |
| araç · `/` · `/tools` · `/uyelik` · premium | **alan YOK** |

#### İkinci kusur negatif kontrolün İÇİNDEN çıktı

Konu tarihlerinin değişmediğini doğrularken **dört konuda fark** göründü:
`riedel-tiroiditi`, `hematolojik-maligniteler`, `lenfomalar`, `nhl-genel`.

Sebep düzeltmem değildi: bu dördünde `meta.updatedAt` alanı HİÇ YOK ve
`sonDegisiklik()` **`mtime` yedeğine** düşüyordu. Aynı dosyanın kendi yorumu
`mtime`ın CI'da anlamsız olduğunu (checkout anı) zaten yazıyor — ama yedek
yerinde duruyordu. Yani not doğruydu, kod notu uygulamıyordu.

`mtime` yedeği kaldırıldı; tarih bilinmiyorsa alan basılmıyor.

**Bu, negatif kontrolün ikinci bir kusur bulduğu tur.** "Değişmemeli" diye
baktığım yerde değişen dört satır, düzeltmemin hatası değil ONDAN ÖNCE VAR
OLAN bir kusurun görünür hâliydi.

#### Doğrulama

| ölçüt | önce (canlı) | sonra |
|---|---|---|
| adres sayısı | 558 | **558** (küme birebir aynı) |
| `lastmod` taşıyan | 558 | 420 |
| **derleme damgası taşıyan** | **152** | **0** |
| branş tarihleri | 13'ü de aynı gün | **13 farklı gerçek tarih** |
| **negatif** — gerçek tarihli konularda değişen | — | **0** |
| XML iyi biçimli | — | evet |

Branş satırı ayrıca bir kazanç: eskiden hepsi aynı damgayı taşıyordu, şimdi
her branş kendi en yeni konusunun tarihini veriyor (endokrinoloji 2026-08-11,
gastroenteroloji 2026-06-23, …) — yani sinyal hem dürüst hem ayırt edici.

### "BOZUK BİR İÇERİK DOSYASI NE KIRAR?" — deneyle ölçüldü, sistem katmanlı savunuyor

Bozuk veri tohumlamak bu depoda daha önce üç kusur bulmuştu (hep tarayıcı
deposunda). İçerik tarafında hiç denenmemişti. Gerçek bir konu dosyası
(`endokrinoloji/riedel-tiroiditi.json`) yarıdan kesilip geçersiz JSON hâline
getirildi ve bütün zincir ölçüldü.

| katman | sonuç |
|---|---|
| `npm run build` | **geçti** — 622 → 621 sayfa, bozuk konu düştü, çökme yok |
| bozuk konunun adresi | **200** ama içerik "Konu bulunamadı", `<h1>` slug'dan türetilmiş |
| o sayfanın robots'u | **`noindex, nofollow`** — arama motoruna sunulmuyor |
| branş sayfası | 200, 18 bağ (değişmedi) — tek dosya listeyi düşürmüyor |
| ana sayfa · `/tools` · site haritası | 200 |
| **CI** | **KIRMIZI** — `baslik-index --kontrol` ve `ilgili-index --kontrol` düşüyor |

Son satır belirleyici: **bozuk içerik dağıtıma çıkamaz.** İki indeks kapısı,
bozuk konu indekslerden düştüğü için "bayat" diyor ve iş düşüyor. Yani
savunma üç katmanlı — derleme ayakta kalıyor, sayfa dürüst davranıyor, kapı
gönderimi engelliyor.

**Kusur SAYILMAYAN iki kalıntı, gerekçesiyle:** bozuk konu site haritasında
kalıyor (558 adres, kayıt duruyor) ve branş sayfasından hâlâ bağlı. İkisi de
`guvenliOku(..., true)` davranışından geliyor — ayrıştırılamayan dosya
"gizli değil" sayılıyor. Ters çevirmek (hata → dışarıda bırak) daha dürüst
görünüyor ama geçici bir okuma hatasında konuları sessizce haritadan
düşürürdü. Üstelik durum zaten CI tarafından engellendiği için üretimde
oluşamıyor. Ölçüldü, gerekçesi yazıldı, DEĞİŞTİRİLMEDİ.

### İçerikte görsel YOK — bütün bir hata sınıfı boş çıktı

Alt metin, boyut (CLS), tembel yükleme… hepsi ölçülmeden önce sınıfın var
olup olmadığı soruldu:

| aranan | içerikte | premium konularda |
|---|---|---|
| `<img>` | **0** | **0** |
| `<svg>` · `<video>` · `<audio>` · `<iframe>` | 0 | — |
| `<table>` | 52 | — |

Yani görsel erişilebilirliği bu depoda ölçülecek bir yüzey DEĞİL. Bir sınıfı
taramadan önce **örneklem sayısını sor**; sıfırsa tarama da sonuç da yok.

### İçerikteki 52 tablo yapısal olarak sağlam

| ölçüt | sonuç |
|---|---|
| `<th>` taşımayan tablo | **0** |
| `<thead>` taşımayan | **0** |
| **karmaşık** tablo (çok satırlı başlık, `tbody`de `th`, `colspan/rowspan`) | **1** / 52 |
| sütun dağılımı | 2 sütun 9 · 3 sütun 32 · 4 sütun 10 · 5 sütun 1 |

51 tablo tek başlık satırlı ve satır başlığı taşımıyor; o yapıda ekran
okuyucu sütun ilişkisini `<thead><th>`den zaten kuruyor, `scope` gerekmiyor.
`<caption>` 52'sinde de yok ama tablolar gövde metninin içinde ve kendi
başlıkları var. Kusur sayılmadı.

### Site haritası düzeltmesi canlıda + oturum sonu gerileme kontrolü

`lastmod` düzeltmesi dağıtıldı ve canlıda ölçüldü:

| ölçüt | önce | canlıda |
|---|---|---|
| adres | 558 | **558** |
| `lastmod` taşıyan | 558 | **420** |
| **derleme damgası taşıyan** | **152** | **0** |
| araç adresi / `lastmod` taşıyan | 131 / 131 | 131 / **0** |
| branş adresi / benzersiz tarih | 13 / **1** | 13 / **13** |

**Bu oturumda ~20 commit gönderildi** (arama motoru, araç gezinmesi, menü
listesi, metadata, site haritası, iki denetim nöbetçisi). "Sayı yazma,
saydır" mimarisi bozuldu mu diye dört yüzey birden okundu:

| yüzey | araç | konu | branş | başlık | soru | kart |
|---|---|---|---|---|---|---|
| ana sayfa | **130** | **410** | **13** | — | — | — |
| `/tools` | 130 (sayaç + benzersiz bağ), 18 `h2` | — | — | — | — | — |
| `/uyelik` | — | 410 | 13 | **41** | **378** | **1492** |
| `/topics` | — | 410 (13 kartın toplamı) | 13 | — | — | — |

Sapma yok; elle güncellenen tek sayı da yok.

`/uyelik` ayrıca çıkmaz değil: "Şimdi ne yapabilirsin" bölümü, `/kayit` ve
ücretsiz yüzeylere bağlar taşıyor (23 iç bağlantı, 2133 karakter görünür
metin).

#### Aynı turda ÜÇ sahte bulgu — üçü de benim ölçümümdendi

Bu tur ölçüt hatalarının ürünü suçlamaya ne kadar yakın olduğunu iyi
gösteriyor:

| gördüğüm | gerçek |
|---|---|
| `/uyelik` h1'i "ücretsiz,neyin" — boşluk eksik | etiketleri `""` ile sildim; sayfada `<br>` var, boşluk yerinde |
| `/uyelik`te soru sayısı **yok** | var (**378**); desenim "çözümlü soru" arıyordu, sayfada "**açıklamalı** soru" yazıyor |
| kategori sayımı "ilan tutmuyor" (önceki tur) | ayrıştırıcı 18 kategoriden 1'ini görmüştü |

Üçünde de ilk okuma bir kusur işaret ediyordu. Ölçüt düzeltilince üçü de
kayboldu. **Bir bulgu raporlamadan önce sor: bunu ürün mü yapıyor, ölçütüm
mü?** Ucuz sınama: aynı şeyi ikinci bir yöntemle oku (etiket sökmek yerine
ham HTML'de ara, desen yerine bağlamı bastır).

### KAYIT FORMU SONSUZA DEK KİLİTLENİYORDU — `res.json()` fırlıyor, sıfırlama satırı hiç çalışmıyor

Kurum kapısı (`/kayseritip`) incelenirken bulundu. Middleware `/api/kayseritip/:path*`
yolunu da eşliyor, yani oturum düşerse bir **POST isteği bile** `/giris`e
yönlendiriliyor ve istemciye **200 + HTML** dönüyor. Çağıran kod bunu
karşılamıyordu:

```js
const res  = await fetch('/api/...', { method: 'POST', body: fd });
const data = await res.json();   // HTML gelirse BURADA fırlar
setYukleniyor(false);            // ...buraya hiç ulaşılmaz
```

`try/catch` de olmadığı için sonuç: **düğme sonsuza dek "yükleniyor"da kalıyor
ve kullanıcıya hiçbir şey söylenmiyor.**

**En değerli örnek kurumsal alan değil, HERKESE AÇIK KAYIT FORMUYDU.**
`/kayit` aynı şekli taşıyordu ve `/api/auth/register` middleware'e hiç
girmiyor — ama bir 500 HTML hata sayfası aynı sonucu veriyor.

ÖLÇÜLDÜ (yerel üretim derlemesi, `fetch` koşumuyla uca HTML 500 döndürülerek —
**veritabanına gidilmedi**):

| ölçüt | önce | sonra |
|---|---|---|
| düğme metni | **"Kayıt yapılıyor…"** | "Kayıt Ol" |
| `disabled` | **true — sonsuza dek** | false |
| kullanıcıya mesaj | **HİÇ YOK** | "Sunucudan beklenen yanıt gelmedi; hesabın oluşturulmamış olabilir…" |

**İki negatif kontrol, düzeltmenin normal yolu yutmadığını gösteriyor:**

| senaryo | sonuç |
|---|---|
| JSON 400 (bilinen hata) | **"Bu e-posta adresi zaten kayıtlı."** — özgün mesaj korundu |
| ağ hatası (`fetch` fırlatıyor) | "Bağlantı kurulamadı; hesabın oluşturulmadı. Tekrar dene." |

#### Sınıf tarandı: 8 çağrı yerinin 5'i korumasızdı, 3'ü ZATEN doğruydu

Ölçüt: `await x.json()` çağrısı ne `.catch(...)` ne de saran bir `try` taşıyor.

| dosya | şiddet |
|---|---|
| `kayit/page.tsx` | **donmuş düğme** (herkese açık) |
| `kayseritip/…/AlanClient.tsx` | **donmuş düğme** (dosya yükleme) |
| `admin/kayseritip/page.tsx` (×2) | **donmuş düğme** |
| `admin/kt-yetki/page.tsx` (×2) | sessiz boş liste + mesajsız hata |
| `admin/kayseritip/duyuru/page.tsx` (×2) | sessiz boş liste + mesajsız hata |

**Depo bu dersi zaten biliyordu ve üç yerde uyguluyordu:** `SoruSor.tsx`
(`try/catch`), `admin/content/page.tsx` ve `admin/import/page.tsx`
(`try/catch/finally` + `setLoading(false)` finally'de), ayrıca
`admin/content/topics/*` doğrudan `.catch(() => null)` kullanıyor. Yani doğru
kalıp dosyanın komşusundaydı; eksik olan tutarlılıktı.

Tarama sonrası: **korumasız çağrı 0** (ölçüt pozitif kontrolle sınandı —
tohum desen yakalanıyor).

#### Aktarılabilir kural

**Bir `fetch` kapılı bir yola gidiyorsa yanıtın JSON olduğunu VARSAYMA.**
Bu depoda kapı iki biçimde HTML döndürüyor: middleware yönlendirmesi (200) ve
sunucu hata sayfası (500). İkisi de `res.json()`u fırlatır; fırlatma
`setYükleniyor(false)`dan ÖNCEyse arayüz kilitlenir ve kullanıcı hiçbir şey
görmez — **sessiz kilit, yanlış mesajdan beterdir.**

### Aynı sınıf SUNUCU tarafında da arandı — bir yanlış pozitif, altı dar durum

İstemci tarafındaki `res.json()` sınıfı kapandıktan sonra aynı ölçüt `.ts`
dosyalarına (API rotaları, lib) sürüldü: **7 aday**.

**Biri yanlış pozitif ve sebebi ölçütün kendisiydi.**
`api/protected/chunk/route.ts:43` korumasız göründü; gerçekte `try { … }
catch { … }` bloğunun içinde. Ölçütüm saran `try`ı 700 karakterlik bir geri
pencerede arıyor, o blok daha uzun. **Pencere tabanlı bir "korumalı mı"
sınaması, uzun bloklarda sessizce yanlış pozitif üretir** — belgedeki
"doğrulama betiği, doğruladığı betiğin hatasını paylaşmamalı" kuralının
kapsam tarafındaki hâli.

**Kalan altısı `await req.json()`** — yani GELEN isteğin gövdesi, dışarıdan
gelen bir yanıt değil. Üçü de yönetim rotası ve parse **auth kontrolünden
SONRA** geliyor:

```ts
if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
const { email, rol } = await req.json();   // buraya ancak yönetici ulaşır
```

Yani bozuk gövdeyle 500 alabilmek için kimliği doğrulanmış bir yönetici
gerekiyor ve tek çağıran deponun kendi yönetim arayüzü. Dar durum;
**değiştirilmedi.**

### API yanıtlarında iç ayrıntı — 48 rota tarandı, iki yer bilerek bırakıldı

Ölçüt: `NextResponse.json`/`Response.json` gövdesine `error.message`,
`error.stack` ya da `String(e)` konması. 48 rotada **2 dosya** çıktı:
`api/topics/route.ts` ve `api/topics/[slug]/route.ts` — ikisi de içerik
dosyasına YAZAN uçlar ve `error.message`'ı 500 gövdesinde döndürüyor.

Bir dosya yazma hatasında bu, sunucunun mutlak yolunu sızdırabilir
(`EACCES: … C:\…\content\canonical\…`). Belgedeki kural "sistem içi ad
geçmesin" diyor — **ama o kural SON KULLANICI için yazıldı.** Bu iki uç
`yoneticiMi()` ile kapılı ve tek çağıranları yönetim arayüzü; orada gerçek
hata mesajı operatörün ayıklama aracı.

Gerilim gerçek, karar ürün sahibinin: son kullanıcı yüzeyi değil, o yüzden
genelleştirmedim. Ölçüldü, yeri yazıldı, DEĞİŞTİRİLMEDİ.

#### Ölçüm notu: dağıtımı İSTEMCİ dizesiyle yoklamak — belgede yazılı, yine yapıldı

`/kayit` düzeltmesinin canlıya inip inmediği, eklediğim hata cümlesi HTML'de
aranarak yoklandı ve "0" çıktı. Bu sonuç **geçersiz**: cümle bir istemci
bileşeninin içinde, yani sunucu HTML'inde değil JS parçasında. Belgede tam
bu tuzak kayıtlı ("Dağıtımın indiğini İSTEMCİ tarafı bir işaretle yoklama").
Doğru yol: formu `fetch` koşumuyla canlıda sürmek — bir sonraki tura kaldı.

### ⚠ BU DOSYANIN KENDİ MALİYETİ ÖLÇÜLDÜ — karar kullanıcının

Belgeye ölçüt uygulanınca çıktı. CLAUDE.md her oturumda bağlama yükleniyor:

| ölçüt | değer |
|---|---|
| karakter | **557.654** |
| satır | 11.752 |
| `###` bölüm | **304** |
| kaba token (3 krk/token) | **~186.000** |
| ilk sürümden bugüne | 6.251 → 557.654 (**89 kat**) |
| son 24 saatte dosyaya dokunan commit | **81** |

**Bu bir kusur DEĞİL, bir ödünleşme** ve iki yönü de gerçek:

- **Lehte:** bu oturumda belgedeki tuzaklar defalarca beni kurtardı —
  `scrollWidth` sahte taşması, `innerText`in `uppercase` uygulaması, heredoc'un
  kaçış silmesi, `<script>` bloklarının RSC yükü taşıması, "0 kusur ile 0 ölçüm
  aynı görünür". Kayıt otomatik yüklendiği için işe yaradı.
- **Aleyhte:** ~186 bin token her oturumun bağlamından düşüyor; dosya
  büyüdükçe asıl işe kalan yer daralıyor.

**Sayıların bayat görünmesi kusur DEĞİL.** Ölçüldü: "131 araç" 11 kez, "114
araç" 5 kez geçiyor ve bugünkü değer 130. Ama bunlar TARİHSEL kayıtlar ve
dosyanın kendi kuralı zaten şunu söylüyor: *"Bu bölümdeki sayılar ÖLÇÜM ANINA
aittir; güncel değeri betikten al, belgeden değil."* Toplu düzeltmek geçmişi
tahrif etmek olurdu — DOKUNULMADI.

**Olası çare (uygulanmadı, karar ürün sahibinin):** dosyayı ikiye ayırmak —
işletim kuralları ve güncel durum otomatik yüklenen `CLAUDE.md`de kalır,
kapanmış sınıfların ölçüm kayıtları ayrı bir arşiv dosyasına taşınır ve
gerektiğinde okunur. Kazanç bağlamda yer; risk, kazara bir dersin otomatik
erişimden çıkması. Bu oturumun kanıtı ikinci riskin ciddi olduğunu gösteriyor,
o yüzden tek başıma yapmadım.

### Kayıt formu düzeltmesi CANLIDA doğrulandı

Önceki turda yerelde ölçülen üç durum canlıda tekrarlandı (koşum yalnızca
`/api/auth/register` ucunu yakalıyor, **veritabanına gidilmedi**):

| senaryo | düğme | mesaj |
|---|---|---|
| HTML 500 (JSON değil) | açık | "Sunucudan beklenen yanıt gelmedi…" |
| **negatif** — JSON 400 | açık | "Bu e-posta adresi zaten kayıtlı." |
| **negatif** — ağ hatası | açık | "Bağlantı kurulamadı; hesabın oluşturulmadı." |

Önceki hâlinde bu senaryoda düğme `disabled` kalıyor ve hiçbir mesaj
çıkmıyordu.

### Kayıt ucunun sunucu doğrulaması — kaynaktan görülen boşluk, SINANAMADI

`/api/auth/register` yalnızca üç şeyi denetliyor: alanların boş olmaması,
parolanın ≥6 karakter olması, e-postanın kayıtlı olmaması. **E-posta biçimi
denetlenmiyor ve `trim` uygulanmıyor**; `name` için `!name` kontrolü boşluktan
ibaret bir adı geçiriyor.

İstemci tarafı `type="email"` + `required` taşıdığı için tarayıcı biçimi
zaten eliyor — boşluk yalnızca uca DOĞRUDAN yapılan çağrılarda açık.

**Sınanmadı ve düzeltilmedi:** boşluğu göstermek bir hesap OLUŞTURMAYI
gerektirir, bu da üretim veritabanına yazmak demektir. Ayrıca bir biçim
denetimi eklemek, bugün başarılı olan kayıtları reddedebilir — dönüşüm
yüzeyinde ölçülmemiş bir davranış değişikliği. Ölçüm kaynaktan, karar ürün
sahibinin.

### Hareket azaltma desteği ölçüldü — kapsamlı

`prefers-reduced-motion: reduce` bloğu `globals.css`te var ve evrensel
seçiciyle bütün `animation`/`transition` sürelerini 0.01 ms'e çekiyor
(sıfıra DEĞİL — `transitionend` olayları tetiklensin diye). Kapsam gerçekten
geniş: depoda `transition-*` 719, `animate-*` 40, `duration-*` 64 kullanım
var ve hiçbiri `motion-reduce:` varyantına ihtiyaç duymuyor. Sınıf kapalı.

### BOŞ FORMDAN HÜKÜM — belgede EN AZ geçen araçlar tarandı, `mna` aşırı tanı basıyordu

Kapsam ölçümü ("130 aracın 6'sı belgede hiç geçmiyor") bir tur önce iş
çıkarmıştı. Aynı ölçüt gevşetildi: **belgede en az geçen 19 araç**, bu kez
"dokunulmamış formdan klinik hüküm" ekseninde sürüldü.

#### `mna` — sıfır, "iyi"ye değil EN KÖTÜ etikete düşüyordu

Dokunulmamış sayfa, basılı düğme SIFIRKEN şunu basıyordu:

```
SKOR  0        Malnütrisyon (Kötü Beslenme)
```

Sebep `getResult(score)`ın koşulsuz çağrılması: cevapsız madde toplama 0
katıyor, 0 da en ağır banda düşüyor (`s >= 12` normal · `s >= 8` risk ·
kalanı malnütrisyon).

**Yön bu araçta ters ve tam da bu yüzden ayrıca dikkat çekici.** Belgede
kayıtlı kardeş kusurlar (`nrs-2002` "SKOR 0 · RİSK DÜŞÜK", `das28`
"Remisyon", `glim` "Kriterleri Karşılanmadı", `kdigo-aki` "AKI Kriteri Yok")
hep **güven veren** yönde yanılıyordu. `mna` tersini yapıyor: boş form
**AŞIRI TANI** üretiyor, hastayı malnütre ilan ediyordu.

Çare `must` kardeşiyle aynı hizaya çekmek — hüküm ancak altı maddenin
altısı da yanıtlanınca veriliyor. **Sayı da basılmıyor**: "0" tek başına da
bir iddiadır ve en ağır bandın değeridir.

| girdi | önce | sonra |
|---|---|---|
| dokunulmamış | **0 · "Malnütrisyon (Kötü Beslenme)"** | **– · "6 soru daha yanıtlanmalı"** |
| 1/6 yanıtlı | 2 · "Malnütrisyon" | – · "5 soru daha yanıtlanmalı" |
| **negatif** — 6/6 yanıtlı | 14 · "Normal Beslenme Durumu" | **14 · "Normal Beslenme Durumu"** |

Puanlama ayrıca elle doğrulandı: 2+3+2+2+2+3 = **14**, ve bantlar
yayımlanmış MNA-SF ile birebir (≥12 normal · 8–11 risk · ≤7 malnütrisyon,
tavan 14).

#### BELGENİN KENDİ VERDİKTİ ÇÜRÜTÜLDÜ

CLAUDE.md `mna`yı *"`null` başlıyor — yanıt gelmeden hüküm basılmıyor"*
kovasına yazmıştı. **Aracı sürmek bunu çürüttü.** Kardeşleri (`ecog` ·
`karnofsky` · `must`) gerçekten öyle davranıyor; `mna` istisnaydı ve verdikt
tek tek ölçülmeden gruba yazılmıştı.

Bu, belgede zaten kayıtlı olan *"belgede 'şu sayfa şu sınıfı taşıyor'
yazması, taşıdığı anlamına gelmez"* kuralının araç tarafındaki hâli — ve bu
turda kuralı yazan belge tarafından çiğnenmişti.

#### DETEKTÖRÜM ÜÇ AYRI WIDGET TİPİNİ GÖREMEDİ — üç sahte aday

Ölçütüm "seçili kontrol sayısı 0 + varsayılanı olan alan yok + ekranda bant
var" idi. Üç araçta ateşledi ve **üçü de yanlış pozitif** çıktı; her biri
FARKLI bir kontrol tipi yüzünden:

| araç | detektörün göremediği | gerçek durum |
|---|---|---|
| `charlson` | `<select>`in görünür ilk seçeneği | yaş `"<50"` (0 puan) **görünür biçimde seçili** |
| `khorana` | **radyo** düğmeleri | kanser lokalizasyonu "Diğer (+0)" görünür seçili; ayrıca 4 alanda görünür normal varsayılan (300 · 12 · 8 · 24) |
| `esas` | **kaydırıcı** (`input[type=range]`) | 9 kaydırıcının 9'u da 0'da, her birinin yanında görünür cetvel ve renkli değer |

Üçü de belgede kayıtlı **"beyan edilmiş varsayım"** kovasında (`news2` ·
`psi-port` · `child-pugh` · `gcs` · `pap-score` ile aynı): hüküm, ekranda
GÖRÜNEN değerlerin aritmetiği. `mna` ise hiçbir şey göstermeden hüküm
basıyordu — ayrım tam burada.

**Aktarılabilir kural: "seçili" sinyali tek bir mekanizmada aranmaz.**
`aria-pressed` · `input:checked` · `<select>`in seçili `<option>`u ·
`input[type=range]`in konumu — dördü ayrı ayrı okunmalı. Bu, belgedeki
"erişilebilir adı TAM ZİNCİRLE hesaplat" kuralının seçim tarafındaki hâli:
tek mekanizmaya bakan ölçüm bir yönde ya da öbüründe yanılıyor.

Yanlış pozitiflerin bedeli de ölçülebilir: üçü de "düzeltilseydi" gerçekten
seçili olan varsayılanlar silinecek, çalışan üç araç bozulacaktı.

Bu turda temiz çıkanlar (yeniden sürmeye gerek yok): `must` · `ecog` ·
`karnofsky` · `dapsa` · `isth-dic` · `barthel` · `behcet` — dokunulmamış
hâlde hiçbiri hüküm basmıyor.

#### SINIF TAM KAPSAMLA KAPANDI — 130 aracın 130'u, dört mekanizmalı detektörle

Yukarıdaki 19'luk örneklem `mna`yı buldu ama örneklemdi. Detektör üç körlüğü
giderilmiş hâliyle **bütün araçlara** sürüldü. "Beyan edilmiş girdi" artık
dört mekanizmanın toplamı:

```
beyan = aria-pressed="true"  +  input:checked  +  degeri olan <select>
      +  input[type=range]   +  dolu text/number alani
```

Her araç için `h1` ve ölçülen öge sayısı da raporlandı — **"0 kusur" ile
"0 ölçüm" ayrımı raporun içinde**; 130 aracın 130'u gerçekten yüklendi
(öge sayısı 37–132 arası).

**Sonuç: 13 aday, YENİ KUSUR YOK.** On üçünün de kontrol tipi tek tek
SAYILDI (belgeye güvenilmedi):

| aday | kontrol | verdikt |
|---|---|---|
| `chads-vasc` 8 · `curb65` 5 · `endocarditis` 7 · `has-bled` 9 · `ipi` 5 · `padua` 11 · `qsofa` 3 · `ranson` 11 · `sle` 24 · `timi-ua` 7 · `wells-dvt` 10 · `wells-pe` 7 | **saf onay kutusu** (başka girdi yok, seçici yok, `aria-pressed` düğme yok) | işaretsiz = ölçüt YOK, gerçek bir cevap |
| `fibromiyalji` | 34 `aria-pressed` düğme, hiçbiri basılı değil | **hüküm BASMIYOR** — yalnızca WPI 0 · SS 0 · Toplam 0, yorum eklenmemiş |

Son satır ayırt edici ve `mna`dan farkını gösteriyor: `fibromiyalji` de
düğme tabanlı ve boş formda üç sıfır basıyor, ama o sıfırlara **hiçbir
klinik etiket bağlı değil**. `mna`da 0'ın yanında "Malnütrisyon (Kötü
Beslenme)" duruyordu. **Çıplak sayı bir hüküm değildir; hükmü yaratan şey
sayıya iliştirilen etikettir.**

`chads-vasc` ve `curb65` boş formda gerçek bir talimat basıyor
("Antikoagülasyon önerilmez" · "Ayaktan tedavi düşünülebilir") ve bir an
kusur sanıldı. Ayırt eden ölçüm kardeşlerine bakmak oldu: `has-bled`,
`padua`, `wells-*` de birebir aynı şekli taşıyor, yani sınıf TEKDÜZE ve
zaten karara bağlanmış — onay kutusu deyiminde "işaretlenmemiş" bir durum
değil, bir cevaptır.

**DÜZELTMENİN CANLIDA OLDUĞU AYRICA DOĞRULANDI — ve bu, taramanın pozitif
kontrolü.** Süpürme `mna`yı "temiz" raporladı; bu, detektörün körleşmesinden
de gelebilirdi. Sayfa doğrudan okundu: basılı düğme **0**, ekranda
**"SKOR – · 6 soru daha yanıtlanmalı"**. Yani sonuç dağıtımın inmesinden
geliyor. Bir taramanın "artık temiz" demesi, düzeltmenin canlıda olduğunu
GÖSTERMEZ — o ayrı bir ölçüm.

### BRANŞ ŞERİDİ 34 ARAÇLIK DÖNEMDEN KALMIŞTI — iki branşta hub'la ortak araç SIFIR

Branş sayfalarındaki "İlgili Hesaplayıcılar" şeridi `app/lib/tools.ts`
içindeki ELLE yazılmış `BRANCH_TOOLS` listesinden besleniyordu. Liste 34
araçlık dönemde doğruydu; kütüphane **130 araca** çıkarken güncellenmedi.

Kusuru bulan şey bir denetim değil, **aynı ilişkinin İKİ yerde tutulduğunu
fark etmek** oldu: hub kendi kategorilerini `TOOLS_DATABASE`te tutuyor,
branş sayfası ayrı bir listeden okuyor. Canlıda karşılaştırıldı:

| branş | branş şeridi | hub kategorisi | ortak |
|---|---|---|---|
| **hematoloji** | wells-dvt · has-bled · glasgow-blatchford | ipi · flipi · ipss-r · isth-dic · hscore | **0** |
| **palyatif** | ecog | karnofsky · pps · ppi · pap-score · esas | **0** |
| romatoloji | das28 · sle | 14 araç | 2 |
| onkoloji | 4 araç | 7 araç | 2 |

Yani hematoloji kütüphanesini okuyan biri, hematolojiye özgü **hiçbir**
skora o sayfadan ulaşamıyordu; palyatif bakımın beş özel aracı da öyle.
Deponun "elle yazılan liste içerik büyürken sessizce yalana dönüşür"
kuralının araç tarafındaki hâli — ana sayfanın "6+ araç" derken 114 araç
taşımasıyla aynı sınıf.

**Çare listeyi elle düzeltmek DEĞİL — aynı kusur birkaç tur sonra geri
gelirdi.** Eşleme `content/brans-arac.json`'a taşındı ve o dosya
`arac-metadata.cjs` tarafından **hub'ın kendi kategori verisinden**
üretiliyor. Elle tutulan tek şey 12 satırlık `BRANS_KATEGORI` haritası
(içerik branşı → hub kategorisi); araç listeleri ondan türüyor.

| ölçüt | önce | sonra |
|---|---|---|
| branştan ulaşılan benzersiz araç | **34** | **114** / 130 |
| hematoloji · palyatif ortak araç | 0 · 0 | 5 · 5 |
| `TOOLS` + `BRANCH_TOOLS` elle kayıt | 34 + 12 liste | **0** |
| "Tümü →" hedefi | koşulsuz `/tools` | `/tools?kategori=<branşın kategorisi>` |

**KRİTİK NEGATİF KONTROL: hiçbir araç KAYBOLMADI.** Eski listedeki 34
slug'ın 34'ü de yeni eşlemede duruyor — yani değişiklik kapsamı yalnızca
genişletti. Bir eşlemeyi türetmeye geçirirken sorulacak soru "yeni liste
doğru mu" değil, **"eskisinin hiçbir üyesi düştü mü"**.

Öteki negatif kontroller: `journal-club` (eşlemesi bilerek yok) şeridi hiç
basmıyor ve sayfası sağlam (`h1` 1); ters bağlantı zenginleşti
(`curb65` → enfeksiyon + göğüs, `ipi` → hematoloji + onkoloji,
`karnofsky` → palyatif — sonuncusunun eskiden hiç branş bağlantısı YOKTU).

**Şerit kırpılıyor ama kırpma GİZLEMİYOR:** 8 araçtan sonrası kesiliyor ve
bağlantı gerçek sayıyı yazıyor ("Tümü (14) →"). Sayı elle yazılmıyor,
listenin uzunluğundan geliyor.

**Ulaşılamayan 16 araç KUSUR DEĞİL** ve sebebi yapısal: Nöroloji, Allerji &
İmmünoloji, YBÜ ve Geriatri kategorilerinin içerik tarafında karşılık gelen
bir branşı YOK, yani bağlanacak bir branş sayfası da yok. Hub ve aramadan
ulaşılıyorlar.

#### Nöbetçi: `arac-metadata.cjs --kontrol` artık bu dosyayı da doğruluyor

Türetilmiş dosya committe duruyor (aynı `arac-index.json` kalıbı), yani
bayatlayabilir — ve bayatlaması SESSİZ olurdu: yeni bir hematoloji skoru
eklendiğinde şerit onu göstermez, hiçbir şey hata vermez.

**Üç negatif kontrol, üçü de çıkış kodu 1 veriyor:** bir araç çıkarıldığında
("araç listesi değişmiş: hematoloji"), bir branş silindiğinde ("eksik branş:
palyatif"), dosya bozulduğunda ("okunamadı ya da bozuk"). Senkron dosyada 0.

**ÇIKIŞ KODUNU BORU HATTINDA ÖLÇME — bu turda yine tuzağa düşüldü.**
`node … --kontrol 2>&1 | head -3; echo $?` üç bozuk durumda da **0**
bastı, çünkü `$?` `head`'in kodu. Belgede kayıtlı kural ("kapıyı sınayacaksan
komutu TEK BAŞINA çalıştır") burada bir kez daha gerekti; tek başına
çalıştırılınca 1/0 doğru çıktı.

#### Araç ikonu kategoriden DEĞİL aracın kendi sayfasından okunuyor

Kolay yol kategori ikonunu kullanmaktı ama o zaman nefrolojinin dokuz aracı
da aynı glifi taşırdı — eski elle listede araçlar ayrı ikonlar taşıyordu ve
bunu kaybetmek görsel bir gerileme olurdu. Üreteç her aracın `page.tsx`
dosyasındaki rozetten (`w-14 h-14 …`, 130 araçta birebir aynı şekil) glifi
okuyor; okunamazsa kategori ikonuna düşüyor, yani ayrıştırma kusuru sessiz
bir boşluk üretmiyor.

#### İstemci paketi maliyeti ÖLÇÜLDÜ, hisle karar verilmedi

Üretilen JSON `ToolTopNav` (istemci) üzerinden 130 araç sayfasının
paylaştığı chunk'a giriyor. "İkinci, küçük bir ters harita dosyası açayım mı"
sorusu sayıyla kapatıldı:

| | ham | gzip |
|---|---|---|
| `brans-arac.json` | 11 484 B | **2 560 B** |
| eski elle `tools.ts` verisi | 5 253 B | **2 159 B** |

Fark ~400 bayt (gzip). İkinci bir üretilmiş dosya ve ikinci bir modül açmaya
değmez; tek kaynak korundu. Araç sayfası ilk yükü 120 kB — Next'in inceleme
eşiği olan 130 kB'ın altında.

**ÖLÇÜM TUZAĞI — "her branşta Tümü bağlantısı `infuzyon`a gidiyor" SAHTE
alarmı.** Üretilen HTML'de `kategori=` arayıp `head -1` almak sayfa
BAŞLIĞINDAKİ kategori kısayollarını yakalıyordu. Ayırt edici işaret sayımdı:
branşın kendi kategorisi **iki kez**, ötekiler birer kez geçiyor. Çapa
"Tümü" metnine bağlanınca her branş kendi kategorisini gösterdi. Belgedeki
"aynı kelime birden çok yerde geçiyorsa çapayı benzersiz bir dizeye at"
kuralı — bu kez `head -1` biçiminde.

#### Düzeltme CANLIDA doğrulandı

| yüzey | canlıda ölçülen | düzeltme öncesi |
|---|---|---|
| `/topics/hematoloji` | **ipi · flipi · ipss-r · isth-dic · hscore** · Tümü → `?kategori=hematoloji` | wells-dvt · has-bled · glasgow-blatchford |
| `/topics/palyatif` | **karnofsky · pps · ppi · pap-score · esas** | ecog |
| `/topics/romatoloji` | 8 araç + **"Tümü (14)"** | das28 · sle |
| `/topics/nefroloji` | 8 araç + "Tümü (9)" | 5 araç |
| **negatif** — `/topics/journal-club` | şerit **0**, sayfa sağlam (`h1` 1) | aynı |
| ters bağlantı — `/tools/karnofsky` | **→ palyatif** | branş bağlantısı **YOKTU** |
| ters bağlantı — `/tools/ipi` · `/tools/curb65` | → hematoloji + onkoloji · → enfeksiyon + göğüs | ipi'nin yoktu |
| bağlantının hedefi — `?kategori=hematoloji` | tek bölüm, **5 araç**, "5 araç listeleniyor." | — |

Son satır ayrı bir ölçüm ve gerekliydi: bir bağlantıyı süzülmüş adrese
çevirmek, o adresin BEKLENEN içeriği gösterdiğini kanıtlamaz.

### KENDİ REFAKTÖRÜM BİR NÖBETÇİYİ SESSİZCE KÖRLEŞTİRDİ

Branş şeridi türetmeye geçirilince `app/lib/tools.ts` içindeki elle tutulan
listeler (`TOOLS` + `BRANCH_TOOLS`) kalktı. `arac-metadata.cjs --kontrol`
içindeki ölü-slug nöbetçisi **yalnızca o dosyaya bakıyordu** ve desenleri
artık hiçbir şeye eşleşmiyordu.

Ölçüldü: `TOOLS` desenine eşleşen kayıt **0**, `BRANCH_TOOLS` bloğu **YOK**.
Nöbetçi hata vermiyor, sessizce geçiyordu — yani "0 kusur" ile "0 ölçüm" bir
kez daha aynı görünüyordu ve körlüğü açan şey, nöbetçinin korumak için var
olduğu refaktörün kendisiydi.

**Kapsam daraltılmadı, GENİŞLETİLDİ.** Nöbetçi artık `app` · `lib` ·
`components` altındaki her `.ts`/`.tsx` dosyasında düz dize hâlindeki
`"/tools/<slug>"` bağlantılarını tarıyor: **532 dosya, 526 bağ.**
`link-denetim` bunu göremez — o yalnızca içerik JSON'larını tarıyor.

#### POZİTİF KONTROL, YENİ YAZDIĞIM YORUMU ÇÜRÜTTÜ

Yorumda "ana sayfadaki `FEATURED_TOOLS` vitrini de artık kapsamda" yazmıştım.
Ana sayfanın vitrinine kasten `heart-score` konuldu ve tarama **YAKALAMADI**.

Sebep: ana sayfa bağlantıyı ``href={`/tools/${tool.slug}`}`` şablonuyla
kuruyor, yani slug hiçbir zaman düz dize olarak yazılmıyor. **Nöbetçinin
önlemek için var olduğu "ilan ile gerçek ayrışıyor" kusuru, nöbetçinin kendi
yorumunda üretildi** — ve yalnızca pozitif kontrol gösterdi.

Çare ayrı bir **adı verilmiş liste denetimi**: şablonla adres kuran dört
dosya ölçüldü ve yalnızca birinde statik ARAÇ slug listesi var.

| dosya | slug kaydı | verdikt |
|---|---|---|
| `app/(site)/page.tsx` | 6 | **`FEATURED_TOOLS` — doğrulanıyor** |
| `app/(site)/topics/[slug]/page.tsx` | 0 | türetilmiş veriden okuyor |
| `app/components/SiteHeader.tsx` | 15 | **KATEGORİ ve BRANŞ slug'ı** — araç sayılsalardı 15 sahte kusur |
| `app/tools/ToolsIcerik.tsx` | 151 | kaynağın kendisi |

Liste **ADIYLA** aranıyor ve bulunamazsa nöbetçi düşüyor — adı değişen bir
liste onu bir daha sessizce körleştirmesin.

**Dört kontrolün dördü de tek başına çalıştırılarak ölçüldü** (boru hattında
`$?` `head`'in kodunu verir):

| kontrol | çıkış |
|---|---|
| temiz depo | **0** · "526 araç bağlantısı (532 dosya) geçerli" |
| ana sayfa vitrininde ölü slug (önce KAÇIRILIYORDU) | **1** |
| liste adı değiştirildi | **1** · "nöbetçi körleşti" |
| düz dize bağlantıda ölü slug | **1** |

**Aktarılabilir kural: bir listeyi türetmeye geçirirken, o listeyi izleyen
NÖBETÇİLERİ de say.** Kaldırdığın şey bir kusur kaynağı olabilir ama aynı
zamanda bir denetimin ÖLÇÜM YÜZEYİdir; yüzey kaybolunca denetim susar, düşmez.

### 31.8 EKRANLIK KONU SAYFASINDA SAYFA İÇİ GEZİNME YOKTU

Konu uzunluğunun KISA ucu ölçülmüştü (10 iskelet konu); uzun uç hiç
ölçülmemişti. Ölçüldü — 410 görünür konu:

| ölçüt | değer |
|---|---|
| ortanca gövde | 3 002 krk |
| %90 · %95 dilim | 636 · 405 |
| **en uzun** | **23 206 krk** (`enfeksiyon/invazive-mantar-enfeksiyon`) |
| 12 000+ karakter | 15 konu, ortalama 14 alt başlık |

En uzun konu **canlıda 390px genişlikte** sürüldü:

| ölçüt | sonuç |
|---|---|
| belge yüksekliği | **26 803 px = 31.8 ekran** |
| `h2` + `h3` | 15 + 17 = 32 başlık |
| sayfa içi çapa | **0** (yalnızca atlama bağlantısının `#icerik`i) |
| `id` taşıyan başlık | **0** |
| `<details>` akordeon | 0 |

Yani "tedavi" bölümünü arayan okuyucu 30 ekran kaydırmak zorundaydı ve bir
bölüme bağlantı vermek ya da yer imi koymak **imkânsızdı**.
(`TableOfContents.tsx` depoda duruyor ama ölü kod — sıfır içe aktaran.)

**İki ayrı çare, iki ayrı kapsam:**

- **Bölüm kimlikleri HER konuda** basılıyor (`app/lib/baslik.ts` →
  `bolumKimlikleri`). Nitelik eklemek `textContent`i DEĞİŞTİRMEZ, yani
  bedava ve derin bağlantıyı 410 sayfada birden açıyor. Üretilen çıktıda
  **2 057 bölüm kimliği**, kırık sayfa içi çapa **0**.
- **İçindekiler EŞİĞE bağlı.** Eşik veriden seçildi, uydurulmadı:

  | ölçüt | konu |
  |---|---|
  | ≥4 bölüm | 366 — çoğunluk, kısa konuda gürültü olurdu |
  | ≥6000 karakter | 50 — ~7+ ekran, kaydırma gerçekten acıtıyor |
  | **ikisi birden** | **50 (%12)** |

  Üretilen 423 konu HTML'inde **52 sayfa** TOC aldı (kısaltma açılımı birkaç
  konuyu eşiğin üstüne taşıyor).

#### ⚠ İÇİNDEKİLER `[data-readable]` KONTEYNERİNİN DIŞINDA — ve bu ZORUNLU

Vurgular konteyner metnindeki **karakter ofsetiyle** saklanıyor. TOC içeri
konsaydı ondan sonraki bütün ofsetler kayardı ve deponun kendi kuralı gereği
("ofset çözülüyor ama metin tutmuyor" → SİLİNİR) **kullanıcıların kayıtlı
vurguları sessizce yok olurdu.**

Bu yüzden belirleyici negatif kontrol vurgu değil **karakter sayısı**:

| ölçüm | değer |
|---|---|
| okuma alanı, değişiklikten ÖNCE (canlı) | **23 986** |
| okuma alanı, değişiklikten SONRA (yerel) | **23 986** |

Birebir aynı, yani ofsetler kaymadı. Bir okuma yüzeyine DOM eklerken
sorulacak soru "görünüm bozuldu mu" değil, **"konteynerin metni değişti mi"**.

#### Doğrulama — dört sınır vakası ve dördü de eşiğin iki yanından

| konu | bölüm · karakter | TOC |
|---|---|---|
| `endokrinoloji/adrenal-bez-hastaliklari` | 1 · 203 | **yok** (ama 1 bölüm kimliği var) |
| **`endokrinoloji/addison`** | **7 · 4 888** | **yok** — bölüm sayısı TEK BAŞINA tetiklemiyor |
| `enfeksiyon/vankomisin-master-rehber` | 5 · 6 007 | **var** |
| `romatoloji/behcet-vaskuler-tutulum` | 6 · tekrarlı başlık | **var**, 6 benzersiz id |

İkinci satır ayırt edici: eşik uzunluğa bağlı, bölüm sayısına değil.

**ÇİFTLENEN BAŞLIK sessiz bir kusur olurdu:** aynı başlık iki bölümde
geçiyorsa (depoda bir konu böyle) çakışan id ilk hedefe götürür ve ikinci
bölüme ULAŞILAMAZ — bağlantı yine de "çalışıyor" görünür. İkinciden itibaren
sıra eki konuyor (`…-2`); ölçüldü, 6 bölüm 6 benzersiz id.

#### Ölçülen davranış ve erişilebilirlik

| ölçüt | sonuç |
|---|---|
| çapa tıklaması | 0 → 6 939 kaydırdı, doğru bölüme gitti |
| başlık yapışkan çubuğun altında mı | evet — başlık 96px, çubuk alt sınırı 65px (`scroll-mt-24`) |
| landmark · liste | `<nav aria-labelledby>` · `<ol>` |
| bağ kontrastı | **8.72** (eşik 4.5) |
| dokunma hedefi | 43px (masaüstü) · 62px (mobil) |
| **320px yatay kayma** | **0** |
| TOC başlığı yazı tipi / üst boşluk | Inter · 0px — belgedeki "`<h2>` serif ve 24px getirir" tuzağı `font-sans mt-0` ile karşılandı |

Türkçe katlama başlık→id dönüşümünde ELLE kuruldu; `toLowerCase()` `İ`yi
noktalı bırakıyor ve `ı`/`i` ayrımı bu depoda daha önce üç kez yanlış sonuç
verdi. Ölçüldü: `Işık Mikroskobu` → `bolum-isik-mikroskobu`,
`TEDAVİ` → `bolum-tedavi`, `İzlem` → `bolum-izlem`.

`bolum-` öneki bilerek var: bir bölüm "içerik" adını taşısa bile atlama
bağlantısının hedefini (`#icerik`) çalamasın.

### ÜCRETLİ İÇERİKTE ALTI BAŞLIK EKRANA HİÇ BASILMIYORDU

Premium konu uzunluğu ölçülürken çıktı. `IcerikBloklari.tsx`'teki tip tanımı
şuydu:

```ts
| { tip: 'bilgi_kutusu'; tur: 'ek_bilgi' | 'uyari' | 'pratik'; metin: string }
```

`baslik` alanı TİPTE YOK — ve render da onu görmüyordu. Ama VERİ onu
taşıyor.

Ölçüldü: 41 premium konuda **174 bilgi kutusu**, **6'sı `baslik` taşıyor** ve
**altısı da ekrana hiç basılmıyordu.** Kutu yalnızca türünün genel etiketini
("Uyarı", "Ek bilgi", "Pratik not") gösterip doğrudan gövdeye giriyordu.

**KAYIP GERÇEK Mİ diye ayrıca ölçüldü** — başlık gövde metninde
tekrarlanıyorsa kayıp yoktur. Altısı da tekrarlanmıyor:

| tür | ekrana ulaşmayan başlık |
|---|---|
| uyarı | **"Adım 3 — Beta-Blokörde Hayati Kural: Önce Alfa!"** |
| uyarı | **"Rebound Hipoglisemi: Hayatı Tehdit Eden Komplikasyon"** |
| uyarı | "Feokromositoma Krizi: Tanı ve Acil Yönetim" |
| ek bilgi | "Geroula Pre-test Klinik Skorlaması" |
| pratik | "Preanalitik Hayati Kurallar: Yalancı Pozitifliği Önleme" |
| pratik | "Uzun Dönem Takip Protokolü" |

Yani okuyucu kutunun NE HAKKINDA olduğunu göremiyor, doğrudan
"PPGL klinik şüphesini standardize etmek amacıyla…" diye başlayan bir gövdeye
düşüyordu. Altısı da aynı sayfada (`endokrinoloji/feokromositoma`) ve klinik
olarak en sivri satırlar arasında.

Bu, deponun **"ilan ile gerçek ayrışıyor"** sınıfının içerik tarafındaki hâli:
veri bir alan beyan ediyor, render onu yok sayıyor ve **hiçbir kapı görmüyor**
— üstelik tip tanımı alanı hiç bilmediği için `tsc` de sessiz kalıyordu.
Tip, kusuru yakalamak yerine GİZLEYEN taraftaydı.

#### İLK RENK SEÇİMİM KONTRAST KUSURU ÜRETİYORDU — ölçüm yakaladı

Başlığa kutunun sol kenar tonu (`solKenar`) verilmişti; hesaplanınca:

| tür | `solKenar` | `etiketRenk` |
|---|---|---|
| ek bilgi | 10.45 | 10.45 |
| **uyarı** | **2.63** ✗ | **6.38** ✓ |
| pratik | 6.57 | 6.57 |

`solKenar` bir ÇİZGİ rengi, `etiketRenk` ise metin için seçilmiş. Bir kusuru
düzeltirken renk seçerken **o rengin ne için tasarlandığına** bak; kutuda
"uyumlu görünen" ton okunabilir ton olmayabilir.

Canlı ölçüm (geçici dev rotası, gerçek veriyle) tahminle birebir tuttu:
altı başlık 15px, kontrast **10.45 · 6.38 · 6.57 · 6.38 · 6.38 · 6.57**.

**Negatif kontrol:** başlığı OLMAYAN kutular boş başlık almamalı. Yedi
başlıksız kutu taşıyan bir konu render edildi — **`<h3>` sayısı 0**, boş
başlık 0, tür etiketleri ve gövde yerinde. Değişiklik tamamen ekleyici.

Geçici rota silindi ve doğrulandı: `/zz-olcum-kutu` 404, ana sayfa ve
`/topics` 200, `tsc` temiz.

#### Yan ölçüm: premium konular AÇIK TARAFTAN belirgin daha uzun

| | açık taraf | premium |
|---|---|---|
| konu | 410 | 41 |
| ortanca gövde | 3 002 krk | **6 676 krk** |
| en uzun | 23 206 | 14 504 |
| ≥4 başlık **ve** ≥6000 krk | 50 konu (**%12**) | **25 konu (%61)** |

Yani açık tarafta içindekiler eklenmesini gerektiren durum premium tarafta
beş kat yaygın. Premium konu sayfasında da sayfa içi çapa ve başlık `id`si
YOK — ölçüldü, sonraki turun işi olarak duruyor.

#### İçindekiler CANLIDA doğrulandı — ve kritik kontrol karakter sayısı

| ölçüt | canlıda |
|---|---|
| uzun konu (`invazive-mantar-enfeksiyon`) | TOC **var** · 12 bölüm id · 12 çapa · kırık **0** |
| **`addison` (7 bölüm, 4 888 krk)** | TOC **yok** ama **7 bölüm id var** — derin bağlantı her yerde, TOC yalnızca gerekince |
| `behcet-vaskuler-tutulum` (tekrarlı başlık) | TOC var · **6 benzersiz id** |
| **okuma alanı karakter sayısı** | **23 986** — değişiklik ÖNCESİYLE birebir |
| TOC `[data-readable]` dışında mı | **evet** |
| derin bağlantı (`…#bolum-…` ile açılış) | çalışıyor: 7 779 kaydırdı, başlık 96px (yapışkan çubuk 65px) |

Dördüncü satır bu değişikliğin en önemli ölçümü: vurgular karakter ofsetiyle
saklandığı için okuma alanının metni değişseydi kayıtlı vurgular silinirdi.
Sayı canlıda da birebir aynı.

### PREMIUM KONU SAYFASI 320px'te 593px YATAY KAYIYORDU — kapı arkasında olduğu için hiç ölçülmemiş

Premium tarafa içindekiler eklenirken çıktı ve **benim değişikliğim değildi.**

Belgede "320px sınıfı ölçümle kapatıldı, bütün düzen ailelerinde kayma 0"
yazıyor ve listede `(ydus)` premium düzeni de var. Ama o ölçüm **branş ve
pano** sayfalarına aitti; konu sayfası `AccessGate` arkasında ve kapı
açılmadan iframe'e alınamıyor. **Kapı arkasındaki bir yüzey, kapı açılmadan
ölçülmüş sayılmaz** — belgede zaten kayıtlı olan kuralın düzen tarafındaki
hâli.

Ölçüldü (kapı geçici açılarak, 320px):

| ölçüt | değer |
|---|---|
| yatay kayma | **593 px** |
| belge genişliği | 898 px (görünüm 320) |
| hesaplanan ızgara | **`652.406px 210px`** |

İki kusur üst üsteydi:

1. **Kırılma noktası yok** — `gridTemplateColumns: '1fr 210px'` satır içi
   yazılmış ve satır içi stil medya sorgusu taşıyamıyor, yani 210px'lik
   kenar çubuğu 320px'lik ekranda da yan yana duruyordu.
2. **`1fr` min-content'in altına inemiyor** — ana kolon 652px'e şişiyordu.
   Çare `minmax(0, 1fr)`.

Kural `globals.css` sonuna alındı (`.premium-konu-izgara`), 900px altında
tek kolon. Premium tarafın geri kalanı satır içi stil kullanmaya devam
ediyor; taşınan tek şey medya sorgusu gerektiren bu kural.

**Dört genişlikte ölçüldü — masaüstü düzeni korunuyor:**

| genişlik | kayma | ızgara |
|---|---|---|
| 320 | **0** (önce 593) | tek kolon 273px |
| 375 | 0 | tek kolon 328px |
| 768 | 0 | tek kolon 721px |
| 1280 | 0 | **738px + 210px** — iki kolon, değişmedi |

**Kapsam ölçüldü:** `px` taşıyan sert ızgara premium ağacında yalnızca bu
sayfadaydı (grep, `(ydus)` altı) — yani sınıf tek örnekli.

#### A/B OLMASA KUSUR BANA YAZILIRDI

Kayma ilk kez içindekiler eklendikten sonra ölçüldü ve taşan öge listesinin
başında benim `<nav>`ım duruyordu (652px genişlik). Doğal okuma "TOC taşırdı"
olurdu.

Ayırt eden ölçüm A/B oldu: içindekiler koşulu geçici olarak `false &&` ile
kapatılıp aynı sayfa yeniden ölçüldü — **kayma yine 593.** Yani `<nav>` 652px
DEĞİLDİ, kapsayıcısı 652px'ti ve nav onu dolduruyordu.

**Bir öge "taşıyor" görünüyorsa, önce KAPSAYICISININ genişliğini oku.**
Taşan öge listesi sebebi değil sonucu gösterir.

#### İçindekiler — premium tarafta da eklendi

Aynı eşik (≥4 başlık **ve** ≥6000 karakter) ama premium tarafta beş kat sık:
41 konunun **25'i (%61)**, açık tarafta 410'un 50'si (%12).

| ölçüt | sonuç |
|---|---|
| çapa · bölüm kimliği | 23 · 23 · **benzersiz 23** · kırık **0** |
| TOC `[data-readable]` dışında | evet |
| **okuma alanı karakter sayısı** | **4 922 — TOC'lu ve TOC'suz ölçümde birebir aynı** |
| dört genişlikte kırık çapa | 0 |

Üçüncü satır kritik: vurgular karakter ofsetiyle saklandığı için okuma
alanının metni değişseydi kayıtlı vurgular silinirdi. A/B ölçümü bunu da
kanıtladı.

Kimlik üreteci açık taraftaki konu sayfasıyla ORTAK (`app/lib/baslik.ts`),
ve içindekiler ile gövde AYNI blok dizisinden besleniyor: iki yerde ayrı
dizi kullanılsaydı (biri ham, öteki kısaltması açılmış) kimlikler ayrışabilir
ve bağlantılar hiçbir yere gitmezdi. `kisaltmaAcBloklar` bugün `baslik`
alanına dokunmuyor — ama kurgu buna güvenmiyor.

**Kapı geri kondu ve doğrulandı:** sayfa yeniden "Erişim Kısıtlı" basıyor,
kaynakta geçici ölçüm izi 0.

### ÜCRETLİ ÇALIŞMA MOTORLARINDA HİÇ BAŞLIK YOKTU — ve quiz setinin adı da atılıyordu

Premium konu sayfasının 320px kusuru "kapı arkasındaki yüzey ölçülmemiş"
sınıfını açtı. Aynı körlük **beş motor** için de geçerliydi: `quiz-coz` ·
`hizli-tekrar` · `inciler` · `vaka-coz` · `soru-cozum`. Beşinin kapısı da
geçici olarak açılıp ölçüldü.

**Taşma tarafı TEMİZ çıktı** (320px): dördünde de kayma **0**, taşan öge
**0**. Motorlar `maxWidth` + `width:100%` kullanıyor, sert ızgara yok
(`px` taşıyan `gridTemplateColumns` premium ağacında yalnızca konu
sayfasındaydı).

**"0 taşma" körlükten gelmiyor** — pozitif kontrol: 900px'lik bir tohum
eklenince kayma 0 → **595**, belge genişliği 900. İçerik de gerçek (quiz'de
dört şık "SDHB/SDHD/RET/VHL", flashcard'da "Biliyorum · Yanıtı gör").

#### Asıl bulgu: `h1` ve `h2` sayısı SIFIR

| yüzey | h1 | h2 |
|---|---|---|
| `quiz-coz` (gerçek motor hâli) | **0** | **0** |
| `hizli-tekrar` (gerçek motor hâli) | **0** | **0** |
| `/tr/premium/ydus` (kıyas) | 1 | 2 |

Ücretli çalışma yüzeyinde belgeyi adlandıran hiçbir başlık yoktu; ekran
okuyucuyla gelen kullanıcının yönelecek bir çapası bulunmuyordu.

**Ve quiz'de ad ELDE VARDI:** `QuizVeri.baslik` tipte tanımlı, veri
dosyasında dolu ("Feokromositoma ve Paragangliyoma — YDUS Soru Seti 1"),
bileşene prop olarak geliyor — **hiçbir yerde render edilmiyordu.** Aynı
turda premium bilgi kutularında bulunan *"veri ilan ediyor, render yok
sayıyor"* kusurunun **ikinci örneği**.

`hizli-tekrar`da ad zaten ekrandaydı ama düz bir `span`di; yeni metin
eklenmedi, var olan ad anlamlandırıldı.

#### KOYU ve AÇIK yüzey aynı turda — tek renk ikisine birden uymuyor

İlk denemede iki motora da aynı ton verildi (`#4a6a8a`). Ölçüm ayırdı:

| motor | zemin | `#4a6a8a` ile |
|---|---|---|
| `hizli-tekrar` | açık | **5.65** ✓ |
| `quiz-coz` | **`rgb(2,6,23)` koyu** | **3.57** ✗ |

Belgedeki kural burada bir kez daha işledi: *"koyu bir zemine yazı
basıyorsan rengini KENDİN ver."* Koyu yüzeyde `#94a3b8` → **7.87**.

Ayırt eden ölçüm ata zincirinin arka planını okumak oldu; iki kardeş motorun
YÜZEY RENGİ farklı ve bunu ancak ikisini birden ölçmek gösteriyor.

**Doğrulama:** iki motorda da `h1` tam **1**, yazı tipi Inter/system-ui
(serif değil — `globals.css`'in h1 tuzağı satır içi geri alındı), üst boşluk
**0px**, 320 ve 1100px'te kayma 0, düğmeler yerinde (5 ve 4).

**Beş kapı geri kondu ve doğrulandı:** kaynakta geçici iz **0**, kapı çağrısı
**5/5**, ve dört rota canlıda yeniden "Erişim Kısıtlı" basıyor.

**Ölçüm notu:** `inciler` ve `vaka-coz` verdiğim parametrelerle BOŞ DURUM
gösterdi ("Bu konunun incileri yok", "Bir vaka seçin") — yani onların gerçek
motor hâli ölçülmedi ve "başlık var" DENMİYOR. Boş durumda ikisinde de `h1`
1 çıkıyor, ama o başlık boş durumun başlığı.

### VAKA ŞEMASI KARIŞIK — bir vakanın adı hiç basılmıyordu

Geçen tur `inciler` ve `vaka-coz` "gerçek motor hâlinde ölçülmedi" diye açık
bırakılmıştı. Doğru parametrelerle (`?branch=…&id=<vaka-dosyası>`) kapatıldı.

**`inciler` TEMİZ:** gerçek içerikle `h1` **1** ("AML Onkolojik Aciller ve
Nakil İncileri"), 320px'te kayma 0, 235 öge.

**`vaka-coz` iki kusur taşıyordu ve ikincisi ancak birincisi düzeltilince
göründü** — belgede kayıtlı "bir kusur ikincisini gizler" kalıbı:

1. **Başlık ögesi yoktu.** Vakanın adı ekrandaydı ama düz bir `div`di;
   `h1` ve `h2` sayısı **0**. Kardeş motorlarla (`quiz-coz`, `hizli-tekrar`)
   aynı boşluk. `div` → `h1` yapıldı, görünüm değişmedi.
2. **Ad `h1`e taşındıktan sonra metnin BOŞ olduğu görüldü.** Sebep şema:

| şekil | vaka | motorun okuduğu `veri.baslik` |
|---|---|---|
| düz (`baslik` üst düzeyde) | **10 / 11** | dolu |
| yalnızca `meta.baslik` | **1** (`endokrinoloji/feokromositoma-vaka-1`) | **undefined** |

Yani o vakanın adı ("Rastlantısal Sol Adrenal Kitle — Kompozit Adrenal
Tümör") en baştan beri ekrana hiç basılmıyordu; `div` boş çiziliyor ve
kimse fark etmiyordu. **Boş bir `div` görünmez, boş bir `h1` ise ölçülebilir**
— başlık ögesine çevirmek kusuru görünür kıldı.

Bu, aynı oturumda üçüncü kez çıkan **"veri ilan ediyor, render yok sayıyor"**
sınıfı (premium bilgi kutusu başlıkları · quiz seti adı · vaka adı).

**İçerik dosyasına DOKUNULMADI** (içerik kullanıcının sorumluluğu); düzeltme
okuma tarafında ve iki şekli de kabul ediyor (`{...meta, ...ham}` — üst düzey
öncelikli, yani bugünkü çoğunluğun davranışı korunuyor). Aynı düzleştirme
vaka SEÇİM LİSTESİNE de kondu: orası da künyeyi ham dosyadan okuyordu.

**Doğrulama, negatif kontrolüyle:**

| vaka | sonuç |
|---|---|
| `feokromositoma-vaka-1` (meta şekilli) | başlık **basılıyor**; `meta`da `zorluk`/`sure_dk` YOK, o yüzden yalnızca "Vaka" rozeti — uydurma yok |
| **negatif** — `aml-ana-vaka-1` (düz şekilli) | **değişmedi**: başlık + "orta" + "~12 dk" + "Vaka" |

#### ÖLÇÜM ARTEFAKTI — `grep 'veri\.[a-zA-Z]*'` alt çizgiyi kesiyor

Bir ara "motor `veri.sure` okuyor ama dosyalarda `sure_dk` var, süre hiç
basılmıyor" diye ikinci bir kusur raporlanacaktı. **Yanlıştı:** kaynakta
`veri.sure_dk` yazıyor, benim desenim `[a-zA-Z]*` olduğu için `_` görünce
duruyordu.

Alan adı taraması yaparken karakter sınıfına `_` koy — yoksa
`snake_case` alanlar yarım okunur ve olmayan bir ayrışma uydurulur.

**Beş kapının beşi de geri kondu ve doğrulandı** (geçici iz 0, kapı çağrısı
yerinde, canlıda "Erişim Kısıtlı"). `vaka-coz` yedekten KOPYALANMADI: aynı
dosyada okuyucu düzeltmesi de vardı ve kopyalamak onu silerdi — kapı satırı
tek tek geri yazıldı.

### PREMIUM MOTOR SÜPÜRMESİ TAMAMLANDI — beşinin beşi de ölçüldü

`soru-cozum` (kokpit) süpürmenin dışında kalmıştı; kapatıldı. Beş gated
motorun tamamı artık GERÇEK verisiyle render edilip ölçülmüş durumda:

| motor | 320px kayma | başlık — ölçüm öncesi | sonra |
|---|---|---|---|
| `quiz-coz` | 0 | `h1` 0 · `h2` 0 | `h1` 1 (set adı, veriden — hiç basılmıyordu) |
| `hizli-tekrar` | 0 | `h1` 0 · `h2` 0 | `h1` 1 (ad ekrandaydı, `span`di) |
| `vaka-coz` | 0 | `h1` 0 · `h2` 0 | `h1` 1 + şema düzleştirmesi |
| **`soru-cozum`** | 0 | **`h1` 0 · `h2` 1** | **`h1` 1 · `h2` 0** |
| `inciler` | 0 | `h1` 1 | zaten temizdi |

**Kokpit sınıfın daha HAFİF biçimiydi ve ayrımı kaydetmeye değer:** ötekilerde
başlık ögesi HİÇ yoktu; burada başlık VARDI ama düzeyi yanlıştı — belge en üst
başlığı olmadan doğrudan `h2`den başlıyordu. Dönüşümden sonra sayfada başka
`h2` kalmadığı için atlanan düzey de oluşmuyor.

Ölçüm: `h1` 1 · `h2` 0 · kontrast **17.85** · yazı tipi Inter (serif değil) ·
üst boşluk 0px · 320 ve 1100px'te kayma 0 · düğme 5 · öge sayısı 160
(değişmedi).

**Beş kapının beşi de yerinde** (geçici iz 0, kapı çağrısı 5/5) ve kokpit
canlıda yeniden "Erişim Kısıtlı" basıyor.

**Aktarılabilir kural:** bir sınıfı süpürürken listeyi ROTA DOSYALARINDAN
çıkar, elde tuttuğun örnekten değil. Bu süpürme dört rotayla başladı; beşinci
yalnızca `AccessGate` kullanan dosyaları saydığımda göründü — ve o beşinci,
sınıfın en kolay kaçan biçimini taşıyordu.

### İÇİNDEKİLER DEĞİŞİKLİĞİ VURGU DÖNGÜSÜYLE SINANDI — uçtan uca temiz

Karakter sayısı ölçümü (23 986 → 23 986) ofsetlerin kaymadığını gösteriyordu
ama **gerçek bir vurgu hiç kurulmamıştı.** İçindekiler taşıyan bir sayfada
döngünün tamamı sürüldü: seç → vurgula → yeniden yükle → yeniden boya.

| adım | ölçüm |
|---|---|
| seçim | okuma alanındaki metin düğümünde 10–50 karakter |
| araç çubuğu | 250 ms'de beliriyor, sekiz düğme adlı (Sarı · Yeşil · Mavi · Pembe · Kalınlaştır · Altını çiz · Not defterine gönder · Kopyala) |
| kayıt | `medisea:marks:v2:<yol>` · ofset **77–117** · stil `y` |
| **yeniden yüklemeden sonra kayıt** | **hayatta** (1 kayıt) — yani ofset çözüldü VE metin tuttu |
| **boyanan metin = kayıttaki metin** | **BİREBİR** |
| okuma alanı | **23 986** — değişmedi |
| içindekiler konteyner dışında | evet |

Dördüncü satır belirleyici: deponun kuralı gereği "ofset çözülüyor ama metin
tutmuyor" olan vurgu SİLİNİR. Kaydın yeniden yüklemeden sağ çıkması,
içindekiler bloğunun okuma alanının metnine hiç dokunmadığının davranışsal
kanıtı — sayı ölçümünden daha güçlü.

Boyama `linear-gradient(transparent 55%, rgba(250,204,21,…))` ile yapılıyor;
belgede kayıtlı "vurguyu `backgroundColor` ile yoklama" tuzağı burada da
geçerli.

**Ölçüm notu — ilk deneme "araç çubuğu yok" dedi ve YANLIŞTI.** Seçim
kurulup `selectionchange` gönderildikten sonra 700 ms beklendi ve çubuk
bulunamadı; aynı adımlar 250 ms'lik aralıklarla YOKLANARAK tekrarlandığında
çubuk ilk yoklamada çıktı. Tek bir bekleme süresine dayanan ölçüm bu ortamda
güvenilmez (panel gizliyken zamanlayıcılar kısılıyor) — **beklemek yerine
yokla.**

**Ölçüm izi temizlendi:** `medisea:*` anahtarları silindi ve **0** olduğu
sayıldı. Silinenler arasında belgede "önceki turdan kalmış" diye kayıtlı
`medisea:kartlar:v1:fc-endo-akromegali-001` de vardı — o kalıntı da kapandı.

### YÖNETİM EDİTÖRÜ ÇIPLAK KOD HARFİ GÖSTERİYORDU — aynı ilişki iki yerde

Açık taraf "veri ilan ediyor, render yok sayıyor" ekseninde tarandı ve
**temiz çıktı**: 456 dosyadaki bütün alanlar tüketiliyor
(`title` · `summary` · `meta.order/tags/updatedAt/parent/hidden` ·
`sections.heading/html/text/visibility`), görünür konularda **2 057 bölümün
0'ı başlıksız, 0'ı boş gövdeli**. Sınıf premium'a özgüymüş.

Ama tarama başka bir ayrışma gösterdi — `visibility` kodu İKİ YERDE ayrı
yorumlanıyordu:

| yer | ne yapıyor |
|---|---|
| yönetim editörü | `<option>V</option> <option>M</option> <option>P</option>` — **çıplak harfler** |
| konu sayfası | `visibility === 'M' ? 'Sadece Hekim' : 'Taslak'` |

Yani operatör `P` seçtiğinde açık sayfada **"Taslak"** rozeti çıkacağını
hiçbir yerden göremiyordu; editör kodun ANLAMINI değil KENDİSİNİ gösteriyordu.
Deponun "aynı ilişki iki yerde ayrı tutulursa ayrışır" sınıfının **operatör**
tarafındaki hâli.

Eşleme `app/lib/gorunurluk.ts`e alındı; iki yüzey de oradan besleniyor.
**Davranış değişmedi** — `V` rozetsiz, `M` "Sadece Hekim", `P` ve tanınmayan
her değer "Taslak" (konu sayfasının eski eşlemesinin birebir aynısı).

| ölçüt | sonuç |
|---|---|
| `aml-gilteritinib-ds-yonetimi` (1 `M` bölüm) | "Sadece Hekim" — değişmedi |
| `aml-gilteritinib-midostaurin` (1 `M` bölüm) | "Sadece Hekim" — değişmedi |
| **negatif** — `addison` (7 bölüm, hepsi `V`) | rozet **0** |
| boş rozet | **0** |

**⚠ ROZET BİR ERİŞİM KISITI DEĞİL, BEYAN — ve bu ölçüldü.** İçerikte `V`
dışında yalnızca **2 bölüm** var, ikisi de `M` ve ikisi de GÖRÜNÜR konuda;
içerikleri (728 ve 378 karakter) herkese basılıyor. `visibility` hiçbir yerde
süzgeç olarak kullanılmıyor — yalnızca rozet üretiyor. Bunu değiştirmek
içerik/erişim politikası kararıdır; ölçüldü, kaydedildi, DEĞİŞTİRİLMEDİ.

**Kapsam dürüstlüğü:** yönetim editörünün yeni etiketleri RENDER EDİLEREK
doğrulanmadı — `/admin/*` middleware ile `/giris`e yönlendiriliyor ve o kapıyı
açmak auth katmanına dokunmak demek. Tip denetimi geçiyor ve etiketler ortak
sözlükten türüyor; "ekranda görüldü" DENMİYOR.

### OTURUM İÇİ GERİLEME TARAMASI — canlıda, ölçekte

Bu oturumda konu sayfasına üç ayrı değişiklik yapıldı (içindekiler · bölüm
kimlikleri · görünürlük rozeti tek kaynağa). Üçü de tek tek doğrulanmıştı;
ÖLÇEKTE hiç bakılmamıştı.

**Site haritasından eşit aralıklı 20 konu sayfası canlıda tarandı:**

| ölçüt | sonuç |
|---|---|
| `<h1>` sayısı 1 olmayan | **0** |
| `<main>` sayısı 1 olmayan (çift landmark) | **0** |
| **kırık sayfa içi çapa** | **0** |
| toplam bölüm kimliği | 105 |
| içindekiler alan sayfa | 2 / 20 (%10 — eşikle tutarlı) |
| gövdesi boş (<3000 bayt) | 0 |
| istek hatası | 0 |

**HİDRASYON ayrıca ölçüldü** — içindekiler sunucuda basılıp istemcide
eşleşmezse kusur YALNIZCA konsolda görünür. Taze sekmede gerçek gezinmeyle
üç yüzey tarandı: konu sayfası (TOC'lu) · branş sayfası (araç şeridi
türetmesi) · araç sayfası. **Yeni konsol mesajı yok.**

**"Log yok" körlükten gelmiyor:** `console.error` + `console.warn` tohumu
atıldı ve **ikisi de yakalandı**. Sonraki sayfalarda yalnızca o iki tohum
görünüyor, yani okuyucu çalışıyor ve sayfalar gerçekten sessiz.

Aynı taramada `mna` düzeltmesi canlıda bir kez daha doğrulandı: basılı düğme
**0**, büyük metin **"–"**, bant **"6 soru daha yanıtlanmalı"** — ve araç
kabuğu değişiklikleri de yerinde (📚 Kütüphane bağlantısı, ARACI PAYLAŞ).

### KAPISIZ PREMIUM SAYFALAR TARANDI — akordeon durumu ekran okuyucuya hiç bildirilmiyordu

Kapı ARKASINDAKİ beş motor süpürülmüştü; **kapısız** premium sayfaları
(tanıtım · pano · profil · liderlik · 9 branş) başlık ve taşma ekseninde hiç
ölçülmemişti. Dokuzu canlıda tarandı ve künye tarafı temiz: **hepsi 200,
`h1` 1, `main` 1**, gerçek gövde (6.5–23 KB).

Ama branş sayfalarında **`h2` sayısı 0** çıktı — 6–14 kategori listeleyen bir
sayfada hiçbir başlık yapısı yok. Kaynağa bakılınca üç boşluk daha göründü:

| ölçüt | önce | sonra |
|---|---|---|
| kategori başlığı `h2` içinde | **hayır** (`h2` 0) | **evet** (`h2` **6**) |
| `aria-expanded` | **YOK** — açık/kapalı durumu hiç bildirilmiyordu | var, tıklamayla `true`↔`false` |
| `aria-controls` + panel `id` | YOK | var, açıkken çözülüyor |
| süsleme oku `▾` | ada karışıyordu | `aria-hidden` |

İkinci satır en ağırı: ekran okuyucuyla gezen kullanıcı için düğme **açıkken
ve kapalıyken aynı şeyi söylüyordu**, yani akordeonun durumu görünmüyordu.

**Görünüm DEĞİŞMEDİ ve bu ölçüldü:** `<h2>` yalnızca anlam için eklendi;
`globals.css` h2'ye serif ve 24px boşluk veriyor (belgede kayıtlı tuzak),
satır içi stil boyut/ağırlık/tipi devralarak geri alıyor. Ölçüm: yazı tipi
**system-ui**, boyut **16px**, üst boşluk **0px**.

**Erişilebilir ad temiz:** emoji zaten `aria-hidden`di. İlk ölçümde emojinin
adda görünmesi belgede kayıtlı `textContent` tuzağıydı — ad, `aria-hidden`
alt ağaçları çıkarılarak hesaplandığında "Tiroid Hastalıkları…" çıkıyor.

**Doğrulama:** 320 ve 1100px'te kayma **0**, `h2` 6, tetikleyici 6, dokunma
hedefi 88/60px. Ölçüt kör değil — 900px'lik tohum eklenince 320px'te kayma
0 → **595**.

**Not edilen, düzeltilmeyen:** erişilebilir ad başlık ve açıklamayı boşluksuz
birleştiriyor ("Tiroid HastalıklarıHipotiroidizm…"). Belgede kayıtlı React
metin birleşmesi; anlaşılırlığı bozmuyor, araya metin düğümü eklemek görsel
etki riski taşıyor. Ölçüldü, kaydedildi.

#### Akordeon düzeltmesi canlıda + CI durumu

| ölçüt | canlıda (`/tr/premium/ydus/hematoloji`) |
|---|---|
| `h1` · `h2` | 1 · **3** (önce `h2` 0) |
| `aria-expanded` taşıyan tetikleyici | 3 |
| tıklama | `true` + panel VAR → `false` + panel YOK |
| `h2` görünümü | system-ui · 16px · üst boşluk 0px — değişmedi |
| erişilebilir ad | "Lösemiler…" — emoji yok |

**CI AYRICA KONTROL EDİLDİ — bu oturumda 12 commit gönderildi ve CI'a hiç
bakılmamıştı.** Belgede tam bu yüzden 97 koşumluk sessiz kırmızı kayıtlı.
`gh run list`: **son 8 koşumun 8'i de başarılı**, yani 20 adımlı boru hattı
(bu oturumda eklenen `brans-arac` ve genişletilmiş ölü-slug nöbetçileri dahil)
her commit'te geçiyor.

#### Aynı turda ölçülüp KUSUR ÇIKMAYANLAR

- **Boş kategori yok.** 9 premium branşta 30 kategori, 57 konu ilanı; sıfır
  konulu kategori **0**. Beş kategoride ilan var ama dosya yok — hepsi
  `hazir:false`, yani soluk ve tıklanamaz, üstelik başlık zaten "0/N konu"
  yazıyor. Çıkmaz sokak değil.
- **`content/premium/ydus/questions/` — 12 dosya, hiçbir yerden okunmuyor.**
  Tek okuyanı `app/api/_admin/…` ve alt çizgili API klasörleri rotaya
  alınmıyor (404). **Yeni bulgu değil:** `yetim-denetim` bunu zaten
  "HİÇBİR KODUN OKUMADIĞI DİZİN" başlığıyla raporluyor ve doğru gerekçeyi de
  veriyor ("konu dosyası eklemek YETMEZ, dizini okuyan bir kod gerekiyor").
  Denetim işini yapıyor; karar içerik/ürün tarafında.
- `kaynaklar/` boş bir dizin ve okuyanı var (`lib/aiContext.ts`) — yetim
  içerik yok.

**Ölçüm notu:** `questions/` dosyalarını sayarken `sorular`/`questions`
dizisi arandı ve "0 soru" çıktı; gerçekte **her dosya TEK bir soru**
(`question`/`options`/`answer` üst düzeyde). Şema varsayımı yine yanılttı —
belgedeki "bir alanın adını varsayma, önce anahtarları BASTIR" kuralı.

### GİZLİ KONULAR ARAMA MOTORUNA AÇIKTI — dört mekanizmanın üçü uyguluyordu

`meta.hidden` üç yerde uygulanıyordu: site haritası · `generateStaticParams` ·
branş listeleri. **Dördüncü yerde — robots meta'sında — uygulanmıyordu.**

ÖLÇÜLDÜ (canlı, değişiklikten önce):

| sayfa | durum | robots | gövde |
|---|---|---|---|
| `feokromositoma-ve-paraganglioma` (GİZLİ) | 200 | **`index, follow`** | 45 KB |
| `hipertiroidi-ve-graves-hastaligi` (GİZLİ) | 200 | **`index, follow`** | 20 KB |
| `addison` (görünür, kıyas) | 200 | `index, follow` | 27 KB |
| `/guidelines` (deponun emsali) | 200 | **`noindex, follow`** | 13 KB |

Son satır belirleyici: `/guidelines` haritadan çıkarılmış **VE** noindex —
belge bunu "iki mekanizma da aynı niyeti taşıyor" diye ÖVÜYOR. Gizli konular
o kuralın dışında kalmıştı.

**"Nasıl bulunur ki" savunması ölçümle çürüdü.** Görünür bir konunun
içeriğinden gizli bir konuya bağlantı VAR:
`subklinik-tiroid-hastaliklari` → `hipertiroidi-ve-graves-hastaligi`.
Yani indekslenmiş bir sayfadan taranabilir bir yol açık.

**Bedeli ÇİFT İÇERİK ve ölçüldü:** gizli başlıklarla görünür başlıklar
arasında **14 örtüşme** var —
`adrenal-medulla-hastaliklari` [gizli] ~ `adrenal-bez-hastaliklari` /
`adrenal-korteks-hastaliklari`, `diabetes-insipidus` [gizli] ~
`arka-hipofiz-bozukluklari-di-ve-siadh`, `ibh` [gizli] ~
`bagirsak-hastaliklari`. Yayımlanmamış sayfalar kanonik sayfalarla
yarışıyordu.

Gizli konular artık `noindex, follow`. **404'e ÇEVRİLMEDİ:** adresle erişim
bilinçli bir karar (kaynakta yazılı) ve paylaşılmış bağlantılar kırılmamalı;
`follow` da `/guidelines` ile aynı gerekçeyle korundu.

#### ⚠ `robots: undefined` MİRASI SİLİYOR — A/B olmasa fark edilmezdi

İlk yazım `robots: gizli ? {...} : undefined` idi. A/B ölçümü yakaladı:

| | görünür konuda robots meta |
|---|---|
| değişiklikten ÖNCE | **var** (`index, follow`, kök düzenden) |
| ilk yazımdan SONRA | **YOK** |

Next, anahtarı `undefined` değerle görünce "miras al" değil **"bu alanı
kaldır"** diye yorumluyor. Davranışsal etkisi küçüktü (meta yoksa tarayıcı
zaten indeksler) ama niyet edilmemiş bir değişiklikti.

Çare koşullu YAYILIM: `...(gizli ? { robots: {...} } : {})` — anahtar
yalnızca gizli konuda ekleniyor.

**Doğrulama, üç negatif kontrolle:**

| sayfa | robots |
|---|---|
| iki gizli konu | **`noindex, follow`** |
| `addison` · TOC'lu konu · `M` rozetli konu | **`index, follow`** — geri geldi |

Hepsinde `h1` 1 ve canonical kendi yolu. Derleme 622/622; gizli konu önceden
üretilenler arasında **0** (yani `generateStaticParams` dışlaması bozulmadı).

**Aktarılabilir kural: bir metadata alanını koşullu yazarken `undefined`
GEÇME — anahtarı hiç ekleme.** Aksi hâlde ata düzenden gelen değeri sessizce
siliyorsun ve bunu ancak DEĞİŞİKLİK ÖNCESİ/SONRASI karşılaştırması gösterir.

#### `undefined` tuzağının kapsamı tarandı — bugün başka kurbanı yok

`robots: undefined` dersinden sonra aynı kalıp bütün metadata alanlarında
arandı. Kök düzen `title` · `description` · `robots` · `openGraph` · `twitter`
tanımlıyor, yani miras silinebilecek dört alan var.

| yer | alan | verdikt |
|---|---|---|
| konu sayfası | `keywords: … : undefined` | zararsız — kökte `keywords` YOK, silinecek miras yok |
| `lib/jsonld.tsx` | `keywords`/`description` | JSON-LD nesnesi, Next metadata değil |
| konu sayfası | **`description: aciklama \|\| undefined`** | **gizil tuzak, bugün ateşlemiyor** |

Üçüncü satır ölçüldü: `ozetCikar` **410 görünür konunun 0'ında** boş dönüyor,
yani `undefined` dalı hiç çalışmıyor. Ölçülmüş bir kusur olmadığı için
DEĞİŞTİRİLMEDİ — ama bir konu yalnızca uyarı bölümlerinden ibaret kalırsa
sayfa kökün açıklamasını kaybeder. (Kaybın yönü de belirsiz: genel bir site
açıklaması mı yoksa hiç açıklama mı daha iyi, ölçümle verilecek bir karar
değil.)

#### Oturumun metadata işi ölçekte sınandı — 16 rota, eksik 0

Bu oturumda metadata'ya çok dokunuldu (`rotaMeta`, 11 premium rota, kökün
`openGraph`/`twitter` sadeleştirmesi, gizli konu `noindex`). Zincirin sağlam
kaldığı canlıda ölçüldü:

| ölçüt | eksik |
|---|---|
| `<title>` | **0 / 16** |
| `description` | **0 / 16** |
| `canonical` | **0 / 16** |
| `og:title` | **0 / 16** |
| `og:image` | **0 / 16** |

Taranan: `/` · `/topics` · `/tools` · `/uyelik` · branş · konu · araç ·
`/giris` · `/kayit` · `/profile` · `/tekrar` · `/calisma-alanim` ·
`/guidelines` · `/tr/premium` · premium pano · premium branş.

Açıklamalar sayfaya özgü ve sayılar sayılıyor (`/topics` → "13 branşta 410
konu başlığı") — "sayı yazma, saydır" mimarisi metadata tarafında da ayakta.

### ATLAMA BAĞLANTISI KURALI BİR YERDE UYGULANIYOR, BİR YERDE DEĞİLDİ

Belgede kayıtlı kural: *"Hedef `<span tabIndex={-1}>` olmalı; odaklanabilir
olmayan bir öğeye atlandığında tarayıcı görünümü kaydırır ama ODAĞI TAŞIMAZ,
sonraki Tab yine gezinmenin başına döner."*

ÖLÇÜLDÜ (canlı) — kural iki yerden yalnızca birinde uygulanıyordu:

| yüzey | atlama hedefi | `tabindex` |
|---|---|---|
| araç sayfası | `<span id="arac-icerik">` | **-1** ✓ |
| **site kabuğu** (ana sayfa · kütüphane · branş · konu…) | `<main id="icerik">` | **YOK** ✗ |

Yani sitenin ezici çoğunluğunda atlama bağlantısı görünümü kaydırıyor ama
odağı taşımıyordu — bağlantının varlık sebebi tam olarak buydu.

**AYNI KUSUR KENDİ EKLEDİĞİM İÇİNDEKİLERDE DE VARDI.** Bölüm başlıklarına
`id` verilmişti ama `tabIndex` verilmemişti. Ölçüldü: içindekiler
bağlantısına tıklandığında sayfa kayıyor ve odak **`BODY`'ye** düşüyordu —
ekran okuyucu varış noktasını duyurmuyor, klavye kullanıcısı nerede olduğunu
bilmiyordu. Belgedeki kuralı yazan tur, kuralı kendi yeni koduna
uygulamamıştı.

**Doğrulama — önce/sonra:**

| ölçüt | önce | sonra |
|---|---|---|
| atlama: odak hedefte mi | **hayır** | **evet** (`MAIN tabindex=-1`) |
| içindekiler: odak hedefte mi | **hayır (BODY)** | **evet** (`H2 tabindex=-1`) |
| içindekiler: başlık ekranda | 96px (yapışkan çubuk 65px) | 96px — değişmedi |
| odak halkası | — | **`none`** — ikisinde de |
| **negatif** — araç sayfası kendi kalıbı | `span tabindex=-1` | **değişmedi** |
| **negatif** — eşik altı konu (`addison`) | — | TOC yok, atlama çalışıyor |

`focus:outline-none` bilerek: ikisi de GEZİNME HEDEFİ, etkileşimli denetim
değil. Halka gerçekten gezilebilir ögelerin işi; buraya odak yalnızca
programla geliyor.

**Aktarılabilir kural: belgeye bir erişilebilirlik kuralı yazarken, o kuralın
depoda KAÇ yerde geçerli olduğunu say.** Bu kural araç sayfaları için
yazılmıştı ve site kabuğu ile sonradan eklenen içindekiler ondan habersiz
kaldı — kuralı yazmak uygulamak değildir.

### BELGEDE YAZILI AMA HİÇ TARANMAMIŞ ÜÇ KURAL SÜRÜLDÜ — üçü de temiz

Atlama bağlantısı bulgusu ("kural yazmak uygulamak değildir") aynı şüpheyi
öteki kurallara taşıdı. Belge üç kuralı daha kaydediyor ve **hiçbirinin
tarama sonucu yazılı değildi.** Üçü de sürüldü.

**1. `group-hover:` yazdıysan `group-focus-within:` de yaz.**
Görünürlüğü açan hover varyantı taşıyan 7 yer bulundu:

| yer | verdikt |
|---|---|
| konu sayfası · `ReadingTools` · `SiteHeader` | **focus karşılığı VAR** ✓ |
| `premium/page.tsx` ×4 · `PremiumDailyProgram` | süsleme (`opacity-10`→`20` arka plan ikonu) — hiçbir şey gizlenmiyor |
| admin ×2 | `opacity-80`→`100` metin, görünürlük kapısı değil |
| **`TopicSidebar`** | tek gerçek boşluk — **ama ÖLÜ KOD** (sıfır içe aktaran, ölçüldü) |

Ölü koda dokunulmadı; belgede kayıtlı ders ("ölü koda düzeltme yaptım —
bağlı olduğunu doğrulamadan") tam bunun için var. **Kural ulaşılabilir her
yerde uygulanmış.**

**2. Tıklanabilir görünen her şey gerçekten tıklanabilir olsun.**
82 `cursor-pointer`/`cursor:'pointer'` kullanımından etkileşimli OLMAYAN
etikette duran 6'sı elle sınandı:

| aday | verdikt |
|---|---|
| `vaka-coz` · `SectionsTable` · `kayseritip` ×2 | saran `<Link href>` — gerçek |
| `BranchTemplate` | `onClick` var ama ÖLÜ KOD |
| **`FlashcardPlayer`** | `onPointerUp` → hareket <10px ise `flip()` — **tıklama GERÇEKTEN çeviriyor** |

Sonuncusu ilk bakışta sahte görünüyordu (çevresinde `onClick` yok); işleyici
`onPointerDown`/`onPointerUp` çiftindeydi ve dokunuşu kaydırmadan ayırıyor.
**Sahte tıklanabilir öge: 0.**

**3. Dokunma hedefi en az 24px.**
375px'te üç sayfa (ana · konu · araç), **133 etkileşimli öge**, 24px altı
hedef **0**. Gizlenmiş onay kutuları için saran `<label>` ölçüldü, `sr-only`
ögeler elendi — ikisi de belgede kayıtlı sahte-bulgu kaynakları.

**Ölçüt kör değil:** 10×10 piksellik bir düğme tohumlandı → küçük hedef
0 → **1**, tohum kalkınca yeniden **0**.

**Aktarılabilir kural: belgeye bir kural yazdıktan sonra TARAMA SONUCUNU da
yaz.** Yazılı ama taranmamış bir kural, uygulandığı sanılan bir kuraldır;
bu üçünden biri gerçekten boşluk taşıyordu (ölü kodda) ve bunu ancak tarama
gösterdi.
