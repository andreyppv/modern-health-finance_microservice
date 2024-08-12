import { Module } from '@nestjs/common';
import { UploadfilesService } from './uploadfiles.service';
import { UploadfilesController } from './uploadfiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { LogRepository } from '../../repository/log.repository';
import { UserRepository } from 'src/repository/users.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanRepository,
      UploadUserDocumentRepository,
      PaymentscheduleRepository,
      LogRepository,
      UserRepository
    ]),
  ],
  controllers: [UploadfilesController],
  providers: [UploadfilesService],
})
export class UploadfilesModule {}
