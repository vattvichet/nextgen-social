# NextGen

A small social feed app — posts with photos, likes, comments, saved posts, and member profiles.

## Stack

- **Backend**: Laravel 10 (PHP), JWT auth, MySQL, S3-compatible object storage
- **Frontend**: React + Vite, Tailwind CSS
- **Infra**: Docker (PHP-FPM + nginx + Caddy), docker-compose

## Local development

```bash
# backend
cd backend
composer install
php artisan serve

# frontend
cd frontend
npm install
npm run dev
```

## Deploying with Docker

```bash
docker compose up -d --build
docker compose exec backend php artisan migrate --force
```

Configuration is read from a `.env` file at the project root (see `docker-compose.yml` for the full list of variables the `backend` service expects).

---

Powered by **DAUN PENH CLOUD**
Prepared by Vichet, Bun Heng, Kongmeng
