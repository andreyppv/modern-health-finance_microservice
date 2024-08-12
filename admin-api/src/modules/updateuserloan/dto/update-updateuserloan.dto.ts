import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateUserLoanAmount {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Loan Amount.',
    example: 0,
  })
  loanamount: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'APR.',
    example: 0,
  })
  apr: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Duration.',
    example: 0,
  })
  duration: number;
}
