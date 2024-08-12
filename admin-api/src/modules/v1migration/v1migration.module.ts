import { Module } from '@nestjs/common';
import { V1migrationService } from './v1migration.service';
import { V1migrationController } from './v1migration.controller';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/repository/users.repository';
import { BankTransactionsRepository } from 'src/repository/bankTransaction.repository';
import { BankAccountsRepository } from 'src/repository/bankAccount.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogRepository,
      PaymentscheduleRepository,
      LoanRepository,
      UploadUserDocumentRepository,
      UserRepository,
      BankTransactionsRepository,
      BankAccountsRepository
    ]),
  ],
  controllers: [V1migrationController],
  providers: [V1migrationService],
})
export class V1MigrationModule {}
