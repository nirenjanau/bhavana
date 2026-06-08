import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const clientConfig = {
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
};

// Internal client — used for uploads/deletes inside Docker network.
export const s3 = new S3Client({
  ...clientConfig,
  endpoint: process.env.S3_ENDPOINT,
});

// Public client — used only for presigning download URLs.
// Signs with the browser-reachable origin so the HMAC signature matches
// the host the browser actually connects to. Rewriting the host after
// signing breaks the signature (SignatureDoesNotMatch).
const publicEndpoint = process.env.S3_PUBLIC_URL
  ? new URL(process.env.S3_PUBLIC_URL).origin
  : process.env.S3_ENDPOINT;

const s3Public = new S3Client({
  ...clientConfig,
  endpoint: publicEndpoint,
});

const BUCKET = process.env.S3_BUCKET_NAME ?? "bhavana-photos";
const PUBLIC_URL = process.env.S3_PUBLIC_URL ?? "";

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return getPublicUrl(key);
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    s3Public,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export { BUCKET };
