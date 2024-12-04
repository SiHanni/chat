FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY .env.production .env

RUN npm run build

CMD ["node", "dist/main.js"]

EXPOSE 10030

