// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/qsofa/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/qsofa/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("qsofa");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="qsofa" />
      <Arac />
    </>
  );
}
