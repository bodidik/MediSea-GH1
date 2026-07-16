import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function KayseriTipLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as any;
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  if (user?.institution !== 'kayseritip' && !isAdmin) {
    redirect('/giris?gerekli=kayseritip');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Üst bar */}
      <header style={{
        background: '#1a1a6b', color: '#fff',
        padding: '0 1.5rem', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🎓</span>
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '.02em' }}>KayseriTıp</span>
          <span style={{
            fontSize: '10px', fontWeight: 600, padding: '2px 8px',
            background: 'rgba(255,255,255,0.15)', borderRadius: '4px', letterSpacing: '.08em',
          }}>
            ÖZEL ALAN
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '4px' }}>
          {[
            { href: '/kayseritip', label: 'Ana Sayfa' },
            { href: '/kayseritip/staj/ic-hastaliklari-donem4', label: 'İç Hastalıkları D4' },
            { href: '/kayseritip/duyurular', label: 'Duyurular' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
              fontSize: '13px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px',
            }}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
