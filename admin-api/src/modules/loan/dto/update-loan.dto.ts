import { PartialType } from '@nestjs/swagger';
import { ContactInfoDto } from './contactInfo.dto';

export class UpdateLoanDto extends PartialType(ContactInfoDto) {}
