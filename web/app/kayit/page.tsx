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

    /**
     * OTOMATİK GİRİŞİN SONUCU ARTIK KONTROL EDİLİYOR.
     *
     * Bir dönem `await signIn(...)` çağrılıp dönen değer ATILIYORDU ve her
     * durumda `/`'a gidiliyordu. Kayıt BAŞARILI olup otomatik giriş
     * başarısız olursa (ağ kesintisi, çerezin yazılamaması) kullanıcı ana
     * sayfaya OTURUMSUZ düşüyordu — az önce kayıt formunu doldurmuşken.
     *
     * Asıl zarar ikinci adımda: kullanıcı kaydın olmadığını sanıp yeniden
     * deniyor ve bu kez "Bu e-posta adresi zaten kayıtlı." ile karşılaşıyor.
     * Çıkmaz sokak — üstelik hesabı gerçekten VAR.
     *
     * Bu, depodaki "uydurulmuş bir başarı, çağıranın üstüne kod yazdığı
     * yanlış bir varsayım üretir" kuralının arayüz tarafındaki hâli:
     * sessizce başarı varsaymak yerine ne olduğunu ve ne yapılacağını söyle.
     * Sayfanın altındaki "Giriş yap" bağlantısı çıkış yolunu zaten veriyor.
     */
    const giris = await signIn('credentials', {
      email: form.email, password: form.password, redirect: false,
    });
    if (giris?.error) {
      setHata('Hesabın oluşturuldu ama otomatik giriş yapılamadı. Aşağıdaki "Giriş yap" bağlantısından e-posta ve şifrenle giriş yapabilirsin.');
      setYukleniyor(false);
      return;
    }
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
          <div aria-hidden="true" style={{ fontSize: '28px', marginBottom: '8px' }}>🩺</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a6b', margin: 0 }}>Hesap Oluştur</h1>
          {/*
            Eskiden burada "1 ay ücretsiz, sonrasında düşük aylık ücret"
            yazıyordu — tam dönüşüm anında, hiçbir karşılığı olmayan bir
            fiyat vaadi. Ölçüldü: projede ödeme sağlayıcısı entegrasyonu
            YOK (web ve server'da arandı, sıfır sonuç), çalışan bir
            yükseltme akışı yok ve /uyelik sayfası hiçbir aylık ücretten
            söz etmiyor. Yani iki yüzey birbiriyle de çelişiyordu.

            Yerine hesabın BUGÜN gerçekten sağladığı şey yazıldı. Fiyat ya
            da koşul uydurulmadı; ikisi de henüz kararlaştırılmadı.
          */}
          <p style={{ fontSize: '13px', color: '#4a6a8a', marginTop: '6px' }}>
            Vurguların ve notların hesabına kaydedilir, cihazların arasında taşınır.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* htmlFor + id: etiketler görsel olarak duruyordu ama alana BAĞLI
              değildi; ölçümde üç alanın da erişilebilir adı yoktu. Ekran
              okuyucu "düzenleme alanı" deyip geçiyordu — kayıt, ödeme
              hattının kapısı. */}
          {(['name', 'email', 'password'] as const).map((k) => (
            <div key={k}>
              <label
                htmlFor={`kayit-${k}`}
                style={{ fontSize: '12px', fontWeight: 600, color: '#4a6a8a', display: 'block', marginBottom: '4px' }}
              >
                {k === 'name' ? 'Ad Soyad' : k === 'email' ? 'E-posta' : 'Şifre'}
              </label>
              <input
                id={`kayit-${k}`}
                type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
                value={form[k]} onChange={set(k)} required
                autoComplete={k === 'password' ? 'new-password' : k}
                aria-invalid={hata ? true : undefined}
                aria-describedby={hata ? 'kayit-hata' : undefined}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '14px',
                  border: '0.5px solid #b8cfe8', borderRadius: '8px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          {/* role="alert": hata mesajı sessizce beliriyordu. `alert` sonradan
              DOM'a eklenince duyurulur, bu yüzden koşullu basılması sorun
              değil (role="status"tan farkı bu).
 *
              aria-describedby ile alanlara BAĞLANDI: `aria-invalid` alanın
              bozuk olduğunu söylüyor ama nedenini söylemiyor. Alert bir kez
              duyuruluyor; kullanıcı alana geri dönerse yalnızca "geçersiz"
              duyuyordu. Bağ hata YOKKEN verilmiyor — olmayan bir kimliğe
              işaret etmek sessiz kusurdur. */}
          {hata && (
            <div id="kayit-hata" role="alert" style={{ fontSize: '13px', color: '#a01f1f', background: '#fff0f0', padding: '8px 12px', borderRadius: '8px' }}>
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

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#4a6a8a', marginTop: '1.25rem' }}>
          Hesabın var mı?{' '}
          <Link href="/giris" style={{ color: '#1a3a6b', fontWeight: 600, textDecoration: 'none', display: 'inline-block', padding: '4px 4px' }}>
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
