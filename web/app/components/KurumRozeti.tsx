"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Ana sayfadaki "🎓 KayseriTıp" kısayolu.
 *
 * Neden ayrı bir istemci bileşeni: bu tek rozet, ana sayfanın TAMAMINI
 * `force-dynamic` yapıyordu. Sayfa `auth()` çağırdığı için her istekte
 * sunucuda yeniden üretiliyor, CDN'e hiç girmiyordu — canlıda ölçüldü,
 * arka arkaya iki istekte de `x-vercel-cache: MISS`. Sitenin en çok
 * istenen sayfası, kullanıcıların çok küçük bir kısmına görünen bir
 * bağlantı yüzünden önbelleksizdi.
 *
 * Kurum bilgisi zaten oturum çerezinde taşınıyor (auth.config.ts, session
 * callback), yani istemci kendi karar verebiliyor. Yöneticilik ise sunucu
 * sırrı (ADMIN_EMAIL) olduğu için var olan /api/admin/durum ucuna sorulur —
 * yalnızca giriş yapmış kullanıcı için, tek istek.
 *
 * İlk karede null döner: sunucu HTML'i artık herkes için aynı ve
 * önbelleklenebilir; rozet hidrasyondan sonra beliriyor.
 */
export default function KurumRozeti() {
  const { data: session, status } = useSession();
  const [admin, setAdmin] = useState(false);

  const kurumlu = (session?.user as { institution?: string } | undefined)?.institution === "kayseritip";

  useEffect(() => {
    // Girişsiz kullanıcı için ağa hiç çıkma.
    if (status !== "authenticated" || kurumlu) return;
    let iptal = false;
    fetch("/api/admin/durum")
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((v) => { if (!iptal) setAdmin(Boolean(v?.admin)); })
      .catch(() => { /* uç ulaşılamazsa rozet gösterme — kapalı tarafa düş */ });
    return () => { iptal = true; };
  }, [status, kurumlu]);

  if (!kurumlu && !admin) return null;

  return (
    <Link
      href="/kayseritip"
      className="rounded-full bg-indigo-600 text-white px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
    >
      🎓 KayseriTıp
    </Link>
  );
}
