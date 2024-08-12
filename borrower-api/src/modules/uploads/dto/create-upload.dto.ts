import { IsNotEmpty, IsString,IsArray,ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUploadDto {
    @IsArray()
    documentTypes: string[];

    @IsNotEmpty()
    @IsString()
    loan_id: string;
}
