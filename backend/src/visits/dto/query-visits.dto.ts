import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryVisitsDto {
  @ApiPropertyOptional({ description: 'Filter by search query (customerName, location, or purpose)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned employee user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Filter by status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'Scheduled date from' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-09-30', description: 'Scheduled date to' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
