import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateQuestionsDto {

    @IsNotEmpty()
    @IsString()
    id: string;


    @IsNotEmpty()
    @IsString()
    question: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    condition: string;

    @IsNotEmpty()
    @IsString()
    approvedif: string;

}
