import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class manualBankAddDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Bank Name.',
    example: 'Test bank',
  })
  bankname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'BankHolder Name.',
    example: 'Test user',
  })
  holdername: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'routingnumber.',
    example: '12345',
  })
  routingnumber: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'accountnumber.',
    example: '4565656265656',
  })
  accountnumber: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'user_id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  user_id: string;
}