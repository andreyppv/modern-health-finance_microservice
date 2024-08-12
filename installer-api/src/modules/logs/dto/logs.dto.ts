import { IsNotEmpty, IsString } from 'class-validator';

export class Logs {
    @IsNotEmpty()
    @IsString()
    module: string;

    @IsNotEmpty()
    @IsString()
    user_id: string;

    loan_id: string;

    type: string
}

export class LogInLogsDto {    
    @IsNotEmpty()
    @IsString()
    user_id: string;
}