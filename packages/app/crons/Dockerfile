FROM node:20-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY package.json .
COPY package-lock.json .
COPY prisma/schema.prisma ./prisma/schema.prisma

RUN npm i --only=production

COPY . .

CMD [ "npm", "run", "cron" ]
