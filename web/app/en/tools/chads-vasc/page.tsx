// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/chads-vasc/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/chads-vasc/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("chads-vasc");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="chads-vasc" />
      <Arac />
    </>
  );
}
