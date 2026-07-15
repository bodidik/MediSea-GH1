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
    return (
      <div style={S}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#1a3a6b', fontSize: '18px', marginBottom: '.5rem' }}>Parametre eksik</h2>
        <p style={{ color: '#6a8aaa', fontSize: '13px' }}>branch ve id zorunludur.</p>
      </div>
    );
  }

  // "sarkoidoz-quiz-1" → "sarkoidoz"
  const topicId = id.replace(/-quiz-\d+$/, '');
  const gate = await AccessGate({ topicId, lang, branch });
  if (gate) return gate;

  const veri = quizYukle(branch, id);

  if (!veri) {
    return (
      <div style={S}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ color: '#1a3a6b', fontSize: '18px', marginBottom: '.5rem' }}>Quiz bulunamadı</h2>
        <p style={{ color: '#6a8aaa', fontSize: '13px', marginBottom: '1.5rem' }}>
          <code style={{ background: '#f0f4f8', padding: '2px 6px', borderRadius: '4px' }}>{branch}/{id}.json</code> mevcut değil.
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