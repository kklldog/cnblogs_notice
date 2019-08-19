FROM node:latest AS build
WORKDIR /app
COPY /. /app
ENTRYPOINT ["node", "app.js"]