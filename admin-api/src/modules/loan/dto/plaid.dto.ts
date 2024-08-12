import { IsNotEmpty, IsString } from 'class-validator';

export class PlaidDto {
  @IsNotEmpty()
  @IsString()
  public_token: string;
}