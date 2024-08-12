import { IsArray, IsNotEmpty, IsString } from 'class-validator';
export class CreateUploadDto {
    @IsNotEmpty()
    @IsString()
    loan_id: string;

    @IsNotEmpty()
    @IsString()
    user_id: string;

    @IsArray()
    documentTypes: string[];
}
