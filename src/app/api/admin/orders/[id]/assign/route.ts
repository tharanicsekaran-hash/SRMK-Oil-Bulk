import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryUserId } = await request.json();
    const { id } = await params;

    // Verify delivery user exists and has DELIVERY role
    const deliveryUser = await prisma.user.findUnique({
      where: { id: deliveryUserId },
    });

    if (!deliveryUser || deliveryUser.role !== "DELIVERY") {
      return NextResponse.json({ error: "Invalid delivery user" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        assignedToId: deliveryUserId,
        deliveryStatus: "ASSIGNED",
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Assign order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
