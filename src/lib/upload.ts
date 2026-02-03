import path from "path";
import { put } from "@vercel/blob";

const DEFAULT_MAX_MB = 4;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export type StoredUpload = {
  path: string;
  name: string;
  type: string;
  size: number;
};

export async function storeUpload(file: File): Promise<StoredUpload> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type.");
  }

  const maxMb =
    Number.parseInt(process.env.UPLOAD_MAX_SIZE_MB ?? "", 10) || DEFAULT_MAX_MB;
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File exceeds ${maxMb}MB limit.`);
  }

  const ext = safeExtension(file.name, file.type);
  const safeName = sanitizeFileName(path.basename(file.name, ext));
  const filename = `${safeName || "element"}-${Date.now()}${ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
    ...(token ? { token } : {}),
  });

  return {
    path: blob.url,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

function safeExtension(name: string, type: string) {
  const ext = path.extname(name);
  if (ext) return ext;
  if (type === "image/svg+xml") return ".svg";
  if (type === "image/png") return ".png";
  if (type === "image/jpeg" || type === "image/jpg") return ".jpg";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return "";
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").toLowerCase();
}
