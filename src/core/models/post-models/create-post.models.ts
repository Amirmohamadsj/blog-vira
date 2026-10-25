
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { PostStatus } from '../../enum/post-status.enum.js';

export class CreatePostModels {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  excerpt!: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  coverMediaId?: number;
}