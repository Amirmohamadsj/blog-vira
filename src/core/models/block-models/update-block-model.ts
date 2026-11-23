import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { BlockType } from '../../enums/block-type.enum.js';

export class UpdateBlockModel {
  @ApiPropertyOptional({
    description: 'Type of the block',
    enum: BlockType,
    example: BlockType.TEXT,
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(BlockType)
  type?: BlockType;

  @ApiPropertyOptional({
    description: 'Block content',
    example: 'Updated block content.',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({
    description: 'Position of the block',
    example: 2,
    minimum: 0,
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    description: 'Associated media ID. Send null to remove media.',
    example: 1,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @ValidateIf(
    (_object, value) => value !== undefined && value !== null,
  )
  @IsInt()
  @Min(1)
  mediaId?: number | null;
}