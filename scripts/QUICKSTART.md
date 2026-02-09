# Quick Fix for PostgreSQL Connection Issues

## Issue 1: Create Backups Directory

```bash
cd /var/www/mayan-backend
mkdir -p backups
chmod 755 backups
```

## Issue 2: Fix PostgreSQL Authentication

The "Peer authentication failed" error occurs because PostgreSQL is trying to use peer authentication (Unix socket) but you need password authentication.

### Solution: Add `-h localhost` to force password authentication

```bash
# Create backup (will prompt for password)
pg_dump -U mayan_user -h localhost -d mayan_shop > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Run the cleanup script (will prompt for password)
psql -U mayan_user -h localhost -d mayan_shop -f scripts/cleanup-test-data.sql
```

### Alternative: Use sudo with postgres user (no password needed)

```bash
# Create backup as postgres user
sudo -u postgres pg_dump -d mayan_shop > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Run script as postgres user
sudo -u postgres psql -d mayan_shop -f scripts/cleanup-test-data.sql
```

## Complete Step-by-Step Commands

### Option 1: Using mayan_user with password authentication

```bash
# 1. Create backups directory
cd /var/www/mayan-backend
mkdir -p backups

# 2. Create backup (enter password when prompted)
pg_dump -U mayan_user -h localhost -d mayan_shop > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Verify backup size
ls -lh backups/

# 4. Review what will be deleted (read-only, enter password when prompted)
psql -U mayan_user -h localhost -d mayan_shop -f scripts/cleanup-test-data.sql

# 5. If everything looks good, edit the script to enable deletions
nano scripts/cleanup-test-data.sql
# - Uncomment all DELETE statements
# - Change ROLLBACK to COMMIT at the end

# 6. Run the final deletion (enter password when prompted)
psql -U mayan_user -h localhost -d mayan_shop -f scripts/cleanup-test-data.sql
```

### Option 2: Using postgres superuser (easier, no password)

```bash
# 1. Create backups directory
cd /var/www/mayan-backend
mkdir -p backups

# 2. Create backup
sudo -u postgres pg_dump -d mayan_shop > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Verify backup size
ls -lh backups/

# 4. Review what will be deleted (read-only)
sudo -u postgres psql -d mayan_shop -f scripts/cleanup-test-data.sql

# 5. If everything looks good, edit the script to enable deletions
nano scripts/cleanup-test-data.sql
# - Uncomment all DELETE statements
# - Change ROLLBACK to COMMIT at the end

# 6. Run the final deletion
sudo -u postgres psql -d mayan_shop -f scripts/cleanup-test-data.sql
```

## Verify Backup Was Created

```bash
# Check backup file exists and has content (should be several MB)
ls -lh backups/

# Should see something like:
# -rw-r--r-- 1 root root 15M Feb  3 09:45 backup_20260203_094507.sql
```

## Quick Test of Backup

```bash
# Count lines in backup (should be thousands)
wc -l backups/backup_*.sql

# Check it contains your data
grep -c "INSERT INTO" backups/backup_*.sql
```

## If You See "Password for user mayan_user:"

This is normal when using `-h localhost`. Enter the password from your `.env` file:

```bash
# Check your .env file for the password
cat /var/www/mayan-backend/.env | grep DATABASE_URL
```

The password is in the DATABASE_URL string: `postgresql://mayan_user:PASSWORD@localhost:5432/mayan_shop`

## Troubleshooting

### "cannot write to backups/ directory"
```bash
chmod 755 backups
# or
sudo chown $(whoami) backups
```

### "peer authentication failed" even with -h localhost
Check PostgreSQL config:
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Look for a line with:
# host    all             all             127.0.0.1/32            md5
# If it says "peer" instead of "md5", change it and restart:
sudo systemctl restart postgresql
```

### "database does not exist"
List databases:
```bash
sudo -u postgres psql -l
```

## After Successfully Running the Script

Run these commands to optimize the database:

```bash
# Reclaim disk space
sudo -u postgres psql -d mayan_shop -c "VACUUM ANALYZE;"

# Check database size
sudo -u postgres psql -d mayan_shop -c "SELECT pg_size_pretty(pg_database_size('mayan_shop'));"
```
