import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsString } from 'class-validator';


export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'email.',
    example: 'test111@gmail.com',
  })
  email: string;
}