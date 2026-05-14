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

const UserContext = createContext<UserState | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  // Sayfa yüklendiğinde eski verileri tarayıcı hafızasından (LocalStorage) çek
  useEffect(() => {
    const saved = localStorage.getItem('ydus_premium_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setXp(parsed.xp || 0);
      setCompletedModules(parsed.completedModules || []);
      setBadges(parsed.badges || []);
    }
  }, []);

  // Puan veya rozet değiştiğinde tarayıcı hafızasına kaydet (Sayfa yenilense de silinmez)
  useEffect(() => {
    localStorage.setItem('ydus_premium_user', JSON.stringify({ xp, completedModules, badges }));
  }, [xp, completedModules, badges]);

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