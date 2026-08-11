import { UserProvider } from "@/app/(ydus)/context/UserContext";
import ReadingTools from "@/app/components/ReadingTools";
import NotePanel from "@/app/components/NotePanel";
import ReadingHint from "@/app/components/ReadingHint";

export default function YdusLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {/* bg-slate-950: Gece denizi karanlığı
         text-slate-100: Parlayan kontrol paneli ışıkları
      */}
      <div className="ydus-premium-layout bg-slate-950 min-h-screen text-slate-100 selection:bg-blue-500/30">
        {/* Buraya AppShell sızamaz, SiteHeader gelemez. Tamamen izole! */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Okuma araçları — yalnızca [data-readable] taşıyan sayfalarda görünür */}
        <ReadingTools />
        <NotePanel />
        <ReadingHint />

        {/* İstersen buraya arka plana hafif bir deniz dalgası efekti ekleyebiliriz */}
      </div>
    </UserProvider>
  );
}