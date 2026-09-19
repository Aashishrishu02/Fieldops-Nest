import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'DISPATCHER', description: 'Unique role identifier name' })
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @ApiPropertyOptional({ example: 'Coordinates team field schedules', description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['USER_VIEW', 'VISIT_VIEW', 'VISIT_CREATE'],
    description: 'Array of permission IDs or permission names to assign',
  })
  @IsOptional()
  @IsArray()
  permissionIds?: string[];
}
