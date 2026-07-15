'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function GirisPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const gerekli = params.get('gerekli');
  const uyari =
    gerekli === 'premium'   ? 'Bu alana erişmek için Premium üyelik gereklidir.' :
    gerekli === 'kayseritip'? 'Bu alan yalnızca KayseriTıp üyelerine açıktır.' :
    null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    const res = await signIn('credentials', {
      email, password, redirect: false,
    });
    setYukleniyor(false);
    if (res?.error) {
      setHata('E-posta veya şifre hatalı.');
    } else {
      router.push('/');
      router.refresh();
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
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🩺</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a6b', margin: 0 }}>MediSea'ya Giriş</h1>
        </div>

        {uyari && (
          <div style={{
            background: '#fff8e6', border: '0.5px solid #f0d080', borderRadius: '8px',
            padding: '10px 14px', fontSize: '13px', color: '#7a4a00', marginBottom: '1rem',
          }}>
            ⚠️ {uyari}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
              E-posta
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email"
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
              Şifre
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {hata && (
            <div style={{ fontSize: '13px', color: '#a01f1f', background: '#fff0f0', padding: '8px 12px', borderRadius: '8px' }}>
              {hata}
            </div>
          )}

          <button
            type="submit" disabled={yukleniyor}
            style={{
              width: '100%', padding: '11px', background: '#1a3a6b', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
              cursor: yukleniyor ? 'not-allowed' : 'pointer', opacity: yukleniyor ? 0.7 : 1,
              marginTop: '4px',
            }}
          >
            {yukleniyor ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6a8aaa', marginTop: '1.25rem' }}>
          Hesabın yok mu?{' '}
          <Link href="/kayit" style={{ color: '#1a3a6b', fontWeight: 600, textDecoration: 'none' }}>
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
