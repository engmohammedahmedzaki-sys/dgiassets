import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async saveMessage(dealId: string, senderId: string, content: string): Promise<Message> {
    const msg = this.messagesRepository.create({ dealId, senderId, content });
    return this.messagesRepository.save(msg);
  }

  async getMessages(dealId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { dealId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async markRead(dealId: string, userId: string): Promise<void> {
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('dealId = :dealId AND senderId != :userId AND isRead = false', {
        dealId,
        userId,
      })
      .execute();
  }
}
