import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class UpdateVisitStatusDto {
  @ApiProperty({ enum: VisitStatus, example: VisitStatus.IN_PROGRESS })
  @IsEnum(VisitStatus)
  @IsNotEmpty()
  status: VisitStatus;

  @ApiPropertyOptional({ example: 'Arrived at location and checked in with security.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
