import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import QuizEngine from './QuizEngine';
import { AccessGate } from '@/lib/AccessGate';
import { rotaMeta } from "@/lib/site";

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

const isValidParam = (p: string) => /^[a-zA-Z0-9-]+$/.test(p);

/** Konu dosyası GERÇEKTEN var mı? İlan yetmez — bkz. `quizYukle` içindeki `topic`. */
function konuVar(branch: string, topic: string) {
  if (!topic || !isValidParam(topic)) return false;
  return fs.existsSync(
    path.join(process.cwd(), 'content', 'premium', 'ydus', 'topics', branch, `${topic}.json`)
  );
}

/**
 * İKİ ŞEMA BİR ARADA — künye üst düzeyde YA DA `meta` içinde.
 *
 *   kanonik : { id, baslik, branch, topic, sorular }        39 dosya
 *   sapan   : { meta: { quizId, baslik, branch, topicId }, sorular }   1 dosya
 *
 * Motor üst düzeyi okuyor; sapan dosyada `veri.id` ve `veri.baslik`
 * UNDEFINED kalıyordu. Ölçülen üç sonuç:
 *   - ilerleme anahtarı `quiz-progress-undefined` (künyesiz her quiz AYNI
 *     anahtarı paylaşır; bugün tek dosya, yarın ikincisi eklenirse bir
 *     kullanıcının cevapları öteki quize geri yüklenir),
 *   - `<h1>` BOŞ basılıyor,
 *   - `veri.topic` yok, geri bağlantısı konuya değil branşa düşüyor.
 *
 * İçerik dosyasına DOKUNULMUYOR (içerik kullanıcının sorumluluğu);
 * düzeltme okuma tarafında — `VakaEngine`deki `meta` düzleştirmesiyle
 * aynı karar. Üst düzey ÖNCELİKLİ, yani 39 kanonik dosyanın davranışı
 * ve kayıtlı ilerlemeleri birebir korunuyor.
 */
function quizYukle(branch: string, id: string) {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'quizzes', branch, `${id}.json`
    );
    const ham = JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8'));
    const m = ham?.meta ?? {};

    /**
     * `topic` bir GERİ BAĞLANTI kaynağı: QuizEngine "← Konuya dön"u ondan
     * kuruyor. İlanın doğru olduğu VARSAYILIYORDU ve bir dosyada değildi —
     * ölçüldü (canlı):
     *
     *   gogus-hastaliklari/hkp-quiz-1  ->  topic: "hkp-vip"
     *   /tr/premium/ydus/gogus-hastaliklari/hkp-vip  ->  404
     *   .../hkp ve .../tkp                           ->  200
     *
     * Yani ücretli bir quizin tek çıkış bağlantısı çıkmaza gidiyordu.
     * Üstelik bu sayfa DOĞRU konuyu zaten hesaplıyor: `AccessGate`e verilen
     * `topicId` dosya adından türüyor (`hkp-quiz-1` -> `hkp`) ve o var. Aynı
     * dosyada iki gerçeklik: kapı doğru konuyu biliyor, bağlantı bilmiyor.
     *
     * İçerik dosyasına DOKUNULMUYOR (içerik kullanıcının sorumluluğu);
     * düzeltme okuma tarafında ve İLAN ÖNCELİKLİ — 40 dosyanın 39'unda ilan
     * zaten doğru ve davranışları birebir korunuyor. İlan tutmuyorsa dosya
     * adından türetilene, o da yoksa `undefined`a düşülüyor; motor o durumda
     * zaten branş bağlantısına iniyor.
     */
    const ilan = ham.topic ?? m.topicId;
    const dosyadan = id.replace(/-quiz-\d+$/, '');
    const topic = konuVar(branch, ilan) ? ilan : konuVar(branch, dosyadan) ? dosyadan : undefined;

    return {
      ...ham,
      // Künyesiz dosyada son çare DOSYA ADI: benzersiz ve kararlı.
      id: ham.id ?? m.quizId ?? id,
      baslik: ham.baslik ?? m.baslik ?? '',
      branch: ham.branch ?? m.branch ?? branch,
      topic,
    };
  } catch {
    return null;
  }
}

/**
 * Kendi metadata'sı OLMAK ZORUNDA: yoksa kök düzenin
 * `alternates: { canonical: "/" }` değeri miras alınıyor ve sayfa kendini
 * ana sayfanın kopyası ilan ediyor (kardeş branş sayfasındaki gerekçe).
 * `openGraph` artık `rotaMeta` üzerinden geliyor. Bir dönem burada bilerek
 * TANIMLANMIYORDU ("kökteki dosya tabanlı paylaşım görseli miras kalsın")
 * ve o inanç ÖLÇÜMLE ÇÜRÜTÜLDÜ: `images` verilmedikçe görsel mirası
 * sürüyor (`/tools/bmi` ikisini birden yapıyor). İnancın bedeli, sekme
 * başlığı düzelmişken PAYLAŞIM KARTININ hâlâ ana sayfayı göstermesiydi.
 */
export const metadata: Metadata = {
  ...rotaMeta({
    baslik: "Soru Çöz — YDUS",
    aciklama: "YDUS soru setlerini çöz; her soruda çözüm ve açıklama.",
    yol: "/tr/premium/ydus/quiz-coz",
  }),
};

export default async function QuizCozPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ branch?: string; id?: string }>;
}) {
  const { lang } = await props.params;
  const { branch, id } = await props.searchParams;

  const S = {
    minHeight: '80vh', background: '#fff',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '2rem',
  };

  if (!branch || !id || !isValidParam(branch) || !isValidParam(id)) {
    // Teknik ayrıntı sunucu günlüğüne; kullanıcı arayüzünde parametre adı geçmez.
    console.error('[quiz-coz] geçersiz parametre:', { branch, id });
    return (
      <div style={S}>
        <div aria-hidden="true" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧭</div>
        <h1 style={{ color: '#1a3a6b', fontSize: '18px', marginBottom: '.5rem' }}>Bu quiz açılamadı</h1>
        <p style={{ color: '#4a6a8a', fontSize: '13px', marginBottom: '1.5rem', textAlign: 'center' }}>
          Adres eksik görünüyor. Quizlere konu sayfalarından ulaşabilirsin.
        </p>
        <Link href={`/${lang}/premium/ydus`} style={{
          padding: '8px 18px', background: '#1a3a6b', color: '#fff',
          borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
        }}>
          ← YDUS panosuna dön
        </Link>
      </div>
    );
  }

  // "sarkoidoz-quiz-1" → "sarkoidoz"
  const topicId = id.replace(/-quiz-\d+$/, '');
  const gate = await AccessGate({ topicId, lang, branch });
  if (gate) return gate;

  const veri = quizYukle(branch, id);

  if (!veri) {
    // Hangi dosyanın eksik olduğu bakım için gerekli ama kullanıcının işi değil.
    console.error('[quiz-coz] quiz dosyası okunamadı:', `${branch}/${id}.json`);
    return (
      <div style={S}>
        <div aria-hidden="true" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ color: '#1a3a6b', fontSize: '18px', marginBottom: '.5rem' }}>Quiz bulunamadı</h1>
        <p style={{ color: '#4a6a8a', fontSize: '13px', marginBottom: '1.5rem', textAlign: 'center' }}>
          Bu quiz kaldırılmış ya da adresi değişmiş olabilir.
        </p>
        <Link href={`/${lang}/premium/ydus/${branch}`} style={{
          padding: '8px 18px', background: '#1a3a6b', color: '#fff',
          borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
        }}>
          ← Branşa dön
        </Link>
      </div>
    );
  }

  return <QuizEngine veri={veri} lang={lang} branch={branch} />;
}