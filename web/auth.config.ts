import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-güvenli NextAuth yapılandırması.
 * Burada mongoose/bcrypt gibi Node'a özgü bağımlılık BULUNMAMALIDIR —
 * bu dosya middleware üzerinden Edge runtime'da yüklenir.
 * Credentials sağlayıcısı ve veritabanı erişimi auth.ts içinde kalır.
 */
export const authConfig = {
  session: { strategy: 'jwt' },

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
