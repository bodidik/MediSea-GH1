"use server";

import { searchContent } from "@/lib/content";

export async function searchAction(query: string) {
  try {
    // Arama boşsa sunucuyu yormadan boş dizi dön
    if (!query || query.trim() === "") {
      return [];
    }

    const results = await searchContent(query);
    return results;
    
  } catch (error) {
    console.error("Arama sırasında sunucu hatası:", error);
    // Client tarafını çökertmemek için boş dizi veya hata mesajı dönebilirsin
    return []; 
  }
}