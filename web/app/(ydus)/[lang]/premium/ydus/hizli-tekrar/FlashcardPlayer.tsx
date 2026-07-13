'use client';

import { useState, useEffect, useCallback } from 'react';

interface Card {
  id: string;
  front: string;
  back: string;
  tag: string;
}

interface Props {
  cards: Card[];
  topic: string;
  backHref: string;
}

// $...$  notasyonunu render et
function renderMath(text: string): React.ReactNode {
  const parts = text.split(/\$([^$]+)\$/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        style={{
          fontFamily: 'monospace',
          background: '#eef3ff',
          color: '#1a3a6b',
          padding: '1px 4px',
          borderRadius: '3px',
          fontSize: '0.92em',
          fontWeight: 600,
        }}
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const TAG_RENKLERI: Record<string, { bg: string; text: string }> = {
  'APL':                    { bg: '#fff0f0', text: '#8b1a1a' },
  'Onkolojik Acil':         { bg: '#fff0f0', text: '#8b1a1a' },
  'HCT / Nakil':            { bg: '#f0f7ff', text: '#1a3a6b' },
  'Hedefe Yönelik Tedavi':  { bg: '#f0f7ff', text: '#1a3a6b' },
  'ELN 2022 / Risk':        { bg: '#f5fff0', text: '#1a5c2e' },
  'ELN 2024 / Risk':        { bg: '#f5fff0', text: '#1a5c2e' },
  'WHO/ICC 2022':           { bg: '#f5fff0', text: '#1a5c2e' },
  'Yanıt Kriterleri':       { bg: '#fffdf0', text: '#7a5800' },
  'Tedavi Toksisitesi':     { bg: '#fffdf0', text: '#7a5800' },
  'MRD':                    { bg: '#f5f0ff', text: '#4a1a7a' },
  'Moleküler Genetik':      { bg: '#f5f0ff', text: '#4a1a7a' },
  'ALL':                    { bg: '#f5f5f5', text: '#3a3a3a' },
  'Ayırıcı Tanı':           { bg: '#f5f5f5', text: '#3a3a3a' },
};

function tagStil(tag: string) {
  return TAG_RENKLERI[tag] ?? { bg: '#e6f0fb', text: '#1a3a6b' };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardPlayer({ cards, topic, backHref }: Props) {
  const [deck, setDeck] = useState<Card[]>(cards); // SSR'da orijinal sıra
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDeck(shuffle(cards));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [flipped, setFlipped] = useState(false);
  const [bilinen, setBilinen] = useState<Set<string>>(new Set());

  const card = deck[index];
  const total = deck.length;

  const next = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex(i => (i + 1) % total), 150);
  }, [total]);

  const prev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex(i => (i - 1 + total) % total), 150);
  }, [total]);

  const flip = useCallback(() => setFlipped(f => !f), []);

  const toggleBilinen = useCallback(() => {
    setBilinen(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }, [card.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flip, next, prev]);

  const bilinenSayi = bilinen.size;
  const ilerleme = Math.round((bilinenSayi / total) * 100);
  const cardBilinen = bilinen.has(card.id);
  const tagS = tagStil(card.tag);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <a href={backHref} style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#1a3a6b',
            border: '0.5px solid #b8cfe8',
            borderRadius: '8px',
            padding: '6px 12px',
            background: '#f5f9ff',
            textDecoration: 'none',
          }}>
            ← Konuya dön
          </a>
          <span style={{ fontSize: '12px', color: '#6a8aaa' }}>
            {topic}
          </span>
        </div>

        {/* İLERLEME */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6a8aaa', marginBottom: '6px' }}>
            <span>{index + 1} / {total}</span>
            <span style={{ color: '#1a6640' }}>{bilinenSayi} biliniyor · %{ilerleme}</span>
          </div>
          <div style={{ height: '4px', background: '#e8f0f8', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((index + 1) / total) * 100}%`,
              background: '#1a3a6b',
              borderRadius: '4px',
              transition: 'width 0.2s',
            }} />
          </div>
          <div style={{ height: '4px', background: 'transparent', borderRadius: '4px', overflow: 'hidden', marginTop: '3px' }}>
            <div style={{
              height: '100%',
              width: `${ilerleme}%`,
              background: '#1a6640',
              borderRadius: '4px',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* KART */}
        <div
          style={{ flex: 1, perspective: '1200px', marginBottom: '1.25rem', cursor: 'pointer', minHeight: '280px' }}
          onClick={flip}
        >
          <div style={{
            width: '100%',
            height: '100%',
            minHeight: '280px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}>

            {/* ÖN YÜZ */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              border: '0.5px solid #b8cfe8',
              borderRadius: '16px',
              background: '#f5f9ff',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '5px',
                  background: tagS.bg,
                  color: tagS.text,
                  border: '0.5px solid currentColor',
                  opacity: 0.9,
                }}>
                  {card.tag}
                </span>
                <span style={{ fontSize: '11px', color: '#8aaacc' }}>Soruyu oku</span>
              </div>

              <p style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: '#1a2a3a',
                margin: '1.5rem 0',
                fontWeight: 500,
                textAlign: 'center',
              }}>
                {renderMath(card.front)}
              </p>

              <div style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#8aaacc',
                borderTop: '0.5px solid #d0e4f5',
                paddingTop: '0.75rem',
              }}>
                Tıkla veya <kbd style={{ padding: '1px 5px', background: '#e8f0f8', borderRadius: '3px', fontSize: '11px' }}>Space</kbd> ile çevir
              </div>
            </div>

            {/* ARKA YÜZ */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: '0.5px solid #80c898',
              borderRadius: '16px',
              background: '#f0fbf5',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1a6640', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Yanıt</span>
                <button
                  onClick={e => { e.stopPropagation(); toggleBilinen(); }}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '0.5px solid',
                    cursor: 'pointer',
                    background: cardBilinen ? '#1a6640' : '#fff',
                    color: cardBilinen ? '#fff' : '#1a6640',
                    borderColor: '#1a6640',
                    transition: 'all 0.15s',
                  }}
                >
                  {cardBilinen ? '✓ Biliyorum' : 'Biliyorum'}
                </button>
              </div>

              <p style={{
                fontSize: '15px',
                lineHeight: 1.75,
                color: '#1a2a3a',
                margin: '1.5rem 0',
                textAlign: 'center',
              }}>
                {renderMath(card.back)}
              </p>

              <div style={{ textAlign: 'center', fontSize: '11px', color: '#4a8a5a' }}>
                {cardBilinen ? '✓ Bu kartı biliniyor olarak işaretledin' : 'Biliyorsan işaretle, devam et'}
              </div>
            </div>
          </div>
        </div>

        {/* NAVİGASYON */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={prev}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              border: '0.5px solid #b8cfe8',
              background: '#f5f9ff',
              color: '#1a3a6b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ← Önceki
          </button>

          <button
            onClick={flip}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: '10px',
              border: '0.5px solid #1a3a6b',
              background: flipped ? '#1a3a6b' : '#fff',
              color: flipped ? '#fff' : '#1a3a6b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {flipped ? 'Soruya dön' : 'Yanıtı gör'}
          </button>

          <button
            onClick={next}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              border: '0.5px solid #b8cfe8',
              background: '#f5f9ff',
              color: '#1a3a6b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Sonraki →
          </button>
        </div>

        {/* KLAVYE İPUCU */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#aac0d8', marginTop: '0.75rem' }}>
          <kbd style={{ padding: '1px 5px', background: '#f0f4f8', borderRadius: '3px' }}>←</kbd>
          {' '}önceki · {' '}
          <kbd style={{ padding: '1px 5px', background: '#f0f4f8', borderRadius: '3px' }}>Space</kbd>
          {' '}çevir · {' '}
          <kbd style={{ padding: '1px 5px', background: '#f0f4f8', borderRadius: '3px' }}>→</kbd>
          {' '}sonraki
        </div>

      </div>
    </div>
  );
}
