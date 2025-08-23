-- Initialize PostgreSQL database for SaaS v3
-- This script runs when the database container starts for the first time

-- Create shadow database for Prisma migrations
CREATE DATABASE saasiav3_shadow;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE saasiav3 TO saasiav3;
GRANT ALL PRIVILEGES ON DATABASE saasiav3_shadow TO saasiav3;

-- Create extensions if needed
\c saasiav3;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c saasiav3_shadow;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";