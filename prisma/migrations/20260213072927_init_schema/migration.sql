-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "compatibleDevice" TEXT,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spare_parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "spare_parts_partNumber_key" ON "spare_parts"("partNumber");

-- CreateTable products (updated schema)
DROP TABLE IF EXISTS "products" CASCADE;
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "cpu" TEXT,
    "generation" TEXT,
    "productName" TEXT,
    "ram" TEXT,
    "ssd" TEXT,
    "hdd" TEXT,
    "salePrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable spare_parts (updated schema)
DROP TABLE IF EXISTS "spare_parts" CASCADE;
CREATE TABLE "spare_parts" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "cpu" TEXT,
    "generation" TEXT,
    "productName" TEXT,
    "frontPanel" DECIMAL(10,2),
    "panel" DECIMAL(10,2),
    "screenNonTouch" DECIMAL(10,2),
    "screenTouch" DECIMAL(10,2),
    "hinge" DECIMAL(10,2),
    "touchPad" DECIMAL(10,2),
    "base" DECIMAL(10,2),
    "keyboard" DECIMAL(10,2),
    "battery" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spare_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable price_calculations
CREATE TABLE "price_calculations" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "tagNo" TEXT,
    "grade" TEXT,
    "lotNumber" TEXT,
    "make" TEXT,
    "modelNumber" TEXT,
    "cpu" TEXT,
    "generation" TEXT,
    "ramPresent" BOOLEAN NOT NULL DEFAULT true,
    "ramCapacity" TEXT,
    "excelRamCapacity" TEXT,
    "hddPresent" BOOLEAN NOT NULL DEFAULT true,
    "hdd" TEXT,
    "excelHdd" TEXT,
    "ssdPresent" BOOLEAN NOT NULL DEFAULT true,
    "ssd" TEXT,
    "excelSsd" TEXT,
    "frontPanel" TEXT NOT NULL DEFAULT 'ok',
    "frontPanelCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "panel" TEXT NOT NULL DEFAULT 'ok',
    "panelCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "screenNonTouch" TEXT NOT NULL DEFAULT 'ok',
    "screenNonTouchCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "screenTouch" TEXT NOT NULL DEFAULT 'ok',
    "screenTouchCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hinge" TEXT NOT NULL DEFAULT 'ok',
    "hingeCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "touchPad" TEXT NOT NULL DEFAULT 'ok',
    "touchPadCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "base" TEXT NOT NULL DEFAULT 'ok',
    "baseCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "keyboard" TEXT NOT NULL DEFAULT 'ok',
    "keyboardCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "battery" TEXT NOT NULL DEFAULT 'ok',
    "batteryCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "repairCost" DECIMAL(10,2) NOT NULL,
    "salePrice" DECIMAL(10,2) NOT NULL,
    "suggestedSalePrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_calculations_pkey" PRIMARY KEY ("id")
);
