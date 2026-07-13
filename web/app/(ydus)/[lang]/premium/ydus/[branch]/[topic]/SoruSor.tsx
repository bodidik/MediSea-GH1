'use client';

import { useState } from 'react';

interface Props {
  branch: string;
  topic: string;
  baslik: string;
}

export default function SoruSor({ branch, topic, baslik }: Props) {
  const [soru, setSoru] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [cevap, setCevap] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [kalan, setKalan] = useState<number | null>(null);

  async function sor() {
    const q = soru.trim();
    if (!q || yukleniyor) return;
    setYukleniyor(true);
    setCevap(null);
    setHata(null);

    try {
      const r = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch, topic, question: q }),
      });
      const j = await r.json();
      if (r.ok && j.ok) {
        setCevap(j.answer);
        if (typeof j.creditsLeft === 'number') setKalan(j.creditsLeft);
      } else {
        setHata(j.message || 'Bir sorun oluştu, tekrar deneyin.');
        if (typeof j.creditsLeft === 'number') setKalan(j.creditsLeft);
      }
    } catch {
      setHata('Bağlantı hatası. Tekrar deneyin.');
    } finally {
      setYukleniyor(false);
    }
  }

  function tuslar(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sor();
  }

  return (
    <div style={{
      marginTop: '2rem',
      border: '0.5px solid #b8cfe8',
      borderRadius: '12px',
      background: '#f5f9ff',
      padding: '1.25rem 1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '18px' }}>🤖</span>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a3a6b', margin: 0 }}>
          Bu konuya soru sor
        </h3>
      </div>
      <p style={{ fontSize: '12px', color: '#6a8aaa', margin: '0 0 0.75rem' }}>
        Yapay zekâ yalnızca <strong>“{baslik}”</strong> konusunun içeriğine dayanarak yanıt verir.
      </p>

      <textarea
        value={soru}
        onChange={(e) => setSoru(e.target.value)}
        onKeyDown={tuslar}
        placeholder="Örn: SMAD4 kaybının prognostik önemi nedir?"
        maxLength={800}
        rows={3}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '0.5px solid #b8cfe8',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '13px',
          fontFamily: 'inherit',
          color: '#1a2a3a',
          resize: 'vertical',
          background: '#fff',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem', gap: '10px' }}>
        <span style={{ fontSize: '11px', color: '#8aa4c0' }}>
          {kalan !== null ? `Kalan hakkın: ${kalan}` : 'Ctrl/⌘ + Enter ile gönder'}
        </span>
        <button
          onClick={sor}
          disabled={yukleniyor || !soru.trim()}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#fff',
            background: yukleniyor || !soru.trim() ? '#9db8d6' : '#1a3a6b',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            cursor: yukleniyor || !soru.trim() ? 'default' : 'pointer',
          }}
        >
          {yukleniyor ? 'Yanıtlanıyor…' : 'Sor'}
        </button>
      </div>

      {hata && (
        <div style={{
          marginTop: '0.9rem',
          border: '0.5px solid #f0c0c0',
          background: '#fff5f5',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '13px',
          color: '#8b1a1a',
        }}>
          {hata}
        </div>
      )}

      {cevap && (
        <div style={{
          marginTop: '0.9rem',
          border: '0.5px solid #80c898',
          background: '#f0fbf5',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '13.5px',
          lineHeight: 1.65,
          color: '#1a2a3a',
          whiteSpace: 'pre-wrap',
        }}>
          {cevap}
        </div>
      )}
    </div>
  );
}
