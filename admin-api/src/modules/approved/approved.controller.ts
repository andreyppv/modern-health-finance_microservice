import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  UseGuards,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { ApprovedService } from './approved.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Approved')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('approved')
export class ApprovedController {
  constructor(private readonly approvedService: ApprovedService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GET_ALL' })
  async get() {
    return this.approvedService.get();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pending details' })
  async getdetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.approvedService.getdetails(id);
  }

  @Get('/getlogs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Logs' })
  async getlogs(@Param('id') id: string) {
    return this.approvedService.getlogs(id);
  }
}
