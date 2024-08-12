import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class Updateroles {

    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    name: string;

}
