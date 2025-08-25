-- Initialize PostgreSQL for SaaS v3
-- This script runs only when the database is first created

-- Create shadow database for Prisma migrations
CREATE DATABASE saasiav3_shadow;

-- Set proper encoding and collation
ALTER DATABASE saasiav3 SET timezone TO 'UTC';
ALTER DATABASE saasiav3_shadow SET timezone TO 'UTC';

-- Log the initialization
\echo 'SaaS v3 database initialized successfully'
