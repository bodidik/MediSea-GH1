# Tanı motoru

Serbest hikâyeden yapılandırılmış bulguya, oradan yüzdesel ön tanıya ve
"sıradaki test hangisi" önerisine giden Bayes motoru.

**Temel kural: yüzdeleri LLM hesaplamaz.** LLM'in tek görevi metni bulgu koduna
çevirmektir (Katman 1). Olasılık bu modülde, deterministik ve test edilebilir
biçimde hesaplanır. Aksi halde model uydurma yüzdeler üretir ve kalibrasyon
hiçbir zaman düzeltilemez.

```
Serbest metin
   ↓  Katman 1  (LLM)          → findings: [{code, present}]
   ↓  Katman 2  engine.js      → sıralı ön tanı + yüzde + gerekçe
   ↓  Katman 3  testSelection  → bilgi kazancı / maliyet sıralaması
Lab / görüntüleme sonucu       → aynı motor tekrar döner
```

Üç katman da bu modüldedir. Katman 1 `extract/` altındadır.

## Kullanım

```js
import { assess } from './diagnosis/index.js';

const r = assess({
  age: 59, sex: 'M', durationMonths: 24,

  hpi:    [{ code: 'constipation', present: true },
           { code: 'fever', present: false }],        // "yok" ≠ "sorulmamış"
  pmh:    [{ code: 'nephrolithiasis_history', present: true }],
  meds:   [{ code: 'thiazide_use', present: true }],
  fhx:    [{ code: 'family_history_men1', present: false }],
  habits: [{ code: 'smoking', present: false }],
  exam:   { normalSystems: ['abdomen', 'neuro'],       // → anlamlı negatifler
            findings: [{ code: 'pallor', present: true }] },

  testResults: [{ test: 'serum_calcium', result: 'high' }],
});

r.differential   // [{ id, label, probability, prior, contributions, ... }]
r.nextTests      // bilgi kazancı / maliyet sıralı test önerisi
r.missingExam    // testten önce yapılacak bedava iş: eksik muayene sistemleri
r.redFlags       // beklenen zarar ekseninde ayrı liste
r.warnings       // tanınmayan kod, çelişkili bulgu vb.
```

Eski düz `findings: [...]` biçimi hâlâ çalışır; kutu, bulgunun kendi tanımından
okunur.

Çalışan örnek: `node diagnosis/demo.js`

### Metinden çıkarım (Katman 1)

```js
import { assessText, createAnthropicTransport } from './diagnosis/index.js';

const r = await assessText(hikayeMetni, { complete: createAnthropicTransport() });

r.differential            // motor çıktısı
r.extraction.case         // çıkarılan kutulu vaka — denetlenebilir
r.extraction.warnings     // uydurulan bulgu, düzeltilen kutu, doğrulanamayan alıntı
r.extraction.notes        // sözlükte karşılığı olmayan ifadeler → KB büyütme sinyali
r.extraction.stats        // önerilen / kabul / sözlük dışı / temellendirilemeyen
```

Çıkarım uyarıları motor uyarılarından **ayrı** tutulur; karıştırılırsa hangi
katmanın hata yaptığı görünmez olur.

Çıkarım nondeterministiktir, dolayısıyla güvence testten değil **kısıtlamadan**
gelir. Dört kısıt:

1. **Kapalı sözlük.** Model yalnızca KB'deki kodları üretebilir; şemadaki `enum`
   bilgi tabanından türetilir. KB'ye bulgu eklendiğinde çıkarım kendiliğinden
   öğrenir. Tanı kodları sözlüğe hiç girmez.
2. **Alıntı bağlama.** Her bulgu için metinden birebir alıntı zorunludur ve o
   alıntının metinde gerçekten geçtiği programla doğrulanır. Kapalı sözlük
   modelin olmayan bir *kod* uydurmasını engeller; alıntı bağlama, var olan bir
   kodu olmayan bir *cümleden* türetmesini engeller. Doğrulanamayan bulgu
   varsayılan olarak **düşürülür** — tıbbi bir araçta temellendirilmemiş bulgu,
   eksik bulgudan tehlikelidir.
3. **Şemada olasılık alanı yok.** Model tanı sıralayamaz. Serbest `notes` alanına
   yüzde sızdırırsa dedektör yakalar ve notu düşürür.
4. **Kanonik kutu.** Bulgunun hangi kutuya ait olduğunu model değil KB söyler;
   model yanlış kutu derse düzeltilir ve uyarılır.

Prompt, daha önce tespit ettiğimiz üç tuzağı açıkça kapatır: "yok" ile
"sorulmamış" ayrımı, önceki tanıların kanıt sayılmaması (tanı adından semptom
türetme yasağı dahil), tedaviye yanıtsızlığın bulgu olduğu.

**İsabet ölçümü ayrıdır.** Birim testler kısıtların çalıştığını doğrular, modelin
doğru cevap verdiğini değil. Gerçek model isabeti `npm run eval:extract` ile
altın vakalara karşı ölçülür (gerçek API çağırır, `ANTHROPIC_API_KEY` ister).
Ölçülen dört hata türü: kaçırılan bulgu, uydurulan bulgu, kutup hatası
(var/yok ters — en tehlikelisi), temellendirme.

## Kutular

`hpi` (hikâye) · `exam` (fizik muayene) · `pmh` (özgeçmiş) · `meds` (ilaçlar) ·
`fhx` (soygeçmiş) · `habits` (alışkanlıklar)

Kutular arayüz düzeni değildir; iki gerçek iş yaparlar.

**1. Risk / belirti ekseni.** Her bulgu `axis: 'manifestation'` (varsayılan) ya da
`axis: 'risk'` taşır.

- **Belirti**, tanının *açıklaması beklenen* şeydir; açıklamıyorsa tekillik cezası alır.
- **Risk** (meslek, soygeçmiş, ilaç, alışkanlık) olasılığı yükseltir ama
  **açıklanması gerekmez.** Hastanın mesleğini açıklamadığı için bir tanıyı
  cezalandırmak anlamsızdır — bu ayrım yokken tek bir maruziyet kaydı bütün
  listeyi çarpıtıyordu.

Kutu ile eksen aynı şey değildir: **böbrek taşı öyküsü** özgeçmişte durur ama
risk değil, aynı hastalık sürecinin belirtisidir; tanının onu açıklaması beklenir.

**2. Muayenede anlamlı negatif.** `exam.normalSystems: ['neuro']` demek, o
sistemin *tüm* bulgularının **YOK** olması demektir (14 anlamlı negatif üretir).
Muayene edilmemiş sistem ise **BİLİNMİYOR** kalır. Bu genişletme yalnızca
muayenede yapılır — hikâyede yapılamaz, çünkü hasta anlatmadı diye bulgu yok
sayılamaz.

Bu yüzden muayene bulgularının LR− değerleri 1'den uzaklaştırılmıştır: kayıtlı
normal muayene gerçek bir gözlemdir, sorulmamış bir soru değil. `missingExam`,
test istemeden önce hangi sistemin muayenesinin en çok bilgi getireceğini söyler.

## Hesap

```
log-odds(tanı) = log-odds(ön-test) + Σ log(LR_i) − tekillik_cezası
```

Naif Bayes'in bilinen kusurlarını kapatan üç ekleme:

**1. Üçlü bulgu mantığı.** `var` / `yok` / `sorulmamış`. `yok` ise LR− uygulanır,
`sorulmamış` ise hiçbir şey uygulanmaz. Bu ayrım olmadan motor her hastada aynı
tanıya kayar. LR− varsayılanı 1'dir (yokluğu bilgisiz say); yalnızca gerçekten
ayırt edici olduğu yerde 1'den uzaklaştırılır.

**2. Küme indirimi.** Korele bulgular (`FINDINGS[x].cluster`) aynı kanıtı iki kez
saydırır. Küme içinde yalnızca en güçlü LR tam ağırlıkla girer, diğerleri
`clusterDiscount` (0.35) ile.

**3. Tekillik (parsimony) cezası.** Tanının açıklamadığı her VAR **belirti**,
"demek ki ikinci bir hastalık daha var" demektir; ikinci hastalık a priori
olasılıksızdır. Ceza, bulgunun ayırt ediciliğiyle (salience) ağırlıklandırılır.
Risk faktörleri bu cezanın dışındadır (bkz. Kutular). Bu terim olmadan motor tek
hastaya dört ayrı tanı yazar — hepsi tek tek makul, toplamı saçma.

`salience` elle yazılmaz: matristeki en yüksek LR+'dan türetilir, böylece KB
değiştikçe kendiliğinden güncellenir.

### Yazım biçimi neden ikiye ayrılmış

- **Bulgular** LR+ / LR− olarak yazılır — literatürdeki hâli budur.
- **Testler** `P(sonuç | tanı)` tablosu olarak yazılır — entropi hesabı doğru
  normalize edilmiş koşullu dağılım ister. LR'yi motor bağlama göre türetir,
  yani aynı sonuç farklı bir ön-test tablosunda farklı ağırlık taşır.

### Bilinen yaklaşımlar

- Her tanı bağımsız bir ikili hipotez olarak modellenip sonradan normalize edilir;
  bu tam bir ortak dağılım değildir. `other_undifferentiated` artık kategorisi,
  olasılık kütlesini zorla birkaç tanıya dağıtmayı engeller.
- Test sonuçları sırayla uygulanır; her biri kendinden önceki dağılımı kullanır.
  Bu yüzden sonuç sırası teorik olarak küçük fark yaratabilir.
- **LR değerleri henüz kalibre edilmemiştir.** Ordinal kovalara (0.1 / 0.25 / 0.4 /
  0.6 / 1 / 1.5 / 2 / 3 / 5 / 8 / 12 / 25) oturtulmuş klinik tahminlerdir.
  Sıralamayı belirleyen büyüklük mertebesidir, kesin sayı değil.

## Kırmızı bayraklar ayrı eksende

Olasılığı düşük ama sonucu ölümcül tanılar yüzde sıralamasında hep dipte kalır ve
tam da bu yüzden kaçırılır. `redFlags.js` bunları `P × ciddiyet` (beklenen zarar)
ile ayrı sıralar ve her biri için en ayırt edici testi verir.

## Kalibrasyon

Kalibrasyonu ölçmeyen bir tanı makinesi, güzel görünen bir yalancıdır.
`calibration.js` çok sınıflı Brier, log-loss, ECE, kalibrasyon eğrisi ve top-k
isabet hesaplar. Doğrulanmış vakalar biriktikçe `calibrationReport()` ile
"%70 dediğimiz vakaların gerçekten %70'i mi?" sorusu yanıtlanır.

## Kapsam

Bilinçli olarak dar: **kronik yorgunluk + karın ağrısı + kognitif yakınma** ekseni.
18 tanı, 65 bulgu, 18 test. Tüm tıbbı kapsamaya çalışmak bilgi tabanını kalibre
edilemez hâle getirir.

Yeni tanı eklerken: `diagnoses.js` + `likelihoods.js` + en az bir `tests.js`
girdisi. Sonuncusu zorunludur — `kb.test.js` ayrıştırılamayan tanıyı reddeder,
aksi hâlde tanı listede sonsuza kadar asılı kalır. Aynı şekilde atıl bulgu da
reddedilir: doktorun girebildiği ama hiçbir yüzdeyi oynatmayan bir kod, sözlüğe
güveni boşuna harcar.

**Henüz kapsanmayan:** ilaca bağlı sendromlar (opioid → kabızlık gibi) kendi tanı
girdilerini gerektirir; şu an yalnızca mevcut tanıların riskini değiştiren ilaçlar
var (tiyazid, lityum, kronik PPI).

## Test

```bash
npm test
```

85 test. Vakayı geçirmenin ötesinde şunları bekçilik ediyorlar: negatif kontrol
(kalsiyum normalse hiperparatiroidi ilk sıradan düşmeli), "yok" ile "sorulmamış"
ayrımı, risk faktörünün tekillik cezasına girmemesi, "sistem normal"in anlamlı
negatif üretmesi ama boş kutunun üretmemesi, tedaviye yanıtsızlığın GERD'i
dışlaması, doğrulanmamış ön tanının kanıt olarak beslenmemesi, bilgi kazancının
negatif olamaması, bilgi tabanı doğrulayıcısının bozuk girdiyi reddetmesi.

Çıkarım tarafında ise: sözlük dışı kodun atılması, temellendirilmemiş alıntının
düşürülmesi, kutunun KB'ye göre düzeltilmesi, önceki tanının yüzdeyi
değiştirmemesi, olasılık sızıntısının yakalanması, uydurulan muayene sisteminin
reddedilmesi.

`npm run eval:extract` **npm test'e bağlı değildir** — gerçek API çağırır, para
harcar ve nondeterministiktir. CI'ı ona bağlamak testleri kırılgan yapardı.

## Sonraki adımlar

1. **Çıkarım isabetini gerçek modelle ölçmek.** `npm run eval:extract` yazıldı ama
   henüz canlı API'ye karşı çalıştırılmadı (`ANTHROPIC_API_KEY` tanımlı değil).
   Eşikler (recall ≥ 0.9, sıfır uydurma, sıfır kutup hatası) ilk gerçek koşumdan
   sonra ayarlanmalı.
2. LR matrisini klinisyen onayıyla genişletmek (LLM taslak üretir, insan mühürler).
3. Doğrulanmış vakalarla kalibrasyon: Laplace düzeltmeli frekans güncellemesi.
4. Altın vaka sayısını artırmak — şu an 2. Çıkarım isabeti ancak vaka çeşitliliği
   kadar ölçülebilir.
