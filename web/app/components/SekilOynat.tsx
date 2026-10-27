'use client';

import { useEffect } from 'react';

/**
 * HAREKETLİ ŞEMA — bir kez oynar, sonra kullanıcı isteyince.
 *
 * Şema `<img>` içindeki SVG'dir (gövde metni `kisaltmaAc`/`kavsakBagla`dan
 * geçiyor; satır içi SVG'nin `<text>` düğümleri genişletilip düzen bozulurdu).
 * Animasyon SVG'nin kendi CSS'inde, `iteration-count: 1`, son kare = tam şema.
 * Görsel içi animasyona dışarıdan erişilemez; yeniden başlatmanın tek yolu
 * görseli yeniden yüklemek, o yüzden `src`e sayaç eklenir.
 *
 * İçerik HTML'i yalnız işaret taşır:
 *   <figure data-hareketli> … <img> … <button data-sekil-oynat> … </figure>
 *
 * İki iş:
 *  1. Görsel ekrana İLK girdiğinde baştan başlat (yoklamayla) — `loading="lazy"` görseli
 *     görünmeden yükleyip animasyonu kullanıcı gelmeden bitirebiliyor.
 *  2. "Tekrar oynat" düğmesi (olay yetkilendirme: gövde dangerouslySetInnerHTML).
 *
 * Betik çalışmazsa şema yüklenince bir kez oynar, düğme etkisiz kalır.
 * Hareket azaltma tercihinde SVG animasyonu zaten kapalı; düğme gizlenir.
 */
export default function SekilOynat() {
  useEffect(() => {
    let sayac = 0;
    const oynat = (img: HTMLImageElement) => {
      const taban = img.getAttribute('src')?.split('?')[0];
      if (taban) img.setAttribute('src', `${taban}?oynat=${++sayac}`);
    };

    const azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const figurler = Array.from(document.querySelectorAll<HTMLElement>('figure[data-hareketli]'));
    if (azalt) {
      figurler.forEach((f) => f.querySelector<HTMLElement>('[data-sekil-oynat]')?.setAttribute('hidden', ''));
      return;
    }

    // Görünürlük YOKLAMAYLA (BasaDon/KaydirDurumu ile aynı gerekçe: bu ortamda
    // IntersectionObserver ölçüldü, hiç tetiklenmedi). Görselin %40'ı ekrana
    // girince bir kez başlatılır; hepsi oynayınca yoklama durur.
    const bekleyen = new Set(figurler);
    const yokla = () => {
      if (document.visibilityState !== 'visible') return;
      for (const f of bekleyen) {
        const img = f.querySelector('img');
        if (!img) { bekleyen.delete(f); continue; }
        const r = img.getBoundingClientRect();
        const gorunen = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (r.height > 0 && gorunen / r.height >= 0.4) {
          bekleyen.delete(f);
          oynat(img);
        }
      }
      if (!bekleyen.size) window.clearInterval(saat);
    };
    const saat = window.setInterval(yokla, 600);
    yokla();

    const tikla = (e: MouseEvent) => {
      const dugme = (e.target as HTMLElement | null)?.closest?.('[data-sekil-oynat]');
      if (!dugme) return;
      const img = dugme.closest('figure')?.querySelector('img');
      if (img) oynat(img);
    };
    document.addEventListener('click', tikla);
    return () => {
      window.clearInterval(saat);
      document.removeEventListener('click', tikla);
    };
  }, []);

  return null;
}
