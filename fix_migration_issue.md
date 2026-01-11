# Fixing Migration Issue - Step by Step

## Problem
- Database has no `categories` table (or other tables)
- Only one migration exists: `20260110190347_add_subcategories` (which tries to alter a non-existent table)
- Database was likely set up with `prisma db push` instead of migrations

## Solution Options

### Option 1: Create Initial Migration (Recommended for Production)

1. **First, check what tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```

2. **If NO tables exist (empty database):**
   ```bash
   # Create initial migration from current schema
   npx prisma migrate dev --name init --create-only
   
   # This creates a migration file. Review it, then:
   npx prisma migrate deploy
   ```

3. **If tables DO exist (created with db push):**
   ```bash
   # Baseline the migration history
   npx prisma migrate resolve --applied 20260110190347_add_subcategories
   
   # Create a new initial migration that matches current state
   npx prisma migrate dev --name init --create-only
   
   # Mark it as applied (since tables already exist)
   npx prisma migrate resolve --applied <new_migration_name>
   
   # Now deploy the subcategories migration
   npx prisma migrate deploy
   ```

### Option 2: Use db push (Quick fix, not recommended for production)

```bash
# This will sync schema without migrations
npx prisma db push

# But then you'll need to create migrations going forward
```

### Option 3: Reset and Start Fresh (⚠️ DESTRUCTIVE - Only if no important data)

```bash
# WARNING: This deletes all data!
npx prisma migrate reset

# Then create proper migrations
npx prisma migrate dev --name init
```

## Recommended Steps for Your Situation

Since you're in production, follow **Option 1, Step 2** (create initial migration):

```bash
# 1. Remove the failed migration record
npx prisma migrate resolve --rolled-back 20260110190347_add_subcategories

# 2. Create initial migration
npx prisma migrate dev --name init --create-only

# 3. Review the generated migration file in prisma/migrations/

# 4. Apply it
npx prisma migrate deploy

# 5. Now apply the subcategories migration
npx prisma migrate deploy
```

