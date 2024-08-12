import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { StateserviceService } from './stateservice.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('stateservice')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('stateservice')
export class StateserviceController {
  constructor(private readonly stateserviceService: StateserviceService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GET_ALL' })
  async get() {
    return this.stateserviceService.get();
  }
}
