import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuditlogsService } from './auditlogs.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Auditlog')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('auditlogs')
export class AuditlogsController {
  constructor(private readonly auditlogsService: AuditlogsService) {}
  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GET_LOGS' })
  async get() {
    return this.auditlogsService.get();
  }

  @Get('loginLog')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Login Log' })
  async loginLog() {
    return this.auditlogsService.loginLog();
  }
}
