-- Check if parentId column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name = 'parentId';

-- Check if foreign key exists
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'categories'
AND constraint_name = 'categories_parentId_fkey';

-- Check migration status
SELECT migration_name, finished_at, rolled_back_at, started_at
FROM _prisma_migrations
WHERE migration_name = '20260110190347_add_subcategories';

