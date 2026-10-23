import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

import { BlockType } from '../enum/block-type.enum.js';

export class CreateBlockModel {
  @IsInt()
  @Min(1)
  postId!: number;

  @IsEnum(BlockType)
  type!: BlockType;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Min(0)
  position!: number;
}