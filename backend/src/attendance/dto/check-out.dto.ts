import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckOutDto {
  @ApiPropertyOptional({ example: 'Completed all scheduled site inspections for today' })
  @IsOptional()
  @IsString()
  notes?: string;
}
