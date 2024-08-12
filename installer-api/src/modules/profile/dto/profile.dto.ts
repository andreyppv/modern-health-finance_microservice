import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditProfileDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'user Id.',
        example: '4ea3275e-1b41-4b97-a322-ea3a5dc86363',
    })
    user_id: string;

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

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'birthday.',
        example: '30/01/1976',
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'phone.',
        example: '+ 1(999) 999-9999',
    })
    phone: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'street Address.',
        example: 'Fairway St',
    })
    streetaddress: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'unit.',
        example: '10B',
    })
    unit: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'city.',
        example: 'Quinton',
    })
    city: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'state.',
        example: 'VA',
    })
    state: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'zipcode.',
        example: '123456',
    })
    zipcode: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'offermodel.',
        example: '1',
    })
    offermodel: number;

}

export class EditSubInstallerDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'user Id.',
        example: '4ea3275e-1b41-4b97-a322-ea3a5dc86363',
    })
    user_id: string;

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