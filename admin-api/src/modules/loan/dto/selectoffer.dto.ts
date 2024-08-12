import { IsNotEmpty, IsNumber } from 'class-validator';

export class SelectofferDto {
  @IsNotEmpty()
  @IsNumber()
  offerid: number;
}