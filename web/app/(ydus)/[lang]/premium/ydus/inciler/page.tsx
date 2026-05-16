import fs from 'fs';
import path from 'path';
import PearlsViewer from './PearlsViewer';

// Güvenlik: Sadece harf, rakam ve tire (-) işaretine izin veren kalkan
const isValidParam = (param: string) => /^[a-zA-Z0-9-]+$/.test(param);

export default async function PearlsPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; id?: string }>; // Next.js 15 Uyumlu Promise Yapısı
}) {
  // 1. Parametreleri bekliyoruz (Next.js 15 kuralı)
  const resolvedParams = await searchParams;
  const branch = resolvedParams?.branch;
  const id = resolvedParams?.id;

  // 2. Eksik Parametre Kontrolü
  if (!branch || !id) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-red-900/20 text-red-400 p-8 rounded-2xl border border-red-500/30 text-center shadow-2xl">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-black tracking-widest uppercase mb-2">Rota Hatası</h2>
          <p className="text-sm">Gidilecek branş veya istihbarat dosyası belirtilmedi.</p>
        </div>
      </div>
    );
  }

  // 3. Güvenlik Duvarı (Path Traversal Koruması)
  if (!isValidParam(branch) || !isValidParam(id)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-red-900/20 text-red-400 p-8 rounded-2xl border border-red-500/30 text-center shadow-2xl">
          <span className="text-4xl mb-4 block">🏴‍☠️</span>
          <h2 className="text-2xl font-black tracking-widest uppercase mb-2">Güvenlik İhlali</h2>
          <p className="text-sm">Geçersiz rota parametreleri tespit edildi.</p>
        </div>
      </div>
    );
  }

  try {
    // 4. Dinamik Dosya Yolu: content/premium/ydus/pearls/hematoloji/aml.json
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
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-slate-900 text-slate-400 p-8 rounded-2xl border border-slate-800 text-center shadow-2xl">
          <span className="text-4xl mb-4 block">🌊</span>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">İstihbarat Bulunamadı</h2>
          <p className="text-sm">
            <span className="text-blue-400 font-mono">{branch}/{id}.json</span> adlı gizli dosya arşivde yok.
          </p>
        </div>
      </div>
    );
  }
}