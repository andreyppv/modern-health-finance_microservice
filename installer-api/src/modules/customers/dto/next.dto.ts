import { IsNotEmpty, IsString } from 'class-validator';

export class Next {
  

  @IsNotEmpty()
  @IsString()
  loan_id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

 
}