import { ApiProperty } from '@nestjs/swagger';
import { text } from 'aws-sdk/clients/customerprofiles';
import { IsNotEmpty, IsString, IsNumber, IsEmail } from 'class-validator';

export class CreatePracticeDto {
  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  practiceName: string;

  @IsNotEmpty()
  @IsString()
  practiceUrl: string;

  // @IsNotEmpty()
  // @IsString()
  practiceHomeUrl: string;

  @IsNotEmpty()
  @IsString()
  practiceLinkToForm: string;

  @IsNotEmpty()
  @IsString()
  locationName: string;

  @IsNotEmpty()
  @IsString()
  streetaddress: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  stateCode: string;

  @IsNotEmpty()
  @IsString()
  zipcode: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  practiceSettings: number;

  practiceMainColor: string;

  pacticeSecondaryColor: string;
  //added
  @IsString()
  practicelogo?: text = '';


  @IsString()
  practicepoweredbylogo?: text = '';
}
