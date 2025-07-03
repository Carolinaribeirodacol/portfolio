# Use a imagem oficial PHP 8.2 com Apache
FROM php:8.2-apache

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    zip \
    curl \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Habilitar mod_rewrite do Apache (Laravel precisa)
RUN a2enmod rewrite

# Configurar diretório do Apache para Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Instalar Composer globalmente
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar os arquivos do projeto para o container
COPY . /var/www/html

WORKDIR /var/www/html

# Instalar dependências PHP via Composer
RUN composer install --no-dev --optimize-autoloader

# Ajustar permissões de storage e bootstrap/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expor porta 80 (Apache)
EXPOSE 80

# Rodar migrations e depois iniciar Apache em foreground
CMD php artisan migrate --force && apache2-foreground
