
FROM node:alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:slim@sha256:dfb18d8011c0b3a112214a32e772d9c6752131ffee512e974e59367e46fcee52

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --only=production --legacy-peer-deps

EXPOSE 3000

CMD ["node", "dist/main", "--inspect"]