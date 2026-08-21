"use client";

import { useEffect, useState } from "react";
import { evreBul, type Evre, type Sinav } from "@/lib/sinav";

/**
 * Sınava kalan gün sayısı.
 *
 * Yılda tek sınav olduğu için bu sayı platformun en güçlü motive edici ögesi:
 * kullanıcı her girişinde nerede durduğunu görüyor.
 *
 * Gün hesabı SUNUCUDA DEĞİL istemcide yapılıyor. Sunucuda hesaplanan bir sayı
 * sayfa önbelleğe alındığında donar ve ertesi gün hâlâ dünkü sayıyı gösterir;
 * geri sayımda bu, güveni bitiren türden bir hatadır.
 */

const EVRE_METNI: Record<Evre, { etiket: string; oneri: string; renk: string; zemin: string }> = {
  uzun: {
    etiket: "Uzun vade",
    oneri: "Temel kurma zamanı: konuları sindirerek çalış, notlarını biriktir.",
    renk: "text-blue-100",
    zemin: "from-blue-950 to-slate-900",
  },
  son100: {
    etiket: "Son 100 gün",
    oneri: "Hızlanma dönemi: konu bitirmeye ağırlık ver, soru çözmeyi düzenli hâle getir.",
    renk: "text-amber-100",
    zemin: "from-amber-900 to-slate-900",
  },
  son30: {
    etiket: "Son 30 gün",
    oneri: "Tekrar ve eksik kapatma: yeni konuya başlamak yerine bildiklerini sağlamlaştır.",
    renk: "text-orange-100",
    zemin: "from-orange-900 to-slate-900",
  },
  sonHafta: {
    etiket: "Son hafta",
    oneri: "Yalnızca tekrar: vurgularını ve yanlış çözdüğün soruları gözden geçir.",
    renk: "text-red-100",
    zemin: "from-red-900 to-slate-900",
  },
  bugun: {
    etiket: "Sınav günü",
    oneri: "Bugün çalışma günü değil. Başarılar.",
    renk: "text-emerald-100",
    zemin: "from-emerald-900 to-slate-900",
  },
};

/** Yerel gün farkı — saat/dakika değil, takvim günü sayılır. */
function kalanGunHesapla(tarih: string): number {
  const [y, a, g] = tarih.split("-").map(Number);
  const sinav = new Date(y, a - 1, g);
  const bugun = new Date();
  const bugunGun = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  return Math.round((sinav.getTime() - bugunGun.getTime()) / 86_400_000);
}

export default function GeriSayim({ sinavlar }: { sinavlar: Sinav[] }) {
  const [veri, setVeri] = useState<{ sinav: Sinav; kalan: number } | null>(null);

  useEffect(() => {
    // Geçmiş sınavlar elenir, en yakın gelecek olan seçilir.
    const gelecek = sinavlar
      .map((s) => ({ sinav: s, kalan: kalanGunHesapla(s.tarih) }))
      .filter((x) => x.kalan >= 0)
      .sort((a, b) => a.kalan - b.kalan);
    setVeri(gelecek[0] ?? null);
  }, [sinavlar]);

  // Takvim boş ya da tüm sınavlar geçmiş: uydurma bir şey gösterme.
  if (!veri) return null;

  const evre = evreBul(veri.kalan);
  const m = EVRE_METNI[evre];
  const tarihYazi = new Date(veri.sinav.tarih + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${m.zemin} p-5 text-white shadow-lg`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/80">
            {veri.sinav.ad}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            {veri.kalan === 0 ? (
              <span className="text-3xl font-black tracking-tight">Bugün</span>
            ) : (
              <>
                <span className="text-4xl font-black tracking-tight tabular-nums">{veri.kalan}</span>
                <span className="text-sm font-bold text-white/90">gün kaldı</span>
              </>
            )}
          </div>
          <p className="mt-1 text-[11px] font-medium text-white/80">{tarihYazi}</p>
        </div>

        <div className="max-w-xs">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {m.etiket}
          </span>
          <p className={`mt-2 text-[12px] font-medium leading-relaxed ${m.renk}`}>
            {m.oneri}
          </p>
        </div>
      </div>

      {veri.sinav.not && (
        <p className="mt-4 border-t border-white/10 pt-3 text-[11px] font-medium text-white/80">
          {veri.sinav.not}
        </p>
      )}
    </div>
  );
}
