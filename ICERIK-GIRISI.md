# İçerik girişi çalışma alanı

Bu klasör ana depoyla **aynı git deposunun** ayrı bir çalışma ağacı
(worktree). Dal: `icerik`. Amaç: sen ders/konu girerken ana daldaki
arayüz çalışması karışmasın — iki taraf birbirinin dosyasını kilitlemez,
commit'ler ayrı dalda birikir.

| | |
|---|---|
| Bu alan | `C:\Users\hucig\Medknowledge-icerik` — dal `icerik` |
| Ana alan | `C:\Users\hucig\Medknowledge` — dal `main` |

`web/node_modules` ana alandan **bağlantıyla** (junction) geliyor; ayrıca
kurulum yapman gerekmez. `npm ci` **çalıştırma** — bağlantıyı da bozar
(zaten proje kuralı: CLAUDE.md).

---

## Neye dokunulur

Yalnızca `web/content/**`. Kod dosyalarına bu alanda dokunma; arayüz
tarafı ana dalda ilerliyor, ikisi çakışır.

## Açık site konusu nereye

```
web/content/canonical/<branş>/<konu-slug>.json
```

Branşlar: `endokrinoloji · enfeksiyon · gastroenteroloji · genel-dahiliye ·
gogus · hematoloji · journal-club · kardiyoloji · klinik-nutrisyon ·
nefroloji · onkoloji · palyatif · romatoloji`

Dosya adı adresin kendisi olur: `enfeksiyon/bruselloz.json` →
`/topics/enfeksiyon/bruselloz`. Türkçe karakter kullanma (`ı ğ ü ş ö ç`),
küçük harf ve tire.

### Şablon

```json
{
  "title": "Bruselloz",
  "meta": {
    "updatedAt": "14 Ağu 2026",
    "tags": ["Enfeksiyon Hastalıkları", "Zoonoz"],
    "parent": null,
    "order": 1
  },
  "sections": [
    {
      "heading": "Bölüm başlığı",
      "html": "<p class=\"text-sm leading-relaxed mb-4 text-slate-700\">Paragraf.</p>"
    }
  ]
}
```

Dört alan da zorunlu — 35 enfeksiyon dosyasının **hepsi** bu kalıpta.

- **`parent`** — üst başlığın slug'ı ya da `null`. `null` verirsen konu
  branş sayfasında ana başlık olur. Bir üst başlığın altına girecekse o
  dosyanın adını yaz (örn. `"antibiyotikler-ana-sayfa"`). Bugün enfeksiyonda
  ana başlıklar: `antibiyotikler-ana-sayfa`, `crkp-enfeksiyonu`,
  `mantar-enfeksiyon-ana-sayfa`, `prokalsitonin-genel`.
- **`order`** — kardeşler arası sıra (küçük olan üstte).
- **`tags`** — "İlgili Konular" bağları bundan üretiliyor. Ama akrabalık
  etiket SAYISINDAN değil NADİRLİĞİNDEN çıkarılıyor: `Akut`, `Acil`, `Tanı`,
  `Tedavi` gibi genel niteleyiciler eleniyor. Konuyu gerçekten ayırt eden
  etiket koy (`Zoonoz`, `Bruselloz`), yoksa hiçbir konuya bağlanmaz.
- **`html`** — gövde HTML'i. Var olan dosyalardaki sınıfları kullan
  (`text-sm leading-relaxed mb-4 text-slate-700`); yeni renk/boyut uydurma,
  okuma alanının kendi tabanları var.

## Hub özet kalır, ayrıntı çocuk sayfada

Bir başlık şişmeye başladığında **hub sayfayı özete indir, ayrıntıyı çocuk
sayfaya taşı ve hub'a bir kart bağlantısı bırak.** Ayrıntı okumak isteyen
oraya kayar; hızlı bakan özetle işini görür.

**Kural: veri KOPYALANMAZ, TAŞINIR.** Aynı sayı ya da eşik iki dosyada
dururken biri güncellenince öteki sessizce sapar (CLAUDE.md'deki "iki
gerçeklik" sınıfı). Hub'da yalnızca karar satırı kalır, nicel ayrıntı ve
çalışma verisi çocuğa gider.

Kart bağlantısının deposdaki kalıbı (`losemiler.json`, `subklinik-tiroid-
hastaliklari.json` de aynısını kullanıyor):

```html
<div class="mt-2"><a href="/topics/<branş>/<çocuk-slug>"
   class="block p-5 bg-slate-50 border border-slate-200 rounded-2xl
          text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-300
          hover:text-blue-800 transition-all">Ayrıntı: <ne bulacağı>
   <span class="float-right text-slate-300">→</span></a></div>
```

Çocuğun `parent`'ı hub'ın slug'ı olmalı — o zaman kırıntı, branş sayfası
ve "İlgili Konular" kendiliğinden bağlanır.

**Doğrulaması:** taşınan veriyi bir dizeyle ara ve **iki dosyada birden
geçmediğini** gör; sonra iki sayfayı da render edip bağlantının kurulduğunu
ölç. `link-denetim.cjs` kırık adresi yakalar ama **kopyayı yakalamaz.**

İlk uygulama: `antikoagulasyon-stratejileri` 6. bölümü özete indi,
`inme-sonrasi-gizli-af` ayrıntıyı aldı (6 Eylül 2026).

---

## Konu girdikten sonra çalıştırılacaklar

```bash
cd web && node scripts/baslik-index.cjs && node scripts/ilgili-index.cjs && node scripts/link-denetim.cjs && node scripts/soru-denetim.cjs
```

Sırasıyla: paylaşım kartı başlığı · "İlgili Konular" bağları · kırık iç
bağlantı denetimi · quiz/kart yapı denetimi. Son ikisi CI kapısı, kusur
bulurlarsa iş düşer.

## Sayfayı görmek istersen

Sayfa zaten AÇIK: **http://localhost:3200** (ben başlattım, ana alandaki
3000 numaralı sunucuya dokunmuyor). Elle başlatmak gerekirse:

Ana alanda 3000 portu zaten çalışıyor olabilir; burada başka port kullan:

```bash
cd web && npx next dev -p 3200
```

---

## Bitince

```bash
git add web/content && git commit -m "Bruselloz konusu eklendi" && git push -u origin icerik
```

Ana dala birleştirmeyi bana bırak — kapıları (lint · typecheck · build ·
iki içerik denetimi) ana alanda çalıştırıp öyle alacağım.
