'use client';
import { useState } from 'react';

export default function AdminKayseriTipPage() {
  const [dosya, setDosya]             = useState<File | null>(null);
  const [form, setForm]               = useState({ id: '', baslik: '', ders: '', ogretim_uyesi: '', tarih: '', aciklama: '' });
  const [yukleniyor, setYukleniyor]   = useState(false);
  const [mesaj, setMesaj]             = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dosya) { setMesaj('Dosya seçin.'); return; }
    setYukleniyor(true); setMesaj('');

    // 1. Dosya yükle
    const fd = new FormData();
    fd.append('file', dosya);
    const upRes = await fetch('/api/admin/kayseritip/slayt', { method: 'PUT', body: fd });
    const upData = await upRes.json();
    if (!upRes.ok) { setMesaj(upData.error); setYukleniyor(false); return; }

    // 2. Metadata kaydet
    const tip = dosya.name.endsWith('.pdf') ? 'pdf' : 'pptx';
    const metaRes = await fetch('/api/admin/kayseritip/slayt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, dosya: upData.dosya, tip }),
    });
    const metaData = await metaRes.json();
    setYukleniyor(false);
    setMesaj(metaRes.ok ? '✓ Slayt eklendi.' : metaData.error);
    if (metaRes.ok) {
      setForm({ id: '', baslik: '', ders: '', ogretim_uyesi: '', tarih: '', aciklama: '' });
      setDosya(null);
    }
  }

  const input = (label: string, key: string, placeholder = '') => (
    <div>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a5a7a', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input
        value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f9ff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a2a4a', marginBottom: '1.5rem' }}>
          🎓 KayseriTıp — Slayt Ekle
        </h1>

        <form onSubmit={handleSubmit} style={{
          background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '14px',
          padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {/* Dosya seç */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a5a7a', display: 'block', marginBottom: '4px' }}>
              Dosya (PDF veya PPTX)
            </label>
            <input
              type="file" accept=".pdf,.pptx,.ppt"
              onChange={e => setDosya(e.target.files?.[0] ?? null)}
              required
              style={{ fontSize: '13px', width: '100%' }}
            />
            <div style={{ fontSize: '11px', color: '#8a9aaa', marginTop: '4px' }}>
              💡 PDF önerilir — tarayıcıda doğrudan açılır.
            </div>
          </div>

          {input('Slayt ID', 'id', 'ic-hastaliklar-1')}
          {input('Başlık', 'baslik', 'İç Hastalıkları Ders 1')}
          {input('Ders / Ünite', 'ders', 'İç Hastalıkları')}
          {input('Öğretim Üyesi', 'ogretim_uyesi', 'Prof. Dr. ...')}
          {input('Tarih', 'tarih', '2026-01')}

          {mesaj && (
            <div style={{
              fontSize: '13px', padding: '8px 12px', borderRadius: '7px',
              background: mesaj.startsWith('✓') ? '#f0fbf5' : '#fff0f0',
              color: mesaj.startsWith('✓') ? '#1a5c2e' : '#a01f1f',
            }}>
              {mesaj}
            </div>
          )}

          <button
            type="submit" disabled={yukleniyor}
            style={{
              padding: '10px', background: '#1a1a6b', color: '#fff', border: 'none',
              borderRadius: '8px', fontSize: '14px', fontWeight: 600,
              cursor: yukleniyor ? 'not-allowed' : 'pointer', opacity: yukleniyor ? 0.7 : 1,
            }}
          >
            {yukleniyor ? 'Yükleniyor…' : 'Slaytı Ekle'}
          </button>
        </form>
      </div>
    </div>
  );
}
