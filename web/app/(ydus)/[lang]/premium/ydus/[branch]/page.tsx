import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export const revalidate = 86400;

interface Konu {
  id: string;
  baslik: string;
  rozetler: string[];
  hazir: boolean;
}

interface Kategori {
  id: string;
  baslik: string;
  aciklama: string;
  emoji: string;
  konular: Konu[];
}

interface BransVerisi {
  meta: {
    id: string;
    baslik: string;
    aciklama: string;
    renk: string;
    emoji: string;
  };
  kategoriler: Kategori[];
}

function bransYukle(branch: string): BransVerisi | null {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'branches', `${branch}.json`
    );
    const icerik = fs.readFileSync(dosyaYolu, 'utf-8');
    return JSON.parse(icerik) as BransVerisi;
  } catch {
    return null;
  }
}

const ROZET_STILLERI: Record<string, { arka: string; renk: string; kenar: string }> = {
  'POPÜLER':  { arka: '#e6f0fb', renk: '#1a3a6b', kenar: '#b8cfe8' },
  'ZOR':      { arka: '#fff0f0', renk: '#8b1a1a', kenar: '#f5b8b8' },
  'YENİ':     { arka: '#f0fbf5', renk: '#1a5c2e', kenar: '#a8e0b8' },
  'YAKINDA':  { arka: '#f5f5f5', renk: '#6a6a6a', kenar: '#d0d0d0' },
  'DEFAULT':  { arka: '#f5f9ff', renk: '#1a3a6b', kenar: '#b8cfe8' },
};

export default async function BransSayfasi({
  params,
}: {
  params: Promise<{ lang: string; branch: string }>;
}) {
  const { lang, branch } = await params;
  const veri = bransYukle(branch);

  if (!veri) {
    return (
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
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🧭</div>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.5rem' }}>
          Branş bulunamadı
        </h1>
        <p style={{ color: '#6a8aaa', marginBottom: '1.5rem', fontSize: '14px' }}>
          <strong>{branch}</strong> için henüz içerik hazırlanmadı.
        </p>
        <Link href={`/${lang}/premium/ydus`} style={{
          padding: '8px 20px',
          background: '#1a3a6b',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 500,
        }}>
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  const toplamKonu = veri.kategoriler.reduce((acc, kat) => acc + kat.konular.length, 0);
  const hazirKonu = veri.kategoriler.reduce(
    (acc, kat) => acc + kat.konular.filter(k => k.hazir).length, 0
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* BREADCRUMB */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          marginBottom: '1.5rem',
          color: '#6a8aaa',
        }}>
          <Link href={`/${lang}/premium/ydus`} style={{ color: '#1a3a6b', textDecoration: 'none', fontWeight: 500 }}>
            Ana sayfa
          </Link>
          <span>/</span>
          <span style={{ color: veri.meta.renk, fontWeight: 500 }}>{veri.meta.baslik}</span>
        </nav>

        {/* HERO */}
        <div style={{
          border: '0.5px solid #b8cfe8',
          borderLeft: `4px solid ${veri.meta.renk}`,
          borderRadius: '0 12px 12px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          background: '#f5f9ff',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#fff',
            border: `0.5px solid #b8cfe8`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            flexShrink: 0,
          }}>
            {veri.meta.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.25rem' }}>
              {veri.meta.baslik}
            </h1>
            <p style={{ fontSize: '13px', color: '#4a6a8a', lineHeight: 1.5, margin: 0 }}>
              {veri.meta.aciklama}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: veri.meta.renk }}>{hazirKonu}</div>
            <div style={{ fontSize: '11px', color: '#6a8aaa' }}>{toplamKonu} konudan</div>
          </div>
        </div>

        {/* KATEGORİLER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {veri.kategoriler.map((kat) => (
            <div key={kat.id} style={{
              border: '0.5px solid #d0e4f5',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#fafcff',
            }}>
              {/* Kategori başlığı */}
              <div style={{
                padding: '0.9rem 1.25rem',
                borderBottom: '0.5px solid #d0e4f5',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f0f7ff',
              }}>
                <span style={{ fontSize: '18px' }}>{kat.emoji}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a3a6b' }}>{kat.baslik}</div>
                  <div style={{ fontSize: '11px', color: '#6a8aaa' }}>{kat.aciklama}</div>
                </div>
              </div>

              {/* Konular */}
              <div style={{ padding: '0.5rem' }}>
                {kat.konular.map((konu) => (
                  <Link
                    key={konu.id}
                    href={konu.hazir ? `/${lang}/premium/ydus/${branch}/${konu.id}` : '#'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      background: konu.hazir ? '#fff' : 'transparent',
                      border: konu.hazir ? '0.5px solid #d0e4f5' : '0.5px solid transparent',
                      textDecoration: 'none',
                      opacity: konu.hazir ? 1 : 0.5,
                      cursor: konu.hazir ? 'pointer' : 'default',
                      pointerEvents: konu.hazir ? 'auto' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: konu.hazir ? veri.meta.renk : '#c0c0c0',
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: '13px',
                        fontWeight: konu.hazir ? 500 : 400,
                        color: konu.hazir ? '#1a2a3a' : '#8a9aaa',
                      }}>
                        {konu.baslik}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {konu.rozetler.map((rozet, i) => {
                        const stil = ROZET_STILLERI[rozet] ?? ROZET_STILLERI['DEFAULT'];
                        return (
                          <span key={i} style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: stil.arka,
                            color: stil.renk,
                            border: `0.5px solid ${stil.kenar}`,
                          }}>
                            {rozet}
                          </span>
                        );
                      })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ALT NAVİGASYON */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '0.5px solid #d0e4f5' }}>
          <Link href={`/${lang}/premium/ydus`} style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#1a3a6b',
            border: '0.5px solid #b8cfe8',
            borderRadius: '8px',
            padding: '7px 14px',
            background: '#f5f9ff',
            textDecoration: 'none',
          }}>
            ← Ana sayfa
          </Link>
        </div>

      </div>
    </div>
  );
}
