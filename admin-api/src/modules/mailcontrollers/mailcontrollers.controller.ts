import {
  Controller,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Param,
  Header,
} from '@nestjs/common';
import { MailcontrollersService } from './mailcontrollers.service';
import { CreateMailcontrollerDto } from './dto/create-mailcontroller.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { strict } from 'assert';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('mailcontrollers')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('mailcontrollers')
export class MailcontrollersController {
  constructor(
    private readonly mailcontrollersService: MailcontrollersService,
  ) {}
  @Get('/:id/:purposeOfTheMail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({})
  async getDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('purposeOfTheMail') purposeOfTheMail: string,
  ) {
    return this.mailcontrollersService.inviteEmail(id, purposeOfTheMail);
  }

  @Get('/:id/:purposeOfTheMail/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({})
  async testMail(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('purposeOfTheMail') purposeOfTheMail: string,
    @Param('email') email: string,
  ) {
    return this.mailcontrollersService.testemail(id, purposeOfTheMail, email);
  }
}
