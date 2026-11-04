
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ChangePasswordModels {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'New password must contain at least one letter and one number',
  })
  newPassword: string;
}
