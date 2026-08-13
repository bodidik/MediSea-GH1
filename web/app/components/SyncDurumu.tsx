"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { syncDurumu, syncDinle, type SyncDurum } from "@/app/lib/study-sync";

/**
 * Çalışma verisinin nerede durduğunu söyleyen gösterge.
 *
 * İki sebeple var. Birincisi dürüstlük: girişsiz kullanıcının notları
 * yalnızca o cihazda duruyor ve tarayıcı verisi silinirse gidiyor —
 * bunu kullanıcı kaybettikten sonra değil, önce bilmeli. İkincisi güven:
 * giriş yapmış kullanıcı çalışırken kaydedildiğini görmeli; sessizce
 * çalışan bir yedek, kullanıcı için var olmayan bir yedektir.
 *
 * Hata durumu yutulmuyor. "Kaydedildi" yazıp kaydetmemek, hiçbir şey
 * yazmamaktan beterdir.
 */

const METIN: Record<SyncDurum, { yazi: string; renk: string; nokta: string }> = {
  kapali:       { yazi: "Yalnızca bu cihazda", renk: "text-slate-500",  nokta: "bg-slate-300" },
  bekliyor:     { yazi: "Kaydediliyor…",       renk: "text-slate-500",  nokta: "bg-amber-400" },
  gonderiliyor: { yazi: "Kaydediliyor…",       renk: "text-slate-500",  nokta: "bg-amber-400" },
  tamam:        { yazi: "Cihazlarına kaydedildi", renk: "text-emerald-700", nokta: "bg-emerald-500" },
  hata:         { yazi: "Kaydedilemedi",       renk: "text-red-700",    nokta: "bg-red-500" },
};

export default function SyncDurumu({ genis = false }: { genis?: boolean }) {
  const { status } = useSession();
  const [durum, setDurum] = useState<SyncDurum>("kapali");

  useEffect(() => {
    setDurum(syncDurumu());
    return syncDinle(setDurum);
  }, []);

  // Oturum daha okunmadan bir şey iddia etme; yanlış bilgi vermekten iyidir.
  if (status === "loading") return null;

  const girisli = status === "authenticated";
  const g = METIN[girisli ? durum : "kapali"];

  if (!genis) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${g.renk}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${g.nokta}`} />
        {g.yazi}
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${g.renk}`}>
        <span className={`w-2 h-2 rounded-full ${g.nokta}`} />
        {g.yazi}
      </span>

      {!girisli && (
        <>
          <span className="text-[11px] text-slate-400 font-medium">
            Tarayıcı verini silersen notların ve vurguların gider.
          </span>
          <Link
            href="/kayit"
            className="ml-auto text-[11px] font-black uppercase tracking-widest text-blue-900 hover:underline whitespace-nowrap"
          >
            Ücretsiz hesapla koru →
          </Link>
        </>
      )}

      {girisli && durum === "hata" && (
        <span className="text-[11px] text-red-700/80 font-medium">
          Bağlantı kurulamadı — çalışman bu cihazda duruyor, bağlantı gelince tekrar denenecek.
        </span>
      )}

      {girisli && durum === "tamam" && (
        <span className="text-[11px] text-slate-400 font-medium">
          Başka bir cihazda giriş yaptığında kaldığın yerden devam edersin.
        </span>
      )}
    </div>
  );
}
