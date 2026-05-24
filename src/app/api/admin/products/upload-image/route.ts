import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  buildProductImageFileName,
  resolveImageExtension,
  storeProductImage,
  validateImageFile,
} from "@/lib/product-image-upload";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const extension = resolveImageExtension(image);
    const validationError = validateImageFile(image, extension);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const fileName = buildProductImageFileName(image.name, extension!);
    const bytes = await image.arrayBuffer();
    const imageUrl = await storeProductImage(image, fileName, bytes);

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json(
      {
        error:
          message.includes("BLOB_READ_WRITE_TOKEN") || message.includes("not configured")
            ? message
            : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
