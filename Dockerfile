FROM node:12.18.4-alpine3.9

WORKDIR /server

COPY package*.json /server/

RUN npm install

COPY . /server/
