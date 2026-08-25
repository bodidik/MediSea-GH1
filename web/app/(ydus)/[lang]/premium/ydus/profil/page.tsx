// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\profil\page.tsx"
'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUser } from '@/app/(ydus)/context/UserContext';
import { branchSlugOf, collectAll } from '@/app/lib/study-index';
import { SPECIALTIES } from '@/app/lib/specialties';
import { localStats } from '@/app/lib/study-stats';
import { rutbe } from '@/app/lib/rutbe';

/**
 * Bu sayfa bir dönem `STATIC_USER_DATA` diye bir sabitten besleniyordu:
 * ad "Dr. Kaptan", ünvan "Kıdemli Asistan", ateş serisi 12 gün ve dört branş
 * için %85 / %40 / %60 / %25 ilerleme. Hiçbiri ölçülmüş değildi.
 *
 * En zararlısı branş çubuklarıydı. Sınava hazırlanan biri "Hematolojide
 * %85'im, Endokrinde %25" diye program yapar; sayı uydurma olduğu için
 * program da uydurma bir zemine oturur. Üstelik listedeki branşlar
 * kütüphaneyle bile örtüşmüyordu — en çok simülasyonu olan Göğüs
 * Hastalıkları listede yoktu, hiç vakası olmayan Gastroenteroloji vardı.
 *
 * Artık dört alan da ölçülen veriden geliyor:
 *  - ad      → oturumdaki isim; yoksa markanın hitabı ("Kaptan")
 *  - ünvan   → gerçek XP'den türeyen rütbe (liderlik tablosuyla aynı merdiven)
 *  - seri    → çalışma günlüğünden (`localStats().streak`)
 *  - branşlar→ dokunulan konu / toplam konu; Çalışma Alanım'daki kapsama
 *              bölümünün TAM AYNI kaynağı, yoksa iki yüzey ayrışırdı.
 */

/** Çubuk renkleri sırayla dağıtılır — branş adına sabitlenmiş renk yok. */
const CUBUK = [
  { text: 'text-rose-400', bg: 'bg-rose-500' },
  { text: 'text-emerald-400', bg: 'bg-emerald-500' },
  { text: 'text-orange-400', bg: 'bg-orange-500' },
  { text: 'text-purple-400', bg: 'bg-purple-500' },
];

type BransSatiri = { slug: string; ad: string; ikon: string; calisilan: number; toplam: number };

// --- TÜM ROZETLERİN VERİTABANI (ZIRH: Tam string renk sınıfları eklendi) ---
const ALL_BADGES = {
  'lupus_fatihi': { 
    title: "Lupus Fatihi", desc: "Lupus Nefriti vakasını hatasız çözdü.", icon: "🐺", 
    bgClass: "bg-blue-500/20", borderClass: "border-blue-500/30" 
  },
  'varis_ustasi': { 
    title: "Kanama Ustası", desc: "Varis kanamasını anında durdurdu.", icon: "🩸", 
    bgClass: "bg-red-500/20", borderClass: "border-red-500/30" 
  },
  'dka_kaptani': { 
    title: "DKA Kaptanı", desc: "Asidozu potasyumu düşürmeden yönetti.", icon: "⚖️", 
    bgClass: "bg-purple-500/20", borderClass: "border-purple-500/30" 
  },
};

export default function ProfileDashboard() {
  const { xp, completedModules, badges } = useUser();
  const { data: session } = useSession();

  // Depo yalnızca tarayıcıda okunur; sunucu render'ında sıfır kalır ve
  // hidrasyondan sonra gerçek değere geçer.
  const [seri, setSeri] = useState(0);
  const [calisilan, setCalisilan] = useState<Record<string, number>>({});
  const [toplamlar, setToplamlar] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    setSeri(localStats().streak);

    // Hangi branşta kaç AYRI konuya dokunulmuş — Çalışma Alanım'daki
    // kapsama bölümüyle birebir aynı hesap.
    const kume: Record<string, Set<string>> = {};
    for (const e of collectAll()) {
      const slug = branchSlugOf(e.path);
      if (!slug) continue;
      (kume[slug] ??= new Set()).add(e.path);
    }
    const sayim: Record<string, number> = {};
    for (const [k, v] of Object.entries(kume)) sayim[k] = v.size;
    setCalisilan(sayim);

    let iptal = false;
    fetch('/api/branch-counts')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!iptal && d?.counts) setToplamlar(d.counts);
      })
      // Sayımlar alınamazsa bölüm hiç gösterilmez; yanlış sayı göstermekten iyidir.
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, []);

  const branslar = useMemo<BransSatiri[]>(() => {
    if (!toplamlar) return [];
    return SPECIALTIES.map((s) => ({
      slug: s.slug,
      ad: s.title,
      ikon: s.icon,
      calisilan: calisilan[s.slug] ?? 0,
      toplam: toplamlar[s.slug] ?? 0,
    }))
      .filter((r) => r.toplam > 0 && r.calisilan > 0)
      .sort((a, b) => b.calisilan - a.calisilan)
      .slice(0, 4);
  }, [toplamlar, calisilan]);

  return (
    <div className="koyu-yuzey min-h-screen bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-100">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Navigasyon */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Link href="/tr/premium/ydus" className="inline-block py-1.5 hover:text-blue-400 transition-colors">⚓ Mavi Vatan Lobi</Link>
            <span>/</span>
            <span className="text-slate-200">Kaptan Sicil Kaydı</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/tr/premium/ydus" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
              Köprüüstüne Dön ➡️
            </Link>
            <Link href="/tr/premium/ydus/liderlik" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2">
              <span aria-hidden="true">🏆</span> Liderlik Tablosu
            </Link>
          </div>
        </div>

        {/* 1. PROFİL HERO KARTI */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 mb-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-8 border border-blue-900/30">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-1 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-5xl border-4 border-slate-900">
                👨‍⚕️
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-sm">
              LEVEL {Math.floor(xp / 500) + 1}
            </div>
          </div>
          
          <div className="text-center sm:text-left flex-1 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {session?.user?.name?.trim() || 'Kaptan'}
            </h1>
            <p className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-6">{rutbe(xp)}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                <span className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Seyir Mili (XP)</span>
                <span className="text-2xl font-black text-yellow-400">{xp} <span className="text-sm text-slate-500">nm</span></span>
              </div>
              <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                <span className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Ateş Serisi</span>
                <span className="text-2xl font-black text-orange-500">{seri} <span className="text-sm text-slate-500">GÜN 🔥</span></span>
              </div>
              <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                <span className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Bitirilen Modül</span>
                <span className="text-2xl font-black text-emerald-400">{completedModules.length} <span className="text-sm text-slate-500">ADET 📚</span></span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. BRANŞ İLERLEME DURUMU */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-800">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span aria-hidden="true" className="text-2xl">📈</span> Branş Hakimiyeti
            </h2>
            {branslar.length === 0 ? (
              <div className="text-center py-6">
                <span aria-hidden="true" className="text-4xl block mb-3 opacity-50">🧭</span>
                <p className="text-slate-400 text-sm font-medium mb-4">
                  Henüz hiçbir konuda işaretin yok. Bir konuyu okuyup vurgulamaya
                  başladığında hakimiyetin burada birikmeye başlar.
                </p>
                <Link
                  href="/topics"
                  className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500"
                >
                  Kütüphaneye git
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {branslar.map((b, idx) => {
                  const oran = Math.round((b.calisilan / b.toplam) * 100);
                  const renk = CUBUK[idx % CUBUK.length];
                  return (
                    <div key={b.slug}>
                      <div className="flex justify-between items-end mb-2 gap-3">
                        <div className="flex items-center gap-2 font-bold text-slate-300">
                          <span aria-hidden="true">{b.ikon}</span> {b.ad}
                        </div>
                        {/* Sayı da yazılıyor: yalnız yüzde görmek "%17" ile
                            "2/12"yi ayırt ettirmiyor, oysa plan yaparken
                            fark eden şey ikincisi. */}
                        <span className={`text-sm font-black shrink-0 ${renk.text}`}>
                          {b.calisilan}/{b.toplam}
                          <span className="text-slate-400 font-bold"> konu</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                        <div
                          className={`${renk.bg} h-full rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${Math.max(oran, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-400 leading-relaxed">
                  İşaret bıraktığın konuların branş içindeki payı. Dokunmadığın
                  branşların tamamını{' '}
                  <Link href="/calisma-alanim" className="font-bold text-blue-400 hover:text-blue-300">
                    Çalışma Alanım
                  </Link>{' '}
                  sayfasındaki kapsama bölümünde görebilirsin.
                </p>
              </div>
            )}
          </div>

          {/* 3. ROZETLER VE BAŞARILAR */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-800">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span aria-hidden="true" className="text-2xl">🏆</span> Rozetler
            </h2>
            
            {badges.length === 0 ? (
              <div className="text-center py-8">
                <span aria-hidden="true" className="text-4xl block mb-3 opacity-50">🛡️</span>
                <p className="text-slate-500 text-sm font-medium">Henüz rozet kazanmadınız. Simülasyonları çözerek koleksiyonu tamamlayın!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {badges.map((badgeId) => {
                  const badgeInfo = ALL_BADGES[badgeId as keyof typeof ALL_BADGES];
                  if (!badgeInfo) return null;
                  
                  return (
                    <div key={badgeId} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:shadow-md transition-all group">
                      {/* ZIRH: Rozet renkleri güvenli hale getirildi */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 border group-hover:scale-110 transition-transform ${badgeInfo.bgClass} ${badgeInfo.borderClass}`}>
                        {badgeInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm mb-0.5">{badgeInfo.title}</h3>
                        <p className="text-[10px] text-slate-400 font-medium leading-snug">{badgeInfo.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {badges.length > 0 && (
              <div className="mt-6 text-center">
                <button className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors">
                  Tüm Rozetleri Gör ▾
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}