import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Ücret geçidi şimdilik kapalı — true yapınca M katmanı ücret ister
const PARA_AKTIF = false;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;
  const plan        = user?.plan        ?? 'free';
  const institution = user?.institution ?? null;

  /* ── KayseriTıp özel alanı ── */
  if (pathname.includes('/kayseritip')) {
    if (institution !== 'kayseritip') {
      return NextResponse.redirect(new URL('/giris?gerekli=kayseritip', req.url));
    }
    return NextResponse.next();
  }

  /* ── Premium (YDUS) alanı ── */
  if (pathname.includes('/premium/ydus')) {
    if (plan !== 'premium') {
      return NextResponse.redirect(new URL('/giris?gerekli=premium', req.url));
    }
    return NextResponse.next();
  }

  /* ── Üye (M) alanı ── */
  if (pathname.includes('/premium')) {
    const uyeMi = plan === 'member' || plan === 'premium' || institution === 'kayseritip';
    if (!uyeMi) {
      if (PARA_AKTIF) {
        return NextResponse.redirect(new URL('/uyelik', req.url));
      }
      // Para kapalı: giriş yaptıysa içeri al, yoksa giriş sayfasına
      if (!user) {
        return NextResponse.redirect(new URL('/giris', req.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/(:lang)/premium/:path*', '/kayseritip/:path*'],
};
