import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
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
    /* Google yalnız DOĞRULANMIŞ e-postayla kabul edilir: hesap e-postaya göre
       eşleniyor, doğrulanmamış adres başkasının hesabına girmek demek olurdu. */
    async signIn({ account, profile }) {
      if (account?.provider === 'google') return profile?.email_verified === true;
      return true;
    },
    async jwt(params) {
      const temel = await authConfig.callbacks.jwt(params);
      const token = temel as Record<string, unknown> | null;
      if (!token) return token as never;

      /* GOOGLE GİRİŞİ → MONGO KULLANICISI. Adaptör yok; jetondaki `id` Google'ın
         kimliği olarak geliyor ve bütün uygulama (senkron, ilerleme, parola
         damgası) Mongo `_id`sine bakıyor. E-postayla eşlenir: kayıtlı hesap
         varsa ona bağlanır (aynı kişi, Google e-postayı doğruladı), yoksa
         parolasız hesap açılır. Veritabanı yoksa giriş DÜŞER — Mongo kimliği
         olmayan oturum uygulamanın geri kalanında sessizce kırılırdı.

         İLK SÜRÜM SESSİZCE DÜŞÜYORDU (canlıda, 1 Eki): hata yakalanıp `null`
         dönülüyordu → Auth.js oturumu açmadan geri adrese yolluyor, kullanıcı
         ana sayfaya "girişsiz" düşüyor, günlükte TEK satır yok. Kayıtlı
         hesapta `save()` kaydın TAMAMINI yeniden doğruluyordu (eski kayıttaki
         bir alan kurala uymazsa düşer). Şimdi: tek atomik upsert (yalnız
         değişen alan yazılır), hata günlüğe yazılıp FIRLATILIR → `pages.error`
         ile `/giris?error=…` Türkçe uyarı gösterir. */
      if (params.user && params.account?.provider === 'google') {
        const eposta = params.user.email?.toLowerCase();
        if (!eposta) throw new Error('Google profili e-posta taşımıyor');
        try {
          await dbConnect();
          const k = await User.findOneAndUpdate(
            { email: eposta },
            {
              $set: { googleId: params.account.providerAccountId },
              $setOnInsert: {
                name: params.user.name || eposta.split('@')[0],
                email: eposta,
                plan: 'free',
                institution: null,
                password: null,
              },
            },
            { upsert: true, returnDocument: 'after' }
          ).lean();
          if (!k) throw new Error('kullanıcı kaydı dönmedi');
          token.id = k._id.toString();
          token.plan = k.plan;
          token.institution = k.institution ?? null;
          token.sonKontrol = Math.floor(Date.now() / 1000);
          return token as never;
        } catch (e) {
          const h = e as { name?: string; message?: string; code?: unknown };
          console.error('[google-giris] hesap eşlenemedi:', h?.name, h?.code ?? '', h?.message);
          throw e;
        }
      }

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
    /* Anahtarlar (AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET) yoksa sağlayıcı HİÇ
       eklenmez; giriş sayfası düğmeyi `/api/auth/providers`a bakarak çizer,
       yani yarım kurulumda tıklanınca hata veren bir düğme görünmez. */
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : []),
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
        /* Google'la açılmış hesabın parolası yok; parola sıfırlamayla edinir. */
        if (!user || !user.password) return null;

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
