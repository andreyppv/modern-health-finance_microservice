import { Body, Controller, HttpCode, HttpStatus, Post,Get,ParseUUIDPipe,Param, UseGuards, Put, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SigninCreadentialsDto, VerifyOtpDto }from './dto/signin-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckTokenDto, PasswordResetDto } from './dto/pasword-reset.dto';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

export enum AuthSummary {
  SIGN_IN_SUMMARY = 'Sign in for users.',
  User_verify = 'User Verify'
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.SIGN_IN_SUMMARY })
  async signIn(
    @Body() signinCreadentialsDto: SigninCreadentialsDto,
  ){
    return this.usersService.signIn(signinCreadentialsDto);
  }

  @ApiBearerAuth()
  @Roles('installer')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Put('/changepassword/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "change borrower password"})
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto:ChangePasswordDto
  ){
    return this.usersService.changePassword(id, changePasswordDto)
  }

  // @ApiBearerAuth()
  // @Roles('installer')
  // @UseGuards(AuthGuard('jwt'),RolesGuard)
  // @Post('/addlogs')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: "Add log for installer" })
  // async logs(
  //   @Body() logs:Logs
  // ){
  //   return this.usersService.logs(logs)
  // }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To get password reset link" })
  async forgotPassword(
    @Body() forgotPasswordDto:ForgotPasswordDto
  ){
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Post('checkToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To check password reset token is valid or not" })
  async checkToken(
    @Body() checkTokenDto:CheckTokenDto
  ){
    return this.usersService.checkToken(checkTokenDto);
  }

  @Post('passwordReset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To reset the new password" })
  async passwordReset(
    @Body() passwordResetDto:PasswordResetDto
  ){
    return this.usersService.passwordReset(passwordResetDto);
  }

  @ApiBearerAuth()
  @Roles('installer')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/deactivate/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Deactivate User" })
  async deactive(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.deactivate(id);
  }

  @ApiBearerAuth()
  @Roles('installer')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/activate/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Activate User" })
  async active(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.activate(id);
  }

  @ApiBearerAuth()
  @Roles('installer')
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Get('/delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete User" })
  async delete(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.delete(id);
  }

  @Put('/toggleTwoFactorAuth/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "update two factor auth" })
  async toggleTwoFactorAuth(
    @Param('userId') userId: string ,@Body() toggleValue
  ){        
    return this.usersService.toggleTwoFactorAuth(userId, toggleValue)
  }

  @Get('/getTwoFactorAuth/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthSummary.User_verify })
  async getTwoFactorAuth(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.usersService.getTwoFactorAuth(id);
  }

  @Post('verifyOtp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To check otp is valid or not" })
  async verifyOtp(
    @Body() verifyOtpDto:VerifyOtpDto
  ){
    return this.usersService.verifyOtp(verifyOtpDto);
  }
  
}
