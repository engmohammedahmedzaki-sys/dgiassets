import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NdaSignature } from './nda-signature.entity';
import { NdaService } from './nda.service';
import { NdaController } from './nda.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NdaSignature])],
  providers: [NdaService],
  controllers: [NdaController],
  exports: [NdaService],
})
export class NdaModule {}
