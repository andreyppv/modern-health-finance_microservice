import { Controller, Get, HttpCode, HttpStatus, ParseUUIDPipe, Param,UseGuards,Post,Body } from '@nestjs/common';
import { OverviewService } from './overview.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import {LogInLogsDto, Logs} from './dto/logs.dto';
import { RealIP } from 'nestjs-real-ip';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('customer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Overview')
@Controller('overview')
export class OverviewController {
    constructor(private readonly overviewService: OverviewService){}

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get overview details" })
    async getOverview(
      @Param('id') id: string
    ){
        return this.overviewService.getOverview(id);
    }

    @Post('/addlogs')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "" })
    async logs(
      @Body() logs:Logs
    ){
      return this.overviewService.logs(logs)
    }

    @Post('/addloginlogs')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Adding logIn Logs" })
    async addLoginLog(
      @Body() logInLogsDto:LogInLogsDto,
      @RealIP() ip: string
    ){
      return this.overviewService.addLoginLog(logInLogsDto, ip)
    }
}
