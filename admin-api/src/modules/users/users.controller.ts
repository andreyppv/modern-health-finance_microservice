import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Get,
  UseGuards,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SigninCreadentialsDto, VerifyOtpDto } from './dto/signin-user.dto';
import { ForgotPasswordDto } from './dto/forgotpassword-user.dto';
import { PasswordResetDto, CheckTokenDto } from './dto/passwordreset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AddCreadentialsDto } from './dto/add-user.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { EditUserDto } from './dto/edit-user.dto';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

export enum AuthSummary {
  SIGN_IN_SUMMARY = 'Sign in for users.',
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.SIGN_IN_SUMMARY })
  async signIn(@Body() signinCreadentialsDto: SigninCreadentialsDto) {
    return this.usersService.signIn(signinCreadentialsDto);
  }
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('/changepassword/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'change admin password' })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'list' })
  async list() {
    return this.usersService.list();
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get User details' })
  async getdetails(@Param('id') id: string) {
    return this.usersService.getdetails(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/deactive/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactive User' })
  async deactive(@Param('id') id: string) {
    return this.usersService.deactive(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/active/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Active User' })
  async active(@Param('id') id: string) {
    return this.usersService.active(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete User' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.SIGN_IN_SUMMARY })
  async add(@Body() addCreadentialsDto: AddCreadentialsDto) {
    return this.usersService.add(addCreadentialsDto);
  }

  @Put('/toggleTwoFactorAuth/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'update two factor auth' })
  async toggleTwoFactorAuth(
    @Param('userId') userId: string,
    @Body() toggleValue,
  ) {
    return this.usersService.toggleTwoFactorAuth(userId, toggleValue);
  }

  @Get('/getTwoFactorAuth/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check Two Factor Auth Enabled Or Not' })
  async getTwoFactorAuth(@Param('id') id: string) {
    return this.usersService.getTwoFactorAuth(id);
  }

  @Post('verifyOtp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'To check otp is valid or not' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.usersService.verifyOtp(verifyOtpDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'To get password reset link' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Post('passwordReset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'To reset the new password' })
  async passwordReset(@Body() passwordResetDto: PasswordResetDto) {
    return this.usersService.passwordReset(passwordResetDto);
  }

  @Post('checkToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'To check password reset token is valid or not' })
  async checkToken(@Body() checkTokenDto: CheckTokenDto) {
    return this.usersService.checkToken(checkTokenDto);
  }
  //edituser//
  @Put('/editusername/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'edit use name' })
  async editUserName(
    @Param('id') id: string,
    @Body() EditUserDto: EditUserDto,
  ) {
    return this.usersService.editUserName(id, EditUserDto);
  }
}
