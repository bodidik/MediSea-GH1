import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import FlashcardPlayer from './FlashcardPlayer';

export const revalidate = 86400;

interface Card {
  id: string;
  front: string;
  back: string;
  tag: string;
}

interface FlashcardVeri {
  id: string;
  topic: string;
  description?: string;
  cards: Card[];
}

const isValidParam = (param: string) => /^[a-zA-Z0-9-]+$/.test(param);

function flashcardYukle(branch: string, id: string): FlashcardVeri | null {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'flashcards', branch, `${id}.json`
    );
    const icerik = fs.readFileSync(dosyaYolu, 'utf-8');
    return JSON.parse(icerik) as FlashcardVeri;
  } catch {
    return null;
  }
}

export default async function HizliTekrarSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ branch?: string; id?: string }>;
}) {
  const { lang } = await params;
  const { branch, id } = await searchParams;

  if (!branch || !id || !isValidParam(branch) || !isValidParam(id)) notFound();

  const veri = flashcardYukle(branch, id);
  if (!veri) notFound();

  const backHref = `/${lang}/premium/ydus/${branch}/${id}`;

  return (
    <FlashcardPlayer
      cards={veri.cards}
      topic={veri.topic}
      backHref={backHref}
    />
  );
}