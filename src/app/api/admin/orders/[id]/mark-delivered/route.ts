import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "DELIVERY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const order = await prisma.order.update({
      where: { id },
      data: {
        deliveryStatus: "DELIVERED",
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Mark delivered error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

