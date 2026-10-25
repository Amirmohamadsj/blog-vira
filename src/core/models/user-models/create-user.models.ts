import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";


export class CreateUserModels{
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username! : string;

    @IsEmail()
    @MaxLength(255)
    email! : string;

    @IsString()
    @MinLength(8)
    @MaxLength(255)
    password! : string;
}