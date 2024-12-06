FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --unsafe-perm

COPY . .

COPY .env.production .env

RUN npm run build

COPY src/data-source.ts ./src/data-source.ts

RUN npx typeorm migration:run --dataSource ./src/data-source.ts

CMD ["node", "dist/main.js"]

EXPOSE 10030

