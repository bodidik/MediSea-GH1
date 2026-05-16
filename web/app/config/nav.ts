// FILE: web/app/config/nav.ts

export const topNav = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Bölümler", href: "/sections" },
  { label: "Konular", href: "/topics" },
  { label: "Hesaplamalar", href: "/tools" },
  { label: "Kılavuzlar", href: "/guidelines" },
  { label: "Premium", href: "/premium" },
  { label: "YDUS", href: "/programs?track=YDUS" },
  { label: "USMLE", href: "/programs?track=USMLE" },
];


// Dahiliye alt bölümler
export const sections = [
  { label: "Nefroloji",        href: "/sections/nefroloji" },
  { label: "Gastroenteroloji", href: "/sections/gastroenteroloji" },
  { label: "Hematoloji",       href: "/sections/hematoloji" },
  { label: "Endokrinoloji",    href: "/sections/endokrinoloji" },
  { label: "Kardiyoloji",      href: "/sections/kardiyoloji" },
  { label: "İnfeksiyon",       href: "/sections/infeksiyon" },
  { label: "Göğüs Hast.",      href: "/sections/gogus" },
  { label: "Romatoloji",       href: "/sections/romatoloji" },
  { label: "Geriatri",         href: "/sections/geriatri" },
  { label: "İmmünoloji",       href: "/sections/immunoloji" },
  { label: "Onkoloji",         href: "/sections/onkoloji" },
];

// Tek export ile erişilebilir
const navConfig = { topNav, sections };
export default navConfig;

