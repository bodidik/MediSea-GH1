import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import FlashcardPlayer from './FlashcardPlayer';
import Link from 'next/link';
import { AccessGate } from '@/lib/AccessGate';
import { envanterAl } from '@/lib/premium-envanter';
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

/**
 * Set dosyasının kimliğinden KONU kimliğine iner: `asit-…-set-2` → `asit-…`.
 *
 * "Konuya dön" bağlantısı set kimliğini olduğu gibi kullanıyordu; ikinci set
 * girer girmez o bağlantı var olmayan bir konu sayfasına (404) gidiyordu.
 * Erişim kapısı da konu kimliğiyle sorulmalı — set başına ayrı bir erişim
 * kaydı yok.
 */
const konuKimligi = (id: string) => id.replace(/-set-\d+$/, "");

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


/** Kendi metadata'si: yoksa kok duzenin canonical "/" degeri miras aliniyor
 *  (bkz. kardes brans sayfasi). Kullanici verisi ICERMEZ. */
export const metadata: Metadata = {
  ...rotaMeta({
    baslik: "Hızlı Tekrar — YDUS",
    aciklama: "Kısa aralıklarla sınav odaklı hızlı tekrar oturumu.",
    yol: "/tr/premium/ydus/hizli-tekrar",
  }),
};

export default async function HizliTekrarSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ branch?: string; id?: string; topic?: string }>;
}) {
  const { lang } = await params;
  const { branch, id, topic } = await searchParams;

  if (!branch || !isValidParam(branch)) notFound();

  /**
   * SET SEÇİMİ — `id` yerine `topic` verilirse.
   *
   * Bir konunun birden fazla hızlı tekrar seti olabiliyor; konu sayfasındaki
   * modül kartı tek bir sete çakılı kalırsa okuyucu ötekileri hiç göremez.
   * `topic` ile gelindiğinde tek set varsa doğrudan o set oynatılır (araya
   * gereksiz bir tıklama girmez), birden fazlaysa seçim listesi çizilir.
   */
  if (!id) {
    if (!topic || !isValidParam(topic)) notFound();

    const setler = envanterAl(branch, topic).flashcardSetleri;
    if (setler.length === 0) notFound();

    const gate = await AccessGate({ topicId: topic, lang, branch });
    if (gate) return gate;

    if (setler.length === 1) {
      return oynatici(branch, setler[0].id, lang);
    }

    const toplam = setler.reduce((t, s) => t + s.sayi, 0);
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a2a3a' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <Link href={`/${lang}/premium/ydus/${branch}/${topic}`}
            style={{ fontSize: '12px', color: '#4a6a8a', textDecoration: 'none', display: 'inline-block', padding: '8px 0' }}>
            ← Konuya dön
          </Link>
          <h1 style={{ fontSize: '18px', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Hızlı tekrar setleri</h1>
          <p style={{ fontSize: '12px', color: '#4a6a8a', margin: '0 0 1rem' }}>
            {setler.length} set · toplam {toplam} kart. Çalışmak istediğin seti seç.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {setler.map((set, i) => (
              <li key={set.id}>
                <Link href={`/${lang}/premium/ydus/hizli-tekrar?branch=${branch}&id=${set.id}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', minHeight: '44px', padding: '12px 14px', border: '0.5px solid #d0e4f5', borderRadius: '12px', background: '#fafcff', textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', color: '#4a6a8a', fontWeight: 600 }}>{i + 1}. set</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a3a6b' }}>{set.baslik}</span>
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a3a6b', flexShrink: 0 }}>{set.sayi} kart</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (!isValidParam(id)) notFound();
  return oynatici(branch, id, lang, true);
}

/** Tek bir seti oynatır. `kapi` false ise erişim zaten sorulmuştur. */
async function oynatici(branch: string, id: string, lang: string, kapi = false) {
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

  const konu = konuKimligi(id);

  if (kapi) {
    const gate = await AccessGate({ topicId: konu, lang, branch });
    if (gate) return gate;
  }

  const backHref = `/${lang}/premium/ydus/${branch}/${konu}`;

  return (
    <FlashcardPlayer
      cards={veri.cards}
      topic={veri.topic}
      backHref={backHref}
      setId={veri.id || id}
    />
  );
}