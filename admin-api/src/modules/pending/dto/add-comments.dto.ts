import { IsNotEmpty, IsString } from 'class-validator';

export class addcommentsDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  comments: string;

  @IsNotEmpty()
  @IsString()
  loan_id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;
}
