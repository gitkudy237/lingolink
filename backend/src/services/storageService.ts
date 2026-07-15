import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET_NAME;
const uploadPrefix = process.env.GCS_UPLOAD_PREFIX || "voice-notes/";
const signedUrlTtlSeconds = Number(process.env.GCS_SIGNED_URL_TTL_SECONDS || 900);

function getBucketOrThrow() {
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME is not configured");
  }

  return storage.bucket(bucketName);
}

function normalizePrefix(prefix: string) {
  return prefix.endsWith("/") ? prefix : `${prefix}/`;
}

export function buildVoiceNoteObjectName(params: {
  conversationId: string;
  userId: string;
  mimeType: string;
}) {
  const extension = params.mimeType === "audio/mpeg" ? "mp3" : "m4a";
  const prefix = normalizePrefix(uploadPrefix);

  return `${prefix}${params.conversationId}/${params.userId}/${Date.now()}-${randomUUID()}.${extension}`;
}

export async function createVoiceNoteUploadSignedUrl(params: {
  objectName: string;
  mimeType: string;
}) {
  const expires = Date.now() + signedUrlTtlSeconds * 1000;

  const [uploadUrl] = await getBucketOrThrow()
    .file(params.objectName)
    .getSignedUrl({
      version: "v4",
      action: "write",
      expires,
      contentType: params.mimeType,
    });

  return {
    uploadUrl,
    expiresAt: new Date(expires).toISOString(),
  };
}

export async function createVoiceNoteReadSignedUrl(objectName: string) {
  const expires = Date.now() + signedUrlTtlSeconds * 1000;

  const [readUrl] = await getBucketOrThrow()
    .file(objectName)
    .getSignedUrl({
      version: "v4",
      action: "read",
      expires,
    });

  return {
    readUrl,
    expiresAt: new Date(expires).toISOString(),
  };
}
