import { IsNotEmpty, IsString } from 'class-validator';

export class Logs {
    @IsNotEmpty()
    @IsString()
    module: string;

    @IsNotEmpty()
    @IsString()
    user_id: string;

    @IsNotEmpty()
    @IsString()
    loan_id: string;

}