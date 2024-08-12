import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEmail } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  id?: string = '';

  @IsNotEmpty()
  @IsString()
  practiceid: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  role: number;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
