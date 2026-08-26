'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Var olmayan premium KONU adresi.
 *
 * Ölçüldü: bu segmentin kendi sınırı YOKTU ve istek kardeşine
 * (`[branch]/not-found.tsx`) düşüyordu. Sonuç YANLIŞ SEBEP bildiriyordu —
 * `/tr/premium/ydus/hematoloji/olmayan-konu` adresinde branş VAR, eksik olan
 * konu; ekran ise "Branş bulunamadı · Aradığın branş için henüz içerik
 * hazırlanmadı" diyordu.
 *
 * Deponun kuralı: yanlış sebep, sebepsizlikten kötü olabilir — kullanıcıyı
 * işe yaramayan bir çareye yönlendiriyor (burada: branşı sorgulamaya).
 *
 * ÇIKIŞ YOLU da yanlış hedefteydi: tek bağlantı panoya gidiyordu, oysa eksik
 * olan KONU ve en yararlı yer o konunun BRANŞI — mevcut konuları listeleyen
 * sayfa orası.
 *
 * `not-found.tsx` params ALAMIYOR (kardeş dosyanın yorumu da bunu söylüyor),
 * o yüzden branş ve dil YOLDAN okunuyor. Yol beklenmedik biçimdeyse panoya
 * düşülüyor; uydurma bir branş adresi üretmektense bir basamak yukarı
 * göndermek doğru.
 */
export default function KonuBulunamadi() {
  const yol = usePathname() || '';
  const parca = yol.split('/').filter(Boolean); // ['tr','premium','ydus','<branş>','<konu>']
  const dil = parca[0] || 'tr';
  const brans = parca.length >= 4 && parca[1] === 'premium' ? parca[3] : null;
  const panoYolu = `/${dil}/premium/ydus`;

  const dugme = (birincil: boolean) => ({
    display: 'inline-block',
    padding: '10px 20px',
    background: birincil ? '#1a3a6b' : '#fff',
    color: birincil ? '#fff' : '#1a3a6b',
    border: birincil ? 'none' : '1px solid #b8cfe8',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  });

  return (
    /**
     * <div>, <main> DEĞİL: `(ydus)` düzeni zaten `<main>` basıyor.
     * Ölçüldü — burada <main> kullanıldığında sayfada main sayısı 2 oldu,
     * yani belgede kayıtlı "çift main landmark" kusuru. Kardeş dosya
     * (`[branch]/not-found.tsx`) de aynı sebeple <div> kullanıyor.
     */
    <div style={{
      minHeight: '80vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '1rem' }} aria-hidden="true">📄</div>
      <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.5rem' }}>
        Konu bulunamadı
      </h1>
      <p style={{ color: '#4a6a8a', marginBottom: '1.5rem', fontSize: '14px', textAlign: 'center', maxWidth: '30rem', lineHeight: 1.6 }}>
        Bu adreste bir konu yok. Adres değişmiş ya da konu henüz hazırlanmamış
        olabilir; branş sayfasında hazır olanların tamamı listeleniyor.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {brans && (
          <Link href={`/${dil}/premium/ydus/${brans}`} style={dugme(true)}>
            Branş sayfasına dön
          </Link>
        )}
        <Link href={panoYolu} style={dugme(!brans)}>
          YDUS ana sayfası
        </Link>
      </div>
    </div>
  );
}
