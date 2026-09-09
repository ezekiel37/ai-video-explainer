# Single image for both web and worker; the service command is set in compose.
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# System libraries Remotion's headless Chrome shell needs (worker renders).
# FFmpeg is bundled by @remotion/renderer, so it isn't installed here.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libcairo2 libatspi2.0-0 fonts-liberation ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @explainmotion/web build

# Runtime image carries source + node_modules + the web build.
# web:    pnpm --filter @explainmotion/web start   (next start)
# worker: pnpm --filter @explainmotion/worker start (tsx; renders via Remotion)
FROM build AS runtime
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "--filter", "@explainmotion/web", "start"]
