import NextAuth from 'next-auth';
import { yoneticiEpostasiMi } from '@/lib/yonetici-eposta';
import { NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';

/* Edge runtime: mongoose/bcrypt taşıyan @/auth yerine edge-güvenli yapılandırma */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
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

export const config = {
  matcher: ['/kayseritip/:path*', '/admin/:path*', '/api/kayseritip/:path*'],
};
