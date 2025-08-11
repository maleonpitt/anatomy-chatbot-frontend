#!/usr/bin/env bash
set -euo pipefail

SERVER_NAME="app2.heilab.pitt.edu"
API_UPSTREAM="http://127.0.0.1:5000"   # <-- change if your backend is elsewhere

# Write the HTTP site (Certbot will upgrade it to HTTPS)
cat >/etc/nginx/sites-available/chatbot-frontend <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAME};

    root /srv/chatbot-frontend/build;
    index index.html;

    # Let Certbot reach the challenge files
    location /.well-known/acme-challenge/ { allow all; }

    # SPA routing
    location / {
        try_files \$uri /index.html;
    }

    # Reverse proxy for API
    location /api/ {
        proxy_pass ${API_UPSTREAM}/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/chatbot-frontend /etc/nginx/sites-enabled/chatbot-frontend
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl restart nginx

# Issue a certificate (first time only). Set a real email you control.
if [ ! -f "/etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem" ]; then
  certbot --nginx --non-interactive --agree-tos \
          -m you@example.com \
          -d "${SERVER_NAME}" \
          --redirect
fi

nginx -t
systemctl reload nginx

