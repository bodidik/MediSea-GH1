# FILE: web/Dockerfile

# ---- builder ----
FROM node:20-bullseye AS builder
WORKDIR /app

# PNPM etkinleştir
RUN corepack enable

# Build-time env (public değişken)
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Sadece manifestler (cache)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Kaynaklar
COPY . .

# Next.js 'standalone' çıktısı üretmek için next.config.js içinde:
#   module.exports = { output: 'standalone' }
RUN pnpm run build

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
# Standalone çıktıda server giriş noktası server.js’dır
CMD ["node", "server.js"]
