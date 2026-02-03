-- ============================================================================
-- DATA CLEANUP SCRIPT - PRODUCTION DATABASE
-- ============================================================================
-- 
-- ⚠️  CRITICAL WARNING ⚠️
-- This script will PERMANENTLY DELETE data from the production database.
-- 
-- BEFORE RUNNING THIS SCRIPT:
-- 1. Create a full database backup:
--    pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
-- 2. Verify backup was created successfully
-- 3. Test restore from backup on a test database
-- 4. Have a rollback plan ready
-- 
-- ============================================================================

-- Start transaction for safety
BEGIN;

-- ============================================================================
-- STEP 0: VERIFY DATA BEFORE DELETION
-- ============================================================================

-- Show users that will be KEPT
SELECT id, name, phone, email, role FROM users 
WHERE name IN ('Developers', 'Malaz', 'User test')
ORDER BY name;

-- Show count of users that will be DELETED
SELECT COUNT(*) as users_to_delete FROM users 
WHERE name NOT IN ('Developers', 'Malaz', 'User test');

-- Show count of orders to be deleted
SELECT COUNT(*) as orders_to_delete FROM orders;

-- Show archived products that will be deleted
SELECT id, "nameEn", "nameAr", "isArchived" FROM products 
WHERE "isArchived" = true 
  AND ("nameEn" LIKE '%Ikfdglfkd%' OR "nameEn" LIKE '%jhkk%');

-- Show count of messages to be deleted
SELECT COUNT(*) as messages_to_delete FROM messages;

-- Show procurement order that will be KEPT
SELECT id, "orderNumber", "poNumber", "totalCost", "createdAt" 
FROM procurements 
WHERE "totalCost" = 6185920 
  AND DATE("createdAt") = CURRENT_DATE;

-- Show count of procurement orders to be deleted
SELECT COUNT(*) as procurements_to_delete FROM procurements 
WHERE NOT ("totalCost" = 6185920 AND DATE("createdAt") = CURRENT_DATE);

-- ============================================================================
-- PAUSE HERE - REVIEW OUTPUT ABOVE
-- If the numbers look correct, uncomment the deletion commands below
-- ============================================================================

-- Uncomment the following line to proceed with deletions after review:
-- DO $$ BEGIN RAISE NOTICE 'Starting deletions...'; END $$;


-- ============================================================================
-- STEP 1: DELETE ALL MESSAGES (no dependencies)
-- ============================================================================

-- DELETE FROM messages;
-- SELECT 'Messages deleted' as status;


-- ============================================================================
-- STEP 2: DELETE PROCUREMENT ORDERS (except the one from today)
-- ============================================================================

-- First delete procurement items (child records)
-- DELETE FROM procurement_items 
-- WHERE "procurementId" IN (
--   SELECT id FROM procurements 
--   WHERE NOT ("totalCost" = 6185920 AND DATE("createdAt") = CURRENT_DATE)
-- );

-- Then delete procurement orders
-- DELETE FROM procurements 
-- WHERE NOT ("totalCost" = 6185920 AND DATE("createdAt") = CURRENT_DATE);
-- SELECT 'Procurement orders deleted (except today''s order)' as status;


-- ============================================================================
-- STEP 3: DELETE ARCHIVED TEST PRODUCTS
-- ============================================================================

-- First delete related loyalty products
-- DELETE FROM loyalty_products 
-- WHERE "productId" IN (
--   SELECT id FROM products 
--   WHERE "isArchived" = true 
--     AND ("nameEn" LIKE '%Ikfdglfkd%' OR "nameEn" LIKE '%jhkk%')
-- );

-- Delete product recipes
-- DELETE FROM product_recipes
-- WHERE "productId" IN (
--   SELECT id FROM products 
--   WHERE "isArchived" = true 
--     AND ("nameEn" LIKE '%Ikfdglfkd%' OR "nameEn" LIKE '%jhkk%')
-- );

-- Delete the products
-- DELETE FROM products 
-- WHERE "isArchived" = true 
--   AND ("nameEn" LIKE '%Ikfdglfkd%' OR "nameEn" LIKE '%jhkk%');
-- SELECT 'Archived test products deleted' as status;


-- ============================================================================
-- STEP 4: DELETE ALL CUSTOMER ORDERS
-- ============================================================================

-- Order items will be cascade deleted automatically
-- DELETE FROM orders;
-- SELECT 'All orders deleted' as status;


-- ============================================================================
-- STEP 5: DELETE USERS (except Developers, Malaz, User test)
-- ============================================================================

-- Store user IDs to keep
-- CREATE TEMP TABLE users_to_keep AS
-- SELECT id FROM users WHERE name IN ('Developers', 'Malaz', 'User test');

-- Delete loyalty redemptions for users to be deleted
-- DELETE FROM loyalty_redemptions 
-- WHERE "userId" NOT IN (SELECT id FROM users_to_keep);

-- Cart items will be cascade deleted automatically
-- Messages were already deleted in STEP 1

-- Delete users (this will cascade delete cart_items due to schema)
-- DELETE FROM users 
-- WHERE id NOT IN (SELECT id FROM users_to_keep);

-- DROP TABLE users_to_keep;
-- SELECT 'Users deleted (except Developers, Malaz, User test)' as status;


-- ============================================================================
-- STEP 6: VERIFY RESULTS
-- ============================================================================

-- Count remaining users
SELECT COUNT(*) as remaining_users, 
       STRING_AGG(name, ', ') as user_names 
FROM users;

-- Count remaining orders
SELECT COUNT(*) as remaining_orders FROM orders;

-- Count remaining messages
SELECT COUNT(*) as remaining_messages FROM messages;

-- Count remaining procurement orders
SELECT COUNT(*) as remaining_procurements FROM procurements;

-- Show remaining procurement order details
SELECT "orderNumber", "poNumber", "totalCost", "createdAt" 
FROM procurements;

-- Count remaining archived products
SELECT COUNT(*) as remaining_archived_products 
FROM products 
WHERE "isArchived" = true;


-- ============================================================================
-- COMMIT OR ROLLBACK
-- ============================================================================

-- Review the verification results above
-- If everything looks correct, uncomment COMMIT
-- Otherwise, uncomment ROLLBACK

-- COMMIT;  -- Uncomment this to make changes permanent
ROLLBACK;  -- Uncomment this to cancel all changes (currently active)

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
