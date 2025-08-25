import { BlobServiceClient } from '@azure/storage-blob';
import { StorageService } from './index';
import { Readable } from 'stream';

export class AzureBlobStorageService implements StorageService {
  private blobServiceClient: BlobServiceClient;
  private containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured');
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async upload(file: Buffer, fileName: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.upload(file, file.length);
    return fileName;
  }

  async read(fileName: string): Promise<Readable> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    if (!downloadBlockBlobResponse.readableStreamBody) {
        throw new Error('File not found or is empty');
    }
    return downloadBlockBlobResponse.readableStreamBody as Readable;
  }

  async delete(fileName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.deleteIfExists();
  }
}
