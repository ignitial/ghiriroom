FROM node:18-alpine

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm i --omit=dev

CMD ["npm", "run", "start"]
