import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsUUID()
  loan_id: string;

  @IsNotEmpty()
  @IsNumber()
  financialAmount: number;

  @IsNotEmpty()
  @IsNumber()
  interestRate: number;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsNumber()
  originationFee: number;
}

export class UpdateOfferDto {
  @IsNotEmpty()
  @IsUUID()
  loan_id: string;

  @IsNotEmpty()
  @IsUUID()
  offer_id: string;

  @IsNotEmpty()
  @IsNumber()
  financialAmount: number;

  @IsNotEmpty()
  @IsNumber()
  interestRate: number;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsNumber()
  originationFee: number;
}
