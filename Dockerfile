FROM node:22-alpine

RUN corepack enable pnpm

WORKDIR /app

EXPOSE 7000

ENV PORT=7000
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV CI=true

CMD ["sh", "-c", "pnpm install && npx nuxt prepare && cd admin && touch .env && pnpm install --ignore-workspace --config.dangerouslyAllowAllBuilds=true && pnpm run build && cd /app && pnpm run admin"]
