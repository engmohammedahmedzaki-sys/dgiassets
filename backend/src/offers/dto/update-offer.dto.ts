import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferDto } from './create-offer.dto';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  counterAmount?: number;

  @IsOptional()
  @IsString()
  rejectReason?: string;
}
