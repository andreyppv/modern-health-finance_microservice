import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class startApplication {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  middlename: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  socialsecuritynumber: string;

  @IsNotEmpty()
  // @Type(() => Date)
  // @IsDate()
  @IsString()
  birthday: string;

  @IsNotEmpty()
  @IsString()
  practiceid: string;

  @IsNotEmpty()
  @IsNumber()
  monthlyincome: number;

  @IsNotEmpty()
  @IsString()
  streetaddress: string;

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

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  typeofresidence: string;

  @IsNotEmpty()
  @IsNumber()
  housingexpense: number;

  // @IsNotEmpty()
  // @IsNumber()
  // loanterm: number;

  // @IsNotEmpty()
  // @IsNumber()
  // apr: number;

  // @IsNotEmpty()
  // @IsNumber()
  // monthlypayment: number;

  // @IsBoolean()
  // enablingMail: boolean;

  // @IsBoolean()
  // enablingSMS: boolean;
}
