import { Controller,Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param } from '@nestjs/common';
import { DeniedService } from './denied.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Denied')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)


@Controller('denied')
export class DeniedController {
  constructor(private readonly deniedService: DeniedService) {}
  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async get() {
    return this.deniedService.get();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get pending details" })
  async getdetails(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.deniedService.getdetails(id);
  }

  @Get('/pending/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set pending" })
  async setpending(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.deniedService.setpending(id);
  }

  @Get('/delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set delete" })
  async setdelete(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.deniedService.setdelete(id);
  }
}
