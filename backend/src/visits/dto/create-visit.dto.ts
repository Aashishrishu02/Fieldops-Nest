import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class CreateVisitDto {
  @ApiProperty({ description: 'User ID of the field employee assigned to the visit' })
  @IsString()
  @IsNotEmpty({ message: 'assignedTo user ID is required' })
  assignedTo: string;

  @ApiProperty({ example: 'Apex Logistics Hub', description: 'Customer or client organization name' })
  @IsString()
  @IsNotEmpty({ message: 'customerName is required' })
  customerName: string;

  @ApiProperty({ example: '450 Industrial Parkway, Sector 4', description: 'Site or address' })
  @IsString()
  @IsNotEmpty({ message: 'location is required' })
  location: string;

  @ApiProperty({ example: '2026-09-20T10:00:00.000Z', description: 'Scheduled date and time' })
  @IsDateString()
  @IsNotEmpty({ message: 'date is required' })
  date: string;

  @ApiProperty({ example: 'Emergency HVAC Sensor Diagnostic', description: 'Purpose of visit' })
  @IsString()
  @IsNotEmpty({ message: 'purpose is required' })
  purpose: string;

  @ApiPropertyOptional({ enum: VisitStatus, default: VisitStatus.PLANNED })
  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @ApiPropertyOptional({ example: 'Gate code #4092. Ask for facility manager Dave.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
