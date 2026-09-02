import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import SoruSor from './SoruSor';
import { AccessGate } from '@/lib/AccessGate';
import { envanterAl } from '@/lib/premium-envanter';
import IcerikRenderer, { bolumBasliklari, type IcerikBlok } from './IcerikBloklari';
import { kisaltmaAcBloklar } from '@/app/lib/kisaltma';
import { ayYazisi } from '@/app/lib/tarih';
import { KLINIK_SORUMLULUK } from '@/app/lib/sorumluluk';
import { rotaMeta } from "@/lib/site";
import KaydirDurumu from '@/app/components/KaydirDurumu';

/**
 * KULLANICIYA ÖZEL — her istekte yeniden üretilir.
 *
 * Burası `export const revalidate = 86400;` diyordu: kapı arkasındaki,
 * kişiye göre değişen bir sayfada "bu yanıtı 24 saat önbellekle" beyanı.
 * Beyan ÖLÜYDÜ ve iki ayrı ölçümle gösterildi:
 *
 *   1) bugünkü hâliyle sayfa dinamik (auth okuyor) — revalidate işlemiyor;
 *   2) `AccessGate` çağrısı VE ithali tümüyle kaldırılıp yeniden derlendi —
 *      sayfa YİNE `private, no-cache, no-store` döndü (üç istek), yani
 *      revalidate auth olmadan da işlemiyor.
 *
 * Ayırt edici olan `generateStaticParams`: onu taşıyan kardeş sayfa
 * (`[branch]`) aynı derlemede `s-maxage=86400` ve `x-nextjs-cache: HIT`
 * veriyor. Yani beyan bugün etkisiz, ama biri bu sayfaya
 * `generateStaticParams` eklediği gün SESSİZCE etkinleşir ve bir
 * kullanıcının erişim durumu 24 saat boyunca herkese servis edilir —
 * belgede adı konmuş tuzağın ta kendisi.
 *
 * `force-dynamic` hem bugünkü gerçeği söylüyor hem de o günü yapısal
 * olarak imkânsız kılıyor. Bugünkü davranış DEĞİŞMİYOR (ölçüldü).
 */
export const dynamic = "force-dynamic";

// --- BRANCH RENK SİSTEMİ ---
/**
 * BRANS KUNYESI ELLE TUTULMUYOR -- olculmus bir ayrisma yuzunden.
 *
 * Burada 9 bransin adi ve rengi elle yaziliydi; ayni degerler branch
 * JSON'larinda da duruyor ve `[branch]/page.tsx` ORADAN okuyor. Iki
 * gerceklik ZATEN ayrismisti (kaynaktan sayildi, 10 brans):
 *
 *   enfeksiyon   JSON "Enfeksiyon Hastaliklari"  <->  kod "Enfeksiyon"
 *   onkoloji     JSON "Tibbi Onkoloji"           <->  kod "Onkoloji"
 *
 * Bedeli kirinti yolunda gorunuyordu: brans sayfasi "Enfeksiyon
 * Hastaliklari" diyor, ayni bransin konu sayfasi "Enfeksiyon" -- ayni
 * hedefe giden iki bag, iki ayri ad. Ustelik yeni bir brans eklendiginde
 * (genel-dahiliye) etiket ham slug'a dusuyordu.
 *
 * Artik kunye branch JSON'undan okunuyor: tek kaynak, ayrisma imkani yok
 * ve yeni brans kod satiri gerektirmiyor. Dosya okunamazsa eski yedek
 * davranisi (ham slug + varsayilan renk) suruyor.
 */
function bransKunyesi(branch: string): { label: string; renk: string } {
  try {
    const yol = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'branches', `${branch}.json`
    );
    const j = JSON.parse(fs.readFileSync(yol, 'utf-8')) as { meta?: { baslik?: string; renk?: string } };
    return {
      label: j.meta?.baslik || branch,
      renk: j.meta?.renk || DEFAULT_RENK,
    };
  } catch {
    return { label: branch, renk: DEFAULT_RENK };
  }
}

const DEFAULT_RENK = '#1a3a6b';

// --- TİP TANIMLAMALARI ---
// Blok tipleri ve gövde işleyicileri IcerikBloklari.tsx'e taşındı.

interface KonuVerisi {
  meta: {
    id: string;
    branch: string;
    baslik: string;
    altbaslik?: string;
    rozetler?: string[];
    guncelleme?: string;
  };
  moduller?: {
    flashcard?: boolean;
    inciler?: boolean;
    quiz?: boolean;
    vaka?: boolean;
    video?: boolean;
  };
  istatistikler?: {
    soru?: number;
    flashcard?: number;
    inci?: number;
    /* Vaka sayacı: moduller.vaka ile birlikte kullanılır. Mevcut içerik
       JSON'larında henüz yok, o yüzden opsiyonel — arayüz zaten
       `!== undefined` ile koruyor. */
    vaka?: number;
  };
  icerik: IcerikBlok[];
}

function konuYukle(branch: string, topic: string): KonuVerisi | null {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'topics', branch, `${topic}.json`
    );
    const icerik = fs.readFileSync(dosyaYolu, 'utf-8');
    return JSON.parse(icerik) as KonuVerisi;
  } catch {
    return null;
  }
}

// --- RENK YARDIMCILARI ---
// --- MODÜL KARTI ---
const MODUL_BILGI = {
  flashcard: { etiket: 'Hızlı tekrar', emoji: '🃏', renk: '#e6f0fb' },
  inciler:   { etiket: 'Klinik inciler', emoji: '💎', renk: '#fffbe6' },
  quiz:      { etiket: 'Soru çöz', emoji: '📝', renk: '#fff0f0' },
  vaka:      { etiket: 'Vaka', emoji: '🏥', renk: '#f0fbf5' },
  video:     { etiket: 'Video', emoji: '🎬', renk: '#f5f0ff' },
};

const MODUL_HREF: Record<string, (lang: string, branch: string, topic: string) => string> = {
  flashcard: (l, b, t) => `/${l}/premium/ydus/hizli-tekrar?branch=${b}&id=${t}`,
  inciler:   (l, b, t) => `/${l}/premium/ydus/inciler?branch=${b}&id=${t}`,
  quiz:      (l, b, t) => `/${l}/premium/ydus/quiz-coz?branch=${b}&id=${t}-quiz-1`,
  vaka:      (l, b, t) => `/${l}/premium/ydus/vaka-coz?branch=${b}&topic=${t}`,
  video:     (l, b, t) => `/${l}/premium/ydus/${b}/${t}/video`,
};

// --- ANA SAYFA ---
/**
 * Kendi metadata'sı OLMAK ZORUNDA — kardeş branş sayfasıyla aynı gerekçe:
 * yoksa kök düzenin `alternates: { canonical: "/" }` değeri miras alınıyor ve
 * sayfa kendini ana sayfanın kopyası ilan ediyor. OLCULDU (canlida): premium
 * konu sayfalarinin hepsi hem genel site basligini hem canonical "/" tasiyordu.
 *
 * Baslik `<h1>` ile AYNI kaynaktan (`veri.meta`) turuyor. `openGraph` `rotaMeta` üzerinden geliyor — başlık ve açıklamanın ikinci bir kopyası tutulmuyor. Bir dönem "görsel mirası bozulur" diye hiç yazılmıyordu; ölçüm çürüttü (`images` verilmedikçe miras sürüyor) ve o inancın bedeli paylaşım kartının ana sayfayı göstermesiydi.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; branch: string; topic: string }>;
}): Promise<Metadata> {
  const { branch, topic } = await params;
  const veri = konuYukle(branch, topic);
  if (!veri) return {};
  return rotaMeta({
    baslik: `${veri.meta.baslik} — YDUS`,
    aciklama: veri.meta.altbaslik || `${veri.meta.baslik} — YDUS premium konu anlatımı, sorular ve tekrar kartları.`,
    yol: `/tr/premium/ydus/${branch}/${topic}`,
  });
}

export default async function KonuSayfasi({
  params,
}: {
  params: Promise<{ lang: string; branch: string; topic: string }>;
}) {
  const { lang, branch, topic } = await params;
  const veri = konuYukle(branch, topic);

  if (!veri) notFound();

  const gate = await AccessGate({ topicId: topic, lang, branch });
  if (gate) return gate;

  const branchMeta = bransKunyesi(branch);
  const moduller = veri.moduller ?? {};

  /**
   * Bloklar BİR KEZ hazırlanıyor; hem içindekiler hem gövde AYNI diziden
   * besleniyor.
   *
   * Neden önemli: bölüm kimlikleri başlık metninden türüyor. İki yerde ayrı
   * diziden üretilseydi (biri ham, öteki kısaltması açılmış) kimlikler
   * ayrışabilir ve içindekilerdeki bağlantılar hiçbir yere gitmezdi.
   * `kisaltmaAcBloklar` bugün `baslik` alanına DOKUNMUYOR (yalnızca
   * `satirlar[].metin` ve `bilgi_kutusu.metin`), yani bugün ayrışma yok —
   * ama buna güvenmek kırılgan olurdu: kısaltma açılımı bir gün başlıkları
   * da kapsarsa bu kurgu kendiliğinden doğru kalır.
   */
  const bloklar = kisaltmaAcBloklar(veri.icerik, new Set<string>());
  const icindekiler = bolumBasliklari(bloklar);
  const govdeUzunlugu = JSON.stringify(bloklar)
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\p{L}\p{N} .,;:()/-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim().length;

  /**
   * Sayılar konu dosyasının ilanından DEĞİL, gerçek içerik dosyalarından.
   *
   * İlana güvenildiğinde 38 hazır konunun 5'i yanlış sayı gösteriyordu ve
   * ikisi çıkmaz sokaktı: graves-hastaligi "10 soru" deyip tıklanabilir
   * oluyordu ama quiz dosyası hiç yoktu; kml "12 flashcard" diyordu, kart
   * dosyası yoktu. Artık hem sayı hem bağlantı gerçeğe bakıyor.
   */
  const envanter = envanterAl(branch, topic);
  const istatistikler = {
    soru: envanter.soru,
    flashcard: envanter.flashcard,
    inci: envanter.inci,
    vaka: envanter.vaka,
  };

  /**
   * MODÜL KARTLARI DA GERÇEĞE BAKAR — yukarıdaki not bir dönem yalnızca
   * istatistikler için doğruydu.
   *
   * Sayılar envantere çevrildi ama aşağıdaki "Modüller" listesi konu
   * dosyasının İLANINDA (`veri.moduller`) kaldı. Yani aynı sayfada iki blok
   * iki ayrı gerçeğe bakıyordu: sayı "—" derken modül kartı tıklanabilir
   * duruyordu.
   *
   * Ölçüldü: 40 konuda 69 aktif ilan var, **6'sının hedefi yok** —
   * graves-hastaligi/quiz (yorumda "düzeltildi" yazan tam olarak bu),
   * kml/flashcard, aml-ana ve kml'de inciler + video.
   *
   * `video` her zaman kapalı: `MODUL_HREF.video` `/…/<konu>/video` adresine
   * gidiyor ama depoda böyle bir rota YOK, yani ilan eden her konu 404'e
   * bağlanıyordu. İçerik dosyaları (`content/premium/ydus/videos/`) duruyor;
   * sayfa yazılırsa buradaki `false` kaldırılır (bkz. SENDE-KALANLAR).
   */
  const MODUL_VAR: Record<string, boolean> = {
    quiz: envanter.quizVar,
    flashcard: envanter.flashcardVar,
    inciler: envanter.inciVar,
    vaka: envanter.vakaVar,
    video: false,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Kırıntı yolu — açık taraftaki kalıpla AYNI: adlandırılmış
            landmark + liste + aria-current. Ölçüldü: bu <nav> ADSIZDI ve
            konu sayfasında İKİ nav landmark'ı olup yalnızca biri adlıydı,
            yani ekran okuyucu ikisini ayırt edemiyordu.

            "Ana sayfa" -> "YDUS Hazırlık": bağlantı site köküne değil
            premium PANOSUNA gidiyor ve o sayfanın kendi <h1>'i
            "YDUS Hazırlık". Etiket gittiği yeri söylemeliydi. */}
        <nav aria-label="Kırıntı yolu" style={{ marginBottom: '1.5rem' }}>
          <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4a6a8a', listStyle: 'none', margin: 0, padding: 0 }}>
            {/* Kök "MediSea": açık taraf ve araç sayfaları da böyle
                başlıyor. Ayrıca premium ağacının açık siteye TEK çıkışı —
                ölçüldü, bu sayfalarda /, /topics ve /tools bağlantısı
                sayısı SIFIRDI. */}
            <li>
              <Link href="/" style={{ color: '#4a6a8a', textDecoration: 'none', fontWeight: 500, display: 'inline-block', padding: '4px 2px' }}>
                MediSea
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">/</span>
              <Link href={`/${lang}/premium/ydus`} style={{ color: '#1a3a6b', textDecoration: 'none', fontWeight: 500, display: 'inline-block', padding: '4px 2px' }}>
                YDUS Hazırlık
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">/</span>
              <Link href={`/${lang}/premium/ydus/${branch}`} style={{ color: branchMeta.renk, textDecoration: 'none', fontWeight: 500, display: 'inline-block', padding: '4px 2px' }}>
                {branchMeta.label}
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">/</span>
              <span aria-current="page" style={{ color: '#4a6a8a' }}>{veri.meta.baslik}</span>
            </li>
          </ol>
        </nav>

        {/* HERO */}
        <div style={{
          border: '0.5px solid #b8cfe8',
          borderLeft: `4px solid ${branchMeta.renk}`,
          borderRadius: '0 12px 12px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          background: '#f5f9ff',
        }}>
          {veri.meta.rozetler && veri.meta.rozetler.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {veri.meta.rozetler.map((rozet, i) => (
                <span key={i} style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: '#e6f0fb',
                  color: '#1a3a6b',
                  border: '0.5px solid #b8cfe8',
                }}>
                  {rozet}
                </span>
              ))}
            </div>
          )}
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.4rem' }}>
            {veri.meta.baslik}
          </h1>
          {veri.meta.altbaslik && (
            <p style={{ fontSize: '14px', color: '#4a6a8a', lineHeight: 1.6, margin: 0 }}>
              {veri.meta.altbaslik}
            </p>
          )}
        </div>

        {/* İKİ KOLON DÜZEN */}
        {/* Düzen satır içi stildeydi ve DAR EKRANDA HİÇ ÇÖKMÜYORDU: ölçüldü,
            320px'te sayfa 593px yatay kayıyordu (ızgara `652.406px 210px`).
            Medya sorgusu satır içi yazılamadığı için kural `globals.css`
            sonuna alındı; gerekçesi orada. */}
        <div className="premium-konu-izgara">

          {/* ANA İÇERİK */}
          <div>
            {/* İÇİNDEKİLER — `[data-readable]` KONTEYNERİNİN DIŞINDA.
                Vurgular konteyner metnindeki KARAKTER OFSETİYLE saklanıyor;
                içeri konsaydı ondan sonraki bütün ofsetler kayar ve deponun
                kuralı gereği ("ofset çözülüyor ama metin tutmuyor" -> SİLİNİR)
                kullanıcıların kayıtlı vurguları yok olurdu.

                Eşik açık taraftaki konu sayfasıyla AYNI (>=4 başlık ve
                >=6000 karakter) ama premium tarafta çok daha sık karşılanıyor:
                ölçüldü, 41 konunun 25'i (%61) — açık tarafta 410'un 50'si
                (%12). Premium gövdelerin ortancası 6 676 krk, açık tarafta
                3 002. */}
            {icindekiler.length >= 4 && govdeUzunlugu >= 6000 && (
              <nav
                aria-labelledby="premium-icindekiler"
                data-baskida-goster
                style={{
                  background: '#fff',
                  border: '0.5px solid #b8cfe8',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                }}
              >
                <h2 id="premium-icindekiler" style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#1a3a6b', margin: '0 0 0.6rem',
                }}>
                  Bu sayfada
                </h2>
                <ol style={{
                  listStyle: 'none', margin: 0, padding: 0,
                  display: 'grid', gap: '0.35rem 1.25rem',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                }}>
                  {icindekiler.map((b, i) => (
                    <li key={b.id} style={{ display: 'flex', gap: '7px', alignItems: 'baseline' }}>
                      <span aria-hidden="true" style={{
                        fontSize: '11px', fontWeight: 700, color: '#90b8e0',
                        fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <a href={`#${b.id}`} style={{
                        fontSize: '14px', lineHeight: 1.4, color: '#1a4a8b',
                        textDecoration: 'none', padding: '2px 0',
                      }}>
                        {b.baslik}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Tablo kaplarina "devami var" durumu yazar (maskeyi globals.css cizer).
                Premium tarafta 40 konunun 36'sinda 2+ tablo var. */}
            <KaydirDurumu />

            {/* data-readable: ReadingTools vurgulamayı bu blokla sınırlar */}
            <div data-readable>
              {/*
                Kısaltmalar ilk kullanımda açılımıyla veriliyor — açık taraftaki
                konu sayfasıyla aynı sözlük ve aynı kural (app/lib/kisaltma.ts).
                Küme burada kuruluyor, yani "ilk kullanım" bu konu sayfasının
                tamamı için geçerli.
              */}
              <IcerikRenderer bloklar={bloklar} />
            </div>

            {/* AI ASİSTAN — konuya soru sor */}
            <SoruSor branch={branch} topic={topic} baslik={veri.meta.baslik} />

            {/* ALT NAVİGASYON */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '0.5px solid #d0e4f5',
              gap: '8px',
            }}>
              <Link href={`/${lang}/premium/ydus/${branch}`} style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#1a3a6b',
                border: '0.5px solid #b8cfe8',
                borderRadius: '8px',
                padding: '7px 14px',
                background: '#f5f9ff',
                textDecoration: 'none',
              }}>
                ← {branchMeta.label}
              </Link>
              <Link href={`/${lang}/premium/ydus`} style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#1a3a6b',
                border: '0.5px solid #b8cfe8',
                borderRadius: '8px',
                padding: '7px 14px',
                background: '#f5f9ff',
                textDecoration: 'none',
              }}>
                {/* Kardeş branş sayfasıyla AYNI gerekçe: hedef site kökü
                    değil premium panosu, o sayfanın <h1>'i "YDUS Hazırlık",
                    ve bu sayfanın kırıntısı zaten öyle diyor. Yanındaki
                    düğme de hedefini adıyla söylüyor ("← Nefroloji"). */}
                YDUS Hazırlık
              </Link>
            </div>
          </div>

          {/* SAĞ RAIL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'sticky', top: '1rem' }}>

            {/* MODÜLLER */}
            <div style={{
              border: '0.5px solid #d0e4f5',
              borderRadius: '12px',
              padding: '1rem',
              background: '#fafcff',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#1a3a6b',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.07em',
                marginBottom: '0.6rem',
              }}>
                Modüller
              </div>
              {(Object.entries(moduller) as [string, boolean][]).map(([key, ilan]) => {
                const bilgi = MODUL_BILGI[key as keyof typeof MODUL_BILGI];
                if (!bilgi) return null;
                // İlan YETMEZ: hedef içerik gerçekten var mı?
                const aktif = ilan && (MODUL_VAR[key] ?? false);
                const href = MODUL_HREF[key]?.(lang, branch, topic) ?? '#';
                return (
                  <Link
                    key={key}
                    href={aktif ? href : '#'}
                    /* Aynı kusur kardeş yüzeyde de vardı: etkin olmayan modül
                       fareyle tıklanamıyor ama klavyeyle odaklanılabiliyordu.
                       Bkz. KategorilerClient — orada ölçüldü. */
                    tabIndex={aktif ? undefined : -1}
                    aria-disabled={aktif ? undefined : true}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: '0.5px solid #d8e8f5',
                      background: aktif ? '#fff' : '#f5f7fa',
                      marginBottom: '6px',
                      textDecoration: 'none',
                      /* SAYDAMLIK KALDIRILDI — ölçümle. `opacity: 0.55` etkin
                         olmayan modül satırında adı 3.44, "Yakında" rozetini
                         2.24 kontrasta düşürüyordu; satırın bilgi taşıyan iki
                         parçası da okunmaz oluyordu.
                         "Etkin değil" işareti zaten üç kanalda: soluk zemin
                         (#f5f7fa), "Yakında" rozeti ve tıklanamazlık
                         (pointerEvents: none). Saydamlık bir şey eklemiyordu. */
                      cursor: aktif ? 'pointer' : 'default',
                      pointerEvents: aktif ? 'auto' : 'none',
                    }}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: bilgi.renk,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      flexShrink: 0,
                    }}>
                      {bilgi.emoji}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#1a2a3a', flex: 1 }}>
                      {bilgi.etiket}
                    </span>
                    {!aktif && (
                      <span style={{ fontSize: '10px', color: '#4a6a8a' }}>Yakında</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* İSTATİSTİKLER */}
            {Object.keys(istatistikler).length > 0 && (
              <div style={{
                border: '0.5px solid #d0e4f5',
                borderRadius: '12px',
                padding: '1rem',
                background: '#fafcff',
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#1a3a6b',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.07em',
                  marginBottom: '0.6rem',
                }}>
                  İçerik
                </div>
                <style>{`.stat-link:hover { background: #eef4fc; }`}</style>
                {/* Bağlantı, modül bayrağına değil DOSYANIN VARLIĞINA bakıyor:
                    bayrak açık ama dosya yokken kullanıcı çıkmaz sokağa gidiyordu. */}
                {istatistikler.soru !== undefined && (
                  envanter.quizVar ? (
                    <Link href={`/${lang}/premium/ydus/quiz-coz?branch=${branch}&id=${topic}-quiz-1`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', marginBottom: '2px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>📝 Soru</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.soru || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px', marginBottom: '2px' }}>
                      <span style={{ color: '#4a6a8a' }}>📝 Soru</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.soru || '—'}</span>
                    </div>
                  )
                )}
                {istatistikler.flashcard !== undefined && (
                  envanter.flashcardVar ? (
                    <Link href={`/${lang}/premium/ydus/hizli-tekrar?branch=${branch}&id=${topic}`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', marginBottom: '2px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>🃏 Flashcard</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.flashcard || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px', marginBottom: '2px' }}>
                      <span style={{ color: '#4a6a8a' }}>🃏 Flashcard</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.flashcard || '—'}</span>
                    </div>
                  )
                )}
                {istatistikler.inci !== undefined && (
                  envanter.inciVar ? (
                    <Link href={`/${lang}/premium/ydus/inciler?branch=${branch}&id=${topic}`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>💎 İnci</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.inci || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px' }}>
                      <span style={{ color: '#4a6a8a' }}>💎 İnci</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.inci || '—'}</span>
                    </div>
                  )
                )}
                {istatistikler.vaka !== undefined && (
                  envanter.vakaVar ? (
                    <Link href={`/${lang}/premium/ydus/vaka-coz?branch=${branch}&topic=${topic}`}
                      className="stat-link"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 6px', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ color: '#4a6a8a' }}>🏥 Vaka</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.vaka || '—'}</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 6px' }}>
                      <span style={{ color: '#4a6a8a' }}>🏥 Vaka</span>
                      <span style={{ fontWeight: 600, color: '#1a3a6b' }}>{istatistikler.vaka || '—'}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/**
              * GÜNCELLEME — ham dize DEĞİL, okunabilir ay.
              *
              * Ölçüldü (yerel üretim derlemesi, kapı geçici açılarak): sayfa
              * `Güncelleme: 2026-07` basıyordu. Aynı bilgi AÇIK tarafta
              * `Güncelleme: 10 Haz 2026` diye çıkıyor — yani ücretli yüzey
              * makine dizesi, ücretsiz yüzey Türkçe tarih gösteriyordu.
              *
              * Ayrıca doğrulama YOKTU: `guncelleme` alanına ne yazılırsa
              * ekrana o basılıyordu. Açık tarafta bu bir kez kusur üretmişti
              * (29 konu Türkçe sayfada İngilizce ay adı gösteriyordu) ve
              * çözümü `isoTarih`/`tarihYazisi` zincirine bağlamak olmuştu.
              *
              * `tarihYazisi` DEĞİL `ayYazisi`: veri ay kesinliğinde
              * (`"2026-07"`, 41 dosyanın 41'inde) ve `tarihYazisi` gün
              * uydururdu ("01 Tem 2026").
              *
              * Geçersiz değerde alan HİÇ basılmıyor — deponun kuralı:
              * geçersiz bir tarih basmaktansa sinyali vermemek doğru.
              */}
            {/* Klinik sorumluluk — KABUKTAN geliyor, icerikten degil.
                Olculdu: 44 premium konunun 32sinde hicbir sorumluluk ifadesi
                yok ve (ydus) yerlesiminin alt bilgisi de yok — yani acik
                taraftaki alt bilgi bu sayfalari kapsamiyor.
                Satir ici stil: bu yuzeyde globals.css tabanlari islemiyor,
                boyut ve renk elle veriliyor (#4a6a8a beyazda 5.65). */}
            <p style={{ fontSize: '11px', lineHeight: 1.6, color: '#4a6a8a', textAlign: 'center' }}>
              {KLINIK_SORUMLULUK}
            </p>

            {ayYazisi(veri.meta.guncelleme) && (
              <div style={{ fontSize: '11px', color: '#4a6a8a', textAlign: 'center' }}>
                Güncelleme: {ayYazisi(veri.meta.guncelleme)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
