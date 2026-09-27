import type { MetadataRoute } from "next";
import { siteManifesti } from "@/lib/uygulama-manifest";

/** Sitenin manifesti (`/manifest.webmanifest`). Araç sayfaları kendi
 *  manifestlerini bağlar — gerekçe `lib/uygulama-manifest.ts`te. */
export default function manifest(): MetadataRoute.Manifest {
  return siteManifesti();
}
