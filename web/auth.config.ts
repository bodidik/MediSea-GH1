import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-güvenli NextAuth yapılandırması.
 *
 * middleware.ts Edge Runtime'da çalışır; oraya mongoose sızarsa build kırılır
 * ("node:diagnostics_channel is not handled" + sift içinde eval yasağı).
 * Bu yüzden veritabanına dokunan tek parça — Credentials provider'ı — burada
 * DEĞİL, auth.ts içinde durur. Buradaki her şey saf JWT mantığıdır.
 *
 * callbacks burada yaşamalı: middleware `req.auth.user.institution` okuyor,
 * o alanları token'a/oturuma yazan da bu iki callback.
 */
export const authConfig = {
  session: { strategy: 'jwt' },

  // Provider'lar auth.ts'de eklenir (mongoose oraya ait).
  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id          = (user as any).id;
        token.plan        = (user as any).plan;
        token.institution = (user as any).institution;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id          = token.id;
        (session.user as any).plan        = token.plan;
        (session.user as any).institution = token.institution;
      }
      return session;
    },
  },

  pages: {
    signIn: '/giris',
  },
} satisfies NextAuthConfig;
