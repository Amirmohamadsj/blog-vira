import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagModels {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}