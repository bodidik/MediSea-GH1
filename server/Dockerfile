# FILE: server/Dockerfile
FROM node:20-alpine AS runtime
WORKDIR /app

# Sadece manifestleri kopyala (cache dostu)
COPY package*.json ./

# Prod bağımlılıkları
RUN npm ci --only=production

# Uygulama kaynakları
COPY server.js ./server.js
COPY controllers ./controllers
COPY routes ./routes
COPY models ./models
COPY middlewares ./middlewares
COPY utils ./utils
COPY calculators ./calculators
COPY seed ./seed
COPY scripts ./scripts

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Non-root olarak çalış (node user hazır gelir)
USER node

CMD ["node", "server.js"]
