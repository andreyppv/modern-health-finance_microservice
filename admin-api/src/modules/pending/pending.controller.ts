import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  UseGuards,
  ParseUUIDPipe,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';

import { PendingService } from './pending.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { manualBankAddDto } from './dto/manual-bank-add.dto';
import { addcommentsDto } from './dto/add-comments.dto';
import { Logs, LogInLogsDto } from './dto/add-log.dto';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Pending')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('pending')
export class PendingController {
  constructor(private readonly pendingService: PendingService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GET_ALL' })
  async get() {
    return this.pendingService.get();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pending details' })
  async getdetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.pendingService.getdetails(id);
  }

  @Get('/denied/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set Denied' })
  async setdenied(@Param('id', ParseUUIDPipe) id: string) {
    return this.pendingService.setdenied(id);
  }

  @Get('/approved/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set Approved' })
  async setapproved(
    @Param('id', ParseUUIDPipe) id: string,
    @RealIP() ip: string,
  ) {
    return this.pendingService.setapproved(id, ip);
  }

  @Get('/invite/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set Approved' })
  async invite(@Param('id', ParseUUIDPipe) id: string) {
    return this.pendingService.invite(id);
  }

  @Post('/manualbankadd')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '' })
  async manualBankAdd(@Body() manualBankAddDto: manualBankAddDto) {
    return this.pendingService.manualBankAdd(manualBankAddDto);
  }

  @Post('/addcomments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '' })
  async addcomments(@Body() addcommentsDto: addcommentsDto, @RealIP() ip: string) {
    return this.pendingService.addcomments(addcommentsDto, ip);
  }

  @Get('/getcomments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '' })
  async getcomments(@Param('id', ParseUUIDPipe) id: string) {
    return this.pendingService.getcomments(id);
  }

  @Post('/addlogs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '' })
  async logs(@Body() logs: Logs) {
    return this.pendingService.logs(logs);
  }
  @Post('/addloginlogs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adding logIn Logs' })
  async addLoginLog(@Body() logInLogsDto: LogInLogsDto, @RealIP() ip: string) {
    return this.pendingService.addLoginLog(logInLogsDto, ip);
  }

  @Get('/getPaymentSchedule/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '' })
  async getPaymentScheduleDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.pendingService.getPaymentScheduleDetails(id);
  }
}
