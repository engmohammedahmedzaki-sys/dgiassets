import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { User } from '../users/user.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async saveMedia(
    file: Express.Multer.File,
    url: string,
    user: User,
  ): Promise<Media> {
    const media = this.mediaRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      uploadedById: user.id,
    });
    return this.mediaRepository.save(media);
  }

  async getUserMedia(userId: string): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { uploadedById: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllMedia(): Promise<Media[]> {
    return this.mediaRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['uploadedBy'],
    });
  }

  async deleteMedia(id: string, userId: string, role: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    
    // Only admin or the owner can delete
    if (role !== 'admin' && media.uploadedById !== userId) {
      throw new NotFoundException('Media not found'); // obfuscate permission error
    }

    // TODO: physically delete file from disk if needed
    await this.mediaRepository.remove(media);
  }
}
