import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { KycDocument } from './kyc-document.entity';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KycDocument]),
    MulterModule.register({ dest: './uploads/kyc' }),
    UsersModule,
  ],
  providers: [KycService],
  controllers: [KycController],
  exports: [KycService],
})
export class KycModule {}
