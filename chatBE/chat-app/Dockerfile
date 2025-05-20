FROM node:20-alpine

# Install tzdata for time zone management
RUN apk add --no-cache tzdata

# Set the timezone to Asia/Seoul (Korea Standard Time)
RUN cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

WORKDIR /app

COPY package*.json ./

RUN npm install --unsafe-perm

COPY . .

COPY .env.production .env

RUN NODE_OPTIONS="--max-old-space-size=1024" npm run build

#RUN npx ts-node -r tsconfig-paths/register node_modules/typeorm/cli.js migration:run --dataSource ./src/data-source.ts

CMD ["node", "dist/main.js"]

EXPOSE 10030

