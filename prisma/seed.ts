import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create default admin account
  const adminPhone = "9999999999";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { phone: adminPhone },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        phone: adminPhone,
        passwordHash,
        name: "Admin",
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log("✅ Created admin account:");
    console.log("   Phone: 9999999999");
    console.log("   Password: admin123");
    console.log("   ID:", admin.id);
  } else {
    console.log("ℹ️  Admin account already exists");
  }

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
