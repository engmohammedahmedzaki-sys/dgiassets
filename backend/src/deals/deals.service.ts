import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal, DealStatus } from './deal.entity';
import { Offer, OfferStatus } from '../offers/offer.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private dealsRepository: Repository<Deal>,
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private paymentsService: PaymentsService,
  ) {}

  async createFromOffer(
    offerId: string,
    buyerId: string,
  ): Promise<{ deal: Deal; paymentUrl: string }> {
    const offer = await this.offersRepository.findOne({
      where: { id: offerId },
      relations: ['project', 'buyer'],
    });

    if (!offer) throw new NotFoundException('العرض غير موجود');
    if (offer.buyerId !== buyerId)
      throw new ForbiddenException('لا يمكنك إنشاء صفقة لعرض شخص آخر');
    if (offer.status !== OfferStatus.ACCEPTED)
      throw new BadRequestException('يجب أن يكون العرض مقبولاً أولاً');

    const existingDeal = await this.dealsRepository.findOne({
      where: { offerId },
    });
    if (existingDeal) {
      throw new BadRequestException('صفقة موجودة بالفعل لهذا العرض');
    }

    const finalAmount =
      offer.counterAmount && Number(offer.counterAmount) > 0
        ? Number(offer.counterAmount)
        : Number(offer.offerAmount);

    const deal = this.dealsRepository.create({
      offerId,
      projectId: offer.projectId,
      buyerId,
      sellerId: offer.project.ownerId,
      finalAmount,
      status: DealStatus.PAYMENT_PENDING,
    });

    await this.dealsRepository.save(deal);

    const { paymentUrl } = await this.paymentsService.initiatePayment(
      deal.id,
      buyerId,
      finalAmount,
      `شراء مشروع: ${offer.project.title}`,
    );

    return { deal, paymentUrl };
  }

  async confirmPayment(dealId: string, moyasarId: string): Promise<Deal> {
    const payment = await this.paymentsService.verifyPayment(moyasarId);

    const deal = await this.dealsRepository.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('الصفقة غير موجودة');

    if (payment.status === 'paid' && deal.status === DealStatus.PAYMENT_PENDING) {
      deal.status = DealStatus.PAID;
      await this.dealsRepository.save(deal);
    }

    return deal;
  }

  async startTransfer(dealId: string, sellerId: string, transferNotes?: string): Promise<Deal> {
    const deal = await this.findOneForUser(dealId, sellerId);

    if (deal.sellerId !== sellerId)
      throw new ForbiddenException('فقط البائع يمكنه بدء نقل الملكية');
    if (deal.status !== DealStatus.PAID)
      throw new BadRequestException('يجب أن يكون الدفع مكتملاً أولاً');

    const inspectionDeadline = new Date();
    inspectionDeadline.setDate(inspectionDeadline.getDate() + 3);

    deal.status = DealStatus.TRANSFER_STARTED;
    deal.inspectionDeadline = inspectionDeadline;
    if (transferNotes) deal.transferNotes = transferNotes;

    return this.dealsRepository.save(deal);
  }

  async completeDeal(dealId: string, buyerId: string): Promise<Deal> {
    const deal = await this.findOneForUser(dealId, buyerId);

    if (deal.buyerId !== buyerId)
      throw new ForbiddenException('فقط المشتري يمكنه إتمام الصفقة');
    if (![DealStatus.TRANSFER_STARTED, DealStatus.INSPECTION].includes(deal.status))
      throw new BadRequestException('لا يمكن إتمام الصفقة في هذه المرحلة');

    deal.status = DealStatus.COMPLETED;
    return this.dealsRepository.save(deal);
  }

  async openDispute(dealId: string, userId: string, reason: string): Promise<Deal> {
    const deal = await this.findOneForUser(dealId, userId);

    if (![DealStatus.TRANSFER_STARTED, DealStatus.INSPECTION].includes(deal.status))
      throw new BadRequestException('لا يمكن فتح نزاع في هذه المرحلة');

    deal.status = DealStatus.DISPUTED;
    deal.disputeReason = reason;
    return this.dealsRepository.save(deal);
  }

  async findMyDeals(userId: string): Promise<Deal[]> {
    return this.dealsRepository.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(dealId: string, userId: string): Promise<Deal> {
    const deal = await this.dealsRepository.findOne({
      where: { id: dealId },
      relations: ['project', 'offer'],
    });

    if (!deal) throw new NotFoundException('الصفقة غير موجودة');
    if (deal.buyerId !== userId && deal.sellerId !== userId)
      throw new ForbiddenException('ليس لديك صلاحية لهذه الصفقة');

    return deal;
  }
}
