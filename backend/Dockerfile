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

# --- Hardening (2026-11 incident) -------------------------------------------
# The code used to be COPY'd --chown=www-data, so the RCE could write
# webshells into public/css and public/js and keep a miner in
# /var/www/.cache (www-data's home). Now the code belongs to root and is
# read-only for www-data; only storage/ and bootstrap/cache are writable.
COPY . /var/www/html
COPY --from=vendor /app/vendor /var/www/html/vendor
COPY --from=assets /app/public/build /var/www/html/public/build

# Only public/index.php runs PHP (nginx), dangerous functions are disabled in
# PHP-FPM, and the public/storage symlink is created here because public/ is
# no longer writable at runtime (AUTORUN_LARAVEL_STORAGE_LINK=false below).
COPY docker/nginx/http.conf.template /etc/nginx/site-opts.d/http.conf.template
COPY docker/php/zz-hardening.conf /usr/local/etc/php-fpm.d/zz-hardening.conf

RUN set -eux; \
    cd /var/www/html; \
    rm -rf docker public/storage; \
    ln -s ../storage/app/public public/storage; \
    chown -R root:root /var/www; \
    chmod -R u=rwX,go=rX /var/www; \
    mkdir -p storage/app/public storage/app/private storage/framework/cache/data \
             storage/framework/sessions storage/framework/views storage/logs bootstrap/cache; \
    chown -R www-data:www-data storage bootstrap/cache; \
    chmod -R u=rwX,g=rX,o= storage bootstrap/cache; \
    chmod 644 /usr/local/etc/php-fpm.d/zz-hardening.conf; \
    # Render nginx's templates now (same envsubst the entrypoint's
    # 10-init-webserver-config.sh would run at boot; it skips outputs that
    # already exist) and hand /etc/nginx to root. Otherwise www-data owns
    # /etc/nginx and a future RCE could rewrite it and `nginx -s reload`.
    # Trade-off: NGINX_*/PHP_* env vars changed in Coolify no longer reach
    # nginx's config; change them here (ENV before this RUN) instead.
    vars=$(env | grep -E '^(PHP_|NGINX_|SSL_|LOG_|APACHE_|HEALTHCHECK_PATH|TRUSTED_PROXY)' | cut -d= -f1 | awk '{printf "${%s},",$1}' | sed 's/,$//'); \
    for f in nginx.conf site-opts.d/http.conf site-opts.d/https.conf sites-available/ssl-full; do \
        envsubst "$vars" < "/etc/nginx/$f.template" > "/etc/nginx/$f"; \
    done; \
    mkdir -p /etc/nginx/conf.d; \
    ln -sf "/etc/nginx/sites-available/ssl-$(echo "$SSL_MODE" | tr '[:upper:]' '[:lower:]')" /etc/nginx/conf.d/default.conf; \
    chown -R root:root /etc/nginx; \
    chmod -R u=rwX,go=rX /etc/nginx

USER www-data

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
ENV AUTORUN_LARAVEL_STORAGE_LINK=false

# Upstream's check (PHP-FPM answers through nginx) + security:scan, which
# exits 1 when a PHP file shows up outside public/index.php, a binary is
# dropped in /tmp, /dev/shm or ~www-data, or an unknown process runs. The
# container then turns "unhealthy" in Coolify. Docker does not log
# healthcheck output, so the scan's stderr (its CRITICAL log line, with
# LOG_CHANNEL=stderr) is appended to PID 1's stderr = the container log.
# CPU alone only alerts (see config/security.php).
HEALTHCHECK --interval=60s --timeout=20s --start-period=60s --retries=2 \
    CMD curl --silent --show-error --fail "http://127.0.0.1:${NGINX_HTTP_PORT:-8080}/healthcheck" >/dev/null \
        && php /var/www/html/artisan security:scan --no-ansi --quiet 2>>/proc/1/fd/2 || exit 1

EXPOSE 8080
