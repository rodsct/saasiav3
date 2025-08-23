#!/bin/sh

echo "Starting SaaS v3 application..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('Database connected successfully');
    process.exit(0);
  })
  .catch(() => {
    console.log('Database not ready yet...');
    process.exit(1);
  });
" > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the Next.js application
echo "Starting Next.js application..."
exec node server.js