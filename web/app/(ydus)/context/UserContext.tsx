'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Sistemin tanıyacağı veri tipleri
type UserState = {
  xp: number;
  completedModules: string[];
  badges: string[];
  addXp: (amount: number) => void;
  completeModule: (moduleId: string, earnedXp: number, badgeId?: string) => void;
};

export const UserContext = createContext<UserState | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  /**
   * İLK YÜKLEME BİTMEDEN YAZMA YOK.
   *
   * Kaydetme etkisi bir dönem korumasızdı ve kurulum anında, durum henüz
   * boşken depoya `{xp:0, completedModules:[], badges:[]}` yazıyordu.
   * Ölçüldü (yerel dev, tek yenileme): depoya
   * `{xp:12500, modül:2, rozet:1}` konup sayfa yenilendiğinde ilk örnekte
   * `xp=0, modül=0` çıkıyor ve öyle kalıyordu — yani kullanıcının BÜTÜN
   * premium ilerlemesi her sayfa açılışında siliniyordu.
   *
   * StrictMode etkileri iki kez çalıştırdığı için zarar kalıcı oluyordu:
   * ilk turda sıfır yazılıyor, ikinci turda okuma o sıfırı geri okuyordu.
   *
   * Aynı korumanın kanıtlanmış örneği FlashcardPlayer'da: `yuklendi` bayrağı
   * konmadan yazılmaz (bkz. CLAUDE.md, "boş küme depodakini siler").
   * Bayrak `useRef` DEĞİL `useState`: ref sürümü denendi ve YETMEDİ. Ref'i
   * okuma etkisinin içinde true yapınca, aynı commit'te hemen ardından
   * çalışan kaydetme etkisi bayrağı true görüyor ama durum henüz boş —
   * yine sıfır yazıyordu (ölçüldü, depo yine 0'a düştü). Durum kullanınca
   * kaydetme etkisi ancak yüklenen değerlerin uygulandığı commit'te
   * çalışıyor.
   */
  const [hazir, setHazir] = useState(false);

  // Sayfa yüklendiğinde eski verileri tarayıcı hafızasından (LocalStorage) çek
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ydus_premium_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setXp(typeof parsed?.xp === 'number' ? parsed.xp : 0);
        setCompletedModules(Array.isArray(parsed?.completedModules) ? parsed.completedModules : []);
        setBadges(Array.isArray(parsed?.badges) ? parsed.badges : []);
      }
    } catch {
      /**
       * Bozuk kayıt ÖNCE KENARA ALINIR, sonra normale devam edilir.
       *
       * `JSON.parse` korumasızdı: tek bozuk karakter etkiyi düşürüyor,
       * ardından kaydetme etkisi boş durumu kalıcılaştırıyordu — yani bozuk
       * ama elde duran veri geri dönülmez biçimde siliniyordu.
       *
       * "Hiç yazma" da çözüm değil: o zaman bozuk kaydı olan kullanıcı bir
       * daha hiçbir ilerlemesini kaydedemez. Bu yüzden ham dize yedek
       * anahtara taşınıyor; uygulama çalışmaya devam ediyor ama veri
       * kaybolmuyor.
       */
      try {
        const ham = localStorage.getItem('ydus_premium_user');
        if (ham) localStorage.setItem('ydus_premium_user_bozuk', ham);
      } catch {
        // Yedekleme de başarısızsa yapılabilecek bir şey yok.
      }
    }
    setHazir(true);
  }, []);

  // Puan veya rozet değiştiğinde tarayıcı hafızasına kaydet (Sayfa yenilense de silinmez)
  useEffect(() => {
    if (!hazir) return;
    try {
      localStorage.setItem('ydus_premium_user', JSON.stringify({ xp, completedModules, badges }));
    } catch {
      // Depo dolu olabilir; sessizce düşmek premium ilerlemeyi bozmaz.
    }
  }, [hazir, xp, completedModules, badges]);

  // Sadece puan ekleme fonksiyonu
  const addXp = (amount: number) => setXp(prev => prev + amount);

  // Modül bitirme, XP ve rozet kazanma fonksiyonu (Aynı modülü iki kez bitirince puanı suistimal etmesin diye kontrol)
  const completeModule = (moduleId: string, earnedXp: number, badgeId?: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);
      setXp(prev => prev + earnedXp);
      if (badgeId && !badges.includes(badgeId)) {
        setBadges(prev => [...prev, badgeId]);
      }
    }
  };

  return (
    <UserContext.Provider value={{ xp, completedModules, badges, addXp, completeModule }}>
      {children}
    </UserContext.Provider>
  );
}

// Diğer sayfalarda kullanacağımız sihirli kanca (hook)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser, UserProvider içinde kullanılmalıdır!');
  return context;
};