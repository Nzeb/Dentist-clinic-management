import fs from 'fs/promises';
import path from 'path';
import { StorageService } from './index';

export class FileSystemStorageService implements StorageService {
  async upload(file: Buffer, fileName: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, file);
    return `/uploads/${fileName}`;
  }
}
