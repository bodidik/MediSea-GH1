'use client';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/* Sorguya bağlı TEK parça bu. Ayrı bir bileşen, çünkü `useSearchParams()`
   kullanan alt ağacı Next sunucuda HİÇ üretmiyor — yalnızca fallback
   gönderiyor. Bütün sayfa tek bir Suspense'in içindeyken sunucudan gelen
   HTML boştu: giriş formunun tamamı ve `<h1>` yoktu (ölçüldü: canlıda
   /giris'te 0 başlık, kardeşi /kayit'ta 1). Sınır artık yalnızca bu uyarıyı
   sarıyor; form ve başlık sunucuda basılıyor. */
function GirisUyarisi() {
  const gerekli = useSearchParams().get('gerekli');
  const uyari =
    gerekli === 'premium'   ? 'Bu alana erişmek için Premium üyelik gereklidir.' :
    gerekli === 'kayseritip'? 'Bu alan yalnızca KayseriTıp üyelerine açıktır.' :
    null;
  if (!uyari) return null;
  return (
    <div style={{
      background: '#fff8e6', border: '0.5px solid #f0d080', borderRadius: '8px',
      padding: '10px 14px', fontSize: '13px', color: '#7a4a00', marginBottom: '1rem',
    }}>
      ⚠️ {uyari}
    </div>
  );
}

function GirisFormu() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

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
        {/*
          SİTEYE DÖNÜŞ. Ölçüldü: bu sayfada tek bağlantı vardı ve o da
          kardeş kimlik sayfasına gidiyordu — /giris ↔ /kayit ↔ /uyelik
          arasında dönüp duran, kütüphaneye yolu OLMAYAN bir çıkmaz.
          Aynı kusur premium giriş sayfasında ölçülüp düzeltilmişti
          (görünür bağlantı 0 → 10); bu üç sayfa o turun dışında kalmış.

          Bu sayfalar `(site)` grubunun DIŞINDA, yani üst menü ve alt bilgi
          BİLEREK yok (odaklanmış yüzey). Çıkış yolu ise şart.

          Genişlikten bağımsız görünür: premium turunda `hidden sm:inline`
          verilmiş ve mobilde çıkış yeniden kaybolmuştu.
        */}
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#4a6a8a', textDecoration: 'none', fontSize: '13px',
            fontWeight: 600, marginBottom: '0.75rem',
            // 24px dokunma hedefi: dolgusuz hâli 20px ölçüldü (WCAG asgarisi 24).
            padding: '6px 2px',
          }}
        >
          <span aria-hidden="true">←</span> MediSea
        </Link>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>🩺</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a6b', margin: 0 }}>MediSea'ya Giriş</h1>
        </div>

        <Suspense fallback={null}>
          <GirisUyarisi />
        </Suspense>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* htmlFor + id: etiketler vardı ama alana BAĞLI değildi; ölçümde
              iki alanın da erişilebilir adı yoktu. */}
          <div>
            <label htmlFor="giris-eposta" style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
              E-posta
            </label>
            <input
              id="giris-eposta"
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email"
              aria-invalid={hata ? true : undefined}
              aria-describedby={hata ? 'giris-hata' : undefined}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label htmlFor="giris-sifre" style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}>
              Şifre
            </label>
            <input
              id="giris-sifre"
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password"
              aria-invalid={hata ? true : undefined}
              aria-describedby={hata ? 'giris-hata' : undefined}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* role="alert": "E-posta veya şifre hatalı." sessizce beliriyordu.
 *
              aria-describedby ile alanlara BAĞLANDI: `aria-invalid` alanın
              bozuk olduğunu söylüyor ama nedenini söylemiyor. Alert bir kez
              duyuruluyor; kullanıcı alana geri dönerse yalnızca "geçersiz"
              duyuyordu. Bağ hata YOKKEN verilmiyor — olmayan bir kimliğe
              işaret etmek sessiz kusurdur. */}
          {hata && (
            <div id="giris-hata" role="alert" style={{ fontSize: '13px', color: '#a01f1f', background: '#fff0f0', padding: '8px 12px', borderRadius: '8px' }}>
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

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#4a6a8a', marginTop: '1.25rem' }}>
          Hesabın yok mu?{' '}
          <Link href="/kayit" style={{ color: '#1a3a6b', fontWeight: 600, textDecoration: 'none', display: 'inline-block', padding: '4px 4px' }}>
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function GirisPage() {
  return <GirisFormu />;
}
