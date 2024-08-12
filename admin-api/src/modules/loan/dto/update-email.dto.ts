import { IsNotEmpty, IsString } from 'class-validator';

export class EditEmailDto {
  @IsNotEmpty()
  @IsString()
  oldEmail: string;

  @IsNotEmpty()
  @IsString()
  newEmail: string;
}
