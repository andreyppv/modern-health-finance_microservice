import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from '../../repository/users.repository';
import { OTPRepository } from '../../repository/otp.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { jwtConfig } from '../../configs/configs.constants';
import { JwtStrategy } from '../../strategies/jwt.strategy';

import { RolesGuard } from '../../guards/roles.guard';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/mail.service';
import { RolesService } from '../roles/roles.service';
// import { RolesRepository } from '../../repository/roles.repository';
import { TokenRepository } from '../../repository/token.repository';

@Module({
  controllers: [UsersController],
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      OTPRepository,
      // RolesRepository,
      TokenRepository,
    ]),
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
  ],
  exports: [UsersService],
  providers: [UsersService, JwtStrategy, RolesGuard, MailService, RolesService],
})
export class UsersModule {}
