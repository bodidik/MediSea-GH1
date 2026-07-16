'use client';
import { useEffect, useState } from 'react';

const TUR_ETIKET: Record<string, { label: string; renk: string; bg: string }> = {
  bilgi:   { label: 'Bilgi',   renk: '#1a4a8b', bg: '#eef4ff' },
  onemli:  { label: 'Önemli', renk: '#7a3800', bg: '#fff4e6' },
  acil:    { label: 'Acil',   renk: '#8b1a1a', bg: '#fff0f0' },
};

interface Duyuru {
  id: string;
  baslik: string;
  icerik: string;
  tur: string;
  sabitli: boolean;
  tarih: string;
  yayinda: boolean;
}

export default function AdminDuyuruPage() {
  const [liste, setListe]     = useState<Duyuru[]>([]);
  const [baslik, setBaslik]   = useState('');
  const [icerik, setIcerik]   = useState('');
  const [tur, setTur]         = useState('bilgi');
  const [sabitli, setSabitli] = useState(false);
  const [mesaj, setMesaj]     = useState('');

  useEffect(() => { yukle(); }, []);

  async function yukle() {
    const r = await fetch('/api/admin/kayseritip/duyuru');
    if (r.ok) { const d = await r.json(); setListe(d.duyurular ?? []); }
  }

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setMesaj('');
    const res = await fetch('/api/admin/kayseritip/duyuru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baslik, icerik, tur, sabitli }),
    });
    if (res.ok) {
      setMesaj('✓ Duyuru yayınlandı');
      setBaslik(''); setIcerik(''); setTur('bilgi'); setSabitli(false);
      yukle();
    } else {
      const d = await res.json();
      setMesaj(d.error ?? 'Hata');
    }
  }

  async function sil(id: string) {
    await fetch('/api/admin/kayseritip/duyuru', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    yukle();
  }

  async function yayinToggle(d: Duyuru) {
    await fetch('/api/admin/kayseritip/duyuru', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, yayinda: !d.yayinda }),
    });
    yukle();
  }

  async function sabitliToggle(d: Duyuru) {
    await fetch('/api/admin/kayseritip/duyuru', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, sabitli: !d.sabitli }),
    });
    yukle();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f9ff', fontFamily: 'system-ui, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a2a4a', marginBottom: '1.5rem' }}>
          📢 KayseriTıp — Duyuru Yönetimi
        </h1>

        {/* Form */}
        <form onSubmit={kaydet} style={{
          background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '14px',
          padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a2a4a' }}>Yeni Duyuru</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>Başlık</label>
              <input value={baslik} onChange={e => setBaslik(e.target.value)} required
                placeholder="Duyuru başlığı"
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>Tür</label>
              <select value={tur} onChange={e => setTur(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', background: '#fff' }}>
                <option value="bilgi">ℹ️ Bilgi</option>
                <option value="onemli">⚠️ Önemli</option>
                <option value="acil">🚨 Acil</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>İçerik</label>
            <textarea value={icerik} onChange={e => setIcerik(e.target.value)} required rows={4}
              placeholder="Duyuru metni…"
              style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4a5a7a', cursor: 'pointer' }}>
            <input type="checkbox" checked={sabitli} onChange={e => setSabitli(e.target.checked)} />
            Sayfanın üstüne sabitle
          </label>

          {mesaj && (
            <div style={{ fontSize: '12px', padding: '7px 10px', borderRadius: '7px',
              background: mesaj.startsWith('✓') ? '#f0fbf5' : '#fff0f0',
              color: mesaj.startsWith('✓') ? '#1a5c2e' : '#a01f1f' }}>
              {mesaj}
            </div>
          )}

          <button type="submit" style={{
            padding: '9px', background: '#1a1a6b', color: '#fff', border: 'none',
            borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
            Yayınla
          </button>
        </form>

        {/* Liste */}
        {liste.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liste.map(d => {
              const stil = TUR_ETIKET[d.tur] ?? TUR_ETIKET.bilgi;
              return (
                <div key={d.id} style={{
                  background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '12px',
                  padding: '12px 16px', opacity: d.yayinda ? 1 : 0.55,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                      background: stil.bg, color: stil.renk, flexShrink: 0, marginTop: '2px' }}>
                      {stil.label}
                    </span>
                    {d.sabitli && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                      background: '#f0f0ff', color: '#1a1a6b', flexShrink: 0, marginTop: '2px' }}>📌 Sabit</span>}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a2a4a', flex: 1 }}>{d.baslik}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a5a7a', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{d.icerik}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#9aa0b0', flex: 1 }}>
                      {new Date(d.tarih).toLocaleString('tr-TR')}
                    </span>
                    <button onClick={() => sabitliToggle(d)} style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer',
                      background: d.sabitli ? '#f0f0ff' : '#f5f5f5', color: '#4a5a7a',
                      border: '0.5px solid #d0d8f0',
                    }}>
                      {d.sabitli ? 'Sabiti Kaldır' : 'Sabitle'}
                    </button>
                    <button onClick={() => yayinToggle(d)} style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer',
                      background: d.yayinda ? '#f0fbf5' : '#f5f5f5', color: d.yayinda ? '#1a5c2e' : '#6a7a9a',
                      border: '0.5px solid #d0d8f0',
                    }}>
                      {d.yayinda ? 'Gizle' : 'Yayınla'}
                    </button>
                    <button onClick={() => sil(d.id)} style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer',
                      background: '#fff0f0', color: '#a01f1f', border: '0.5px solid #f5b8b8',
                    }}>
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {liste.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8a9aaa', fontSize: '14px', padding: '3rem 0' }}>
            Henüz duyuru yok.
          </div>
        )}
      </div>
    </div>
  );
}
