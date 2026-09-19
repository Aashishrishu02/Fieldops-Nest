import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiPropertyOptional({ description: 'Reset token received via email (for forgot password flow)' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ example: 'NewSecurePass@456!', description: 'The new password to set' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;

  @ApiPropertyOptional({ example: 'CurrentTempPass@123!', description: 'Current password (for first-time reset verification)' })
  @IsOptional()
  @IsString()
  currentPassword?: string;
}
