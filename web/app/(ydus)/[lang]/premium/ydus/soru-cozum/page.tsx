import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import YdusCockpit from './YdusCockpit';
import { AccessGate } from '@/lib/AccessGate';

export const revalidate = 86400;

// branch ve id doğrudan dosya yoluna giriyor. Süzgeç olmadan
// ?branch=../../../.. ile depo dışındaki her .json okunabiliyordu.
const isValidParam = (p: string) => /^[a-zA-Z0-9-]+$/.test(p);

function vakaYukle(branch: string, id: string) {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'cases', branch, `${id}.json`
    );
    return JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8'));
  } catch {
    return null;
  }
}

export default async function SoruCozumPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ branch?: string; id?: string }>;
}) {
  const { lang } = await props.params;
  const { branch, id } = await props.searchParams;

  if (!branch || !id || !isValidParam(branch) || !isValidParam(id)) notFound();

  // Vakaların kendi konu sayfası yok; kapı vaka kimliğiyle kuruluyor.
  // Tanınmayan kimlik ContentAccess'te premium sayıldığı için varsayılan kapalı.
  const gate = await AccessGate({ topicId: id, lang, branch });
  if (gate) return gate;

  const veri = vakaYukle(branch, id);
  if (!veri) notFound();

  return <YdusCockpit data={veri} />;
}
