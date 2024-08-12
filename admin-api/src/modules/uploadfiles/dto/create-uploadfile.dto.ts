import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUploadDto {
  @IsNotEmpty()
  @IsString()
  loan_id: string;

  @IsNotEmpty()
  @IsString()
  type: string;


}
export class createPaymentSchedulerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'loan_id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  loan_id: string;
}
export class DeleteUploadFileDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}
