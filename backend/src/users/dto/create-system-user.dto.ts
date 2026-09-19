import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateSystemUserDto {
  @ApiProperty({ description: 'ID of the role to assign to the user' })
  @IsString()
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Optional display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'manager.personal@gmail.com',
    description: 'Optional external email to send the generated credentials to',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Recipient email must be a valid email format' })
  recipientEmailToSendCreds?: string;
}
