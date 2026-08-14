/**
 * Premium konu gövdesinin blok işleyicileri.
 *
 * Sayfadan ayrıldılar çünkü konu sayfası içeriği basmadan önce AccessGate'ten
 * geçiyor; blok işleyicileri onun içinde kaldığı sürece render edilen gövdeyi
 * ölçmenin (yazı boyutu, kontrast, dar ekranda taşma) yolu yoktu. Ayrıca
 * sayfa 600 satırdı ve bu kısım kapı/nav mantığıyla hiçbir şey paylaşmıyor.
 *
 * Boyutlar SATIR İÇİ verildiği için `globals.css` sonundaki okuma tabanı
 * buraya ulaşmaz — değerler burada elle korunmak zorunda (bkz. CLAUDE.md,
 * "Satır içi stil bu tabanların hiçbirine uymaz").
 */

import { kalinIsle } from '@/app/lib/metin';

export type MetinSatir = { yil?: string; metin: string };
export type TabloSatir = { renk?: 'kirmizi' | 'yesil' | 'sari' | 'mavi'; hucreler: string[] };

export type IcerikBlok =
  | { tip: 'metin'; baslik?: string; satirlar: MetinSatir[] }
  | { tip: 'tablo'; baslik?: string; kolonlar: string[]; satirlar: TabloSatir[] }
  | { tip: 'bilgi_kutusu'; tur: 'ek_bilgi' | 'uyari' | 'pratik'; metin: string };

const KUTU_STILLLERI = {
  ek_bilgi: {
    arka: '#f0f7ff',
    kenar: '#90b8e0',
    solKenar: '#1a3a6b',
    etiketRenk: '#1a3a6b',
    etiket: 'Ek bilgi',
  },
  uyari: {
    arka: '#fffdf0',
    kenar: '#e8d070',
    solKenar: '#c8960a',
    etiketRenk: '#7a5800',
    etiket: 'Uyarı',
  },
  pratik: {
    arka: '#f0fbf5',
    kenar: '#80c898',
    solKenar: '#1a6640',
    etiketRenk: '#1a6640',
    etiket: 'Pratik not',
  },
};

const TABLO_SATIR_RENKLERI: Record<string, { arka: string; metin: string }> = {
  kirmizi: { arka: '#fff5f5', metin: '#8b1a1a' },
  yesil:   { arka: '#f5fff8', metin: '#1a5c2e' },
  sari:    { arka: '#fffef0', metin: '#7a5800' },
  mavi:    { arka: '#f0f7ff', metin: '#1a3a6b' },
};

const BLOK_BASLIK: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#1a3a6b',
  marginBottom: '0.6rem',
  paddingBottom: '0.3rem',
  borderBottom: '0.5px solid #d0e4f5',
};

function MetinBlok({ blok }: { blok: Extract<IcerikBlok, { tip: 'metin' }> }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {blok.baslik && <h3 style={BLOK_BASLIK}>{blok.baslik}</h3>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {blok.satirlar.map((satir, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {satir.yil && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                background: '#fff6f0',
                color: '#a03000',
                border: '0.5px solid #e8b090',
                borderRadius: '4px',
                padding: '3px 7px',
                whiteSpace: 'nowrap',
                marginTop: '2px',
                flexShrink: 0,
              }}>
                {satir.yil}
              </span>
            )}
            <p style={{ fontSize: '15px', lineHeight: 1.7, margin: 0, color: '#1a2a3a' }}>
              {kalinIsle(satir.metin)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabloBlok({ blok }: { blok: Extract<IcerikBlok, { tip: 'tablo' }> }) {
  /**
   * Sarmalayıcı `overflow: hidden` idi ve tablo `width: 100%` taşıyordu:
   * telefonda kolonlar okunmaz genişliğe sıkışıyordu (4 kolonlu bir tabloda
   * hücre başına ~78px). Artık dar ekranda tablo kendi genişliğini koruyup
   * yatay kayıyor; kaydırma sayfa gövdesine değil bu kutuya ait.
   */
  const enAzKolonGenisligi = 110;
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {blok.baslik && <h3 style={BLOK_BASLIK}>{blok.baslik}</h3>}
      <div style={{
        border: '0.5px solid #b8cfe8',
        borderRadius: '8px',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        <table style={{
          width: '100%',
          minWidth: `${blok.kolonlar.length * enAzKolonGenisligi}px`,
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ background: '#f0f7ff' }}>
              {blok.kolonlar.map((kolon, i) => (
                <th key={i} style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#1a3a6b',
                  fontSize: '12px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                  borderBottom: '0.5px solid #b8cfe8',
                }}>
                  {kolon}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blok.satirlar.map((satir, i) => {
              const renkStil = satir.renk ? TABLO_SATIR_RENKLERI[satir.renk] : null;
              return (
                <tr key={i} style={{
                  background: renkStil ? renkStil.arka : (i % 2 === 0 ? '#fff' : '#fafcff'),
                  borderBottom: '0.5px solid #e8f0f8',
                }}>
                  {satir.hucreler.map((hucre, j) => (
                    <td key={j} style={{
                      padding: '8px 12px',
                      verticalAlign: 'top',
                      color: (j === 0 && renkStil) ? renkStil.metin : '#1a2a3a',
                      fontWeight: j === 0 ? 500 : 400,
                      lineHeight: 1.5,
                    }}>
                      {kalinIsle(hucre)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BilgiKutusu({ blok }: { blok: Extract<IcerikBlok, { tip: 'bilgi_kutusu' }> }) {
  const stil = KUTU_STILLLERI[blok.tur];
  return (
    <div style={{
      background: stil.arka,
      border: `0.5px solid ${stil.kenar}`,
      borderLeft: `3px solid ${stil.solKenar}`,
      borderRadius: '0 8px 8px 0',
      padding: '0.8rem 1rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: stil.etiketRenk,
        marginBottom: '4px',
      }}>
        {stil.etiket}
      </div>
      <p style={{ fontSize: '15px', lineHeight: 1.6, margin: 0, color: '#1a2a3a' }}>
        {kalinIsle(blok.metin)}
      </p>
    </div>
  );
}

export default function IcerikRenderer({ bloklar }: { bloklar: IcerikBlok[] }) {
  return (
    <>
      {bloklar.map((blok, i) => {
        if (blok.tip === 'metin')        return <MetinBlok key={i} blok={blok} />;
        if (blok.tip === 'tablo')        return <TabloBlok key={i} blok={blok} />;
        if (blok.tip === 'bilgi_kutusu') return <BilgiKutusu key={i} blok={blok} />;
        return null;
      })}
    </>
  );
}
