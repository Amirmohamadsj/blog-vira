import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryModels {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}

