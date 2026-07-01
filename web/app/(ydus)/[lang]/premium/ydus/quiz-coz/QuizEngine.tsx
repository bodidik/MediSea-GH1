'use client';

import { useState, useCallback } from 'react';

/* ────────────────────────── TYPES ────────────────────────── */
interface Soru {
  id: string;
  metin: string;
  secenekler: Record<string, string>;
  dogru: string;
  aciklama_kisa?: string;
  aciklama_detay?: string;
  secenekAciklamalari?: Record<string, string>;
  etiketler?: string[];
  zorluk?: string;
  kaynak?: string;
}

interface QuizVeri {
  id: string;
  baslik: string;
  branch?: string;
  topic?: string;
  sorular: Soru[];
}

interface Props {
  veri: QuizVeri;
  lang: string;
  branch: string;
}

/* ────────────────────────── HELPERS ────────────────────────── */
const ZORLUK_RENK: Record<string, { bg: string; color: string }> = {
  kolay:  { bg: '#f0fbf5', color: '#1a6640' },
  orta:   { bg: '#fffdf0', color: '#7a5800' },
  zor:    { bg: '#fff0f0', color: '#a01f1f' },
};

function ZorlukBadge({ zorluk }: { zorluk?: string }) {
  if (!zorluk) return null;
  const s = ZORLUK_RENK[zorluk] ?? { bg: '#f5f9ff', color: '#1a3a6b' };
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, padding: '2px 8px',
      borderRadius: '4px', background: s.bg, color: s.color,
      border: `0.5px solid currentColor`, textTransform: 'uppercase', letterSpacing: '.06em',
    }}>
      {zorluk}
    </span>
  );
}

/* ────────────────────────── SORU BİLEŞENİ ────────────────────────── */
function SoruKarti({
  soru,
  soruNo,
  toplamSoru,
  onNext,
  lang,
  branch,
  topic,
}: {
  soru: Soru;
  soruNo: number;
  toplamSoru: number;
  onNext: () => void;
  lang: string;
  branch: string;
  topic?: string;
}) {
  const [secim, setSecim] = useState<string | null>(null);
  const [aciklamaAcik, setAciklamaAcik] = useState(false);

  const secenekler = Object.entries(soru.secenekler);
  const cevapVerildi = secim !== null;

  const secenek = useCallback((harf: string) => {
    if (cevapVerildi) return;
    setSecim(harf);
    setAciklamaAcik(true);
  }, [cevapVerildi]);

  function secenekStil(harf: string): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '12px 16px', borderRadius: '10px', border: '0.5px solid',
      cursor: cevapVerildi ? 'default' : 'pointer',
      textAlign: 'left' as const, background: '#fff',
      transition: 'all 0.15s', marginBottom: '8px', width: '100%',
      borderColor: '#d0e4f5',
    };

    if (!cevapVerildi) {
      return { ...base, borderColor: '#d0e4f5' };
    }

    if (harf === soru.dogru) {
      return { ...base, background: '#f0fbf5', borderColor: '#80c898', borderWidth: '1.5px' };
    }
    if (harf === secim) {
      return { ...base, background: '#fff0f0', borderColor: '#e08080', borderWidth: '1.5px' };
    }
    return { ...base, opacity: 0.5, borderColor: '#e8f0f8' };
  }

  function harfDairesi(harf: string): React.CSSProperties {
    const base: React.CSSProperties = {
      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: 700,
    };

    if (!cevapVerildi) {
      return { ...base, background: '#f0f7ff', color: '#1a3a6b', border: '0.5px solid #b8cfe8' };
    }
    if (harf === soru.dogru) {
      return { ...base, background: '#1a6640', color: '#fff', border: 'none' };
    }
    if (harf === secim) {
      return { ...base, background: '#a01f1f', color: '#fff', border: 'none' };
    }
    return { ...base, background: '#f0f0f0', color: '#888', border: '0.5px solid #d8d8d8' };
  }

  const dogruMu = secim === soru.dogru;
  const backHref = topic ? `/${lang}/premium/ydus/${branch}/${topic}` : `/${lang}/premium/ydus/${branch}`;

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a2a3a',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', flex: 1 }}>

        {/* BAŞLIK + İLERLEME */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <a href={backHref} style={{
            fontSize: '12px', fontWeight: 500, color: '#1a3a6b',
            border: '0.5px solid #b8cfe8', borderRadius: '8px', padding: '6px 12px',
            background: '#f5f9ff', textDecoration: 'none',
          }}>
            ← Konuya dön
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ZorlukBadge zorluk={soru.zorluk} />
            <span style={{ fontSize: '12px', color: '#8aaacc', fontWeight: 600 }}>
              {soruNo} / {toplamSoru}
            </span>
          </div>
        </div>

        {/* İLERLEME ÇUBUĞU */}
        <div style={{ height: '4px', background: '#e8f0f8', borderRadius: '4px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#1a3a6b', borderRadius: '4px',
            width: `${(soruNo / toplamSoru) * 100}%`, transition: 'width .3s',
          }} />
        </div>

        {/* SORU METNİ */}
        <div style={{
          background: '#f5f9ff', border: '0.5px solid #b8cfe8',
          borderLeft: '3px solid #1a3a6b', borderRadius: '0 10px 10px 0',
          padding: '1.1rem 1.25rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.5rem' }}>
            Soru {soruNo}
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#1a2a3a', fontWeight: 500 }}>
            {soru.metin}
          </p>
          {soru.etiketler && soru.etiketler.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '.65rem' }}>
              {soru.etiketler.map((t, i) => (
                <span key={i} style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                  background: '#e6f0fb', color: '#1a3a6b', border: '0.5px solid #b8cfe8',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SEÇENEKLER */}
        <div style={{ marginBottom: '1rem' }}>
          {secenekler.map(([harf, metin]) => (
            <button
              key={harf}
              onClick={() => secenek(harf)}
              style={secenekStil(harf)}
            >
              <div style={harfDairesi(harf)}>
                {cevapVerildi
                  ? harf === soru.dogru ? '✓' : harf === secim ? '✗' : harf
                  : harf}
              </div>
              <span style={{ fontSize: '13px', lineHeight: 1.65, color: '#1a2a3a', flex: 1 }}>
                {metin}
              </span>
            </button>
          ))}
        </div>

        {/* SONUÇ + AÇIKLAMA */}
        {cevapVerildi && (
          <div style={{
            border: `1.5px solid ${dogruMu ? '#80c898' : '#e08080'}`,
            borderRadius: '12px', overflow: 'hidden',
            animation: 'fadeIn .25s ease',
          }}>
            {/* Sonuç başlığı */}
            <div style={{
              padding: '.85rem 1.25rem',
              background: dogruMu ? '#f0fbf5' : '#fff0f0',
              display: 'flex', alignItems: 'center', gap: '10px',
              borderBottom: `0.5px solid ${dogruMu ? '#80c898' : '#e08080'}`,
            }}>
              <span style={{ fontSize: '1.4rem' }}>{dogruMu ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: dogruMu ? '#1a6640' : '#a01f1f' }}>
                  {dogruMu ? 'Doğru!' : `Yanlış — Doğru cevap: ${soru.dogru}`}
                </div>
                {soru.aciklama_kisa && (
                  <div style={{ fontSize: '12px', color: '#4a6a8a', marginTop: '2px' }}>
                    {soru.aciklama_kisa}
                  </div>
                )}
              </div>
            </div>

            {/* Detaylı açıklama */}
            <div style={{ padding: '1rem 1.25rem' }}>
              {soru.aciklama_detay && (
                <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#1a2a3a', marginBottom: '1rem' }}>
                  {soru.aciklama_detay}
                </p>
              )}

              {/* Seçenek bazlı açıklamalar */}
              {soru.secenekAciklamalari && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.6rem' }}>
                    Seçenek Açıklamaları
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(soru.secenekAciklamalari).map(([harf, metin]) => {
                      const isDogru = harf === soru.dogru;
                      return (
                        <div key={harf} style={{
                          padding: '.65rem .9rem',
                          borderRadius: '7px',
                          background: isDogru ? '#fff0f0' : '#f8fcff',
                          border: `0.5px solid ${isDogru ? '#e08080' : '#d0e4f5'}`,
                          display: 'flex', gap: '8px', alignItems: 'flex-start',
                        }}>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                            borderRadius: '4px', flexShrink: 0,
                            background: isDogru ? '#a01f1f' : '#e6f0fb',
                            color: isDogru ? '#fff' : '#1a3a6b',
                          }}>
                            {harf}
                          </span>
                          <span style={{ fontSize: '12px', lineHeight: 1.65, color: '#1a2a3a' }}>
                            {metin}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {soru.kaynak && (
                <div style={{ marginTop: '.85rem', fontSize: '11px', color: '#8aaacc', borderTop: '0.5px solid #e8f0f8', paddingTop: '.65rem' }}>
                  Kaynak: {soru.kaynak}
                </div>
              )}
            </div>

            {/* Alt butonlar */}
            <div style={{
              padding: '.75rem 1.25rem', borderTop: '0.5px solid #e8f0f8',
              display: 'flex', justifyContent: 'space-between', gap: '8px',
            }}>
              <a href={backHref} style={{
                fontSize: '12px', fontWeight: 500, color: '#1a3a6b',
                border: '0.5px solid #b8cfe8', borderRadius: '8px', padding: '7px 14px',
                background: '#f5f9ff', textDecoration: 'none',
              }}>
                ← Konuya dön
              </a>
              {soruNo < toplamSoru && (
                <button onClick={onNext} style={{
                  fontSize: '12px', fontWeight: 600, color: '#fff',
                  border: 'none', borderRadius: '8px', padding: '7px 18px',
                  background: '#1a3a6b', cursor: 'pointer',
                }}>
                  Sonraki soru →
                </button>
              )}
              {soruNo === toplamSoru && (
                <div style={{ fontSize: '12px', color: '#1a6640', fontWeight: 600, padding: '7px 0' }}>
                  ✓ Set tamamlandı
                </div>
              )}
            </div>
          </div>
        )}

        {!cevapVerildi && (
          <p style={{ fontSize: '11px', color: '#b0c8e0', textAlign: 'center', marginTop: '.5rem' }}>
            Bir seçenek işaretleyin
          </p>
        )}

      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

/* ────────────────────────── ANA BİLEŞEN ────────────────────────── */
export default function QuizEngine({ veri, lang, branch }: Props) {
  const [soruIndex, setSoruIndex] = useState(0);

  const sorular = veri.sorular ?? [];

  if (sorular.length === 0) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <p style={{ color: '#6a8aaa' }}>Bu quizde henüz soru yok.</p>
      </div>
    );
  }

  return (
    <SoruKarti
      key={sorular[soruIndex].id}
      soru={sorular[soruIndex]}
      soruNo={soruIndex + 1}
      toplamSoru={sorular.length}
      onNext={() => setSoruIndex(i => Math.min(i + 1, sorular.length - 1))}
      lang={lang}
      branch={branch}
      topic={veri.topic}
    />
  );
}
