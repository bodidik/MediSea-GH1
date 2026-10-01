/**
 * Giriş/kayıttan sonra kullanıcının GELDİĞİ sayfaya dönüş adresi (`?geri=`).
 *
 * Bir dönem iki sayfa da her durumda `/`a gidiyordu: PDF indirmek için
 * üye olan kullanıcı, okuduğu konuyu ana sayfadan yeniden aramak zorunda
 * kalıyordu.
 *
 * YALNIZ site içi yol kabul edilir: `//kotu.site` ve `/\kotu.site` tarayıcıda
 * başka alana gider (açık yönlendirme). Geçersizse `/`.
 */
export function geriAdresi(): string {
  if (typeof window === "undefined") return "/";
  const g = new URLSearchParams(window.location.search).get("geri");
  if (!g || !g.startsWith("/") || g.startsWith("//") || g.startsWith("/\\")) return "/";
  return g;
}

/** `/giris` ya da `/kayit` bağlantısına bulunulan yolu ekler. */
export function geriyleBagla(hedef: "/giris" | "/kayit", yol: string): string {
  return `${hedef}?geri=${encodeURIComponent(yol)}`;
}
