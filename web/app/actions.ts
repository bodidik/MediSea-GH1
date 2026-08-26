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
    /**
     * HATAYI YUTMA — boş dizi dönmek "sonuç yok" DEMEKTİR.
     *
     * Burada bir dönem `return []` vardı ve gerekçesi "client tarafını
     * çökertmemek"ti. Bedeli: sunucu tarafında bir hata olduğunda
     * kullanıcıya "Sonuç bulunamadı" deniyordu — yani içeriğin VAR
     * OLMADIĞI öğretiliyordu.
     *
     * Çağıran zaten DOĞRU yazılmıştı: `SiteHeader` bir `aramaHatasi`
     * durumu tutuyor, catch dalında bayat sonuçları temizliyor ve dürüst
     * metin basıyor. Ama o dal yalnızca eylem REDDEDİLİRSE çalışıyor —
     * yutulan hata onu ulaşılamaz kılıyordu. İstemcinin yorumu,
     * sunucunun bozduğu bir sözdü.
     *
     * Deponun API kuralının aynısı: uydurulmuş bir başarı (burada
     * uydurulmuş bir BOŞLUK) çağıranın üstüne kod yazdığı yanlış bir
     * varsayım üretir.
     */
    console.error("Arama sırasında sunucu hatası:", error);
    throw new Error("arama-basarisiz");
  }
}