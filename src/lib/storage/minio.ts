import { Client } from "minio"

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT?.replace(/https?:\/\//, "") || "localhost",
  port: parseInt(process.env.MINIO_ENDPOINT?.split(":").pop() || "9000"),
  useSSL: process.env.MINIO_ENDPOINT?.startsWith("https") || false,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
})

export async function ensureBucket() {
  const bucketName = process.env.MINIO_BUCKET || "agro-hq"
  const exists = await minioClient.bucketExists(bucketName)
  if (!exists) {
    await minioClient.makeBucket(bucketName)
  }
  return bucketName
}

export async function getSignedUploadUrl(filename: string, contentType: string) {
  const bucketName = await ensureBucket()
  const key = `uploads/${Date.now()}-${filename}`
  
  const url = await minioClient.presignedPutObject(bucketName, key, 300) // 5 minutes
  
  return { url, key }
}

export async function getSignedDownloadUrl(key: string) {
  const bucketName = await ensureBucket()
  const url = await minioClient.presignedGetObject(bucketName, key, 300) // 5 minutes
  return url
}

export { minioClient }
