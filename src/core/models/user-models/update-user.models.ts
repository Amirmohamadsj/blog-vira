import {IsEmail, IsOptional, IsString, MaxLength, MinLength, IsInt, Min} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserModels {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  avatarMediaId?: number;
}