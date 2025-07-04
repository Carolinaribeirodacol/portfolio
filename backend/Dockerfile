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
    gnupg \
    ca-certificates \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip intl mbstring

# Ativa mod_rewrite do Apache (necessário para Laravel)
RUN a2enmod rewrite

# Define o diretório root do Apache como /public do Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Instala Composer global
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Instala Node.js (versão LTS recomendada)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copia os arquivos do projeto Laravel
COPY . /var/www/html
WORKDIR /var/www/html

# Copia o .env.example como .env após copiar o projeto
RUN cp .env.example .env

# Define variáveis para evitar erro de conexão com banco
ENV APP_ENV=local
ENV DB_CONNECTION=sqlite

# Instala dependências do Laravel
RUN composer install --no-dev --optimize-autoloader

# Instala dependências do Node.js e compila os assets
RUN npm install && npm run build

# Corrige permissões
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Limpa cache de configuração (por segurança)
RUN php artisan config:clear

# Gera a chave da aplicação
RUN php artisan key:generate --force

# Publica os assets do Filament
RUN mkdir -p public/vendor/filament && php artisan filament:assets --force

# Expondo a porta padrão do Apache
EXPOSE 80

# Comando padrão do container
CMD ["apache2-foreground"]
