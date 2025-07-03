FROM php:8.2-apache

# Instala dependências do sistema e extensões PHP necessárias
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    libicu-dev \
    zlib1g-dev \
    libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip intl mbstring

# Ativa mod_rewrite do Apache (necessário para Laravel)
RUN a2enmod rewrite

# Define o diretório root do Apache como /public do Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Instala Composer global
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia os arquivos do projeto Laravel
COPY . /var/www/html
WORKDIR /var/www/html

# Instala dependências do Laravel
RUN composer install --no-dev --optimize-autoloader

# Corrige permissões das pastas de cache e logs
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expõe a porta padrão do Apache
EXPOSE 80

# Executa migrations automaticamente e inicia
