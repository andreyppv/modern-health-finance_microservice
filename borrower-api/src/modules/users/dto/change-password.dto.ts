import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsString } from 'class-validator';


export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Current Pasword.',
    example: 'welcome123',
  })
  currentpw: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'New Pasword.',
    example: 'test123',
  })
  newpw: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Confirm New Pasword.',
    example: 'test123',
  })
  cnewpw: string;
}