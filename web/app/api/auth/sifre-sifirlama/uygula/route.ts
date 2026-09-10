import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';
import SifreSifirlamaJetonu from '@/lib/models/SifreSifirlamaJetonu';
import { jetonOzeti } from '@/lib/sifre-sifirlama';
import { SIFRE_KISA_MESAJ, SIFRE_MIN } from '@/app/lib/kimlik';

/**
 * YENİ PAROLAYI UYGULA.
 *
 * Sıra bilinçli: önce jeton doğrulanır, SONRA parola yazılır. Tersi olsaydı
 * geçersiz jetonlu bir istekte bile bcrypt maliyeti ödenir ve uç ucuz bir
 * CPU tüketme yüzeyine dönerdi.
 *
 * Süre denetimi TTL indeksine BIRAKILMIYOR: Mongo'nun TTL temizleyicisi
 * yaklaşık dakikada bir koşuyor, yani süresi dolmuş bir kayıt kısa süre
 * daha durabiliyor. `expiresAt` burada da karşılaştırılıyor.
 *
 * KULLANIMDAN SONRA kullanıcının BÜTÜN jetonları kapatılıyor. Yalnızca
 * kullanılanı işaretlemek yetmez: art arda üç istek yapılmışsa geri kalan
 * ikisi hâlâ geçerli kalırdı ve posta kutusuna erişen biri parolayı ikinci
 * kez değiştirebilirdi.
 */
export async function POST(req: NextRequest) {
  let jeton = '';
  let sifre = '';
  try {
    const g = await req.json();
    jeton = typeof g?.jeton === 'string' ? g.jeton : '';
    sifre = typeof g?.sifre === 'string' ? g.sifre : '';
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  if (!jeton) {
    return NextResponse.json({ error: 'Bağlantı geçersiz.' }, { status: 400 });
  }
  if (sifre.length < SIFRE_MIN) {
    return NextResponse.json({ error: SIFRE_KISA_MESAJ }, { status: 400 });
  }

  try {
    await dbConnect();

    const kayit = await SifreSifirlamaJetonu.findOne({ jetonOzeti: jetonOzeti(jeton) });

    /* TEK MESAJ: "yok", "kullanılmış" ve "süresi dolmuş" ayrı ayrı
       söylenmiyor. Ayrı söylemek, elinde jeton olan birine o jetonun
       durumunu bildirmek olurdu; kullanıcı için de yapılacak şey aynı. */
    const gecersiz = NextResponse.json(
      { error: 'Bağlantı geçersiz ya da süresi dolmuş. Yeni bir bağlantı iste.' },
      { status: 400 },
    );
    if (!kayit) return gecersiz;
    if (kayit.kullanildiAt) return gecersiz;
    if (kayit.expiresAt.getTime() <= Date.now()) return gecersiz;

    const kullanici = await User.findById(kayit.kullaniciId).select('_id');
    if (!kullanici) return gecersiz;

    const ozet = await bcrypt.hash(sifre, 12);
    await User.updateOne({ _id: kullanici._id }, { $set: { password: ozet } });

    kayit.kullanildiAt = new Date();
    await kayit.save();
    await SifreSifirlamaJetonu.updateMany(
      { kullaniciId: kullanici._id, kullanildiAt: null },
      { $set: { kullanildiAt: new Date() } },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
