"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/app/(ydus)/context/UserContext";
import { type Sinav } from "@/lib/sinav";

/**
 * Sınav tarihine çakılı çalışma planı.
 *
 * "Son 100 gün paketi"ni gerçek kılan şey farklı içerik değil, farklı
 * TAKVİM. Son aylarda kıt olan şey konu anlatımı değil, neyi ne zaman
 * çalışacağını ve neyi hiç çalışmayacağını bilmek. Bu bileşen o sıralamayı
 * veriyor.
 *
 * Plan gerçek envanter üzerine kuruluyor: yalnızca "hazır" işaretli premium
 * konular. Tamamlananlar kullanıcının kendi kaydından (UserContext) geliyor.
 * Uydurma konu, uydurma süre yok.
 *
 * Takvim boşsa hiçbir şey basılmıyor — geri sayımla aynı ilke: tarih
 * uydurulmaz.
 */

/** Son bu kadar gün yeni konuya değil, tekrara ayrılır. */
const TEKRAR_PENCERESI = 30;

type Konu = { brans: string; id: string; baslik: string };

function kalanGunHesapla(tarih: string): number {
  const [y, a, g] = tarih.split("-").map(Number);
  const sinav = new Date(y, a - 1, g);
  const bugun = new Date();
  const bugunGun = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  return Math.round((sinav.getTime() - bugunGun.getTime()) / 86_400_000);
}

export default function CalismaPlani({
  lang,
  sinavlar,
  hazirKonular,
}: {
  lang: string;
  sinavlar: Sinav[];
  hazirKonular: Konu[];
}) {
  const { completedModules } = useUser();
  const [kalan, setKalan] = useState<number | null>(null);

  useEffect(() => {
    // Gün hesabı istemcide: sunucuda hesaplanan sayı önbelleğe alınınca donar.
    const gelecek = sinavlar
      .map((s) => kalanGunHesapla(s.tarih))
      .filter((g) => g >= 0)
      .sort((a, b) => a - b);
    setKalan(gelecek.length ? gelecek[0] : null);
  }, [sinavlar]);

  const tamamlanan = useMemo(
    () => new Set(completedModules ?? []),
    [completedModules]
  );

  const kalanKonular = useMemo(
    () => hazirKonular.filter((k) => !tamamlanan.has(k.id)),
    [hazirKonular, tamamlanan]
  );

  if (kalan === null || hazirKonular.length === 0) return null;

  const bitti = kalanKonular.length === 0;

  // Öğrenme penceresi: son TEKRAR_PENCERESI gün yeni konuya ayrılmaz.
  const ogrenmeGunu = Math.max(kalan - TEKRAR_PENCERESI, 0);
  const tekrarDonemi = ogrenmeGunu === 0;

  // Tekrar dönemindeysek ama konu kaldıysa, kalan günlere sıkıştırmak
  // zorundayız. Bunu gizlemek yerine söylüyoruz.
  const dagitimGunu = tekrarDonemi ? Math.max(kalan, 1) : ogrenmeGunu;
  const gunlukYuk = bitti ? 0 : Math.ceil(kalanKonular.length / dagitimGunu);
  const bugunku = kalanKonular.slice(0, gunlukYuk);

  const yetisemiyor = tekrarDonemi && !bitti;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          Bugünün Programı
        </h2>
        <span className="text-[11px] font-bold text-slate-400">
          {hazirKonular.length - kalanKonular.length} / {hazirKonular.length} konu tamamlandı
        </span>
      </div>

      {bitti ? (
        <p className="text-sm font-medium leading-relaxed text-emerald-700">
          Hazır konuların hepsini tamamladın. Kalan sürede tekrar ve soru
          çözmeye ağırlık ver.
        </p>
      ) : tekrarDonemi ? (
        <>
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            {/* "yetişir" demiyoruz: aynı kutuda "program sıkışık" uyarısı
                varken yetişeceğine söz vermek çelişkili ve iyimser bir yalan.
                Sayıyı veriyoruz, kararı kullanıcı veriyor. */}
            Sınava {kalan} gün kaldı — bu dönem tekrar dönemi. Yine de{" "}
            {kalanKonular.length} konu açık: günde {gunlukYuk} konu düşüyor.
          </p>
          {yetisemiyor && (
            <p className="mt-2 text-[12px] font-bold text-amber-700">
              Program sıkışık. Hepsini yetiştiremeyeceksen en çok soru gelen
              başlıklara öncelik ver — eksik bırakmak, hepsini yarım bilmekten
              iyidir.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          Son {TEKRAR_PENCERESI} günü tekrara ayırdık. Kalan {kalanKonular.length}{" "}
          konuyu {ogrenmeGunu} güne bölünce günde {gunlukYuk} konu düşüyor.
        </p>
      )}

      {bugunku.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {bugunku.map((k) => (
            <Link
              key={`${k.brans}/${k.id}`}
              href={`/${lang}/premium/ydus/${k.brans}/${k.id}`}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-blue-300 hover:bg-white"
            >
              <span className="text-slate-300 transition-transform group-hover:translate-x-0.5">
                →
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                {k.baslik}
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {k.brans.replace(/-/g, " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
