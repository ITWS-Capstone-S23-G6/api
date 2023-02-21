# uses node base image with latest LTS version
FROM node:18.14.0 as base

WORKDIR /usr/src/app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

# Copies server.
COPY . .

# informs Docker that the container listens on the
# specified ports at runtime
EXPOSE 4000

RUN pnpm run build

CMD ["node", "dist/server.js"]


