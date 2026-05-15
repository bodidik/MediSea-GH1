// app/(ydus)/[lang]/premium/layout.tsx

export default function Layout({ children }: { children: React.ReactNode }) {
  // Eski "premium-wrapper" sınıfını ve gereksiz sargıları sildik.
  // Artık içerideki page.tsx dosyaları kendi arka planlarını ve tasarımlarını özgürce ekrana basabilecek.
  return <>{children}</>;
}