#!/usr/bin/env bash
set -euo pipefail

SERVER_NAME="app2.heilab.pitt.edu"
API_UPSTREAM="http://127.0.0.1:5000"   # <-- change if your backend is elsewhere

# Ensure we can overwrite the file (remove immutable flag if set)
sudo chattr -i /etc/nginx/sites-available/chatbot-frontend 2>/dev/null || true

# Write the HTTP site (Certbot will upgrade it to HTTPS)
sudo tee /etc/nginx/sites-available/chatbot-frontend > /dev/null <<NGINX
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

# Ensure symlink exists
sudo ln -sf /etc/nginx/sites-available/chatbot-frontend /etc/nginx/sites-enabled/chatbot-frontend
sudo rm -f /etc/nginx/sites-enabled/default || true

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# Issue a certificate (first time only)
if [ ! -f "/etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem" ]; then
  sudo certbot --nginx --non-interactive --agree-tos \
               -m you@example.com \
               -d "${SERVER_NAME}" \
               --redirect
fi

sudo nginx -t
sudo systemctl reload nginx
