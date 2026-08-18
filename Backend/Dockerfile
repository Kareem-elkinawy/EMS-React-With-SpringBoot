FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY server.mjs .

EXPOSE 5001

CMD ["node", "server.mjs"]
