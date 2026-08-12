# FILE: web/Dockerfile

# ---- builder ----
FROM node:20-bullseye AS builder
WORKDIR /app

# Build-time env (public değişken)
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# NOT: Bu aşamada NODE_ENV=production AYARLANMAZ. Ayarlanırsa npm
# devDependencies'i atlar; oysa typescript, tailwindcss, postcss ve
# autoprefixer devDependency ve `next build` onlarsız çalışmaz.
# Next zaten derlemeyi kendiliğinden production kipinde yapar.

# Sadece manifestler (katman önbelleği)
COPY package.json package-lock.json ./
RUN npm ci

# Kaynaklar
COPY . .

# standalone çıktısı next.config.js içindeki output: 'standalone' ile üretilir
RUN npm run build

# ---- runner ----
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Standalone çıktı + public + static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
# Standalone çıktıda server giriş noktası server.js'dır
CMD ["node", "server.js"]
