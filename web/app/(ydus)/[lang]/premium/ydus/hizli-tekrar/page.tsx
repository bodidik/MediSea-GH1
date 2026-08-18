import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import FlashcardPlayer from './FlashcardPlayer';
import { AccessGate } from '@/lib/AccessGate';

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

  /**
   * Kart dizisi OKUNABİLİR olmalı — yoksa oynatıcı çöker, boş kalmaz.
   *
   * `FlashcardPlayer` prop'u `Card[]` sanıyor ve `cards.map` / `shuffle`
   * çağırıyor; `undefined` gelirse istemci bileşeni hata veriyor. Bugün
   * 21 kart dosyasının hepsi `cards` taşıyor, yani bu dal tetiklenmiyor —
   * ama şema ayrışması bu depoda ölçülmüş bir olay (bkz. premium-envanter
   * içindeki not) ve çökme, çıkmaz sokaktan beterdir.
   */
  if (!Array.isArray(veri.cards) || veri.cards.length === 0) notFound();

  const gate = await AccessGate({ topicId: id!, lang, branch: branch! });
  if (gate) return gate;

  const backHref = `/${lang}/premium/ydus/${branch}/${id}`;

  return (
    <FlashcardPlayer
      cards={veri.cards}
      topic={veri.topic}
      backHref={backHref}
      setId={veri.id || id}
    />
  );
}