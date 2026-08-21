FROM node:22-alpine

RUN corepack enable pnpm

WORKDIR /app

EXPOSE 7000

ENV PORT=7000
# --max-old-space-size raised because `nuxt generate` prerenders the large
# milestones dataset; the ~4 GB default heap OOMs (needs ~4.6 GB). See docker-compose.yml.
ENV NODE_OPTIONS="--openssl-legacy-provider --max-old-space-size=6144"
ENV CI=true

CMD ["sh", "-c", "pnpm install && npx nuxt prepare && cd admin && touch .env && pnpm install --ignore-workspace --config.dangerouslyAllowAllBuilds=true && pnpm run build && cd /app && pnpm run admin"]
