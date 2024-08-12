import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddCreadentialsDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'User email.',
    example: 'example@test.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsNumber()
  role: string;
}
