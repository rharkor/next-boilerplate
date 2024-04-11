FROM node:20-alpine as base
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

COPY apps/cron/package.json ./apps/cron/package.json

RUN npm ci --omit=dev

FROM base AS builder

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY --from=deps /usr/src/app .

COPY apps/cron ./apps/cron
COPY apps/app/prisma/schema.prisma apps/app/prisma/schema.prisma
COPY packages/configs ./packages/configs
COPY packages/lib ./packages/lib

RUN cd apps/cron && npx -y prisma generate && turbo run build

FROM base AS runner

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY --from=builder /usr/src/app .

RUN mkdir -p apps/app/prisma

# Install logrotate
RUN apk add --update logrotate

# Add crontab file in the cron directory
COPY apps/cron/crontab /etc/crontabs/root

# Give execution rights on the cron job
RUN chmod 0644 /etc/crontabs/root

# Create a log file to store the stdout of cron
RUN touch /var/log/cron.log

# Set up logrotate
COPY apps/cron/logrotate.conf /etc/logrotate.d/app
RUN chmod 0644 /etc/logrotate.d/app

# Run the command on container startup
CMD cd apps/cron && crond -l 2 && tail -f /var/log/cron.log