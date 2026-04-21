import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from './payment.entity';
import { SettingsService } from '../settings/settings.service';

const MOYASAR_BASE = 'https://api.moyasar.com/v1';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {}

  private async getMoyasarKey(): Promise<string> {
    const settings = await this.settingsService.getSettings();
    const dbKey = settings?.moyasarEnabled ? settings.moyasarSecretKey : null;
    const envKey = this.configService.get<string>('MOYASAR_SECRET_KEY');
    const key = dbKey || envKey;
    if (!key) {
      throw new BadRequestException(
        'بوابة الدفع غير مفعّلة. يرجى من الإدارة إعداد مفاتيح Moyasar من لوحة التحكم.',
      );
    }
    return key;
  }

  async initiatePayment(
    dealId: string,
    buyerId: string,
    amount: number,
    description: string,
  ): Promise<{ payment: Payment; paymentUrl: string }> {
    const secretKey = await this.getMoyasarKey();

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://dgiassets.com',
    );
    const callbackUrl = `${frontendUrl}/payment/callback`;
    const amountInHalalas = Math.round(amount * 100);

    const moyasarBody = {
      amount: amountInHalalas,
      currency: 'SAR',
      description,
      callback_url: callbackUrl,
      source: { type: 'hostedpage' },
      metadata: { dealId, buyerId },
    };

    const authHeader =
      'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');

    let moyasarData: any;
    try {
      const res = await fetch(`${MOYASAR_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(moyasarBody),
      });
      moyasarData = await res.json();
    } catch (err) {
      this.logger.error('Moyasar API error', err);
      throw new BadRequestException('فشل الاتصال ببوابة الدفع');
    }

    if (!moyasarData?.id) {
      this.logger.error('Moyasar bad response', moyasarData);
      throw new BadRequestException('خطأ في إنشاء الدفع');
    }

    const payment = this.paymentsRepository.create({
      dealId,
      buyerId,
      amount,
      currency: 'SAR',
      description,
      status: PaymentStatus.PENDING,
      moyasarId: moyasarData.id,
      moyasarUrl: moyasarData.source?.transaction_url ?? null,
      moyasarResponse: moyasarData,
    });

    await this.paymentsRepository.save(payment);

    return {
      payment,
      paymentUrl: moyasarData.source?.transaction_url ?? '',
    };
  }

  async verifyPayment(moyasarId: string): Promise<Payment> {
    const secretKey = await this.getMoyasarKey();
    const authHeader =
      'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');

    let moyasarData: any;
    try {
      const res = await fetch(`${MOYASAR_BASE}/payments/${moyasarId}`, {
        headers: { Authorization: authHeader },
      });
      moyasarData = await res.json();
    } catch (err) {
      throw new BadRequestException('فشل التحقق من الدفع');
    }

    const payment = await this.paymentsRepository.findOne({
      where: { moyasarId },
    });
    if (!payment) throw new NotFoundException('الدفع غير موجود');

    if (moyasarData.status === 'paid') {
      payment.status = PaymentStatus.PAID;
    } else if (['failed', 'canceled'].includes(moyasarData.status)) {
      payment.status = PaymentStatus.FAILED;
    }

    payment.moyasarResponse = moyasarData;
    return this.paymentsRepository.save(payment);
  }

  async handleWebhook(body: any): Promise<void> {
    const { id, status } = body;
    if (!id) return;

    const payment = await this.paymentsRepository.findOne({
      where: { moyasarId: id },
    });
    if (!payment) return;

    if (status === 'paid') payment.status = PaymentStatus.PAID;
    else if (['failed', 'canceled'].includes(status))
      payment.status = PaymentStatus.FAILED;

    payment.moyasarResponse = body;
    await this.paymentsRepository.save(payment);
  }

  async getPaymentByDeal(dealId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({ where: { dealId } });
  }
}
