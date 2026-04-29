import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NdaSignature } from './nda-signature.entity';

@Injectable()
export class NdaService {
  constructor(
    @InjectRepository(NdaSignature)
    private ndaRepository: Repository<NdaSignature>,
  ) {}

  async sign(projectId: string, userId: string, ipAddress?: string): Promise<NdaSignature> {
    const existing = await this.ndaRepository.findOne({ where: { projectId, userId } });
    if (existing) return existing;
    const signature = this.ndaRepository.create({
      projectId,
      userId,
      ipAddress: ipAddress ?? null,
    });
    return this.ndaRepository.save(signature);
  }

  async hasSigned(projectId: string, userId: string): Promise<boolean> {
    const existing = await this.ndaRepository.findOne({ where: { projectId, userId } });
    return !!existing;
  }

  async getSignaturesForProject(projectId: string): Promise<NdaSignature[]> {
    return this.ndaRepository.find({ where: { projectId } });
  }
}
