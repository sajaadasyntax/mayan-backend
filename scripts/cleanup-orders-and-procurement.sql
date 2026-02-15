-- ============================================================
-- CLEANUP SCRIPT: Delete customer orders & procurement PO-1..PO-3
-- ============================================================
-- Run with: psql -h <host> -U <user> -d <db> -f cleanup-orders-and-procurement.sql
--
-- This script:
--   1. Previews everything that will be deleted (SELECT)
--   2. Wraps all deletes in a TRANSACTION for safety
--   3. Deletes child rows first (order_items, procurement_items)
--      then parent rows (orders, procurements)
--   4. Reverses stock changes from the deleted procurements
-- ============================================================


-- ============================================================
-- STEP 1: PREVIEW — Run this first to see what will be deleted
-- ============================================================

-- 1a. Customer orders to delete (all orders from non-admin users)
SELECT
  o.id,
  o."invoiceNumber",
  o.status,
  o."paymentStatus",
  o.total,
  o."createdAt",
  u.name   AS customer_name,
  u.phone  AS customer_phone,
  u.role   AS user_role
FROM orders o
JOIN users u ON o."userId" = u.id
WHERE u.role = 'USER'
ORDER BY o."createdAt" DESC;

-- 1b. Order items that will be cascade-deleted
SELECT
  oi.id,
  oi.quantity,
  oi.price,
  p."nameEn" AS product,
  o."invoiceNumber"
FROM order_items oi
JOIN orders o  ON oi."orderId" = o.id
JOIN users  u  ON o."userId"  = u.id
JOIN products p ON oi."productId" = p.id
WHERE u.role = 'USER';

-- 1c. Procurement orders PO-1 through PO-3
SELECT
  pr.id,
  pr."orderNumber",
  pr."poNumber",
  pr.supplier,
  pr.status,
  pr."totalCost",
  pr."createdAt"
FROM procurements pr
WHERE pr."poNumber" IN (1, 2, 3);

-- 1d. Procurement items that will be cascade-deleted
-- (also shows stock impact — these quantities were added to products)
SELECT
  pi.id,
  pi.quantity      AS qty_to_reverse,
  pi."costPrice",
  p."nameEn"       AS product,
  p.stock          AS current_stock,
  pr."poNumber"
FROM procurement_items pi
JOIN procurements pr ON pi."procurementId" = pr.id
JOIN products p      ON pi."productId"     = p.id
WHERE pr."poNumber" IN (1, 2, 3);


-- ============================================================
-- STEP 2: DELETE — Uncomment the block below to execute
-- ============================================================

-- !! IMPORTANT !!
-- Review the SELECT results above before uncommenting.
-- Once you're confident, uncomment everything between BEGIN and COMMIT.

/*
BEGIN;

  -- ---------------------------------------------------------
  -- 2a. Reverse stock for procurement PO-1..PO-3
  --     Subtract the quantities that were added by those POs
  -- ---------------------------------------------------------
  UPDATE products p
  SET stock = GREATEST(0, p.stock - sub.total_qty)
  FROM (
    SELECT
      pi."productId",
      SUM(pi.quantity) AS total_qty
    FROM procurement_items pi
    JOIN procurements pr ON pi."procurementId" = pr.id
    WHERE pr."poNumber" IN (1, 2, 3)
    GROUP BY pi."productId"
  ) sub
  WHERE p.id = sub."productId";

  -- ---------------------------------------------------------
  -- 2b. Delete procurement items (child rows)
  -- ---------------------------------------------------------
  DELETE FROM procurement_items
  WHERE "procurementId" IN (
    SELECT id FROM procurements WHERE "poNumber" IN (1, 2, 3)
  );

  -- ---------------------------------------------------------
  -- 2c. Delete procurement orders PO-1..PO-3 (parent rows)
  -- ---------------------------------------------------------
  DELETE FROM procurements
  WHERE "poNumber" IN (1, 2, 3);

  -- ---------------------------------------------------------
  -- 2d. Delete order items for all customer orders (child rows)
  -- ---------------------------------------------------------
  DELETE FROM order_items
  WHERE "orderId" IN (
    SELECT o.id
    FROM orders o
    JOIN users u ON o."userId" = u.id
    WHERE u.role = 'USER'
  );

  -- ---------------------------------------------------------
  -- 2e. Delete all customer orders (parent rows)
  -- ---------------------------------------------------------
  DELETE FROM orders
  WHERE "userId" IN (
    SELECT id FROM users WHERE role = 'USER'
  );

  -- ---------------------------------------------------------
  -- 2f. Verify deletions
  -- ---------------------------------------------------------
  SELECT 'Remaining customer orders' AS check,
         COUNT(*) AS count
  FROM orders o
  JOIN users u ON o."userId" = u.id
  WHERE u.role = 'USER'

  UNION ALL

  SELECT 'Remaining PO-1..PO-3',
         COUNT(*)
  FROM procurements
  WHERE "poNumber" IN (1, 2, 3);

COMMIT;
*/

-- To rollback instead of committing (if something looks wrong):
-- Replace COMMIT with ROLLBACK;
