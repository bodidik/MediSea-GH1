import fs from 'fs';
import path from 'path';
import QuizEngine from './QuizEngine';

// KAPTANIN DİNAMİK VERİ OKUYUCUSU
export default async function QuizPage({
  searchParams,
}: {
  searchParams: { branch: string; id: string };
}) {
  // URL'den gelen ?branch=... ve &id=... parametrelerini yakalıyoruz
  const branch = searchParams?.branch;
  const id = searchParams?.id;

  if (!branch || !id) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-red-900/20 text-red-400 p-8 rounded-2xl border border-red-500/30 text-center shadow-2xl">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-black tracking-widest uppercase mb-2">Rota Hatası</h2>
          <p className="text-sm">Gidilecek branş veya sınav dosyası belirtilmedi.</p>
        </div>
      </div>
    );
  }

  try {
    // Dinamik Dosya Yolu: Hangi branş ve ID gelirse o JSON okunur!
    const filePath = path.join(
      process.cwd(), 
      `content/premium/ydus/quizzes/${branch}/${id}.json`
    );
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return <QuizEngine data={data} />;
    
  } catch (error) {
    console.error("Quiz veri okuma hatası:", error);
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-slate-900 text-slate-400 p-8 rounded-2xl border border-slate-800 text-center shadow-2xl">
          <span className="text-4xl mb-4 block">🌊</span>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Kayıt Bulunamadı</h2>
          <p className="text-sm">
            <span className="text-blue-400 font-mono">{branch}/{id}.json</span> seyir defterinde yok.
          </p>
        </div>
      </div>
    );
  }
}