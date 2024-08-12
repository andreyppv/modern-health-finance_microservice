import { IsNotEmpty, IsString } from 'class-validator';

export class Addroles {

    @IsNotEmpty()
    @IsString()
    name: string;

}
