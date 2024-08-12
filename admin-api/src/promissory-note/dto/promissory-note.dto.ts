import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePromissoryNoteDto {
  @IsNotEmpty()
  @IsString()
  signature: string;
}
