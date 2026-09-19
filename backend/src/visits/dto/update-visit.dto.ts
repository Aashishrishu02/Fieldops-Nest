import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class UpdateVisitDto {
  @ApiPropertyOptional({ description: 'Reassign to another user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ example: 'Apex Logistics Hub' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: '450 Industrial Parkway, Sector 4' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '2026-09-20T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'Updated inspection scope' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ enum: VisitStatus })
  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @ApiPropertyOptional({ example: 'Completed on-site testing. All parameters nominal.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
