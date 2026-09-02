'use client';

import { useEffect, useState } from 'react';

/**
 * BAŞA DÖN — uzun konu sayfalarında içindekilere geri dönüş.
 *
 * ÖLÇÜLEN GEREKÇE: en uzun konu 320px'te **41.8 ekran** (33953px), 375px'te
 * 33.8 ekran. Sayfanın **%90'ı okuma gövdesi** (23986 karakter), yani uzunluk
 * kabuktan değil içerikten geliyor — sıkıştırılacak bir şey yok. İçindekiler
 * bloğu sayfanın BAŞINDA duruyor ve oraya dönmenin tek yolu 40 ekran geri
 * kaydırmaktı: Android'de tarayıcının "başa dön" hareketi yok, yapışkan
 * başlıkta da böyle bir eylem bulunmuyor (ölçüldü: logo `/` adresine gidiyor).
 *
 * NEDEN BAĞLANTI, DÜĞME DEĞİL: hedef `<main id="icerik" tabindex="-1">` ve
 * AppShell onu zaten basıyor. Bağlantı hem odağı ana içeriğe taşıyor (atlama
 * bağlantısıyla aynı mekanizma) hem `scroll-padding-top: 96px` kuralından
 * yararlanıyor — yapışkan başlığın altında kalmıyor.
 *
 * NEDEN YOKLAMA: bu ortamda `scroll` olayı hiç atılmıyor (gizli sekmede
 * ölçüldü: kendi dinleyicim 0 olay saydı), yani yalnızca olaya bağlanan bir
 * görünürlük kuralı DOĞRULANAMAZDI. `KaydirDurumu` ile aynı çözüm: olay
 * dinleniyor (gerçek tarayıcıda anında) ve 600 ms'lik yoklama garantiyi
 * veriyor.
 *
 * KONUM ÖLÇÜMLE seçildi — sayfada zaten üç sabit katman var: yapışkan başlık
 * (65px, z-50), not tutamağı (sağ kenar, dikey ortada, 39x89, z-54) ve okuma
 * ipucu (alt şerit, z-53). Düğme not tutamağının 60px ALTINA konuldu; ipucu
 * şeridinin üstünde kalıyor ve hiçbiriyle çakışmıyor.
 *
 * MASAÜSTÜNDE GİZLİ: 1280px'te sağ kenarda yapışkan "İlgili Konular"
 * sütunu duruyor ve düğme onun üstüne biniyordu (ölçüldü). Gerekçe zaten
 * mobil: masaüstünde Home tuşu ve o sütun zaten var.
 */
export default function BasaDon() {
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    const olc = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setGorunur(y > window.innerHeight * 1.5);
    };
    olc();
    const yoklama = window.setInterval(olc, 600);
    window.addEventListener('scroll', olc, { passive: true });
    window.addEventListener('resize', olc);
    return () => {
      window.clearInterval(yoklama);
      window.removeEventListener('scroll', olc);
      window.removeEventListener('resize', olc);
    };
  }, []);

  if (!gorunur) return null;

  return (
    <a
      href="#icerik"
      aria-label="Sayfanın başına dön"
      data-basa-don
      className="fixed right-0 top-1/2 z-[52] lg:hidden translate-y-[60px] flex h-11 w-11 items-center justify-center rounded-l-xl border border-r-0 border-slate-300 bg-white/95 text-blue-900 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 print:hidden"
    >
      <span aria-hidden="true" className="text-lg leading-none">↑</span>
    </a>
  );
}
