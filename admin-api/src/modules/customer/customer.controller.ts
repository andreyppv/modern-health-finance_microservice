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
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  UpdateUserCityDto,
  UpdateUserNameDto,
  UpdateUserStreetDto,
  UpdateUserZipCodeDto,
} from './dto/user-info.dto';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Customer')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Put('/editusername/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'edit use name' })
  async editUserName(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserNameDto: UpdateUserNameDto,
  ) {
    return this.customerService.editUserName(id, updateUserNameDto);
  }

  @Put('/editstreetaddress/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'edit use name' })
  async editUserStreetAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserStreetDto: UpdateUserStreetDto,
  ) {
    return this.customerService.editUserStreetAddress(id, updateUserStreetDto);
  }

  @Put('/editusercity/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'edit use name' })
  async editUserCity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserCityDto: UpdateUserCityDto,
  ) {
    return this.customerService.editUserCity(id, updateUserCityDto);
  }

  @Put('/edituserzipcode/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'edit use name' })
  async editUserZipCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserZipCodeDto: UpdateUserZipCodeDto,
  ) {
    return this.customerService.editUserZipCode(id, updateUserZipCodeDto);
  }
}
