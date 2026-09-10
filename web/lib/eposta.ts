/**
 * E-POSTA GÖNDERİMİ — Resend, ek paket olmadan.
 *
 * Resend'in HTTPS API'si düz bir POST; `fetch` yetiyor. SDK BİLEREK
 * eklenmedi: bu depoda `npm ci` çalışan geliştirme ortamını bozduğu için
 * bağımlılık eklemenin bedeli var ve tek bir uç için SDK o bedele değmiyor.
 *
 * YAPILANDIRILMAMIŞSA "SESSİZCE BAŞARILI" DÖNMEZ. Bu, deponun kayıtlı
 * "sessiz boşluk" kusuru olurdu: kullanıcıya "bağlantı gönderildi" denip
 * hiçbir şey gönderilmemesi. Bunun yerine:
 *
 *   · üretimde  -> `yapilandirildi: false` döner, çağıran akışı KURMAZ
 *   · geliştirmede -> bağlantı sunucu günlüğüne basılır ve `gunlugeYazildi`
 *     işaretiyle döner; akış uçtan uca sınanabilir, kimseye yalan söylenmez
 */
const ANAHTAR = () => process.env.RESEND_API_KEY?.trim() || '';
const GONDEREN = () => process.env.EPOSTA_GONDEREN?.trim() || '';

export function epostaYapilandirildiMi(): boolean {
  return Boolean(ANAHTAR() && GONDEREN());
}

export type GonderimSonucu =
  | { durum: 'gonderildi' }
  | { durum: 'gunluge-yazildi' }
  | { durum: 'yapilandirilmadi' }
  | { durum: 'hata'; mesaj: string };

export async function epostaGonder(opts: {
  alici: string;
  konu: string;
  html: string;
  duzMetin: string;
}): Promise<GonderimSonucu> {
  if (!epostaYapilandirildiMi()) {
    if (process.env.NODE_ENV !== 'production') {
      /* Geliştirmede akışın sınanabilmesi için içerik günlüğe basılır.
         ÜRETİMDE ASLA — sır günlüğe düşmemeli. */
      console.info('[eposta] taşıyıcı yok, geliştirme günlüğü:\n', opts.duzMetin);
      return { durum: 'gunluge-yazildi' };
    }
    return { durum: 'yapilandirilmadi' };
  }

  try {
    const yanit = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ANAHTAR()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: GONDEREN(),
        to: [opts.alici],
        subject: opts.konu,
        html: opts.html,
        text: opts.duzMetin,
      }),
    });
    if (!yanit.ok) {
      /* Gövde günlüğe YAZILMIYOR: sağlayıcı yanıtı istek gövdesini
         yankılayabiliyor ve orada sıfırlama bağlantısı var. */
      return { durum: 'hata', mesaj: `Resend ${yanit.status}` };
    }
    return { durum: 'gonderildi' };
  } catch (e) {
    return { durum: 'hata', mesaj: e instanceof Error ? e.message : 'ağ hatası' };
  }
}
