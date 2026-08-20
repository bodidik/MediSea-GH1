import Link from 'next/link';

/**
 * Premium motor segmentlerinin 404'ü.
 *
 * Kapsam boşluğu ölçüldü: premium altında `notFound()` çağıran DÖRT yer var
 * (`hizli-tekrar`, `soru-cozum`, `[branch]`, `[branch]/[topic]`) ama
 * `not-found.tsx` yalnızca `[branch]/` altında duruyordu. O sınır kendi
 * segmentini ve altını kapsıyor; motorlar ise onun KARDEŞİ, yani köke
 * düşüyorlardı.
 *
 * Sonuç ölçüldü — ücretli yüzeyde kaybolan kullanıcı ücretsiz kütüphanenin
 * 404'üne iniyordu: 16 bağlantı vardı ve HİÇBİRİ premium'a dönmüyordu.
 * Teknik olarak çıkmaz değil ama insanın parasını verdiği ürünün dışına
 * atılması "çıkış yolu ver" kuralının ruhuna aykırı.
 *
 * Adres `/tr` ile sabit: `not-found.tsx` params ALAMIYOR, yani `[lang]`
 * buradan okunamıyor. Kardeş dosya (`[branch]/not-found.tsx`) aynı ödünü
 * veriyor; tek dil kullanımda olduğu için kaybı yok.
 *
 * Landmark verilmiyor: `(ydus)/layout.tsx` zaten `<main>` basıyor. Burada
 * bir tane daha açmak belgede İKİ main landmark'ı oluştururdu.
 *
 * Satır içi stil, çevresindeki premium yüzeylerin biçimi.
 */
export default function PremiumBulunamadi() {
  return (
    <div style={{
      minHeight: '80vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '1rem' }} aria-hidden="true">🧭</div>
      <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.5rem' }}>
        Bu çalışma bulunamadı
      </h1>
      <p style={{ color: '#4a6a8a', marginBottom: '1.5rem', fontSize: '15px', maxWidth: '30rem', lineHeight: 1.7 }}>
        Aradığın soru seti, kart destesi ya da vaka kaldırılmış veya adresi
        değişmiş olabilir. Konunun sayfasından güncel çalışmalara ulaşabilirsin.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        <Link href="/tr/premium/ydus" style={{
          padding: '10px 20px',
          background: '#1a3a6b',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          YDUS ana sayfası
        </Link>
        <Link href="/tr/premium/ydus/profil" style={{
          padding: '10px 20px',
          border: '1px solid #b8cfe8',
          color: '#1a3a6b',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          Çalışma geçmişim
        </Link>
      </div>
    </div>
  );
}
