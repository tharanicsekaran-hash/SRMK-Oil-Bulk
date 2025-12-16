import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const { label, line1, line2, city, state, postalCode, lat, lng, isDefault } =
      await request.json();

    if (!line1 || !city || !postalCode) {
      return NextResponse.json(
        { error: "Address line, city, and postal code are required" },
        { status: 400 }
      );
    }

    // If this is set as default, unset all other addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label,
        line1,
        line2,
        city,
        state: state || "",
        postalCode,
        lat,
        lng,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}

// PATCH - Set as default
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Unset all other addresses as default
    await prisma.address.updateMany({
      where: { userId: session.user.id, id: { not: id } },
      data: { isDefault: false },
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Set default address error:", error);
    return NextResponse.json(
      { error: "Failed to set default address" },
      { status: 500 }
    );
  }
}

