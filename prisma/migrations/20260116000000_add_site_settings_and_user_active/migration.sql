-- AlterTable: Add isActive field to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'isActive') THEN
        ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- CreateTable: Site Settings (if not exists)
CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" TEXT NOT NULL,
    "bannerImage" TEXT,
    "supportPhone" TEXT,
    "supportEmail" TEXT,
    "supportWhatsapp" TEXT,
    "supportAddressEn" TEXT,
    "supportAddressAr" TEXT,
    "workingHoursEn" TEXT,
    "workingHoursAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- Create sequence for poNumber first (outside DO block to ensure it exists)
CREATE SEQUENCE IF NOT EXISTS "procurements_ponumber_seq";

-- AlterTable: Add poNumber to procurements table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'procurements' AND column_name = 'poNumber') THEN
        -- Add column
        ALTER TABLE "procurements" ADD COLUMN "poNumber" INTEGER;
        
        -- Set the sequence as the default
        ALTER TABLE "procurements" ALTER COLUMN "poNumber" SET DEFAULT nextval('procurements_ponumber_seq'::regclass);
        
        -- Update existing rows to have sequential numbers
        UPDATE "procurements" SET "poNumber" = nextval('procurements_ponumber_seq'::regclass) WHERE "poNumber" IS NULL;
        
        -- Make it NOT NULL after populating
        ALTER TABLE "procurements" ALTER COLUMN "poNumber" SET NOT NULL;
        
        -- Set the sequence owner (this links the sequence to the column)
        ALTER SEQUENCE "procurements_ponumber_seq" OWNED BY "procurements"."poNumber";
    END IF;
END $$;

-- AlterTable: Add createdById to procurements table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'procurements' AND column_name = 'createdById') THEN
        ALTER TABLE "procurements" ADD COLUMN "createdById" TEXT;
    END IF;
END $$;

-- Create unique constraint on poNumber (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'procurements_poNumber_key'
    ) THEN
        CREATE UNIQUE INDEX "procurements_poNumber_key" ON "procurements"("poNumber");
    END IF;
END $$;

-- AddForeignKey: Link procurements to users (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'procurements_createdById_fkey'
    ) THEN
        ALTER TABLE "procurements" ADD CONSTRAINT "procurements_createdById_fkey" 
        FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

