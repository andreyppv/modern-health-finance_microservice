import { Module } from '@nestjs/common';
import { StartapplicationService } from './startapplication.service';
import { StartapplicationController } from './startapplication.controller';
import { LoanRepository } from '../../repository/loan.repository';
import { UserRepository } from '../../repository/users.repository';
import { CustomerRepository } from '../../repository/customer.repository';
import { UserConsentRepository } from '../../repository/userConsent.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { RolesRepository } from '../../repository/roles.repository';
import { OTPRepository } from 'src/repository/otp.repository';
import { RolesService } from '../roles/roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      LoanRepository,
      CustomerRepository,
      UserConsentRepository,
      // RolesRepository,
      OTPRepository,
    ]),
  ],
  controllers: [StartapplicationController],
  exports: [StartapplicationService],
  providers: [StartapplicationService, RolesService],
})
export class StartapplicationModule {}
