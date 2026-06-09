# build environment
FROM node:18.20 AS build
RUN node --version && npm --version
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production environment
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build .
COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget --no-verbose --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
