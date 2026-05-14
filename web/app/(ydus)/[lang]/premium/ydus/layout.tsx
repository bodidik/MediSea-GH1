//C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\layout.tsx
import { UserProvider } from "@/app/(ydus)/context/UserContext";

// Bu layout, "ydus" klasörü altındaki TÜM sayfalara UserProvider'ı enjekte eder.
export default function YdusLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}