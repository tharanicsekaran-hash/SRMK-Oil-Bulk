import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isActive } = await request.json();
    const { id } = await params;

    const agent = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("PATCH delivery agent error:", error);

    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Delivery agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update delivery agent" },
      { status: 500 }
    );
  }
}
