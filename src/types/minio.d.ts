declare module "minio" {
  export class Client {
    constructor(options: {
      endPoint: string
      port: number
      useSSL: boolean
      accessKey: string
      secretKey: string
    })
    bucketExists(bucketName: string): Promise<boolean>
    makeBucket(bucketName: string): Promise<void>
    presignedPutObject(
      bucketName: string,
      objectName: string,
      expires?: number
    ): Promise<string>
    presignedGetObject(
      bucketName: string,
      objectName: string,
      expires?: number
    ): Promise<string>
  }
}
