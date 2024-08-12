import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class debitCardUpdateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'card id.',
    example: '1acc9252-581f-4b35-be46-2f8e3a049317',
  })
  card_id: string;
}