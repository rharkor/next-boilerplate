FROM node:20-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY package.json .
COPY package-lock.json .

RUN npm i --only=production

COPY . .

RUN npm run build

#? Comment this section if you are using the static files directly
# see: https://docusaurus.io/docs/deployment#configuration
EXPOSE 3000
CMD [ "npm", "run", "serve" ]
