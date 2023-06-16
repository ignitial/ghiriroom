FROM node:18-alpine

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm i --only=prod

CMD ["npm", "run", "start"]
