'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setHata(data.error ?? 'Kayıt başarısız.');
      setYukleniyor(false);
      return;
    }

    // Kayıt başarılı → otomatik giriş
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/');
    router.refresh();
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
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a6b', margin: 0 }}>Hesap Oluştur</h1>
          <p style={{ fontSize: '13px', color: '#6a8aaa', marginTop: '6px' }}>1 ay ücretsiz, sonrasında düşük aylık ücret</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(['name', 'email', 'password'] as const).map((k) => (
            <div key={k}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
                {k === 'name' ? 'Ad Soyad' : k === 'email' ? 'E-posta' : 'Şifre'}
              </label>
              <input
                type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
                value={form[k]} onChange={set(k)} required
                autoComplete={k === 'password' ? 'new-password' : k}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '14px',
                  border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

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
            {yukleniyor ? 'Kayıt yapılıyor…' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6a8aaa', marginTop: '1.25rem' }}>
          Hesabın var mı?{' '}
          <Link href="/giris" style={{ color: '#1a3a6b', fontWeight: 600, textDecoration: 'none' }}>
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
