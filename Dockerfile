# Astro SSR (@astrojs/node, mode: standalone).
# Build output: dist/server/entry.mjs, dist/client/

FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG PUBLIC_BASE_PATH=/
ENV PUBLIC_BASE_PATH=$PUBLIC_BASE_PATH

RUN pnpm build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
# Astro Node standalone listens on HOST/PORT (see @astrojs/node)
ENV HOST=0.0.0.0
ENV PORT=4321

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
