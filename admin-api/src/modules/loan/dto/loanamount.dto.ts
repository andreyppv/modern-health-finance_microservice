import {
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoanamountDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  offerid: number;
}

export class LoanDto {
  @IsNotEmpty()
  @IsString()
  loan_id: string;
}
export class CreateUploadDto {
  @IsNotEmpty()
  @IsString()
  loan_id: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}

export class CreatePromissoryNoteDto {
  @IsNotEmpty()
  @IsString()
  ownerID: string;

  @IsNotEmpty()
  @IsString()
  signature: string;
}
export class PromissoryNote {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePromissoryNoteDto)
  signatures: CreatePromissoryNoteDto[];
}
export class DeleteUploadFileDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}
export class ElligibleOffer {
  @IsNotEmpty()
  @IsString()
  offer_id: string;

  @IsNotEmpty()
  @IsNumber()
  loanamount: number;
}

export class BWS_Score {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
