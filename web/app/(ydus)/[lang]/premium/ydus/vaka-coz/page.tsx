import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import VakaEngine from './VakaEngine';
import { AccessGate } from '@/lib/AccessGate';

export const revalidate = 86400;

const isValidParam = (p: string) => /^[a-zA-Z0-9-]+$/.test(p);

const ZORLUK_STIL: Record<string, { bg: string; color: string }> = {
  kolay: { bg: '#f0fbf5', color: '#1a6640' },
  orta:  { bg: '#fffdf0', color: '#7a5800' },
  zor:   { bg: '#fff0f0', color: '#a01f1f' },
};

function vakaYukle(branch: string, id: string) {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'vakalar', branch, `${id}.json`
    );
    return JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8'));
  } catch {
    return null;
  }
}

function vakaListele(branch: string, topic: string) {
  try {
    const dir = path.join(process.cwd(), 'content', 'premium', 'ydus', 'vakalar', branch);
    const dosyalar = fs.readdirSync(dir).filter(f => f.startsWith(`${topic}-vaka-`) && f.endsWith('.json'));
    return dosyalar
      .sort()
      .map(dosya => {
        try {
          const veri = JSON.parse(fs.readFileSync(path.join(dir, dosya), 'utf-8'));
          return { ...veri, id: dosya.replace('.json', '') };
        } catch { return null; }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function VakaCozPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ branch?: string; id?: string; topic?: string }>;
}) {
  const { lang } = await props.params;
  const { branch, id, topic } = await props.searchParams;

  const S = {
    minHeight: '80vh', background: '#fff',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '2rem',
  };

  if (!branch || !isValidParam(branch)) {
    return (
      <div style={S}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#1a3a6b', fontSize: '18px' }}>branch parametresi eksik</h2>
      </div>
    );
  }

  // topic veya id'den topicId türet, access kontrolü yap
  const topicId = topic ?? id?.replace(/-vaka-\d+$/, '');
  if (topicId && isValidParam(topicId)) {
    const gate = await AccessGate({ topicId, lang, branch });
    if (gate) return gate;
  }

  /* ── VAKA SEÇİM EKRANI ── */
  if (!id && topic && isValidParam(topic)) {
    const vakalar = vakaListele(branch, topic);
    const backHref = `/${lang}/premium/ydus/${branch}/${topic}`;

    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem' }}>

          {/* Geri */}
          <Link href={backHref} style={{
            fontSize: '12px', fontWeight: 500, color: '#1a3a6b',
            border: '0.5px solid #b8cfe8', borderRadius: '8px', padding: '5px 12px',
            background: '#f5f9ff', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem',
          }}>
            ← Konuya dön
          </Link>

          {/* Başlık */}
          <div style={{
            background: '#f5f9ff', border: '0.5px solid #b8cfe8',
            borderLeft: '3px solid #5a2a9b', borderRadius: '0 10px 10px 0',
            padding: '1rem 1.25rem', marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#5a2a9b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>
              Klinik Vakalar
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a2a3a', margin: 0 }}>
              Bir vaka seçin
            </h1>
          </div>

          {/* Vaka kartları */}
          {vakalar.length === 0 ? (
            <p style={{ color: '#6a8aaa', fontSize: '13px', textAlign: 'center' }}>Bu konu için henüz vaka eklenmemiş.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {vakalar.map((v: any, i: number) => {
                const zorluk = ZORLUK_STIL[v.zorluk ?? ''] ?? { bg: '#f5f9ff', color: '#1a3a6b' };
                return (
                  <Link
                    key={v.id}
                    href={`/${lang}/premium/ydus/vaka-coz?branch=${branch}&id=${v.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      border: '0.5px solid #d0e4f5', borderRadius: '12px',
                      padding: '1rem 1.25rem', background: '#fff',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      transition: 'box-shadow .15s, border-color .15s',
                      cursor: 'pointer',
                    }}>
                      {/* Numara */}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#f0f4ff', border: '0.5px solid #b8cfe8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: 700, color: '#1a3a6b', flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>

                      {/* Bilgi */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2a3a', marginBottom: '5px', lineHeight: 1.35 }}>
                          {v.baslik}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {v.zorluk && (
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                              background: zorluk.bg, color: zorluk.color,
                              border: '0.5px solid currentColor', textTransform: 'uppercase', letterSpacing: '.05em',
                            }}>
                              {v.zorluk}
                            </span>
                          )}
                          {v.sure_dk && (
                            <span style={{
                              fontSize: '10px', fontWeight: 500, padding: '2px 7px', borderRadius: '4px',
                              background: '#f5f9ff', color: '#6a8aaa', border: '0.5px solid #d0e4f5',
                            }}>
                              ~{v.sure_dk} dk
                            </span>
                          )}
                          {v.adimlar?.length && (
                            <span style={{
                              fontSize: '10px', fontWeight: 500, padding: '2px 7px', borderRadius: '4px',
                              background: '#f5f0ff', color: '#5a2a9b', border: '0.5px solid #c8a8f0',
                            }}>
                              {v.adimlar.length} adım
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ok */}
                      <div style={{ fontSize: '18px', color: '#b8cfe8', flexShrink: 0 }}>→</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── DOĞRUDAN VAKA ── */
  if (!id || !isValidParam(id)) {
    return (
      <div style={S}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#1a3a6b', fontSize: '18px' }}>Parametre eksik</h2>
        <p style={{ color: '#6a8aaa', fontSize: '13px' }}>id veya topic zorunludur.</p>
      </div>
    );
  }

  const veri = vakaYukle(branch, id);

  if (!veri) {
    return (
      <div style={S}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ color: '#1a3a6b', fontSize: '18px', marginBottom: '.5rem' }}>Vaka bulunamadı</h2>
        <p style={{ color: '#6a8aaa', fontSize: '13px', marginBottom: '1.5rem' }}>
          <code style={{ background: '#f0f4f8', padding: '2px 6px', borderRadius: '4px' }}>
            {branch}/{id}.json
          </code>{' '}mevcut değil.
        </p>
        <Link href={`/${lang}/premium/ydus/${branch}`} style={{
          padding: '8px 18px', background: '#1a3a6b', color: '#fff',
          borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
        }}>
          ← Branşa dön
        </Link>
      </div>
    );
  }

  return <VakaEngine veri={veri} lang={lang} branch={branch} />;
}
