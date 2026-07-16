'use client';
import { useState } from 'react';

interface Dosya {
  id: string;
  baslik: string;
  aciklama?: string;
  yukleyenAd: string;
  tarih: string;
  dosya: string;
  tip: 'pdf' | 'pptx' | 'diger';
}

interface Props {
  stajId: string;
  alanId: string;
  baslangicDosyalar: Dosya[];
  yukleyebilir: boolean;
}

const TIP_EMOJI: Record<string, string> = {
  pdf: '📄', pptx: '📊', diger: '📎',
};

const TIP_STIL: Record<string, { bg: string; color: string }> = {
  pdf:   { bg: '#fff0f0', color: '#8b1a1a' },
  pptx:  { bg: '#fff4e6', color: '#7a3800' },
  diger: { bg: '#f0f0ff', color: '#3a1a8b' },
};

export default function AlanClient({ stajId, alanId, baslangicDosyalar, yukleyebilir }: Props) {
  const [dosyalar, setDosyalar] = useState<Dosya[]>(baslangicDosyalar);
  const [yuklemePaneli, setYuklemePaneli] = useState(false);
  const [seciliDosya, setSeciliDosya] = useState<File | null>(null);
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState('');

  async function yukle(e: React.FormEvent) {
    e.preventDefault();
    if (!seciliDosya || !baslik) return;
    setYukleniyor(true); setMesaj('');

    const fd = new FormData();
    fd.append('file', seciliDosya);
    fd.append('stajId', stajId);
    fd.append('alanId', alanId);
    fd.append('baslik', baslik);
    fd.append('aciklama', aciklama);

    const res = await fetch('/api/kayseritip/yukle', { method: 'POST', body: fd });
    const data = await res.json();
    setYukleniyor(false);

    if (res.ok) {
      setDosyalar(prev => [data.dosya, ...prev]);
      setMesaj('✓ Dosya yüklendi.');
      setBaslik(''); setAciklama(''); setSeciliDosya(null);
      setTimeout(() => { setMesaj(''); setYuklemePaneli(false); }, 2000);
    } else {
      setMesaj(data.error ?? 'Yükleme başarısız.');
    }
  }

  return (
    <div>
      {/* Yükleme butonu — sadece yetkili kullanıcılara */}
      {yukleyebilir && <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setYuklemePaneli(v => !v)}
          style={{
            fontSize: '13px', fontWeight: 600, padding: '8px 16px',
            background: yuklemePaneli ? '#f0f0ff' : '#1a1a6b',
            color: yuklemePaneli ? '#1a1a6b' : '#fff',
            border: '0.5px solid #c0c8e8', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          {yuklemePaneli ? '✕ İptal' : '⬆ Dosya Yükle'}
        </button>
      </div>}

      {/* Yükleme formu */}
      {yuklemePaneli && (
        <form onSubmit={yukle} style={{
          background: '#fff', border: '0.5px solid #c0c8e8', borderRadius: '12px',
          padding: '1.25rem', marginBottom: '1.25rem',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a2a4a', marginBottom: '2px' }}>
            Yeni Dosya Ekle
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>
              Dosya (PDF, PPTX)
            </label>
            <input type="file" accept=".pdf,.pptx,.ppt,.doc,.docx"
              onChange={e => setSeciliDosya(e.target.files?.[0] ?? null)}
              required style={{ fontSize: '13px', width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>Başlık</label>
            <input value={baslik} onChange={e => setBaslik(e.target.value)} required
              placeholder="ör. Kronik Böbrek Hastalığı Slaytı"
              style={{ width: '100%', padding: '8px 11px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6a7a9a', display: 'block', marginBottom: '3px' }}>Açıklama (isteğe bağlı)</label>
            <input value={aciklama} onChange={e => setAciklama(e.target.value)}
              placeholder="Kısa not"
              style={{ width: '100%', padding: '8px 11px', fontSize: '13px', border: '0.5px solid #c0c8e8', borderRadius: '7px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {mesaj && (
            <div style={{ fontSize: '12px', padding: '7px 11px', borderRadius: '7px',
              background: mesaj.startsWith('✓') ? '#f0fbf5' : '#fff0f0',
              color: mesaj.startsWith('✓') ? '#1a5c2e' : '#a01f1f' }}>
              {mesaj}
            </div>
          )}

          <button type="submit" disabled={yukleniyor}
            style={{ padding: '9px', background: '#1a1a6b', color: '#fff', border: 'none',
              borderRadius: '7px', fontSize: '13px', fontWeight: 600,
              cursor: yukleniyor ? 'not-allowed' : 'pointer', opacity: yukleniyor ? 0.7 : 1 }}>
            {yukleniyor ? 'Yükleniyor…' : 'Yükle'}
          </button>
        </form>
      )}

      {/* Dosya listesi */}
      {dosyalar.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#8a9aaa', fontSize: '14px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
          Bu alana henüz dosya yüklenmemiş.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dosyalar.map((d) => {
            const stil = TIP_STIL[d.tip] ?? TIP_STIL.diger;
            return (
              <a key={d.id} href={`/api/kayseritip/dosya/${d.dosya}`} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '11px',
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{ fontSize: '26px', flexShrink: 0 }}>{TIP_EMOJI[d.tip] ?? '📎'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a2a4a', marginBottom: '2px' }}>{d.baslik}</div>
                    <div style={{ fontSize: '11px', color: '#8a9aaa' }}>
                      {d.yukleyenAd} · {new Date(d.tarih).toLocaleDateString('tr-TR')}
                      {d.aciklama ? ` · ${d.aciklama}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                    background: stil.bg, color: stil.color, flexShrink: 0 }}>
                    {d.tip.toUpperCase()}
                  </span>
                  <span style={{ color: '#b0b8d0', fontSize: '16px', flexShrink: 0 }}>↗</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
