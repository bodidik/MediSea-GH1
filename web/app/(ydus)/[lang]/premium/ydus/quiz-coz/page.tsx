import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import QuizEngine from './QuizEngine';
import { AccessGate } from '@/lib/AccessGate';

export const revalidate = 86400;

const isValidParam = (p: string) => /^[a-zA-Z0-9-]+$/.test(p);

function quizYukle(branch: string, id: string) {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'quizzes', branch, `${id}.json`
    );
    return JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Kendi metadata'sı OLMAK ZORUNDA: yoksa kök düzenin
 * `alternates: { canonical: "/" }` değeri miras alınıyor ve sayfa kendini
 * ana sayfanın kopyası ilan ediyor (kardeş branş sayfasındaki gerekçe).
 * `openGraph` bilerek TANIMLANMIYOR — kökteki dosya tabanlı paylaşım
 * görseli miras kalsın.
 */
export const metadata: Metadata = {
  title: "Soru Çöz — YDUS",
  description: "YDUS soru setlerini çöz; her soruda çözüm ve açıklama.",
  alternates: { canonical: "/tr/premium/ydus/quiz-coz" },
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