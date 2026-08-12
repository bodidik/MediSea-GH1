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
      return;
    }

    setAuthReady(true);
    startListening();

    if (!pulled.current) {
      pulled.current = true;
      pull();
    }

    const flush = () => { pushNow(); };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [status]);
}
