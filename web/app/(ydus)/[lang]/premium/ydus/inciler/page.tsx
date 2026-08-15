import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import PearlsViewer from './PearlsViewer';
import { AccessGate } from '@/lib/AccessGate';

// Güvenlik: Sadece harf, rakam ve tire (-) işaretine izin veren kalkan
const isValidParam = (param: string) => /^[a-zA-Z0-9-]+$/.test(param);

/**
 * Hata kartı — üç durum için tek şablon.
 *
 * Üçü de ayrı ayrı yazılmıştı ve üçünde de aynı sınıf kusur vardı:
 * - dosya yolu kullanıcıya gösteriliyordu (`hematoloji/aml.json`),
 * - bozuk bir bağlantıya düşen kullanıcı "🏴‍☠️ Güvenlik İhlali" ile
 *   suçlanıyordu,
 * - hiçbirinde geri dönüş yolu yoktu; kullanıcı çıkmazda kalıyordu.
 *
 * Teknik ayrıntı kullanıcıya değil `console.error`'a gider.
 */
function HataKarti({ baslik, aciklama }: { baslik: string; aciklama: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 p-6">
      <div className="max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <span className="mb-4 block text-4xl" aria-hidden="true">🌊</span>
        <h1 className="mb-2 text-xl font-black uppercase tracking-widest text-white">
          {baslik}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-400">{aciklama}</p>
        <Link
          href="/tr/premium/ydus"
          className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500"
        >
          YDUS ana sayfasına dön
        </Link>
      </div>
    </div>
  );
}

export default async function PearlsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ branch?: string; id?: string }>; // Next.js 15 Uyumlu Promise Yapısı
}) {
  // 1. Parametreleri bekliyoruz (Next.js 15 kuralı)
  const { lang } = await params;
  const resolvedParams = await searchParams;
  const branch = resolvedParams?.branch;
  const id = resolvedParams?.id;

  // 2. Eksik Parametre Kontrolü
  if (!branch || !id) {
    return (
      <HataKarti
        baslik="İnciler açılamadı"
        aciklama="Bağlantıda hangi konunun incilerinin gösterileceği belirtilmemiş. Konuya dönüp yeniden deneyebilirsin."
      />
    );
  }

  // 3. Güvenlik Duvarı (Path Traversal Koruması)
  if (!isValidParam(branch) || !isValidParam(id)) {
    return (
      <HataKarti
        baslik="Bağlantı geçerli değil"
        aciklama="Adresteki bilgiler tanınmadı. Bağlantı bozulmuş ya da eksik kopyalanmış olabilir."
      />
    );
  }

  /**
   * 4. ERİŞİM KAPISI — bu sayfa ücretli içerik sunuyor.
   *
   * Kapı YOKTU: giriş yapmamış bir ziyaretçi bu adrese doğrudan gidince
   * on incinin tam klinik metnini okuyabiliyordu. Ölçüldü (canlı, oturumsuz):
   * sayfa 200 dönüyor ve "AML Onkolojik Aciller ve Nakil İncileri" başlığıyla
   * bütün içerik basılıyordu. Kardeş sayfaların hepsinde kapı var —
   * hizli-tekrar, quiz-coz, soru-cozum, vaka-coz, konu sayfası — yalnızca
   * burada unutulmuştu. Tekrarlanan bir yetki kontrolünün tek bir yerde
   * unutulması, projede daha önce /api/topics PUT uçlarında da yaşandı.
   *
   * robots.txt bu yolu taramaya kapatıyor ama o yalnızca arama motorunu
   * bağlar; adresi bilen herkes içeriği okuyabiliyordu.
   */
  const gate = await AccessGate({ topicId: id, lang, branch });
  if (gate) return gate;

  try {
    // 5. Dinamik Dosya Yolu: content/premium/ydus/pearls/hematoloji/aml.json
    const filePath = path.join(
      process.cwd(), 
      `content/premium/ydus/pearls/${branch}/${id}.json`
    );
    
    // JSON dosyasını okuyoruz
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // 5. Veriyi o mükemmel PearlsViewer arayüzüne iletiyoruz
    return <PearlsViewer data={data} />;
  } catch (error) {
    console.error("İnciler veri okuma hatası:", error);
    return (
      <HataKarti
        baslik="Bu konunun incileri yok"
        aciklama="Bu başlık için henüz klinik inci hazırlanmamış. Diğer konularda hazır olanları görebilirsin."
      />
    );
  }
}