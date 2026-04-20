import { IsString, IsOptional } from 'class-validator';

export class UpdateDealDto {
  @IsString()
  @IsOptional()
  transferNotes?: string;

  @IsString()
  @IsOptional()
  disputeReason?: string;
}
