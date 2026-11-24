import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class MediaIdModel {
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsPositive()
  mediaId!: number;
}