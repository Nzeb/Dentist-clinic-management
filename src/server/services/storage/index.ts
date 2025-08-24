import { FileSystemStorageService } from './fileSystem';
import { AzureBlobStorageService } from './azure';

import { Readable } from 'stream';

export interface StorageService {
  upload(file: Buffer, fileName: string): Promise<string>;
  read(fileName: string): Promise<Readable>;
}

export const getStorageService = (): StorageService => {
  const provider = process.env.STORAGE_PROVIDER || 'filesystem';

  if (provider === 'azure') {
    return new AzureBlobStorageService();
  }
  return new FileSystemStorageService();
};
