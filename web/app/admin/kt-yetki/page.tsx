'use client';
import { useEffect, useState } from 'react';

const ALANLAR = [
  'ic-hastaliklari-donem4/genel-dahiliye',
  'ic-hastaliklari-donem4/gastroenteroloji',
  'ic-hastaliklari-donem4/romatoloji',
  'ic-hastaliklari-donem4/onkoloji',
  'ic-hastaliklari-donem4/yogun-bakim',
  'ic-hastaliklari-donem4/geriatri',
  'ic-hastaliklari-donem4/nefroloji',
  'ic-hastaliklari-donem4/hematoloji',
  'ic-hastaliklari-donem4/endokrinoloji',
];

const ALAN_ETIKET: Record<string, string> = {
  'ic-hastaliklari-donem4/genel-dahiliye':   'Genel Dahiliye',
  'ic-hastaliklari-donem4/gastroenteroloji': 'Gastroenteroloji',
  'ic-hastaliklari-donem4/romatoloji':       'Romatoloji',
  'ic-hastaliklari-donem4/onkoloji':         'Onkoloji',
  'ic-hastaliklari-donem4/yogun-bakim':      'Yoğun Bakım',
  'ic-hastaliklari-donem4/geriatri':         'Geriatri',
  'ic-hastaliklari-donem4/nefroloji':        'Nefroloji',
  'ic-hastaliklari-donem4/hematoloji':       'Hematoloji',
  'ic-hastaliklari-donem4/endokrinoloji':    'Endokrinoloji',
};

const ROL_ETIKET: Record<string, string> = {
  ogrenci:            '👨‍🎓 Öğrenci',
  ogretim_gorevlisi:  '👨‍🏫 Öğretim Görevlisi',
  kt_admin:           '🔑 KT Admin',
};

interface Yetki { email: string; rol: string; alanlar: string[]; notlar?: string; }

export default function KtYetkiPage() {
  const [liste, setListe]           = useState<Yetki[]>([]);
  const [email, setEmail]           = useState('');
  const [rol, setRol]               = useState('ogrenci');
  const [seciliAlanlar, setSecili]  = useState<string[]>([]);
  const [notlar, setNotlar]         = useState('');
  const [mesaj, setMesaj]           = useState('');

  useEffect(() => { yukle(); }, []);

  async function yukle() {
    const r = await fetch('/api/admin/kt-yetki');
    const d = await r.json();
    setListe(d.liste ?? []);
  }

  function alanToggle(alan: string) {
    setSecili(prev => prev.includes(alan) ? prev.filter(a => a !== alan) : [...prev, alan]);
  }

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setMesaj('');
    const res = await fetch('/api/admin/kt-yetki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, rol, alanlar: seciliAlanlar, notlar }),
    });
    if (res.ok) {
      setMesaj('✓ Kaydedildi');
      setEmail(''); setRol('ogrenci'); setSecili([]); setNotlar('');
      yukle();
    } else {
      const d = await res.json();
      setMesaj(d.error ?? 'Hata');
    }
  }

  async function sil(email: string) {
    await fetch('/api/admin/kt-yetki', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    yukle();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f9ff', fontFamily: 'system-ui, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a2a4a', marginBottom: '1.5rem' }}>
          🎓 KayseriTıp — Yetki Yönetimi
        </h1>

        {/* Form */}
        <form onSubmit={kaydet} style={{
          background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '14px',
          padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a2a4a' }}>Yeni Yetki Ekle / Güncelle</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>E-posta</label>
              <input value={email} onChange={e => setEmail(e.target.value)} required type="email"
                placeholder="kullanici@erciyes.edu.tr"
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>Rol</label>
              <select value={rol} onChange={e => { setRol(e.target.value); if (e.target.value !== 'ogretim_gorevlisi') setSecili([]); }}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', background: '#fff' }}>
                <option value="ogrenci">👨‍🎓 Öğrenci</option>
                <option value="ogretim_gorevlisi">👨‍🏫 Öğretim Görevlisi</option>
                <option value="kt_admin">🔑 KT Admin</option>
              </select>
            </div>
          </div>

          {/* Alan seçimi — sadece ogretim_gorevlisi */}
          {rol === 'ogretim_gorevlisi' && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '6px' }}>
                Yetkili Olduğu Alanlar
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ALANLAR.map(alan => (
                  <button key={alan} type="button" onClick={() => alanToggle(alan)}
                    style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
                      border: '0.5px solid',
                      background: seciliAlanlar.includes(alan) ? '#1a1a6b' : '#f0f0ff',
                      color:      seciliAlanlar.includes(alan) ? '#fff'     : '#1a1a6b',
                      borderColor: seciliAlanlar.includes(alan) ? '#1a1a6b' : '#c0c8e8',
                    }}>
                    {ALAN_ETIKET[alan]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>Not (isteğe bağlı)</label>
            <input value={notlar} onChange={e => setNotlar(e.target.value)} placeholder="Unvan veya görev"
              style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

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
            Kaydet
          </button>
        </form>

        {/* Mevcut yetkiler */}
        {liste.length > 0 && (
          <div style={{ border: '0.5px solid #d0d8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            {liste.map((y, i) => (
              <div key={y.email} style={{
                padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px',
                borderBottom: i < liste.length - 1 ? '0.5px solid #f0f4f8' : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a2a4a' }}>{y.email}</div>
                  <div style={{ fontSize: '11px', color: '#6a7a9a', marginTop: '2px' }}>
                    {ROL_ETIKET[y.rol] ?? y.rol}
                    {y.notlar ? ` · ${y.notlar}` : ''}
                  </div>
                  {y.alanlar?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px' }}>
                      {y.alanlar.map(a => (
                        <span key={a} style={{ fontSize: '10px', padding: '2px 7px', background: '#f0f0ff', color: '#1a1a6b', borderRadius: '4px', border: '0.5px solid #c0c8e8' }}>
                          {ALAN_ETIKET[a] ?? a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => sil(y.email)} style={{
                  fontSize: '11px', padding: '4px 8px', background: '#fff0f0', color: '#a01f1f',
                  border: '0.5px solid #f5b8b8', borderRadius: '5px', cursor: 'pointer',
                }}>
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
