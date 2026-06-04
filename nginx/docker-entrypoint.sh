#!/bin/sh
set -eu

umask 077

CERT_DIR="/etc/nginx/certs"
CRT_FILE="$CERT_DIR/selfsigned.crt"
KEY_FILE="$CERT_DIR/selfsigned.key"

mkdir -p "$CERT_DIR"

if [ ! -f "$CRT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" \
    -subj "/CN=localhost"
fi

chmod 600 "$KEY_FILE"
chmod 644 "$CRT_FILE"

nginx -g "daemon off;"
