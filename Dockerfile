FROM node:latest as build-stage
ARG VUE_APP_ENV=development
ENV VUE_APP_ENV ${VUE_APP_ENV}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf