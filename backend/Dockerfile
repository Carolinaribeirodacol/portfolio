FROM node:20 as node-builder
WORKDIR /app
COPY . .
RUN cd backend && npm install && npm run build

FROM php:8.2-fpm

# Dependências do PHP
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libonig-dev libxml2-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring zip exif pcntl

# Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Diretório app
WORKDIR /var/www

# Copia app e build Vite
COPY . .
COPY --from=node-builder /app/backend/public/build /var/www/public/build

RUN composer install --optimize-autoloader \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=8080
