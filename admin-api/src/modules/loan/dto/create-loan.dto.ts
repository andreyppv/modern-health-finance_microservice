import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  isValidationOptions,
  IsObject,
  IsBoolean,
  isBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import exp from 'constants';
import { double, float } from 'aws-sdk/clients/lightsail';

export enum nonUSCitizenResidencyType {
  None = 'None',
  PermanentResident = 'PermanentResident',
  NonPermanentResident = 'NonPermanentResident',
  NonResidentAlien = 'NonResidentAlien',
}

export class Stipulations {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'ProvidePhotoId.',
    example: false,
  })
  'ProvidePhotoId': boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'ProvideProofTitleSFR.',
    example: false,
  })
  'ProvideProofTitleSFR': boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'ProvideTrustDocumentation.',
    example: false,
  })
  'ProvideTrustDocumentation': boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'ProvideProofTitleOwnership.',
    example: false,
  })
  'ProvideProofTitleOwnership': boolean;
}
export class Module {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'wattage.',
    example: 3,
  })
  'wattage': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'quantity.',
    example: 7,
  })
  'quantity': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'systemSize.',
    example: 3.2,
  })
  'systemSize': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'manufacturer.',
    example: 71,
  })
  'manufacturer': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'estimatedAnnualProduction.',
    example: 4013,
  })
  'estimatedAnnualProduction': number;
}

export class Inverter {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'wattage.',
    example: 3,
  })
  'wattage': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'quantity.',
    example: 1,
  })
  'quantity': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'systemSize.',
    example: 3.2,
  })
  'systemSize': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'manufacturer.',
    example: 71,
  })
  'manufacturer': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'estimatedAnnualProduction.',
    example: 4013,
  })
  'estimatedAnnualProduction': number;
}

export class Battery {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'wattage.',
    example: 3,
  })
  'wattage': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'quantity.',
    example: 1,
  })
  'quantity': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'systemSize.',
    example: 3.2,
  })
  'systemSize': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'manufacturer.',
    example: 71,
  })
  'manufacturer': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'estimatedAnnualProduction.',
    example: 4013,
  })
  'estimatedAnnualProduction': number;
}

export class SystemInfo {
  @Type(() => Module)
  module: Module;

  @Type(() => Inverter)
  inverter: Inverter;

  @Type(() => Battery)
  battery: Battery;
}

export class LoanTerms {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'term.',
    example: 300,
  })
  'term': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'planNbr.',
    example: 2393,
  })
  'planNbr': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'downpayment.',
    example: 0,
  })
  'downpayment': number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'propertyZip.',
    example: '67114',
  })
  'propertyZip': string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'stateRebate.',
    example: 0,
  })
  'stateRebate': number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'interestRate.',
    example: 1.49,
  })
  'interestRate': float;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'propertyCity.',
    example: 'Newton',
  })
  'propertyCity': string;

  @Type(() => Stipulations)
  stipulations: Stipulations;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'propertyAddress.',
    example: '1101 s poplar',
  })
  'propertyAddress': string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'propertyState.',
    example: 'KS',
  })
  'propertyState': string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'salesRepEmail.',
    example: 'salesrep@gosolo.io',
  })
  'salesRepEmail': string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'utilityRebate.',
    example: 0,
  })
  'utilityRebate': number;

  @Type(() => SystemInfo)
  systemInfo: SystemInfo;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'requestedAmount.',
    example: 20794.18,
  })
  'requestedAmount': float;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'incentivePayment.',
    example: 5406.487272727273,
  })
  'incentivePayment': float;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'numberOfPayments.',
    example: 300,
  })
  'numberOfPayments': number;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'primaryResidence.',
    example: true,
  })
  'primaryResidence': boolean;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'totalProjectCost.',
    example: 10560,
  })
  'totalProjectCost': number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Dealer ID.',
    example: 'd74b4082-1c37-4fb3-abc9-d88a675a4469',
  })
  'dealerId': string;
}

export class CreateLoanDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Applicants)
  applicants: Applicants[];

  @Type(() => LoanTerms)
  loanTerms: LoanTerms;
}

export class Name {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'last Name.',
    example: 'Doe',
  })
  lastname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'first Name.',
    example: 'Jon',
  })
  firstname: string;
}

export class Address {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'zip.',
    example: '67114',
  })
  zip: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'city.',
    example: 'Newton',
  })
  city: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'state.',
    example: 'KS',
  })
  state: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'address.',
    example: '1101 s poplar',
  })
  address: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'timeAtResidence.',
    example: '30',
  })
  timeAtResidence: string;
}

export class Employers {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'name.',
    example: 'Google',
  })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'grossMonthlyIncome.',
    example: 4000,
  })
  grossMonthlyIncome: number;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'selfEmployed.',
    example: false,
  })
  selfEmployed: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'positionTitle.',
    example: 'Developer',
  })
  positionTitle: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'employmentcomments.',
    example: 'Good',
  })
  employmentcomments: string;
}

export class Applicants {
  @Type(() => Name)
  name: Name;

  @Type(() => Address)
  address: Address;

  @Type(() => Employers)
  employers: Employers;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'phone.',
    example: '(800) 867-5309',
  })
  'phone': string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'email.',
    example: 'test@gmail.com',
  })
  'email': string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ssn.',
    example: 123456789,
  })
  'ssn': number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'birthdate.',
    example: '1990-12-30',
  })
  'birthdate': string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'usCitizen.',
    example: true,
  })
  'usCitizen': boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'nonUSCitizen.',
    example: 'None',
  })
  'nonUSCitizenResidencyType': nonUSCitizenResidencyType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'agreementSignedDate.',
    example: '2021-10-01T00:37:24.935Z',
  })
  'agreementSignedDate': string;
}

export class CreditReport {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'LoanID.',
    example: '1a736a55-8e59-4059-b6b7-2ac5b6a9d289',
  })
  loan_id: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Amount.',
    example: 2000,
  })
  amount: number;
}

export class signature {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => signs)
  signatures: signs[];
}

export class signs {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'signature.',
    example: 'ashcdsjchxil',
  })
  signature: string;
}

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Loan ID',
    example: '3f4d1c14-c49b-46b3-9b70-7c93b8aa6b38',
  })
  loan_id: string;
}
