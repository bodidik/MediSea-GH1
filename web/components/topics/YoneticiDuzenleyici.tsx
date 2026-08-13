"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

/**
 * Konu düzenleyicisini yalnızca yöneticiye gösteren kapı.
 *
 * Öncesinde 554 satırlık düzenleyici, hiçbir yetki kontrolü olmadan HER
 * ziyaretçiye basılıyordu. İki ayrı sorun: tıbbi bir referans sayfasında
 * rastgele bir okuyucuya yönetici paneli görünüyordu, ve o panelin JavaScript'i
 * kimsenin kullanmayacağı hâlde herkese indiriliyordu.
 *
 * Kapı İSTEMCİDE kuruluyor, sunucuda değil. Sunucuda oturuma göre farklı HTML
 * üretmek sayfayı kullanıcıya bağımlı kılar ve önbelleğe alınmasını engeller;
 * oysa konu sayfaları herkes için aynı ve önbelleğe alınabilir olmalı.
 *
 * Düzenleyici dinamik yükleniyor: yönetici olmayan hiç indirmiyor.
 */

const InlineTopicEditor = dynamic(() => import("@/components/topics/InlineTopicEditor"), {
  ssr: false,
  loading: () => (
    <div className="p-10 text-center text-sm text-slate-400">Düzenleyici yükleniyor…</div>
  ),
});

type Props = {
  item: React.ComponentProps<typeof InlineTopicEditor>["item"];
};

export default function YoneticiDuzenleyici({ item }: Props) {
  const { status } = useSession();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    // Oturum yoksa yetki ucunu hiç yormayalım.
    if (status !== "authenticated") {
      setAdmin(false);
      return;
    }
    let iptal = false;
    fetch("/api/admin/durum")
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((v) => {
        if (!iptal) setAdmin(!!v?.admin);
      })
      .catch(() => {
        if (!iptal) setAdmin(false);
      });
    return () => {
      iptal = true;
    };
  }, [status]);

  if (!admin) return null;

  return (
    <div className="pt-4 mt-4 border-t-2 border-dashed border-slate-200">
      <div className="flex items-center gap-2 mb-3 px-2">
        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
          Yönetici Paneli
        </span>
      </div>
      <div className="bg-slate-50 rounded-[2.5rem] shadow-inner border border-slate-200 overflow-hidden min-h-[500px]">
        <InlineTopicEditor item={item} />
      </div>
    </div>
  );
}
