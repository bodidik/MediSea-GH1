# Ek Kaynaklar (AI Asistan)

Bu klasördeki dosyalar, konu sayfalarındaki **"Bu konuya soru sor"** yapay zekâ asistanının
cevap üretirken kullandığı **ek bağlama** dahil edilir.

## Nasıl çalışır?

Bir konuya ek kaynak eklemek için, o konunun **branşı** ve **konu id'si** ile aynı yolu izleyen
bir `.md` dosyası oluşturman yeterli:

```
content/premium/ydus/kaynaklar/{brans}/{konu-id}.md
```

Örnek:
```
content/premium/ydus/kaynaklar/gastroenteroloji/pankreas-kanseri.md
```

Bu dosyaya düz metin, notlar, kılavuz alıntıları, ek tablolar vb. yapıştırabilirsin.
AI asistan soru geldiğinde şunları birlikte okur:

1. Konunun kendi içeriği (`topics/{brans}/{konu-id}.json`)
2. Buradaki ek kaynak dosyası (varsa)

Ve **yalnızca bu iki kaynağa dayanarak** cevap verir; kaynakta olmayan bir şey sorulursa
"bu bilgi konu içeriğinde yer almıyor" der.

## Notlar
- Dosya adı konu id'siyle **birebir** aynı olmalı (örn. `pankreas-kanseri.md`).
- Ek kaynak zorunlu değildir; dosya yoksa AI sadece konunun kendi içeriğini kullanır.
- Çok uzun metinler token maliyetini artırır; toplam bağlam ~14.000 karakterle sınırlanır.
