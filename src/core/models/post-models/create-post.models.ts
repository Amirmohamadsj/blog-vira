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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../../enum/post-status.enum.js';

export class CreatePostModels {
  @ApiProperty({
    description: 'Post title',
    example: 'Getting Started with NestJS',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Post content',
    example: 'NestJS is a progressive Node.js framework...',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Short summary of the post',
    example: 'An introduction to NestJS and its main features.',
  })
  @IsString()
  @IsNotEmpty()
  excerpt!: string;

  @ApiPropertyOptional({
    description: 'Post publication status',
    enum: PostStatus,
    example: PostStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({
    description: 'ID of the post category',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({
    description: 'List of tag IDs associated with the post',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @ApiPropertyOptional({
    description: 'ID of the cover media',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  coverMediaId?: number;
}