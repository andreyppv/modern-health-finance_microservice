import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateRoles {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;
}
