FROM node:12.4.0-stretch

WORKDIR /app
COPY package*.json ./

RUN yarn

COPY . /app

EXPOSE 3000

CMD ["yarn", "dev"]
