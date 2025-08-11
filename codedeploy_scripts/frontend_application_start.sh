#!/usr/bin/env bash
set -euo pipefail
if systemctl is-active --quiet nginx; then
  systemctl reload nginx || systemctl restart nginx
else
  systemctl start nginx
fi
