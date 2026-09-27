// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/wells-dvt/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/wells-dvt/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("wells-dvt");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="wells-dvt" />
      <Arac />
    </>
  );
}
