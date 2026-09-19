import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @ApiPropertyOptional({ example: 'Starting morning field rounds in Sector 4' })
  @IsOptional()
  @IsString()
  notes?: string;
}
