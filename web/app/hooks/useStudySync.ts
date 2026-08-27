"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { pull, startListening, pushNow, setAuthReady } from "@/app/lib/study-sync";

export function useStudySync() {
  const { status } = useSession();
  const pulled = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setAuthReady(false);
      /*
       * REF DE SIFIRLANMALI.
       *
       * `setAuthReady(false)` `reconciled`ı sıfırlıyor ama `pulled` ref'i
       * sayfa ömrü boyunca `true` kalıyordu. Oturum düşüp GERİ GELDİĞİNDE
       * (süre dolması + `/giris` üzerinden yeniden giriş — o sayfa
       * `router.push` kullanıyor, yani sağlayıcı hiç yeniden kurulmuyor)
       * `pull()` bir daha çağrılmıyor, uzlaşma hiç olmuyor ve push kalıcı
       * olarak ölü kalıyordu.
       *
       * Ölçüldü: bu durumda gösterge "Kaydediliyor…"da donuyor ve giden
       * PUT sayısı 0.
       */
      pulled.current = false;
      return;
    }

    setAuthReady(true);
    startListening();

    if (!pulled.current) {
      pulled.current = true;
      pull();
    }

    const flush = () => { pushNow(); };
    // beforeunload masaüstünde çalışır ama tablette (iPad Safari, Android Chrome)
    // güvenilir DEĞİLDİR: sekme kapatma, uygulama değiştirme, OS'un tarayıcıyı
    // öldürmesi — bunlarda ateşlenmez. visibilitychange tablette güvenilirdir:
    // sayfa arka plana düştüğünde (uygulama değiştirme, kilit ekranı) tetiklenir.
    const onVis = () => {
      if (document.visibilityState === "hidden") pushNow();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [status]);
}
