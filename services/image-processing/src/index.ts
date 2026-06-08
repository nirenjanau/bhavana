import "dotenv/config";
import express from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const app = express();
const PORT = process.env.PORT ?? 5000;

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET_NAME ?? "bhavana-photos";
const THUMB_W = parseInt(process.env.THUMBNAIL_WIDTH ?? "400");
const THUMB_H = parseInt(process.env.THUMBNAIL_HEIGHT ?? "300");
const PREV_W = parseInt(process.env.PREVIEW_WIDTH ?? "1200");
const PREV_H = parseInt(process.env.PREVIEW_HEIGHT ?? "900");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

// POST /process
app.post("/process", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No image provided" });
    return;
  }

  try {
    const id = uuidv4();
    const baseName = file.originalname.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]/gi, "_");

    const originalKey = `photos/${id}/original_${baseName}.webp`;
    const previewKey = `photos/${id}/preview_${baseName}.webp`;
    const thumbnailKey = `photos/${id}/thumbnail_${baseName}.webp`;

    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    // Original – lossless WebP, max 4000px
    const originalBuffer = await image
      .clone()
      .resize({ width: 4000, height: 4000, fit: "inside", withoutEnlargement: true })
      .webp({ lossless: true })
      .toBuffer();

    // Preview – 1200×900 high quality WebP
    const previewBuffer = await image
      .clone()
      .resize(PREV_W, PREV_H, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();

    // Thumbnail – 400×300 cover crop WebP
    const thumbnailBuffer = await image
      .clone()
      .resize(THUMB_W, THUMB_H, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    await Promise.all([
      uploadToS3(originalKey, originalBuffer, "image/webp"),
      uploadToS3(previewKey, previewBuffer, "image/webp"),
      uploadToS3(thumbnailKey, thumbnailBuffer, "image/webp"),
    ]);

    res.json({
      originalKey,
      previewKey,
      thumbnailKey,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      fileSize: originalBuffer.length,
    });
  } catch (err) {
    console.error("Image processing error:", err);
    res.status(500).json({ error: "Image processing failed" });
  }
});

// POST /process-url  – process from URL
app.use(express.json());
app.post("/process-url", async (req, res) => {
  const { url, filename } = req.body as { url: string; filename: string };
  if (!url) {
    res.status(400).json({ error: "url required" });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const buffer = Buffer.from(await response.arrayBuffer());

    const id = uuidv4();
    const baseName = (filename ?? "image").replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]/gi, "_");

    const originalKey = `photos/${id}/original_${baseName}.webp`;
    const previewKey = `photos/${id}/preview_${baseName}.webp`;
    const thumbnailKey = `photos/${id}/thumbnail_${baseName}.webp`;

    const image = sharp(buffer);
    const metadata = await image.metadata();

    const [originalBuffer, previewBuffer, thumbnailBuffer] = await Promise.all([
      image.clone().resize({ width: 4000, height: 4000, fit: "inside", withoutEnlargement: true }).webp({ lossless: true }).toBuffer(),
      image.clone().resize(PREV_W, PREV_H, { fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer(),
      image.clone().resize(THUMB_W, THUMB_H, { fit: "cover" }).webp({ quality: 80 }).toBuffer(),
    ]);

    await Promise.all([
      uploadToS3(originalKey, originalBuffer, "image/webp"),
      uploadToS3(previewKey, previewBuffer, "image/webp"),
      uploadToS3(thumbnailKey, thumbnailBuffer, "image/webp"),
    ]);

    res.json({
      originalKey,
      previewKey,
      thumbnailKey,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      fileSize: originalBuffer.length,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✓ Image Processing Service on http://localhost:${PORT}`);
});
