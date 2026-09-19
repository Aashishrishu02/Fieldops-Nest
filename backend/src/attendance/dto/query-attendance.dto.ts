import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryAttendanceDto {
  @ApiPropertyOptional({ description: 'Filter by specific user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by attendance status (PRESENT, LATE, HALF_DAY, ABSENT)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-09-30', description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
