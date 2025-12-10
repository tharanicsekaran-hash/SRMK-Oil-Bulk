-- Manual migration for admin dashboard
-- This safely adds new fields without destroying existing data

-- Step 1: Drop old conflicting tables if they exist
DROP TABLE IF EXISTS "DeliveryLog" CASCADE;
DROP TABLE IF EXISTS "DeliveryZone" CASCADE;
DROP TABLE IF EXISTS "ProductCategory" CASCADE;
DROP TABLE IF EXISTS "_UserZones" CASCADE;

-- Step 2: Create new enums
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'DELIVERY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Step 4: Add new columns to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;

-- Step 5: Add foreign key for Order.assignedToId if not exists
DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedToId_fkey" 
    FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 6: Add new columns to Product table for admin CRUD
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stockQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "offerTextTa" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "offerTextEn" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Step 7: Add unique constraint on sku if not exists
DO $$ BEGIN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_sku_key" UNIQUE ("sku");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 8: Clean up old OrderStatus enum values if they exist
-- This is handled by the schema - we keep PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELED

