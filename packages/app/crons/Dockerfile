FROM node:20-alpine AS deps

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

#? Copy the necessary files to install dependencies
COPY package*.json .
COPY packages/lib/package*.json ./packages/lib/
COPY packages/app/package*.json ./packages/app/
COPY packages/app/prisma/schema.prisma ./packages/app/prisma/schema.prisma

RUN npm i --only=production


FROM node:20-alpine AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app .

COPY packages/lib ./packages/lib
COPY packages/app ./packages/app


CMD [ "npm", "run", "cron", "-w", "packages/app" ]
