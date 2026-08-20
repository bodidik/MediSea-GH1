"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Sinav } from "@/lib/sinav";

/**
 * Takvim boşken YALNIZCA yöneticiye görünen hatırlatma.
 *
 * Geri sayım ve çalışma planı, sınav tarihi girilene kadar hiçbir şey
 * basmıyor — tarih uydurmamak için bilinçli bir karar. Ama bunun bir yan
 * etkisi var: özellik sessizce ölü kalabilir ve kimse eksiği fark etmez.
 *
 * Ziyaretçiye "yapılandırma eksik" demek doğru olmaz; bu onun sorunu değil.
 * O yüzden uyarı yalnızca yöneticiye gösteriliyor.
 */
export default function SinavTakvimiUyarisi({ sinavlar }: { sinavlar: Sinav[] }) {
  const { status } = useSession();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let iptal = false;
    fetch("/api/admin/durum")
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((v) => {
        if (!iptal) setAdmin(!!v?.admin);
      })
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, [status]);

  // Gelecek sınav varsa uyarıya gerek yok.
  const bugun = new Date();
  const bugunISO = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, "0")}-${String(bugun.getDate()).padStart(2, "0")}`;
  const gelecekVar = sinavlar.some((s) => s.tarih >= bugunISO);

  if (!admin || gelecekVar) return null;

  return (
    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
      <p className="text-[13px] font-bold text-amber-900">
        Sınav tarihi girilmemiş — geri sayım ve çalışma planı bu yüzden
        görünmüyor.
      </p>
      <p className="mt-1 text-[12px] text-amber-900">
        ÖSYM takvimi açıklandığında{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px]">
          content/sinav-takvimi.json
        </code>{" "}
        dosyasına <code className="font-mono text-[11px]">{'{ "ad": "...", "tarih": "YYYY-AA-GG" }'}</code>{" "}
        eklemek yeterli. Bu not yalnızca sana görünüyor.
      </p>
    </div>
  );
}
