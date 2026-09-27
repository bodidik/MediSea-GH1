import NextAuth from 'next-auth';
import { yoneticiEpostasiMi } from '@/lib/yonetici-eposta';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { authConfig } from '@/auth.config';
import { DIL_CEREZI, yonlendirmeHedefi } from '@/lib/dil';

/* Edge runtime: mongoose/bcrypt taşıyan @/auth yerine edge-güvenli yapılandırma */
const { auth } = NextAuth(authConfig);

/* Kimlik denetimi — davranışı DEĞİŞMEDİ, yalnızca eskiden matcher'ın seçtiği
   yollarda çağrılıyor (bkz. KIMLIK_YOLU). */
const kimlikDenetimi = auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;
  const institution = user?.institution ?? null;

  /* KayseriTıp özel alanı — kurumsal kontrol middleware'de kalır */
  if (pathname.includes('/kayseritip')) {
    // Ham karşılaştırma ADMIN_EMAIL tanımsızken `undefined === undefined`
    // olur ve OTURUMSUZ isteği yönetici sayardı — hem de en geniş kapıda,
    // bütün /kayseritip alanında. Kural artık tek yerden geliyor.
    const isAdmin = yoneticiEpostasiMi(user?.email);
    if (institution !== 'kayseritip' && !isAdmin) {
      return NextResponse.redirect(new URL('/giris?gerekli=kayseritip', req.url));
    }
  }

  /* Admin alanı — sadece oturum açmış kullanıcılar */
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/giris', req.url));
    }
  }

  return NextResponse.next();
});

/** Eski matcher'ın birebir karşılığı: '/kayseritip/:path*', '/admin/:path*', '/api/kayseritip/:path*'. */
const KIMLIK_YOLU = /^\/(kayseritip|admin|api\/kayseritip)(\/|$)/;

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = req.nextUrl;

  /* DİL — Türk olmayan ziyaretçi İngilizce siteye (kullanıcı kararı, 27 Eyl
     2026). Karar kuralları ve gerekçeleri `lib/dil.ts` → yonlendirmeHedefi.
     Yalnız GET: form gönderimi ve API asla yönlendirilmez. */
  if (req.method === 'GET') {
    const hedef = yonlendirmeHedefi({
      yol: pathname,
      arama: search,
      cerez: req.cookies.get(DIL_CEREZI)?.value,
      ulke: req.headers.get('x-vercel-ip-country'),
      acceptLanguage: req.headers.get('accept-language'),
      userAgent: req.headers.get('user-agent'),
    });
    if (hedef) {
      const yanit = NextResponse.redirect(new URL(hedef, req.url), 307);
      /* Karar kişiye özel (çerez, ülke, dil): yönlendirme ara önbelleğe
         GİRMEMELİ, yoksa bir ziyaretçinin kararı ötekine sunulur. */
      yanit.headers.set('Cache-Control', 'private, no-store');
      yanit.headers.set('Vary', 'Cookie, Accept-Language');
      return yanit;
    }
  }

  if (KIMLIK_YOLU.test(pathname)) {
    return (kimlikDenetimi as unknown as (r: NextRequest, e: NextFetchEvent) => Promise<Response>)(req, event);
  }
  return NextResponse.next();
}

export const config = {
  /* Bütün sayfalar (dil kararı için) + eski kimlik yolları. `_next`, API ve
     uzantılı dosyalar DIŞARIDA; `/api/kayseritip` eskisi gibi İÇERİDE. */
  matcher: ['/((?!_next/|api/|.*\\.[a-zA-Z0-9]{2,5}$).*)', '/api/kayseritip/:path*'],
};
