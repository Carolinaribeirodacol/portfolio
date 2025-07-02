# Etapa 1: build dos assets com Node + Vite
FROM node:20 as node-builder
WORKDIR /app
COPY . .
RUN cd backend && npm install && npm run build

# Etapa 2: container com PHP 8.2 + extensões Laravel
FROM php:8.2-fpm

# Instalar extensões e dependências do Laravel
RUN apt-get update && apt-get install -y \
    git unzip zip sqlite3 libsqlite3-dev \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo pdo_sqlite mbstring zip exif pcntl

# Instalar Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Definir diretório da aplicação
WORKDIR /var/www

# Copiar o projeto
COPY . .

# Copiar build dos assets (public/build) do Node
COPY --from=node-builder /app/backend/public/build /var/www/public/build

# Instalar dependências PHP
RUN composer install --optimize-autoloader --no-dev

# Permissões
RUN chmod -R 775 storage bootstrap/cache

# Criar banco SQLite (vazio)
RUN mkdir -p database && touch database/database.sqlite

# Expor porta usada no Fly (configurada como 8080)
EXPOSE 8080

# Comando final: serve Laravel
CMD php artisan serve --host=0.0.0.0 --port=8080
