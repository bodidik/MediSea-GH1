'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SIFRE_KISA_MESAJ, SIFRE_MIN } from '@/app/lib/kimlik';

/**
 * YENİ PAROLA.
 *
 * Jeton SORGUDA, o yüzden `useSearchParams()` kullanan parça AYRI bir
 * bileşen: `/giris`te ölçülmüş kayıtlı tuzak — bütün sayfa tek bir
 * `Suspense` içindeyken sunucu HTML'i boş geliyor ve `<h1>` hiç basılmıyor.
 * Başlık ve kap dışarıda kalıyor; yalnızca forma sarmalanıyor.
 *
 * Parola kuralı `@/app/lib/kimlik`ten: sunucu da aynı sabiti kullanıyor.
 * Ayrı yazılsalardı istemci "geçerli" der, sunucu reddederdi.
 */
function SifirlamaFormu() {
  const jeton = useSearchParams().get('jeton') ?? '';
  const router = useRouter();
  const [sifre, setSifre] = useState('');
  const [sifre2, setSifre2] = useState('');
  const [hata, setHata] = useState('');
  const [durum, setDurum] = useState<'bos' | 'gonderiliyor' | 'bitti'>('bos');

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    if (sifre.length < SIFRE_MIN) { setHata(SIFRE_KISA_MESAJ); return; }
    if (sifre !== sifre2) { setHata('Parolalar aynı değil.'); return; }

    setDurum('gonderiliyor');
    try {
      const y = await fetch('/api/auth/sifre-sifirlama/uygula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jeton, sifre }),
      });
      const g = await y.json();
      if (!y.ok) { setHata(g?.error ?? 'Parola değiştirilemedi.'); setDurum('bos'); return; }
      setDurum('bitti');
      /* Oturum açtırmıyoruz: yeni parolayı bir kez kullanmak, kullanıcının
         onu gerçekten kaydettiğini doğruluyor. */
      setTimeout(() => router.push('/giris'), 2200);
    } catch {
      setHata('Bağlantı kurulamadı. İnternetini kontrol edip yeniden dene.');
      setDurum('bos');
    }
  }

  if (!jeton) {
    return (
      <div role="alert" style={{
        fontSize: '13px', color: '#a01f1f', background: '#fff0f0',
        border: '0.5px solid #e08080', padding: '12px 14px', borderRadius: '8px', lineHeight: 1.55,
      }}>
        Bu adreste sıfırlama bağlantısı yok. E-postandaki bağlantıyı kullan ya da{' '}
        <Link href="/sifremi-unuttum" style={{ color: '#a01f1f', fontWeight: 700 }}>yeni bir bağlantı iste</Link>.
      </div>
    );
  }

  if (durum === 'bitti') {
    return (
      <div role="status" style={{
        fontSize: '13px', color: '#1a6640', background: '#f0fbf5',
        border: '0.5px solid #80c898', padding: '12px 14px', borderRadius: '8px', lineHeight: 1.55,
      }}>
        Parolan değiştirildi. Giriş sayfasına yönlendiriliyorsun…
      </div>
    );
  }

  return (
    <form onSubmit={gonder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label htmlFor="yeni-sifre" style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
          Yeni parola
        </label>
        <input
          id="yeni-sifre" type="password" value={sifre} onChange={e => setSifre(e.target.value)}
          required autoComplete="new-password" minLength={SIFRE_MIN}
          aria-invalid={hata ? true : undefined}
          aria-describedby={hata ? 'sifirla-hata' : 'sifirla-kural'}
          style={{
            width: '100%', padding: '10px 12px', fontSize: '16px',
            border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <p id="sifirla-kural" style={{ fontSize: '11px', color: '#4a6a8a', marginTop: '4px' }}>
          En az {SIFRE_MIN} karakter.
        </p>
      </div>

      <div>
        <label htmlFor="yeni-sifre-2" style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
          Yeni parola (tekrar)
        </label>
        <input
          id="yeni-sifre-2" type="password" value={sifre2} onChange={e => setSifre2(e.target.value)}
          required autoComplete="new-password" minLength={SIFRE_MIN}
          aria-invalid={hata ? true : undefined}
          aria-describedby={hata ? 'sifirla-hata' : undefined}
          style={{
            width: '100%', padding: '10px 12px', fontSize: '16px',
            border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {hata && (
        <div id="sifirla-hata" role="alert" style={{ fontSize: '13px', color: '#a01f1f', background: '#fff0f0', padding: '8px 12px', borderRadius: '8px' }}>
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
        {durum === 'gonderiliyor' ? 'Kaydediliyor…' : 'Parolayı değiştir'}
      </button>
    </form>
  );
}

export default function SifreSifirlaPage() {
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
          <div aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>🔐</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a6b', margin: 0 }}>Yeni parola belirle</h1>
        </div>

        <Suspense fallback={null}>
          <SifirlamaFormu />
        </Suspense>
      </div>
    </div>
  );
}
