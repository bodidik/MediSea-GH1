import "server-only";
import fs from "fs";
import path from "path";
import { gecerliTarihMi, type Sinav } from "@/lib/sinav";

/**
 * Sınav takviminin diskten okunması. Yalnızca sunucuda çalışır —
 * "server-only" içe aktarımı, bu dosyanın yanlışlıkla bir istemci
 * bileşenine sızmasını derleme zamanında hata hâline getirir.
 */
export function sinavlariOku(): Sinav[] {
  try {
    const yol = path.join(process.cwd(), "content", "sinav-takvimi.json");
    const veri = JSON.parse(fs.readFileSync(yol, "utf-8"));
    const liste = Array.isArray(veri?.sinavlar) ? veri.sinavlar : [];

    return liste
      .filter((s: unknown): s is Sinav => {
        const o = s as Sinav;
        return !!o && typeof o.ad === "string" && gecerliTarihMi(o.tarih);
      })
      .sort((a: Sinav, b: Sinav) => a.tarih.localeCompare(b.tarih));
  } catch {
    return [];
  }
}
