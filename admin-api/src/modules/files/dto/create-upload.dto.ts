import { IsNotEmpty, IsString } from 'class-validator';
export class CreateUploadDto {
  @IsNotEmpty()
  @IsString()
  link_id: string;

  @IsNotEmpty()
  // @IsString()
  services: string;
}
