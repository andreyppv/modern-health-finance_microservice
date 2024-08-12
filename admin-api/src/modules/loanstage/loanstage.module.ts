import { Module } from '@nestjs/common';
import { LoanstageService } from './loanstage.service';
import { LoanstageController } from './loanstage.controller';
import { LoanRepository } from '../../repository/loan.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRepository } from '../../repository/log.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { CustomerRepository } from '../../repository/customer.repository';
import { UserRepository } from 'src/repository/users.repository';
// import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { UserConsentRepository } from 'src/repository/userConsent.repository';
import { MailService } from '../../mail/mail.service';
import { LoanoffersService } from './loanoffers.service';
import { LoanOffersRepository } from 'src/repository/loanOffers.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanRepository,
      LogRepository,
      PaymentscheduleRepository,
      UploadUserDocumentRepository,
      CustomerRepository,
      UserRepository,
      // UserBankAccountRepository,
      UserConsentRepository,
      LoanOffersRepository
    ]),
  ],
  controllers: [LoanstageController],
  providers: [LoanstageService, MailService,LoanoffersService],
})
export class LoanstageModule {}
