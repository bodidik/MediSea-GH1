'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { kisayolSusmali } from '@/app/lib/klavye';

interface Card {
  id: string;
  front: string;
  back: string;
  tag: string;
}

interface Props {
  cards: Card[];
  topic: string;
  backHref: string;
  setId: string;
}

/** Yatay hareket bu eşiği geçerse tıklama değil, kaydırma sayılır (px). */
const KAYDIRMA_ESIGI = 55;

// $...$  notasyonunu render et
function renderMath(text: string): React.ReactNode {
  const parts = text.split(/\$([^$]+)\$/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        style={{
          fontFamily: 'monospace',
          background: '#eef3ff',
          color: '#1a3a6b',
          padding: '1px 4px',
          borderRadius: '3px',
          fontSize: '0.92em',
          fontWeight: 600,
        }}
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const TAG_RENKLERI: Record<string, { bg: string; text: string }> = {
  'APL':                    { bg: '#fff0f0', text: '#8b1a1a' },
  'Onkolojik Acil':         { bg: '#fff0f0', text: '#8b1a1a' },
  'HCT / Nakil':            { bg: '#f0f7ff', text: '#1a3a6b' },
  'Hedefe Yönelik Tedavi':  { bg: '#f0f7ff', text: '#1a3a6b' },
  'ELN 2022 / Risk':        { bg: '#f5fff0', text: '#1a5c2e' },
  'ELN 2024 / Risk':        { bg: '#f5fff0', text: '#1a5c2e' },
  'WHO/ICC 2022':           { bg: '#f5fff0', text: '#1a5c2e' },
  'Yanıt Kriterleri':       { bg: '#fffdf0', text: '#7a5800' },
  'Tedavi Toksisitesi':     { bg: '#fffdf0', text: '#7a5800' },
  'MRD':                    { bg: '#f5f0ff', text: '#4a1a7a' },
  'Moleküler Genetik':      { bg: '#f5f0ff', text: '#4a1a7a' },
  'ALL':                    { bg: '#f5f5f5', text: '#3a3a3a' },
  'Ayırıcı Tanı':           { bg: '#f5f5f5', text: '#3a3a3a' },
};

function tagStil(tag: string) {
  return TAG_RENKLERI[tag] ?? { bg: '#e6f0fb', text: '#1a3a6b' };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardPlayer({ cards, topic, backHref, setId }: Props) {
  const [deck, setDeck] = useState<Card[]>(cards); // SSR'da orijinal sıra
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [bilinen, setBilinen] = useState<Set<string>>(new Set());
  const [bitti, setBitti] = useState(false);
  const yuklendi = useRef(false);
  const baslangic = useRef<{ x: number; y: number } | null>(null);

  const depoAnahtari = `medisea:kartlar:v1:${setId}`;

  useEffect(() => {
    setDeck(shuffle(cards));
    try {
      const raw = localStorage.getItem(depoAnahtari);
      if (raw) {
        /**
         * Depodaki kimlikler MEVCUT sete karşı süzülür.
         *
         * Süzülmediğinde sayaç şişiyordu. Ölçüldü (5 kartlık set, depoda 12
         * kimlik): ekranda "12 biliniyor · %240" yazıyordu — sayı toplam
         * kart sayısını, yüzde de %100'ü aşıyordu.
         *
         * Bu bozuk veri senaryosu DEĞİL, normal içerik düzenlemesiyle
         * oluşuyor: yazar setten kart çıkarınca o kartların işaretleri
         * depoda kalıyor ve sonsuza kadar sayılmaya devam ediyor.
         *
         * Süzme ayrıca bozuk kaydı da etkisiz kılıyor: `JSON.parse` bir
         * DİZE döndürürse `new Set("abc")` üç harflik küme üretiyordu;
         * harfler hiçbir kart kimliğiyle eşleşmediği için artık eleniyorlar.
         *
         * Süzülmüş küme kaydetme etkisi tarafından geri yazıldığı için
         * depo kendi kendini temizliyor.
         */
        const gecerliIdler = new Set(cards.map((c) => c.id));
        const yuklenen: unknown = JSON.parse(raw);
        setBilinen(
          new Set(
            (Array.isArray(yuklenen) ? yuklenen : []).filter(
              (id): id is string => typeof id === "string" && gecerliIdler.has(id)
            )
          )
        );
      }
    } catch {}
    yuklendi.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bilinen kartlar kalıcı: sayfadan çıkıp dönünce baştan işaretlemek gerekmez.
  // İlk yüklemeden ÖNCE yazılmaz, yoksa boş küme depodakini siler.
  useEffect(() => {
    if (!yuklendi.current) return;
    try {
      localStorage.setItem(depoAnahtari, JSON.stringify([...bilinen]));
    } catch {}
  }, [bilinen, depoAnahtari]);

  const card: Card | undefined = deck[index];
  const total = deck.length;

  // Son karttan sonra başa sarmak yerine set biter. Sonsuz döngüde çalışmanın
  // bittiği belli olmuyor, bilinmeyenleri ayıklama fırsatı da hiç gelmiyordu.
  const next = useCallback(() => {
    if (index + 1 >= total) { setBitti(true); return; }
    setFlipped(false);
    setTimeout(() => setIndex(i => i + 1), 150);
  }, [index, total]);

  const prev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex(i => (i - 1 + total) % total), 150);
  }, [total]);

  const flip = useCallback(() => setFlipped(f => !f), []);

  const toggleBilinen = useCallback(() => {
    if (!card) return;
    setBilinen(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }, [card]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Odakta bir düğme/bağlantı varken Space ve Enter ONUN işi. Bu kontrol
      // yokken ölçüm şunu gösterdi: "Biliyorum" düğmesine Tab'layıp Enter'a
      // basınca hiçbir şey olmuyordu — preventDefault düğmenin çalışmasını
      // engelliyor, kısayol da kartı çeviriyordu. Ücretli yüzeydeki dört
      // düğme de klavyeyle kullanılamaz durumdaydı.
      if (kisayolSusmali(e)) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flip, next, prev]);

  if (bitti) {
    const bilinmeyenler = cards.filter(c => !bilinen.has(c.id));
    const oran = cards.length ? Math.round((bilinen.size / cards.length) * 100) : 0;
    const renk = oran >= 80 ? '#1a6640' : oran >= 50 ? '#7a5800' : '#a01f1f';
    const yeniden = (liste: Card[]) => {
      setDeck(shuffle(liste));
      setIndex(0);
      setFlipped(false);
      setBitti(false);
    };
    return (
      <div style={{
        minHeight: '100vh', background: '#fff', color: '#1a2a3a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem 1rem' }}>
          <div style={{
            border: '0.5px solid #b8cfe8', borderRadius: '16px',
            background: '#f5f9ff', padding: '2rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: '#4a6a8a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {topic} · set bitti
            </div>
            <div style={{ fontSize: '44px', fontWeight: 700, color: renk, margin: '0.5rem 0' }}>
              %{oran}
            </div>
            <div style={{ fontSize: '13px', color: '#4a6a8a' }}>
              {cards.length} kartın {bilinen.size} tanesini biliyorsun
              {bilinmeyenler.length > 0 && ` · ${bilinmeyenler.length} kart kaldı`}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.25rem' }}>
            {bilinmeyenler.length > 0 && (
              <button
                onClick={() => yeniden(bilinmeyenler)}
                style={{
                  padding: '12px', borderRadius: '10px', border: '0.5px solid #1a3a6b',
                  background: '#1a3a6b', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                }}
              >
                Bilmediğim {bilinmeyenler.length} kartı çalış →
              </button>
            )}
            <button
              onClick={() => yeniden(cards)}
              style={{
                padding: '12px', borderRadius: '10px', border: '0.5px solid #b8cfe8',
                background: '#f5f9ff', color: '#1a3a6b', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              }}
            >
              Baştan karıştır
            </button>
            <a href={backHref} style={{
              padding: '12px', borderRadius: '10px', border: '0.5px solid #d0e4f5',
              background: '#fff', color: '#4a6a8a', fontWeight: 500, fontSize: '13px',
              textDecoration: 'none', textAlign: 'center',
            }}>
              ← Konuya dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <p style={{ color: '#4a6a8a', fontSize: '14px' }}>Bu sette henüz kart yok.</p>
        <a href={backHref} style={{
          fontSize: '12px', fontWeight: 500, color: '#1a3a6b',
          border: '0.5px solid #b8cfe8', borderRadius: '8px', padding: '7px 14px',
          background: '#f5f9ff', textDecoration: 'none',
        }}>
          ← Konuya dön
        </a>
      </div>
    );
  }

  const bilinenSayi = bilinen.size;
  // Payda deste değil, setin tamamı: bilmediklerini çalışırken deste küçülüyor
  // ama "biliniyor" sayısı bütün seti kapsıyor, oran %100'ü aşardı.
  const ilerleme = cards.length ? Math.round((bilinenSayi / cards.length) * 100) : 0;
  const cardBilinen = bilinen.has(card.id);
  const tagS = tagStil(card.tag);

  // Tablette kart çevirmek için düğme aramak yerine kartın kendisi kullanılır:
  // kısa dokunuş çevirir, yatay kaydırma kart değiştirir.
  const isaretBasla = (ev: React.PointerEvent) => {
    baslangic.current = { x: ev.clientX, y: ev.clientY };
  };
  const isaretBitir = (ev: React.PointerEvent) => {
    const b = baslangic.current;
    baslangic.current = null;
    if (!b) return;
    const dx = ev.clientX - b.x;
    if (Math.abs(dx) < KAYDIRMA_ESIGI) {
      if (Math.abs(dx) < 10 && Math.abs(ev.clientY - b.y) < 10) flip();
      return;
    }
    if (dx < 0) next();
    else prev();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* DUYURU — kartın görünen yüzü.
            Kartın iki yüzü de DOM'da duruyor; görünmeyeni artık `inert` ile
            erişim ağacından çıkarıyoruz (yoksa yanıt soruyla birlikte
            okunuyordu). Bunun doğal sonucu: çevirme işlemi ekran okuyucuya
            SESSİZ kalır. Bu bölge boşluğu kapatıyor.
            Bölge ilk render'dan itibaren DOM'da: `role="status"` sonradan
            eklenen düğümü duyurmaz, içeriği DEĞİŞEN düğümü duyurur. */}
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute', width: '1px', height: '1px',
            overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
          }}
        >
          {`Kart ${index + 1} / ${total}. ${flipped ? `Yanıt: ${card.back}` : `Soru: ${card.front}`}`}
        </div>

        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <a href={backHref} style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#1a3a6b',
            border: '0.5px solid #b8cfe8',
            borderRadius: '8px',
            padding: '6px 12px',
            background: '#f5f9ff',
            textDecoration: 'none',
          }}>
            ← Konuya dön
          </a>
          {/**
           * Konu adı zaten EKRANDAYDI ama düz bir `span`di: sayfada `h1` ve
           * `h2` sayısı ÖLÇÜLDÜ ve ikisi de **0**du. Ücretli çalışma
           * yüzeyinde belgeyi adlandıran hiçbir başlık yoktu.
           *
           * Görünüm DEĞİŞMİYOR: `globals.css` h1'e serif yazı tipi ve 24px
           * üst/alt boşluk veriyor (belgede kayıtlı tuzak), satır içi stil
           * ikisini de açıkça geri alıyor. Yeni bir metin eklenmedi —
           * var olan ad anlamlandırıldı.
           */}
          <h1 style={{ fontFamily: 'inherit', fontSize: '12px', fontWeight: 400, color: '#4a6a8a', margin: 0 }}>
            {topic}
          </h1>
        </div>

        {/* İLERLEME */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#4a6a8a', marginBottom: '6px' }}>
            <span>{index + 1} / {total}</span>
            <span style={{ color: '#1a6640' }}>{bilinenSayi} biliniyor · %{ilerleme}</span>
          </div>
          <div style={{ height: '4px', background: '#e8f0f8', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((index + 1) / total) * 100}%`,
              background: '#1a3a6b',
              borderRadius: '4px',
              transition: 'width 0.2s',
            }} />
          </div>
          <div style={{ height: '4px', background: 'transparent', borderRadius: '4px', overflow: 'hidden', marginTop: '3px' }}>
            <div style={{
              height: '100%',
              width: `${ilerleme}%`,
              background: '#1a6640',
              borderRadius: '4px',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* KART */}
        <div
          style={{ flex: 1, perspective: '1200px', marginBottom: '1.25rem', cursor: 'pointer', minHeight: '280px', touchAction: 'pan-y' }}
          onPointerDown={isaretBasla}
          onPointerUp={isaretBitir}
        >
          <div style={{
            width: '100%',
            height: '100%',
            minHeight: '280px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}>

            {/* ÖN YÜZ */}
            <div
              aria-hidden={flipped}
              inert={flipped}
              style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              border: '0.5px solid #b8cfe8',
              borderRadius: '16px',
              background: '#f5f9ff',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '5px',
                  background: tagS.bg,
                  color: tagS.text,
                  border: '0.5px solid currentColor',
                  opacity: 0.9,
                }}>
                  {card.tag}
                </span>
                <span style={{ fontSize: '11px', color: '#4a6a8a' }}>Soruyu oku</span>
              </div>

              <p style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: '#1a2a3a',
                margin: '1.5rem 0',
                fontWeight: 500,
                textAlign: 'center',
              }}>
                {renderMath(card.front)}
              </p>

              <div style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#4a6a8a',
                borderTop: '0.5px solid #d0e4f5',
                paddingTop: '0.75rem',
              }}>
                Tıkla veya <kbd style={{ padding: '1px 5px', background: '#e8f0f8', borderRadius: '3px', fontSize: '11px' }}>Space</kbd> ile çevir
              </div>
            </div>

            {/* ARKA YÜZ */}
            <div
              aria-hidden={!flipped}
              inert={!flipped}
              style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: '0.5px solid #80c898',
              borderRadius: '16px',
              background: '#f0fbf5',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1a6640', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Yanıt</span>
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onPointerUp={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); toggleBilinen(); }}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '0.5px solid',
                    cursor: 'pointer',
                    background: cardBilinen ? '#1a6640' : '#fff',
                    color: cardBilinen ? '#fff' : '#1a6640',
                    borderColor: '#1a6640',
                    transition: 'all 0.15s',
                  }}
                >
                  {cardBilinen ? '✓ Biliyorum' : 'Biliyorum'}
                </button>
              </div>

              <p style={{
                fontSize: '15px',
                lineHeight: 1.75,
                color: '#1a2a3a',
                margin: '1.5rem 0',
                textAlign: 'center',
              }}>
                {renderMath(card.back)}
              </p>

              <div style={{ textAlign: 'center', fontSize: '11px', color: '#2a7a4a' }}>
                {cardBilinen ? '✓ Bu kartı biliniyor olarak işaretledin' : 'Biliyorsan işaretle, devam et'}
              </div>
            </div>
          </div>
        </div>

        {/* NAVİGASYON */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={prev}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              border: '0.5px solid #b8cfe8',
              background: '#f5f9ff',
              color: '#1a3a6b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ← Önceki
          </button>

          <button
            onClick={flip}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: '10px',
              border: '0.5px solid #1a3a6b',
              background: flipped ? '#1a3a6b' : '#fff',
              color: flipped ? '#fff' : '#1a3a6b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {flipped ? 'Soruya dön' : 'Yanıtı gör'}
          </button>

          <button
            onClick={next}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              border: '0.5px solid #b8cfe8',
              background: '#f5f9ff',
              color: '#1a3a6b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Sonraki →
          </button>
        </div>

        {/* KLAVYE İPUCU */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#4a6a8a', marginTop: '0.75rem' }}>
          <kbd style={{ padding: '1px 5px', background: '#f0f4f8', borderRadius: '3px' }}>←</kbd>
          {' '}önceki · {' '}
          <kbd style={{ padding: '1px 5px', background: '#f0f4f8', borderRadius: '3px' }}>Space</kbd>
          {' '}çevir · {' '}
          <kbd style={{ padding: '1px 5px', background: '#f0f4f8', borderRadius: '3px' }}>→</kbd>
          {' '}sonraki · dokunmatikte kartı kaydır
        </div>

      </div>
    </div>
  );
}
