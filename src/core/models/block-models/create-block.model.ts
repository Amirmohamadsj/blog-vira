import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlockType } from '../../enum/block-type.enum.js';

export class CreateBlockModel {
  @ApiProperty({
    description: 'Type of the block',
    enum: BlockType,
    example: BlockType.TEXT,
  })
  @IsEnum(BlockType)
  type!: BlockType;

  @ApiProperty({
    description: 'Block content',
    example: 'This is a sample paragraph.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Position of the block',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  position!: number;

    @ApiPropertyOptional({
    description: 'Associated media ID',
    example: 1,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  mediaId?: number | null;
}