'use client';

import { useState, useCallback, useEffect } from 'react';
import { kalinIsle, duzMetin } from '@/app/lib/metin';

/* ────────────────────────── TYPES ────────────────────────── */
interface Soru {
  id: string;
  metin: string;
  secenekler: Record<string, string>;
  dogru: string;
  aciklama_kisa?: string;
  aciklama_detay?: string;
  secenekAciklamalari?: Record<string, string>;
  etiketler?: string[];
  zorluk?: string;
  kaynak?: string;
}

interface QuizVeri {
  id: string;
  baslik: string;
  branch?: string;
  topic?: string;
  sorular: Soru[];
}

interface Props {
  veri: QuizVeri;
  lang: string;
  branch: string;
}

/* ────────────────────────── HELPERS ────────────────────────── */
const ZORLUK_RENK: Record<string, { bg: string; color: string }> = {
  kolay:  { bg: '#f0fbf5', color: '#1a6640' },
  orta:   { bg: '#fffdf0', color: '#7a5800' },
  zor:    { bg: '#fff0f0', color: '#a01f1f' },
};

function ZorlukBadge({ zorluk }: { zorluk?: string }) {
  if (!zorluk) return null;
  const s = ZORLUK_RENK[zorluk] ?? { bg: '#f5f9ff', color: '#1a3a6b' };
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, padding: '2px 8px',
      borderRadius: '4px', background: s.bg, color: s.color,
      border: `0.5px solid currentColor`, textTransform: 'uppercase', letterSpacing: '.06em',
    }}>
      {zorluk}
    </span>
  );
}

/* ────────────────────────── SORU BİLEŞENİ ────────────────────────── */
function SoruKarti({
  soru,
  soruNo,
  toplamSoru,
  onNext,
  onAnswer,
  skor,
  lang,
  branch,
  topic,
}: {
  soru: Soru;
  soruNo: number;
  toplamSoru: number;
  onNext: () => void;
  onAnswer: (dogru: boolean) => void;
  skor: { dogru: number; yanlis: number };
  lang: string;
  branch: string;
  topic?: string;
}) {
  const [secim, setSecim] = useState<string | null>(null);

  const secenekler = Object.entries(soru.secenekler);
  const cevapVerildi = secim !== null;

  const secenek = useCallback((harf: string) => {
    if (cevapVerildi) return;
    setSecim(harf);
    onAnswer(harf === soru.dogru);
  }, [cevapVerildi, onAnswer, soru.dogru]);

  function secenekStil(harf: string): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '12px 16px', borderRadius: '10px', border: '0.5px solid',
      cursor: cevapVerildi ? 'default' : 'pointer',
      textAlign: 'left' as const, background: '#fff',
      transition: 'all 0.15s', marginBottom: '8px', width: '100%',
      borderColor: '#d0e4f5',
    };

    if (!cevapVerildi) {
      return { ...base, borderColor: '#d0e4f5' };
    }

    if (harf === soru.dogru) {
      return { ...base, background: '#f0fbf5', borderColor: '#80c898', borderWidth: '1.5px' };
    }
    if (harf === secim) {
      return { ...base, background: '#fff0f0', borderColor: '#e08080', borderWidth: '1.5px' };
    }
    return { ...base, opacity: 0.5, borderColor: '#e8f0f8' };
  }

  function harfDairesi(harf: string): React.CSSProperties {
    const base: React.CSSProperties = {
      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: 700,
    };

    if (!cevapVerildi) {
      return { ...base, background: '#f0f7ff', color: '#1a3a6b', border: '0.5px solid #b8cfe8' };
    }
    if (harf === soru.dogru) {
      return { ...base, background: '#1a6640', color: '#fff', border: 'none' };
    }
    if (harf === secim) {
      return { ...base, background: '#a01f1f', color: '#fff', border: 'none' };
    }
    return { ...base, background: '#f0f0f0', color: '#666', border: '0.5px solid #d8d8d8' };
  }

  const dogruMu = secim === soru.dogru;
  const backHref = topic ? `/${lang}/premium/ydus/${branch}/${topic}` : `/${lang}/premium/ydus/${branch}`;

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a2a3a',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', flex: 1 }}>

        {/* BAŞLIK + İLERLEME */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <a href={backHref} style={{
            fontSize: '12px', fontWeight: 500, color: '#1a3a6b',
            border: '0.5px solid #b8cfe8', borderRadius: '8px', padding: '6px 12px',
            background: '#f5f9ff', textDecoration: 'none',
          }}>
            ← Konuya dön
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ZorlukBadge zorluk={soru.zorluk} />
            {(skor.dogru > 0 || skor.yanlis > 0) && (
              <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', gap: '6px' }}>
                <span style={{ color: '#1a6640' }}>{skor.dogru}✓</span>
                <span style={{ color: '#a01f1f' }}>{skor.yanlis}✗</span>
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#4a6a8a', fontWeight: 600 }}>
              {soruNo} / {toplamSoru}
            </span>
          </div>
        </div>

        {/* İLERLEME ÇUBUĞU */}
        <div style={{ height: '4px', background: '#e8f0f8', borderRadius: '4px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#1a3a6b', borderRadius: '4px',
            width: `${(soruNo / toplamSoru) * 100}%`, transition: 'width .3s',
          }} />
        </div>

        {/* SORU METNİ */}
        <div style={{
          background: '#f5f9ff', border: '0.5px solid #b8cfe8',
          borderLeft: '3px solid #1a3a6b', borderRadius: '0 10px 10px 0',
          padding: '1.1rem 1.25rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.5rem' }}>
            Soru {soruNo}
          </div>
          <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#1a2a3a', fontWeight: 500 }}>
            {kalinIsle(soru.metin)}
          </p>
          {soru.etiketler && soru.etiketler.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '.65rem' }}>
              {soru.etiketler.map((t, i) => (
                <span key={i} style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                  background: '#e6f0fb', color: '#1a3a6b', border: '0.5px solid #b8cfe8',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SEÇENEKLER */}
        <div style={{ marginBottom: '1rem' }}>
          {secenekler.map(([harf, metin]) => (
            <button
              key={harf}
              onClick={() => secenek(harf)}
              /**
               * Cevap verildikten sonra şıklar İŞLEVSİZ ama düğme olmayı
               * sürdürüyordu. Ölçüldü: cevaptan sonra başka bir şıkka
               * tıklamak hiçbir şeyi değiştirmiyor (ekran ve durum bölgesi
               * aynı kalıyor). Klavyeyle gezen biri üstüne gelip Enter'a
               * basıyor, hiçbir şey olmuyor ve nedenini öğrenemiyordu.
               *
               * `disabled` DEĞİL `aria-disabled` kullanılıyor: `disabled`
               * ögeyi sekme sırasından tümden çıkarır, oysa cevaptan sonra
               * şıklar okunmaya devam etmeli — hangisinin doğru olduğu (✓/✗)
               * ve açıklaması orada. Ekran okuyucu böyle hem metni okuyabilir
               * hem de "kullanılamıyor" bilgisini alır.
               */
              aria-disabled={cevapVerildi || undefined}
              /*
               * ADDA HARF KORUNUR — cevaptan sonra harf dairesi ✓/✗ ile
               * DEĞİŞİYOR ve harf erişilebilir addan tümden düşüyordu.
               * Ölçüldü: cevaptan sonra düğmenin adı "✗Cushing Hastalığı…"
               * oluyor. Geri bildirim ise "Doğru cevap D." diyor — yani
               * ekran okuyucu kullanıcısına artık hiçbir düğmenin
               * duyurmadığı bir harf gösteriliyor.
               *
               * Glif görselde kalıyor (bakan için en hızlı işaret) ama ada
               * girmiyor; durum yazıyla veriliyor.
               */
              aria-label={
                `${harf}: ${duzMetin(metin)}` +
                (!cevapVerildi
                  ? ''
                  : harf === soru.dogru
                    ? ' — doğru cevap'
                    : harf === secim
                      ? ' — senin seçimin, yanlış'
                      : '')
              }
              style={secenekStil(harf)}
            >
              <div style={harfDairesi(harf)}>
                {cevapVerildi
                  ? harf === soru.dogru ? '✓' : harf === secim ? '✗' : harf
                  : harf}
              </div>
              <span style={{ fontSize: '15px', lineHeight: 1.65, color: '#1a2a3a', flex: 1 }}>
                {kalinIsle(metin)}
              </span>
            </button>
          ))}
        </div>

        {/*
          Sonucun SÖZLÜ karşılığı.
          Görsel sonuç kartı ✅/❌ ile anlatıyor; ekran okuyucu için sessizdi —
          cevap verildikten sonra doğru mu yanlış mı olduğu hiç duyurulmuyordu.
          Bu bölge koşulsuz basılıyor ve boş başlıyor: canlı bölgenin içerik
          değişmeden ÖNCE DOM'da bulunması gerekiyor, sonradan eklenen bölgenin
          ilk mesajı kaçabiliyor. Görsel olarak gizli (sr-only), çünkü aynı
          bilgi zaten gözle görülüyor; iki kez YAZMAK gereksiz tekrar olurdu.
        */}
        <div role="status" className="sr-only">
          {cevapVerildi
            ? dogruMu
              ? 'Doğru cevap.'
              : `Yanlış. Doğru cevap ${soru.dogru}.`
            : ''}
        </div>

        {/* SONUÇ + AÇIKLAMA */}
        {cevapVerildi && (
          <div style={{
            border: `1.5px solid ${dogruMu ? '#80c898' : '#e08080'}`,
            borderRadius: '12px', overflow: 'hidden',
            animation: 'fadeIn .25s ease',
          }}>
            {/* Sonuç başlığı */}
            <div style={{
              padding: '.85rem 1.25rem',
              background: dogruMu ? '#f0fbf5' : '#fff0f0',
              display: 'flex', alignItems: 'center', gap: '10px',
              borderBottom: `0.5px solid ${dogruMu ? '#80c898' : '#e08080'}`,
            }}>
              <span style={{ fontSize: '1.4rem' }}>{dogruMu ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: dogruMu ? '#1a6640' : '#a01f1f' }}>
                  {dogruMu ? 'Doğru!' : `Yanlış — Doğru cevap: ${soru.dogru}`}
                </div>
                {soru.aciklama_kisa && (
                  <div style={{ fontSize: '14px', color: '#4a6a8a', marginTop: '2px' }}>
                    {kalinIsle(soru.aciklama_kisa)}
                  </div>
                )}
              </div>
            </div>

            {/* Detaylı açıklama
                data-readable: açıklama metni vurgulanabilir. Kimlik soruya bağlı —
                sonraki soruya geçince vurgular karışmaz, o soruya ait kalır. */}
            <div data-readable={`soru:${soru.id}`} style={{ padding: '1rem 1.25rem' }}>
              {soru.aciklama_detay && (
                <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#1a2a3a', marginBottom: '1rem' }}>
                  {kalinIsle(soru.aciklama_detay)}
                </p>
              )}

              {/* Seçenek bazlı açıklamalar */}
              {soru.secenekAciklamalari && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.6rem' }}>
                    Seçenek Açıklamaları
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(soru.secenekAciklamalari).map(([harf, metin]) => {
                      const isDogru = harf === soru.dogru;
                      return (
                        <div key={harf} style={{
                          padding: '.65rem .9rem',
                          borderRadius: '7px',
                          background: isDogru ? '#f0fbf5' : '#f8fcff',
                          border: `0.5px solid ${isDogru ? '#80c898' : '#d0e4f5'}`,
                          display: 'flex', gap: '8px', alignItems: 'flex-start',
                        }}>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                            borderRadius: '4px', flexShrink: 0,
                            background: isDogru ? '#1a6640' : '#e6f0fb',
                            color: isDogru ? '#fff' : '#1a3a6b',
                          }}>
                            {harf}
                          </span>
                          <span style={{ fontSize: '14px', lineHeight: 1.65, color: '#1a2a3a' }}>
                            {kalinIsle(metin)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {soru.kaynak && (
                <div style={{ marginTop: '.85rem', fontSize: '12px', color: '#4a6a8a', borderTop: '0.5px solid #e8f0f8', paddingTop: '.65rem' }}>
                  Kaynak: {soru.kaynak}
                </div>
              )}
            </div>

            {/* Alt butonlar */}
            <div style={{
              padding: '.75rem 1.25rem', borderTop: '0.5px solid #e8f0f8',
              display: 'flex', justifyContent: 'space-between', gap: '8px',
            }}>
              <a href={backHref} style={{
                fontSize: '12px', fontWeight: 500, color: '#1a3a6b',
                border: '0.5px solid #b8cfe8', borderRadius: '8px', padding: '7px 14px',
                background: '#f5f9ff', textDecoration: 'none',
              }}>
                ← Konuya dön
              </a>
              <button onClick={onNext} style={{
                fontSize: '12px', fontWeight: 600, color: '#fff',
                border: 'none', borderRadius: '8px', padding: '7px 18px',
                background: '#1a3a6b', cursor: 'pointer',
              }}>
                {soruNo < toplamSoru ? 'Sonraki soru →' : 'Sonucu gör →'}
              </button>
            </div>
          </div>
        )}

        {!cevapVerildi && (
          <p style={{ fontSize: '11px', color: '#4a6a8a', textAlign: 'center', marginTop: '.5rem' }}>
            Bir seçenek işaretleyin
          </p>
        )}

      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

/* ────────────────────────── SONUÇ EKRANI ────────────────────────── */
function SonucEkrani({
  sorular,
  sonuclar,
  backHref,
  onBastan,
  onYanlislar,
}: {
  sorular: Soru[];
  sonuclar: Record<string, boolean>;
  backHref: string;
  onBastan: () => void;
  onYanlislar: () => void;
}) {
  const cevaplanan = sorular.filter((s) => s.id in sonuclar);
  const dogru = cevaplanan.filter((s) => sonuclar[s.id]).length;
  const yanlislar = cevaplanan.filter((s) => !sonuclar[s.id]);
  const yuzde = cevaplanan.length ? Math.round((dogru / cevaplanan.length) * 100) : 0;
  const renk = yuzde >= 80 ? '#1a6640' : yuzde >= 60 ? '#7a5800' : '#a01f1f';
  const zemin = yuzde >= 80 ? '#f0fbf5' : yuzde >= 60 ? '#fffdf0' : '#fff0f0';

  const dugme: React.CSSProperties = {
    fontSize: '12px', fontWeight: 600, borderRadius: '8px',
    padding: '9px 18px', cursor: 'pointer', textDecoration: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a2a3a',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          background: zemin, border: `1.5px solid ${renk}`, borderRadius: '16px',
          padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: renk, textTransform: 'uppercase', letterSpacing: '.12em' }}>
            Set tamamlandı
          </div>
          <div style={{ fontSize: '48px', fontWeight: 800, color: renk, lineHeight: 1.1, margin: '.4rem 0' }}>
            %{yuzde}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#4a6a8a' }}>
            {cevaplanan.length} soruda {dogru} doğru · {yanlislar.length} yanlış
          </div>
        </div>

        {yanlislar.length > 0 && (
          <div style={{ border: '0.5px solid #e08080', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{
              padding: '.7rem 1.1rem', background: '#fff0f0',
              fontSize: '11px', fontWeight: 700, color: '#a01f1f',
              textTransform: 'uppercase', letterSpacing: '.08em',
            }}>
              Yanlış yaptığın sorular
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {yanlislar.map((s) => {
                // Önizleme KIRPILIYOR: kalın işareti burada render edilmiyor,
                // sökülüyor. Kırpma noktası bir `**` çiftinin ortasına düşerse
                // yarım kalan işaret ekrana yıldız olarak dökülürdü.
                const ozet = duzMetin(s.metin);
                return (
                  <div key={s.id} style={{
                    padding: '.7rem 1.1rem', borderTop: '0.5px solid #f5e0e0',
                    fontSize: '12px', lineHeight: 1.6, color: '#4a6a8a',
                  }}>
                    {ozet.length > 130 ? `${ozet.slice(0, 130)}…` : ozet}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {yanlislar.length > 0 && (
            <button onClick={onYanlislar} style={{ ...dugme, background: '#a01f1f', color: '#fff', border: 'none' }}>
              Yanlış {yanlislar.length} soruyu tekrar çöz
            </button>
          )}
          <button onClick={onBastan} style={{ ...dugme, background: '#1a3a6b', color: '#fff', border: 'none' }}>
            Baştan çöz
          </button>
          <a href={backHref} style={{ ...dugme, background: '#f5f9ff', color: '#1a3a6b', border: '0.5px solid #b8cfe8' }}>
            ← Konuya dön
          </a>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── ANA BİLEŞEN ────────────────────────── */
export default function QuizEngine({ veri, lang, branch }: Props) {
  const storageKey = `quiz-progress-${veri.id}`;
  const tumSorular = veri.sorular ?? [];

  const [soruIndex, setSoruIndex] = useState(0);
  const [devamMesaji, setDevamMesaji] = useState(false);
  const [sonuclar, setSonuclar] = useState<Record<string, boolean>>({});
  const [bitti, setBitti] = useState(false);
  // Yalnızca yanlışları çözmek için daraltılmış set; null = bütün sorular.
  const [aktifIdler, setAktifIdler] = useState<string[] | null>(null);

  const sorular = aktifIdler
    ? tumSorular.filter((s) => aktifIdler.includes(s.id))
    : tumSorular;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      // Eski sürüm yalnızca indeksi sayı olarak tutuyordu — ikisini de kabul et.
      const kayit = JSON.parse(raw);
      const i = typeof kayit === 'number' ? kayit : kayit?.i;
      const s = typeof kayit === 'object' && kayit ? kayit.s : null;
      if (s && typeof s === 'object') setSonuclar(s);
      if (typeof i === 'number' && i > 0 && i < tumSorular.length) {
        setSoruIndex(i);
        setDevamMesaji(true);
        setTimeout(() => setDevamMesaji(false), 3000);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // İlerleme SET BİTİNCE silinir. Önceden son soruya geçerken siliniyordu:
  // kullanıcı son soruyu cevaplamadan sekmeyi kapatırsa bütün tur kayboluyordu.
  useEffect(() => {
    try {
      if (bitti) {
        localStorage.removeItem(storageKey);
        return;
      }
      if (soruIndex === 0 && Object.keys(sonuclar).length === 0) return;
      localStorage.setItem(storageKey, JSON.stringify({ i: soruIndex, s: sonuclar }));
    } catch {}
  }, [soruIndex, sonuclar, bitti, storageKey]);

  const backHref = veri.topic
    ? `/${lang}/premium/ydus/${branch}/${veri.topic}`
    : `/${lang}/premium/ydus/${branch}`;

  /**
   * BOŞ DURUM ÇIKIŞ YOLU İSTER — bir dönem yalnızca tek bir cümleydi.
   *
   * Bu depodaki kural belli: her hata/boş durumda geri dönülecek bir
   * bağlantı olmalı, yoksa kullanıcı çıkmazda kalıyor (aynı sayfanın
   * "Quiz bulunamadı" kartı bunu zaten yapıyordu; boş dal atlanmıştı).
   *
   * İki yoldan buraya düşülüyor: quiz dosyası okunabilir ama `sorular`
   * boş/başka şemada, ya da "yalnızca yanlışları çöz" kipinde saklanan
   * kimlikler artık hiçbir soruyla eşleşmiyor (içerik düzenlenince olur).
   */
  if (sorular.length === 0) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
        fontFamily: 'system-ui, sans-serif', padding: '1rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem' }} aria-hidden="true">📝</div>
        <p style={{ color: '#4a6a8a', fontSize: '15px', margin: 0, maxWidth: '28rem' }}>
          {tumSorular.length > 0
            ? 'Tekrar çözülecek soru kalmadı. İşaretlediğin sorular quizden çıkarılmış olabilir.'
            : 'Bu quizde henüz soru yok.'}
        </p>
        <a href={backHref} style={{
          padding: '8px 18px', background: '#1a3a6b', color: '#fff',
          borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
        }}>
          ← Konuya dön
        </a>
      </div>
    );
  }

  function ilerle() {
    if (soruIndex >= sorular.length - 1) {
      setBitti(true);
      return;
    }
    setSoruIndex(soruIndex + 1);
  }

  if (bitti) {
    return (
      <SonucEkrani
        sorular={sorular}
        sonuclar={sonuclar}
        backHref={backHref}
        onBastan={() => {
          setAktifIdler(null);
          setSonuclar({});
          setSoruIndex(0);
          setBitti(false);
        }}
        onYanlislar={() => {
          const yanlisIdler = sorular
            .filter((s) => sonuclar[s.id] === false)
            .map((s) => s.id);
          setAktifIdler(yanlisIdler);
          setSonuclar({});
          setSoruIndex(0);
          setBitti(false);
        }}
      />
    );
  }

  const aktifSoru = sorular[Math.min(soruIndex, sorular.length - 1)];
  const skor = sorular.reduce(
    (a, s) => (s.id in sonuclar ? (sonuclar[s.id] ? { ...a, dogru: a.dogru + 1 } : { ...a, yanlis: a.yanlis + 1 }) : a),
    { dogru: 0, yanlis: 0 }
  );

  return (
    <div style={{ position: 'relative' }}>
      {devamMesaji && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: '#1a3a6b', color: '#fff', borderRadius: '10px',
          padding: '8px 18px', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,.15)', zIndex: 1000,
          animation: 'fadeIn .25s ease',
        }}>
          ⏎ Kaldığın yerden devam ediyorsun — {soruIndex + 1}. soru
        </div>
      )}
      <SoruKarti
        key={aktifSoru.id}
        soru={aktifSoru}
        soruNo={soruIndex + 1}
        toplamSoru={sorular.length}
        onNext={ilerle}
        onAnswer={(d) => setSonuclar((p) => ({ ...p, [aktifSoru.id]: d }))}
        skor={skor}
        lang={lang}
        branch={branch}
        topic={veri.topic}
      />
    </div>
  );
}
