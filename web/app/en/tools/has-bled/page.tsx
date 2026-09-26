// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/has-bled/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/has-bled/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("has-bled");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="has-bled" />
      <Arac />
    </>
  );
}
