# MBA Path Pro — Production Deployment Guide

> **Hostinger VPS (Ubuntu 22.04):** See [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md) for the full VPS deployment guide with PM2, Nginx, SSL, and backups.

## Prerequisites

- Node.js 20+
- MySQL 8.0+
- (Optional) Docker & Docker Compose
- (Production) Razorpay account, SMTP credentials

## Local Development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run db:setup
npm run dev

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Demo logins: `yash@admin.com`, `aniket@trainer.com`, `paresh@student.com` — password `123456`

## Docker Deployment

```bash
cp backend/.env.example .env
# Edit JWT_SECRET, DB_PASSWORD, RAZORPAY_*, EMAIL_* as needed

docker compose up -d --build
docker compose exec backend node src/database/seed.js
```

- Frontend: http://localhost
- API: http://localhost/api/v1
- Health: http://localhost/health

## Production Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Strong random secret (32+ chars) |
| `DB_*` | Yes | MySQL connection |
| `CLIENT_URL` | Yes | Frontend origin for CORS |
| `RAZORPAY_ENABLED` | For live payments | `true` + key/secret |
| `EMAIL_ENABLED` | For emails | `true` + SMTP settings |
| `CLIENT_RESET_URL` | For password reset | e.g. `https://app.example.com/reset-password` |

## MySQL Production

1. Create database `mba_admission_db`
2. Run `npm run db:migrate` then `npm run db:migrate:prod`
3. Seed once: `npm run db:seed`
4. Enable SSL connection in hosting provider if available
5. Regular backups of DB + `uploads/` volume

## Security Checklist

- [ ] Change all default passwords and JWT secret
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (reverse proxy / load balancer)
- [ ] Configure Razorpay webhook (optional enhancement)
- [ ] Restrict MySQL to private network
- [ ] Set `MAX_FILE_SIZE` appropriately (default 5MB)
- [ ] Review rate limits in `middleware/rateLimiter.js`

## Monitoring

- `GET /health` — DB connectivity + feature flags
- Audit logs: Admin → Audit Logs
- Application logs: stdout (Winston)

## Scaling Notes

- Single Node instance: ~100–200 concurrent users (typical consultancy load)
- Horizontal scaling: stateless API + shared MySQL + shared upload volume or S3
- Enable `AWS_S3_ENABLED` for distributed file storage

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Featured colleges error | Ensure migrations ran; avoid `LIMIT ?` in custom queries |
| Payment pending after register | Complete step 2 in Buy Now or use simulated mode |
| Upload fails | Check `uploads/documents` permissions and file type |
| Emails not sent | Set `EMAIL_ENABLED=true` and valid SMTP |
