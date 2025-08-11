#!/usr/bin/env bash
set -euo pipefail
mkdir -p /srv/chatbot-frontend
if [ -d /srv/chatbot-frontend/build ]; then
  ts=$(date +%Y%m%d-%H%M%S)
  mv /srv/chatbot-frontend/build "/srv/chatbot-frontend/build_$ts" || true
fi
mkdir -p /srv/chatbot-frontend/build
