import { IsNotEmpty, IsString } from 'class-validator';

export class ContactInfoDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsString()
  middlename: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  practiceid: string;
}
