import {IsNotEmpty,IsString,MinLength,MaxLength,} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordModels {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPassword123!',
    minLength:1
  })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword123!',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  newPassword!: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewPassword123!',
    minLength:1
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}