import fs from 'fs';
import path from 'path';

// 👇 TİP TANIMLAMALARI
export type CanonicalDoc = {
  title: string;
  meta?: { 
    updatedAt?: string; 
    tags?: string[];
    parent?: string; // 👈 Parent desteği
    order?: number;  // 👈 Sıralama desteği
    [key: string]: any; 
  };
  sections: { heading?: string; text: string }[];
};

// 👇 YOL BULUCU (PATH FINDER)
function getContentPath(section: string, slug?: string) {
  const currentDir = process.cwd();
  
  // 1. Standart Yolu Dene
  let basePath = path.join(currentDir, 'content', 'canonical', section);
  
  // 2. Next.js bazen 'web' klasörü içinde çalışır, onu kontrol et
  if (!fs.existsSync(basePath) && !currentDir.endsWith('web')) {
     basePath = path.join(currentDir, 'web', 'content', 'canonical', section);
  }

  // Dosya yolu veya Klasör yolu döndür
  return slug ? path.join(basePath, `${slug}.json`) : basePath;
}

// --- ANA FONKSİYON: Tekil Dosya Okuma ---
export async function loadCanonical(section: string, slug: string): Promise<CanonicalDoc | null> {
  const filePath = getContentPath(section, slug);

  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ [404] Dosya Bulunamadı: ${filePath}`);
      return null;
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as CanonicalDoc;
  } catch (error) {
    console.error(`🚨 [JSON HATASI] ${filePath} okunamadı:`, error);
    return null;
  }
}

// 🔥 GERİ EKLENEN FONKSİYON: Localize (Hatanın Sebebi buydu) 🔥
export async function localize(doc: CanonicalDoc, targetLang: 'tr' | 'en'): Promise<CanonicalDoc> {
  // Şimdilik sadece içeriği olduğu gibi döndürüyoruz.
  // İleride çeviri mantığı buraya eklenebilir.
  return doc;
}

// --- LİSTELEME FONKSİYONU (Parent/Meta Destekli) 🧠 ---
export async function getSectionTopics(section: string) {
  const dirPath = getContentPath(section);

  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️ Uyarı: ${section} klasörü bulunamadı.`);
    return [];
  }

  const files = fs.readdirSync(dirPath);
  
  const topics = files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      try {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content) as CanonicalDoc;
        
        const slug = file.replace('.json', '');
        
        const summaryRaw = json.sections[0]?.text || "";
        const summary = summaryRaw.replace(/<[^>]*>?/gm, '').slice(0, 140) + "...";

        // 🔥 GÜNCELLENMİŞ KISIM: Meta verisini tam döndürüyoruz
        return {
          slug,
          title: json.title,
          summary,
          meta: json.meta || {}, 
          tags: json.meta?.tags || [] 
        };

      } catch (e) {
        console.error(`❌ Hatalı JSON: ${file}`, e);
        return null;
      }
    })
    .filter(Boolean);

  return topics;
}

// --- Sidebar (Sol Menü) ---
export async function getSidebarSections() {
  const dirPath = path.dirname(getContentPath('dummy')); 

  if (!fs.existsSync(dirPath)) return [];

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  const sections = items
    .filter(item => item.isDirectory())
    .map(item => {
      const name = item.name;
      const label = name.charAt(0).toUpperCase() + name.slice(1);
      return { id: name, label };
    });

  return sections;
}

// --- ARAMA FONKSİYONU 🔍 ---
export type SearchResult = {
  title: string;
  section: string;
  slug: string;
  type: 'topic' | 'section';
};

export async function searchContent(query: string): Promise<SearchResult[]> {
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery.length < 2) return [];

  const results: SearchResult[] = [];
  const rootDir = path.dirname(getContentPath('dummy')); 

  if (!fs.existsSync(rootDir)) return [];
  
  const sections = fs.readdirSync(rootDir).filter(item => 
    fs.statSync(path.join(rootDir, item)).isDirectory()
  );

  for (const section of sections) {
    const sectionPath = path.join(rootDir, section);
    
    // 1. Bölüm Adında Arama
    if (section.includes(cleanQuery)) {
      results.push({
        title: section.charAt(0).toUpperCase() + section.slice(1) + " (Bölüm)",
        section: section,
        slug: "",
        type: 'section'
      });
    }

    // 2. İçeriklerde Arama
    const files = fs.readdirSync(sectionPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(sectionPath, file), 'utf8');
        const json = JSON.parse(content);
        
        const titleMatch = json.title?.toLowerCase().includes(cleanQuery);
        const tagMatch = json.meta?.tags?.some((t: string) => t.toLowerCase().includes(cleanQuery));

        if (titleMatch || tagMatch) {
          results.push({
            title: json.title,
            section: section,
            slug: file.replace('.json', ''),
            type: 'topic'
          });
        }
      } catch (e) {
        continue;
      }
    }
  }
  return results;
}