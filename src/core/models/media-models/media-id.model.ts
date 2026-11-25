import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class MediaIdModel {
  @ApiProperty({
    description: 'ID of the uploaded media',
    example: 12,
  })
  @IsInt()
  @IsPositive()
  mediaId!: number;
}