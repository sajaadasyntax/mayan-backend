#!/bin/bash
# Script to resolve failed Prisma migration
# Run this on your server: root@srv1144536

echo "=== Checking Migration State ==="
echo ""
echo "Step 1: Check if parentId column exists"
echo "Run this SQL query on your database:"
echo ""
echo "SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parentId';"
echo ""
echo "If it returns a row, the column exists (migration partially applied)"
echo "If it returns no rows, the column doesn't exist (migration was rolled back)"
echo ""
read -p "Does the parentId column exist? (y/n): " column_exists

if [ "$column_exists" = "y" ]; then
    echo ""
    echo "=== Migration Partially Applied ==="
    echo "The column exists but migration failed. Checking foreign key..."
    echo ""
    echo "Run this SQL to check foreign key:"
    echo "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'categories' AND constraint_name = 'categories_parentId_fkey';"
    echo ""
    read -p "Does the foreign key exist? (y/n): " fk_exists
    
    if [ "$fk_exists" = "n" ]; then
        echo ""
        echo "=== Fixing: Adding missing foreign key ==="
        echo "Run this SQL manually:"
        echo "ALTER TABLE \"categories\" ADD CONSTRAINT \"categories_parentId_fkey\" FOREIGN KEY (\"parentId\") REFERENCES \"categories\"(\"id\") ON DELETE SET NULL ON UPDATE CASCADE;"
        echo ""
        echo "Then mark migration as applied:"
        echo "npx prisma migrate resolve --applied 20260110190347_add_subcategories"
    else
        echo ""
        echo "=== Both column and foreign key exist ==="
        echo "Migration actually succeeded, just mark it as applied:"
        echo "npx prisma migrate resolve --applied 20260110190347_add_subcategories"
    fi
else
    echo ""
    echo "=== Migration Was Rolled Back ==="
    echo "Nothing was applied. Mark it as rolled back and re-apply:"
    echo ""
    echo "npx prisma migrate resolve --rolled-back 20260110190347_add_subcategories"
    echo "npx prisma migrate deploy"
fi

echo ""
echo "=== After resolving, verify with: ==="
echo "npx prisma migrate status"

