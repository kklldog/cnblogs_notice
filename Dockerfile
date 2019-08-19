FROM node:latest AS build
WORKDIR /app
COPY /. /app
RUN npm install
ENTRYPOINT ["node", "app.js"]