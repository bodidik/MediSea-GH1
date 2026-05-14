import fs from 'fs';
import path from 'path';
import YdusCockpit from './YdusCockpit';

// KAPTANIN DİNAMİK VAKA (CASE) OKUYUCUSU
export default async function SoruCozumPage({
  searchParams,
}: {
  searchParams: { branch: string; id: string };
}) {
  // URL'den gelen emirleri yakala (Örn: ?branch=nefroloji&id=case-sle-nefrit-001)
  const branch = searchParams?.branch;
  const id = searchParams?.id;

  if (!branch || !id) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-red-900/20 text-red-400 p-8 rounded-2xl border border-red-500/30 text-center shadow-2xl">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-black tracking-widest uppercase mb-2">Rota Hatası</h2>
          <p className="text-sm">Gidilecek branş veya vaka (case) dosyası belirtilmedi.</p>
        </div>
      </div>
    );
  }

  try {
    // Dinamik Dosya Yolu
    const filePath = path.join(
      process.cwd(), 
      `content/premium/ydus/cases/${branch}/${id}.json`
    );
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const caseData = JSON.parse(fileContents);
    
    return (
      <main className="min-h-screen bg-slate-950 p-2">
        <YdusCockpit data={caseData} />
      </main>
    );
    
  } catch (error) {
    console.error("Vaka okuma hatası:", error);
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-slate-900 text-slate-400 p-8 rounded-2xl border border-slate-800 text-center shadow-2xl">
          <span className="text-4xl mb-4 block">🌊</span>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Vaka Bulunamadı</h2>
          <p className="text-sm">
            <span className="text-blue-400 font-mono">{branch}/{id}.json</span> seyir defterinde yok.
          </p>
        </div>
      </div>
    );
  }
}