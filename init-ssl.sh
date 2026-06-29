#!/bin/bash
set -e

DOMAIN="attendance.amptechnology.in"   # ← change this to your actual domain
EMAIL="devs.amptechnology@gmail.com"
APP_CONTAINER="attendance-frontend"
APP_PORT="3011"

BACKEND_PROJECT_DIR="/root/amp_portal_backend"
NGINX_CONF_DIR="$BACKEND_PROJECT_DIR/nginx/conf.d"
CERTBOT_WWW_DIR="$BACKEND_PROJECT_DIR/certbot/www"
CERTBOT_CONF_DIR="$BACKEND_PROJECT_DIR/certbot/conf"

CONF_FILE="$NGINX_CONF_DIR/$DOMAIN.conf"
CERT_PATH="$CERTBOT_CONF_DIR/live/$DOMAIN/fullchain.pem"

echo "=== Starting SSL setup for $DOMAIN ==="

if ! docker ps --format '{{.Names}}' | grep -q '^nginx$'; then
  echo "ERROR: nginx container is not running."
  exit 1
fi

mkdir -p "$NGINX_CONF_DIR"
mkdir -p "$CERTBOT_WWW_DIR/.well-known/acme-challenge"
mkdir -p "$CERTBOT_CONF_DIR"

# ── Helper: wait until container joins the shared network ──
wait_for_network() {
  echo "Waiting for $APP_CONTAINER to join the network..."
  for i in $(seq 1 20); do
    if docker network inspect amp_portal_backend_app-network 2>/dev/null | grep -q "$APP_CONTAINER"; then
      echo "$APP_CONTAINER is on the network!"
      return 0
    fi
    echo "  attempt $i/20 — waiting 2s..."
    sleep 2
  done
  echo "ERROR: $APP_CONTAINER never joined the network!"
  exit 1
}

write_https_config() {
cat > "$CONF_FILE" << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://$APP_CONTAINER:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF
}

# ─────────────────────────────────────────────────────────────
# CASE 1: Certificate already exists → just redeploy
# ─────────────────────────────────────────────────────────────
if test -f "$CERT_PATH"; then
  echo "Certificate already exists — redeploying..."
  write_https_config

  docker compose down || true
  docker compose up -d --build --remove-orphans

  wait_for_network

  docker exec nginx nginx -s reload

  echo ""
  echo "=== Redeploy complete! ==="
  echo "=== https://$DOMAIN is live ==="
  exit 0
fi

# ─────────────────────────────────────────────────────────────
# CASE 2: First time — generate SSL certificate
# ─────────────────────────────────────────────────────────────
echo "No certificate found — starting first-time SSL setup..."

cat > "$CONF_FILE" << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINXEOF

echo "Temporary HTTP config written."
docker exec nginx nginx -s reload
sleep 3

echo "Verifying $DOMAIN responds on port 80..."
curl -sf -H "Host: $DOMAIN" http://localhost:80 > /dev/null \
  && echo "Domain responding OK" \
  || { echo "ERROR: $DOMAIN not responding — check DNS points to this VPS"; exit 1; }

echo "Requesting certificate from Let's Encrypt..."
docker run --rm \
  -v "$CERTBOT_WWW_DIR:/var/www/certbot" \
  -v "$CERTBOT_CONF_DIR:/etc/letsencrypt" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

if ! test -f "$CERT_PATH"; then
  echo "ERROR: Certificate not found at $CERT_PATH!"
  exit 1
fi

echo "Certificate obtained successfully!"

write_https_config
echo "HTTPS config written."

docker compose down || true
docker compose up -d --build --remove-orphans

wait_for_network

docker exec nginx nginx -s reload

echo ""
echo "=== SSL setup complete! ==="
echo "=== https://$DOMAIN is now live! ==="