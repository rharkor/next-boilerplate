#Creates a layer from node:alpine image.
FROM node:18-alpine

#Creates directories
RUN mkdir -p /usr/src/app

#Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD commands
WORKDIR /usr/src/app

#Sets environment variables
ENV PORT 3000

# Uncomment to disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

ENV NODE_ENV production

#Copy new files or directories into the filesystem of the container
COPY package.json .
COPY package-lock.json .

RUN npm ci --only=production

##Copy new files or directories into the filesystem of the container
COPY . .

#Execute commands in a new layer on top of the current image and commit the results
RUN npm run build

#Informs container runtime that the container listens on the specified network ports at runtime
EXPOSE 3000

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

CMD [ "npm", "start" ]
