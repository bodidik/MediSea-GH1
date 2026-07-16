import { auth } from '@/auth';
import Link from 'next/link';

export default async function KayseriTipHome() {
  const session = await auth();
  const user = session?.user as any;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1rem' }}>
      <div style={{
        background: '#fff', border: '0.5px solid #c8c8f0',
        borderLeft: '4px solid #1a1a6b', borderRadius: '0 14px 14px 0',
        padding: '1.5rem 2rem', marginBottom: '2rem',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a6b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>
          Hoş geldin
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a2a4a', margin: '0 0 6px' }}>
          {user?.name ?? 'Öğrenci'}
        </h1>
        <p style={{ fontSize: '14px', color: '#4a5a7a', margin: 0 }}>
          Erciyes Üniversitesi Tıp Fakültesi — Özel Eğitim Alanı
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {[
          { href: '/kayseritip/staj/ic-hastaliklari-donem4', emoji: '🏥', baslik: 'İç Hastalıkları — Dönem 4', aciklama: '9 alan · Slayt ve ders notları' },
          { href: '/kayseritip/duyurular', emoji: '📢', baslik: 'Duyurular', aciklama: 'Güncel duyuru ve bildirimler' },
          { href: '/tr/premium/ydus', emoji: '🩺', baslik: 'YDUS Hazırlık', aciklama: 'Üye seviyesi YDUS içerikleri' },
        ].map(({ href, emoji, baslik, aciklama }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '14px',
              padding: '1.25rem 1.5rem', cursor: 'pointer',
              transition: 'box-shadow .15s',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{emoji}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a2a4a', marginBottom: '4px' }}>{baslik}</div>
              <div style={{ fontSize: '13px', color: '#6a7a9a' }}>{aciklama}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
