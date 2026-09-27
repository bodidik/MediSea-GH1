// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/padua/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/padua/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("padua");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="padua" />
      <Arac />
    </>
  );
}
