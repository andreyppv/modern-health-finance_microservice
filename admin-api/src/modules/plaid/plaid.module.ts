import { Module } from '@nestjs/common';
import { PlaidService } from './plaid.service';
import { PlaidController } from './plaid.controller';
import { CustomerRepository } from '../../repository/customer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankTransactionsRepository } from '../../repository/bankTransaction.repository';
import { BankAccountsRepository } from '../../repository/bankAccount.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { OwnerInformationRepository } from '../../repository/ownerInformation.repository';
import { PlaidAccessTokenMasterRepository } from '../../repository/plaidAccessTokenMaster.repository';
import {HttpModule} from '@nestjs/axios'
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      BankAccountsRepository,
      BankTransactionsRepository,
      LoanRepository,
      OwnerInformationRepository,
      PlaidAccessTokenMasterRepository
    ]),
    HttpModule
  ],
  controllers: [PlaidController],
  providers: [PlaidService],
  exports: [PlaidService],
})
export class PlaidModule {}
