import Link from 'next/link';

/**
 * Var olmayan premium branş adresi.
 *
 * Sayfa daha önce bu kartı DOĞRUDAN basıyordu ve HTTP durumu 200 kalıyordu —
 * yani "yumuşak 404". Ölçüldü: /tr/premium/ydus/olmayan-brans 200 dönüyordu,
 * oysa aynı hata sınıfında konu sayfaları (hem açık hem premium) düzgün
 * `notFound()` çağırıyor. Branş sayfası tek aykırıydı.
 *
 * Kart buraya taşındı: durum kodu artık 404, görünüm aynı kaldı. Branş adı
 * metinde geçmiyor çünkü not-found dosyası params alamıyor — kaybı küçük,
 * kazancı doğru durum kodu.
 */
export default function BransBulunamadi() {
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
    }}>
      <div style={{ fontSize: '48px', marginBottom: '1rem' }} aria-hidden="true">🧭</div>
      <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.5rem' }}>
        Branş bulunamadı
      </h1>
      <p style={{ color: '#4a6a8a', marginBottom: '1.5rem', fontSize: '14px', textAlign: 'center' }}>
        Aradığın branş için henüz içerik hazırlanmadı.
      </p>
      <Link href="/tr/premium/ydus" style={{
        display: 'inline-block',
        padding: '10px 20px',
        background: '#1a3a6b',
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
      }}>
        YDUS ana sayfasına dön
      </Link>
    </div>
  );
}
