import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  offerId: string;
}
