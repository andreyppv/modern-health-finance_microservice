import { IsNotEmpty, IsString } from 'class-validator';

export class EditPhonenumDto {
  @IsNotEmpty()
  @IsString()
  newphonenum: string;
  
}
