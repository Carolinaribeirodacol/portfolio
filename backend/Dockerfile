# syntax=docker/dockerfile:1

############################################
# Stage 1: PHP dependencies (composer)
############################################
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

COPY . .

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

############################################
# Stage 2: front-end assets (Filament / Tailwind via Vite)
############################################
FROM node:24-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

############################################
# Stage 3: production runtime
############################################
FROM serversideup/php:8.5-fpm-nginx AS deploy

USER root
RUN install-php-extensions bcmath gd intl zip pcntl exif pdo_pgsql
USER www-data

COPY --chown=www-data:www-data . /var/www/html
COPY --chown=www-data:www-data --from=vendor /app/vendor /var/www/html/vendor
COPY --chown=www-data:www-data --from=assets /app/public/build /var/www/html/public/build

# Runs at container boot (migrations, storage:link, config/route/event cache),
# using the runtime env vars Coolify injects — never baked in at build time.
#
# Deliberately NOT seeding on every boot: DatabaseSeeder unconditionally
# creates a "Test User" (test@example.com) and is not idempotent — a second
# run would either duplicate it or fail on the unique email constraint. Seed
# once manually after the first deploy if needed, e.g.
#   php artisan db:seed --class=TechnologySeeder
ENV AUTORUN_ENABLED=true
ENV AUTORUN_LARAVEL_MIGRATION_TIMEOUT=60
ENV PHP_OPCACHE_ENABLE=1

EXPOSE 8080
