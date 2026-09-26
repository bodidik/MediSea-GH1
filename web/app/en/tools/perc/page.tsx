// İngilizce sayfa — hesap ve arayüz Türkçe aracın AYNI bileşeni (tek kopya),
// metin `app/tools/perc/metin.dil.json`in en bloğundan; künye content/arac-en.json.
import Arac from "@/app/tools/perc/page";
import { enAracMeta, EnAracSemasi } from "@/lib/en-arac";

export const metadata = enAracMeta("perc");

export default function Page() {
  return (
    <>
      <EnAracSemasi slug="perc" />
      <Arac />
    </>
  );
}
