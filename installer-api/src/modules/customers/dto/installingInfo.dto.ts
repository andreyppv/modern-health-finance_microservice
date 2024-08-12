import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Milestone1ReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Request 20% of funding .',
    example: '$1000.00',
  })
  milestone1ReqAmount: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'user id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  user_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'loan id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  loan_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'signature.',
    example: '',
  })
  signature: string;
}

export class Milestone2ReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'project Complete dAt.',
    example: '2021/07/14',
  })
  projectCompletedAt: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Installation address Verified/Not.',
    example: 'true',
  })
  verifiedInstAddress: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Request next 20% of funding .',
    example: '1000.00',
  })
  milestone2ReqAmount: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'user id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  user_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'loan id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  loan_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'signature.',
    example: '',
  })
  signature: string;
}

export class Milestone3ReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Request next 60% of funding .',
    example: '1000.00',
  })
  milestone3ReqAmount: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'user id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  user_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'loan id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  loan_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'signature.',
    example: '',
  })
  signature: string;
}