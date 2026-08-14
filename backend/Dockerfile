# syntax=docker/dockerfile:1

# --- Stage 1: install Composer dependencies + build an optimized autoloader ---
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --ignore-platform-reqs \
    --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# --- Stage 2: runtime image, serves the app via PHP-FPM (pair with nginx/Caddy) ---
FROM php:8.4-fpm AS backend

RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev \
        libonig-dev \
        unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath zip opcache \
    && apt-get purge -y libzip-dev libonig-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=vendor /app .

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/opcache.ini /usr/local/etc/php/conf.d/zz-opcache.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER www-data

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
