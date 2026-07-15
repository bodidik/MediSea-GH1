import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import KategorilerClient from './KategorilerClient';

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
        <KategorilerClient
          kategoriler={veri.kategoriler}
          bransRenk={veri.meta.renk}
          lang={lang}
          branch={branch}
        />

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
