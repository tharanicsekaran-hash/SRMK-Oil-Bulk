import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const EXTENSION_TO_EXT: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export function resolveImageExtension(file: File): string | null {
  if (MIME_TO_EXT[file.type]) {
    return MIME_TO_EXT[file.type];
  }

  const ext = path.extname(file.name).toLowerCase().replace(".", "");
  return EXTENSION_TO_EXT[ext] ?? null;
}

export function buildProductImageFileName(originalName: string, extension: string): string {
  const safeBaseName = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const finalBaseName = safeBaseName || "product-image";
  return `${Date.now()}-${finalBaseName}.${extension}`;
}

export function validateImageFile(file: File, extension: string | null): string | null {
  if (!extension) {
    return "Only JPG, PNG, and WEBP images are allowed";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Image must be 5MB or smaller";
  }
  return null;
}

/** Local disk (localhost). Not available on serverless production. */
async function saveToLocalPublicFolder(fileName: string, bytes: ArrayBuffer): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
  return `/uploads/products/${fileName}`;
}

/** Vercel Blob (production). Requires BLOB_READ_WRITE_TOKEN. */
async function saveToVercelBlob(
  fileName: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<string> {
  const blob = await put(`products/${fileName}`, Buffer.from(bytes), {
    access: "public",
    contentType: contentType || "application/octet-stream",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function storeProductImage(
  file: File,
  fileName: string,
  bytes: ArrayBuffer
): Promise<string> {
  const contentType = file.type || `image/${fileName.split(".").pop()}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return saveToVercelBlob(fileName, bytes, contentType);
  }

  // Serverless hosts (Vercel, etc.) have a read-only filesystem outside /tmp
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    throw new Error(
      "Image storage is not configured for production. Add BLOB_READ_WRITE_TOKEN in your hosting environment."
    );
  }

  return saveToLocalPublicFolder(fileName, bytes);
}
