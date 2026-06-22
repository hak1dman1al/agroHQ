import { Client } from "minio"

const endpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000"
const url = new URL(endpoint)

const minioClient = new Client({
  endPoint: url.hostname,
  port: parseInt(url.port) || (url.protocol === "https:" ? 443 : 9000),
  useSSL: url.protocol === "https:",
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
