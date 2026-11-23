#!/bin/sh
set -eu

export PGPASSWORD="$POSTGRES_PASSWORD"

for database_name in $SERVICE_DATABASES; do
  echo "Checking PostgreSQL database: $database_name"
  psql \
    --host "$POSTGRES_HOST" \
    --port "$POSTGRES_PORT" \
    --username "$POSTGRES_USER" \
    --dbname postgres \
    --set=ON_ERROR_STOP=1 \
    --set=db_name="$database_name" <<'SQL'
SELECT format('CREATE DATABASE %I', :'db_name')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = :'db_name'
)
\gexec
SQL
done