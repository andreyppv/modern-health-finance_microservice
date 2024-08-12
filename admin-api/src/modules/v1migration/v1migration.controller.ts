import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  UseGuards,
  ParseUUIDPipe,
  Param,
  Post,
} from '@nestjs/common';
import { V1migrationService } from './v1migration.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiTags('V1Migration')

@Controller('V1Migration')
export class V1migrationController {
  constructor(private readonly v1MirgationService: V1migrationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'V1-Plaid Transactions Migration' })
  async migrationPlaidTransactions() {
    return this.v1MirgationService.migrationPlaidTransactions();
  }
}
