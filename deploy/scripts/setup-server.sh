#!/usr/bin/env bash
# MBA Path Pro — one-time VPS bootstrap (Ubuntu 22.04)
# Run as root or with sudo: bash deploy/scripts/setup-server.sh

set -euo pipefail

echo "==> Updating system packages..."
apt-get update && apt-get upgrade -y

echo "==> Installing Node.js 20, Nginx, MySQL client, Certbot..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx mysql-client certbot python3-certbot-nginx ufw fail2ban

echo "==> Installing PM2 globally..."
npm install -g pm2

echo "==> Creating application directories..."
mkdir -p /var/www/mbapathpro
mkdir -p /var/www/certbot
mkdir -p /var/backups/mbapathpro/{mysql,uploads}
mkdir -p /var/log/mbapathpro

echo "==> Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Setup complete."
echo "Next steps:"
echo "  1. Install MySQL 8 and create database + user"
echo "  2. Clone repo to /var/www/mbapathpro"
echo "  3. Copy backend/.env.production.example → backend/.env"
echo "  4. Run deploy/scripts/migrate.sh"
echo "  5. Run deploy/scripts/deploy.sh"
echo "  6. Configure Nginx + SSL (see DEPLOY_PRODUCTION.md)"
