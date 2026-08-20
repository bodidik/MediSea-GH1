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

  /**
   * role="status": durum değişimi ekran okuyucuya DUYURULMALI.
   *
   * Bu bileşenin varlık sebebi zaten dürüstlük — "Kaydedildi" yazıp
   * kaydetmemek kaydetmemekten beterdir. Ama duyurulmayan bir durum
   * göstergesi, göremeyen kullanıcı için hiç yok demek: "Kaydediliyor…"dan
   * "Kaydedilemedi"ye geçişi fark etmiyordu.
   *
   * Kapsayıcı her zaman basılıyor, yalnızca içindeki metin değişiyor —
   * canlı bölgenin değişimden ÖNCE DOM'da bulunması gerekiyor.
   */
  if (!genis) {
    return (
      <span role="status" className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${g.renk}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${g.nokta}`} />
        {g.yazi}
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span role="status" className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${g.renk}`}>
        <span className={`w-2 h-2 rounded-full ${g.nokta}`} />
        {g.yazi}
      </span>

      {/* Girişsiz durum, açık taraftan ödeme hattına geçişin tek noktası.
          Uyarı okunur boyutta (dönüştüren şey uyarının kendisi), eylem de
          düğme görünümünde: bir dönem ikisi de 11px düz metindi ve
          kutudaki en sessiz öge tıklanması istenen şeydi — üstelik 16.5px
          tıklama alanıyla. */}
      {!girisli && (
        <>
          <span className="text-[13px] leading-snug text-slate-600 font-medium">
            Tarayıcı verini silersen notların ve vurguların gider.
          </span>
          <Link
            href="/kayit"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-[13px] font-bold text-white whitespace-nowrap transition-colors hover:bg-blue-800"
          >
            Ücretsiz hesapla koru
            <span aria-hidden="true">→</span>
          </Link>
        </>
      )}

      {girisli && durum === "hata" && (
        <span className="text-[11px] text-red-700 font-medium">
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
