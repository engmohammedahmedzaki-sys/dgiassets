import { Injectable } from '@nestjs/common';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  /**
   * Get the public URL for an uploaded file
   */
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * Delete an uploaded file
   */
  deleteFile(filename: string): boolean {
    try {
      const filePath = join(process.cwd(), 'uploads', filename);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Validate file exists
   */
  fileExists(filename: string): boolean {
    const filePath = join(process.cwd(), 'uploads', filename);
    return existsSync(filePath);
  }
}
