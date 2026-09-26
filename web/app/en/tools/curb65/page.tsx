// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/curb65/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/curb65/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("curb65");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="curb65" />
      <Arac />
    </>
  );
}
