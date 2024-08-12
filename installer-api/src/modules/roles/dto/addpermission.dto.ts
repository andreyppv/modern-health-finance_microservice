
import { IsNotEmpty,  IsNumber, IsArray,ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Addpermission {

    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Ids)
    ids: [Ids]

}

export class Ids{

    @IsNotEmpty()
    @IsNumber()
    portal_id: number;

    @IsNotEmpty()
    @IsNumber()
    pages_id: number;

    @IsNotEmpty()
    @IsNumber()
    pagetabs_id: number;
}