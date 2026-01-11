-- CreateTable
CREATE TABLE "product_recipes" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "recipeNameEn" TEXT NOT NULL,
    "recipeNameAr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_recipes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_recipes" ADD CONSTRAINT "product_recipes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

