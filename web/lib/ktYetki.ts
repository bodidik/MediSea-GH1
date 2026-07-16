import { auth } from '@/auth';
import { dbConnect } from '@/lib/db';
import KtYetki, { KtRol } from '@/lib/models/KtYetki';

export interface KtKullanici {
  email:   string;
  rol:     KtRol;
  alanlar: string[];
}

/** Oturumdaki kullanıcının KT yetkisini döndürür. Kayıt yoksa ogrenci döner. */
export async function ktKullaniciAl(): Promise<KtKullanici | null> {
  const session = await auth();
  const user    = session?.user as any;

  if (!user?.email) return null;

  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  if (isAdmin) {
    return { email: user.email, rol: 'kt_admin', alanlar: [] };
  }

  if (user.institution !== 'kayseritip') return null;

  await dbConnect();
  const yetki = await KtYetki.findOne({ email: user.email.toLowerCase() }).lean();

  return {
    email:   user.email,
    rol:     (yetki?.rol as KtRol) ?? 'ogrenci',
    alanlar: yetki?.alanlar ?? [],
  };
}

/** Kullanıcı belirtilen alan için yükleme yapabilir mi? */
export function yuklemeyeYetkili(kt: KtKullanici, stajId: string, alanId: string): boolean {
  if (kt.rol === 'kt_admin') return true;
  if (kt.rol === 'ogretim_gorevlisi') {
    return kt.alanlar.includes(`${stajId}/${alanId}`);
  }
  return false;
}
