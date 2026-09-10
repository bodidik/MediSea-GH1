import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';
import { authConfig } from '@/auth.config';

/**
 * PAROLA DEĞİŞİNCE ESKİ OTURUM KAPANIR — ama yalnızca Node tarafında.
 *
 * Oturum `strategy: 'jwt'`; jeton kendi kendini doğruluyor, yani parola
 * değiştirmek onu kendiliğinden geçersiz KILMIYOR. Sıfırlama akışı bunu
 * kapatmasaydı, hesabı ele geçirilmiş bir kullanıcı parolasını değiştirse
 * bile saldırganın açık oturumu jetonun ömrü boyunca çalışmayı sürdürürdü —
 * yani sıfırlama kozmetik olurdu.
 *
 * Çare: `User.sifreDegistiAt` damgası jetonun `iat`ından SONRAYSA jeton
 * düşürülür.
 *
 * ⚠ KAPSAM SINIRI, BİLEREK: bu denetim `auth.config.ts`e KONULAMAZ, çünkü o
 * dosya middleware üzerinden Edge'de yükleniyor ve orada mongoose yok.
 * Yani denetim, `auth()` çağıran her yerde (sunucu bileşenleri, API uçları)
 * çalışır; middleware'in kendi "oturum var mı" kapısında çalışmaz.
 * Middleware yalnızca /admin ve /kayseritip'i koruyor ve ikisinin de ASIL
 * yetki denetimi API uçlarında (ölçüldü: `/api/admin/access` yetkisizde 403).
 *
 * MALİYET SINIRLI: her istekte veritabanına gidilmiyor. Jetona `sonKontrol`
 * damgası yazılıyor ve denetim en çok `KONTROL_ARALIGI_SN`de bir yapılıyor.
 * Bedeli, eski oturumun en fazla o kadar süre daha yaşaması.
 */
const KONTROL_ARALIGI_SN = 5 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const temel = await authConfig.callbacks.jwt(params);
      const token = temel as Record<string, unknown> | null;
      if (!token) return token as never;

      const simdi = Math.floor(Date.now() / 1000);
      const sonKontrol = typeof token.sonKontrol === 'number' ? token.sonKontrol : 0;

      /* Girişin kendisinde (user varsa) ve aralık dolduğunda denetlenir. */
      if (!params.user && simdi - sonKontrol < KONTROL_ARALIGI_SN) return token as never;

      const kimlik = typeof token.id === 'string' ? token.id : null;
      if (!kimlik) return token as never;

      try {
        await dbConnect();
        const k = await User.findById(kimlik).select('sifreDegistiAt').lean();
        const damga = k?.sifreDegistiAt ? new Date(k.sifreDegistiAt).getTime() / 1000 : 0;
        const iat = typeof token.iat === 'number' ? token.iat : simdi;
        if (damga && damga > iat) return null as never;
        token.sonKontrol = simdi;
      } catch {
        /* Veritabanına ulaşılamıyorsa oturum DÜŞÜRÜLMEZ: geçici bir kesinti
           bütün kullanıcıları atardı. Denetim bir sonraki turda yeniden
           denenir (sonKontrol güncellenmediği için). */
      }
      return token as never;
    },
  },

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
