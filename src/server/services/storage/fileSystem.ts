import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import { StorageService } from './index';
import { Readable } from 'stream';

export class FileSystemStorageService implements StorageService {
  private uploadDir = path.join(process.cwd(), 'public', 'uploads');

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async upload(file: Buffer, fileName:string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, file);
    return fileName;
  }

  async read(fileName: string): Promise<Readable> {
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.access(filePath);
      return createReadStream(filePath);
    } catch (error) {
      throw new Error('File not found');
    }
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // If the file doesn't exist, we can consider it a success
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to delete file: ${fileName}`);
      }
    }
  }
}
