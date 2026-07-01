'use client';

import { useState, useCallback } from 'react';

/* ──────────────────── TYPES ──────────────────── */
interface Adim {
  adim: number;
  baslik: string;
  klinik_bilgi: string;
  soru: string;
  secenekler: Record<string, string>;
  dogru: string;
  aciklama_kisa: string;
  aciklama_detay: string;
  secenekAciklamalari: Record<string, string>;
  sonraki_bilgi?: string;
}

interface VakaVeri {
  id: string;
  baslik: string;
  branch: string;
  topic?: string;
  zorluk?: string;
  sure_dk?: number;
  adimlar: Adim[];
}

interface Props {
  veri: VakaVeri;
  lang: string;
  branch: string;
}

/* ──────────────────── HELPERS ──────────────────── */
const ZORLUK_RENK: Record<string, { bg: string; color: string }> = {
  kolay: { bg: '#f0fbf5', color: '#1a6640' },
  orta:  { bg: '#fffdf0', color: '#7a5800' },
  zor:   { bg: '#fff0f0', color: '#a01f1f' },
};

/* Çok satırlı metni, \n ile bölünmüş paragraflar + kalın satırlar olarak render eder */
function KlinikMetin({ metin }: { metin: string }) {
  const satirlar = metin.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {satirlar.map((satir, i) => {
        if (!satir.trim()) return <div key={i} style={{ height: '4px' }} />;
        const kalinMi = satir.startsWith('—') || satir.includes(':') && satir.indexOf(':') < 25;
        return (
          <p key={i} style={{
            fontSize: '13px', lineHeight: 1.7, color: '#1a2a3a',
            fontWeight: kalinMi ? 600 : 400, margin: 0,
          }}>
            {satir}
          </p>
        );
      })}
    </div>
  );
}

/* ──────────────────── ADIM BİLEŞENİ ──────────────────── */
function AdimKarti({
  adim,
  adimNo,
  toplamAdim,
  onNext,
  isLast,
}: {
  adim: Adim;
  adimNo: number;
  toplamAdim: number;
  onNext: () => void;
  isLast: boolean;
}) {
  const [secim, setSecim] = useState<string | null>(null);
  const [sonrakiAcik, setSonrakiAcik] = useState(false);

  const cevapVerildi = secim !== null;
  const dogruMu = secim === adim.dogru;

  const secenek = useCallback((harf: string) => {
    if (cevapVerildi) return;
    setSecim(harf);
  }, [cevapVerildi]);

  function secenekStil(harf: string): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '11px 14px', borderRadius: '10px', border: '0.5px solid',
      cursor: cevapVerildi ? 'default' : 'pointer',
      textAlign: 'left', width: '100%', marginBottom: '7px',
      transition: 'all .15s', background: '#fff',
      borderColor: '#d0e4f5',
    };
    if (!cevapVerildi) return base;
    if (harf === adim.dogru) return { ...base, background: '#f0fbf5', borderColor: '#80c898', borderWidth: '1.5px' };
    if (harf === secim)    return { ...base, background: '#fff0f0', borderColor: '#e08080', borderWidth: '1.5px' };
    return { ...base, opacity: .45, borderColor: '#e8f0f8' };
  }

  function harfDairesi(harf: string): React.CSSProperties {
    const base: React.CSSProperties = {
      width: '27px', height: '27px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700,
    };
    if (!cevapVerildi) return { ...base, background: '#f0f7ff', color: '#1a3a6b', border: '0.5px solid #b8cfe8' };
    if (harf === adim.dogru) return { ...base, background: '#1a6640', color: '#fff' };
    if (harf === secim)      return { ...base, background: '#a01f1f', color: '#fff' };
    return { ...base, background: '#f0f0f0', color: '#aaa' };
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a2a3a' }}>

      {/* KLİNİK BİLGİ KUTUSU */}
      <div style={{
        background: '#f5f9ff', border: '0.5px solid #b8cfe8',
        borderLeft: '3px solid #1a3a6b', borderRadius: '0 10px 10px 0',
        padding: '1rem 1.2rem', marginBottom: '1.2rem',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.5rem' }}>
          Klinik Bilgi
        </div>
        <KlinikMetin metin={adim.klinik_bilgi} />
      </div>

      {/* SORU */}
      <div style={{
        background: '#fff', border: '0.5px solid #d0e4f5', borderRadius: '10px',
        padding: '.9rem 1.1rem', marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#a01f1f', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.4rem' }}>
          Soru {adimNo}
        </div>
        <p style={{ fontSize: '13.5px', lineHeight: 1.75, fontWeight: 500, color: '#1a2a3a', margin: 0 }}>
          {adim.soru}
        </p>
      </div>

      {/* SEÇENEKLER */}
      <div style={{ marginBottom: '.75rem' }}>
        {Object.entries(adim.secenekler).map(([harf, metin]) => (
          <button key={harf} onClick={() => secenek(harf)} style={secenekStil(harf)}>
            <div style={harfDairesi(harf)}>
              {cevapVerildi
                ? harf === adim.dogru ? '✓' : harf === secim ? '✗' : harf
                : harf}
            </div>
            <span style={{ fontSize: '13px', lineHeight: 1.65, color: '#1a2a3a', flex: 1 }}>{metin}</span>
          </button>
        ))}
      </div>

      {/* CEVAP VERİLDİ → AÇIKLAMA */}
      {cevapVerildi && (
        <div style={{
          border: `1.5px solid ${dogruMu ? '#80c898' : '#e08080'}`,
          borderRadius: '12px', overflow: 'hidden',
          animation: 'fadeIn .25s ease',
        }}>
          {/* Sonuç başlığı */}
          <div style={{
            padding: '.75rem 1.1rem',
            background: dogruMu ? '#f0fbf5' : '#fff0f0',
            display: 'flex', alignItems: 'center', gap: '9px',
            borderBottom: `0.5px solid ${dogruMu ? '#80c898' : '#e08080'}`,
          }}>
            <span style={{ fontSize: '1.25rem' }}>{dogruMu ? '✅' : '❌'}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: dogruMu ? '#1a6640' : '#a01f1f' }}>
                {dogruMu ? 'Doğru!' : `Yanlış — Doğru cevap: ${adim.dogru}`}
              </div>
              <div style={{ fontSize: '11.5px', color: '#4a6a8a', marginTop: '1px' }}>
                {adim.aciklama_kisa}
              </div>
            </div>
          </div>

          {/* Detay */}
          <div style={{ padding: '.9rem 1.1rem' }}>
            <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#1a2a3a', marginBottom: '1rem' }}>
              {adim.aciklama_detay}
            </p>

            {/* Seçenek açıklamaları */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
                Seçenek Açıklamaları
              </div>
              {Object.entries(adim.secenekAciklamalari).map(([harf, metin]) => {
                const isDogru = harf === adim.dogru;
                return (
                  <div key={harf} style={{
                    padding: '.55rem .85rem', borderRadius: '7px', marginBottom: '5px',
                    background: isDogru ? '#f0fbf5' : '#f8fcff',
                    border: `0.5px solid ${isDogru ? '#80c898' : '#d0e4f5'}`,
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                  }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                      borderRadius: '4px', flexShrink: 0,
                      background: isDogru ? '#1a6640' : '#e6f0fb',
                      color: isDogru ? '#fff' : '#1a3a6b',
                    }}>
                      {harf}
                    </span>
                    <span style={{ fontSize: '12px', lineHeight: 1.65, color: '#1a2a3a' }}>{metin}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sonraki bilgi + devam */}
          <div style={{ borderTop: '0.5px solid #e8f0f8' }}>
            {adim.sonraki_bilgi && !sonrakiAcik && (
              <button
                onClick={() => setSonrakiAcik(true)}
                style={{
                  width: '100%', padding: '.75rem 1.1rem',
                  background: '#f5f9ff', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, color: '#1a3a6b',
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <span>🔍</span> Klinik seyir ve yeni bilgiler için tıklayın
              </button>
            )}

            {adim.sonraki_bilgi && sonrakiAcik && (
              <div style={{ padding: '.85rem 1.1rem', background: '#fffdf0', borderBottom: '0.5px solid #e8f0f8' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#7a5800', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.4rem' }}>
                  {isLast ? 'Vaka Sonu' : 'Yeni Klinik Bilgi'}
                </div>
                <KlinikMetin metin={adim.sonraki_bilgi} />
              </div>
            )}

            {!isLast && sonrakiAcik && (
              <button
                onClick={onNext}
                style={{
                  width: '100%', padding: '.75rem 1.1rem',
                  background: '#1a3a6b', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                Sonraki Adım →
              </button>
            )}

            {!isLast && !adim.sonraki_bilgi && (
              <button
                onClick={onNext}
                style={{
                  width: '100%', padding: '.75rem 1.1rem',
                  background: '#1a3a6b', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                Sonraki Adım →
              </button>
            )}

            {isLast && sonrakiAcik && (
              <div style={{
                padding: '.75rem 1.1rem', background: '#f0fbf5',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '1.1rem' }}>🏁</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a6640' }}>Vaka tamamlandı!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!cevapVerildi && (
        <p style={{ fontSize: '11px', color: '#b0c8e0', textAlign: 'center', marginTop: '.4rem' }}>
          Bir seçenek işaretleyin
        </p>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

/* ──────────────────── ANA BİLEŞEN ──────────────────── */
export default function VakaEngine({ veri, lang, branch }: Props) {
  const [adimIndex, setAdimIndex] = useState(0);

  const adimlar = veri.adimlar ?? [];
  const adim = adimlar[adimIndex];
  const toplamAdim = adimlar.length;
  const backHref = veri.topic
    ? `/${lang}/premium/ydus/${branch}/${veri.topic}`
    : `/${lang}/premium/ydus/${branch}`;

  if (!adim) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#6a8aaa' }}>Vaka adımı bulunamadı.</p>
    </div>
  );

  const zorlukRenk = ZORLUK_RENK[veri.zorluk ?? ''] ?? { bg: '#f5f9ff', color: '#1a3a6b' };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ÜSTTE: GERİ + BAŞLIK + ZORLUK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <a href={backHref} style={{
            fontSize: '12px', fontWeight: 500, color: '#1a3a6b',
            border: '0.5px solid #b8cfe8', borderRadius: '8px', padding: '5px 11px',
            background: '#f5f9ff', textDecoration: 'none', flexShrink: 0,
          }}>
            ← Konuya dön
          </a>
          <div style={{ textAlign: 'right', marginLeft: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a2a3a', lineHeight: 1.3 }}>
              {veri.baslik}
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px', flexWrap: 'wrap' }}>
              {veri.zorluk && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                  background: zorlukRenk.bg, color: zorlukRenk.color, border: '0.5px solid currentColor',
                  textTransform: 'uppercase', letterSpacing: '.05em',
                }}>
                  {veri.zorluk}
                </span>
              )}
              {veri.sure_dk && (
                <span style={{
                  fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px',
                  background: '#f5f9ff', color: '#6a8aaa', border: '0.5px solid #d0e4f5',
                }}>
                  ~{veri.sure_dk} dk
                </span>
              )}
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                background: '#f5f0ff', color: '#5a2a9b', border: '0.5px solid #c8a8f0',
                textTransform: 'uppercase', letterSpacing: '.05em',
              }}>
                Vaka
              </span>
            </div>
          </div>
        </div>

        {/* ADIM PROGRES ÇUBUĞU */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1a3a6b' }}>
              Adım {adimIndex + 1} / {toplamAdim} — {adim.baslik}
            </span>
            <span style={{ fontSize: '11px', color: '#8aaacc' }}>
              {Math.round(((adimIndex + 1) / toplamAdim) * 100)}%
            </span>
          </div>
          <div style={{ height: '5px', background: '#e8f0f8', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '5px',
              background: 'linear-gradient(90deg, #1a3a6b, #3a6abf)',
              width: `${((adimIndex + 1) / toplamAdim) * 100}%`,
              transition: 'width .4s ease',
            }} />
          </div>
          {/* Adım noktaları */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {adimlar.map((a, i) => (
              <div key={i} style={{
                flex: 1, height: '3px', borderRadius: '3px',
                background: i <= adimIndex ? '#1a3a6b' : '#e8f0f8',
                transition: 'background .3s',
              }} />
            ))}
          </div>
        </div>

        {/* ADIM KARTI — key ile yeniden mount */}
        <AdimKarti
          key={adimIndex}
          adim={adim}
          adimNo={adimIndex + 1}
          toplamAdim={toplamAdim}
          onNext={() => setAdimIndex(i => Math.min(i + 1, toplamAdim - 1))}
          isLast={adimIndex === toplamAdim - 1}
        />

      </div>
    </div>
  );
}
