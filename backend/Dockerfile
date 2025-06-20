FROM php:8.2-fpm

RUN apt-get update && apt-get install -y unzip git curl libpq-dev  && docker-php-ext-install pdo_pgsql
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
WORKDIR /var/www/backend

# Копируем всё внутрь
COPY . .

# Устанавливаем зависимости
RUN composer install