import { Body, Controller, HttpCode, HttpStatus, Post,Get,ParseUUIDPipe,Param, UseGuards, Put, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guard';
import { AddUserDto } from './dto/user.dto';
import { UserManagementService } from './user-management.service';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)

@ApiTags('User Management')
@Controller('user-management')
export class UserManagementController {
    constructor(private readonly userManagementService: UserManagementService) {}

    @Post('/addUser')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Add New User For Installer Team" })
    async addUser(
        @Body() addUserDto: AddUserDto,
    ){
        return this.userManagementService.addUser(addUserDto);
    }

    @Get('users/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get users list" })
    async getUsers(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.userManagementService.getUsers(id);
    }
}
