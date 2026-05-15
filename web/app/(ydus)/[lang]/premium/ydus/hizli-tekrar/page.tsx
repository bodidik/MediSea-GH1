import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation'; // Next.js standart 404 mekanizması
import FlashcardViewer from './FlashcardViewer';

// --- GÜVENLİK KALKANI ---
// Sadece güvenli karakterlere izin vererek Path Traversal saldırılarını engeller
const isValidParam = (param: string) => /^[a-zA-Z0-9-]+$/.test(param);

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; id?: string }>;
}) {
  // 1. Next.js 15 Async Params Bekleme
  const { branch, id } = await searchParams;

  // 2. Eksik Parametre veya Güvenlik İhlali Kontrolü
  if (!branch || !id || !isValidParam(branch) || !isValidParam(id)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="bg-red-900/20 text-red-400 p-8 rounded-2xl border border-red-500/30 text-center shadow-2xl max-w-md mx-4">
          <span className="text-4xl mb-4 block">🏴‍☠️</span>
          <h2 className="text-xl font-black tracking-widest uppercase mb-2">Erişim Engellendi</h2>
          <p className="text-sm opacity-80">Geçersiz rota parametreleri veya eksik veri isteği saptandı.</p>
        </div>
      </div>
    );
  }

  try {
    // 3. Dosya Yolu İnşası
    const filePath = path.join(
      process.cwd(), 
      'content', 'premium', 'ydus', 'flashcards', branch, `${id}.json`
    );

    // 4. Dosya Varlık Kontrolü (readFileSync hata fırlatmadan önce kontrol etmek daha temizdir)
    if (!fs.existsSync(filePath)) {
      throw new Error('FILE_NOT_FOUND');
    }

    // 5. Veriyi Oku ve Parse Et
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // 6. Başarılı Render
    return <FlashcardViewer data={data} />;

  } catch (error: any) {
    console.error("Flashcard Sistem Hatası:", error.message);

    // Deste bulunamadığında gösterilecek özel "Denizci" temalı hata ekranı
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 text-center shadow-2xl backdrop-blur-sm">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">Deste Arşivde Yok</h2>
          <p className="text-slate-400 text-sm mb-6">
            <span className="text-blue-400 font-mono bg-blue-400/10 px-2 py-1 rounded">{branch}/{id}</span> 
            <br />yolu üzerinde herhangi bir veri kaydı bulunamadı.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }
}