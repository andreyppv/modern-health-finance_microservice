import { timestamp } from 'aws-sdk/clients/cloudfront';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { type } from 'os';

export class PersonalInfoDto {
  @IsNotEmpty()
  @IsString()
  streetaddress: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  zipcode: string;

  // @IsNotEmpty()
  // @Type(() => Date)
  // @IsDate()
  // birthday:Date;
  @IsNotEmpty()
  @IsString()
  birthday: string;

  @IsNotEmpty()
  @IsString()
  socialsecuritynumber: string;

  @IsNotEmpty()
  @IsNumber()
  monthlyMortgage: number;

  @IsNotEmpty()
  @IsNumber()
  monthlyincome: number;

  @IsNotEmpty()
  @IsString()
  typeofresidence: string;

  @IsBoolean()
  isagree: boolean;
}
