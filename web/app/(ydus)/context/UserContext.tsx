'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { PUAN_KEY, kazanimDegeri, puanBirlestir, puanNormalize } from '@/app/lib/xp';
import { degistiBildir } from '@/app/lib/depo';

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
  /** Kimlik İLK kez görülüyorsa XP ekler (değer kimlikten, `kazanimDegeri`); ikinci çağrı hiçbir şey yapmaz. */
  kazan: (kimlik: string) => void;
};

export const UserContext = createContext<UserState | undefined>(undefined);

/** Depodaki kayıt; yoksa ya da bozuksa `null` (bozuk kayıt yüklemede yedeğe taşınır). */
function depoOku() {
  try {
    const v = JSON.parse(localStorage.getItem(PUAN_KEY) || 'null');
    return v && typeof v === 'object' ? puanNormalize(v) : null;
  } catch {
    return null;
  }
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
      const saved = localStorage.getItem(PUAN_KEY);
      if (saved) {
        // Ayrıştırma hatası aşağıdaki kurtarma dalına düşer; şekil ise
        // yedek/senkronla ORTAK normalleştiriciden geçer (eski kayıtta
        // `kazanimlar` YOK — boş listeye düşer).
        const p = puanNormalize(JSON.parse(saved));
        setXp(p.xp);
        setCompletedModules(p.completedModules);
        setBadges(p.badges);
        odenen.current = new Set(p.kazanimlar);
        setKazanimlar(p.kazanimlar);
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
        const ham = localStorage.getItem(PUAN_KEY);
        if (ham) localStorage.setItem(PUAN_KEY + '_bozuk', ham);
      } catch {
        // Yedekleme de başarısızsa yapılabilecek bir şey yok.
      }
    }
    setHazir(true);
  }, []);

  /**
   * OKU-BİRLEŞTİR-YAZ — XP canlıda kazanılıyor, yani iki sekme aynı kaydı
   * yazabiliyor. Durumu OLDUĞU GİBİ yazmak, son yazan sekmenin ötekinin
   * kazancını silmesi demekti. Birleştirme yedek ve senkronla AYNI kural
   * (`puanBirlestir`, app/lib/xp.ts): kazanımlar birleşim, XP onlardan
   * türer — tekrarda sabit, iki taraftaki kazanç tam toplanır. Bilinmeyen
   * alan yazılmaz (düşer).
   */
  useEffect(() => {
    if (!hazir) return;
    try {
      const bizim = { xp, completedModules, badges, kazanimlar };
      const depo = depoOku();
      const kayit = depo ? puanBirlestir(depo, bizim) : bizim;
      localStorage.setItem(PUAN_KEY, JSON.stringify(kayit));
      // Öteki sekmenin (ya da senkronun) kazancı ekrana da gelsin; fark
      // yoksa durum değişmez ve etki yeniden tetiklenmez.
      if (kayit.xp !== xp) setXp(kayit.xp);
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

  const kazan = useCallback((kimlik: string) => {
    // Yükleme bitmeden ödeme yok: depodaki kazanımlar henüz bilinmiyor.
    if (!hazir || odenen.current.has(kimlik)) return;
    odenen.current.add(kimlik);
    // Öteki sekme bu kazanımı ödediyse ikinci kez ödeme.
    if (depoOku()?.kazanimlar.includes(kimlik)) return;
    setKazanimlar(prev => [...prev, kimlik]);
    setXp(prev => prev + kazanimDegeri(kimlik));
    // Senkron push'u planlansın (kullanıcı eylemi) — yoksa puan sunucuya
    // ancak sayfa kapanırken ulaşırdı (bkz. depo.ts `degistiBildir`).
    degistiBildir();
  }, [hazir]);

  // Sadece puan ekleme fonksiyonu (taban puan — kazanım listesine girmez)
  const addXp = (amount: number) => setXp(prev => prev + amount);

  // Modül bitirme, XP ve rozet kazanma fonksiyonu (Aynı modülü iki kez bitirince puanı suistimal etmesin diye kontrol)
  const completeModule = (moduleId: string, earnedXp: number, badgeId?: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);
      setXp(prev => prev + earnedXp);
      if (badgeId && !badges.includes(badgeId)) {
        setBadges(prev => [...prev, badgeId]);
      }
      degistiBildir();
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