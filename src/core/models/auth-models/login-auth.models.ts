
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthModels {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
