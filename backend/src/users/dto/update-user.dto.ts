import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'New role ID to reassign' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Active / Deactivated toggle' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
