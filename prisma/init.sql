-- PostgreSQL initialization script for Docker
-- This script runs automatically when the PostgreSQL container starts

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS cyberpunk_app;

-- Set timezone
SET timezone = 'UTC';

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a schema for the application (optional)
-- CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions (already handled by POSTGRES_USER)
-- The user defined in POSTGRES_USER will have all permissions on POSTGRES_DB

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully for cyberpunk_app';
END $$;