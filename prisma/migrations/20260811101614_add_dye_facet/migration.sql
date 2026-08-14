-- CreateTable
CREATE TABLE "Dye" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Dye_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDye" (
    "productId" TEXT NOT NULL,
    "dyeId" TEXT NOT NULL,

    CONSTRAINT "ProductDye_pkey" PRIMARY KEY ("productId","dyeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dye_slug_key" ON "Dye"("slug");

-- CreateIndex
CREATE INDEX "Dye_position_idx" ON "Dye"("position");

-- CreateIndex
CREATE INDEX "ProductDye_dyeId_idx" ON "ProductDye"("dyeId");

-- AddForeignKey
ALTER TABLE "ProductDye" ADD CONSTRAINT "ProductDye_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDye" ADD CONSTRAINT "ProductDye_dyeId_fkey" FOREIGN KEY ("dyeId") REFERENCES "Dye"("id") ON DELETE CASCADE ON UPDATE CASCADE;
