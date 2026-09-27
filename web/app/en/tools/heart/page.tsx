// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/heart/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/heart/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("heart");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="heart" />
      <Arac />
    </>
  );
}
