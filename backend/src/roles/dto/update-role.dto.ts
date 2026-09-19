import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'SENIOR_DISPATCHER' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Updated permission IDs array' })
  @IsOptional()
  @IsArray()
  permissionIds?: string[];
}
