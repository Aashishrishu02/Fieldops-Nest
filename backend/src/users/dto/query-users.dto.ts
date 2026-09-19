import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryUsersDto {
  @ApiPropertyOptional({ description: 'Filter by search term (name or email)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Filter by creation type (SYSTEM_GENERATED, INVITED)' })
  @IsOptional()
  @IsString()
  creationType?: string;

  @ApiPropertyOptional({ description: 'Filter by active status (true/false)' })
  @IsOptional()
  @IsString()
  isActive?: string;
}
