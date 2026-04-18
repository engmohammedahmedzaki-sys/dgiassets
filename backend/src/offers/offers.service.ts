import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer, OfferStatus } from './offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private projectsService: ProjectsService,
  ) {}

  async create(createOfferDto: CreateOfferDto, buyerId: string): Promise<Offer> {
    // Verify project exists
    const project = await this.projectsService.findOne(createOfferDto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if buyer is not the owner
    if (project.ownerId === buyerId) {
      throw new BadRequestException('You cannot make an offer on your own project');
    }

    // Check if buyer already has a pending offer
    const existingOffer = await this.offersRepository.findOne({
      where: {
        projectId: createOfferDto.projectId,
        buyerId,
        status: OfferStatus.PENDING,
      },
    });

    if (existingOffer) {
      throw new BadRequestException('You already have a pending offer on this project');
    }

    const offer = this.offersRepository.create({
      ...createOfferDto,
      buyerId,
    });

    return this.offersRepository.save(offer);
  }

  async findAll(userId: string, type: 'sent' | 'received'): Promise<Offer[]> {
    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.project', 'project')
      .leftJoinAndSelect('offer.buyer', 'buyer');

    if (type === 'sent') {
      queryBuilder.where('offer.buyerId = :userId', { userId });
    } else {
      queryBuilder
        .where('project.ownerId = :userId', { userId });
    }

    return queryBuilder
      .orderBy('offer.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['project', 'buyer'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check if user is buyer or project owner
    if (offer.buyerId !== userId && offer.project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this offer');
    }

    return offer;
  }

  async accept(id: string, userId: string): Promise<Offer> {
    const offer = await this.findOne(id, userId);

    // Only project owner can accept
    if (offer.project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can accept offers');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Only pending offers can be accepted');
    }

    offer.status = OfferStatus.ACCEPTED;
    return this.offersRepository.save(offer);
  }

  async reject(id: string, userId: string, rejectReason?: string): Promise<Offer> {
    const offer = await this.findOne(id, userId);

    // Only project owner can reject
    if (offer.project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can reject offers');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Only pending offers can be rejected');
    }

    offer.status = OfferStatus.REJECTED;
    if (rejectReason) {
      offer.rejectReason = rejectReason;
    }
    return this.offersRepository.save(offer);
  }

  async counter(id: string, userId: string, counterAmount: number): Promise<Offer> {
    const offer = await this.findOne(id, userId);

    // Only project owner can counter
    if (offer.project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can counter offers');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Only pending offers can be countered');
    }

    offer.counterAmount = counterAmount;
    return this.offersRepository.save(offer);
  }

  async withdraw(id: string, userId: string): Promise<Offer> {
    const offer = await this.findOne(id, userId);

    // Only buyer can withdraw
    if (offer.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can withdraw their offer');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Only pending offers can be withdrawn');
    }

    offer.status = OfferStatus.WITHDRAWN;
    return this.offersRepository.save(offer);
  }

  async getProjectOffers(projectId: string, ownerId: string): Promise<Offer[]> {
    // Verify project belongs to user
    const project = await this.projectsService.findOne(projectId);
    if (project.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to these offers');
    }

    return this.offersRepository.find({
      where: { projectId },
      relations: ['buyer'],
      order: { createdAt: 'DESC' },
    });
  }
}
