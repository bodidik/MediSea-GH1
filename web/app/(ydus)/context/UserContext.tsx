'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

// Sistemin tanıyacağı veri tipleri
type UserState = {
  xp: number;
  /** Tamamlanan KONU kimlikleri (çalışma planı bunu okur). */
  completedModules: string[];
  badges: string[];
  /** XP'si ödenmiş kazanım kimlikleri (`app/lib/xp.ts` → `xpKimligi`). */
  kazanimlar: string[];
  addXp: (amount: number) => void;
  completeModule: (moduleId: string, earnedXp: number, badgeId?: string) => void;
  /** Kimlik İLK kez görülüyorsa XP ekler; ikinci çağrı hiçbir şey yapmaz. */
  kazan: (kimlik: string, miktar: number) => void;
};

export const UserContext = createContext<UserState | undefined>(undefined);

type DepoKaydi = { xp?: unknown; completedModules?: unknown; badges?: unknown; kazanimlar?: unknown };

/** Depodaki kayıt; yoksa ya da bozuksa `null` (bozuk kayıt yüklemede yedeğe taşınır). */
function depoOku(): DepoKaydi | null {
  try {
    const v = JSON.parse(localStorage.getItem('ydus_premium_user') || 'null');
    return v && typeof v === 'object' ? (v as DepoKaydi) : null;
  } catch {
    return null;
  }
}

function birlesim(depodaki: unknown, bizdeki: string[]): string[] {
  const eski = Array.isArray(depodaki) ? depodaki.filter((x): x is string => typeof x === 'string') : [];
  return Array.from(new Set([...eski, ...bizdeki]));
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [kazanimlar, setKazanimlar] = useState<string[]>([]);
  /* Tekrarsızlık denetimi REF üzerinden: durum güncelleyicisinin içinde yan
     etki (setXp) StrictMode'da iki kez çalışır ve puanı ikiye katlardı; aynı
     karede iki çağrı da bayat kapanışı görürdü. Ref yüklemeyle eşitlenir. */
  const odenen = useRef<Set<string>>(new Set());

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
        // Eski kayıtta alan YOK — boş listeye düşer.
        const k: string[] = Array.isArray(parsed?.kazanimlar)
          ? parsed.kazanimlar.filter((x: unknown): x is string => typeof x === 'string')
          : [];
        odenen.current = new Set(k);
        setKazanimlar(k);
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

  /**
   * OKU-BİRLEŞTİR-YAZ — XP artık canlıda kazanılıyor, yani iki sekme aynı
   * kaydı yazabiliyor. Durumu OLDUĞU GİBİ yazmak, son yazan sekmenin ötekinin
   * kazancını silmesi demekti (soru motorunun ilerleme kaydında ölçülüp aynı
   * deyimle kapatılan sınıf). Listeler birleşim; XP ise depodaki değerin
   * üstüne BU sekmede kazanılan fark (`bekleyenXp`) — ikisi toplanmaz,
   * aynı kazanım iki kez sayılmaz. Bilinmeyen alan yazılmaz (düşer).
   */
  const bekleyenXp = useRef(0);
  useEffect(() => {
    if (!hazir) return;
    try {
      const depo = depoOku();
      const yeniXp = typeof depo?.xp === 'number' ? depo.xp + bekleyenXp.current : xp;
      const kayit = {
        xp: yeniXp,
        completedModules: birlesim(depo?.completedModules, completedModules),
        badges: birlesim(depo?.badges, badges),
        kazanimlar: birlesim(depo?.kazanimlar, kazanimlar),
      };
      localStorage.setItem('ydus_premium_user', JSON.stringify(kayit));
      bekleyenXp.current = 0;
      // Öteki sekmenin kazancı ekrana da gelsin; fark yoksa durum değişmez.
      if (yeniXp !== xp) setXp(yeniXp);
      if (kayit.kazanimlar.length !== kazanimlar.length) {
        odenen.current = new Set(kayit.kazanimlar);
        setKazanimlar(kayit.kazanimlar);
      }
      if (kayit.completedModules.length !== completedModules.length) setCompletedModules(kayit.completedModules);
      if (kayit.badges.length !== badges.length) setBadges(kayit.badges);
    } catch {
      // Depo dolu olabilir; sessizce düşmek premium ilerlemeyi bozmaz.
    }
  }, [hazir, xp, completedModules, badges, kazanimlar]);

  const kazan = useCallback((kimlik: string, miktar: number) => {
    // Yükleme bitmeden ödeme yok: depodaki kazanımlar henüz bilinmiyor.
    if (!hazir || odenen.current.has(kimlik)) return;
    // Öteki sekme bu kazanımı ödediyse ikinci kez ödeme.
    const depo = depoOku();
    if (Array.isArray(depo?.kazanimlar) && depo.kazanimlar.includes(kimlik)) {
      odenen.current.add(kimlik);
      return;
    }
    odenen.current.add(kimlik);
    bekleyenXp.current += miktar;
    setKazanimlar(prev => [...prev, kimlik]);
    setXp(prev => prev + miktar);
  }, [hazir]);

  // Sadece puan ekleme fonksiyonu
  const addXp = (amount: number) => {
    bekleyenXp.current += amount;
    setXp(prev => prev + amount);
  };

  // Modül bitirme, XP ve rozet kazanma fonksiyonu (Aynı modülü iki kez bitirince puanı suistimal etmesin diye kontrol)
  const completeModule = (moduleId: string, earnedXp: number, badgeId?: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);
      bekleyenXp.current += earnedXp;
      setXp(prev => prev + earnedXp);
      if (badgeId && !badges.includes(badgeId)) {
        setBadges(prev => [...prev, badgeId]);
      }
    }
  };

  return (
    <UserContext.Provider value={{ xp, completedModules, badges, kazanimlar, addXp, completeModule, kazan }}>
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