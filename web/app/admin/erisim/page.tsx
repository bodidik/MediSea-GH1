'use client';
import { useEffect, useState } from 'react';

type Topic = { id: string; baslik: string; branch: string; accessLevel: 'V' | 'M' | 'P' };

const SEVIYE_STIL: Record<string, { bg: string; color: string }> = {
  V: { bg: '#f0fbf5', color: '#1a5c2e' },
  M: { bg: '#fff8e6', color: '#7a4a00' },
  P: { bg: '#f0f0ff', color: '#3a1a8b' },
};

const SEVIYE_ETIKET: Record<string, string> = {
  V: 'Ziyaretçi',
  M: 'Üye',
  P: 'Premium',
};

export default function ErisimYonetimiPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydedilen, setKaydedilen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/admin/access')
      .then(r => r.json())
      .then(d => { setTopics(d.topics ?? []); setYukleniyor(false); });
  }, []);

  async function seviyeDegistir(topicId: string, accessLevel: string) {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, accessLevel: accessLevel as any } : t));
    await fetch('/api/admin/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, accessLevel }),
    });
    setKaydedilen(prev => ({ ...prev, [topicId]: true }));
    setTimeout(() => setKaydedilen(prev => ({ ...prev, [topicId]: false })), 1500);
  }

  const branches = [...new Set(topics.map(t => t.branch))];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f9ff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a6b', margin: 0 }}>Erişim Yönetimi</h1>
          <p style={{ fontSize: '13px', color: '#6a8aaa', marginTop: '4px' }}>
            Her topic için erişim seviyesini belirle. Değişiklik anında geçerli olur.
          </p>
        </div>

        <div style={{
          background: '#fff8e6', border: '0.5px solid #f0d080', borderRadius: '10px',
          padding: '10px 14px', fontSize: '13px', color: '#7a4a00', marginBottom: '1.5rem',
        }}>
          <strong>Ücretsiz dönem aktif</strong> — M seviyesi şu an parasız. Monetizasyon başlatmak için
          {' '}<code style={{ background: '#fff3cc', padding: '1px 5px', borderRadius: '3px' }}>MONETIZATION_ENABLED=true</code>{' '}
          env'e ekle.
        </div>

        {yukleniyor ? (
          <p style={{ color: '#6a8aaa', fontSize: '14px' }}>Yükleniyor…</p>
        ) : (
          branches.map(branch => (
            <div key={branch} style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6a8aaa', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>
                {branch}
              </div>
              <div style={{ border: '0.5px solid #d0e4f5', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                {topics.filter(t => t.branch === branch).map((t, i, arr) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: i < arr.length - 1 ? '0.5px solid #f0f4f8' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a2a3a' }}>{t.baslik}</div>
                      <div style={{ fontSize: '11px', color: '#8a9aaa' }}>{t.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {kaydedilen[t.id] && (
                        <span style={{ fontSize: '11px', color: '#1a5c2e' }}>✓ kaydedildi</span>
                      )}
                      <select
                        value={t.accessLevel}
                        onChange={e => seviyeDegistir(t.id, e.target.value)}
                        style={{
                          fontSize: '12px', fontWeight: 600, padding: '5px 10px',
                          borderRadius: '6px', cursor: 'pointer', outline: 'none',
                          border: '0.5px solid #b8cfe8',
                          background: SEVIYE_STIL[t.accessLevel].bg,
                          color: SEVIYE_STIL[t.accessLevel].color,
                        }}
                      >
                        {(['V', 'M', 'P'] as const).map(s => (
                          <option key={s} value={s}>{s} — {SEVIYE_ETIKET[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
