import { IsNotEmpty, IsString } from 'class-validator';

export class Save {
    @IsNotEmpty()
    @IsString()
    loan_id: string;

    @IsNotEmpty()
    @IsString()
    signature: string;

    @IsNotEmpty()
    @IsString()
    date: string;

}