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
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Addroles } from './dto/add-role.dto';
import { UpdateRoles } from './dto/update-role.dto';
import { Addpermission } from './dto/add-permission.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Post('addroles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add roles' })
  async addRoles(@Body() addRoles: Addroles) {
    return this.rolesService.addRoles(addRoles);
  }

  @Post('updateRoles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Roles' })
  async updateRoles(@Body() updateRoles: UpdateRoles) {
    return this.rolesService.updateRoles(updateRoles);
  }

  @Get('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Roles' })
  async deleteRoles(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.deleteRoles(id);
  }

  @Get('getRoles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Roles' })
  async getRoles() {
    return this.rolesService.getRoles();
  }

  @Post('addPermission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add Permission' })
  async addPermission(@Body() addPermission: Addpermission) {
    return this.rolesService.addPermission(addPermission);
  }

  @Get('checkPermission/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check Permission' })
  async checkPermission(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.checkPermission(id);
  }

  @Get('getmenulist/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Menulist' })
  async getmenulist(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getmenulist(id);
  }

  @Get('getadminportalroles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Admin Portal Roles' })
  async getAdminPortalRoles() {
    return this.rolesService.getAdminPortalRoles();
  }
}
