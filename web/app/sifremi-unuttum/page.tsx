'use client';
import { useState } from 'react';
import Link from 'next/link';

/**
 * PAROLA SIFIRLAMA İSTEĞİ.
 *
 * Yanıt HER DURUMDA aynı: adres kayıtlı olsun olmasın "kayıtlıysa gönderildi"
 * denir. Sunucu da aynı yanıtı veriyor (bkz. `api/auth/sifre-sifirlama/istek`);
 * ikisi ayrışsaydı istemcinin gösterdiği fark hesap sayımına kapı açardı.
 *
 * Kardeş sayfaların (`/giris`, `/kayit`) biçimi bilerek birebir taklit
 * ediliyor: aynı kap genişliği, aynı alan yüksekliği, aynı çıkış bağlantısı.
 * Bu sayfalar `(site)` grubunun DIŞINDA olduğu için üst menü yok; siteye
 * dönüş bağlantısı o yüzden şart.
 */
export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('');
  const [durum, setDurum] = useState<'bos' | 'gonderiliyor' | 'bitti'>('bos');
  const [hata, setHata] = useState('');
  const [mesaj, setMesaj] = useState('');

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    setDurum('gonderiliyor');
    try {
      const y = await fetch('/api/auth/sifre-sifirlama/istek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const g = await y.json();
      if (!y.ok) {
        setHata(g?.error ?? 'İstek gönderilemedi.');
        setDurum('bos');
        return;
      }
      setMesaj(g?.mesaj ?? 'Bu adres kayıtlıysa sıfırlama bağlantısı gönderildi.');
      setDurum('bitti');
    } catch {
      setHata('Bağlantı kurulamadı. İnternetini kontrol edip yeniden dene.');
      setDurum('bos');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f5f9ff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: '#fff',
        border: '0.5px solid #b8cfe8', borderRadius: '16px', padding: '2rem',
      }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#4a6a8a', textDecoration: 'none', fontSize: '13px',
            fontWeight: 600, marginBottom: '0.75rem', padding: '6px 2px',
          }}
        >
          <span aria-hidden="true">←</span> MediSea
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>🔑</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a6b', margin: 0 }}>Parolanı sıfırla</h1>
          <p style={{ fontSize: '13px', color: '#4a6a8a', marginTop: '8px', lineHeight: 1.5 }}>
            Hesabının e-posta adresini gir; sıfırlama bağlantısını gönderelim.
          </p>
        </div>

        {durum === 'bitti' ? (
          /* role="status": sonuç sessizce belirmesin. `alert` DEĞİL — bu bir
             kesinti değil, beklenen sonuç. */
          <div role="status" style={{
            fontSize: '13px', color: '#1a6640', background: '#f0fbf5',
            border: '0.5px solid #80c898', padding: '12px 14px', borderRadius: '8px', lineHeight: 1.55,
          }}>
            {mesaj}
          </div>
        ) : (
          <form onSubmit={gonder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label htmlFor="unuttum-eposta" style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
                E-posta
              </label>
              <input
                id="unuttum-eposta"
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
                aria-invalid={hata ? true : undefined}
                aria-describedby={hata ? 'unuttum-hata' : undefined}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '16px',
                  border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {hata && (
              <div id="unuttum-hata" role="alert" style={{ fontSize: '13px', color: '#a01f1f', background: '#fff0f0', padding: '8px 12px', borderRadius: '8px' }}>
                {hata}
              </div>
            )}

            <button
              type="submit" disabled={durum === 'gonderiliyor'}
              style={{
                width: '100%', padding: '11px', background: '#1a3a6b', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: durum === 'gonderiliyor' ? 'not-allowed' : 'pointer',
                opacity: durum === 'gonderiliyor' ? 0.7 : 1, marginTop: '4px',
              }}
            >
              {durum === 'gonderiliyor' ? 'Gönderiliyor…' : 'Sıfırlama bağlantısı gönder'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#4a6a8a', marginTop: '1.25rem' }}>
          Parolanı hatırladın mı?{' '}
          <Link href="/giris" style={{ color: '#1a3a6b', fontWeight: 600, textDecoration: 'none', display: 'inline-block', padding: '4px 4px' }}>
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
