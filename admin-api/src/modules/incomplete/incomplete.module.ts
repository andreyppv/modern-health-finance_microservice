import { Module } from '@nestjs/common';
import { IncompleteService } from './incomplete.service';
import { IncompleteController } from './incomplete.controller';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/repository/users.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogRepository,
      PaymentscheduleRepository,
      LoanRepository,
      UploadUserDocumentRepository,
      UserRepository,
    ]),
  ],
  controllers: [IncompleteController],
  providers: [IncompleteService],
})
export class IncompleteModule {}
