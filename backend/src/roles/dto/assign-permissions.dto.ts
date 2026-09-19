import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    example: ['perm-uuid-1', 'perm-uuid-2'],
    description: 'Array of Permission IDs to associate with the role',
  })
  @IsArray()
  @IsNotEmpty({ message: 'permissionIds must be an array of IDs' })
  permissionIds: string[];
}
