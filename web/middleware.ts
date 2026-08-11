import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

/* '@/auth' İTHAL EDİLMEZ: o dosya mongoose'u çeker, middleware Edge Runtime'da
   çalışır ve build "node:diagnostics_channel / eval" hatasıyla kırılır.
   JWT strategy sayesinde burada oturumu okumak için provider'a gerek yok. */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;
  const institution = user?.institution ?? null;

  /* KayseriTıp özel alanı — kurumsal kontrol middleware'de kalır */
  if (pathname.includes('/kayseritip')) {
    const isAdmin = user?.email === process.env.ADMIN_EMAIL;
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
