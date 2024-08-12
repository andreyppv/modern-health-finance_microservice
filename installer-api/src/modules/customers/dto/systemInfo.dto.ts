import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SystemInfoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'module Manufacturer.',
    example: 'Test Company',
  })
  moduleManufacturer: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'inverter Manufacturer.',
    example: 'Test Company',
  })
  inverterManufacturer: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'battery Manufacturer.',
    example: 'Test Company',
  })
  batteryManufacturer: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'signature.',
    example: '',
  })
  signature: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'system Size.',
    example: '100',
  })
  systemSize: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Estimated Annual Production.',
    example: '2000',
  })
  estAnnualProduction: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'user_id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  user_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'loan_id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  loan_id: string;
}