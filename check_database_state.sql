-- Check what tables exist in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if _prisma_migrations table exists (tracks migration history)
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = '_prisma_migrations';

-- Check migration history
SELECT migration_name, finished_at, rolled_back_at, started_at, applied_steps_count
FROM _prisma_migrations
ORDER BY started_at;

