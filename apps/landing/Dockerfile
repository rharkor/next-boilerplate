FROM node:20-alpine AS deps

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

#? Copy the necessary files to install dependencies
COPY package.json ./
COPY package-lock.json ./

COPY apps/landing/package.json ./apps/landing/package.json

RUN npm ci --omit=dev


FROM node:20-alpine AS builder

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY --from=deps /usr/src/app .

COPY apps/landing ./apps/landing
COPY packages ./packages


RUN npm run build -w apps/landing


FROM node:20-alpine AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY --from=builder /usr/src/app .

EXPOSE 3000

CMD [ "npm", "start", "-w", "apps/landing" ]
