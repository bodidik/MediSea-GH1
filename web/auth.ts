import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },

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
});
