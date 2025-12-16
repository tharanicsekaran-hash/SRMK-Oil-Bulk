-- ================================================
-- SRMK Oil Mill - Product Import SQL Script
-- Run this in Supabase SQL Editor for INSTANT product import
-- ================================================

-- First, let's check what's already there
SELECT COUNT(*) as existing_products FROM "Product";

-- Optional: Delete existing products if you want a fresh start
-- UNCOMMENT the line below ONLY if you want to delete all existing products
-- DELETE FROM "Product";

-- Insert all products (will fail if slug already exists, which is safe)
-- If products exist, use UPDATE statements instead (see bottom of file)

INSERT INTO "Product" (id, slug, "nameEn", "nameTa", unit, "pricePaisa", "stockQuantity", "isActive", category, sku, "descriptionEn", "descriptionTa", "imageUrl", "createdAt", "updatedAt") VALUES

-- Coconut Oil
(gen_random_uuid(), 'coconut-oil-200ml', 'Coconut Oil', 'தேங்காய் எண்ணெய்', '200ml', 10000, 100, true, 'oil', 'CO-200', 'Pure cold-pressed coconut oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட தேங்காய் எண்ணெய்', '/products/coconut-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'coconut-oil-500ml', 'Coconut Oil', 'தேங்காய் எண்ணெய்', '500ml', 23000, 150, true, 'oil', 'CO-500', 'Pure cold-pressed coconut oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட தேங்காய் எண்ணெய்', '/products/coconut-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'coconut-oil-1l', 'Coconut Oil', 'தேங்காய் எண்ணெய்', '1L', 45000, 200, true, 'oil', 'CO-1000', 'Pure cold-pressed coconut oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட தேங்காய் எண்ணெய்', '/products/coconut-oil.jpg', NOW(), NOW()),

-- Gingelly Oil (Sesame Oil)
(gen_random_uuid(), 'gingelly-oil-200ml', 'Gingelly Oil', 'நல்லெண்ணெய்', '200ml', 12000, 80, true, 'oil', 'GO-200', 'Traditional cold-pressed sesame oil', 'பாரம்பரிய குளிர்ச்சியாக அழுத்தப்பட்ட நல்லெண்ணெய்', '/products/gingelly-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'gingelly-oil-500ml', 'Gingelly Oil', 'நல்லெண்ணெய்', '500ml', 28000, 120, true, 'oil', 'GO-500', 'Traditional cold-pressed sesame oil', 'பாரம்பரிய குளிர்ச்சியாக அழுத்தப்பட்ட நல்லெண்ணெய்', '/products/gingelly-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'gingelly-oil-1l', 'Gingelly Oil', 'நல்லெண்ணெய்', '1L', 55000, 150, true, 'oil', 'GO-1000', 'Traditional cold-pressed sesame oil', 'பாரம்பரிய குளிர்ச்சியாக அழுத்தப்பட்ட நல்லெண்ணெய்', '/products/gingelly-oil.jpg', NOW(), NOW()),

-- Groundnut Oil
(gen_random_uuid(), 'groundnut-oil-200ml', 'Groundnut Oil', 'கடலை எண்ணெய்', '200ml', 9000, 100, true, 'oil', 'GN-200', 'Pure cold-pressed groundnut oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட கடலை எண்ணெய்', '/products/groundnut-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'groundnut-oil-500ml', 'Groundnut Oil', 'கடலை எண்ணெய்', '500ml', 21000, 130, true, 'oil', 'GN-500', 'Pure cold-pressed groundnut oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட கடலை எண்ணெய்', '/products/groundnut-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'groundnut-oil-1l', 'Groundnut Oil', 'கடலை எண்ணெய்', '1L', 40000, 180, true, 'oil', 'GN-1000', 'Pure cold-pressed groundnut oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட கடலை எண்ணெய்', '/products/groundnut-oil.jpg', NOW(), NOW()),

-- Sunflower Oil
(gen_random_uuid(), 'sunflower-oil-200ml', 'Sunflower Oil', 'சூரியகாந்தி எண்ணெய்', '200ml', 8000, 90, true, 'oil', 'SF-200', 'Pure cold-pressed sunflower oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட சூரியகாந்தி எண்ணெய்', '/products/sunflower-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'sunflower-oil-500ml', 'Sunflower Oil', 'சூரியகாந்தி எண்ணெய்', '500ml', 19000, 140, true, 'oil', 'SF-500', 'Pure cold-pressed sunflower oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட சூரியகாந்தி எண்ணெய்', '/products/sunflower-oil.jpg', NOW(), NOW()),
(gen_random_uuid(), 'sunflower-oil-1l', 'Sunflower Oil', 'சூரியகாந்தி எண்ணெய்', '1L', 36000, 160, true, 'oil', 'SF-1000', 'Pure cold-pressed sunflower oil', 'தூய குளிர்ச்சியாக அழுத்தப்பட்ட சூரியகாந்தி எண்ணெய்', '/products/sunflower-oil.jpg', NOW(), NOW())

ON CONFLICT (slug) DO UPDATE SET
  "nameEn" = EXCLUDED."nameEn",
  "nameTa" = EXCLUDED."nameTa",
  unit = EXCLUDED.unit,
  "pricePaisa" = EXCLUDED."pricePaisa",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isActive" = EXCLUDED."isActive",
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  "descriptionEn" = EXCLUDED."descriptionEn",
  "descriptionTa" = EXCLUDED."descriptionTa",
  "imageUrl" = EXCLUDED."imageUrl",
  "updatedAt" = NOW();

-- Verify import
SELECT COUNT(*) as total_products FROM "Product";
SELECT COUNT(*) as active_products FROM "Product" WHERE "isActive" = true;

-- Show all products
SELECT slug, "nameEn", unit, "pricePaisa"/100 as price_rupees, "isActive" 
FROM "Product" 
ORDER BY "nameEn", unit;

-- If you need to make all products active:
-- UPDATE "Product" SET "isActive" = true WHERE "isActive" = false;

