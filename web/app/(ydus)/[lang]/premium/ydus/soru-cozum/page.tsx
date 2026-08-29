import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import YdusCockpit from './YdusCockpit';
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
    baslik: "Soru Çözüm Kokpiti — YDUS",
    aciklama: "Soru çözüm kokpiti: şık analizi ve karar gerekçeleri.",
    yol: "/tr/premium/ydus/soru-cozum",
  }),
};

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
