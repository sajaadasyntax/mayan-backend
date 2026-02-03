# Database Cleanup Script - Instructions

## ⚠️ CRITICAL WARNING ⚠️

This script will **PERMANENTLY DELETE** data from your production database. Follow these instructions **EXACTLY** and in order.

## Prerequisites

1. PostgreSQL client installed
2. Database credentials ready
3. At least 2x database size free disk space for backup
4. Estimated time: 15-30 minutes (including backup and verification)

## Step-by-Step Instructions

### 1. Create Backup (MANDATORY)

```bash
# Create backup directory
mkdir -p backups

# Create full database backup with timestamp
pg_dump -U your_username -h your_host -d your_database_name \
  > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file exists and has content
ls -lh backups/
```

**✅ Checkpoint:** Backup file should be several MB in size (not 0 bytes)

### 2. Test Backup Restore (HIGHLY RECOMMENDED)

```bash
# Create a test database
createdb -U your_username test_restore_db

# Restore backup to test database
psql -U your_username -d test_restore_db < backups/backup_YYYYMMDD_HHMMSS.sql

# Verify restoration worked
psql -U your_username -d test_restore_db -c "SELECT COUNT(*) FROM users;"

# Drop test database
dropdb -U your_username test_restore_db
```

### 3. Review What Will Be Deleted

```bash
# Connect to database
psql -U your_username -h your_host -d your_database_name

# Run verification queries only (script runs these by default)
\i scripts/cleanup-test-data.sql
```

**Review the output carefully:**
- ✅ Users to KEEP: Should show "Developers", "Malaz", "User test"
- ⚠️ Users to DELETE: Check this number makes sense
- ⚠️ Orders to DELETE: All test orders
- ⚠️ Procurement to KEEP: Should show today's order worth SDG 6,185,920
- ⚠️ Procurement to DELETE: All others

### 4. Execute Deletion (Point of No Return)

**STOP and confirm:**
- [ ] Backup created and verified
- [ ] Reviewed what will be deleted
- [ ] Team has been notified
- [ ] You have database restore access

Edit the script `scripts/cleanup-test-data.sql`:

1. **Uncomment the deletion commands** (remove `--` from lines marked with DELETE)
2. **Change ROLLBACK to COMMIT** at the bottom

```sql
-- Change this line at the end:
ROLLBACK;  -- Currently active

-- To this:
COMMIT;  -- Make changes permanent
```

Then run:

```bash
psql -U your_username -h your_host -d your_database_name \
  -f scripts/cleanup-test-data.sql
```

### 5. Verify Results

After running the script, verify:

```sql
-- Should show only 3 users
SELECT COUNT(*), STRING_AGG(name, ', ') FROM users;

-- Should show 0 orders
SELECT COUNT(*) FROM orders;

-- Should show 0 messages  
SELECT COUNT(*) FROM messages;

-- Should show 1 procurement order
SELECT COUNT(*), "totalCost" FROM procurements GROUP BY "totalCost";
```

## What Gets Deleted

### Users
- ❌ All users EXCEPT:
  - ✅ Developers
  - ✅ Malaz
  - ✅ User test

### Orders
- ❌ All customer orders (including order items via cascade)

### Products
- ❌ Two archived products:
  - "Ikfdglfkd" (Aldahabai logo)
  - "jhkk" (Mercy logo)

### Messages
- ❌ All messages

### Procurement Orders
- ❌ All procurement orders EXCEPT:
  - ✅ Today's order worth SDG 6,185,920

## Cascade Effects (Automatic)

When users are deleted, these are automatically deleted:
- Cart items (cascade)
- Sent messages (already deleted in step 1)
- Received messages (already deleted in step 1)
- Loyalty redemptions (explicitly deleted)

When orders are deleted:
- Order items (cascade)

When procurement orders are deleted:
- Procurement items (cascade)

## Emergency Rollback

If something goes wrong DURING execution (before COMMIT):

```sql
-- In the psql session
ROLLBACK;
```

If something goes wrong AFTER execution:

```bash
# Restore from backup
psql -U your_username -d your_database_name < backups/backup_YYYYMMDD_HHMMSS.sql
```

## Post-Cleanup Tasks

1. Vacuum database to reclaim space:
```sql
VACUUM ANALYZE;
```

2. Update statistics:
```sql
ANALYZE;
```

3. Check database size:
```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

## Important Notes

1. **Transaction Safety**: The script runs in a transaction. If any error occurs before COMMIT, all changes are rolled back.

2. **Foreign Key Constraints**: The script is ordered to respect all foreign key constraints.

3. **Identity Matching**: Users are identified by their `name` field. Ensure these exact names exist:
   - "Developers"
   - "Malaz"
   - "User test"

4. **Date Matching**: The procurement order is matched by:
   - `totalCost = 6185920` 
   - `createdAt = TODAY`
   
   If the order was created yesterday, update the WHERE clause in the script.

5. **Backup Retention**: Keep the backup for at least 30 days.

## Troubleshooting

### "User not found" Error
Check exact user names:
```sql
SELECT id, name, phone FROM users WHERE name ILIKE '%developer%' OR name ILIKE '%malaz%' OR name ILIKE '%test%';
```

### "Procurement order not found" Error
Check if order exists:
```sql
SELECT id, "totalCost", "createdAt" FROM procurements WHERE "totalCost" = 6185920;
```

### "Foreign key constraint violation"
This shouldn't happen if following the script order. If it does, check for custom constraints not in schema.

## Support

If you encounter any issues:
1. Do NOT proceed with COMMIT
2. Run ROLLBACK immediately
3. Contact the development team
4. Share the error message and the step where it occurred
