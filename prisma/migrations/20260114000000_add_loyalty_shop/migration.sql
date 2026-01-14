-- CreateTable
CREATE TABLE "loyalty_settings" (
    "id" TEXT NOT NULL,
    "minPointsToUnlock" INTEGER NOT NULL DEFAULT 500,
    "pointsPerCurrency" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "stockLimit" INTEGER,
    "stockUsed" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_redemptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loyaltyProductId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "country" TEXT,
    "state" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_products_productId_key" ON "loyalty_products"("productId");

-- AddForeignKey
ALTER TABLE "loyalty_products" ADD CONSTRAINT "loyalty_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_loyaltyProductId_fkey" FOREIGN KEY ("loyaltyProductId") REFERENCES "loyalty_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert default loyalty settings
INSERT INTO "loyalty_settings" ("id", "minPointsToUnlock", "pointsPerCurrency", "createdAt", "updatedAt")
VALUES ('default', 500, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

