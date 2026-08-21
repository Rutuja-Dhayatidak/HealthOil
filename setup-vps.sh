#!/bin/bash
set -e

# ==============================================================================
# HealthOil / healthyfood.cafe - VPS Initial Setup Script
# VPS IP: 76.13.185.120
# Domain: healthyfood.cafe
# ==============================================================================

DOMAIN="healthyfood.cafe"
EMAIL="admin@oilgmail.com"
APP_DIR="/var/www/HealthOil"

echo "=========================================================="
echo " Starting VPS Server Setup for $DOMAIN ($APP_DIR)"
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw ca-certificates gnupg lsb-release

# 2. Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker & Docker Compose..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
fi

# 3. Configure Firewall (UFW)
echo "🛡️ Configuring Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 4. Setup Application Directory
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/certbot/conf"
mkdir -p "$APP_DIR/certbot/www"

echo "🔐 Setting up initial SSL certificates for $DOMAIN and subdomains..."

# 5. Check if certificates exist; if not, request them via certbot
if [ ! -d "$APP_DIR/certbot/conf/live/$DOMAIN" ]; then
    echo "Requesting SSL certificates using Certbot standalone..."
    
    # Temporarily stop any server on port 80
    docker compose -f "$APP_DIR/docker-compose.yml" down 2>/dev/null || true
    
    docker run -it --rm \
      -p 80:80 \
      -v "$APP_DIR/certbot/conf:/etc/letsencrypt" \
      -v "$APP_DIR/certbot/www:/var/www/certbot" \
      certbot/certbot certonly --standalone --non-interactive --agree-tos \
      --email "$EMAIL" \
      -d "$DOMAIN" \
      -d "www.$DOMAIN" \
      -d "admin.$DOMAIN" \
      -d "vendor.$DOMAIN" \
      -d "api.$DOMAIN" || {
        echo "⚠️ Note: Let's Encrypt requires your DNS A records to point to 76.13.185.120."
        echo "Creating self-signed fallback certificate so Nginx can start..."
        mkdir -p "$APP_DIR/certbot/conf/live/$DOMAIN"
        openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
          -keyout "$APP_DIR/certbot/conf/live/$DOMAIN/privkey.pem" \
          -out "$APP_DIR/certbot/conf/live/$DOMAIN/fullchain.pem" \
          -subj "/CN=$DOMAIN"
      }
fi

# 6. Start the entire Docker stack
echo "🚀 Starting all Docker services (Backend, Frontends, Admin, Vendor, Nginx)..."
cd "$APP_DIR"
docker compose up -d --build

echo "=========================================================="
echo "✅ SETUP COMPLETE!"
echo "Your apps are live at:"
echo " - Main Site:       https://$DOMAIN"
echo " - Admin Panel:    https://admin.$DOMAIN"
echo " - Vendor Portal:   https://vendor.$DOMAIN"
echo " - Backend API:     https://api.$DOMAIN/api"
echo "=========================================================="
