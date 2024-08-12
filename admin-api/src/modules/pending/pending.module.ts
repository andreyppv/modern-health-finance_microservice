import { Module } from '@nestjs/common';
import { PendingService } from './pending.service';
import { PendingController } from './pending.controller';
// import { UserBankAccountRepository } from '../../repository/userBankAccounts.repository';
import { UserRepository } from '../../repository/users.repository';
import { CommentsRepository } from '../../repository/comments.repository';
import { LogRepository } from '../../repository/log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from '../../mail/mail.service';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { UserConsentRepository } from '../../repository/userConsent.repository';
import { userConsentEnity } from 'src/entities/userConsent.entity';
@Module({
  controllers: [PendingController],
  imports: [
    TypeOrmModule.forFeature([
      // UserBankAccountRepository,
      UserRepository,
      CommentsRepository,
      LogRepository,
      PaymentscheduleRepository,
      LoanRepository,
      UploadUserDocumentRepository,
      UserConsentRepository,
    ]),
  ],
  exports: [PendingService],
  providers: [PendingService, MailService],
})
export class PendingModule {}
