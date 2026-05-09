import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValuationService, ValuationInput } from './valuation.service';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';

class ValuationDto implements ValuationInput {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsNumber() @Min(0) monthlyRevenue?: number;
  @IsOptional() @IsNumber() @Min(0) monthlyProfit?: number;
  @IsOptional() @IsNumber() @Min(0) monthlyVisitors?: number;
  @IsOptional() @IsNumber() @Min(0) activeUsers?: number;
  @IsOptional() @IsNumber() @Min(0) ageInMonths?: number;
  @IsOptional() @IsString() monetizationType?: string;
  @IsOptional() @IsArray() techStack?: string[];
  @IsOptional() @IsString() @MaxLength(500) description?: string;
}

@Controller('valuation')
export class ValuationController {
  constructor(private readonly valuationService: ValuationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async value(@Body() dto: ValuationDto) {
    return this.valuationService.value(dto);
  }
}
