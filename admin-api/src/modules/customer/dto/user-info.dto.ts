import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateUserNameDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'first Name.',
    example: 'Test',
  })
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'last Name.',
    example: 'Test',
  })
  lastname: string;
}

export class UpdateUserStreetDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'street Address.',
    example: 'Test',
  })
  streetaddress: string;
}

export class UpdateUserCityDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'city.',
    example: 'Test',
  })
  city: string;
}

export class UpdateUserZipCodeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'zip Code.',
    example: 123456,
  })
  zipcode: string;
}