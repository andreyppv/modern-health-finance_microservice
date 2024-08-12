import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class debitCardAddDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'fullname.',
    example: 'Test User',
  })
  fullname: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'card Number.',
    example: '1234567891234567',
  })
  cardnumber: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'expires.',
    example: '06/25',
  })
  expires: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'csc.',
    example: '356',
  })
  csc: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'billingaddress.',
    example: '24, Test street, Test',
  })
  billingaddress: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'user_id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  user_id: string;
}