# Dev image: install workspace deps; source is bind-mounted at runtime for live reload.
FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/

RUN bun install --frozen-lockfile

EXPOSE 3000 5173

CMD ["bun", "run", "dev"]
