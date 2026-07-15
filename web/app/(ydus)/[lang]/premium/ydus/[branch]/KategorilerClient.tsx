'use client';

import { useState } from 'react';
import Link from 'next/link';

const ROZET_STILLERI: Record<string, { arka: string; renk: string; kenar: string }> = {
  'POPÜLER':     { arka: '#e6f0fb', renk: '#1a3a6b', kenar: '#b8cfe8' },
  'ZOR':         { arka: '#fff0f0', renk: '#8b1a1a', kenar: '#f5b8b8' },
  'YENİ':        { arka: '#f0fbf5', renk: '#1a5c2e', kenar: '#a8e0b8' },
  'YAKINDA':     { arka: '#f5f5f5', renk: '#6a6a6a', kenar: '#d0d0d0' },
  'SINAV SPOTU': { arka: '#fff8e6', renk: '#7a4a00', kenar: '#f0d080' },
  'DEFAULT':     { arka: '#f5f9ff', renk: '#1a3a6b', kenar: '#b8cfe8' },
};

interface Konu {
  id: string;
  baslik: string;
  rozetler?: string[];
  hazir: boolean;
}

interface Kategori {
  id: string;
  baslik: string;
  aciklama?: string;
  emoji?: string;
  ikon?: string;
  konular: Konu[];
}

interface Props {
  kategoriler: Kategori[];
  bransRenk: string;
  lang: string;
  branch: string;
}

export default function KategorilerClient({ kategoriler, bransRenk, lang, branch }: Props) {
  const [acik, setAcik] = useState<Record<string, boolean>>(() => {
    const ilk: Record<string, boolean> = {};
    kategoriler.forEach((k, i) => { ilk[k.id] = i === 0; });
    return ilk;
  });

  const toggle = (id: string) => setAcik(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {kategoriler.map((kat) => {
        const hazirSayisi = kat.konular.filter(k => k.hazir).length;
        const acikMi = acik[kat.id];

        return (
          <div key={kat.id} style={{
            border: '0.5px solid #d0e4f5',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#fafcff',
          }}>
            {/* Kategori başlığı — tıklanabilir */}
            <button
              onClick={() => toggle(kat.id)}
              style={{
                width: '100%',
                padding: '0.9rem 1.25rem',
                borderBottom: acikMi ? '0.5px solid #d0e4f5' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: acikMi ? '#f0f7ff' : '#f8fbff',
                cursor: 'pointer',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: acikMi ? '0.5px solid #d0e4f5' : 'none',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '18px' }}>{kat.emoji ?? kat.ikon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a3a6b' }}>{kat.baslik}</div>
                {kat.aciklama && (
                  <div style={{ fontSize: '11px', color: '#6a8aaa' }}>{kat.aciklama}</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#6a8aaa' }}>
                  {hazirSayisi}/{kat.konular.length} konu
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#6a8aaa',
                  transform: acikMi ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                }}>
                  ▾
                </span>
              </div>
            </button>

            {/* Konular — accordion */}
            {acikMi && (
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
                      opacity: konu.hazir ? 1 : 0.45,
                      cursor: konu.hazir ? 'pointer' : 'default',
                      pointerEvents: konu.hazir ? 'auto' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: konu.hazir ? bransRenk : '#c0c0c0',
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
                      {(konu.rozetler ?? []).map((rozet, i) => {
                        const stil = ROZET_STILLERI[rozet] ?? ROZET_STILLERI['DEFAULT'];
                        return (
                          <span key={i} style={{
                            fontSize: '10px', fontWeight: 600,
                            padding: '2px 7px', borderRadius: '4px',
                            background: stil.arka, color: stil.renk,
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
            )}
          </div>
        );
      })}
    </div>
  );
}
