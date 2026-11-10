import {IsEmail, IsOptional, IsString, MaxLength, MinLength, IsInt, Min} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class UpdateUserModels {

  @ApiPropertyOptional({
    description: 'New username',
    example: 'amir_mmd',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;


  @ApiPropertyOptional({
    description: 'New email address',
    example: 'amir@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'New password',
    example: 'NewStrongPassword123!',
    minLength: 8,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;


  @ApiPropertyOptional({
    description: 'ID of the new avatar media',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  avatarMediaId?: number;
}