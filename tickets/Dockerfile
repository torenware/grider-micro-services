FROM node:alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --prod
COPY . .

RUN yarn tsc

CMD ["node",  "build/index.js"]

