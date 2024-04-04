FROM node:20-alpine as base
# Install turbo-cli
RUN npm install turbo --global

FROM base as deps

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY package.json ./
COPY package-lock.json ./
COPY turbo.json ./

COPY apps/docs/package.json ./apps/docs/package.json

RUN npm ci --omit=dev

FROM base as builder

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY --from=deps /usr/src/app .
COPY apps/docs ./apps/docs

RUN turbo run build -w apps/docs

FROM base AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY --from=builder /usr/src/app/ .

#? Comment this section if you are using the static files directly
# see: https://docusaurus.io/docs/deployment#configuration
CMD [ "npm", "run", "serve", "-w", "apps/docs" ]
