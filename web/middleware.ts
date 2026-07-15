import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;
  const institution = user?.institution ?? null;

  /* KayseriTıp özel alanı — kurumsal kontrol middleware'de kalır */
  if (pathname.includes('/kayseritip')) {
    if (institution !== 'kayseritip') {
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
  matcher: ['/kayseritip/:path*', '/admin/:path*'],
};
