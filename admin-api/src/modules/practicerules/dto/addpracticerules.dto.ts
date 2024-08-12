import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PracticeRulesDto {
  @IsNotEmpty()
  @IsString()
  setting_name: string;

  @IsNotEmpty()
  @IsBoolean()
  isDefault: boolean;

  @IsNotEmpty()
  @IsBoolean()
  deny_tiers: boolean;

  @IsNotEmpty()
  enable_transunion: boolean;

  @IsNotEmpty()
  @IsBoolean()
  enable_plaid: boolean;
}
