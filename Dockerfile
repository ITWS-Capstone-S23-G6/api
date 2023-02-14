# uses node base image with latest LTS version
FROM node:18.14.0 as base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

RUN npm run compile

CMD ["node", "dist/server.js"]

# informs Docker that the container listens on the
# specified ports at runtime

# Copies server.
