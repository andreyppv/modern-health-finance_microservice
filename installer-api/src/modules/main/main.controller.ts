import { Controller, Get, HttpCode, HttpStatus, ParseUUIDPipe, Param,UseGuards } from '@nestjs/common';
import { MainService } from './main.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Main')
@Controller('main')
export class MainController {
    constructor(private readonly mainService: MainService){}

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Approved applications list" })
    async getApplicationsList(@Param('id', ParseUUIDPipe) id: string){
        return this.mainService.getApplicationsList(id);
    }
}
