import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';
import SifreSifirlamaJetonu from '@/lib/models/SifreSifirlamaJetonu';
import { epostaGonder, epostaYapilandirildiMi } from '@/lib/eposta';
import { HIZ_PENCERESI_DK, HIZ_SINIRI, JETON_OMRU_DK, jetonOzeti, jetonUret } from '@/lib/sifre-sifirlama';
import { siteUrl } from '@/lib/site';

/**
 * SIFIRLAMA BAĞLANTISI İSTEĞİ.
 *
 * HESAP SAYIMINA KAPALI: e-posta kayıtlı olsun olmasın YANIT AYNI. Farklı
 * yanıt vermek, siteyi "bu adres üye mi?" sorusunu yanıtlayan bir servise
 * çevirirdi — tıbbi bir platformda üyelik bilgisi tek başına hassas.
 * Aynı sebeple 404/409 gibi durum kodları da kullanılmıyor.
 *
 * ZAMANLAMA farkı bilerek önemsenmiyor: bcrypt burada çalışmıyor, iki dal da
 * yalnızca bir Mongo sorgusu; ölçülebilir bir fark üretmiyor.
 */
export async function POST(req: NextRequest) {
  /* Taşıyıcı yoksa üretimde akış HİÇ KURULMAZ. Bunu istekte de kontrol
     ediyoruz: sayfa gizlense bile uç açık kalırsa "gönderdik" demiş oluruz. */
  if (!epostaYapilandirildiMi() && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Parola sıfırlama şu an kullanılamıyor. Lütfen destek ile iletişime geçin.' },
      { status: 503 },
    );
  }

  let email = '';
  try {
    const govde = await req.json();
    email = typeof govde?.email === 'string' ? govde.email.trim().toLowerCase() : '';
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }

  /* AYNI YANIT — aşağıdaki her dal bunu döndürür. */
  const ayniYanit = NextResponse.json({
    ok: true,
    mesaj: 'Bu adres kayıtlıysa sıfırlama bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.',
  });

  try {
    await dbConnect();
    const kullanici = await User.findOne({ email }).select('_id email name').lean();
    if (!kullanici) return ayniYanit;

    /* Hız sınırı: son pencerede üretilmiş jetonları say. */
    const pencereBasi = new Date(Date.now() - HIZ_PENCERESI_DK * 60_000);
    const sonIstekler = await SifreSifirlamaJetonu.countDocuments({
      kullaniciId: kullanici._id,
      createdAt: { $gte: pencereBasi },
    });
    if (sonIstekler >= HIZ_SINIRI) return ayniYanit;

    const ham = jetonUret();
    await SifreSifirlamaJetonu.create({
      kullaniciId: kullanici._id,
      jetonOzeti: jetonOzeti(ham),
      expiresAt: new Date(Date.now() + JETON_OMRU_DK * 60_000),
    });

    const bag = `${siteUrl()}/sifre-sifirla?jeton=${encodeURIComponent(ham)}`;
    const duzMetin =
      `Merhaba,\n\nMediSea hesabının parolasını sıfırlamak için aşağıdaki bağlantıyı aç:\n\n${bag}\n\n` +
      `Bağlantı ${JETON_OMRU_DK} dakika geçerli ve yalnızca bir kez kullanılabilir.\n` +
      `Bu isteği sen yapmadıysan hiçbir şey yapmana gerek yok; parolan değişmez.\n`;

    await epostaGonder({
      alici: kullanici.email,
      konu: 'MediSea — parola sıfırlama',
      duzMetin,
      html:
        `<p>Merhaba,</p><p>MediSea hesabının parolasını sıfırlamak için aşağıdaki bağlantıyı aç:</p>` +
        `<p><a href="${bag}">Parolamı sıfırla</a></p>` +
        `<p>Bağlantı ${JETON_OMRU_DK} dakika geçerli ve yalnızca bir kez kullanılabilir.</p>` +
        `<p>Bu isteği sen yapmadıysan hiçbir şey yapmana gerek yok; parolan değişmez.</p>`,
    });

    /* Gönderim hatası kullanıcıya AYRI bir yanıt olarak yansıtılmıyor:
       yansısaydı "bu adres kayıtlı" bilgisi sızardı. Hata sunucu tarafında
       görünür (Resend panosu / platform günlüğü). */
    return ayniYanit;
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
