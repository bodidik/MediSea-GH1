//"C:\Users\hucig\Medknowledge\web\app\layout.tsx"
import "./globals.css";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin-ext"], variable: "--font-sans" });
const merriweather = Merriweather({ subsets: ["latin-ext"], variable: "--font-serif" });
const jetbrains = JetBrains_Mono({ subsets: ["latin-ext"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${merriweather.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        {/* Burada AppShell veya Header YOK! Sadece children. */}
        {children}
      </body>
    </html>
  );
}