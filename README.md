# NextGen

A small social feed app that posts with photos, likes, comments, saved posts, and member profiles.

## Stack

- **Backend**: Laravel, JWT auth, MySQL, S3-compatible object storage
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

Configuration is read from a `.env` (format env.example) file at the project root (see `docker-compose.yml` for the full list of variables the `backend` service expects).


Please use your own APP_KEY inside .env as base64 value and make sure you never push it to public.


---

Powered by **DAUN PENH CLOUD**
Prepared by Vatt Vichet, LENG Bunheng, HAY Kongmeng
