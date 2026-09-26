import { SITE_ADI } from "@/lib/site";
import { KART_BOYUTU, siteKarti } from "@/lib/site-karti";

/**
 * Site geneli paylaşım görseli.
 *
 * Bağlantılar WhatsApp/Telegram gibi kanallarda paylaşıldığında şimdiye kadar
 * boş kutu görünüyordu; tıp camiasında dağıtımın büyük kısmı bu kanallardan
 * geçtiği için bu, hunide doğrudan kayıp demekti.
 *
 * Alt segmentler kendi opengraph-image dosyalarıyla bunu geçersiz kılabilir;
 * bir dosya yoksa en yakın üst segmentinki miras alınır. Çizim
 * `lib/site-karti.tsx`te — İngilizce kart (`app/en/`) aynı tasarımı kullanıyor.
 */

export const alt = `${SITE_ADI} — İç hastalıkları için Türkçe klinik kaynak`;
export const size = KART_BOYUTU;
export const contentType = "image/png";

export default async function Image() {
  return siteKarti({
    baslik: "İç hastalıkları için Türkçe klinik kaynak",
    alt: "Güncel konu anlatımları · klinik hesaplayıcılar · YDUS hazırlık",
  });
}
