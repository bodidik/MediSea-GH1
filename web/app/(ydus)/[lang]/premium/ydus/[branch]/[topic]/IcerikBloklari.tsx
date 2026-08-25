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
import { bolumKimlikleri } from '@/app/lib/baslik';

export type MetinSatir = { yil?: string; metin: string };
export type TabloSatir = { renk?: 'kirmizi' | 'yesil' | 'sari' | 'mavi'; hucreler: string[] };

export type IcerikBlok =
  | { tip: 'metin'; baslik?: string; satirlar: MetinSatir[] }
  | { tip: 'tablo'; baslik?: string; kolonlar: string[]; satirlar: TabloSatir[] }
  /**
   * `baslik` TİPTE YOKTU ve render de onu görmüyordu — veri onu taşıdığı hâlde.
   *
   * ÖLÇÜLDÜ: 41 premium konuda 174 bilgi kutusu var, 6'sı `baslik` taşıyor ve
   * ALTISI DA EKRANA HİÇ BASILMIYORDU. Kutu yalnızca türünün genel etiketini
   * ("Uyarı", "Ek bilgi", "Pratik") gösterip doğrudan gövdeye giriyordu.
   *
   * Kayıp gerçek: altı başlığın hiçbiri gövde metninde tekrarlanmıyor
   * (tek tek ölçüldü). Kaybolanlar arasında
   * "Adım 3 — Beta-Blokörde Hayati Kural: Önce Alfa!" ve
   * "Rebound Hipoglisemi: Hayatı Tehdit Eden Komplikasyon" gibi klinik olarak
   * en sivri satırlar vardı; okuyucu kutunun NE HAKKINDA olduğunu göremiyordu.
   *
   * Bu, deponun "ilan ile gerçek ayrışıyor" sınıfının içerik tarafındaki hâli:
   * veri bir alan beyan ediyor, render onu yok sayıyor ve hiçbir kapı görmüyor
   * — üstelik tip tanımı alanı hiç bilmediği için `tsc` de sessiz kalıyordu.
   */
  | { tip: 'bilgi_kutusu'; tur: 'ek_bilgi' | 'uyari' | 'pratik'; baslik?: string; metin: string };

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

function MetinBlok({ blok, id }: { blok: Extract<IcerikBlok, { tip: 'metin' }>; id?: string }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {blok.baslik && <h3 id={id} style={{ ...BLOK_BASLIK, scrollMarginTop: '96px' }}>{blok.baslik}</h3>}
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

function TabloBlok({ blok, id }: { blok: Extract<IcerikBlok, { tip: 'tablo' }>; id?: string }) {
  /**
   * Sarmalayıcı `overflow: hidden` idi ve tablo `width: 100%` taşıyordu:
   * telefonda kolonlar okunmaz genişliğe sıkışıyordu (4 kolonlu bir tabloda
   * hücre başına ~78px). Artık dar ekranda tablo kendi genişliğini koruyup
   * yatay kayıyor; kaydırma sayfa gövdesine değil bu kutuya ait.
   */
  const enAzKolonGenisligi = 110;
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {blok.baslik && <h3 id={id} style={{ ...BLOK_BASLIK, scrollMarginTop: '96px' }}>{blok.baslik}</h3>}
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

function BilgiKutusu({ blok, id }: { blok: Extract<IcerikBlok, { tip: 'bilgi_kutusu' }>; id?: string }) {
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
      {/* Kutunun KENDİ başlığı — tür etiketi ("Uyarı") onun yerine geçmez:
          biri kutunun cinsini, öteki konusunu söylüyor.
          Renk `etiketRenk`ten geliyor, `solKenar`dan DEĞİL. İlk denemede sol
          kenar tonu kullanılmıştı ve ölçüm yakaladı: uyarı kutusunda
          #c8960a / #fffdf0 = 2.63 — eşiğin (4.5) altında. `solKenar` bir
          ÇİZGİ rengi, `etiketRenk` ise metin için seçilmiş.
          Ölçüldü: ek bilgi 10.45 · uyarı 6.38 · pratik 6.57. */}
      {blok.baslik && (
        <h3 id={id} style={{
          fontSize: '15px',
          fontWeight: 700,
          lineHeight: 1.35,
          color: stil.etiketRenk,
          margin: '0 0 5px',
          scrollMarginTop: '96px',
        }}>
          {blok.baslik}
        </h3>
      )}
      <p style={{ fontSize: '15px', lineHeight: 1.6, margin: 0, color: '#1a2a3a' }}>
        {kalinIsle(blok.metin)}
      </p>
    </div>
  );
}

/**
 * Bölüm başlıkları ve KARARLI kimlikleri — içindekiler ile render AYNI
 * kaynaktan besleniyor.
 *
 * İçindekiler `[data-readable]` konteynerinin DIŞINDA (sayfa dosyasında),
 * başlıklar İÇİNDE render ediliyor. İki yerde ayrı ayrı id üretilseydi
 * kaçınılmaz olarak ayrışırlardı — bu depoda tur tur avlanan sınıf.
 * Bu yüzden ikisi de bu tek fonksiyonu çağırıyor.
 *
 * Kimlik üreteci açık taraftaki konu sayfasıyla ORTAK (`app/lib/baslik.ts`),
 * yani Türkçe katlaması ve çakışma ekleri tek yerde.
 */
export function bolumBasliklari(bloklar: IcerikBlok[]): { id: string; baslik: string }[] {
  const basliklar = bloklar.map((b) => ('baslik' in b && b.baslik ? b.baslik : ''));
  const kimlikler = bolumKimlikleri(basliklar);
  return bloklar
    .map((b, i) => ({ id: kimlikler[i], baslik: basliklar[i] }))
    .filter((x) => x.baslik);
}

export default function IcerikRenderer({ bloklar }: { bloklar: IcerikBlok[] }) {
  /* Kimlikler BÜTÜN blok listesinden üretiliyor (başlıksızlar dahil), yani
     indeksler `bolumBasliklari` ile birebir aynı sırayı taşıyor. */
  const kimlikler = bolumKimlikleri(
    bloklar.map((b) => ('baslik' in b && b.baslik ? b.baslik : ''))
  );
  return (
    <>
      {bloklar.map((blok, i) => {
        const id = 'baslik' in blok && blok.baslik ? kimlikler[i] : undefined;
        if (blok.tip === 'metin')        return <MetinBlok key={i} blok={blok} id={id} />;
        if (blok.tip === 'tablo')        return <TabloBlok key={i} blok={blok} id={id} />;
        if (blok.tip === 'bilgi_kutusu') return <BilgiKutusu key={i} blok={blok} id={id} />;
        return null;
      })}
    </>
  );
}
