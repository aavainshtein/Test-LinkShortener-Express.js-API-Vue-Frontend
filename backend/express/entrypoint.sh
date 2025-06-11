
# Этот скрипт будет выполняться при запуске Docker-контейнера Express.

# Функция для ожидания готовности PostgreSQL
wait_for_postgres() {
  echo "Waiting for PostgreSQL to start..."
  while ! nc -z postgres ${POSTGRES_PORT}; do
    sleep 0.5
  done
  echo "PostgreSQL started!"
}

# Функция для создания базы данных, если она не существует, и применения миграций
setup_db_and_migrate() {
  DB_HOST="postgres" 
  DB_PORT="${POSTGRES_PORT}"
  DB_USER="${POSTGRES_USER}"
  DB_PASSWORD="${POSTGRES_PASSWORD}"
  DB_NAME="${POSTGRES_DB}" 

  echo "Attempting to create database '$DB_NAME' if it does not exist..."
  
  export PGPASSWORD=$DB_PASSWORD 
  
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\""
  
  if [ $? -eq 0 ]; then
    echo "Database '$DB_NAME' is ready or created."
  else
    echo "Failed to create database '$DB_NAME'. Check user permissions or logs."
    exit 1
  fi
  
  echo "Running Prisma migrations..."
  # Убедитесь, что Prisma CLI доступен в PATH контейнера
  npx prisma migrate deploy --schema=./prisma/schema.prisma || { echo "Prisma migrations failed!"; exit 1; }
  echo "Prisma migrations completed."
}

wait_for_postgres

setup_db_and_migrate


echo "Starting application..."
exec "$@"