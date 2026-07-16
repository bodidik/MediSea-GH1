import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';

function stajBul(id: string) {
  try {
    const p = path.join(process.cwd(), 'content', 'kayseritip', 'stajlar.json');
    const liste = JSON.parse(fs.readFileSync(p, 'utf-8')).stajlar ?? [];
    return liste.find((s: any) => s.id === id) ?? null;
  } catch { return null; }
}

function alanDosyaSayisi(stajId: string, alanId: string): number {
  try {
    const p = path.join(process.cwd(), 'content', 'kayseritip', 'slaytlar.json');
    const dosyalar: any[] = JSON.parse(fs.readFileSync(p, 'utf-8')).dosyalar ?? [];
    return dosyalar.filter(d => d.stajId === stajId && d.alanId === alanId).length;
  } catch { return 0; }
}

export default async function StajPage({ params }: { params: Promise<{ stajId: string }> }) {
  const { stajId } = await params;
  const staj = stajBul(stajId);
  if (!staj) notFound();

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Başlık */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6a7a9a', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>
          {staj.donem}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a2a4a', margin: 0 }}>
          {staj.emoji} {staj.baslik}
        </h1>
      </div>

      {/* Alan kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {staj.alanlar.map((alan: any) => {
          const sayisi = alanDosyaSayisi(stajId, alan.id);
          return (
            <Link key={alan.id} href={`/kayseritip/staj/${stajId}/${alan.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '14px',
                padding: '1.25rem', cursor: 'pointer', height: '100%',
                display: 'flex', flexDirection: 'column', gap: '8px',
                transition: 'border-color .15s, box-shadow .15s',
              }}>
                <div style={{ fontSize: '30px' }}>{alan.emoji}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2a4a' }}>{alan.baslik}</div>
                <div style={{ fontSize: '12px', color: sayisi > 0 ? '#1a5c2e' : '#8a9aaa', marginTop: 'auto' }}>
                  {sayisi > 0 ? `${sayisi} dosya` : 'Henüz dosya yok'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
