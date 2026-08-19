FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_EMPLOYEE_API_URL=/api
ARG VITE_AUTH_API_URL=/auth

ENV VITE_EMPLOYEE_API_URL=$VITE_EMPLOYEE_API_URL
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/cache/nginx /var/run/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx \
        /usr/share/nginx/html \
        /var/cache/nginx \
        /var/run/nginx \
        /var/run/nginx.pid \
        /etc/nginx/conf.d

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
