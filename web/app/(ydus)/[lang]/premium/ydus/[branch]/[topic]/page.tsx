import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import SoruSor from './SoruSor';

export const revalidate = 86400;

// --- BRANCH RENK SİSTEMİ ---
const BRANCH_META: Record<string, { label: string; renk: string }> = {
  hematoloji:           { label: 'Hematoloji',          renk: '#a01f1f' },
  endokrinoloji:        { label: 'Endokrinoloji',        renk: '#8a4800' },
  romatoloji:           { label: 'Romatoloji',           renk: '#1a5c2e' },
  'gogus-hastaliklari': { label: 'Göğüs Hastalıkları',  renk: '#0d6b8a' },
  gastroenteroloji: { label: 'Gastroenteroloji',   renk: '#4a1a7a' },
  nefroloji:        { label: 'Nefroloji',          renk: '#1a3a6b' },
  onkoloji:         { label: 'Onkoloji',           renk: '#5a1a6b' },
  kardiyoloji:      { label: 'Kardiyoloji',        renk: '#1a4a6b' },
  enfeksiyon:       { label: 'Enfeksiyon',         renk: '#1a5a3a' },
};

const DEFAULT_RENK = '#1a3a6b';

// --- TİP TANIMLAMALARI ---
type MetinSatir = { yil?: string; metin: string };
type TabloSatir = { renk?: 'kirmizi' | 'yesil' | 'sari' | 'mavi'; hucreler: string[] };

type IcerikBlok =
  | { tip: 'metin'; baslik?: string; satirlar: MetinSatir[] }
  | { tip: 'tablo'; baslik?: string; kolonlar: string[]; satirlar: TabloSatir[] }
  | { tip: 'bilgi_kutusu'; tur: 'ek_bilgi' | 'uyari' | 'pratik'; metin: string };

interface KonuVerisi {
  meta: {
    id: string;
    branch: string;
    baslik: string;
    altbaslik?: string;
    rozetler?: string[];
    guncelleme?: string;
  };
  moduller?: {
    flashcard?: boolean;
    inciler?: boolean;
    quiz?: boolean;
    vaka?: boolean;
    video?: boolean;
  };
  istatistikler?: {
    soru?: number;
    flashcard?: number;
    inci?: number;
  };
  icerik: IcerikBlok[];
}

function konuYukle(branch: string, topic: string): KonuVerisi | null {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'topics', branch, `${topic}.json`
    );
    const icerik = fs.readFileSync(dosyaYolu, 'utf-8');
    return JSON.parse(icerik) as KonuVerisi;
  } catch {
    return null;
  }
}

// --- RENK YARDIMCILARI ---
const KUTU_STILLLERI = {
  ek_bilgi: {
    arka: '#f0f7ff',
    kenar: '#90b8e0',
    solKenar: '#1a3a6b',
    etiketRenk: '#1a3a6b',
    etiket: 'Ek bilgi',
  },
  uyari: {
    arka: '#fffdf0',
    kenar: '#e8d070',
    solKenar: '#c8960a',
    etiketRenk: '#7a5800',
    etiket: 'Uyarı',
  },
  pratik: {
    arka: '#f0fbf5',
    kenar: '#80c898',
    solKenar: '#1a6640',
    etiketRenk: '#1a6640',
    etiket: 'Pratik not',
  },
};

const TABLO_SATIR_RENKLERI: Record<string, { arka: string; metin: string }> = {
  kirmizi: { arka: '#fff5f5', metin: '#8b1a1a' },
  yesil:   { arka: '#f5fff8', metin: '#1a5c2e' },
  sari:    { arka: '#fffef0', metin: '#7a5800' },
  mavi:    { arka: '#f0f7ff', metin: '#1a3a6b' },
};

// --- BLOK BİLEŞENLERİ ---
function MetinBlok({ blok }: { blok: Extract<IcerikBlok, { tip: 'metin' }> }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {blok.baslik && (
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1a3a6b',
          marginBottom: '0.6rem',
          paddingBottom: '0.3rem',
          borderBottom: '0.5px solid #d0e4f5',
        }}>
          {blok.baslik}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {blok.satirlar.map((satir, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {satir.yil && (
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                background: '#fff6f0',
                color: '#a03000',
                border: '0.5px solid #e8b090',
                borderRadius: '4px',
                padding: '2px 6px',
                whiteSpace: 'nowrap',
                marginTop: '2px',
                flexShrink: 0,
              }}>
                {satir.yil}
              </span>
            )}
            <p style={{ fontSize: '13px', lineHeight: 1.7, margin: 0, color: '#1a2a3a' }}>
              {satir.metin}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabloBlok({ blok }: { blok: Extract<IcerikBlok, { tip: 'tablo' }> }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {blok.baslik && (
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1a3a6b',
          marginBottom: '0.6rem',
          paddingBottom: '0.3rem',
          borderBottom: '0.5px solid #d0e4f5',
        }}>
          {blok.baslik}
        </h3>
      )}
      <div style={{
        border: '0.5px solid #b8cfe8',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f0f7ff' }}>
              {blok.kolonlar.map((kolon, i) => (
                <th key={i} style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#1a3a6b',
                  fontSize: '11px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                  borderBottom: '0.5px solid #b8cfe8',
                }}>
                  {kolon}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blok.satirlar.map((satir, i) => {
              const renkStil = satir.renk ? TABLO_SATIR_RENKLERI[satir.renk] : null;
              return (
                <tr key={i} style={{
                  background: renkStil ? renkStil.arka : (i % 2 === 0 ? '#fff' : '#fafcff'),
                  borderBottom: '0.5px solid #e8f0f8',
                }}>
                  {satir.hucreler.map((hucre, j) => (
                    <td key={j} style={{
                      padding: '8px 12px',
                      verticalAlign: 'top',
                      color: (j === 0 && renkStil) ? renkStil.metin : '#1a2a3a',
                      fontWeight: j === 0 ? 500 : 400,
                      lineHeight: 1.5,
                    }}>
                      {hucre}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BilgiKutusu({ blok }: { blok: Extract<IcerikBlok, { tip: 'bilgi_kutusu' }> }) {
  const stil = KUTU_STILLLERI[blok.tur];
  return (
    <div style={{
      background: stil.arka,
      border: `0.5px solid ${stil.kenar}`,
      borderLeft: `3px solid ${stil.solKenar}`,
      borderRadius: '0 8px 8px 0',
      padding: '0.8rem 1rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: stil.etiketRenk,
        marginBottom: '4px',
      }}>
        {stil.etiket}
      </div>
      <p style={{ fontSize: '13px', lineHeight: 1.6, margin: 0, color: '#1a2a3a' }}>
        {blok.metin}
      </p>
    </div>
  );
}

function IcerikRenderer({ bloklar }: { bloklar: IcerikBlok[] }) {
  return (
    <>
      {bloklar.map((blok, i) => {
        if (blok.tip === 'metin')      return <MetinBlok key={i} blok={blok} />;
        if (blok.tip === 'tablo')      return <TabloBlok key={i} blok={blok} />;
        if (blok.tip === 'bilgi_kutusu') return <BilgiKutusu key={i} blok={blok} />;
        return null;
      })}
    </>
  );
}

// --- MODÜL KARTI ---
const MODUL_BILGI = {
  flashcard: { etiket: 'Hızlı tekrar', emoji: '🃏', renk: '#e6f0fb' },
  inciler:   { etiket: 'Klinik inciler', emoji: '💎', renk: '#fffbe6' },
  quiz:      { etiket: 'Soru çöz', emoji: '📝', renk: '#fff0f0' },
  vaka:      { etiket: 'Vaka', emoji: '🏥', renk: '#f0fbf5' },
  video:     { etiket: 'Video', emoji: '🎬', renk: '#f5f0ff' },
};

const MODUL_HREF: Record<string, (lang: string, branch: string, topic: string) => string> = {
  flashcard: (l, b, t) => `/${l}/premium/ydus/hizli-tekrar?branch=${b}&id=${t}`,
  inciler:   (l, b, t) => `/${l}/premium/ydus/inciler?branch=${b}&id=${t}`,
  quiz:      (l, b, t) => `/${l}/premium/ydus/quiz-coz?branch=${b}&id=${t}-quiz-1`,
  vaka:      (l, b, t) => `/${l}/premium/ydus/vaka-coz?branch=${b}&topic=${t}`,
  video:     (l, b, t) => `/${l}/premium/ydus/${b}/${t}/video`,
};

// --- ANA SAYFA ---
export default async function KonuSayfasi({
  params,
}: {
  params: Promise<{ lang: string; branch: string; topic: string }>;
}) {
  const { lang, branch, topic } = await params;
  const veri = konuYukle(branch, topic);

  if (!veri) notFound();

  const branchMeta = BRANCH_META[branch] ?? { label: branch, renk: DEFAULT_RENK };
  const moduller = veri.moduller ?? {};
  const istatistikler = veri.istatistikler ?? {};

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>

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
          <Link href={`/${lang}/premium/ydus/${branch}`} style={{ color: branchMeta.renk, textDecoration: 'none', fontWeight: 500 }}>
            {branchMeta.label}
          </Link>
          <span>/</span>
          <span style={{ color: '#4a6a8a' }}>{veri.meta.baslik}</span>
        </nav>

        {/* HERO */}
        <div style={{
          border: '0.5px solid #b8cfe8',
          borderLeft: `4px solid ${branchMeta.renk}`,
          borderRadius: '0 12px 12px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          background: '#f5f9ff',
        }}>
          {veri.meta.rozetler && veri.meta.rozetler.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {veri.meta.rozetler.map((rozet, i) => (
                <span key={i} style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: '#e6f0fb',
                  color: '#1a3a6b',
                  border: '0.5px solid #b8cfe8',
                }}>
                  {rozet}
                </span>
              ))}
            </div>
          )}
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.4rem' }}>
            {veri.meta.baslik}
          </h1>
          {veri.meta.altbaslik && (
            <p style={{ fontSize: '14px', color: '#4a6a8a', lineHeight: 1.6, margin: 0 }}>
              {veri.meta.altbaslik}
            </p>
          )}
        </div>

        {/* İKİ KOLON DÜZEN */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 210px',
          gap: '1.25rem',
          alignItems: 'start',
        }}>

          {/* ANA İÇERİK */}
          <div>
            <IcerikRenderer bloklar={veri.icerik} />

            {/* AI ASİSTAN — konuya soru sor */}
            <SoruSor branch={branch} topic={topic} baslik={veri.meta.baslik} />

            {/* ALT NAVİGASYON */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '0.5px solid #d0e4f5',
              gap: '8px',
            }}>
              <Link href={`/${lang}/premium/ydus/${branch}`} style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#1a3a6b',
                border: '0.5px solid #b8cfe8',
                borderRadius: '8px',
                padding: '7px 14px',
                background: '#f5f9ff',
                textDecoration: 'none',
              }}>
                ← {branchMeta.label}
              </Link>
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
                Ana sayfa
              </Link>
            </div>
          </div>

          {/* SAĞ RAIL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'sticky', top: '1rem' }}>

            {/* MODÜLLER */}
            <div style={{
              border: '0.5px solid #d0e4f5',
              borderRadius: '12px',
              padding: '1rem',
              background: '#fafcff',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#1a3a6b',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.07em',
                marginBottom: '0.6rem',
              }}>
                Modüller
              </div>
              {(Object.entries(moduller) as [string, boolean][]).map(([key, aktif]) => {
                const bilgi = MODUL_BILGI[key as keyof typeof MODUL_BILGI];
                if (!bilgi) return null;
                const href = MODUL_HREF[key]?.(lang, branch, topic) ?? '#';
                return (
                  <Link
                    key={key}
                    href={aktif ? href : '#'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: '0.5px solid #d8e8f5',
                      background: aktif ? '#fff' : '#f5f7fa',
                      marginBottom: '6px',
                      textDecoration: 'none',
                      opacity: aktif ? 1 : 0.55,
                      cursor: aktif ? 'pointer' : 'default',
                      pointerEvents: aktif ? 'auto' : 'none',
                    }}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: bilgi.renk,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      flexShrink: 0,
                    }}>
                      {bilgi.emoji}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#1a2a3a', flex: 1 }}>
                      {bilgi.etiket}
                    </span>
                    {!aktif && (
                      <span style={{ fontSize: '10px', color: '#8aaacc' }}>Yakında</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* İSTATİSTİKLER */}
            {Object.keys(istatistikler).length > 0 && (
              <div style={{
                border: '0.5px solid #d0e4f5',
                borderRadius: '12px',
                padding: '1rem',
                background: '#fafcff',
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#1a3a6b',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.07em',
                  marginBottom: '0.6rem',
                }}>
                  İçerik
                </div>
                <style>{`.stat-link:hover { background: #eef4fc; }`}</style>
                {istatistikler.soru !== undefined && (
                  moduller.quiz ? (
                    <Link href={`/${lang}/premium/ydus/quiz-coz?branch=${branch}&id=${topic}-quiz-1`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', marginBottom: '2px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>📝 Soru</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.soru || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px', marginBottom: '2px' }}>
                      <span style={{ color: '#4a6a8a' }}>📝 Soru</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.soru || '—'}</span>
                    </div>
                  )
                )}
                {istatistikler.flashcard !== undefined && (
                  moduller.flashcard ? (
                    <Link href={`/${lang}/premium/ydus/hizli-tekrar?branch=${branch}&id=${topic}`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', marginBottom: '2px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>🃏 Flashcard</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.flashcard || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px', marginBottom: '2px' }}>
                      <span style={{ color: '#4a6a8a' }}>🃏 Flashcard</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.flashcard || '—'}</span>
                    </div>
                  )
                )}
                {istatistikler.inci !== undefined && (
                  moduller.inciler ? (
                    <Link href={`/${lang}/premium/ydus/inciler?branch=${branch}&id=${topic}`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>💎 İnci</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.inci || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px' }}>
                      <span style={{ color: '#4a6a8a' }}>💎 İnci</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.inci || '—'}</span>
                    </div>
                  )
                )}
                {istatistikler.vaka !== undefined && (
                  moduller.vaka ? (
                    <Link href={`/${lang}/premium/ydus/vaka-coz?branch=${branch}&topic=${topic}`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>🏥 Vaka</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.vaka || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px' }}>
                      <span style={{ color: '#4a6a8a' }}>🏥 Vaka</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.vaka || '—'}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* GÜNCELLEME */}
            {veri.meta.guncelleme && (
              <div style={{ fontSize: '11px', color: '#8aaacc', textAlign: 'center' }}>
                Güncelleme: {veri.meta.guncelleme}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
