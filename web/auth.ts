import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';
import { authConfig } from '@/auth.config';

/**
 * Tam yapılandırma: Node runtime'a ait (route handler'lar, server component'ler).
 * Ortak/Edge-güvenli kısım auth.config.ts'de; buraya yalnızca veritabanına
 * ihtiyaç duyan Credentials provider'ı eklenir. middleware.ts bu dosyayı
 * İTHAL ETMEMELİ — mongoose'u Edge bundle'ına sokar ve build kırılır.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre',  type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password as string, user.password);
        if (!ok) return null;

        return {
          id:          user._id.toString(),
          name:        user.name,
          email:       user.email,
          plan:        user.plan,
          institution: user.institution ?? null,
        };
      },
    }),
  ],
});
