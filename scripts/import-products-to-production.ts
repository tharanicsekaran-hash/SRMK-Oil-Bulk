import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  // Coconut Oil
  {
    slug: "coconut-oil-200ml",
    nameEn: "Coconut Oil",
    nameTa: "தேங்காய் எண்ணெய்",
    unit: "200ml",
    pricePaisa: 10000, // ₹100
    stockQuantity: 100,
    isActive: true,
    category: "oil",
    sku: "CO-200",
    descriptionEn: "Pure cold-pressed coconut oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட தேங்காய் எண்ணெய்",
    imageUrl: "/products/coconut-oil.jpg",
  },
  {
    slug: "coconut-oil-500ml",
    nameEn: "Coconut Oil",
    nameTa: "தேங்காய் எண்ணெய்",
    unit: "500ml",
    pricePaisa: 23000, // ₹230
    stockQuantity: 150,
    isActive: true,
    category: "oil",
    sku: "CO-500",
    descriptionEn: "Pure cold-pressed coconut oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட தேங்காய் எண்ணெய்",
    imageUrl: "/products/coconut-oil.jpg",
  },
  {
    slug: "coconut-oil-1l",
    nameEn: "Coconut Oil",
    nameTa: "தேங்காய் எண்ணெய்",
    unit: "1L",
    pricePaisa: 45000, // ₹450
    stockQuantity: 200,
    isActive: true,
    category: "oil",
    sku: "CO-1000",
    descriptionEn: "Pure cold-pressed coconut oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட தேங்காய் எண்ணெய்",
    imageUrl: "/products/coconut-oil.jpg",
  },

  // Gingelly Oil (Sesame Oil)
  {
    slug: "gingelly-oil-200ml",
    nameEn: "Gingelly Oil",
    nameTa: "நல்லெண்ணெய்",
    unit: "200ml",
    pricePaisa: 12000, // ₹120
    stockQuantity: 80,
    isActive: true,
    category: "oil",
    sku: "GO-200",
    descriptionEn: "Traditional cold-pressed sesame oil",
    descriptionTa: "பாரம்பரிய குளிர்ச்சியாக அழுத்தப்பட்ட நல்லெண்ணெய்",
    imageUrl: "/products/gingelly-oil.jpg",
  },
  {
    slug: "gingelly-oil-500ml",
    nameEn: "Gingelly Oil",
    nameTa: "நல்லெண்ணெய்",
    unit: "500ml",
    pricePaisa: 28000, // ₹280
    stockQuantity: 120,
    isActive: true,
    category: "oil",
    sku: "GO-500",
    descriptionEn: "Traditional cold-pressed sesame oil",
    descriptionTa: "பாரம்பரிய குளிர்ச்சியாக அழுத்தப்பட்ட நல்லெண்ணெய்",
    imageUrl: "/products/gingelly-oil.jpg",
  },
  {
    slug: "gingelly-oil-1l",
    nameEn: "Gingelly Oil",
    nameTa: "நல்லெண்ணெய்",
    unit: "1L",
    pricePaisa: 55000, // ₹550
    stockQuantity: 150,
    isActive: true,
    category: "oil",
    sku: "GO-1000",
    descriptionEn: "Traditional cold-pressed sesame oil",
    descriptionTa: "பாரம்பரிய குளிர்ச்சியாக அழுத்தப்பட்ட நல்லெண்ணெய்",
    imageUrl: "/products/gingelly-oil.jpg",
  },

  // Groundnut Oil
  {
    slug: "groundnut-oil-200ml",
    nameEn: "Groundnut Oil",
    nameTa: "கடலை எண்ணெய்",
    unit: "200ml",
    pricePaisa: 9000, // ₹90
    stockQuantity: 100,
    isActive: true,
    category: "oil",
    sku: "GN-200",
    descriptionEn: "Pure cold-pressed groundnut oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட கடலை எண்ணெய்",
    imageUrl: "/products/groundnut-oil.jpg",
  },
  {
    slug: "groundnut-oil-500ml",
    nameEn: "Groundnut Oil",
    nameTa: "கடலை எண்ணெய்",
    unit: "500ml",
    pricePaisa: 21000, // ₹210
    stockQuantity: 130,
    isActive: true,
    category: "oil",
    sku: "GN-500",
    descriptionEn: "Pure cold-pressed groundnut oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட கடலை எண்ணெய்",
    imageUrl: "/products/groundnut-oil.jpg",
  },
  {
    slug: "groundnut-oil-1l",
    nameEn: "Groundnut Oil",
    nameTa: "கடலை எண்ணெய்",
    unit: "1L",
    pricePaisa: 40000, // ₹400
    stockQuantity: 180,
    isActive: true,
    category: "oil",
    sku: "GN-1000",
    descriptionEn: "Pure cold-pressed groundnut oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட கடலை எண்ணெய்",
    imageUrl: "/products/groundnut-oil.jpg",
  },

  // Sunflower Oil
  {
    slug: "sunflower-oil-200ml",
    nameEn: "Sunflower Oil",
    nameTa: "சூரியகாந்தி எண்ணெய்",
    unit: "200ml",
    pricePaisa: 8000, // ₹80
    stockQuantity: 90,
    isActive: true,
    category: "oil",
    sku: "SF-200",
    descriptionEn: "Pure cold-pressed sunflower oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட சூரியகாந்தி எண்ணெய்",
    imageUrl: "/products/sunflower-oil.jpg",
  },
  {
    slug: "sunflower-oil-500ml",
    nameEn: "Sunflower Oil",
    nameTa: "சூரியகாந்தி எண்ணெய்",
    unit: "500ml",
    pricePaisa: 19000, // ₹190
    stockQuantity: 140,
    isActive: true,
    category: "oil",
    sku: "SF-500",
    descriptionEn: "Pure cold-pressed sunflower oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட சூரியகாந்தி எண்ணெய்",
    imageUrl: "/products/sunflower-oil.jpg",
  },
  {
    slug: "sunflower-oil-1l",
    nameEn: "Sunflower Oil",
    nameTa: "சூரியகாந்தி எண்ணெய்",
    unit: "1L",
    pricePaisa: 36000, // ₹360
    stockQuantity: 160,
    isActive: true,
    category: "oil",
    sku: "SF-1000",
    descriptionEn: "Pure cold-pressed sunflower oil",
    descriptionTa: "தூய குளிர்ச்சியாக அழுத்தப்பட்ட சூரியகாந்தி எண்ணெய்",
    imageUrl: "/products/sunflower-oil.jpg",
  },
];

async function main() {
  console.log("🚀 Starting product import to production database...");
  console.log("📊 Total products to import:", products.length);
  console.log("");

  try {
    // Check if products already exist
    const existingCount = await prisma.product.count();
    console.log(`📦 Existing products in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log("");
      console.log("⚠️  WARNING: Database already has products!");
      console.log("Do you want to:");
      console.log("  1. Skip import (keep existing)");
      console.log("  2. Upsert (update existing, add new)");
      console.log("  3. Delete all and reimport (⚠️  DESTRUCTIVE)");
      console.log("");
      console.log("ℹ️  This script will UPSERT (update/insert) products by slug");
      console.log("");
    }

    let imported = 0;
    let updated = 0;

    for (const product of products) {
      const existing = await prisma.product.findUnique({
        where: { slug: product.slug },
      });

      if (existing) {
        await prisma.product.update({
          where: { slug: product.slug },
          data: product,
        });
        updated++;
        console.log(`✅ Updated: ${product.nameEn} (${product.unit})`);
      } else {
        await prisma.product.create({
          data: product,
        });
        imported++;
        console.log(`✨ Created: ${product.nameEn} (${product.unit})`);
      }
    }

    console.log("");
    console.log("🎉 ===== IMPORT COMPLETE =====");
    console.log(`✨ New products created: ${imported}`);
    console.log(`✅ Existing products updated: ${updated}`);
    console.log(`📦 Total products now: ${await prisma.product.count()}`);
    console.log("");

    // Verify all products are active
    const activeCount = await prisma.product.count({
      where: { isActive: true },
    });
    console.log(`🟢 Active products: ${activeCount}`);
    console.log(`🔴 Inactive products: ${(await prisma.product.count()) - activeCount}`);

    if (activeCount === 0) {
      console.log("");
      console.log("⚠️  WARNING: No active products! Setting all to active...");
      await prisma.product.updateMany({
        data: { isActive: true },
      });
      console.log("✅ All products set to active");
    }

    console.log("");
    console.log("✅ Products are now available in production!");
    console.log("🌐 Check your website: /products");
  } catch (error) {
    console.error("");
    console.error("❌ ERROR importing products:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

