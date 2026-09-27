/**
 * `beforeinstallprompt` yakalayıcısı — kök layout'ta `<body>`nin başına
 * satır içi basılır (`app/layout.tsx`).
 *
 * Neden satır içi: olay sayfa yüklenirken, React kurulmadan önce
 * gelebiliyor; bileşen içinde dinlemek onu kaçırır. Olay, yakalandığı
 * andaki manifest adresiyle birlikte saklanır — tüketicisi
 * `app/components/AnaEkranaEkle.tsx`.
 *
 * Bu dosya "use client" DEĞİL: istemci modülünden sunucu bileşenine
 * aktarılan dize değer olarak değil istemci referansı olarak gelirdi.
 */
export const KURULUM_YAKALAYICI =
  "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();" +
  "var l=document.querySelector('link[rel=\"manifest\"]');" +
  "window.__kurulumIstemi={olay:e,manifest:l&&l.getAttribute('href')};" +
  "window.dispatchEvent(new Event('kurulum-hazir'))});" +
  "window.addEventListener('appinstalled',function(){window.__kurulumIstemi=null;" +
  "window.dispatchEvent(new Event('kurulum-hazir'))});";
