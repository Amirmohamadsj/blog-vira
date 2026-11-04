
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { BlockType } from '../../enum/block-type.enum.js';

export class CreateBlockModel {
  @IsEnum(BlockType)
  type!: BlockType;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Min(0)
  position!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  mediaId?: number | null;
}
