# Dockerfile pour Agents Liminals (Next.js 15)
# Version: 3.0.0

FROM node:18-alpine AS base

# Installer les dépendances uniquement quand nécessaire
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer les dépendances basées sur le gestionnaire de packages préféré
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild le code source uniquement quand nécessaire
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collecte des données d'usage complètement anonymes sur l'usage général.
# En savoir plus ici: https://nextjs.org/telemetry
# Décommentez la ligne suivante pour désactiver la télémétrie lors du build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Image de production, copier tous les fichiers et exécuter Next.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Utiliser automatiquement le mode standalone de Next.js
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Commande pour démarrer l'application
CMD ["node", "server.js"]