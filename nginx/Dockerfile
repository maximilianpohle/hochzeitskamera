FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/docker-entrypoint.sh /docker-entrypoint-https.sh

RUN chmod +x /docker-entrypoint-https.sh

CMD ["/docker-entrypoint-https.sh"]
