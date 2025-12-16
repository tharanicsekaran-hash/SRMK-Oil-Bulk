import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🏥 Health check starting...");
    console.log("📊 Environment:", process.env.NODE_ENV);
    console.log("🔗 Database URL exists:", !!process.env.DATABASE_URL);
    console.log("🔗 Database URL (masked):", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"));
    
    // Test database connection
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - startTime;
    
    console.log(`✅ Database connected in ${duration}ms`);
    
    // Count products
    const productCount = await prisma.product.count();
    console.log(`📦 Products in database: ${productCount}`);
    
    // Count orders
    const orderCount = await prisma.order.count();
    console.log(`📋 Orders in database: ${orderCount}`);
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${duration}ms`,
        productCount,
        orderCount,
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : undefined,
      code: (error as { code?: string }).code,
    });
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        database: {
          connected: false,
        },
      },
      { status: 500 }
    );
  }
}

