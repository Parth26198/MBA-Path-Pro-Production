# Production Deployment Guide — MBA Path Pro on Hostinger Ubuntu VPS

## Prerequisites
- Ubuntu 22.04 LTS server on Hostinger VPS
- Root or sudo access
- Domain registered and pointing to VPS IP
- Ports 80, 443, 3306 accessible (check firewall)

---

## Step 1: Server Setup

```bash
# SSH into VPS
ssh root@your.vps.ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git nodejs npm mysql-server nginx certbot python3-certbot-nginx
```

---

## Step 2: Deploy Application

```bash
# Clone repository
cd /var/www && git clone https://github.com/yourusername/mba-path-pro.git mbapathpro
cd mbapathpro

# Create production environment file
cp backend/.env.production.example backend/.env
nano backend/.env
# Fill in:
# - DB_PASSWORD (generate: openssl rand -base64 32)
# - JWT_SECRET (generate: openssl rand -base64 48)
# - CLIENT_URL=https://yourdomain.com
# - RAZORPAY keys (if using payments)
# - SMTP credentials (if using email)

# Build Docker images
docker-compose -f docker-compose.yml build

# Start services
docker-compose -f docker-compose.yml up -d

# Verify services are running
docker ps
docker-compose logs backend
docker-compose logs mysql
```

---

## Step 3: Setup Nginx Reverse Proxy

```bash
# Copy production Nginx config
sudo cp deploy/nginx/mbapathpro.http-only.conf /etc/nginx/sites-available/mbapathpro

# Edit domain name in config
sudo sed -i 's/MY_DOMAIN/yourdomain.com/g' /etc/nginx/sites-available/mbapathpro

# Enable site
sudo ln -s /etc/nginx/sites-available/mbapathpro /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 4: Setup SSL Certificate (Let's Encrypt)

```bash
# Create certbot challenge directory
sudo mkdir -p /var/www/certbot

# Get SSL certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Update Nginx to use SSL config
sudo cp deploy/nginx/mbapathpro.conf /etc/nginx/sites-available/mbapathpro

# Edit domain in config
sudo sed -i 's/MY_DOMAIN/yourdomain.com/g' /etc/nginx/sites-available/mbapathpro

# Test & reload
sudo nginx -t && sudo systemctl reload nginx

# Setup auto-renewal
sudo systemctl enable certbot.timer
```

---

## Step 5: Database Setup

```bash
# Access MySQL container
docker exec -it mbapathpro_mysql_1 mysql -u root -p

# Inside MySQL:
CREATE USER 'mbapathpro'@'%' IDENTIFIED BY 'your_db_password_here';
GRANT ALL PRIVILEGES ON mba_admission_db.* TO 'mbapathpro'@'%';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 6: Health Checks

```bash
# Test frontend
curl -I https://yourdomain.com

# Test API
curl -I https://yourdomain.com/health

# Check logs
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f frontend
```

---

## Step 7: Monitoring & Maintenance

```bash
# View running containers
docker-compose ps

# Restart services
docker-compose restart backend

# Update code
git pull
docker-compose build && docker-compose up -d

# Backup database
docker exec mbapathpro_mysql_1 mysqldump -u root -p mba_admission_db > backup.sql
```

---

## Important Security Notes

1. **Never commit `.env`** — Use `.env.production.example` only
2. **JWT_SECRET** must be ≥32 characters and random (use `openssl rand -base64 48`)
3. **DB_PASSWORD** must be strong (≥20 chars, mixed case + numbers + symbols)
4. **CLIENT_URL** must be HTTPS (exception: localhost for testing)
5. **Firewall** — Only expose ports 80, 443, 22 (SSH); block 3306 (MySQL)

---

## Troubleshooting

### Backend failing to start
```bash
docker-compose logs backend | grep -i error
# Check: DB_PASSWORD, JWT_SECRET, CLIENT_URL in .env
```

### Database connection errors
```bash
docker exec mbapathpro_mysql_1 mysql -u root -p -e "SELECT 1"
# Check: DB credentials in docker-compose.yml and backend/.env match
```

### Nginx 502 Bad Gateway
```bash
# Ensure backend is running
docker-compose ps
# Check: Client app is built in `frontend/dist/`
```

### SSL certificate renewal issues
```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

---

## Rollback Procedure

```bash
git log --oneline | head -5
git checkout <previous-commit>
docker-compose build && docker-compose up -d
```
