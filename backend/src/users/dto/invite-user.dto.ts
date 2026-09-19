import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({ example: 'employee@gmail.com', description: 'Existing user email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'ID of the role to assign to the invited user' })
  @IsString()
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;

  @ApiPropertyOptional({ example: 'Sarah Connor', description: 'Optional display name' })
  @IsOptional()
  @IsString()
  name?: string;
}
