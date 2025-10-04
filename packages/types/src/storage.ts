/**
 * StorageDriver Interface
 * Abstraction for file/object storage (filesystem, S3, MinIO)
 */
export interface StorageDriver {
  upload(file: Buffer, key: string, contentType?: string): Promise<string>; // returns canonical key
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string, opts?: { public?: boolean; expiresInSeconds?: number }): string;
}
