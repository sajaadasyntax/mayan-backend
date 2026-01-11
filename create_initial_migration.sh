#!/bin/bash
# Script to fix migration issue by creating initial migration
# Run this on your server: root@srv1144536

set -e

echo "=== Fixing Prisma Migration Issue ==="
echo ""

# Step 1: Remove the failed migration record (already done, but safe to run again)
echo "Step 1: Cleaning up failed migration record..."
npx prisma migrate resolve --rolled-back 20260110190347_add_subcategories || true
echo "✅ Done"
echo ""

# Step 2: Create initial migration
echo "Step 2: Creating initial migration..."
echo "This will create a migration file with all tables from your schema."
echo ""

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: prisma/schema.prisma not found. Make sure you're in the backend directory."
    exit 1
fi

# Create the initial migration
npx prisma migrate dev --name init --create-only

echo ""
echo "✅ Initial migration created!"
echo ""

# Step 3: Review the migration
echo "Step 3: Review the migration file in prisma/migrations/"
echo "Press Enter to continue after reviewing..."
read

# Step 4: Apply migrations
echo "Step 4: Applying migrations..."
npx prisma migrate deploy

echo ""
echo "✅ All migrations applied successfully!"
echo ""
echo "Verify with: npx prisma migrate status"

