'use client';

/**
 * KAYDIRMA DURUMU — yatay kaydırılan her kapta "devamı var" işaretini üretir.
 *
 * ÖLÇÜLEN KUSUR: içerik tabloları `overflow-x: auto` bir kapta duruyor ve
 * telefonda neredeyse hepsi taşıyor — ama HİÇBİR görsel ipucu yok. Mobil
 * tarayıcılar kaydırma çubuğunu ancak kaydırma sırasında gösteriyor, yani
 * kullanıcı tabloyu tam sanıyor.
 *
 * Ölçüldü (canlı, 375px, 6 konu sayfası): 14 kabın 13'ü taşıyor; en kötüsü
 * `sarkoidoz-ayirici-tani`da 550px'lik tablonun 313px'i (%57) gizli,
 * `prokalsitonin`de 584px'in 307px'i (%47). Kap `offsetHeight-clientHeight`
 * = 0, `mask`/`box-shadow`/`background-image` yok: sıfır ipucu.
 *
 * NEDEN JS: "kaydırılabilir mi ve sonunda mıyız" saf CSS'te ifade edilemiyor.
 * Denenen ve ELENEN üç yol (üçü de canlıda ölçüldü):
 *   1. `::-webkit-scrollbar` ile kalıcı çubuk — kap yüksekliği değişmedi,
 *      yani mobil öykünmesinde klasik çubuk gelmiyor.
 *   2. `animation-timeline: scroll(self inline)` — `CSS.supports` true ama
 *      opaklık her durumda 0 kaldı (bu ortamda animasyon motoru askıda,
 *      belgede kayıtlı tuzağın kardeşi). Doğrulanamayan şey gönderilmez.
 *   3. `background-attachment: local/scroll` gölge hilesi — satırların
 *      KENDİ opak zeminleri var (14 tablonun 9'unda koyu hücre:
 *      `rgb(30,41,59)`, `rgb(146,64,14)`), yani kabın zeminini örtüyorlar.
 *
 * SEÇİLEN YOL — `mask-image`: içeriğin kendi piksellerini saydamlaştırıyor,
 * yani ZEMİN RENGİNDEN BAĞIMSIZ. Koyu başlık satırında da beyaz gövde
 * satırında da aynı biçimde "devamı var" diyor. Bu bileşen yalnızca
 * `data-kaydir` niteliğini yazıyor; maskeyi `globals.css` çiziyor.
 *
 * DOM YAPISI DEĞİŞMİYOR — yalnızca bir nitelik. Vurgular karakter ofsetiyle
 * saklandığı için bu şart; ölçüldü, okuma alanının `textContent` uzunluğu
 * değişmiyor.
 *
 * 600 ms'lik yoklama `ReadingTools`un kalıbı: yazı tipi geç yüklenince ya da
 * başka bir konuya geçilince (aynı bileşen, yeni HTML) ölçüm bayatlıyor.
 * İmza aynıysa nitelik yeniden yazılmıyor, yani boşuna DOM işi yok.
 */

import { useEffect } from 'react';

const SECICI = '[data-tablo-kaydir], [data-kaydir-serit]';
/** Kenar payı: alt piksel yuvarlamaları "sonda değiliz" dedirtmesin. */
const PAY = 2;

export default function KaydirDurumu() {
  useEffect(() => {
    const bagli = new WeakSet<HTMLElement>();

    const durumYaz = (kap: HTMLElement) => {
      const tasma = kap.scrollWidth - kap.clientWidth;
      if (tasma <= PAY) {
        if (kap.hasAttribute('data-kaydir')) kap.removeAttribute('data-kaydir');
        return;
      }
      const sol = kap.scrollLeft;
      const yeni = sol <= PAY ? 'bas' : sol >= tasma - PAY ? 'son' : 'orta';
      if (kap.getAttribute('data-kaydir') !== yeni) kap.setAttribute('data-kaydir', yeni);
    };

    const tara = () => {
      const kaplar = document.querySelectorAll<HTMLElement>(SECICI);
      for (const kap of kaplar) {
        if (!bagli.has(kap)) {
          bagli.add(kap);
          kap.addEventListener('scroll', () => durumYaz(kap), { passive: true });
        }
        durumYaz(kap);
      }
    };

    tara();
    const yoklama = window.setInterval(tara, 600);
    window.addEventListener('resize', tara);
    return () => {
      window.clearInterval(yoklama);
      window.removeEventListener('resize', tara);
    };
  }, []);

  return null;
}
