FROM node:20-alpine AS base
# Install turbo-cli
RUN npm install turbo --global

FROM base AS deps

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

#? Copy the necessary files to install dependencies
COPY package.json ./
COPY package-lock.json ./
COPY turbo.json ./

COPY apps/docs/package.json ./apps/docs/package.json

RUN npm ci --omit=dev


FROM base AS builder

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY --from=deps /usr/src/app .

COPY apps/docs ./apps/docs
COPY packages/configs ./packages/configs
COPY packages/lib ./packages/lib


RUN turbo run build --filter=@next-boilerplate/docs


FROM base AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/app/apps/docs/public ./apps/docs/public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/docs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/docs/.next/static ./apps/docs/.next/static

USER nextjs

ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/docs/server.js"]
