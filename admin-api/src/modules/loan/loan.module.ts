import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/repository/users.repository';
import { CustomerRepository } from 'src/repository/customer.repository';
import { UserConsentRepository } from 'src/repository/userConsent.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { LogRepository } from 'src/repository/log.repository';
import { BankAccountsRepository } from 'src/repository/bankAccount.repository';
import { BankTransactionsRepository } from 'src/repository/bankTransaction.repository';
import { PlaidAccessTokenMasterRepository } from 'src/repository/plaidAccessTokenMaster.repository';
import { LoanOffersRepository } from 'src/repository/loanOffers.repository';
import { PaymentscheduleRepository } from 'src/repository/paymentschedule.repository';

import { commonService } from 'src/common/helper-service';
import { CommonService } from 'src/service/common/common.service';
import { MailService } from 'src/mail/mail.service';
import { promissoryNote } from './promissory-note.service';
import {HttpModule} from '@nestjs/axios'
import { CreditreportRepository} from '../../repository/creditreport.repository'
import { HistoricalBalanaceRepository} from '../../repository/historicalBalance.repository'
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      CustomerRepository,
      LoanRepository,
      LogRepository,
      BankAccountsRepository,
      BankTransactionsRepository,
      PlaidAccessTokenMasterRepository,
      LoanOffersRepository,
      PaymentscheduleRepository,
      UserConsentRepository,
      CreditreportRepository,
      HistoricalBalanaceRepository
    ]),
    HttpModule
  ],
  controllers: [LoanController],
  providers: [
    LoanService,
    commonService,
    CommonService,
    MailService,
    promissoryNote,
  ],
})
export class LoanModule {}
