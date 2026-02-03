-- AlterTable
ALTER TABLE "categories" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Update existing categories to have incremental order
WITH ordered_categories AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "parentId" ORDER BY "createdAt") as rn
  FROM "categories"
)
UPDATE "categories" 
SET "sortOrder" = ordered_categories.rn
FROM ordered_categories 
WHERE "categories".id = ordered_categories.id;
