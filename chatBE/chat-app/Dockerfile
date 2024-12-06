FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN node --max-old-space-size=4096 npm install --unsafe-perm

COPY . .

COPY .env.production .env

RUN node --max-old-space-size=4096 npm run build
#RUN npx ts-node -r tsconfig-paths/register node_modules/typeorm/cli.js migration:run --dataSource ./src/data-source.ts

CMD ["node", "dist/main.js"]

EXPOSE 10030

