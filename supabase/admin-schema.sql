-- Supabase Admin schema bootstrap

-- 1. Roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DELIVERY', 'CUSTOMER');
    END IF;
END $$;

ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS role "UserRole" NOT NULL DEFAULT 'CUSTOMER';

-- 2. Payment status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
    END IF;
END $$;

-- 3. Extend order table
ALTER TABLE "Order"
    ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS "assignedToId" text REFERENCES "User"(id),
    ADD COLUMN IF NOT EXISTS "deliveryEta" timestamptz,
    ADD COLUMN IF NOT EXISTS "deliveredAt" timestamptz,
    ADD COLUMN IF NOT EXISTS "deliveryZoneId" text REFERENCES "DeliveryZone"(id);

-- 4. Delivery logs
CREATE TABLE IF NOT EXISTS "DeliveryLog" (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" text REFERENCES "Order"(id) ON DELETE CASCADE,
    "driverId" text REFERENCES "User"(id) ON DELETE CASCADE,
    status "OrderStatus" NOT NULL,
    note text,
    "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- 5. Delivery zones
CREATE TABLE IF NOT EXISTS "DeliveryZone" (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    pincodes text[] NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- M2M table for delivery agents
CREATE TABLE IF NOT EXISTS "_UserZones" (
    "A" text REFERENCES "User"(id) ON DELETE CASCADE,
    "B" text REFERENCES "DeliveryZone"(id) ON DELETE CASCADE,
    UNIQUE ("A","B")
);

-- 6. Product categories
CREATE TABLE IF NOT EXISTS "ProductCategory" (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS "categoryId" text REFERENCES "ProductCategory"(id);

-- 7. Seed admin user helper (run once to promote an existing phone number)
-- UPDATE "User" SET role = 'ADMIN' WHERE phone = '9876543210';

-- 8. Supabase RLS policies (run after enabling RLS on each table)
-- Example for orders
/*
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_admin_all" ON "Order"
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'ADMIN')
    WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "orders_delivery_assigned" ON "Order"
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'ADMIN'
        OR auth.jwt() ->> 'role' = 'DELIVERY'
        AND auth.uid() = "assignedToId");
*/

