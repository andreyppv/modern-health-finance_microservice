import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class UpdateUserName {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'first Name.',
    example: 'abc',
  })
  firstname: string;

  @IsString()
  @ApiProperty({
    description: 'Middle Name.',
    example: 'Test',
  })
  middlename: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'last Name.',
    example: 'xyz',
  })
  lastname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'zipcode.',
    example: '628904',
  })
  zipcode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'phoneNo.',
    example: '6434674357',
  })
  phoneno: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Email.',
    example: 'abc@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'street Address.',
    example: 'West Street',
  })
  streetaddress: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'city.',
    example: 'chennai',
  })
  city: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'unit.',
    example: 'S4',
  })
  unit: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'socialsecuritynumber.',
    example: '123456789',
  })
  socialsecuritynumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'state.',
    example: 'California',
  })
  state: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Birthday.',
    example: '08/12/1996',
  })
  birthday: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'sourceofincome.',
    example: 'Salaried',
  })
  sourceofincome: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'netmonthlyincome.',
    example: 200000,
  })
  netmonthlyincome: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'payfrequency.',
    example: 'Monthly',
  })
  payfrequency: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'dayofmonth.',
    example: 9,
  })
  dayofmonth: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'paidformat.',
    example: 'check',
  })
  paidformat: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'password.',
    example: 'welcome',
  })
  password: string;
}

export class selectLoan {
  @IsNotEmpty()
  @IsString()
  loan_id: string;
}
