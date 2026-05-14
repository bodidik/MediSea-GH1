import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo/çok klasör ortamında doğru kök
  outputFileTracingRoot: path.join(__dirname, ".."),

  // AŞAMA 1: Build'i bloklamasın; stabilizasyondan sonra false yapılabilir
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;